export enum UserRole {
  MASTER = 'MASTER', // Armin / AIWIS
  ADMIN = 'ADMIN',   // Company Admin
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  companyId: string; // 'AIWIS' or specific company ID
  avatarUrl?: string;
  progress?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string; // YouTube or Meet URL
  duration: string;
  completed: boolean;
  transcription?: string; // Markdown or plain text
  quizUrl?: string; // Link to a Google Form or Typeform
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
  slug: string; // e.g., 'simpledata', 'ada'
  logoUrl?: string;
  themeColor: string; // Hex code or Tailwind color name
  phases: Phase[];
  users: User[];
  posts: ForumPost[];
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  currentView: 'LOGIN' | 'MASTER_DASHBOARD' | 'COMPANY_PORTAL';
  selectedCompanyId: string | null;
}