import '@/ai/genkit'; // This will now handle the admin initialization
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-task-context.ts';
import '@/ai/flows/suggest-workflow-steps.ts';
import '@/ai/flows/manage-admin-user-flow.ts';
import '@/ai/flows/create-tenant-flow.ts';
