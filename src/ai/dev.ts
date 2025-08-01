import '@/ai/genkit'; // This will now handle the admin initialization
// The .env.local file will be loaded automatically by Next.js

import '@/ai/flows/summarize-task-context.ts';
import '@/ai/flows/suggest-workflow-steps.ts';
import '@/ai/flows/manage-