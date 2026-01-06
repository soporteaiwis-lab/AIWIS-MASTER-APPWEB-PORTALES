import { GoogleGenAI } from "@google/genai";
import { Lesson, QuizQuestion, Phase, User, StudyResource, UserRole } from "../types";

// NOTE: In a real production app, the API Key should not be exposed on the client side directly.
const API_KEY = process.env.API_KEY || ''; 

// --- Existing Lesson Generator ---
export const generateLessonContent = async (title: string, context: string): Promise<{ summary: string; quiz: QuizQuestion[] }> => {
  if (!API_KEY) {
     console.warn("No API Key. Returning Mock Data.");
     return { summary: "<p>Mock Summary</p>", quiz: [] };
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const summaryResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest', // Fast model for simple text
      contents: `Generate an HTML summary for a lesson titled "${title}". Context: ${context}. Use Tailwind classes.`,
    });
    const quizResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: `Generate 5 quiz questions JSON for "${title}". Schema: [{id, question, options, correctIndex}]`,
      config: { responseMimeType: "application/json" }
    });

    return {
      summary: summaryResult.text || '',
      quiz: JSON.parse(quizResult.text || '[]')
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// --- NEW: Portal Structure Generator (AIWIS Genesis) ---

interface GeneratedPortalData {
  phases: Phase[];
  users: User[];
  resources: StudyResource[];
}

export const generatePortalStructure = async (
  topic: string, 
  companyId: string,
  options: { includeUsers: boolean; includeResources: boolean }
): Promise<GeneratedPortalData> => {

  if (!API_KEY) {
    alert("API Key no configurada en el entorno.");
    throw new Error("No API Key");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Complex prompt for structured data
  const prompt = `
    Actúa como un Arquitecto de Soluciones Educativas (LMS).
    Tu tarea es generar una estructura de curso completa en formato JSON basada en el tema: "${topic}".
    
    Requisitos:
    1. Crea fases (Phases), módulos (WeekModule) dentro de las fases, y lecciones (Lessons) dentro de los módulos.
    2. Los IDs deben ser únicos (usa timestamps o random strings simples).
    3. ${options.includeUsers ? 'Genera 5 usuarios "dummy" con nombres realistas, emails corporativos ficticios y passwords "123".' : 'No generes usuarios.'}
    4. ${options.includeResources ? 'Genera 3 recursos de estudio (StudyResource) relacionados al tema.' : 'No generes recursos.'}
    
    El formato de salida debe ser ESTRICTAMENTE este JSON (sin markdown code blocks):
    {
      "phases": [
        {
          "id": "p_1",
          "title": "Fase 1: [Nombre]",
          "modules": [
            {
              "id": "m_1",
              "title": "Semana 1: [Nombre]",
              "lessons": [
                {
                  "id": "l_1",
                  "title": "[Nombre Clase]",
                  "description": "[Breve descripción]",
                  "thumbnail": "https://picsum.photos/seed/tech/400/225", 
                  "duration": "45m",
                  "completed": false
                }
              ]
            }
          ]
        }
      ],
      "users": [
        {
          "id": "u_gen_1",
          "name": "[Nombre]",
          "email": "[email]",
          "password": "123",
          "role": "STUDENT",
          "companyId": "${companyId}",
          "progress": 0,
          "position": "ESTUDIANTE",
          "skills": { "prompting": 50, "analysis": 50, "tools": 50, "strategy": 50 }
        }
      ],
      "resources": [
        {
          "id": "r_gen_1",
          "title": "[Titulo]",
          "description": "[Desc]",
          "url": "#",
          "type": "LINK"
        }
      ]
    }
  `;

  try {
    // Using Pro model for better logical structuring and JSON adherence
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const jsonText = result.text;
    if (!jsonText) throw new Error("Generación vacía");

    const parsedData = JSON.parse(jsonText) as GeneratedPortalData;
    
    // Post-processing to ensure compatibility
    // (e.g. enforcing empty arrays if AI returns null)
    return {
      phases: parsedData.phases || [],
      users: parsedData.users || [],
      resources: parsedData.resources || []
    };

  } catch (error) {
    console.error("Error en Genesis AI:", error);
    throw new Error("Error generando la estructura. Intenta ser más específico.");
  }
};