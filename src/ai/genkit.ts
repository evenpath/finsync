
// src/ai/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// The Firebase Admin SDK is now initialized in `src/lib/firebase-admin.ts`.
// We just need to configure Genkit here.

export const ai = genkit({
  plugins: [googleAI()],
});
