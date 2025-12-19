/**
 * Expenses API Service
 * Handles all expense-related API calls
 */

import { api } from './api';

// ============================================================================
// Types
// ============================================================================

export type ExpenseCategory = 'renovation' | 'repair' | 'maintenance' | 'utilities' | 'appliance' | 'furniture' | 'decor' | 'cleaning' | 'security' | 'landscaping' | 'permits' | 'other';
export type ProviderType = 'homezy' | 'external';

export interface ExpenseDocument {
  id: string;
  type: 'receipt' | 'invoice' | 'contract' | 'other';
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface Expense {
  id: string;
  homeownerId: string;
  propertyId: string;
  projectId?: string;
  homeProjectId?: string;
  serviceHistoryId?: string;
  title: string;
  description?: string;
  category: ExpenseCategory;
  amount: number;
  currency: 'AED';
  date: string;
  vendorType: ProviderType;
  vendorName?: string;
  professionalId?: string;
  receiptUrl?: string;
  documents: ExpenseDocument[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Input Types
// ============================================================================

export interface CreateExpenseInput {
  propertyId: string;
  homeProjectId?: string;
  serviceHistoryId?: string;
  title: string;
  description?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  vendorType: ProviderType;
  vendorName?: string;
  receiptUrl?: string;
  documents?: Omit<ExpenseDocument, 'id' | 'uploadedAt'>[];
  tags?: string[];
}

export interface UpdateExpenseInput {
  title?: string;
  description?: string;
  category?: ExpenseCategory;
  amount?: number;
  date?: string;
  vendorType?: ProviderType;
  vendorName?: string;
  receiptUrl?: string;
  tags?: string[];
}

export interface ExpenseListParams {
  propertyId?: string;
  projectId?: string;
  category?: ExpenseCategory;
  vendorType?: ProviderType;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

interface ExpenseResponse {
  success: boolean;
  data: {
    expense: Expense;
  };
}

interface ExpenseListResponse {
  success: boolean;
  data: {
    expenses: Expense[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  averageExpense: number;
  byCategory: { category: string; amount: number; count: number }[];
}

interface ExpenseSummaryResponse {
  success: boolean;
  data: ExpenseSummary;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface CategoryBreakdownResponse {
  success: boolean;
  data: {
    categories: CategoryBreakdown[];
  };
}

export interface MonthlyBreakdown {
  month: number;
  year: number;
  amount: number;
  count: number;
}

interface MonthlyBreakdownResponse {
  success: boolean;
  data: {
    months: MonthlyBreakdown[];
  };
}

export interface ExpenseTrends {
  currentPeriod: { amount: number; count: number };
  previousPeriod: { amount: number; count: number };
  changePercent: number;
}

interface ExpenseTrendsResponse {
  success: boolean;
  data: ExpenseTrends;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new expense
 */
export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const response = await api.post<ExpenseResponse>('/expenses', input);
  return response.data.data.expense;
}

/**
 * Get all expenses for the authenticated user
 */
export async function getMyExpenses(
  params?: ExpenseListParams
): Promise<{ expenses: Expense[]; total: number }> {
  const response = await api.get<ExpenseListResponse>('/expenses', { params });
  return {
    expenses: response.data.data.expenses,
    total: response.data.data.total,
  };
}

/**
 * Get an expense by ID
 */
export async function getExpenseById(id: string): Promise<Expense> {
  const response = await api.get<ExpenseResponse>(`/expenses/${id}`);
  return response.data.data.expense;
}

/**
 * Get expense summary
 */
export async function getExpenseSummary(
  params?: { propertyId?: string; year?: number }
): Promise<ExpenseSummary> {
  const response = await api.get<ExpenseSummaryResponse>('/expenses/summary', { params });
  return response.data.data;
}

/**
 * Get expenses grouped by category
 */
export async function getExpensesByCategory(
  params?: { propertyId?: string; year?: number }
): Promise<CategoryBreakdown[]> {
  const response = await api.get<CategoryBreakdownResponse>('/expenses/by-category', { params });
  return response.data.data.categories;
}

/**
 * Get expenses grouped by month
 */
export async function getExpensesByMonth(
  params?: { propertyId?: string; year?: number }
): Promise<MonthlyBreakdown[]> {
  const response = await api.get<MonthlyBreakdownResponse>('/expenses/by-month', { params });
  return response.data.data.months;
}

/**
 * Get expense trends
 */
export async function getExpenseTrends(
  params?: { propertyId?: string; months?: number }
): Promise<ExpenseTrends> {
  const response = await api.get<ExpenseTrendsResponse>('/expenses/trends', { params });
  return response.data.data;
}

/**
 * Update an expense
 */
export async function updateExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<Expense> {
  const response = await api.patch<ExpenseResponse>(`/expenses/${id}`, input);
  return response.data.data.expense;
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}

// ============================================================================
// Helper Configuration
// ============================================================================

export const expenseCategoryConfig: Record<ExpenseCategory, { label: string; icon: string; color: string; bgColor: string }> = {
  renovation: { label: 'Renovation', icon: 'build', color: '#E11D48', bgColor: '#FFF1F2' },
  repair: { label: 'Repair', icon: 'construct', color: '#EA580C', bgColor: '#FFF7ED' },
  maintenance: { label: 'Maintenance', icon: 'settings', color: '#3B82F6', bgColor: '#EFF6FF' },
  utilities: { label: 'Utilities', icon: 'flash', color: '#F59E0B', bgColor: '#FFFBEB' },
  appliance: { label: 'Appliance', icon: 'cube', color: '#475569', bgColor: '#F1F5F9' },
  furniture: { label: 'Furniture', icon: 'bed', color: '#D97706', bgColor: '#FFFBEB' },
  decor: { label: 'Decor', icon: 'color-palette', color: '#8B5CF6', bgColor: '#F5F3FF' },
  cleaning: { label: 'Cleaning', icon: 'sparkles', color: '#14B8A6', bgColor: '#CCFBF1' },
  security: { label: 'Security', icon: 'shield-checkmark', color: '#6366F1', bgColor: '#EEF2FF' },
  landscaping: { label: 'Landscaping', icon: 'leaf', color: '#16A34A', bgColor: '#DCFCE7' },
  permits: { label: 'Permits', icon: 'document-text', color: '#6B7280', bgColor: '#F3F4F6' },
  other: { label: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280', bgColor: '#F3F4F6' },
};

export const providerTypeConfig: Record<ProviderType, { label: string; icon: string }> = {
  homezy: { label: 'Homezy Pro', icon: 'shield-checkmark' },
  external: { label: 'External', icon: 'person' },
};
