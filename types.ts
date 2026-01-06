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
  email: string; // Login Credential
  password?: string; // Login Credential (optional in interface to avoid leaking, but used in logic)
  role: UserRole;
  companyId: string;
  avatarUrl?: string;
  progress?: number;
  skills?: UserSkills;
  position?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
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
  
  // AI Fields
  aiSummaryHtml?: string; 
  aiQuiz?: QuizQuestion[]; 
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

export interface StudyResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'PDF' | 'LINK' | 'DOC' | 'VIDEO';
}

export interface CompanyPortal {
  id: string;
  name: string;
  slug: string; // e.g., 'simpledata', 'ada'
  logoUrl?: string;
  themeColor: string; // Primary color
  secondaryColor?: string; // Gradient accent
  phases: Phase[];
  users: User[];
  posts: ForumPost[];
  resources: StudyResource[]; // New Study Guide Content
  createdAt: string;
  skillLabels?: { [key: string]: string };
}

export interface AppState {
  currentUser: User | null;
  currentView: 'LOGIN' | 'MASTER_DASHBOARD' | 'COMPANY_PORTAL';
  selectedCompanyId: string | null;
}