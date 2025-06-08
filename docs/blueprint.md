# **App Name**: LexIA

## Core Features:

- User Authentication: User authentication via Firebase to manage user sessions and data privacy.
- Lenguage: Spanish
- Chat Interface: Classic chat interface with a central message area, user input field, and submit button.
- API Key Configuration: An interface where the user pastes in their OpenAI or Gemini API key from the cloud provider, for authorization.
- LLM Integration: Processes user input, retrieves the API key from local storage, and sends the message to the configured LLM (ChatGPT or Gemini) with a system prompt. Includes tools to help decide when to apply the provided knowledge.
- Legal Assistance Persona: The LLM leverages a system prompt to impersonate LexIA, a legal assistant specializing in Spanish and European law.
- Real-Time Updates: Real-time updates display the AI's responses without needing to refresh the page, driven by Firestore listeners.
- Message History: Firestore database stores messages with user ID, role, content, and timestamp.
- Integración y funcionamiento en tiempo real: Deploy a chat capable of responding to legal questions (Spanish/European Law) using ChatGPT or Gemini.
- Permitir que cada usuario introduzca su propia clave de API de OpenAI o Google: Allow each user to enter their own OpenAI or Google API key.
- Guardar historial de conversaciones vinculado al user_id: Save conversation history linked to user_id.
- Experiencia de usuario y seguridad Autenticación (registro/inicio de sesión) mediante Firebase: Authentication (registration/login) via Firebase.
- Gestión local de la API Key (no se almacena en BD; sólo localStorage). Prompt fijo para especializar al asistente en Derecho: Local API Key management (not stored in DB; only localStorage). Fixed prompt to specialize the assistant in Law
- Llamadas al LLM a. Endpoint: Chat Completions (OpenAI) o Generative AI (Gemini). b. temperature: 0,4 | max_tokens: 8000: LLM calls a. Endpoint: Chat Completions (OpenAI) or Generative AI (Gemini). b. temperature: 0,4 | max_tokens: 8000
- Gestión de la API Key a. Campo tipo password para pegar la clave. b. Almacenamiento en localStorage y cabecera Authorization en cada request: API Key Management a. Password type field to paste the key. b. Storage in localStorage and Authorization header in each request.
- Prompt del sistema Eres LexIA, asistente jurídico especializado en Derecho español y europeo. Responde con lenguaje claro y, cuando proceda, menciona la norma o jurisprudencia aplicable.: You are LexIA, a legal assistant specializing in Spanish and European law. Respond in clear language and, where appropriate, mention the applicable rule or jurisprudence.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust, authority, and intelligence, mirroring the legal profession.
- Background color: Light gray (#F5F5F5) for a clean, professional look, ensuring readability and reducing eye strain.
- Accent color: Subtle teal (#4CAF50) to highlight key elements like the send button and active prompts, adding a touch of modernity and sophistication.
- Body font: 'PT Sans' (sans-serif) for readability, with a modern look that remains approachable.
- Headline font: 'Literata' (serif) to convey reliability, with a literary feel.
- Use minimalist, professional icons for actions like sending messages or accessing settings. Icons should be monochrome and align with the primary color.
- Maintain a clean and structured layout with a clear separation between the chat area, input field, and optional sidebar. Use a card-based design for messages to distinguish between user and assistant.
- Legal icons