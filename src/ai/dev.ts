import { config } from 'dotenv';
config();

import '@/ai/flows/generate-mini-narrative.ts';
import '@/ai/flows/adjust-narrative-difficulty.ts';
import '@/ai/flows/generate-quiz-question.ts';
import '@/ai/flows/generate-topic-words.ts';
