'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Lock,
  Save,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  updateProfile,
  updateNotificationPreferences,
  changePassword,
  getNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/services/users';
import { handleApiError } from '@/lib/utils/errorHandler';
import { PhoneInput } from '@/components/common/PhoneInput';

export default function SettingsPage() {
  const { user, fetchCurrentUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Personal Info
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newQuoteEmail, setNewQuoteEmail] = useState(true);
  const [leadUpdateEmail, setLeadUpdateEmail] = useState(true);
  const [reviewRequestEmail, setReviewRequestEmail] = useState(true);
  const [marketingEmail, setMarketingEmail] = useState(false);

  // My Home Notification Preferences
  const [serviceRemindersEmail, setServiceRemindersEmail] = useState(true);
  const [seasonalRemindersEmail, setSeasonalRemindersEmail] = useState(true);
  const [expenseAlertsEmail, setExpenseAlertsEmail] = useState(true);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load notification preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await getNotificationPreferences();
        const prefs = response.data.notificationPreferences;

        if (prefs?.email) {
          setNewQuoteEmail(prefs.email.newQuote ?? true);
          setLeadUpdateEmail(prefs.email.projectUpdate ?? true);
          setReviewRequestEmail(prefs.email.reviewRequest ?? true);
          setMarketingEmail(prefs.email.marketing ?? false);
          setServiceRemindersEmail(prefs.email.serviceReminders ?? true);
          setSeasonalRemindersEmail(prefs.email.seasonalReminders ?? true);
          setExpenseAlertsEmail(prefs.email.expenseAlerts ?? true);

          // Set master toggle based on individual settings
          const anyEmailEnabled = prefs.email.newQuote || prefs.email.projectUpdate ||
                                   prefs.email.reviewRequest || prefs.email.marketing;
          setEmailNotifications(anyEmailEnabled);
        }
      } catch (err) {
        handleApiError(err, 'Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Update user state from props when it changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      await updateProfile({
        firstName,
        lastName,
        phone,
      });

      // Refresh user data from server
      await fetchCurrentUser();

      toast.success('Profile updated successfully');
    } catch (err) {
      handleApiError(err, 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);

      const preferences: NotificationPreferences = {
        email: {
          newQuote: emailNotifications && newQuoteEmail,
          newMessage: emailNotifications,
          projectUpdate: emailNotifications && leadUpdateEmail,
          reviewRequest: emailNotifications && reviewRequestEmail,
          marketing: emailNotifications && marketingEmail,
          serviceReminders: serviceRemindersEmail,
          seasonalReminders: seasonalRemindersEmail,
          expenseAlerts: expenseAlertsEmail,
        },
      };

      await updateNotificationPreferences(preferences);
      toast.success('Notification preferences updated');
    } catch (err) {
      handleApiError(err, 'Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success('Password changed successfully. Please login again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      handleApiError(err, 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contact support to change your email
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </label>
              <PhoneInput
                value={phone}
                onChange={(value) => setPhone(value)}
                placeholder="50 123 4567"
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">New Quote Received</h3>
                  <p className="text-sm text-gray-600">Get notified when a professional submits a quote</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuoteEmail}
                    onChange={(e) => setNewQuoteEmail(e.target.checked)}
                    disabled={!emailNotifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50"></div>
                </label>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Request Updates</h3>
                  <p className="text-sm text-gray-600">Updates when professionals respond to your requests</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leadUpdateEmail}
                    onChange={(e) => setLeadUpdateEmail(e.target.checked)}
                    disabled={!emailNotifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50"></div>
                </label>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Review Requests</h3>
                  <p className="text-sm text-gray-600">Get notified when you can review a completed project</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewRequestEmail}
                    onChange={(e) => setReviewRequestEmail(e.target.checked)}
                    disabled={!emailNotifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50"></div>
                </label>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Marketing & Tips</h3>
                  <p className="text-sm text-gray-600">Home improvement tips and special offers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingEmail}
                    onChange={(e) => setMarketingEmail(e.target.checked)}
                    disabled={!emailNotifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50"></div>
                </label>
              </div>
            </div>

            {/* My Home Notifications */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-4">My Home Notifications</h3>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Service Reminders</h3>
                  <p className="text-sm text-gray-600">Get notified about upcoming maintenance tasks</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceRemindersEmail}
                    onChange={(e) => setServiceRemindersEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Seasonal Reminders</h3>
                  <p className="text-sm text-gray-600">UAE seasonal maintenance tips (AC prep, water heater checks)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seasonalRemindersEmail}
                    onChange={(e) => setSeasonalRemindersEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Expense Alerts</h3>
                  <p className="text-sm text-gray-600">Budget alerts and monthly expense summaries</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expenseAlertsEmail}
                    onChange={(e) => setExpenseAlertsEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex justify-end">
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <button
              onClick={handleChangePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Lock className="h-4 w-4" />
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-xs sm:text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Need help with your account?</p>
              <p>
                Contact our support team at{' '}
                <a href="mailto:support@homezy.co" className="text-primary-600 hover:text-primary-700">
                  support@homezy.co
                </a>
                {' '}or visit our help center for FAQs and guides.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
