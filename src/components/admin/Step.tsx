// src/components/admin/Step.tsx
import React, { useState } from 'react';
import type { WorkflowStep } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, GripVertical, Trash2, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { stepIcons } from './step-icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

interface StepProps {
  step: WorkflowStep;
  index: number;
  onDelete: (id: string) => void;
  onUpdate: (stepId: string, updatedData: any) => void;
  isNested?: boolean;
}

const Step: React.FC<StepProps> = ({ step, index, onDelete, onUpdate, isNested = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = stepIcons[step.type] || stepIcons.default;
  
  const handleConfigChange = (field: string, value: any) => {
    onUpdate(step.id, {
      config: {
        ...step.configuration,
        [field]: value
      }
    });
  }

  const renderConfigOptions = () => {
    switch(step.type) {
      case 'trigger_incoming_email':
        return (
          <div>
            <Label>Target Email Address</Label>
            <Input 
              placeholder="e.g., support@yourcompany.com"
              value={step.configuration?.emailAddress || ''}
              onChange={(e) => handleConfigChange('emailAddress', e.target.value)}
            />
          </div>
        );
      case 'human_input':
        return (
           <div>
            <Label>Instructions for Human</Label>
            <Textarea 
              placeholder="e.g., Review the customer request and decide on the next step."
              value={step.configuration?.instructions || ''}
              onChange={(e) => handleConfigChange('instructions', e.target.value)}
            />
          </div>
        )
      default:
        return <p className="text-sm text-muted-foreground">This step is fully configured.</p>;
    }
  }

  return (
    <div className={`flex items-start gap-4 ${isNested ? 'ml-6' : ''}`}>
      {!isNested && (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary font-bold">
            {index + 1}
          </div>
          {step.branches && <div className="w-px h-full bg-border my-2"></div>}
        </div>
      )}
      
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
            <Icon className="w-5 h-5 text-primary" />
            <CardTitle className="text-base font-semibold">{step.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {step.isConfigured && <Check className="w-5 h-5 text-green-500" />}
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onDelete(step.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">{step.description}</p>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Configuration</h4>
              <div className="space-y-4">
                {renderConfigOptions()}
              </div>
            </div>
          )}

          {step.branches && step.branches.length > 0 && (
            <div className="mt-4 space-y-4">
              {step.branches.map((branch, branchIndex) => (
                <div key={branchIndex} className="p-4 bg-secondary rounded-lg">
                  <p className="font-semibold text-foreground mb-2">{branch.condition}</p>
                  <div className="space-y-2">
                    {branch.steps.map((nestedStep, nestedIndex) => (
                      <div key={nestedIndex} className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-background rounded">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{nestedIndex + 1}</span>
                        <Icon className="w-4 h-4 text-primary" />
                        <span>{nestedStep.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Step;
