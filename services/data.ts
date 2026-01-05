import { CompanyPortal, User, UserRole } from '../types';

// Helper to generate placeholder images
const getThumb = (id: number) => `https://picsum.photos/seed/${id}/400/225`;

// Initial Data
export const INITIAL_COMPANIES: CompanyPortal[] = [
  {
    id: 'c1',
    name: 'SIMPLEDATA',
    slug: 'simpledata',
    themeColor: '#6366f1', // Indigo
    createdAt: '2025-01-01',
    users: [
      { id: 'u2', name: 'Juan Escalona', role: UserRole.STUDENT, companyId: 'c1', progress: 15 },
      { id: 'u3', name: 'Cristobal Arias', role: UserRole.STUDENT, companyId: 'c1', progress: 85 },
      { id: 'u4', name: 'Anibal Alcazar', role: UserRole.STUDENT, companyId: 'c1', progress: 0 },
    ],
    phases: [
      {
        id: 'p1',
        title: 'Fase 1: Fundamentos y IA Aplicada',
        modules: [
          {
            id: 'w1',
            title: 'Semana 1: Productividad Inteligente',
            lessons: [
              { 
                id: 'l1', 
                title: 'Intro a la IA Generativa', 
                description: 'Conceptos básicos sobre LLMs y transformadores.', 
                duration: '45m', 
                thumbnail: getThumb(101), 
                completed: true,
                videoUrl: 'https://www.youtube.com/embed/jKrj8kV8hPI', // Example YouTube
                transcription: 'Bienvenidos a la clase de introducción. Hoy hablaremos de cómo los modelos de lenguaje transforman el texto...',
                quizUrl: 'https://docs.google.com/forms/u/0/'
              },
              { 
                id: 'l2', 
                title: 'Prompt Engineering I', 
                description: 'Estructura de prompts eficientes (Contexto, Instrucción, Formato).', 
                duration: '60m', 
                thumbnail: getThumb(102), 
                completed: true,
                videoUrl: '', 
                transcription: '' 
              },
              { 
                id: 'l3', 
                title: 'Herramientas de Texto', 
                description: 'Comparativa entre ChatGPT, Gemini y Claude.', 
                duration: '50m', 
                thumbnail: getThumb(103), 
                completed: false 
              },
            ]
          },
          {
            id: 'w2',
            title: 'Semana 2: Automatización',
            lessons: [
              { id: 'l4', title: 'Integraciones API', description: 'Conectando servicios', duration: '55m', thumbnail: getThumb(104), completed: false },
            ]
          }
        ]
      },
      {
        id: 'p2',
        title: 'Fase 2: Proyecto Final',
        modules: []
      }
    ]
  },
  {
    id: 'c2',
    name: 'AFRI',
    slug: 'afri',
    themeColor: '#10b981', // Emerald
    createdAt: '2025-01-02',
    users: [
      { id: 'u5', name: 'Alejandro Lopez', role: UserRole.ADMIN, companyId: 'c2', progress: 30 },
    ],
    phases: [
      {
        id: 'p1',
        title: 'Transformación Legacy',
        modules: [
           {
            id: 'w1',
            title: 'Módulo 1: COBOL a IA',
            lessons: [
              { id: 'l1', title: 'Análisis de Código Legacy', description: 'Usando LLMs para leer Cobol', duration: '90m', thumbnail: getThumb(201), completed: true },
            ]
           }
        ]
      }
    ]
  },
  {
    id: 'c3',
    name: 'ADA Ltda',
    slug: 'ada',
    themeColor: '#a855f7', // Purple
    createdAt: '2025-01-03',
    users: [
       { id: 'u6', name: 'Julio Sepulveda', role: UserRole.STUDENT, companyId: 'c3', progress: 75 },
    ],
    phases: [
      {
        id: 'p1',
        title: 'Adopción Corporativa',
        modules: [
           {
            id: 'w1',
            title: 'Onboarding IA',
            lessons: [
              { id: 'l1', title: 'Políticas de uso', description: 'Seguridad y privacidad', duration: '30m', thumbnail: getThumb(301), completed: true },
            ]
           }
        ]
      }
    ]
  }
];

export const MASTER_USER: User = {
  id: 'master1',
  name: 'Armin Salazar',
  role: UserRole.MASTER,
  companyId: 'AIWIS',
  avatarUrl: 'https://ui-avatars.com/api/?name=Armin+Salazar&background=random'
};
