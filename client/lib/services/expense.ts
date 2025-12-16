import { api } from '../api';
import type {
  Expense,
  ExpenseCategory,
  ProviderType,
  ExpenseDocument,
  CreateExpenseInput,
  UpdateExpenseInput,
} from '@homezy/shared';

// Re-export types
export type {
  Expense,
  ExpenseCategory,
  ProviderType,
  ExpenseDocument,
  CreateExpenseInput,
  UpdateExpenseInput,
};

// ============================================================================
// Query Types
// ============================================================================

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

interface ExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  averageExpense: number;
  byCategory: { category: string; amount: number; count: number }[];
}

interface ExpenseSummaryResponse {
  success: boolean;
  data: ExpenseSummary;
}

interface CategoryBreakdown {
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

interface MonthlyBreakdown {
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

interface ExpenseTrends {
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
  const response = await api.get<ExpenseSummaryResponse>('/expenses/summary', {
    params,
  });
  return response.data.data;
}

/**
 * Get expenses grouped by category
 */
export async function getExpensesByCategory(
  params?: { propertyId?: string; year?: number }
): Promise<CategoryBreakdown[]> {
  const response = await api.get<CategoryBreakdownResponse>(
    '/expenses/by-category',
    { params }
  );
  return response.data.data.categories;
}

/**
 * Get expenses grouped by month
 */
export async function getExpensesByMonth(
  params?: { propertyId?: string; year?: number }
): Promise<MonthlyBreakdown[]> {
  const response = await api.get<MonthlyBreakdownResponse>(
    '/expenses/by-month',
    { params }
  );
  return response.data.data.months;
}

/**
 * Get expense trends
 */
export async function getExpenseTrends(
  params?: { propertyId?: string; months?: number }
): Promise<ExpenseTrends> {
  const response = await api.get<ExpenseTrendsResponse>('/expenses/trends', {
    params,
  });
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

export const expenseCategoryConfig: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  renovation: { label: 'Renovation', icon: 'HardHat', color: 'text-rose-600', bgColor: 'bg-rose-100' },
  repair: { label: 'Repair', icon: 'Wrench', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  maintenance: { label: 'Maintenance', icon: 'Settings', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  utilities: { label: 'Utilities', icon: 'Zap', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  appliance: { label: 'Appliance', icon: 'Refrigerator', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  furniture: { label: 'Furniture', icon: 'Sofa', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  decor: { label: 'Decor', icon: 'Palette', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  cleaning: { label: 'Cleaning', icon: 'Sparkles', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  security: { label: 'Security', icon: 'Shield', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  landscaping: { label: 'Landscaping', icon: 'Trees', color: 'text-green-600', bgColor: 'bg-green-100' },
  permits: { label: 'Permits', icon: 'FileText', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  other: { label: 'Other', icon: 'MoreHorizontal', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};
