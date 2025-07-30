'use server';

/**
 * @fileOverview Summarizes the task description and related documents using AI.
 *
 * - summarizeTaskContext - A function that handles the task context summarization process.
 * - SummarizeTaskContextInput - The input type for the summarizeTaskContext function.
 * - SummarizeTaskContextOutput - The return type for the summarizeTaskContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTaskContextInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task.'),
  relatedDocuments: z.array(z.string()).describe('Array of related documents as strings.'),
});
export type SummarizeTaskContextInput = z.infer<typeof SummarizeTaskContextInputSchema>;

const SummarizeTaskContextOutputSchema = z.object({
  summary: z.string().describe('A summary of the task description and related documents.'),
});
export type SummarizeTaskContextOutput = z.infer<typeof SummarizeTaskContextOutputSchema>;

export async function summarizeTaskContext(input: SummarizeTaskContextInput): Promise<SummarizeTaskContextOutput> {
  return summarizeTaskContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTaskContextPrompt',
  input: {schema: SummarizeTaskContextInputSchema},
  output: {schema: SummarizeTaskContextOutputSchema},
  prompt: `Summarize the following task description and related documents into a concise summary:

Task Description: {{{taskDescription}}}

Related Documents:
{{#each relatedDocuments}}
{{{this}}}
{{/each}}`,
});

const summarizeTaskContextFlow = ai.defineFlow(
  {
    name: 'summarizeTaskContextFlow',
    inputSchema: SummarizeTaskContextInputSchema,
    outputSchema: SummarizeTaskContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
