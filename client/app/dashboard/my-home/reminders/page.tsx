'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Play,
  Trash2,
  MoreVertical,
  Loader2,
  X,
  RefreshCw,
  BellOff,
} from 'lucide-react';
import {
  getMyReminders,
  getUpcomingReminders,
  getOverdueReminders,
  createServiceReminder,
  completeReminder,
  snoozeReminder,
  pauseReminder,
  resumeReminder,
  deleteReminder,
  syncRemindersFromHistory,
  frequencyConfig,
  statusConfig,
  type ServiceReminder,
  type ReminderStatus,
  type CreateServiceReminderInput,
} from '@/lib/services/serviceReminder';
import { serviceCategoryConfig } from '@/lib/services/serviceHistory';
import { getMyProperties, type Property } from '@/lib/services/property';
import {
  HOME_SERVICE_CATEGORIES,
  REMINDER_FREQUENCIES,
} from '@homezy/shared';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<ServiceReminder[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<ReminderStatus | 'all'>('all');

  // Action menu
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState<CreateServiceReminderInput>({
    propertyId: '',
    category: 'general-maintenance',
    title: '',
    description: '',
    triggerType: 'custom',
    frequency: 'annual',
    customIntervalDays: undefined,
    nextDueDate: new Date(),
    reminderLeadDays: [30, 7, 1],
  });

  // Snooze dialog
  const [showSnoozeDialog, setShowSnoozeDialog] = useState<string | null>(null);
  const [snoozeDays, setSnoozeDays] = useState(7);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [remindersResult, overdueResult, propertiesResult] = await Promise.all([
        getMyReminders({ limit: 100 }),
        getOverdueReminders(),
        getMyProperties(),
      ]);
      setReminders(remindersResult.reminders);
      setOverdueReminders(overdueResult);
      setProperties(propertiesResult.properties);

      // Set default property for form
      const primary = propertiesResult.properties.find((p) => p.isPrimary);
      if (primary) {
        setFormData((prev) => ({ ...prev, propertyId: primary.id }));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load reminders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncRemindersFromHistory();
      alert(`Sync complete: ${result.created} created, ${result.updated} updated`);
      loadData();
    } catch (err) {
      console.error('Failed to sync reminders:', err);
      alert('Failed to sync reminders. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      setProcessingId(id);
      const updated = await completeReminder(id);
      setReminders(reminders.map((r) => (r.id === id ? updated : r)));
      setOverdueReminders(overdueReminders.filter((r) => r.id !== id));
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to complete reminder:', err);
      alert('Failed to mark as complete. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSnooze = async (id: string) => {
    try {
      setProcessingId(id);
      const updated = await snoozeReminder(id, snoozeDays);
      setReminders(reminders.map((r) => (r.id === id ? updated : r)));
      setOverdueReminders(overdueReminders.filter((r) => r.id !== id));
      setShowSnoozeDialog(null);
      setSnoozeDays(7);
    } catch (err) {
      console.error('Failed to snooze reminder:', err);
      alert('Failed to snooze. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePause = async (id: string) => {
    try {
      setProcessingId(id);
      const updated = await pauseReminder(id);
      setReminders(reminders.map((r) => (r.id === id ? updated : r)));
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to pause reminder:', err);
      alert('Failed to pause. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResume = async (id: string) => {
    try {
      setProcessingId(id);
      const updated = await resumeReminder(id);
      setReminders(reminders.map((r) => (r.id === id ? updated : r)));
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to resume reminder:', err);
      alert('Failed to resume. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      setProcessingId(id);
      await deleteReminder(id);
      setReminders(reminders.filter((r) => r.id !== id));
      setOverdueReminders(overdueReminders.filter((r) => r.id !== id));
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      alert('Failed to delete. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else if (type === 'date') {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      setIsSubmitting(true);
      const newReminder = await createServiceReminder(formData);
      setReminders([newReminder, ...reminders]);
      setShowAddForm(false);
      setFormData({
        propertyId: formData.propertyId,
        category: 'general-maintenance',
        title: '',
        description: '',
        triggerType: 'custom',
        frequency: 'annual',
        customIntervalDays: undefined,
        nextDueDate: new Date(),
        reminderLeadDays: [30, 7, 1],
      });
    } catch (err: any) {
      console.error('Failed to add reminder:', err);
      alert(err.response?.data?.message || 'Failed to add reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return serviceCategoryConfig[category as keyof typeof serviceCategoryConfig]?.label || category;
  };

  const getPropertyName = (propertyId?: string) => {
    if (!propertyId) return 'All Properties';
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueLabel = (dueDate: Date) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days <= 7) return `Due in ${days} days`;
    if (days <= 30) return `Due in ${Math.ceil(days / 7)} weeks`;
    return `Due ${new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  };

  // Filter reminders
  const filteredReminders =
    selectedStatus === 'all'
      ? reminders
      : reminders.filter((r) => r.status === selectedStatus);

  // Separate active from others for display
  const activeReminders = filteredReminders.filter(
    (r) => r.status === 'active' && getDaysUntilDue(r.nextDueDate) >= 0
  );
  const otherReminders = filteredReminders.filter(
    (r) => r.status !== 'active' || getDaysUntilDue(r.nextDueDate) < 0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/my-home"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Reminders</h1>
            <p className="text-gray-600 mt-1">Stay on top of your home maintenance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from History'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Reminder
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Overdue Alert */}
      {overdueReminders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">
                {overdueReminders.length} Overdue Reminder{overdueReminders.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-600 mt-1">
                {overdueReminders.map((r) => r.title).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Reminders</p>
              <p className="text-xl font-bold text-gray-900">{reminders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">
                {reminders.filter((r) => r.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Snoozed</p>
              <p className="text-xl font-bold text-gray-900">
                {reminders.filter((r) => r.status === 'snoozed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-xl font-bold text-gray-900">{overdueReminders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            selectedStatus === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {(['active', 'snoozed', 'paused', 'converted-to-quote'] as ReminderStatus[]).map(
          (status) => {
            const config = statusConfig[status];
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? `${config.bgColor} ${config.color}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {config.label}
              </button>
            );
          }
        )}
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Add Reminder</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleAddReminder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Annual AC Maintenance"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Property */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property
                </label>
                <select
                  name="propertyId"
                  value={formData.propertyId || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Properties</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {HOME_SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {REMINDER_FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {frequencyConfig[freq]?.label || freq}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Interval */}
              {formData.frequency === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interval (days)
                  </label>
                  <input
                    type="number"
                    name="customIntervalDays"
                    value={formData.customIntervalDays ?? ''}
                    onChange={handleInputChange}
                    placeholder="e.g., 45"
                    min={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              )}

              {/* Next Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Due Date *
                </label>
                <input
                  type="date"
                  name="nextDueDate"
                  value={
                    formData.nextDueDate
                      ? new Date(formData.nextDueDate).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Adding...' : 'Add Reminder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Snooze Dialog */}
      {showSnoozeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Snooze Reminder</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Snooze for
              </label>
              <select
                value={snoozeDays}
                onChange={(e) => setSnoozeDays(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
                <option value={30}>1 month</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSnoozeDialog(null);
                  setSnoozeDays(7);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSnooze(showSnoozeDialog)}
                disabled={processingId === showSnoozeDialog}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
              >
                {processingId === showSnoozeDialog && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Snooze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create reminders to stay on top of your home maintenance tasks.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReminders.map((reminder) => {
            const status = statusConfig[reminder.status];
            const catConfig =
              serviceCategoryConfig[reminder.category as keyof typeof serviceCategoryConfig];
            const daysUntil = getDaysUntilDue(reminder.nextDueDate);
            const isOverdue = daysUntil < 0;

            return (
              <div
                key={reminder.id}
                className={`bg-white rounded-lg shadow-sm border p-5 transition-shadow hover:shadow-md ${
                  isOverdue ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${catConfig?.bgColor || 'bg-gray-100'}`}
                    >
                      <Bell className={`h-5 w-5 ${catConfig?.color || 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{getCategoryLabel(reminder.category)}</span>
                        <span>•</span>
                        <span>{frequencyConfig[reminder.frequency]?.label}</span>
                        {reminder.propertyId && (
                          <>
                            <span>•</span>
                            <span>{getPropertyName(reminder.propertyId)}</span>
                          </>
                        )}
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span
                          className={`text-sm font-medium ${
                            isOverdue ? 'text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {getDueLabel(reminder.nextDueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {reminder.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleComplete(reminder.id)}
                          disabled={processingId === reminder.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as done"
                        >
                          {processingId === reminder.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => setShowSnoozeDialog(reminder.id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Snooze"
                        >
                          <BellOff className="h-5 w-5" />
                        </button>
                      </>
                    )}

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuOpen(
                            actionMenuOpen === reminder.id ? null : reminder.id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>

                      {actionMenuOpen === reminder.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            {reminder.status === 'active' && (
                              <button
                                onClick={() => handlePause(reminder.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Pause className="h-4 w-4" />
                                Pause Reminder
                              </button>
                            )}
                            {reminder.status === 'paused' && (
                              <button
                                onClick={() => handleResume(reminder.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Play className="h-4 w-4" />
                                Resume Reminder
                              </button>
                            )}
                            {reminder.status === 'snoozed' && (
                              <button
                                onClick={() => handleResume(reminder.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Bell className="h-4 w-4" />
                                Unsnooze
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(reminder.id)}
                              disabled={processingId === reminder.id}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              {processingId === reminder.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
