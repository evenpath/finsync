// src/components/admin/Step.tsx
import React from 'react';
import type { WorkflowStep } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, GripVertical, Trash2 } from 'lucide-react';
import { stepIcons } from './step-icons';

interface StepProps {
  step: WorkflowStep;
  index: number;
  onDelete: (id: string) => void;
  isNested?: boolean;
}

const Step: React.FC<StepProps> = ({ step, index, onDelete, isNested = false }) => {
  const Icon = stepIcons[step.type] || stepIcons.default;

  return (
    <div className={`flex items-start gap-4 ${isNested ? 'ml-6' : ''}`}>
      {!isNested && (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary font-bold">
            {index + 1}
          </div>
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
