// src/components/admin/PartnerOverview.tsx
import React from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap, CheckCircle, TrendingUp, Clock, BarChart } from 'lucide-react';

interface PartnerOverviewProps {
  partner: Partner;
}

const StatCard = ({ title, value, icon: Icon, change, changeColor }: { title: string, value: string | number, icon: React.ElementType, change?: string, changeColor?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="w-4 h-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && <p className={`text-xs ${changeColor || 'text-muted-foreground'}`}>{change}</p>}
    </CardContent>
  </Card>
);


export default function PartnerOverview({ partner }: PartnerOverviewProps) {
  if (!partner.stats) {
    return (
        <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
                <BarChart className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Stats Available</h3>
                <p>Usage statistics for this partner will appear here once they are available.</p>
            </CardContent>
        </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Active Workflows" 
            value={partner.stats.activeWorkflows} 
            icon={Zap} 
        />
        <StatCard 
            title="Total Executions" 
            value={partner.stats.totalExecutions.toLocaleString()} 
            icon={Clock} 
        />
        <StatCard 
            title="Success Rate" 
            value={`${partner.stats.successRate}%`} 
            icon={CheckCircle}
            changeColor="text-green-600"
        />
        <StatCard 
            title="Avg. ROI" 
            value={`${partner.stats.avgROI}%`} 
            icon={TrendingUp}
            changeColor="text-green-600"
        />
    </div>
  );
}