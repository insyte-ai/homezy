'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  House,
  FolderKanban,
  Lightbulb,
  Clock,
  Bell,
  Receipt,
  ArrowRight,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  MapPin,
  Home,
  Bed,
  Bath,
} from 'lucide-react';
import { getMyProperties, type Property } from '@/lib/services/property';
import { getMyHomeProjects, type HomeProjectWithStats } from '@/lib/services/homeProjects';
import { getUpcomingReminders, getOverdueReminders, type ServiceReminder } from '@/lib/services/serviceReminder';
import { getExpenseSummary } from '@/lib/services/expense';
import { serviceCategoryConfig } from '@/lib/services/serviceHistory';

export default function MyHomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [primaryProperty, setPrimaryProperty] = useState<Property | null>(null);
  const [propertyCount, setPropertyCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState<HomeProjectWithStats[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<ServiceReminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<ServiceReminder[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<{
    totalAmount: number;
    expenseCount: number;
  } | null>(null);
  const [savedIdeasCount, setSavedIdeasCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [propertiesRes, projectsRes, upcomingRes, overdueRes, expenseRes] = await Promise.all([
        getMyProperties(),
        getMyHomeProjects({ includeCollaborated: true }),
        getUpcomingReminders({ daysAhead: 14, limit: 5 }),
        getOverdueReminders(),
        getExpenseSummary({ year: new Date().getFullYear() }),
      ]);

      // Properties
      const primary = propertiesRes.properties.find((p) => p.isPrimary);
      setPrimaryProperty(primary || propertiesRes.properties[0] || null);
      setPropertyCount(propertiesRes.properties.length);

      // Projects - filter for active ones
      const active = projectsRes.projects.filter(
        (p) => p.status === 'planning' || p.status === 'in-progress'
      );
      setActiveProjects(active.slice(0, 3));

      // Count saved ideas from default project
      const defaultProject = projectsRes.projects.find((p) => p.isDefault);
      setSavedIdeasCount(defaultProject?.resourceCount || 0);

      // Reminders
      setUpcomingReminders(upcomingRes);
      setOverdueReminders(overdueRes);

      // Expenses
      setExpenseSummary(expenseRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCategoryLabel = (category: string) => {
    return serviceCategoryConfig[category as keyof typeof serviceCategoryConfig]?.label || category;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Home</h1>
          <p className="text-gray-600 mt-1">
            Manage your home improvement projects and services
          </p>
        </div>
        <Link
          href="/dashboard/my-home/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Property Card */}
      {primaryProperty ? (
        <Link
          href="/dashboard/my-home/property"
          className="block bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <House className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{primaryProperty.name}</h3>
                  {primaryProperty.isPrimary && (
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{primaryProperty.emirate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span className="capitalize">{primaryProperty.propertyType}</span>
                  </div>
                  {primaryProperty.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{primaryProperty.bedrooms} bed</span>
                    </div>
                  )}
                  {primaryProperty.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{primaryProperty.bathrooms} bath</span>
                    </div>
                  )}
                </div>
                {propertyCount > 1 && (
                  <p className="text-sm text-teal-600 mt-2">
                    + {propertyCount - 1} more {propertyCount - 1 === 1 ? 'property' : 'properties'}
                  </p>
                )}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-teal-600" />
          </div>
        </Link>
      ) : (
        <Link
          href="/dashboard/my-home/property/new"
          className="block bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-teal-400 hover:bg-teal-50/50 transition-colors text-center"
        >
          <House className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Add Your First Property</h3>
          <p className="text-sm text-gray-600 mt-1">
            Set up your home profile to get personalized recommendations
          </p>
        </Link>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/my-home/projects"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderKanban className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{activeProjects.length}</div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/my-home/ideas"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{savedIdeasCount}</div>
              <div className="text-sm text-gray-600">Saved Ideas</div>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/my-home/reminders"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${overdueReminders.length > 0 ? 'bg-red-100' : 'bg-amber-100'}`}>
              {overdueReminders.length > 0 ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <Bell className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {overdueReminders.length > 0 ? overdueReminders.length : upcomingReminders.length}
              </div>
              <div className="text-sm text-gray-600">
                {overdueReminders.length > 0 ? 'Overdue' : 'Upcoming'} Reminders
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/my-home/expenses"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Receipt className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                AED {(expenseSummary?.totalAmount || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">This Year</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Overdue Reminders Alert */}
      {overdueReminders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">
                {overdueReminders.length} Overdue Reminder{overdueReminders.length > 1 ? 's' : ''}
              </h3>
              <ul className="mt-2 space-y-1">
                {overdueReminders.slice(0, 3).map((reminder) => (
                  <li key={reminder.id} className="text-sm text-red-700">
                    {reminder.title} - {getCategoryLabel(reminder.category)}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/my-home/reminders"
                className="inline-block mt-2 text-sm font-medium text-red-700 hover:text-red-800"
              >
                View all reminders →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Active Projects & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Projects</h2>
            <Link
              href="/dashboard/my-home/projects"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          {activeProjects.length === 0 ? (
            <div className="p-6 text-center">
              <FolderKanban className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-3">No active projects</p>
              <Link
                href="/dashboard/my-home/projects/new"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="h-4 w-4" />
                Create a project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/my-home/projects/${project.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderKanban className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            project.status === 'in-progress'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {project.status === 'in-progress' ? 'In Progress' : 'Planning'}
                        </span>
                        {project.taskStats.total > 0 && (
                          <span>
                            {project.taskStats.done}/{project.taskStats.total} tasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Upcoming Reminders</h2>
            <Link
              href="/dashboard/my-home/reminders"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          {upcomingReminders.length === 0 && overdueReminders.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-3">No upcoming reminders</p>
              <Link
                href="/dashboard/my-home/reminders"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="h-4 w-4" />
                Create a reminder
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcomingReminders.slice(0, 4).map((reminder) => {
                const daysUntil = getDaysUntilDue(reminder.nextDueDate);
                return (
                  <Link
                    key={reminder.id}
                    href="/dashboard/my-home/reminders"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Bell className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                        <p className="text-sm text-gray-500">
                          {getCategoryLabel(reminder.category)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-medium ${
                          daysUntil <= 3 ? 'text-amber-600' : 'text-gray-600'
                        }`}
                      >
                        {daysUntil === 0
                          ? 'Today'
                          : daysUntil === 1
                          ? 'Tomorrow'
                          : `In ${daysUntil} days`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <Link
          href="/dashboard/my-home/projects"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderKanban className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
          <p className="text-sm text-gray-600">
            Plan and manage your home improvement projects with tasks, budgets, and timelines.
          </p>
        </Link>

        {/* Ideas */}
        <Link
          href="/dashboard/my-home/ideas"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ideas</h3>
          <p className="text-sm text-gray-600">
            Save inspiration, products, vendors, and professionals for future reference.
          </p>
        </Link>

        {/* Service History */}
        <Link
          href="/dashboard/my-home/service-history"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Service History</h3>
          <p className="text-sm text-gray-600">
            Track all home services and maintenance performed on your property.
          </p>
        </Link>

        {/* Reminders */}
        <Link
          href="/dashboard/my-home/reminders"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Bell className="h-6 w-6 text-amber-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reminders</h3>
          <p className="text-sm text-gray-600">
            Smart reminders for maintenance based on your service history patterns.
          </p>
        </Link>

        {/* Expenses */}
        <Link
          href="/dashboard/my-home/expenses"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Receipt className="h-6 w-6 text-purple-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Expenses</h3>
          <p className="text-sm text-gray-600">
            Track home improvement spending with category breakdowns and trends.
          </p>
        </Link>

        {/* Property */}
        <Link
          href="/dashboard/my-home/property"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <House className="h-6 w-6 text-teal-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Property</h3>
          <p className="text-sm text-gray-600">
            Manage your property details, rooms, and home profile.
          </p>
        </Link>
      </div>
    </div>
  );
}
