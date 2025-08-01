
// src/ai/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import './../lib/firebase-admin'; // Ensures admin is initialized

export const ai = genkit({
  plugins: [googleAI()],
});
