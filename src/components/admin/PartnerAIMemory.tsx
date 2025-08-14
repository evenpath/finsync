
// src/components/admin/PartnerAIMemory.tsx
"use client";

import React, { useState } from 'react';
import type { Partner } from '../../lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, MessageSquare, Target, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import AIQuestionDialog from './AIQuestionDialog';

interface PartnerAIMemoryProps {
  partner: Partner;
}

export default function PartnerAIMemory({ partner }: PartnerAIMemoryProps) {
  const [showAIDialog, setShowAIDialog] = useState(false);
  
  if (!partner.aiMemory) return <div>No AI Memory data available.</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Business Understanding
            </CardTitle>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {partner.aiProfileCompleteness}% Complete
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed mb-4">{partner.aiMemory.businessUnderstanding}</p>
          <Button onClick={() => setShowAIDialog(true)} className="bg-purple-600 hover:bg-purple-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask AI Questions
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-blue-500" />Key Business Insights</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {partner.aiMemory.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">{insight}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" />Success Patterns</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{partner.aiMemory.successPatterns}</p>
            <h5 className="font-medium text-foreground mb-2">Workflow Preferences</h5>
            <p className="text-sm text-muted-foreground">{partner.aiMemory.workflowPreferences}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500" />Concerns & Risk Factors</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{partner.aiMemory.concernsRisks}</p>
          </CardContent>
        </Card>
      </div>
      
      <AIQuestionDialog 
        isOpen={showAIDialog} 
        onClose={() => setShowAIDialog(false)} 
        partnerName={partner.name}
      />
    </div>
  );
}
