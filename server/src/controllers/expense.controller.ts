import { Request, Response, NextFunction } from 'express';
import * as expenseService from '../services/expense.service';
import { NotFoundError } from '../middleware/errorHandler.middleware';

/**
 * Create a new expense
 * POST /api/expenses
 */
export async function createExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const expense = await expenseService.createExpense(userId, req.body);

    res.status(201).json({
      success: true,
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all expenses for the authenticated user
 * GET /api/expenses
 */
export async function getMyExpenses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const {
      propertyId,
      projectId,
      category,
      vendorType,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      tags,
      limit,
      offset,
    } = req.query;

    const result = await expenseService.getHomeownerExpenses(userId, {
      propertyId: propertyId as string,
      projectId: projectId as string,
      category: category as any,
      vendorType: vendorType as 'homezy' | 'external',
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
      tags: tags ? (tags as string).split(',') : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: {
        expenses: result.expenses,
        total: result.total,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get an expense by ID
 * GET /api/expenses/:id
 */
export async function getExpenseById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const expense = await expenseService.getExpenseById(id, userId);

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    res.json({
      success: true,
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get expense summary
 * GET /api/expenses/summary
 */
export async function getExpenseSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, startDate, endDate, year } = req.query;

    const summary = await expenseService.getExpenseSummary(userId, {
      propertyId: propertyId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      year: year ? parseInt(year as string) : undefined,
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get expenses grouped by category
 * GET /api/expenses/by-category
 */
export async function getExpensesByCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, year } = req.query;

    const categories = await expenseService.getExpensesByCategory(userId, {
      propertyId: propertyId as string,
      year: year ? parseInt(year as string) : undefined,
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get expenses grouped by month
 * GET /api/expenses/by-month
 */
export async function getExpensesByMonth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, year } = req.query;

    const months = await expenseService.getExpensesByMonth(userId, {
      propertyId: propertyId as string,
      year: year ? parseInt(year as string) : undefined,
    });

    res.json({
      success: true,
      data: { months },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get expense trends
 * GET /api/expenses/trends
 */
export async function getExpenseTrends(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, months } = req.query;

    const trends = await expenseService.getExpenseTrends(userId, {
      propertyId: propertyId as string,
      months: months ? parseInt(months as string) : undefined,
    });

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an expense
 * PATCH /api/expenses/:id
 */
export async function updateExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const expense = await expenseService.updateExpense(id, userId, req.body);

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    res.json({
      success: true,
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an expense
 * DELETE /api/expenses/:id
 */
export async function deleteExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await expenseService.deleteExpense(id, userId);

    if (!deleted) {
      throw new NotFoundError('Expense not found');
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
