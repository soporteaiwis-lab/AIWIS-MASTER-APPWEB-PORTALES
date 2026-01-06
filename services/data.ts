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
    users: [
      { 
        id: 'u2', name: 'Juan Escalona', role: UserRole.STUDENT, companyId: 'c1', progress: 15, position: 'DEV JUNIOR',
        skills: { prompting: 45, analysis: 60, tools: 30, strategy: 20 }
      },
      { 
        id: 'u3', name: 'Cristobal Arias', role: UserRole.STUDENT, companyId: 'c1', progress: 85, position: 'AI LEAD',
        skills: { prompting: 90, analysis: 85, tools: 95, strategy: 80 }
      },
      { 
        id: 'u4', name: 'Anibal Alcazar', role: UserRole.STUDENT, companyId: 'c1', progress: 0, position: 'MANAGER',
        skills: { prompting: 10, analysis: 40, tools: 10, strategy: 70 }
      },
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
                videoUrl: 'https://www.youtube.com/embed/jKrj8kV8hPI', 
                transcription: 'Bienvenidos a la clase de introducción...',
                quizUrl: 'https://docs.google.com/forms/u/0/'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    name: 'AFRI',
    slug: 'afri',
    themeColor: '#10b981', // Emerald
    createdAt: '2025-01-02',
    skillLabels: { prompting: 'Código', analysis: 'Legacy', tools: 'Migración', strategy: 'Arquitectura' },
    posts: [],
    users: [
      { id: 'u5', name: 'Alejandro Lopez', role: UserRole.ADMIN, companyId: 'c2', progress: 30, position: 'CTO', skills: { prompting: 80, analysis: 99, tools: 70, strategy: 90 } },
    ],
    phases: []
  },
  {
    id: 'c3',
    name: 'ADA Ltda',
    slug: 'ada',
    themeColor: '#a855f7', // Purple
    createdAt: '2025-01-03',
    posts: [],
    users: [
       { id: 'u6', name: 'Julio Sepulveda', role: UserRole.STUDENT, companyId: 'c3', progress: 75, position: 'ANALYST', skills: { prompting: 70, analysis: 70, tools: 70, strategy: 70 } },
    ],
    phases: []
  }
];

export const MASTER_USER: User = {
  id: 'master1',
  name: 'Armin Salazar',
  role: UserRole.MASTER,
  companyId: 'AIWIS',
  avatarUrl: 'https://ui-avatars.com/api/?name=Armin+Salazar&background=random',
  position: 'CEO / MASTER'
};