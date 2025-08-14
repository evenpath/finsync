
// src/components/admin/PartnerCard.tsx
import React from 'react';
import type { Partner } from '../../lib/types';
import { Card, CardContent } from '../ui/card';
import { Building } from 'lucide-react';

interface PartnerCardProps {
  partner: Partner;
  isSelected: boolean;
  onSelect: () => void;
}

export default function PartnerCard({ partner, isSelected, onSelect }: PartnerCardProps) {
  const industryIcon = partner.industry?.icon || <Building className="w-5 h-5 text-muted-foreground" />;
  
  return (
    <Card 
      className={`transition-all cursor-pointer ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-secondary/50'}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg`}>
              {industryIcon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{partner.name}</h3>
              <p className="text-sm text-muted-foreground">{partner.industry?.name || 'No Industry Set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {partner.status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
