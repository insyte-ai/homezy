'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Trash2,
  Loader2,
  Search,
  Filter,
  X,
  Receipt,
  Building,
  Tag,
  HardHat,
  Wrench,
  Settings,
  Zap,
  Sparkles,
  Shield,
  Trees,
  FileText,
  MoreHorizontal,
  Palette,
  PieChart,
} from 'lucide-react';
import {
  getMyExpenses,
  getExpenseSummary,
  getExpensesByCategory,
  getExpenseTrends,
  createExpense,
  deleteExpense,
  expenseCategoryConfig,
  type Expense,
  type ExpenseCategory,
  type CreateExpenseInput,
} from '@/lib/services/expense';
import { getMyProperties, type Property } from '@/lib/services/property';
import { EXPENSE_CATEGORIES, PROVIDER_TYPES } from '@homezy/shared';

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  HardHat,
  Wrench,
  Settings,
  Zap,
  Sparkles,
  Shield,
  Trees,
  FileText,
  MoreHorizontal,
  Palette,
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Summary data
  const [summary, setSummary] = useState<{
    totalAmount: number;
    expenseCount: number;
    averageExpense: number;
    byCategory: { category: string; amount: number; count: number }[];
  } | null>(null);
  const [trends, setTrends] = useState<{
    currentPeriod: { amount: number; count: number };
    previousPeriod: { amount: number; count: number };
    changePercent: number;
  } | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Action menu
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateExpenseInput>({
    propertyId: '',
    title: '',
    description: '',
    category: 'other',
    amount: 0,
    date: new Date(),
    vendorType: 'external',
    vendorName: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [expensesResult, propertiesResult, summaryResult, trendsResult] = await Promise.all([
        getMyExpenses({ limit: 100 }),
        getMyProperties(),
        getExpenseSummary({ year: selectedYear }),
        getExpenseTrends({ months: 3 }),
      ]);
      setExpenses(expensesResult.expenses);
      setProperties(propertiesResult.properties);
      setSummary(summaryResult);
      setTrends(trendsResult);

      // Set default property for form
      const primary = propertiesResult.properties.find((p) => p.isPrimary);
      if (primary) {
        setFormData((prev) => ({ ...prev, propertyId: primary.id }));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteExpense(id);
      setExpenses(expenses.filter((e) => e.id !== id));
      setActionMenuOpen(null);
      // Reload summary
      const summaryResult = await getExpenseSummary({ year: selectedYear });
      setSummary(summaryResult);
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert('Failed to delete expense. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value),
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
    }));
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.propertyId) {
      alert('Please select a property');
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter an amount');
      return;
    }

    try {
      setIsSubmitting(true);
      const newExpense = await createExpense(formData);
      setExpenses([newExpense, ...expenses]);
      setShowAddForm(false);
      setFormData({
        propertyId: formData.propertyId,
        title: '',
        description: '',
        category: 'other',
        amount: 0,
        date: new Date(),
        vendorType: 'external',
        vendorName: '',
        tags: [],
      });
      // Reload summary
      const summaryResult = await getExpenseSummary({ year: selectedYear });
      setSummary(summaryResult);
    } catch (err: any) {
      console.error('Failed to add expense:', err);
      alert(err.response?.data?.message || 'Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return expenseCategoryConfig[category as ExpenseCategory]?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    const config = expenseCategoryConfig[category as ExpenseCategory];
    const IconComponent = iconMap[config?.icon || 'MoreHorizontal'];
    return IconComponent || MoreHorizontal;
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    if (selectedCategory !== 'all' && expense.category !== selectedCategory) return false;
    if (selectedProperty !== 'all' && expense.propertyId !== selectedProperty) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        expense.title.toLowerCase().includes(query) ||
        expense.vendorName?.toLowerCase().includes(query) ||
        expense.description?.toLowerCase().includes(query) ||
        expense.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Calculate filtered total
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Get available years
  const availableYears = Array.from(
    new Set(expenses.map((e) => new Date(e.date).getFullYear()))
  ).sort((a, b) => b - a);
  if (!availableYears.includes(new Date().getFullYear())) {
    availableYears.unshift(new Date().getFullYear());
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-1">Track your home-related spending</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total ({selectedYear})</p>
              <p className="text-xl font-bold text-gray-900">
                AED {summary?.totalAmount.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="text-xl font-bold text-gray-900">
                {summary?.expenseCount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-xl font-bold text-gray-900">
                AED {summary?.averageExpense?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                (trends?.changePercent || 0) > 0 ? 'bg-red-100' : 'bg-green-100'
              }`}
            >
              {(trends?.changePercent || 0) > 0 ? (
                <TrendingUp className="h-5 w-5 text-red-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">vs Last 3 Months</p>
              <p
                className={`text-xl font-bold ${
                  (trends?.changePercent || 0) > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {(trends?.changePercent || 0) > 0 ? '+' : ''}
                {trends?.changePercent || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {summary && summary.byCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {summary.byCategory.slice(0, 6).map((cat) => {
              const config = expenseCategoryConfig[cat.category as ExpenseCategory];
              const CategoryIcon = getCategoryIcon(cat.category);
              return (
                <div
                  key={cat.category}
                  className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${config?.bgColor || 'bg-gray-100'}`}>
                      <CategoryIcon className={`h-4 w-4 ${config?.color || 'text-gray-600'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {getCategoryLabel(cat.category)}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    AED {cat.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{cat.count} transactions</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Year Filter */}
          <div className="w-full md:w-32">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Property Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Properties</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter summary */}
        {(selectedCategory !== 'all' || selectedProperty !== 'all' || searchQuery) && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredExpenses.length} expenses totaling{' '}
              <span className="font-semibold">AED {filteredTotal.toLocaleString()}</span>
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedProperty('all');
                setSearchQuery('');
              }}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Add Expense</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-4">
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
                  placeholder="e.g., Kitchen faucet replacement"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Property */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property *
                </label>
                <select
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select property</option>
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
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (AED) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  placeholder="0"
                  min={0}
                  step={0.01}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={
                    formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''
                  }
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Vendor Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Type
                </label>
                <select
                  name="vendorType"
                  value={formData.vendorType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="external">External Vendor</option>
                  <option value="homezy">Homezy Professional</option>
                </select>
              </div>

              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Home Centre"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                {isSubmitting ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Receipt className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' || selectedProperty !== 'all'
              ? 'No expenses match your filters. Try adjusting your search criteria.'
              : 'Start tracking your home expenses to see where your money goes.'}
          </p>
          {!searchQuery && selectedCategory === 'all' && selectedProperty === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Your First Expense
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => {
            const config = expenseCategoryConfig[expense.category];
            const CategoryIcon = getCategoryIcon(expense.category);

            return (
              <div
                key={expense.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${config?.bgColor || 'bg-gray-100'}`}>
                      <CategoryIcon className={`h-5 w-5 ${config?.color || 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{expense.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${config?.bgColor} ${config?.color}`}
                        >
                          {getCategoryLabel(expense.category)}
                        </span>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {expense.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{getPropertyName(expense.propertyId)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(expense.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {expense.vendorName && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>
                              {expense.vendorType === 'homezy' ? 'Homezy: ' : ''}
                              {expense.vendorName}
                            </span>
                          </>
                        )}
                      </div>
                      {expense.tags && expense.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {expense.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Amount */}
                    <p className="text-lg font-semibold text-gray-900">
                      AED {expense.amount.toLocaleString()}
                    </p>

                    {/* Action Menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuOpen(actionMenuOpen === expense.id ? null : expense.id)
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>

                      {actionMenuOpen === expense.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={() => handleDelete(expense.id)}
                              disabled={deletingId === expense.id}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === expense.id ? (
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
