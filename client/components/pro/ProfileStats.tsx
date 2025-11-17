import React from 'react';
import { Star, MessageSquare, Clock, TrendingUp, Award } from 'lucide-react';

interface ProfileStatsProps {
  rating: number;
  reviewCount: number;
  responseTimeHours: number;
  projectsCompleted: number;
  quoteAcceptanceRate?: number;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export function ProfileStats({
  rating,
  reviewCount,
  responseTimeHours,
  projectsCompleted,
  quoteAcceptanceRate,
  layout = 'horizontal',
  className = '',
}: ProfileStatsProps) {
  const stats = [
    {
      icon: Star,
      label: 'Rating',
      value: rating > 0 ? rating.toFixed(1) : 'New',
      suffix: rating > 0 ? `(${reviewCount} reviews)` : '',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: responseTimeHours < 24
        ? `${responseTimeHours} hrs`
        : `${Math.round(responseTimeHours / 24)} days`,
      suffix: '',
      color: 'text-neutral-900',
      bgColor: 'bg-primary-50',
    },
    {
      icon: Award,
      label: 'Projects',
      value: projectsCompleted.toString(),
      suffix: 'completed',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  if (quoteAcceptanceRate !== undefined && quoteAcceptanceRate > 0) {
    stats.push({
      icon: TrendingUp,
      label: 'Acceptance Rate',
      value: `${quoteAcceptanceRate}%`,
      suffix: '',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    });
  }

  if (layout === 'vertical') {
    return (
      <div className={`space-y-3 ${className}`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${stat.bgColor}`}
            >
              <Icon className={`h-5 w-5 ${stat.color}`} />
              <div className="flex-1">
                <p className="text-xs text-gray-600">{stat.label}</p>
                <p className="text-base font-semibold text-gray-900">
                  {stat.value} {stat.suffix && <span className="text-xs font-normal text-gray-600">{stat.suffix}</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${stat.bgColor}`}
          >
            <Icon className={`h-4 w-4 ${stat.color}`} />
            <div>
              <span className="font-semibold text-gray-900">{stat.value}</span>
              {stat.suffix && (
                <span className="text-sm text-gray-600 ml-1">{stat.suffix}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProfileStats;
