// src/ai/flows/suggest-workflow-steps.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest relevant workflow steps (AI Agent and manual input) 
 * based on a given workflow description.
 *
 * @interface SuggestWorkflowStepsInput - Input type for the suggestWorkflowSteps function.
 * @interface SuggestWorkflowStepsOutput - Output type for the suggestWorkflowSteps function.
 * @function suggestWorkflowSteps - The function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWorkflowStepsInputSchema = z.object({
  workflowDescription: z.string().describe('A description of the workflow for which to suggest steps.'),
});
export type SuggestWorkflowStepsInput = z.infer<typeof SuggestWorkflowStepsInputSchema>;

const SuggestWorkflowStepsOutputSchema = z.object({
  suggestedSteps: z.array(
    z.object({
      type: z.string().describe('The type of workflow step, e.g., "ai_agent" or "manual_input".'),
      title: z.string().describe('A suggested title for the workflow step.'),
      description: z.string().describe('A suggested description for the workflow step.'),
    })
  ).describe('An array of suggested workflow steps.'),
});

export type SuggestWorkflowStepsOutput = z.infer<typeof SuggestWorkflowStepsOutputSchema>;

export async function suggestWorkflowSteps(input: SuggestWorkflowStepsInput): Promise<SuggestWorkflowStepsOutput> {
  return suggestWorkflowStepsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkflowStepsPrompt',
  input: {schema: SuggestWorkflowStepsInputSchema},
  output: {schema: SuggestWorkflowStepsOutputSchema},
  prompt: `You are an AI assistant that suggests workflow steps based on a workflow description.

  Given the following workflow description, suggest a list of relevant workflow steps.
  Each step should have a type (e.g., ai_agent or manual_input), a title, and a description.

  Workflow Description: {{{workflowDescription}}}
  `,
});

const suggestWorkflowStepsFlow = ai.defineFlow(
  {
    name: 'suggestWorkflowStepsFlow',
    inputSchema: SuggestWorkflowStepsInputSchema,
    outputSchema: SuggestWorkflowStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
