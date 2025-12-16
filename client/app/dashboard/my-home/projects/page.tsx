'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  FolderKanban,
  MoreVertical,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pause,
  Loader2,
  Calendar,
  DollarSign,
  ListTodo,
} from 'lucide-react';
import {
  getMyHomeProjects,
  deleteHomeProject,
  type HomeProjectWithStats,
  type HomeProjectStatus,
} from '@/lib/services/homeProjects';
import { PROJECT_CATEGORIES, HOME_PROJECT_STATUSES } from '@homezy/shared';

const statusConfig: Record<
  HomeProjectStatus,
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }
> = {
  planning: {
    label: 'Planning',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: Edit2,
  },
  'in-progress': {
    label: 'In Progress',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: Clock,
  },
  'on-hold': {
    label: 'On Hold',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: Pause,
  },
  completed: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: AlertCircle,
  },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<HomeProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<HomeProjectStatus | 'all'>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { projects } = await getMyHomeProjects({ includeCollaborated: true });
      setProjects(projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project?.isDefault) {
      alert('Cannot delete the default "My Ideas" project.');
      return;
    }

    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(projectId);
      await deleteHomeProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredProjects =
    statusFilter === 'all'
      ? projects
      : projects.filter((p) => p.status === statusFilter);

  // Separate default project from others
  const defaultProject = filteredProjects.find((p) => p.isDefault);
  const otherProjects = filteredProjects.filter((p) => !p.isDefault);

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
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Plan and manage your home improvement projects
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/my-home/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({projects.length})
        </button>
        {HOME_PROJECT_STATUSES.map((status) => {
          const count = projects.filter((p) => p.status === status).length;
          const config = statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? `${config.bgColor} ${config.color}`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Default "My Ideas" Project Card */}
      {defaultProject && (
        <Link
          href={`/dashboard/my-home/projects/${defaultProject.id}`}
          className="block bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FolderKanban className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{defaultProject.name}</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Default
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Your personal collection for saving ideas, products, and inspiration
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>{defaultProject.resourceCount || 0} saved items</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Projects List */}
      {otherProjects.length === 0 && !defaultProject ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FolderKanban className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first home improvement project to start tracking tasks, costs, and progress.
          </p>
          <Link
            href="/dashboard/my-home/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Your First Project
          </Link>
        </div>
      ) : otherProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">
            {statusFilter === 'all'
              ? 'No projects created yet. Start by creating a new project.'
              : `No projects with status "${statusConfig[statusFilter as HomeProjectStatus]?.label}".`}
          </p>
          <Link
            href="/dashboard/my-home/projects/new"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <Plus className="h-4 w-4" />
            Create New Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {otherProjects.map((project) => {
            const status = statusConfig[project.status];
            const StatusIcon = status.icon;
            const taskProgress =
              project.taskStats.total > 0
                ? Math.round((project.taskStats.done / project.taskStats.total) * 100)
                : 0;

            return (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Project Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/dashboard/my-home/projects/${project.id}`}
                      className="flex items-start gap-3 flex-1"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FolderKanban className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {getCategoryLabel(project.category)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 ${status.bgColor} ${status.color} text-xs font-medium rounded-full`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Action Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setActionMenuOpen(actionMenuOpen === project.id ? null : project.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>

                      {actionMenuOpen === project.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <Link
                              href={`/dashboard/my-home/projects/${project.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit2 className="h-4 w-4" />
                              View / Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(project.id)}
                              disabled={deletingId === project.id}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === project.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Delete Project
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="p-5">
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {/* Tasks */}
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <ListTodo className="h-4 w-4" />
                        <span>Tasks</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {project.taskStats.done}/{project.taskStats.total}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Budget</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {project.budgetStats.estimated > 0
                          ? `AED ${project.budgetStats.actual.toLocaleString()}`
                          : '-'}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {project.targetEndDate
                          ? new Date(project.targetEndDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {project.taskStats.total > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-gray-900">{taskProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* View Link */}
                <Link
                  href={`/dashboard/my-home/projects/${project.id}`}
                  className="block px-5 py-3 bg-gray-50 text-sm font-medium text-primary-600 hover:bg-gray-100 transition-colors text-center"
                >
                  View Project
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
