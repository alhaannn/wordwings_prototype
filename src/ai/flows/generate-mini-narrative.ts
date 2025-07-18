// src/ai/flows/generate-mini-narrative.ts
'use server';
/**
 * @fileOverview Generates a mini-narrative based on the learner's target word list and past quiz performance.
 *
 * - generateMiniNarrative - A function that handles the mini-narrative generation process.
 * - GenerateMiniNarrativeInput - The input type for the generateMiniNarrative function.
 * - GenerateMiniNarrativeOutput - The return type for the generateMiniNarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMiniNarrativeInputSchema = z.object({
  targetWords: z.array(z.string()).describe('List of target words to include in the narrative.'),
  pastQuizPerformance: z.object({
    correctAnswers: z.number().describe('Number of correct answers in past quizzes.'),
    totalQuestions: z.number().describe('Total number of questions in past quizzes.'),
  }).describe('Learner\'s past quiz performance data.'),
  topic: z.string().optional().describe('An optional topic to guide the story generation.'),
});
export type GenerateMiniNarrativeInput = z.infer<typeof GenerateMiniNarrativeInputSchema>;

const GenerateMiniNarrativeOutputSchema = z.object({
  narrative: z.string().describe('The generated mini-narrative.'),
  progress: z.string().describe('A short, one-sentence summary of what has been generated.'),
});
export type GenerateMiniNarrativeOutput = z.infer<typeof GenerateMiniNarrativeOutputSchema>;

export async function generateMiniNarrative(input: GenerateMiniNarrativeInput): Promise<GenerateMiniNarrativeOutput> {
  return generateMiniNarrativeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMiniNarrativePrompt',
  input: {schema: GenerateMiniNarrativeInputSchema},
  output: {schema: GenerateMiniNarrativeOutputSchema},
  prompt: `You are a story generator that creates mini-narratives for language learners.

  The narrative should include the following target words: {{{targetWords}}}.
  
  {{#if topic}}
  The story should be about the following topic: {{{topic}}}.
  {{/if}}

  Consider the learner's past quiz performance when generating the story. If the learner has a high percentage of correct answers (correctAnswers / totalQuestions), generate a more complex narrative. Otherwise, generate a simpler narrative.

  Here is the learner's past quiz performance:
  Correct Answers: {{{pastQuizPerformance.correctAnswers}}}
  Total Questions: {{{pastQuizPerformance.totalQuestions}}}

  Generate a narrative that is engaging and appropriate for the learner's level.
  `, 
});

const generateMiniNarrativeFlow = ai.defineFlow(
  {
    name: 'generateMiniNarrativeFlow',
    inputSchema: GenerateMiniNarrativeInputSchema,
    outputSchema: GenerateMiniNarrativeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    //Add a progress summary to the output
    output!.progress = `Generated a mini-narrative using the target word list.`;
    return output!;
  }
);
