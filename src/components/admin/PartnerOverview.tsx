
// src/components/admin/PartnerOverview.tsx
import React from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap, CheckCircle, TrendingUp, Clock, BarChart } from 'lucide-react';

interface PartnerOverviewProps {
  partner: Partner;
}

export default function PartnerOverview({ partner }: PartnerOverviewProps) {
  // The stats have been removed as per the user's request.
  // This component can be repurposed or extended later if needed.
  return (
    <div>
      {/* The statistics cards were previously here. */}
    </div>
  );
}
