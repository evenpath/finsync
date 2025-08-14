
// src/components/admin/AIQuestionDialog.tsx
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface AIQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
}

export default function AIQuestionDialog({ isOpen, onClose, partnerName }: AIQuestionDialogProps) {
  const [aiQuestion, setAiQuestion] = useState('');

  const suggestedQuestions = [
    "What's the biggest workflow opportunity for this business?",
    "How can we improve their current pain points?",
    "What integrations would provide the most value?",
    "What are the risks of their current manual processes?"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ask AI About {partnerName}</DialogTitle>
          <DialogDescription>
            What would you like to know about this business?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="ai-question">Your Question</Label>
            <Textarea
              id="ai-question"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="w-full mt-2"
              rows={4}
              placeholder="e.g., What workflow would help them most? What are their biggest automation opportunities? How can we improve their ROI?"
            />
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Suggested Questions:</h4>
            <div className="space-y-2">
              {suggestedQuestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setAiQuestion(suggestion)}
                  className="block text-sm text-purple-700 hover:text-purple-900 hover:underline text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              console.log('AI Question:', aiQuestion);
              setAiQuestion('');
              onClose();
            }}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!aiQuestion.trim()}
          >
            Ask AI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
