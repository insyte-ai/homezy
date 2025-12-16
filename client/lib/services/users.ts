import { api } from '../api';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface NotificationPreferences {
  email?: {
    newQuote?: boolean;
    newMessage?: boolean;
    projectUpdate?: boolean;
    reviewRequest?: boolean;
    marketing?: boolean;
    serviceReminders?: boolean;
    seasonalReminders?: boolean;
    expenseAlerts?: boolean;
  };
  push?: {
    newQuote?: boolean;
    newMessage?: boolean;
    projectUpdate?: boolean;
    serviceReminders?: boolean;
  };
  doNotDisturbStart?: string;
  doNotDisturbEnd?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update user profile (firstName, lastName, phone)
 */
export const updateProfile = async (data: UpdateProfileData) => {
  const response = await api.patch('/users/profile', data);
  return response.data;
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async () => {
  const response = await api.get('/users/notification-preferences');
  return response.data;
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (preferences: NotificationPreferences) => {
  const response = await api.patch('/users/notification-preferences', preferences);
  return response.data;
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordData) => {
  const response = await api.patch('/users/change-password', data);
  return response.data;
};

/**
 * Update homeowner onboarding status
 */
export const updateOnboardingStatus = async (data: { completed?: boolean; skipped?: boolean }) => {
  const response = await api.patch('/users/onboarding', data);
  return response.data;
};
