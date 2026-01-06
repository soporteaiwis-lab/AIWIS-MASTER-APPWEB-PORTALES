import { GoogleGenAI } from "@google/genai";
import { Lesson, QuizQuestion } from "../types";

// NOTE: In a real production app, the API Key should not be exposed on the client side directly
// without proper restrictions.
const API_KEY = process.env.API_KEY || ''; 

export const generateLessonContent = async (title: string, context: string): Promise<{ summary: string; quiz: QuizQuestion[] }> => {
  // Mock fallback if no API key is present or for testing
  if (!API_KEY) {
    console.warn("No API Key found. Returning mock data for UI demonstration.");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    return {
      summary: `
        <div class="space-y-4 text-slate-300">
          <h2 class="text-2xl font-bold text-indigo-400">Resumen Ejecutivo: ${title}</h2>
          <p class="leading-relaxed">En este video, exploramos los fundamentos clave de la Inteligencia Artificial Generativa y su impacto en la productividad corporativa.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h3 class="font-bold text-white mb-2">📌 Puntos Clave</h3>
              <ul class="list-disc list-inside space-y-2 text-sm">
                <li>Diferencia entre IA Discriminativa y Generativa.</li>
                <li>Estructura básica de un Prompt eficiente.</li>
                <li>Herramientas: ChatGPT, Claude y Gemini.</li>
              </ul>
            </div>
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h3 class="font-bold text-white mb-2">🚀 Aplicación Práctica</h3>
              <p class="text-sm">Implementación inmediata en redacción de correos, análisis de datos y automatización básica.</p>
            </div>
          </div>

          <div class="bg-indigo-900/30 border-l-4 border-indigo-500 p-4 rounded-r-lg">
            <h4 class="font-bold text-white">Conclusión</h4>
            <p class="text-sm mt-1">La adopción temprana de estas herramientas define la ventaja competitiva en el mercado actual.</p>
          </div>
        </div>
      `,
      quiz: [
        { id: 'q1', question: '¿Cuál es la función principal de un LLM?', options: ['Predecir la siguiente palabra probable', 'Buscar en Google', 'Guardar archivos', 'Editar video'], correctIndex: 0 },
        { id: 'q2', question: '¿Qué significa "Prompt Engineering"?', options: ['Programar en Python', 'Diseñar instrucciones efectivas para la IA', 'Reparar computadoras', 'Ninguna de las anteriores'], correctIndex: 1 },
        { id: 'q3', question: '¿Qué herramienta es de Google?', options: ['ChatGPT', 'Claude', 'Gemini', 'Llama'], correctIndex: 2 },
        { id: 'q4', question: 'La temperatura en un modelo afecta:', options: ['La velocidad', 'La creatividad/aleatoriedad', 'El costo', 'El color'], correctIndex: 1 },
        { id: 'q5', question: '¿La IA Generativa puede crear imágenes?', options: ['No, solo texto', 'Sí, como Midjourney o DALL-E', 'Solo si se le paga', 'Depende del clima'], correctIndex: 1 },
      ]
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Prompt for Summary
    const summaryPrompt = `
      Actúa como un experto profesor de tecnología corporativa.
      Basado en el siguiente tema/contexto: "${title} - ${context}".
      
      Genera un RESUMEN HTML interactivo, visual y educativo. 
      Usa clases de Tailwind CSS para el estilo (colores oscuros, slate-200 para texto, indigo/purple para titulos).
      No incluyas etiquetas <html> o <body>, solo el contenido del div.
      Incluye:
      1. Título llamativo.
      2. Lista de puntos clave.
      3. Una sección de "Aplicación Práctica".
      4. Un recuadro de conclusión.
    `;

    // Prompt for Quiz (JSON)
    const quizPrompt = `
      Basado en el tema "${title} - ${context}".
      Genera un Quiz de 5 preguntas de selección múltiple en formato JSON puro.
      El formato debe ser un array de objetos con esta estructura exacta:
      [
        { "id": "1", "question": "pregunta", "options": ["a", "b", "c", "d"], "correctIndex": 0 }
      ]
      No uses markdown en la respuesta, solo el JSON raw.
    `;

    // Use ai.models.generateContent instead of getGenerativeModel
    const summaryResult = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: summaryPrompt,
    });
    
    const quizResult = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: quizPrompt,
      config: { responseMimeType: "application/json" }
    });

    const summaryHtml = summaryResult.text;
    const quizJsonStr = quizResult.text;

    if (!summaryHtml || !quizJsonStr) {
      throw new Error("Respuesta vacía del modelo");
    }

    const quizData = JSON.parse(quizJsonStr);

    return {
      summary: summaryHtml,
      quiz: quizData
    };

  } catch (error) {
    console.error("Error generating AI content:", error);
    throw new Error("Falló la generación de contenido. Verifica tu API Key.");
  }
};