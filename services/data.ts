import { CompanyPortal, User, UserRole } from '../types';

const getThumb = (id: number) => `https://picsum.photos/seed/${id}/400/225`;

export const INITIAL_COMPANIES: CompanyPortal[] = [
  {
    id: 'c1',
    name: 'SIMPLEDATA',
    slug: 'simpledata',
    themeColor: '#6366f1', // Indigo
    secondaryColor: '#a855f7',
    createdAt: '2025-01-01',
    skillLabels: {
      prompting: 'Prompting',
      analysis: 'Análisis',
      tools: 'Herramientas',
      strategy: 'Estrategia'
    },
    posts: [
      {
        id: 'post1',
        userId: 'u2',
        userName: 'Juan Escalona',
        content: '¿Alguien tiene el link de la documentación de Gemini mencionada en la clase 2?',
        createdAt: '2025-01-10T10:00:00Z',
        likes: 2
      }
    ],
    resources: [
      { id: 'r1', title: 'Manual de Prompting Avanzado', description: 'PDF con técnicas de Chain-of-Thought', url: '#', type: 'PDF' }
    ],
    users: [
      { 
        id: 'u2', name: 'Juan Escalona', email: 'juan@simpledata.cl', password: '123', role: UserRole.STUDENT, companyId: 'c1', progress: 15, position: 'DEV JUNIOR',
        skills: { prompting: 45, analysis: 60, tools: 30, strategy: 20 }
      },
      { 
        id: 'u3', name: 'Cristobal Arias', email: 'cristobal@simpledata.cl', password: '123', role: UserRole.STUDENT, companyId: 'c1', progress: 85, position: 'AI LEAD',
        skills: { prompting: 90, analysis: 85, tools: 95, strategy: 80 }
      }
    ],
    phases: [
      {
        id: 'p1',
        title: 'Fase 1: Fundamentos',
        modules: [
          {
            id: 'w1',
            title: 'Semana 1: Productividad',
            lessons: [
              { 
                id: 'l1', 
                title: 'Intro a la IA Generativa', 
                description: 'Conceptos básicos sobre LLMs.', 
                duration: '45m', 
                thumbnail: getThumb(101), 
                completed: true,
                videoUrl: 'https://www.youtube.com/embed/jKrj8kV8hPI'
              },
              { 
                id: 'l2', 
                title: 'Prompt Engineering I', 
                description: 'Estructura de prompts eficientes.', 
                duration: '60m', 
                thumbnail: getThumb(102), 
                completed: false,
                videoUrl: '' 
              },
               { 
                id: 'l3', 
                title: 'Herramientas de Texto', 
                description: 'Comparativa ChatGPT vs Gemini.', 
                duration: '50m', 
                thumbnail: getThumb(103), 
                completed: false 
              },
               { 
                id: 'l4', 
                title: 'Automatización Básica', 
                description: 'Uso de Zapier con IA.', 
                duration: '40m', 
                thumbnail: getThumb(104), 
                completed: false 
              },
              { 
                id: 'l5', 
                title: 'Ética en IA', 
                description: 'Seguridad de datos.', 
                duration: '30m', 
                thumbnail: getThumb(105), 
                completed: false 
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    name: 'ADA Ltda',
    slug: 'ada',
    themeColor: '#0f172a', // Midnight
    secondaryColor: '#3b82f6', // Blue
    createdAt: '2025-01-03',
    resources: [],
    posts: [],
    users: [
       { id: 'u6', name: 'Julio Sepulveda', email: 'julio@ada.cl', password: '123', role: UserRole.STUDENT, companyId: 'c3', progress: 75, position: 'ANALYST', skills: { prompting: 70, analysis: 70, tools: 70, strategy: 70 } },
    ],
    phases: [
       {
        id: 'p1',
        title: 'Fase 1: Transformación Digital',
        modules: [
          {
            id: 'w1',
            title: 'Módulo 1: Cultura de Datos',
            lessons: []
          }
        ]
      }
    ]
  }
];

export const MASTER_USER: User = {
  id: 'master1',
  name: 'Armin Salazar',
  email: 'armin@aiwis.cl',
  password: '123',
  role: UserRole.MASTER,
  companyId: 'AIWIS',
  avatarUrl: 'https://ui-avatars.com/api/?name=Armin+Salazar&background=random',
  position: 'CEO / MASTER'
};