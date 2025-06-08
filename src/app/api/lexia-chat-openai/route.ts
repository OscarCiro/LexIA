import OpenAI from 'openai';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT_TEMPLATE = `Eres LexIA, asistente jurídico especializado en Derecho español y europeo. Responde con lenguaje claro y, cuando proceda, menciona la norma o jurisprudencia aplicable. Puedes usar emojis relevantes y profesionales de forma sutil cuando sea apropiado (ej. ⚖️, 🏛️, 🇪🇸, 🇪🇺, 📄, ✅).

Pregunta del usuario: `;

export async function POST(req: NextRequest) {
  try {
    const { question, apiKey, history = [] } = await req.json();

    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ message: "La pregunta es requerida y debe ser texto." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!apiKey || typeof apiKey !== 'string') {
      return new Response(JSON.stringify({ message: "La clave API de OpenAI es requerida." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const openai = new OpenAI({ apiKey });
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT_TEMPLATE.replace('Pregunta del usuario: ', '') }, // Base system prompt
    ];

    // Add history messages
    history.forEach((msg: {role: 'user' | 'assistant', text: string}) => {
        messages.push({ role: msg.role, content: msg.text });
    });

    // Add current user question
    messages.push({ role: "user", content: question });


    const stream = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Using a capable and generally available model
      messages: messages,
      temperature: 0.5, // Adjusted for potentially more factual responses
      max_tokens: 2000, // Max output tokens
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const chunkText = chunk.choices[0]?.delta?.content || "";
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
        } catch (error: any) {
          console.error("Error during OpenAI stream processing:", error);
          let errorMessage = "Error procesando la respuesta del modelo OpenAI.";
          if (error.message) {
            errorMessage += ` Detalles: ${error.message}`;
          }
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
    console.error("Error in /api/lexia-chat-openai:", error);
    let message = "Error interno del servidor al procesar la solicitud con OpenAI.";
    let status = 500;

    if (error instanceof OpenAI.APIError) {
        message = `Error de API OpenAI: ${error.message}`;
        status = error.status || 500;
        if (error.code === 'invalid_api_key') {
            message = "Clave API de OpenAI inválida o sin permisos.";
            status = 401;
        }
    } else if (error.message) {
        message = error.message;
    }
    
    return new Response(JSON.stringify({ message }), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
