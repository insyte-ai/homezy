// @ts-nocheck - Temporary: disable type checking for initial implementation
import { Expense, IExpense } from '../models/Expense.model';
import mongoose from 'mongoose';
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseCategory,
} from '@homezy/shared';

/**
 * Create a new expense
 */
export async function createExpense(
  homeownerId: string,
  input: CreateExpenseInput
): Promise<IExpense> {
  const expense = new Expense({
    homeownerId,
    propertyId: input.propertyId,
    projectId: input.projectId,
    serviceHistoryId: input.serviceHistoryId,
    title: input.title,
    description: input.description,
    category: input.category,
    amount: input.amount,
    currency: 'AED',
    date: input.date || new Date(),
    vendorType: input.vendorType,
    vendorName: input.vendorName,
    receiptUrl: input.receiptUrl,
    documents: input.documents || [],
    tags: input.tags || [],
  });

  await expense.save();
  return expense;
}

/**
 * Get an expense by ID
 */
export async function getExpenseById(
  expenseId: string,
  homeownerId: string
): Promise<IExpense | null> {
  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    return null;
  }
  return Expense.findOne({ _id: expenseId, homeownerId });
}

/**
 * Get all expenses for a homeowner
 */
export async function getHomeownerExpenses(
  homeownerId: string,
  options: {
    propertyId?: string;
    projectId?: string;
    category?: ExpenseCategory;
    vendorType?: 'homezy' | 'external';
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ expenses: IExpense[]; total: number }> {
  const query: any = { homeownerId };

  if (options.propertyId) query.propertyId = options.propertyId;
  if (options.projectId) query.projectId = options.projectId;
  if (options.category) query.category = options.category;
  if (options.vendorType) query.vendorType = options.vendorType;
  if (options.startDate || options.endDate) {
    query.date = {};
    if (options.startDate) query.date.$gte = options.startDate;
    if (options.endDate) query.date.$lte = options.endDate;
  }
  if (options.minAmount !== undefined || options.maxAmount !== undefined) {
    query.amount = {};
    if (options.minAmount !== undefined) query.amount.$gte = options.minAmount;
    if (options.maxAmount !== undefined) query.amount.$lte = options.maxAmount;
  }
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }

  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .sort({ date: -1 })
      .skip(options.offset || 0)
      .limit(options.limit || 20),
    Expense.countDocuments(query),
  ]);

  return { expenses, total };
}

/**
 * Get expense summary (total amount, count, avg)
 */
export async function getExpenseSummary(
  homeownerId: string,
  options: {
    propertyId?: string;
    startDate?: Date;
    endDate?: Date;
    year?: number;
  } = {}
): Promise<{
  totalAmount: number;
  expenseCount: number;
  averageExpense: number;
  byCategory: { category: string; amount: number; count: number }[];
}> {
  const match: any = { homeownerId };

  if (options.propertyId) match.propertyId = options.propertyId;
  if (options.startDate || options.endDate) {
    match.date = {};
    if (options.startDate) match.date.$gte = options.startDate;
    if (options.endDate) match.date.$lte = options.endDate;
  }
  if (options.year) {
    match.date = {
      $gte: new Date(options.year, 0, 1),
      $lt: new Date(options.year + 1, 0, 1),
    };
  }

  const [totalResult, categoryResult] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          expenseCount: { $sum: 1 },
          averageExpense: { $avg: '$amount' },
        },
      },
    ]),
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]),
  ]);

  const totals = totalResult[0] || { totalAmount: 0, expenseCount: 0, averageExpense: 0 };

  return {
    totalAmount: totals.totalAmount,
    expenseCount: totals.expenseCount,
    averageExpense: Math.round(totals.averageExpense * 100) / 100,
    byCategory: categoryResult.map(item => ({
      category: item._id,
      amount: item.amount,
      count: item.count,
    })),
  };
}

/**
 * Get expenses grouped by category
 */
export async function getExpensesByCategory(
  homeownerId: string,
  options: {
    propertyId?: string;
    year?: number;
  } = {}
): Promise<{ category: string; amount: number; count: number; percentage: number }[]> {
  const match: any = { homeownerId };

  if (options.propertyId) match.propertyId = options.propertyId;
  if (options.year) {
    match.date = {
      $gte: new Date(options.year, 0, 1),
      $lt: new Date(options.year + 1, 0, 1),
    };
  }

  const [totalResult, categoryResult] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]),
  ]);

  const total = totalResult[0]?.total || 0;

  return categoryResult.map(item => ({
    category: item._id,
    amount: item.amount,
    count: item.count,
    percentage: total > 0 ? Math.round((item.amount / total) * 100 * 10) / 10 : 0,
  }));
}

/**
 * Get expenses grouped by month
 */
export async function getExpensesByMonth(
  homeownerId: string,
  options: {
    propertyId?: string;
    year?: number;
  } = {}
): Promise<{ month: number; year: number; amount: number; count: number }[]> {
  const match: any = { homeownerId };

  if (options.propertyId) match.propertyId = options.propertyId;
  if (options.year) {
    match.date = {
      $gte: new Date(options.year, 0, 1),
      $lt: new Date(options.year + 1, 0, 1),
    };
  }

  const result = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
  ]);

  return result.map(item => ({
    month: item._id.month,
    year: item._id.year,
    amount: item.amount,
    count: item.count,
  }));
}

/**
 * Get expense trends (comparison with previous period)
 */
export async function getExpenseTrends(
  homeownerId: string,
  options: {
    propertyId?: string;
    months?: number;
  } = {}
): Promise<{
  currentPeriod: { amount: number; count: number };
  previousPeriod: { amount: number; count: number };
  changePercent: number;
}> {
  const months = options.months || 3;
  const now = new Date();
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth() - months, 1);
  const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - (months * 2), 1);
  const previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);

  const match: any = { homeownerId };
  if (options.propertyId) match.propertyId = options.propertyId;

  const [currentResult, previousResult] = await Promise.all([
    Expense.aggregate([
      { $match: { ...match, date: { $gte: currentPeriodStart, $lte: now } } },
      { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate([
      { $match: { ...match, date: { $gte: previousPeriodStart, $lte: previousPeriodEnd } } },
      { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const current = currentResult[0] || { amount: 0, count: 0 };
  const previous = previousResult[0] || { amount: 0, count: 0 };

  const changePercent = previous.amount > 0
    ? Math.round(((current.amount - previous.amount) / previous.amount) * 100 * 10) / 10
    : current.amount > 0 ? 100 : 0;

  return {
    currentPeriod: { amount: current.amount, count: current.count },
    previousPeriod: { amount: previous.amount, count: previous.count },
    changePercent,
  };
}

/**
 * Update an expense
 */
export async function updateExpense(
  expenseId: string,
  homeownerId: string,
  input: UpdateExpenseInput
): Promise<IExpense | null> {
  const expense = await Expense.findOne({ _id: expenseId, homeownerId });

  if (!expense) {
    return null;
  }

  if (input.title !== undefined) expense.title = input.title;
  if (input.description !== undefined) expense.description = input.description;
  if (input.category !== undefined) expense.category = input.category as any;
  if (input.amount !== undefined) expense.amount = input.amount;
  if (input.date !== undefined) expense.date = input.date;
  if (input.vendorType !== undefined) expense.vendorType = input.vendorType as any;
  if (input.vendorName !== undefined) expense.vendorName = input.vendorName;
  if (input.receiptUrl !== undefined) expense.receiptUrl = input.receiptUrl;
  if (input.documents !== undefined) expense.documents = input.documents;
  if (input.tags !== undefined) expense.tags = input.tags;

  await expense.save();
  return expense;
}

/**
 * Delete an expense
 */
export async function deleteExpense(
  expenseId: string,
  homeownerId: string
): Promise<boolean> {
  const result = await Expense.deleteOne({ _id: expenseId, homeownerId });
  return result.deletedCount > 0;
}

/**
 * Create expense from accepted quote
 * (Called when a quote is accepted/paid)
 */
export async function createFromQuote(
  homeownerId: string,
  quoteData: {
    quoteId: string;
    projectId?: string;
    title: string;
    description?: string;
    category: ExpenseCategory;
    amount: number;
    professionalName: string;
    propertyId?: string;
    date?: Date;
  }
): Promise<IExpense> {
  return createExpense(homeownerId, {
    propertyId: quoteData.propertyId,
    projectId: quoteData.projectId,
    title: quoteData.title,
    description: quoteData.description || `Payment for quote #${quoteData.quoteId}`,
    category: quoteData.category,
    amount: quoteData.amount,
    date: quoteData.date || new Date(),
    vendorType: 'homezy',
    vendorName: quoteData.professionalName,
    tags: ['quote', quoteData.quoteId],
  });
}
