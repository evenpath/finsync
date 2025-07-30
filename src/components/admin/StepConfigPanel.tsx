// src/components/admin/StepConfigPanel.tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { aiProviders } from '@/lib/mockData';
import type { WorkflowStep } from '@/lib/types';


interface StepConfigPanelProps {
    step: WorkflowStep;
    onConfigChange: (config: any) => void;
    onInfoChange: (info: Partial<WorkflowStep>) => void;
}

export default function StepConfigPanel({ step, onConfigChange, onInfoChange }: StepConfigPanelProps) {
  const config = step.configuration || {};

  if (step.type === 'ai_agent') {
    return (
      <div className="space-y-6">
        <div>
          <Label htmlFor="aiProvider">AI Provider</Label>
          <Select 
            value={config.provider || 'openai'}
            onValueChange={(value) => onConfigChange({ provider: value })}
          >
            <SelectTrigger id="aiProvider">
                <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
                {aiProviders.map(provider => (
                <SelectItem key={provider.id} value={provider.id}>
                    {provider.icon} {provider.name}
                </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="aiModel">Model</Label>
           <Select 
            value={config.model || 'gpt-4'}
            onValueChange={(value) => onConfigChange({ model: value })}
          >
             <SelectTrigger id="aiModel">
                <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
                {aiProviders.find(p => p.id === (config.provider || 'openai'))?.models.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            value={config.systemPrompt || ''}
            onChange={(e) => onConfigChange({ systemPrompt: e.target.value })}
            placeholder="Define the AI agent's role and behavior..."
            className="h-24 resize-none"
          />
        </div>

        <div>
          <Label htmlFor="userPrompt">User Prompt Template</Label>
          <Textarea
            id="userPrompt"
            value={config.prompt || ''}
            onChange={(e) => onConfigChange({ prompt: e.target.value })}
            placeholder="Enter the prompt template with variables like {input_data}..."
            className="h-32 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">Use {`{variable_name}`} for dynamic values</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="temperature">Temperature: {config.temperature || 0.7}</Label>
            <Input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature || 0.7}
              onChange={(e) => onConfigChange({ temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={config.maxTokens || 1000}
              onChange={(e) => onConfigChange({ maxTokens: parseInt(e.target.value, 10) })}
            />
          </div>
        </div>

        <div className="bg-secondary p-4 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Quick Templates</h4>
          <div className="space-y-2">
            {[
              { name: 'Text Summarizer', prompt: 'Summarize the following text in 2-3 sentences: {input_text}' },
              { name: 'Sentiment Analyzer', prompt: 'Analyze the sentiment of this text and provide a score from 1-10: {input_text}' },
              { name: 'Content Generator', prompt: 'Generate engaging content about {topic} for {audience}' },
              { name: 'Data Extractor', prompt: 'Extract key information from this document: {document_content}' }
            ].map(template => (
              <Button
                key={template.name}
                onClick={() => onConfigChange({ prompt: template.prompt })}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default configuration for other step types
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="stepName">Step Name</Label>
        <Input
          id="stepName"
          type="text"
          value={step.title}
          onChange={(e) => onInfoChange({ title: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="stepDescription">Description</Label>
        <Textarea
          id="stepDescription"
          value={step.description}
          onChange={(e) => onInfoChange({ description: e.target.value })}
          className="h-24 resize-none"
        />
      </div>
      <div className="bg-yellow-100/50 p-4 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Configuration options for '{step.type}' will be available in a future update.
        </p>
      </div>
    </div>
  );
};
