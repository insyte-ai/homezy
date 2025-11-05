import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
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

export default {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
};
