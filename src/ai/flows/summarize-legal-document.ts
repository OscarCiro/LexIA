'use server';
/**
 * @fileOverview Summarizes a legal document.
 *
 * - summarizeLegalDocument - A function that summarizes a legal document.
 * - SummarizeLegalDocumentInput - The input type for the summarizeLegalDocument function.
 * - SummarizeLegalDocumentOutput - The return type for the summarizeLegalDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLegalDocumentInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to be summarized.'),
});
export type SummarizeLegalDocumentInput = z.infer<
  typeof SummarizeLegalDocumentInputSchema
>;

const SummarizeLegalDocumentOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the key points of the legal document.'),
});
export type SummarizeLegalDocumentOutput = z.infer<
  typeof SummarizeLegalDocumentOutputSchema
>;

export async function summarizeLegalDocument(
  input: SummarizeLegalDocumentInput
): Promise<SummarizeLegalDocumentOutput> {
  return summarizeLegalDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLegalDocumentPrompt',
  input: {schema: SummarizeLegalDocumentInputSchema},
  output: {schema: SummarizeLegalDocumentOutputSchema},
  prompt: `Eres LexIA, un asistente jurídico especializado en Derecho español y europeo.
  Por favor, resume el siguiente documento legal, identificando los puntos clave y los argumentos principales:

  Documento:
  {{documentText}}`,
});

const summarizeLegalDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeLegalDocumentFlow',
    inputSchema: SummarizeLegalDocumentInputSchema,
    outputSchema: SummarizeLegalDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
