export enum UserRole {
  MASTER = 'MASTER', // Armin / AIWIS
  ADMIN = 'ADMIN',   // Company Admin
  STUDENT = 'STUDENT'
}

export interface UserSkills {
  prompting: number;
  analysis: number;
  tools: number;
  strategy: number;
  [key: string]: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  companyId: string;
  avatarUrl?: string;
  progress?: number;
  skills?: UserSkills; // FIFA Style stats
  position?: string; // e.g., "PROMPTER", "ARCHITECT"
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  duration: string;
  completed: boolean;
  transcription?: string;
  quizUrl?: string;
}

export interface WeekModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Phase {
  id: string;
  title: string;
  modules: WeekModule[];
}

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface CompanyPortal {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  themeColor: string;
  phases: Phase[];
  users: User[];
  posts: ForumPost[];
  createdAt: string;
  skillLabels?: { [key: string]: string }; // Custom labels for skills (e.g. { prompting: "Ingeniería de Prompts" })
}

export interface AppState {
  currentUser: User | null;
  currentView: 'LOGIN' | 'MASTER_DASHBOARD' | 'COMPANY_PORTAL';
  selectedCompanyId: string | null;
}