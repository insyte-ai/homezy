import { api } from '../api';

// Interfaces
export interface CreditBalance {
  totalCredits: number;
  freeCredits: number;
  paidCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastResetDate?: string;
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'lead_claim' | 'refund' | 'admin_addition' | 'admin_deduction';
  amount: number;
  balance: number;
  description?: string;
  leadId?: string;
  createdAt: string;
}

export interface CreditPurchase {
  id: string;
  packageId: string;
  packageName: string;
  creditsAmount: number;
  priceAED: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  priceAED: number;
  perCreditCost: number;
  popular?: boolean;
}

export interface BalanceResponse {
  success: boolean;
  data: {
    balance: CreditBalance;
    expiringCredits?: Array<{
      credits: number;
      daysUntilExpiry: number;
      expiresAt: string;
    }>;
  };
}

export interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: CreditTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface PurchasesResponse {
  success: boolean;
  data: {
    purchases: CreditPurchase[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface PackagesResponse {
  success: boolean;
  data: {
    packages: CreditPackage[];
  };
}

export interface CheckoutResponse {
  success: boolean;
  data: {
    checkoutUrl: string;
    sessionId: string;
  };
}

/**
 * Get credit balance
 */
export const getBalance = async (): Promise<BalanceResponse['data']> => {
  const response = await api.get<BalanceResponse>('/credits/balance');
  return response.data.data;
};

/**
 * Get transaction history
 */
export const getTransactions = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<TransactionsResponse['data']> => {
  const response = await api.get<TransactionsResponse>('/credits/transactions', { params });
  return response.data.data;
};

/**
 * Get purchase history
 */
export const getPurchases = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PurchasesResponse['data']> => {
  const response = await api.get<PurchasesResponse>('/credits/purchases', { params });
  return response.data.data;
};

/**
 * Get available packages
 */
export const getPackages = async (): Promise<CreditPackage[]> => {
  const response = await api.get<PackagesResponse>('/credits/packages');
  return response.data.data.packages;
};

/**
 * Create Stripe checkout session
 */
export const createCheckout = async (packageId: string): Promise<CheckoutResponse['data']> => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const successUrl = `${baseUrl}/pro/dashboard/credits?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/pro/dashboard/credits`;

  const response = await api.post<CheckoutResponse>('/credits/checkout', {
    packageId,
    successUrl,
    cancelUrl,
  });
  return response.data.data;
};

export interface VerifySessionResponse {
  success: boolean;
  message: string;
  data: {
    credits: number;
    alreadyCompleted: boolean;
  };
}

/**
 * Verify and complete checkout session (fallback for webhook)
 */
export const verifyCheckoutSession = async (sessionId: string): Promise<VerifySessionResponse['data']> => {
  const response = await api.post<VerifySessionResponse>('/credits/verify-session', { sessionId });
  return response.data.data;
};

export default {
  getBalance,
  getTransactions,
  getPurchases,
  getPackages,
  createCheckout,
  verifyCheckoutSession,
};
