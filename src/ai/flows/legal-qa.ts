
'use server';

/**
 * @fileOverview Legal Question Answering AI agent specializing in Spanish and European law.
 *
 * - legalQA - A function that handles the legal question answering process.
 * - LegalQAInput - The input type for the legalQA function.
 * - LegalQAOutput - The return type for the legalQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalQAInputSchema = z.object({
  question: z.string().describe('The legal question to be answered.'),
});
export type LegalQAInput = z.infer<typeof LegalQAInputSchema>;

const LegalQAOutputSchema = z.object({
  answer: z.string().describe('The answer to the legal question.'),
});
export type LegalQAOutput = z.infer<typeof LegalQAOutputSchema>;

export async function legalQA(input: LegalQAInput): Promise<LegalQAOutput> {
  return legalQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalQAPrompt',
  input: {schema: LegalQAInputSchema},
  output: {schema: LegalQAOutputSchema},
  prompt: `Eres LexIA, asistente jurídico especializado en Derecho español y europeo. Responde con lenguaje claro y, cuando proceda, menciona la norma o jurisprudencia aplicable. Puedes usar emojis relevantes y profesionales de forma sutil cuando sea apropiado (ej. ⚖️, 🏛️, 🇪🇸, 🇪🇺, 📄, ✅).\n\nQuestion: {{{question}}}`,
  config: {
    temperature: 0.4,
    maxTokens: 8000,
  },
});

const legalQAFlow = ai.defineFlow(
  {
    name: 'legalQAFlow',
    inputSchema: LegalQAInputSchema,
    outputSchema: LegalQAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
