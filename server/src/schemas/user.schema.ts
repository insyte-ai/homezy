import { z } from 'zod';

/**
 * Schema for updating user profile (homeowner)
 */
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(50).optional(),
    lastName: z.string().min(1, 'Last name is required').max(50).optional(),
    phone: z.string().regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number format').optional(),
  }),
});

/**
 * Schema for updating notification preferences
 */
export const updateNotificationPreferencesSchema = z.object({
  body: z.object({
    email: z.object({
      newQuote: z.boolean().optional(),
      newMessage: z.boolean().optional(),
      projectUpdate: z.boolean().optional(),
      reviewRequest: z.boolean().optional(),
      marketing: z.boolean().optional(),
    }).optional(),
    push: z.object({
      newQuote: z.boolean().optional(),
      newMessage: z.boolean().optional(),
      projectUpdate: z.boolean().optional(),
    }).optional(),
    doNotDisturbStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
    doNotDisturbEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  }),
});

/**
 * Schema for changing password
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
