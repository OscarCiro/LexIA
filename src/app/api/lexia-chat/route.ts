
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { NextRequest } from 'next/server';

export const runtime = 'edge'; // Prefer edge runtime for streaming

const SYSTEM_INSTRUCTION_BASE = `Eres LexIA, asistente jurídico especializado en Derecho español y europeo. Responde con lenguaje claro y, cuando proceda, menciona la norma o jurisprudencia aplicable. Puedes usar emojis relevantes y profesionales de forma sutil cuando sea apropiado (ej. ⚖️, 🏛️, 🇪🇸, 🇪🇺, 📄, ✅).`;


export async function POST(req: NextRequest) {
  try {
    const { question, apiKey } = await req.json();

    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ message: "La pregunta es requerida y debe ser texto." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!apiKey || typeof apiKey !== 'string') {
      return new Response(JSON.stringify({ message: "La clave API de Gemini es requerida." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest', // Updated model name
      systemInstruction: SYSTEM_INSTRUCTION_BASE
    });

    const generationConfig = {
      temperature: 0.4,
      maxOutputTokens: 8000, // Ensure this is within model limits
      // topK: Defines the K top-most probable tokens to be considered for sampling. Default is 40.
      // topP: Defines the P top-most probable tokens to be considered for sampling. Default is 0.95.
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const stream = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: question }] }], // Pass only user question here
        generationConfig,
        safetySettings,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
        } catch (error: any) {
          console.error("Error during stream processing:", error);
          let errorMessage = "Error procesando la respuesta del modelo.";
          if (error.message) {
            errorMessage += ` Detalles: ${error.message}`;
          }
           // Try to enqueue a meaningful error message if possible, or handle on client
          controller.enqueue(new TextEncoder().encode(`\nSTREAM_ERROR: ${errorMessage}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error("Error in /api/lexia-chat:", error);
    let message = "Error interno del servidor al procesar la solicitud.";
    let status = 500;

    // Check for specific GoogleGenerativeAI errors or other API errors
    if (error.message) {
        if (error.message.includes("API key not valid") || error.message.includes("API key is invalid")) {
            message = "Clave API de Gemini inválida o sin permisos.";
            status = 401;
        } else if (error.message.includes("404 Not Found")) {
            message = "No se pudo encontrar el modelo de IA especificado. Verifica el nombre del modelo y tu acceso.";
            status = 404;
        } else if (error.message.includes("permission denied") || error.message.includes("PermissionDenied")) {
            message = "Permiso denegado. Tu clave API podría no tener acceso a este modelo o servicio.";
            status = 403;
        }
        // Keep original message if it's more specific and not caught above
        else if (status === 500) { // only override if it's still a generic 500
          message = error.message;
        }
    }

    return new Response(JSON.stringify({ message }), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
