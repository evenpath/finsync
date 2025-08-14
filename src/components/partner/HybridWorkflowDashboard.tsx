
"use client";

import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../shared/Badge";
import type { BusinessProfile, WorkflowTemplate } from '../../lib/types';
import TemplateCard from '../templates/TemplateCard';
import { Sparkles, Loader2, RotateCcw, CheckCircle } from 'lucide-react';
// import ProblemDescriptionModal from '@/components/ai/ProblemDescriptionModal'; // This would be the next step

interface HybridWorkflowDashboardProps {
  businessProfile: BusinessProfile;
  deployedWorkflows: any[]; // Using `any` for now as WorkflowInstance is not fully defined
  recommendedTemplates: WorkflowTemplate[];
}

export default function HybridWorkflowDashboard({ 
  businessProfile, 
  deployedWorkflows, 
  recommendedTemplates 
}: HybridWorkflowDashboardProps) {
  const [showProblemInput, setShowProblemInput] = useState(false);

  const handleTemplateDeploy = (template: WorkflowTemplate) => {
      console.log("Deploying template:", template.title);
      // Here you would trigger the deployment logic
  }

  const handleWorkflowGenerated = (workflow: WorkflowTemplate) => {
    console.log("New workflow generated and approved:", workflow.title);
    setShowProblemInput(false);
    // Add the new workflow to the state
  }
  
  const aiGeneratedWorkflows = deployedWorkflows.filter(w => w.templateType === 'ai_generated');

  return (
    <div className="space-y-8">
      {/* Business Profile Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <span className="text-3xl">{businessProfile.industry?.icon}</span>
                <span className="text-2xl font-bold">{businessProfile.businessName}</span>
              </CardTitle>
              <CardDescription className="mt-1">
                {businessProfile.industry?.name} • {businessProfile.businessSize} business
              </CardDescription>
            </div>
            <Badge variant="info">{deployedWorkflows.length} Active Workflows</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Ready Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                Ready Templates
              </CardTitle>
              <CardDescription>
                Proven workflows you can deploy immediately
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">View All Templates</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedTemplates.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template}
                onDeploy={handleTemplateDeploy}
                isRecommended={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Workflows Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span>
                AI-Generated Workflows
              </CardTitle>
              <CardDescription>
                Custom solutions created from your problem descriptions
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowProblemInput(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Describe a Problem
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              {aiGeneratedWorkflows.length > 0 ? aiGeneratedWorkflows.map(workflow => (
                  <p key={workflow.id}>{workflow.title}</p>
              )) : (
                  <p className="text-sm text-muted-foreground">No AI-generated workflows yet. Describe a problem to create one!</p>
              )}
          </div>
        </CardContent>
      </Card>
      
      {/* For now, we are not creating the ProblemDescriptionModal component to keep the change small */}
      {/* In a future step, we would uncomment this: */}
      {/* <ProblemDescriptionModal 
        isOpen={showProblemInput}
        onClose={() => setShowProblemInput(false)}
        businessProfile={businessProfile}
        onWorkflowGenerated={handleWorkflowGenerated}
      /> */}
    </div>
  );
}
