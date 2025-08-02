
// src/ai/flows/suggest-workflow-steps.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest a structured workflow 
 * based on a user's natural language description of a business problem.
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

const WorkflowStepSchema = z.object({
  type: z.string().describe("The type of the step, e.g., 'trigger_chat_message', 'action_ai_analysis', 'action_assign_task'."),
  name: z.string().describe("A human-readable name for the step, e.g., 'Analyze Incoming Chat Message'."),
  description: z.string().describe("A brief explanation of what this step does."),
});

const SuggestWorkflowStepsOutputSchema = z.object({
  name: z.string().describe("A concise name for the entire workflow."),
  description: z.string().describe("A short description of what the workflow accomplishes."),
  steps: z.array(WorkflowStepSchema).describe("An array of the structured steps for the workflow."),
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
  prompt: `You are an expert AI workflow designer for a chat-based task management system. Your primary goal is to design the most efficient operational workflow possible based on a user's problem description.

You MUST only use the following available Triggers and Actions:

**Available Triggers (A workflow must start with one of these):**
- type: "trigger_chat_message"
  name: "Analyze Incoming Message"
  description: "Triggers when a new message is received and uses AI to analyze its content."

**Available Actions (Can use one or more of these in a logical sequence):**
- type: "action_ai_analysis"
  name: "AI Analysis"
  description: "Let AI analyze, classify, or process content from a previous step."
- type: "action_assign_task"
  name: "Assign Task"
  description: "Create and assign a task to a team member."
- type: "action_create_todo"
  name: "Create To-Do Item"
  description: "Add a to-do item to a personal or team list."
- type: "action_request_approval"
  name: "Request Approval"
  description: "Ask a manager or admin to approve something before continuing."
- type: "action_send_email"
  name: "Send Email"
  description: "Send an email notification to internal or external contacts."
- type: "action_send_notification"
  name: "Send In-App Notification"
  description: "Send an in-app or push notification to users."
- type: "action_log_information"
  name: "Log Information"
  description: "Record important information or notes to a system log."
- type: "action_update_status"
  name: "Update Status"
  description: "Change the status of a project, task, or customer."

**Your Task:**
1.  Read the user's workflow description carefully to understand their core operational goal.
2.  Design the most efficient and logical sequence of steps to solve the problem.
3.  Choose a descriptive 'name' and 'description' for the entire workflow.
4.  The first step in your suggested workflow MUST be a TRIGGER.
5.  The subsequent steps must be ACTIONS, arranged in a sequence that makes operational sense.
6.  Format your entire response as a single JSON object matching the output schema. Do not add any text or explanation outside of the JSON object.

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
