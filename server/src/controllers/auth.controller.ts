import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User.model';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import { emailService } from '../services/email.service';
import { verifyGoogleToken, findOrCreateGoogleUser } from '../services/googleAuthService';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  GuestSignupInput,
  GoogleAuthInput,
} from '../schemas/auth.schema';

/**
 * Register a new user
 */
export const register = async (req: Request<{}, {}, RegisterInput>, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Create new user
  const user = new User({
    email: email.toLowerCase(),
    password, // Will be hashed by pre-save hook
    firstName,
    lastName,
    phone,
    role: role || 'homeowner',
    isEmailVerified: false,
    isPhoneVerified: false,
    // Create minimal proProfile for pro users
    ...(role === 'pro' && {
      proProfile: {
        businessName: `${firstName} ${lastName}`, // Temporary - will be updated in onboarding
        categories: [],
        serviceAreas: [],
        languages: [],
        verificationStatus: 'unverified',
        verificationDocuments: [],
        portfolio: [],
        featuredProjects: [],
        rating: 0,
        reviewCount: 0,
        projectsCompleted: 0,
        responseTimeHours: 24,
        quoteAcceptanceRate: 0,
      }
    }),
  });

  await user.save();

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenVersion: user.refreshTokenVersion,
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.info('User registered successfully', { userId: user._id, email: user.email });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
    },
  });
};

/**
 * Login user
 */
export const login = async (req: Request<{}, {}, LoginInput>, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    logger.warn('Login attempt with non-existent email', { email });
    throw new UnauthorizedError('The email or password you entered is incorrect. Please check your credentials and try again.');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    logger.warn('Login attempt with incorrect password', { userId: user._id, email: user.email });
    throw new UnauthorizedError('The email or password you entered is incorrect. Please check your credentials and try again.');
  }

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenVersion: user.refreshTokenVersion,
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.info('User logged in successfully', { userId: user._id, email: user.email });

  // Remove password from response
  const userObject = user.toJSON();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userObject,
      accessToken: tokens.accessToken,
    },
  });
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request<{}, {}, RefreshTokenInput>, res: Response): Promise<void> => {
  // Get refresh token from cookie or body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new UnauthorizedError('Your session has expired. Please sign in again.');
  }

  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    throw new UnauthorizedError('Your session has expired. Please sign in again.');
  }

  // Find user
  const user = await User.findById(payload.userId);

  if (!user) {
    throw new NotFoundError('Your account could not be found. Please contact support if this issue persists.');
  }

  // Check token version (for logout/invalidation)
  if (payload.tokenVersion !== user.refreshTokenVersion) {
    throw new UnauthorizedError('Your session has expired. Please sign in again.');
  }

  // Generate new tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenVersion: user.refreshTokenVersion,
  });

  // Set new refresh token in cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.debug('Token refreshed', { userId: user._id });

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: tokens.accessToken,
    },
  });
};

/**
 * Logout user (invalidate refresh tokens)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  if (user) {
    // Increment token version to invalidate all refresh tokens
    await user.incrementRefreshTokenVersion();
    logger.info('User logged out', { userId: user._id });
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  if (!user) {
    throw new UnauthorizedError('You must be signed in to access this resource.');
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.toJSON(),
    },
  });
};

/**
 * Guest signup (email-only, no password)
 * Creates a guest account that can be upgraded later
 */
export const guestSignup = async (req: Request<{}, {}, GuestSignupInput>, res: Response): Promise<void> => {
  const { email, firstName, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    // User exists - generate magic link and send email
    const token = await existingUser.generateMagicLinkToken();

    // Send magic link email (different content based on hasSetPassword)
    emailService.sendMagicLinkEmail(
      existingUser.email,
      token,
      existingUser.hasSetPassword,
      existingUser.firstName
    ).catch((error) => {
      logger.error('Failed to send magic link email to existing user', { userId: existingUser._id, error });
    });

    logger.info('Magic link sent to existing user via guest flow', {
      userId: existingUser._id,
      email: existingUser.email,
      hasSetPassword: existingUser.hasSetPassword
    });

    res.status(200).json({
      success: true,
      message: 'Check your email for a link to access your account',
      data: {
        email: existingUser.email,
        isNewUser: false,
        requiresPasswordSetup: !existingUser.hasSetPassword,
      },
    });
    return;
  }

  // Generate a temporary password for guest account (will be replaced when user sets their own)
  const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

  // Create new guest user
  const user = new User({
    email: email.toLowerCase(),
    password: tempPassword, // Will be hashed by pre-save hook
    firstName: firstName || 'Guest',
    lastName: 'User',
    phone,
    role: 'homeowner',
    isEmailVerified: false,
    isPhoneVerified: false,
    isGuestAccount: true,
    hasSetPassword: false, // User hasn't set their own password yet
  });

  await user.save();

  // Generate magic link token
  const token = await user.generateMagicLinkToken();

  logger.info('Guest user created successfully', { userId: user._id, email: user.email });

  // Send magic link email (non-blocking)
  emailService.sendMagicLinkEmail(user.email, token, false, firstName).catch((error) => {
    logger.error('Failed to send magic link email', { userId: user._id, error });
  });

  res.status(201).json({
    success: true,
    message: 'Account created! Check your email for a link to set up your password.',
    data: {
      email: user.email,
      isNewUser: true,
      requiresPasswordSetup: true,
    },
  });
};

/**
 * Verify magic link token and login user or provide password setup access
 */
export const verifyMagicLink = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    throw new BadRequestError('Magic link token is required');
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with matching token
  const user = await User.findOne({
    magicLinkToken: hashedToken,
    magicLinkExpiry: { $gt: new Date() }, // Token not expired
  });

  if (!user) {
    throw new UnauthorizedError('Invalid or expired magic link. Please request a new one.');
  }

  // Check if user has set password
  if (user.hasSetPassword) {
    // User has password - log them in
    await user.clearMagicLinkToken();

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.refreshTokenVersion,
    });

    // Set refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info('User logged in via magic link', { userId: user._id, email: user.email });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        requiresPasswordSetup: false,
      },
    });
  } else {
    // User needs to set password - don't clear token yet, return user info
    logger.info('User verified magic link, needs password setup', { userId: user._id, email: user.email });

    res.status(200).json({
      success: true,
      message: 'Please create your password',
      data: {
        email: user.email,
        firstName: user.firstName,
        requiresPasswordSetup: true,
        magicLinkToken: token, // Send token back so they can use it for password setup
      },
    });
  }
};

/**
 * Set password for guest account using magic link token
 */
export const setPasswordWithMagicLink = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new BadRequestError('Token and password are required');
  }

  // Validate password strength
  if (password.length < 8) {
    throw new BadRequestError('Password must be at least 8 characters long');
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with matching token
  const user = await User.findOne({
    magicLinkToken: hashedToken,
    magicLinkExpiry: { $gt: new Date() },
  }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Invalid or expired magic link. Please request a new one.');
  }

  // Set the new password and mark as set
  user.password = password; // Will be hashed by pre-save hook
  user.hasSetPassword = true;
  user.isGuestAccount = false; // No longer a guest once password is set
  user.isEmailVerified = true; // Consider email verified since they accessed via email link
  await user.clearMagicLinkToken();

  await user.save();

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenVersion: user.refreshTokenVersion,
  });

  // Set refresh token in cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.info('User set password and logged in', { userId: user._id, email: user.email });

  res.status(200).json({
    success: true,
    message: 'Password set successfully',
    data: {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
    },
  });
};

/**
 * Google OAuth login/signup
 */
export const googleAuth = async (req: Request<{}, {}, GoogleAuthInput>, res: Response): Promise<void> => {
  const { token, role } = req.body;

  logger.info('Google auth attempt', { hasToken: !!token, role });

  if (!token) {
    throw new BadRequestError('Google token is required');
  }

  // Verify the Google token
  const googlePayload = await verifyGoogleToken(token);

  logger.info('Google token verified', {
    googleId: googlePayload.sub,
    email: googlePayload.email,
    emailVerified: googlePayload.email_verified
  });

  // Find or create user with auto-account-linking
  const user = await findOrCreateGoogleUser(googlePayload, role);

  // Generate JWT tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenVersion: user.refreshTokenVersion,
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.info('Google auth successful', {
    userId: user._id,
    email: user.email,
    isNewUser: !user.password && user.authProvider === 'google'
  });

  res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    data: {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
    },
  });
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  guestSignup,
  verifyMagicLink,
  setPasswordWithMagicLink,
  googleAuth,
};
