
// src/ai/flows/suggest-workflow-steps.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest a structured, conditional workflow
 * based on a user's natural language description of a business problem.
 *
 * @interface SuggestWorkflowStepsInput - Input type for the suggestWorkflowSteps function.
 * @interface SuggestWorkflowStepsOutput - Output type for the suggestWorkflowSteps function.
 * @function suggestWorkflowSteps - The function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {
  SuggestWorkflowStepsInputSchema,
  SuggestWorkflowStepsOutputSchema,
  type SuggestWorkflowStepsInput,
  type SuggestWorkflowStepsOutput,
} from '@/lib/types';


export async function suggestWorkflowSteps(input: SuggestWorkflowStepsInput): Promise<SuggestWorkflowStepsOutput> {
  return suggestWorkflowStepsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkflowStepsPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: {schema: SuggestWorkflowStepsInputSchema},
  output: {schema: SuggestWorkflowStepsOutputSchema},
  prompt: `You are an expert AI workflow designer for an operational automation platform. Your primary goal is to design the most efficient and logical operational workflow possible based on a user's problem description.

The key is to use conditional logic to handle different scenarios.

**Available Step Types:**
- 'ai_agent': An AI model performs a task (e.g., classify, analyze, generate).
- 'human_input': The workflow pauses to get input or a decision from a person.
- 'api_call': The workflow interacts with an external system (e.g., CRM, Calendar, SMS Gateway).
- 'notification': The workflow sends an alert (e.g., email, push, chat).
- 'conditional_branch': A step that contains multiple "branches". Each branch has a condition (like "IF urgency = CRITICAL") and a list of nested steps to execute if that condition is met.

**Your Task:**
1.  Read the user's workflow description to understand their operational goal.
2.  Deconstruct the problem into logical steps.
3.  **Crucially, identify where the process needs to change based on different conditions (e.g., urgency, customer type, cost). Use the 'conditional_branch' step for this.**
4.  For each conditional branch, define the condition clearly (e.g., "IF urgency = HIGH") and list the specific action steps inside that branch.
5.  Combine all steps into a logical sequence.
6.  Provide a concise 'name' and 'description' for the entire workflow.
7.  Format your entire response as a single JSON object matching the output schema.

**Example of a Conditional Branch Structure:**

{
  "type": "conditional_branch",
  "name": "Urgency Level Assessment",
  "description": "Routes the workflow based on the classified urgency of the request.",
  "branches": [
    {
      "condition": "IF urgency = CRITICAL",
      "steps": [
        { "type": "human_input", "name": "Manager Approval", "description": "A manager must approve the immediate dispatch within 5 minutes." },
        { "type": "api_call", "name": "Dispatch On-Call Staff", "description": "Send an urgent SMS to the on-call technician." }
      ]
    },
    {
      "condition": "ELSE IF urgency = HIGH",
      "steps": [
        { "type": "human_input", "name": "Supervisor Review", "description": "A supervisor reviews the request within 30 minutes." }
      ]
    },
    {
      "condition": "ELSE (low priority)",
      "steps": [
        { "type": "ai_agent", "name": "Add to Weekly Queue", "description": "The request is added to the weekly planning and scheduling queue." }
      ]
    }
  ]
}


**User's Workflow Description:**
"{{workflowDescription}}"
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
