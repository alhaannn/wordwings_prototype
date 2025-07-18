 'use server';
/**
 * @fileOverview An AI agent to adjust the difficulty of mini-narratives based on quiz performance.
 *
 * - adjustNarrativeDifficulty - A function that adjusts the narrative difficulty.
 * - AdjustNarrativeDifficultyInput - The input type for the adjustNarrativeDifficulty function.
 * - AdjustNarrativeDifficultyOutput - The return type for the adjustNarrativeDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustNarrativeDifficultyInputSchema = z.object({
  quizPerformance: z
    .number()
    .describe(
      'The learners quiz performance represented as a percentage (0-100).' + 
      'A higher number means the learner is doing well.'
    ),
  targetWordList: z.array(z.string()).describe('The list of target words for the mini-narrative.'),
  currentDifficulty: z.enum(['easy', 'medium', 'hard']).describe('The current difficulty level of the mini-narrative.'),
});
export type AdjustNarrativeDifficultyInput = z.infer<typeof AdjustNarrativeDifficultyInputSchema>;

const AdjustNarrativeDifficultyOutputSchema = z.object({
  adjustedDifficulty: z.enum(['easy', 'medium', 'hard']).describe('The adjusted difficulty level of the mini-narrative.'),
  reason: z.string().describe('The reasoning behind the difficulty adjustment.'),
});
export type AdjustNarrativeDifficultyOutput = z.infer<typeof AdjustNarrativeDifficultyOutputSchema>;

export async function adjustNarrativeDifficulty(
  input: AdjustNarrativeDifficultyInput
): Promise<AdjustNarrativeDifficultyOutput> {
  return adjustNarrativeDifficultyFlow(input);
}

const adjustNarrativeDifficultyPrompt = ai.definePrompt({
  name: 'adjustNarrativeDifficultyPrompt',
  input: {schema: AdjustNarrativeDifficultyInputSchema},
  output: {schema: AdjustNarrativeDifficultyOutputSchema},
  prompt: `You are an AI narrative difficulty adjuster. You will take in the learners quiz performance,
the list of target words, and the current difficulty, and output an adjusted difficulty level.

Here is the learner's quiz performance: {{{quizPerformance}}}%
Here is the list of target words: {{targetWordList}}
Here is the current difficulty: {{{currentDifficulty}}}

Based on this information, should the difficulty be adjusted? Explain your reasoning, and set the adjustedDifficulty field accordingly.
If the quiz performance is above 80%, increase the difficulty. If the quiz performance is below 40%, decrease the difficulty. Otherwise, keep the difficulty the same.`,
});

const adjustNarrativeDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustNarrativeDifficultyFlow',
    inputSchema: AdjustNarrativeDifficultyInputSchema,
    outputSchema: AdjustNarrativeDifficultyOutputSchema,
  },
  async input => {
    const {output} = await adjustNarrativeDifficultyPrompt(input);
    return output!;
  }
);
