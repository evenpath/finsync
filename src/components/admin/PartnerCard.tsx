
// src/components/admin/PartnerCard.tsx
import React from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Zap, TrendingUp, Brain } from 'lucide-react';

interface PartnerCardProps {
  partner: Partner;
  isSelected: boolean;
  onSelect: () => void;
}

export default function PartnerCard({ partner, isSelected, onSelect }: PartnerCardProps) {
  const industry = partner.industry || { name: 'N/A', icon: '🏢', color: 'gray' };
  
  return (
    <Card 
      className={`hover:shadow-md transition-all cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg`}>
              {industry.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{partner.name}</h3>
              <p className="text-sm text-muted-foreground">{partner.contactPerson}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {partner.status}
            </span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1" title="Active Workflows">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{partner.stats.activeWorkflows}</span>
            </div>
            <div className="flex items-center gap-1" title="Success Rate">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">{partner.stats.successRate}%</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600">ROI: {partner.stats.avgROI}%</p>
            <p className="text-xs text-muted-foreground">{partner.stats.timeSaved} saved</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">AI Profile: {partner.aiProfileCompleteness}%</span>
            <div className="w-24 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-purple-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${partner.aiProfileCompleteness}%` }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Joined {new Date(partner.joinedDate).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
