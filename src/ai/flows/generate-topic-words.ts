'use server';
/**
 * @fileOverview Generates a list of vocabulary words based on a given topic and difficulty.
 *
 * - generateTopicWords - A function that handles the word generation process.
 * - GenerateTopicWordsInput - The input type for the generateTopicWords function.
 * - GenerateTopicWordsOutput - The return type for the generateTopicWords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { NewWord } from '@/lib/types';

const GenerateTopicWordsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate vocabulary words.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The desired difficulty level of the words.'),
});
export type GenerateTopicWordsInput = z.infer<typeof GenerateTopicWordsInputSchema>;

const GenerateTopicWordsOutputSchema = z.object({
    words: z.array(z.object({
        word: z.string().describe('The generated vocabulary word.'),
        definition: z.string().describe('A clear and concise definition of the word.'),
        example: z.string().describe('An example sentence using the word in context.'),
        difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty of the word, matching the input difficulty.'),
        imageHint: z.string().describe('Two or three keywords for finding a relevant image on Unsplash.'),
    })).length(3).describe('An array of 3 generated words.'),
});
export type GenerateTopicWordsOutput = z.infer<typeof GenerateTopicWordsOutputSchema>;

export async function generateTopicWords(
  input: GenerateTopicWordsInput
): Promise<GenerateTopicWordsOutput> {
  return generateTopicWordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTopicWordsPrompt',
  input: {schema: GenerateTopicWordsInputSchema},
  output: {schema: GenerateTopicWordsOutputSchema},
  prompt: `You are an expert linguist and educator. Your task is to generate a list of exactly 3 vocabulary words based on a user-provided topic and difficulty level.

Topic: {{{topic}}}
Difficulty: {{{difficulty}}}

For each word, you must provide:
1.  **word**: The vocabulary word itself. It should be relevant to the topic and match the specified difficulty.
2.  **definition**: A simple, clear definition suitable for a language learner.
3.  **example**: A sentence that uses the word correctly and demonstrates its meaning in a context related to the topic.
4.  **difficulty**: The difficulty level ('easy', 'medium', or 'hard'), which must match the user's request.
5.  **imageHint**: Two or three descriptive keywords that can be used to find a relevant image on a stock photo website like Unsplash. The hint should be concise and visual.

Generate exactly 3 words.
`,
});

const generateTopicWordsFlow = ai.defineFlow(
  {
    name: 'generateTopicWordsFlow',
    inputSchema: GenerateTopicWordsInputSchema,
    outputSchema: GenerateTopicWordsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
