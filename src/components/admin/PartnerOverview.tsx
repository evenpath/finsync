
// src/components/admin/PartnerOverview.tsx
import React from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap, CheckCircle, TrendingUp, Clock, BarChart } from 'lucide-react';

interface PartnerOverviewProps {
  partner: Partner;
}

export default function PartnerOverview({ partner }: PartnerOverviewProps) {
  const stats = [
    {
      icon: Zap,
      title: 'Active Workflows',
      value: partner.stats.activeWorkflows,
      description: `${partner.stats.totalExecutions} total executions`,
      color: 'blue'
    },
    {
      icon: CheckCircle,
      title: 'Success Rate',
      value: `${partner.stats.successRate}%`,
      description: 'Of all executions',
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Average ROI',
      value: `${partner.stats.avgROI}%`,
      description: 'Return on investment',
      color: 'purple'
    },
    {
      icon: Clock,
      title: 'Time Saved',
      value: partner.stats.timeSaved,
      description: 'Across all workflows',
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map(stat => {
        const Icon = stat.icon;
        const colorClasses: Record<string, string> = {
            blue: 'text-blue-500',
            green: 'text-green-500',
            purple: 'text-purple-500',
            orange: 'text-orange-500',
        };
        const valueColorClasses: Record<string, string> = {
            blue: 'text-blue-600',
            green: 'text-green-600',
            purple: 'text-purple-600',
            orange: 'text-orange-600',
        };
        return (
          <Card key={stat.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${colorClasses[stat.color]}`} />
                <CardTitle className="text-base font-semibold text-gray-900">{stat.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${valueColorClasses[stat.color]}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
