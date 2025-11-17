import api from './api';

export interface ProAnalytics {
  overview: {
    claimedLeads: {
      total: number;
      last7Days: number;
      change: number;
    };
    creditBalance: {
      total: number;
      paid: number;
      free: number;
    };
    activeQuotes: number;
    projectsCompleted: number;
  };
  quotes: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
    avgValue: number;
    last7Days: number;
  };
  revenue: {
    total: number;
    lastMonth: number;
    change: number;
  };
  performance: {
    responseTimeHours: number;
    projectsCompleted: number;
    rating: number;
    reviewCount: number;
  };
  recentActivity: {
    transactions: Array<{
      _id: string;
      type: 'purchase' | 'spend' | 'refund' | 'bonus';
      amount: number;
      creditType: 'free' | 'paid';
      balanceBefore: number;
      balanceAfter: number;
      description: string;
      createdAt: string;
    }>;
  };
}

/**
 * Get professional analytics data
 */
export async function getProAnalytics(): Promise<ProAnalytics> {
  const { data } = await api.get('/pros/me/analytics');
  return data.data;
}
