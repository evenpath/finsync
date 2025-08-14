
"use client";

import type { WorkflowTemplate } from "../../lib/types";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../shared/Badge";
import { Star } from "lucide-react";


interface TemplateCardProps {
  template: WorkflowTemplate;
  onDeploy: (template: WorkflowTemplate) => void;
  isRecommended?: boolean;
  showMetrics?: boolean;
}

export default function TemplateCard({ 
  template, 
  onDeploy, 
  isRecommended = false,
  showMetrics = true 
}: TemplateCardProps) {
  return (
    <Card className={`transition-all hover:shadow-lg flex flex-col ${isRecommended ? 'ring-2 ring-blue-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{template.icon}</div>
            <div>
              <CardTitle className="text-lg leading-tight">{template.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {template.templateType === 'ready' && (
                  <Badge variant="success" className="bg-green-100 text-green-800">
                    Ready
                  </Badge>
                )}
                {template.templateType === 'ai_generated' && (
                  <Badge variant="purple" className="bg-purple-100 text-purple-800">
                    AI Generated
                  </Badge>
                )}
                <Badge variant="outline">{template.complexity}</Badge>
              </div>
            </div>
          </div>
          {isRecommended && (
            <Badge className="bg-blue-600 text-white">Recommended</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-grow">
        <p className="text-sm text-muted-foreground h-16">{template.description}</p>
        
        {showMetrics && (
          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
            <div>
              <span className="text-muted-foreground">Success Rate</span>
              <div className="font-semibold text-green-600">{template.successRate}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Avg ROI</span>
              <div className="font-semibold text-blue-600">{template.roiPercentage}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Setup Time</span>
              <div className="font-semibold">{template.avgSetupTimeHours}h</div>
            </div>
            <div>
              <span className="text-muted-foreground">Used By</span>
              <div className="font-semibold">{template.usageCount} partners</div>
            </div>
          </div>
        )}
      </CardContent>
      
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.2)</span>
          </div>
          <Button 
            size="sm" 
            onClick={() => onDeploy(template)}
            className={template.templateType === 'ready' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {template.templateType === 'ready' ? 'Deploy Now' : 'Customize & Deploy'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
