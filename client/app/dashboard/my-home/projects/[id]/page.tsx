'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Settings,
  ListTodo,
  DollarSign,
  Flag,
  Users,
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  GripVertical,
  Check,
  X,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  getHomeProjectById,
  updateHomeProject,
  addTask,
  updateTask,
  deleteTask,
  reorderTasks,
  addCostItem,
  updateCostItem,
  deleteCostItem,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  type HomeProject,
  type Task,
  type CostItem,
  type Milestone,
  type TaskStatus,
  type TaskPriority,
  type CostCategory,
  type CostStatus,
  type MilestoneStatus,
  type HomeProjectStatus,
} from '@/lib/services/homeProjects';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  COST_CATEGORIES,
  COST_STATUSES,
  HOME_PROJECT_STATUSES,
  MILESTONE_STATUSES,
} from '@homezy/shared';

type TabType = 'tasks' | 'costs' | 'milestones' | 'settings';

const statusConfig: Record<HomeProjectStatus, { label: string; color: string; bgColor: string }> = {
  planning: { label: 'Planning', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'in-progress': { label: 'In Progress', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  'on-hold': { label: 'On Hold', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const taskColumnConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: { label: 'To Do', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'in-progress': { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  blocked: { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-100' },
  done: { label: 'Done', color: 'text-green-700', bgColor: 'bg-green-100' },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-gray-500' },
  medium: { label: 'Medium', color: 'text-amber-600' },
  high: { label: 'High', color: 'text-red-600' },
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<HomeProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as TaskPriority });
  const [savingTask, setSavingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Cost form state
  const [showCostForm, setShowCostForm] = useState(false);
  const [newCost, setNewCost] = useState({
    title: '',
    category: 'materials' as CostCategory,
    estimatedCost: undefined as number | undefined,
    actualCost: undefined as number | undefined,
    status: 'estimated' as CostStatus,
    notes: '',
  });
  const [savingCost, setSavingCost] = useState(false);

  // Milestone form state
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [savingMilestone, setSavingMilestone] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHomeProjectById(projectId);
      setProject(data);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Task handlers
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      setSavingTask(true);
      const updated = await addTask(projectId, {
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
      });
      setProject(updated);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setShowTaskForm(false);
    } catch (err) {
      console.error('Failed to add task:', err);
      alert('Failed to add task. Please try again.');
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updated = await updateTask(projectId, taskId, { status });
      setProject(updated);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      const updated = await deleteTask(projectId, taskId);
      setProject(updated);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Cost handlers
  const handleAddCost = async () => {
    if (!newCost.title.trim()) return;
    try {
      setSavingCost(true);
      const updated = await addCostItem(projectId, {
        title: newCost.title,
        category: newCost.category,
        estimatedCost: newCost.estimatedCost,
        actualCost: newCost.actualCost,
        status: newCost.status,
        notes: newCost.notes || undefined,
      });
      setProject(updated);
      setNewCost({
        title: '',
        category: 'materials',
        estimatedCost: undefined,
        actualCost: undefined,
        status: 'estimated',
        notes: '',
      });
      setShowCostForm(false);
    } catch (err) {
      console.error('Failed to add cost:', err);
      alert('Failed to add cost item. Please try again.');
    } finally {
      setSavingCost(false);
    }
  };

  const handleDeleteCost = async (costId: string) => {
    if (!confirm('Delete this cost item?')) return;
    try {
      const updated = await deleteCostItem(projectId, costId);
      setProject(updated);
    } catch (err) {
      console.error('Failed to delete cost:', err);
    }
  };

  // Milestone handlers
  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) return;
    try {
      setSavingMilestone(true);
      const updated = await addMilestone(projectId, {
        title: newMilestone.title,
        description: newMilestone.description || undefined,
        dueDate: newMilestone.dueDate || undefined,
      });
      setProject(updated);
      setNewMilestone({ title: '', description: '', dueDate: '' });
      setShowMilestoneForm(false);
    } catch (err) {
      console.error('Failed to add milestone:', err);
      alert('Failed to add milestone. Please try again.');
    } finally {
      setSavingMilestone(false);
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, status: MilestoneStatus) => {
    try {
      const updated = await updateMilestone(projectId, milestoneId, { status });
      setProject(updated);
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Delete this milestone?')) return;
    try {
      const updated = await deleteMilestone(projectId, milestoneId);
      setProject(updated);
    } catch (err) {
      console.error('Failed to delete milestone:', err);
    }
  };

  // Project settings
  const handleUpdateProjectStatus = async (status: HomeProjectStatus) => {
    try {
      const updated = await updateHomeProject(projectId, { status });
      setProject(updated);
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
        <Link href="/dashboard/my-home/projects" className="text-primary-600 hover:text-primary-700">
          Back to Projects
        </Link>
      </div>
    );
  }

  const status = statusConfig[project.status];
  const tasksByStatus = TASK_STATUSES.reduce((acc, s) => {
    acc[s] = project.tasks.filter((t) => t.status === s).sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const totalEstimated = project.costItems.reduce((sum, c) => sum + (c.estimatedCost || 0), 0);
  const totalActual = project.costItems.reduce((sum, c) => sum + (c.actualCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/my-home/projects"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-3 py-1 ${status.bgColor} ${status.color} text-sm font-medium rounded-full`}>
                {status.label}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              {getCategoryLabel(project.category)}
              {project.description && ` • ${project.description}`}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Tasks</div>
          <div className="text-2xl font-bold text-gray-900">
            {tasksByStatus.done.length}/{project.tasks.length}
          </div>
          <div className="text-xs text-gray-500">completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Budget</div>
          <div className="text-2xl font-bold text-gray-900">
            AED {totalActual.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            of AED {totalEstimated.toLocaleString()} estimated
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Milestones</div>
          <div className="text-2xl font-bold text-gray-900">
            {project.milestones.filter((m) => m.status === 'completed').length}/{project.milestones.length}
          </div>
          <div className="text-xs text-gray-500">completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Due Date</div>
          <div className="text-2xl font-bold text-gray-900">
            {project.targetEndDate
              ? new Date(project.targetEndDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })
              : '-'}
          </div>
          <div className="text-xs text-gray-500">target</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: 'tasks' as TabType, label: 'Tasks', icon: ListTodo },
            { id: 'costs' as TabType, label: 'Costs', icon: DollarSign },
            { id: 'milestones' as TabType, label: 'Milestones', icon: Flag },
            { id: 'settings' as TabType, label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Add Task Button */}
          {!showTaskForm && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          )}

          {/* Add Task Form */}
          {showTaskForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="flex gap-3">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{priorityConfig[p].label} Priority</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddTask}
                    disabled={!newTask.title.trim() || savingTask}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {savingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                  </button>
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TASK_STATUSES.map((status) => {
              const config = taskColumnConfig[status];
              const tasks = tasksByStatus[status];
              return (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <div className={`flex items-center gap-2 mb-3 ${config.color}`}>
                    <span className={`px-2 py-0.5 ${config.bgColor} rounded text-xs font-medium`}>
                      {tasks.length}
                    </span>
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                            <div className={`text-xs ${priorityConfig[task.priority].color} mt-1`}>
                              {priorityConfig[task.priority].label}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {status !== 'done' && (
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id,
                                  status === 'todo' ? 'in-progress' :
                                  status === 'in-progress' ? 'done' :
                                  status === 'blocked' ? 'in-progress' : 'done'
                                )}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Move forward"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="text-sm text-gray-400 text-center py-4">No tasks</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'costs' && (
        <div className="space-y-4">
          {/* Budget Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Budget Progress</span>
              <span className="font-medium">
                AED {totalActual.toLocaleString()} / AED {totalEstimated.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  totalEstimated > 0 && totalActual > totalEstimated ? 'bg-red-500' : 'bg-primary-500'
                }`}
                style={{ width: `${Math.min((totalActual / (totalEstimated || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Add Cost Button */}
          {!showCostForm && (
            <button
              onClick={() => setShowCostForm(true)}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Cost Item
            </button>
          )}

          {/* Add Cost Form */}
          {showCostForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={newCost.title}
                  onChange={(e) => setNewCost({ ...newCost, title: e.target.value })}
                  placeholder="Cost item title"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={newCost.category}
                  onChange={(e) => setNewCost({ ...newCost, category: e.target.value as CostCategory })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {COST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{getCategoryLabel(c)}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newCost.estimatedCost ?? ''}
                  onChange={(e) => setNewCost({ ...newCost, estimatedCost: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Estimated (AED)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  value={newCost.actualCost ?? ''}
                  onChange={(e) => setNewCost({ ...newCost, actualCost: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Actual (AED)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddCost}
                  disabled={!newCost.title.trim() || savingCost}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {savingCost ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Cost'}
                </button>
                <button
                  onClick={() => setShowCostForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Cost Items List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
            {project.costItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No cost items yet</div>
            ) : (
              project.costItems.map((cost) => (
                <div key={cost.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{cost.title}</div>
                    <div className="text-sm text-gray-500">{getCategoryLabel(cost.category)}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        AED {(cost.actualCost || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        of AED {(cost.estimatedCost || 0).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCost(cost.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-4">
          {/* Add Milestone Button */}
          {!showMilestoneForm && (
            <button
              onClick={() => setShowMilestoneForm(true)}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Milestone
            </button>
          )}

          {/* Add Milestone Form */}
          {showMilestoneForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="Milestone title"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddMilestone}
                  disabled={!newMilestone.title.trim() || savingMilestone}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {savingMilestone ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Milestone'}
                </button>
                <button
                  onClick={() => setShowMilestoneForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Milestones List */}
          <div className="space-y-3">
            {project.milestones.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                No milestones yet
              </div>
            ) : (
              project.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdateMilestoneStatus(
                        milestone.id,
                        milestone.status === 'completed' ? 'pending' : 'completed'
                      )}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        milestone.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-primary-500'
                      }`}
                    >
                      {milestone.status === 'completed' && <Check className="h-4 w-4" />}
                    </button>
                    <div>
                      <div className={`font-medium ${milestone.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {milestone.title}
                      </div>
                      {milestone.dueDate && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Status</label>
            <select
              value={project.status}
              onChange={(e) => handleUpdateProjectStatus(e.target.value as HomeProjectStatus)}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {HOME_PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{statusConfig[s].label}</option>
              ))}
            </select>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-4">
              Deleting this project will remove all tasks, costs, milestones, and resources.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
                  // Delete project and redirect
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
