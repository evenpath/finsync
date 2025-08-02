
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
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const SuggestWorkflowStepsInputSchema = z.object({
  workflowDescription: z.string().describe('A description of the workflow for which to suggest steps.'),
});
export type SuggestWorkflowStepsInput = z.infer<typeof SuggestWorkflowStepsInputSchema>;

const SuggestWorkflowStepsOutputSchema = z.object({
  suggestion: z.string().describe('A plain text suggestion for the workflow steps.'),
});

export type SuggestWorkflowStepsOutput = z.infer<typeof SuggestWorkflowStepsOutputSchema>;

export async function suggestWorkflowSteps(input: SuggestWorkflowStepsInput): Promise<SuggestWorkflowStepsOutput> {
  return suggestWorkflowStepsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkflowStepsPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: {schema: SuggestWorkflowStepsInputSchema},
  output: {schema: SuggestWorkflowStepsOutputSchema},
  prompt: `You are an expert AI workflow designer. Your task is to analyze a user's description of a business problem and break it down into a logical sequence of steps.

Provide a simple, text-based suggestion for the workflow steps. Each step should be on a new line.

For example, if the user says "A workflow to handle customer support requests", you could suggest:
1. AI Agent: Categorize the incoming support request.
2. Conditional Logic: If urgent, notify the support lead.
3. Manual Step: Create a ticket in the helpdesk system.
4. AI Agent: Send an automated confirmation email to the customer.

Now, please analyze the following workflow description and provide your suggested steps.

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
