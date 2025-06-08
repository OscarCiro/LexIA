# LexIA: Asistente Jurídico Inteligente

LexIA es un prototipo funcional de un chatbot diseñado para estudiantes de Derecho, capaz de responder dudas jurídicas especializadas en el ámbito del Derecho español y europeo. El proyecto utiliza un stack moderno con Next.js para el frontend, Firebase para la autenticación y base de datos, y se conecta a modelos de lenguaje como Gemini o ChatGPT para potenciar la inteligencia artificial.

El sistema permite que cada usuario utilice su propia clave de API, la cual es gestionada de forma segura en el lado del cliente, y guarda el historial de conversaciones en Firestore para mantener la coherencia entre sesiones.

---

## Pasos para Clonar y Desplegar

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### 1. Prerrequisitos

- Node.js (versión 18.18.0 o superior)
- npm, pnpm o yarn
- Una cuenta de Firebase

### 2. Clonar el Repositorio

```bash
git clone <URL-del-repositorio>
cd lexia-app
```

### 3. Instalar Dependencias

Instala los paquetes necesarios para el proyecto:

```bash
npm install
```

### 4. Configuración de Firebase

El proyecto requiere una configuración de Firebase para funcionar.


```ts
// src/lib/firebase.ts

const firebaseConfig = {
  apiKey: "AIzaSyABoRY5kFqIDSkMv37TeJ5I7r0EBUzr8zU",
  authDomain: "lexia-v1.firebaseapp.com",
  databaseURL: "https://lexia-v1-default-rtdb.firebaseio.com",
  projectId: "lexia-v1",
  storageBucket: "lexia-v1.firebasestorage.app",
  messagingSenderId: "1074238001164",
  appId: "1:1074238001164:web:1def07eca272fb966dde29",
  measurementId: "G-55RL568ELY"
};
};
```

### 5. Ejecutar el Proyecto Localmente

Una vez configurado, inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:9002](http://localhost:9002).

### 6. Desplegar el Proyecto

El proyecto está configurado para desplegarse en Firebase App Hosting.

1. Instala Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Inicia sesión en Firebase:

```bash
firebase login
```

3. Configura el proyecto:

```bash
firebase init hosting
```

Selecciona tu proyecto de Firebase.

4. Construye la aplicación:

```bash
npm run build
```

5. Despliega:

```bash
firebase deploy
```

---

## Instrucciones para Cambiar entre ChatGPT y Gemini

La aplicación permite al usuario elegir dinámicamente qué modelo de IA utilizar.

1. **Inicia Sesión**: Accede a la aplicación con tu cuenta.
2. **Selecciona el Proveedor**: En la barra de navegación, encontrarás un menú desplegable. Úsalo para seleccionar entre Gemini (Google) y ChatGPT (OpenAI).
3. **Configura tu Clave API**:
   - Si no has guardado una clave API para el proveedor seleccionado, aparecerá un diálogo pidiéndote que la introduzcas.
   - También puedes gestionar tus claves API en cualquier momento desde la página de Configuración (icono de engranaje en la barra de navegación).
4. **Almacenamiento Seguro**: Tus claves API se guardan exclusivamente en el almacenamiento local de tu navegador (`localStorage`) y no se envían a nuestros servidores, garantizando tu privacidad.

---

## Mejoras Pendientes

Aunque el prototipo es funcional, existen varias áreas de mejora para una versión de producción:

- **Seguridad de las Claves API**: Aunque se almacenan localmente, para un entorno de producción sería ideal que las llamadas a las APIs de los LLM se realicen a través de un backend seguro que gestione las claves, en lugar de exponerlas en el cliente.
- **Gestión del Historial de Chat**: Mejorar la UI del historial para permitir acciones como eliminar o renombrar conversaciones.
- **Optimización del Streaming**: La respuesta del asistente se renderiza en cada trozo (chunk) recibido. Se podría optimizar para que el texto se añada al final de la burbuja de mensaje existente, mejorando el rendimiento visual.
- **Manejo de Errores Avanzado**: Implementar notificaciones de error más específicas en la UI para casos como límites de cuota de la API, problemas de red o errores de autenticación del modelo.
- **Pruebas (Testing)**: Desarrollar un conjunto de pruebas unitarias y de integración para los componentes de React y las rutas de la API para garantizar la fiabilidad y mantenibilidad del código.
- **Refactorización del Código**: Eliminar o integrar los flujos de Genkit (`legal-qa.ts`, `summarize-legal-document.ts`) que actualmente no se utilizan en el flujo principal del chat, el cual es manejado por las API Routes de Next.js.
- **Accesibilidad (a11y)**: Realizar una auditoría completa de accesibilidad para asegurar que todos los componentes y flujos de usuario sean completamente accesibles.
