import { OAuth2Client } from 'google-auth-library';
import User, { IUser } from '../models/User.model';
import { config } from '../config/env';
import logger from '../utils/logger';

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export interface GoogleTokenPayload {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

/**
 * Verify Google ID token and extract user information
 */
export const verifyGoogleToken = async (token: string): Promise<GoogleTokenPayload> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload');
    }

    if (!payload.email || !payload.sub) {
      throw new Error('Missing required fields in token payload');
    }

    logger.info('Google token verified', {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified
    });

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified || false,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture
    };
  } catch (error: any) {
    logger.error('Error verifying Google token', {
      error: error.message,
      stack: error.stack
    });
    throw new Error('Invalid Google token');
  }
};

/**
 * Find or create user from Google OAuth
 * Implements auto-account-linking if email already exists
 */
export const findOrCreateGoogleUser = async (
  googlePayload: GoogleTokenPayload,
  role?: 'homeowner' | 'pro'
): Promise<IUser> => {
  try {
    // First, check if user exists with this Google ID
    let user = await User.findOne({ googleId: googlePayload.sub });

    if (user) {
      logger.info('Existing Google user found', {
        userId: user._id,
        email: user.email
      });
      // User exists with this Google account, update last login
      await user.save();
      return user;
    }

    // Check if user exists with this email (account linking scenario)
    user = await User.findOne({ email: googlePayload.email.toLowerCase() });

    if (user) {
      logger.info('Account linking: Adding Google ID to existing account', {
        userId: user._id,
        email: user.email
      });
      // Auto-link: Add Google ID to existing account
      user.googleId = googlePayload.sub;
      user.authProvider = 'google'; // Update provider to Google
      user.isEmailVerified = true; // Auto-verify since Google verified

      // Update name and photo if not set
      if (!user.firstName && googlePayload.given_name) {
        user.firstName = googlePayload.given_name;
      }
      if (!user.lastName && googlePayload.family_name) {
        user.lastName = googlePayload.family_name;
      }
      if (!user.profilePhoto && googlePayload.picture) {
        user.profilePhoto = googlePayload.picture;
      }

      await user.save();
      return user;
    }

    // New user - create account
    // For signup flow, role should be provided
    // For login flow (shouldn't happen), default to homeowner
    const userRole = role || 'homeowner';

    logger.info('Creating new Google user', {
      email: googlePayload.email,
      role: userRole
    });

    user = new User({
      email: googlePayload.email.toLowerCase(),
      googleId: googlePayload.sub,
      authProvider: 'google',
      isEmailVerified: true, // Auto-verify Google users
      firstName: googlePayload.given_name || '',
      lastName: googlePayload.family_name || '',
      profilePhoto: googlePayload.picture,
      role: userRole,
      // No password for Google auth users
      password: Math.random().toString(36), // Dummy password that won't be used
      hasSetPassword: false, // Indicate they haven't set a local password
    });

    // Initialize pro profile if professional role
    if (userRole === 'pro') {
      user.proProfile = {
        businessName: `${user.firstName} ${user.lastName}`.trim() || 'My Business',
        categories: [],
        serviceAreas: [],
        verificationStatus: 'unverified',
        verificationDocuments: [],
        portfolio: [],
        featuredProjects: [],
        rating: 0,
        reviewCount: 0,
        projectsCompleted: 0,
        responseTimeHours: 24,
        quoteAcceptanceRate: 0,
      };
    }

    // Initialize homeowner profile
    if (userRole === 'homeowner') {
      user.homeownerProfile = {
        favoritePros: [],
        savedSearches: [],
        notificationPreferences: {
          email: {
            newQuote: true,
            newMessage: true,
            projectUpdate: true,
            reviewRequest: true,
            marketing: false,
          },
          push: {
            newQuote: true,
            newMessage: true,
            projectUpdate: true,
          },
        },
      };
    }

    await user.save();
    logger.info('Google user created successfully', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    return user;
  } catch (error: any) {
    logger.error('Error finding or creating Google user', {
      error: error.message,
      stack: error.stack,
      email: googlePayload.email
    });
    throw new Error('Failed to authenticate with Google');
  }
};

/**
 * Check if a Google account can be linked to an existing email
 */
export const canLinkGoogleAccount = async (email: string, googleId: string): Promise<{
  canLink: boolean;
  reason?: string;
}> => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return { canLink: true }; // Email doesn't exist, can create new account
    }

    if (user.googleId && user.googleId !== googleId) {
      return {
        canLink: false,
        reason: 'This email is already linked to a different Google account'
      };
    }

    if (user.googleId === googleId) {
      return { canLink: true }; // Already linked, can proceed
    }

    // Email exists with local auth, can link
    return { canLink: true };
  } catch (error: any) {
    logger.error('Error checking Google account linkability', {
      error: error.message,
      email
    });
    return {
      canLink: false,
      reason: 'Failed to verify account linkability'
    };
  }
};
