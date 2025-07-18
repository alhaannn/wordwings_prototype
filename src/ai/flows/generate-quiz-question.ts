'use server';
/**
 * @fileOverview Generates a quiz question for a given word and definition.
 *
 * - generateQuizQuestion - A function that handles the quiz question generation process.
 * - GenerateQuizQuestionInput - The input type for the generateQuizQuestion function.
 * - GenerateQuizQuestionOutput - The return type for the generateQuizQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { QuizQuestion } from '@/lib/types';

const GenerateQuizQuestionInputSchema = z.object({
  word: z.string().describe('The word to create a quiz question for.'),
  definition: z.string().describe('The definition of the word.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty of the word.'),
});
export type GenerateQuizQuestionInput = z.infer<typeof GenerateQuizQuestionInputSchema>;

const GenerateQuizQuestionOutputSchema = z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.string(),
});
export type GenerateQuizQuestionOutput = z.infer<typeof GenerateQuizQuestionOutputSchema>;

export async function generateQuizQuestion(
  input: GenerateQuizQuestionInput
): Promise<QuizQuestion> {
  const output = await generateQuizQuestionFlow(input);
  return {
    ...output,
    word: input.word,
    difficulty: input.difficulty,
  };
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionPrompt',
  input: {schema: GenerateQuizQuestionInputSchema},
  output: {schema: GenerateQuizQuestionOutputSchema},
  prompt: `You are an expert in creating educational content. Your task is to generate a multiple-choice quiz question for a language learner based on the provided word and definition.

Word: {{{word}}}
Definition: {{{definition}}}

Instructions:
1. Create a clear and concise question that tests the learner's understanding of the word's meaning. The question could be "What does '{{{word}}}' mean?" or a sentence completion like "The atmosphere in the cabin was so ___ that we all felt relaxed."
2. Provide four distinct options.
3. One of the options must be the correct answer, which should be the definition or a close synonym.
4. The other three options must be plausible but incorrect distractors. They should be related in some way (e.g., similar theme, opposite meaning) to make the question challenging but fair.
5. Ensure the correctAnswer field in the output contains the exact text of the correct option.
`,
});

const generateQuizQuestionFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionFlow',
    inputSchema: GenerateQuizQuestionInputSchema,
    outputSchema: GenerateQuizQuestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
