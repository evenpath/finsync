
// src/components/admin/PartnerOverview.tsx
import React from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap, CheckCircle, TrendingUp, Clock } from 'lucide-react';

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
      description: 'Above industry average',
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
      value: partner.stats.timeSaved.split(' ')[0],
      description: 'hours per month',
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 text-${stat.color}-500`} />
                <CardTitle className="text-base font-semibold text-gray-900">{stat.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
