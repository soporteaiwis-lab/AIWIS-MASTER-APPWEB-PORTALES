import React, { useState, useEffect } from 'react';
import { CompanyPortal, User, UserRole, Lesson, ForumPost, QuizQuestion } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { ActionModal } from '../components/ActionModal';
import { generateLessonContent } from '../services/ai';
import { 
  PlayCircle, CheckCircle, Lock, BookOpen, Users, 
  LayoutDashboard, LogOut, Settings, Plus, MessageSquare, Edit3, Link as LinkIcon, FileText, Menu, X, Trash2, Edit, Layers, Database, Send, ChevronDown, ChevronUp, AlertCircle, Save, Sparkles, Download, BrainCircuit, FileJson
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface CompanyPortalProps {
  company: CompanyPortal;
  currentUser: User;
  onLogout: () => void;
  onBackToMaster?: () => void;
  onUpdateLesson: (companyId: string, phaseId: string, moduleId: string, lesson: Lesson) => void;
  onCreateLesson: (companyId: string, phaseId: string, moduleId: string, lesson: Lesson) => void;
  onDeleteLesson: (companyId: string, phaseId: string, moduleId: string, lessonId: string) => void;
  onToggleComplete: (companyId: string, phaseId: string, moduleId: string, lessonId: string) => void;
  // Hierarchy & Config
  onAddPhase: (companyId: string, title: string) => void;
  onDeletePhase: (companyId: string, phaseId: string) => void;
  onAddModule: (companyId: string, phaseId: string, title: string) => void;
  onDeleteModule: (companyId: string, phaseId: string, moduleId: string) => void;
  onUpdateCompany: (companyId: string, data: Partial<CompanyPortal>) => void;
  onAddPost: (companyId: string, post: ForumPost) => void;
  // User Management
  onAddUser: (companyId: string, user: User) => void;
  onUpdateUser: (companyId: string, user: User) => void;
  onDeleteUser: (companyId: string, userId: string) => void;
}

export const CompanyPortalView: React.FC<CompanyPortalProps> = ({ 
  company, 
  currentUser, 
  onLogout, 
  onBackToMaster,
  onUpdateLesson,
  onCreateLesson,
  onDeleteLesson,
  onToggleComplete,
  onAddPhase,
  onDeletePhase,
  onAddModule,
  onDeleteModule,
  onUpdateCompany,
  onAddPost,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'team' | 'forum'>('dashboard');
  const [activePhase, setActivePhase] = useState(0);
  const [activeWeek, setActiveWeek] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modals State
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonViewMode, setLessonViewMode] = useState<'VIDEO' | 'SUMMARY' | 'QUIZ'>('VIDEO'); // New state for lesson modal view
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false); 
  const [editForm, setEditForm] = useState<Partial<Lesson>>({});
  
  // AI Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number}>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Custom Action Modals
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; title: string; type: 'PHASE' | 'MODULE'; parentId?: string }>({ isOpen: false, title: '', type: 'PHASE' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; title: string; onConfirm: () => void }>({ isOpen: false, title: '', onConfirm: () => {} });

  // Config Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({ name: company.name, themeColor: company.themeColor });

  // Forum State
  const [newPostContent, setNewPostContent] = useState('');

  // Team View State: Player Card Edit
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', position: 'ESTUDIANTE' });

  const isMaster = currentUser.role === UserRole.MASTER;
  const primaryColor = company.themeColor;

  // --- SYNCHRONIZATION LOGIC ---
  useEffect(() => {
    if (selectedLesson) {
       let foundLesson: Lesson | undefined;
       for (const phase of company.phases) {
         for (const module of phase.modules) {
           const match = module.lessons.find(l => l.id === selectedLesson.id);
           if (match) {
             foundLesson = match;
             break;
           }
         }
         if (foundLesson) break;
       }

       if (foundLesson) {
         if (foundLesson.completed !== selectedLesson.completed || foundLesson.title !== selectedLesson.title || foundLesson.description !== selectedLesson.description || foundLesson.aiSummaryHtml !== selectedLesson.aiSummaryHtml) {
            setSelectedLesson(foundLesson);
         }
       } else {
         setSelectedLesson(null);
       }
    }
  }, [company, selectedLesson]);

  // Reset quiz when lesson changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizScore(null);
    setLessonViewMode('VIDEO');
  }, [selectedLesson?.id]);

  // Safety checks
  useEffect(() => {
    if (activePhase >= company.phases.length && company.phases.length > 0) setActivePhase(0);
  }, [company.phases.length, activePhase]);

  useEffect(() => {
    const currentP = company.phases[activePhase];
    if (currentP && activeWeek >= currentP.modules.length && currentP.modules.length > 0) setActiveWeek(0);
  }, [company.phases, activePhase, activeWeek]);

  const currentPhase = company.phases[activePhase];
  const currentModule = currentPhase?.modules[activeWeek];

  // --- Helpers ---
  const getYoutubeEmbed = (url?: string) => {
     if (!url) return null;
     if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://www.youtube.com/embed/${id}`;
     }
     return null;
  };

  const calculateTotalLessons = () => {
    let total = 0;
    let completed = 0;
    company.phases.forEach(p => p.modules.forEach(m => m.lessons.forEach(l => {
      total++;
      if (l.completed) completed++;
    })));
    return { total, completed, percentage: total === 0 ? 0 : Math.round((completed / total) * 100) };
  };

  const stats = calculateTotalLessons();

  const calculateOverall = (user: User) => {
    if (!user.skills) return user.progress || 0;
    const skills = Object.values(user.skills);
    const avgSkills = skills.reduce((a, b) => a + b, 0) / skills.length;
    // Weighted: 40% Progress, 60% Skills
    return Math.round(((user.progress || 0) * 0.4) + (avgSkills * 0.6));
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Handlers ---
  const handleGenerateAI = async () => {
    if (!editForm.title) return alert("Ingresa un título primero");
    
    setIsGeneratingAI(true);
    try {
      const context = editForm.description + (editForm.transcription ? "\n" + editForm.transcription : "");
      const { summary, quiz } = await generateLessonContent(editForm.title, context);
      
      setEditForm(prev => ({
        ...prev,
        aiSummaryHtml: summary,
        aiQuiz: quiz
      }));
    } catch (error) {
      alert("Error generando contenido IA. Intente nuevamente.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddPhaseClick = () => setActionModal({ isOpen: true, title: 'Nueva Fase', type: 'PHASE' });
  
  const handleAddModuleClick = () => {
    if (!currentPhase) return alert("Primero debes crear o seleccionar una Fase.");
    setActionModal({ isOpen: true, title: `Nuevo Módulo en ${currentPhase.title}`, type: 'MODULE', parentId: currentPhase.id });
  };

  const handleActionSubmit = (value: string) => {
    if (actionModal.type === 'PHASE') onAddPhase(company.id, value);
    else if (actionModal.type === 'MODULE' && actionModal.parentId) onAddModule(company.id, actionModal.parentId, value);
    setActionModal({ ...actionModal, isOpen: false });
  };

  const handleDeletePhaseClick = (e: React.MouseEvent, phaseId: string) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, title: '¿Eliminar Fase y contenido?', onConfirm: () => onDeletePhase(company.id, phaseId) });
  };

  const handleDeleteModuleClick = (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    if (currentPhase) setDeleteConfirm({ isOpen: true, title: '¿Eliminar Módulo?', onConfirm: () => onDeleteModule(company.id, currentPhase.id, moduleId) });
  };

  const handleOpenLesson = (lesson: Lesson, mode: 'VIDEO' | 'SUMMARY' | 'QUIZ' = 'VIDEO') => {
    setSelectedLesson(lesson);
    setLessonViewMode(mode);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditForm(lesson);
    setIsEditing(true);
    setIsCreating(false);
    setSelectedLesson(lesson);
  };

  const handleCreateLessonStart = () => {
    setEditForm({ title: '', description: '', duration: '0m', videoUrl: '', transcription: '', quizUrl: '' });
    setIsCreating(true);
    setIsEditing(true);
    setSelectedLesson({ id: 'temp', title: 'Nueva Clase', description: '', thumbnail: 'https://picsum.photos/seed/new/400/225', duration: '', completed: false } as Lesson);
  };

  const handleSaveLesson = () => {
    if (!currentPhase || !currentModule) return;
    const lessonData = {
       ...editForm,
       aiSummaryHtml: editForm.aiSummaryHtml,
       aiQuiz: editForm.aiQuiz
    } as Lesson;

    if (isCreating && editForm.title) {
      const newLesson: Lesson = {
        ...lessonData,
        id: `l-${Date.now()}`,
        thumbnail: `https://picsum.photos/seed/${Date.now()}/400/225`,
        completed: false,
      };
      onCreateLesson(company.id, currentPhase.id, currentModule.id, newLesson);
      setIsCreating(false);
      setIsEditing(false);
      setSelectedLesson(null);
    } else if (selectedLesson && editForm.id) {
      onUpdateLesson(company.id, currentPhase.id, currentModule.id, { ...selectedLesson, ...lessonData });
      setIsEditing(false);
      setSelectedLesson({ ...selectedLesson, ...lessonData });
    }
  };

  const handleDeleteCurrentLesson = () => {
    if (selectedLesson && currentPhase && currentModule && window.confirm('¿Borrar esta clase permanentemente?')) {
      onDeleteLesson(company.id, currentPhase.id, currentModule.id, selectedLesson.id);
      setSelectedLesson(null); 
    }
  };

  const handleToggleCompleteWrapper = (e?: React.MouseEvent) => {
     if (e) e.stopPropagation();
     if(currentPhase && currentModule && selectedLesson) {
        onToggleComplete(company.id, currentPhase.id, currentModule.id, selectedLesson.id);
     }
  };

  const handleSaveConfig = () => {
    onUpdateCompany(company.id, configForm);
    setShowConfigModal(false);
  };

  const handleSendPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    
    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      content: newPostContent,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    onAddPost(company.id, newPost);
    setNewPostContent('');
  };

  const handleAddUserSubmit = () => {
    if(!newUserForm.name) return;
    const u: User = {
      id: `u-${Date.now()}`,
      name: newUserForm.name,
      role: UserRole.STUDENT,
      companyId: company.id,
      progress: 0,
      position: newUserForm.position || 'NUEVO INGRESO',
      skills: { prompting: 50, analysis: 50, tools: 50, strategy: 50 }
    };
    onAddUser(company.id, u);
    setShowAddUserModal(false);
    setNewUserForm({ name: '', position: 'ESTUDIANTE' });
  };

  const handleSaveUserSkills = () => {
    if(editingUser) {
      onUpdateUser(company.id, editingUser);
      setEditingUser(null);
    }
  };

  const handleQuizSubmit = () => {
    if (!selectedLesson?.aiQuiz) return;
    let score = 0;
    selectedLesson.aiQuiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) score++;
    });
    setQuizScore(score);
  };

  // --- VIEWS ---

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-900/50">
         <div className="w-10 h-10 rounded-lg mr-3 flex items-center justify-center font-bold text-white shadow-lg transition-colors duration-500 bg-gradient-to-br from-indigo-500 to-purple-600">
           {company.name.charAt(0)}
         </div>
         <span className="font-bold text-white text-lg tracking-tight truncate">{company.name}</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <LayoutDashboard size={20} />
          Inicio
        </button>
        <button onClick={() => { setActiveTab('content'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <BookOpen size={20} />
          Clases
        </button>
        <button onClick={() => { setActiveTab('team'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'team' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <Users size={20} />
          Estudiantes
        </button>
        <button onClick={() => { setActiveTab('forum'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'forum' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <MessageSquare size={20} />
          Guía de Estudios
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 px-2 p-2 bg-slate-800 rounded-xl border border-slate-700">
           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
              {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="User" /> : <span className="text-xs">{currentUser.name.charAt(0)}</span>}
           </div>
           <div className="overflow-hidden">
             <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
             <div className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{isMaster ? 'Mentor AIWIS' : currentUser.role}</div>
           </div>
        </div>
        <Button variant="secondary" fullWidth onClick={onLogout} className="justify-start px-2 bg-slate-800 border-slate-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50">
          <LogOut size={16} className="mr-2" /> Salir
        </Button>
      </div>
    </>
  );

  const DashboardView = () => {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="text-3xl font-bold text-white mb-1">Bienvenido, {currentUser.name.split(' ')[0]}</h1>
             <p className="text-slate-400">Tu panel de control de aprendizaje.</p>
          </div>
          {isMaster && (
             <div className="flex gap-2">
                <Button variant="secondary" onClick={onBackToMaster} className="text-xs"><Database size={14} className="mr-2"/> Master DB</Button>
                <Button variant="secondary" onClick={() => setShowConfigModal(true)} className="text-xs"><Settings size={14} className="mr-2"/> Config</Button>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Profile Card */}
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-32 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="flex items-center gap-6 mb-8 relative z-10">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                    {currentUser.name.charAt(0)}
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
                    <span className="text-indigo-400 font-medium">Estudiante Activo</span>
                 </div>
              </div>

              <div className="space-y-6 relative z-10">
                 <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles size={14} className="text-yellow-500"/> Fortalezas</h3>
                    <div className="space-y-3">
                       {Object.entries(currentUser.skills || {prompting: 0, tools: 0, analysis: 0}).slice(0, 3).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between group/skill">
                             <span className="text-slate-300 capitalize">{company.skillLabels?.[key] || key}</span>
                             <div className="flex items-center gap-3 w-1/2">
                                <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${val}%` }}></div>
                                </div>
                                <span className="text-sm font-bold text-white w-6 text-right">{val}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><BarChart size={14} className="text-green-500"/> Progreso del Curso</h3>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-4xl font-bold text-white">{stats.percentage}%</span>
                       <span className="text-sm text-slate-400">{stats.completed} / {stats.total} Clases</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${stats.percentage}%` }}></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Report / Action Card */}
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                 <h2 className="text-xl font-bold text-white mb-6">Generar Reporte</h2>
                 <form className="space-y-4">
                    <div>
                       <label className="block text-sm text-slate-400 mb-1">Tu Nombre</label>
                       <input type="text" value={currentUser.name} disabled className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                       <label className="block text-sm text-slate-400 mb-1">Empresa</label>
                       <input type="text" value={company.name} disabled className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                       <label className="block text-sm text-slate-400 mb-1">Agregar Idea o Pregunta</label>
                       <textarea 
                          rows={3}
                          placeholder="Describe tu idea o pregunta aquí..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none resize-none"
                       />
                    </div>
                 </form>
              </div>
              <Button fullWidth className="mt-6 bg-indigo-600 hover:bg-indigo-500 py-3 text-lg">
                 Enviar Reporte
              </Button>
           </div>
        </div>
      </div>
    );
  };

  const ContentView = () => {
    return (
       <div className="space-y-8 animate-fade-in pb-20">
          
          {/* Phase Tabs - Styled like ADA */}
          <div className="flex justify-center gap-4">
             {company.phases.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => { setActivePhase(idx); setActiveWeek(0); }}
                  className={`px-8 py-3 rounded-lg font-bold transition-all text-sm flex items-center gap-2 relative ${
                    activePhase === idx 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 -translate-y-1' 
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {phase.title}
                  {activePhase === idx && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45"></span>}
                </button>
             ))}
             {isMaster && (
               <button onClick={handleAddPhaseClick} className="w-10 h-10 rounded-lg bg-slate-900 border border-dashed border-slate-700 text-slate-500 hover:text-white flex items-center justify-center">
                 <Plus size={20} />
               </button>
             )}
          </div>

          {/* Modules/Weeks Tabs */}
          {currentPhase && (
             <div className="flex justify-center gap-3 flex-wrap">
                {currentPhase.modules.map((module, idx) => (
                  <button
                    key={module.id}
                    onClick={() => setActiveWeek(idx)}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
                      activeWeek === idx 
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' 
                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {module.title}
                  </button>
                ))}
                {isMaster && (
                  <button onClick={handleAddModuleClick} className="px-4 py-2 rounded-full border border-dashed border-slate-700 text-slate-500 hover:text-white text-xs">
                     + Módulo
                  </button>
                )}
             </div>
          )}

          {/* Title Header for Section */}
          {currentModule && (
             <div className="flex items-center gap-3 mb-6">
                <Layers className="text-indigo-500" />
                <h2 className="text-xl font-bold text-white">{currentModule.title}</h2>
             </div>
          )}

          {/* Content Grid */}
          {currentModule ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentModule.lessons.map(lesson => {
                   const embedUrl = getYoutubeEmbed(lesson.videoUrl);
                   return (
                     <div key={lesson.id} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col h-full">
                        {/* Thumbnail Area */}
                        <div className="relative aspect-video bg-slate-950">
                           {embedUrl ? (
                              <div className="w-full h-full pointer-events-none">
                                <iframe src={`${embedUrl}?controls=0&showinfo=0`} className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" title={lesson.title} loading="lazy"></iframe>
                              </div>
                           ) : (
                              <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                           )}
                           
                           {/* Overlay Play Button */}
                           <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => handleOpenLesson(lesson)}>
                              <div className="w-14 h-14 rounded-full bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-indigo-600 transition-all border border-white/10 group-hover:border-indigo-400">
                                 <PlayCircle size={32} fill="white" className="text-transparent" />
                              </div>
                           </div>

                           {/* Status Badge */}
                           <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg ${lesson.completed ? 'bg-emerald-500 text-white' : 'bg-slate-800/90 text-slate-400 backdrop-blur-md'}`}>
                              {lesson.completed ? <CheckCircle size={12} fill="currentColor" className="text-white"/> : <div className="w-2 h-2 rounded-full bg-slate-500"></div>}
                              {lesson.completed ? 'Visto' : 'Pendiente'}
                           </div>
                           
                           {/* AI Badge if content exists */}
                           {lesson.aiSummaryHtml && (
                             <div className="absolute top-3 right-3 px-2 py-1 bg-purple-600/90 text-white rounded text-[10px] font-bold shadow-lg flex items-center gap-1" title="Contenido IA Generado">
                               <Sparkles size={10} /> IA
                             </div>
                           )}
                        </div>

                        {/* Content Area */}
                        <div className="p-5 flex flex-col flex-1">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2" onClick={() => handleOpenLesson(lesson)}>{lesson.title}</h3>
                              {isMaster && <button onClick={() => handleEditLesson(lesson)} className="text-slate-600 hover:text-white p-1"><Edit3 size={14}/></button>}
                           </div>
                           <p className="text-xs text-slate-400 line-clamp-2 mb-6 flex-1">{lesson.description}</p>
                           
                           {/* Action Buttons */}
                           <div className="grid grid-cols-2 gap-3 mt-auto">
                              <button 
                                onClick={() => handleOpenLesson(lesson, 'SUMMARY')}
                                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-700"
                              >
                                <FileText size={14} /> Texto
                              </button>
                              <button 
                                onClick={() => handleOpenLesson(lesson, 'QUIZ')}
                                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-700"
                              >
                                <BrainCircuit size={14} /> Quiz
                              </button>
                           </div>
                        </div>
                     </div>
                   );
                })}
                {isMaster && (
                   <div onClick={handleCreateLessonStart} className="border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-600 hover:text-white hover:border-indigo-500 hover:bg-slate-900/50 cursor-pointer min-h-[350px] transition-all group">
                      <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform mb-4 border border-slate-800 group-hover:border-indigo-500">
                         <Plus size={32} className="text-slate-500 group-hover:text-indigo-400"/>
                      </div>
                      <span className="text-sm font-bold mt-2">Agregar Nueva Clase</span>
                   </div>
                )}
             </div>
          ) : (
             <div className="text-center py-20 text-slate-500">Selecciona fase y módulo</div>
          )}
       </div>
    );
  };

  const TeamView = () => {
     return (
        <div className="space-y-6 animate-fade-in pb-20">
           <div className="flex justify-between items-end">
             <div>
                <h1 className="text-3xl font-bold text-white mb-1">Equipo</h1>
                <p className="text-slate-400">Progreso y habilidades (Skills) de los estudiantes.</p>
             </div>
             {isMaster && (
                <Button onClick={() => setShowAddUserModal(true)}><Plus size={16} className="mr-2"/> Agregar Alumno</Button>
             )}
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {company.users.map(user => {
                 const overall = calculateOverall(user);
                 const skills = user.skills || { prompting: 0, analysis: 0, tools: 0, strategy: 0 };
                 
                 return (
                    <div 
                      key={user.id} 
                      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-slate-900 to-slate-950 ${isMaster ? 'cursor-pointer hover:border-indigo-500' : 'border-slate-800'}`}
                      style={{ borderColor: isMaster ? undefined : company.themeColor }}
                      onClick={() => isMaster && setEditingUser(user)}
                    >
                       {/* FIFA CARD HEADER */}
                       <div className="p-4 flex items-start gap-4 border-b border-slate-800/50 bg-slate-900/50">
                          <div className="relative">
                             <div className="w-16 h-16 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800">
                                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-xl">{user.name.charAt(0)}</div>}
                             </div>
                             <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center font-bold text-sm text-white shadow-lg" style={{ color: overall > 80 ? '#fbbf24' : '#94a3b8' }}>
                                {overall}
                             </div>
                          </div>
                          <div className="flex-1 min-w-0">
                             <h3 className="font-bold text-lg text-white truncate">{user.name}</h3>
                             <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">{user.position || user.role}</div>
                             <div className="flex items-center gap-1 mt-1">
                                <img src={`https://flagcdn.com/24x18/${'cl'}.png`} alt="Country" className="h-3 rounded-sm opacity-70" />
                                <span className="text-[10px] text-slate-500 font-bold">AIWIS ACADEMY</span>
                             </div>
                          </div>
                       </div>

                       {/* FIFA STATS */}
                       <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                          <div className="flex justify-between items-center">
                             <span className="text-slate-500 font-bold text-xs uppercase">{company.skillLabels?.prompting || 'PRO'}</span>
                             <span className={`font-bold ${skills.prompting > 80 ? 'text-emerald-400' : 'text-white'}`}>{skills.prompting}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-slate-500 font-bold text-xs uppercase">{company.skillLabels?.analysis || 'ANA'}</span>
                             <span className={`font-bold ${skills.analysis > 80 ? 'text-emerald-400' : 'text-white'}`}>{skills.analysis}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-slate-500 font-bold text-xs uppercase">{company.skillLabels?.tools || 'TOO'}</span>
                             <span className={`font-bold ${skills.tools > 80 ? 'text-emerald-400' : 'text-white'}`}>{skills.tools}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-slate-500 font-bold text-xs uppercase">{company.skillLabels?.strategy || 'STR'}</span>
                             <span className={`font-bold ${skills.strategy > 80 ? 'text-emerald-400' : 'text-white'}`}>{skills.strategy}</span>
                          </div>
                       </div>

                       {/* PROGRESS BAR FOOTER */}
                       <div className="px-4 pb-4">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase font-bold">
                             <span>Clases Completadas</span>
                             <span>{user.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full transition-all duration-1000" style={{ width: `${user.progress}%`, backgroundColor: company.themeColor }}></div>
                          </div>
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
     );
  };

  const ForumView = () => {
     return (
        <div className="space-y-6 animate-fade-in pb-20 h-full flex flex-col">
           <div className="shrink-0">
              <h1 className="text-3xl font-bold text-white mb-1">Foro & Consultas</h1>
              <p className="text-slate-400">Espacio de comunicación asíncrona.</p>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 min-h-[400px]">
              {company.posts.length > 0 ? (
                 company.posts.map(post => (
                    <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-800 flex shrink-0 items-center justify-center font-bold text-slate-400 overflow-hidden">
                          {post.userAvatar ? <img src={post.userAvatar} className="w-full h-full object-cover"/> : post.userName.charAt(0)}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                             <span className="font-bold text-white text-sm">{post.userName}</span>
                             <span className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="text-center py-20 text-slate-600 italic border border-dashed border-slate-800 rounded-xl">
                    No hay mensajes aún. ¡Sé el primero en preguntar!
                 </div>
              )}
           </div>

           <div className="shrink-0 pt-4 border-t border-slate-800">
              <form onSubmit={handleSendPost} className="flex gap-2">
                 <input 
                    type="text" 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Escribe tu consulta o comentario..." 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                 />
                 <Button type="submit" disabled={!newPostContent.trim()}>
                    <Send size={18} />
                 </Button>
              </form>
           </div>
        </div>
     );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-slate-900 border-r border-slate-800 h-screen">
         <SidebarContent />
      </div>

      {/* Mobile Sidebar (Overlay) */}
      <div className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
         <div className={`w-64 h-full bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-end p-4">
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400"><X size={24} /></button>
            </div>
            <SidebarContent />
         </div>
      </div>
      
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center z-40 sticky top-0">
         <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-200"><Menu size={24} /></button>
             <span className="font-bold text-white">{company.name}</span>
         </div>
         <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: primaryColor }}>{company.name.charAt(0)}</div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'content' && <ContentView />}
          {activeTab === 'team' && <TeamView />}
          {activeTab === 'forum' && <ForumView />}
        </div>
      </main>

      {/* LESSON PLAYER / EDITOR MODAL */}
      <Modal isOpen={!!selectedLesson} onClose={() => setSelectedLesson(null)} title={isEditing ? (isCreating ? 'Nueva Clase' : 'Editar Clase') : (selectedLesson?.title || 'Clase')} maxWidth="max-w-5xl">
        {selectedLesson && (
           isEditing ? (
             <div className="space-y-4">
                {/* --- EDIT MODE --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Título</label>
                        <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Descripción (Contexto para IA)</label>
                        <textarea rows={4} value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Video URL</label>
                            <input type="text" placeholder="https://youtube.com/..." value={editForm.videoUrl || ''} onChange={e => setEditForm({...editForm, videoUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Duración</label>
                            <input type="text" value={editForm.duration || ''} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                        </div>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Transcripción Manual (Opcional)</label>
                         <textarea rows={4} value={editForm.transcription || ''} onChange={e => setEditForm({...editForm, transcription: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none font-mono text-xs" />
                      </div>
                  </div>

                  {/* AI Section */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col">
                     <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold">
                        <Sparkles size={18} /> Generador de Contenido IA
                     </div>
                     <p className="text-xs text-slate-400 mb-4">Gemini generará un resumen HTML estilizado y un Quiz de 5 preguntas basado en el título y descripción ingresados.</p>
                     
                     <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg p-6 bg-slate-900/50">
                        {isGeneratingAI ? (
                           <div className="text-center">
                              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <span className="text-xs text-indigo-400">Analizando contenido con Gemini...</span>
                           </div>
                        ) : editForm.aiSummaryHtml ? (
                           <div className="text-center space-y-2">
                              <CheckCircle size={32} className="text-emerald-500 mx-auto" />
                              <div className="text-sm font-bold text-white">Contenido Generado</div>
                              <div className="text-xs text-slate-500">Resumen HTML + 5 Preguntas Quiz</div>
                              <Button variant="secondary" onClick={handleGenerateAI} className="mt-2 text-xs">Regenerar</Button>
                           </div>
                        ) : (
                           <Button onClick={handleGenerateAI} className="bg-indigo-600 hover:bg-indigo-500">
                              <Sparkles size={16} /> Generar Contenido IA
                           </Button>
                        )}
                     </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-800">
                   {!isCreating ? (<Button variant="danger" onClick={handleDeleteCurrentLesson}><Trash2 size={16} /></Button>) : <div></div>}
                   <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => { setIsEditing(false); if(isCreating) setSelectedLesson(null); }}>Cancelar</Button>
                      <Button onClick={handleSaveLesson}>{isCreating ? 'Crear Clase' : 'Guardar Cambios'}</Button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                {/* --- VIEW MODE --- */}
                
                {/* Tabs */}
                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                   <button 
                     onClick={() => setLessonViewMode('VIDEO')}
                     className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${lessonViewMode === 'VIDEO' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                   >
                     Video
                   </button>
                   <button 
                     onClick={() => setLessonViewMode('SUMMARY')}
                     className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${lessonViewMode === 'SUMMARY' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                   >
                     Resumen IA
                   </button>
                   <button 
                     onClick={() => setLessonViewMode('QUIZ')}
                     className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${lessonViewMode === 'QUIZ' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                   >
                     Quiz IA
                   </button>
                </div>

                {lessonViewMode === 'VIDEO' && (
                  <>
                     <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
                        {selectedLesson.videoUrl ? (
                           <iframe width="100%" height="100%" src={getYoutubeEmbed(selectedLesson.videoUrl) || selectedLesson.videoUrl} title={selectedLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        ) : (
                           <div className="w-full h-full flex items-center justify-center flex-col text-slate-500 gap-2"><PlayCircle size={48} /><span>Video no disponible</span></div>
                        )}
                     </div>
                     <div className="flex justify-between items-start">
                        <div>
                           <h2 className="text-xl font-bold text-white mb-2">{selectedLesson.title}</h2>
                           <p className="text-slate-400">{selectedLesson.description}</p>
                        </div>
                        <Button fullWidth={false} variant={selectedLesson.completed ? 'ghost' : 'primary'} className={selectedLesson.completed ? 'text-emerald-400' : ''} onClick={() => handleToggleCompleteWrapper()}>
                           {selectedLesson.completed ? <><CheckCircle size={18} /> Visto</> : "Marcar Visto"}
                        </Button>
                     </div>
                     {isMaster && <Button variant="secondary" fullWidth onClick={() => handleEditLesson(selectedLesson)}><Edit3 size={16} /> Editar Contenido</Button>}
                  </>
                )}

                {lessonViewMode === 'SUMMARY' && (
                  <div className="animate-fade-in">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles size={18} className="text-indigo-400"/> Resumen Generado por IA</h3>
                        {selectedLesson.aiSummaryHtml && (
                          <Button variant="secondary" className="text-xs" onClick={() => downloadFile(selectedLesson.aiSummaryHtml!, `${selectedLesson.title}-resumen.html`, 'text/html')}>
                             <Download size={14} /> Descargar HTML
                          </Button>
                        )}
                     </div>
                     {selectedLesson.aiSummaryHtml ? (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson.aiSummaryHtml }}></div>
                     ) : (
                        <div className="text-center py-10 text-slate-500 bg-slate-900 border border-dashed border-slate-800 rounded-xl">
                           <FileText size={32} className="mx-auto mb-2 opacity-50" />
                           No hay resumen generado.
                           {isMaster && <div className="mt-2 text-xs text-indigo-400">Ve a editar para generar contenido con IA.</div>}
                        </div>
                     )}
                  </div>
                )}

                {lessonViewMode === 'QUIZ' && (
                   <div className="animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-bold text-white flex items-center gap-2"><BrainCircuit size={18} className="text-indigo-400"/> Quiz de Conocimientos</h3>
                         {selectedLesson.aiQuiz && (
                           <Button variant="secondary" className="text-xs" onClick={() => downloadFile(JSON.stringify(selectedLesson.aiQuiz, null, 2), `${selectedLesson.title}-quiz.json`, 'application/json')}>
                              <FileJson size={14} /> Descargar JSON
                           </Button>
                         )}
                      </div>
                      
                      {selectedLesson.aiQuiz && selectedLesson.aiQuiz.length > 0 ? (
                         <div className="space-y-6">
                            {selectedLesson.aiQuiz.map((q, idx) => (
                               <div key={q.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                                  <h4 className="font-bold text-white mb-3 text-sm">{idx + 1}. {q.question}</h4>
                                  <div className="space-y-2">
                                     {q.options.map((opt, optIdx) => (
                                        <button
                                          key={optIdx}
                                          onClick={() => !quizScore && setQuizAnswers({...quizAnswers, [q.id]: optIdx})}
                                          className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
                                             quizScore !== null
                                                ? optIdx === q.correctIndex 
                                                   ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                                                   : quizAnswers[q.id] === optIdx 
                                                      ? 'bg-red-500/20 border-red-500 text-red-300' 
                                                      : 'bg-slate-950 border-slate-800 text-slate-500'
                                                : quizAnswers[q.id] === optIdx
                                                   ? 'bg-indigo-600 text-white border-indigo-600'
                                                   : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                                          }`}
                                        >
                                           {opt}
                                        </button>
                                     ))}
                                  </div>
                               </div>
                            ))}
                            
                            {!quizScore ? (
                               <Button fullWidth onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < selectedLesson.aiQuiz.length}>
                                  Enviar Respuestas
                               </Button>
                            ) : (
                               <div className="text-center p-4 bg-slate-800 rounded-xl border border-slate-700">
                                  <div className="text-sm text-slate-400 uppercase tracking-widest">Tu Puntaje</div>
                                  <div className="text-4xl font-bold text-white my-2">
                                     {quizScore} / {selectedLesson.aiQuiz.length}
                                  </div>
                                  <Button onClick={() => { setQuizScore(null); setQuizAnswers({}); }}>Intentar de nuevo</Button>
                               </div>
                            )}
                         </div>
                      ) : (
                         <div className="text-center py-10 text-slate-500 bg-slate-900 border border-dashed border-slate-800 rounded-xl">
                           <BrainCircuit size={32} className="mx-auto mb-2 opacity-50" />
                           No hay quiz generado.
                           {isMaster && <div className="mt-2 text-xs text-indigo-400">Ve a editar para generar contenido con IA.</div>}
                        </div>
                      )}
                   </div>
                )}
             </div>
           )
        )}
      </Modal>

      {/* Config Modal */}
      <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} title="Configuración del Portal" maxWidth="max-w-md">
         <div className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-400 mb-1">Nombre del Portal</label><input type="text" value={configForm.name} onChange={e => setConfigForm({...configForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-400 mb-1">Color Principal</label><div className="flex gap-2 flex-wrap">{['#6366f1', '#10b981', '#a855f7', '#f43f5e', '#f59e0b', '#3b82f6', '#ec4899'].map(color => (<button key={color} type="button" onClick={() => setConfigForm({...configForm, themeColor: color})} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${configForm.themeColor === color ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />))}</div></div>
            <div className="pt-4 flex gap-3"><Button variant="secondary" fullWidth onClick={() => setShowConfigModal(false)}>Cancelar</Button><Button fullWidth onClick={handleSaveConfig}>Guardar</Button></div>
         </div>
      </Modal>

      {/* Edit User Skills Modal (Master Only) */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Editar Habilidades (Skills)" maxWidth="max-w-md">
         {editingUser && (
            <div className="space-y-6">
               <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold">{editingUser.name.charAt(0)}</div>
                  <div>
                     <h4 className="font-bold text-white">{editingUser.name}</h4>
                     <p className="text-xs text-slate-400">{editingUser.position}</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  {['prompting', 'analysis', 'tools', 'strategy'].map(skill => (
                     <div key={skill}>
                        <div className="flex justify-between text-xs mb-1 uppercase font-bold text-slate-400">
                           <span>{company.skillLabels?.[skill] || skill}</span>
                           <span className="text-white">{editingUser.skills?.[skill] || 0}</span>
                        </div>
                        <input 
                           type="range" 
                           min="0" 
                           max="99" 
                           value={editingUser.skills?.[skill] || 0}
                           onChange={(e) => setEditingUser({
                              ...editingUser,
                              skills: { ...editingUser.skills, [skill]: parseInt(e.target.value) } as any
                           })}
                           className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                     </div>
                  ))}
               </div>

               <div className="flex justify-between pt-4 border-t border-slate-800">
                  <Button variant="danger" onClick={() => { if(window.confirm('Eliminar usuario?')) { onDeleteUser(company.id, editingUser.id); setEditingUser(null); } }}><Trash2 size={16}/></Button>
                  <div className="flex gap-2">
                     <Button variant="secondary" onClick={() => setEditingUser(null)}>Cancelar</Button>
                     <Button onClick={handleSaveUserSkills}><Save size={16} className="mr-2"/> Guardar</Button>
                  </div>
               </div>
            </div>
         )}
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="Nuevo Alumno" maxWidth="max-w-sm">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Completo</label>
               <input type="text" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-400 mb-1">Posición / Cargo</label>
               <input type="text" value={newUserForm.position} onChange={e => setNewUserForm({...newUserForm, position: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button variant="secondary" onClick={() => setShowAddUserModal(false)}>Cancelar</Button>
               <Button onClick={handleAddUserSubmit}>Crear</Button>
            </div>
         </div>
      </Modal>

      <ActionModal isOpen={actionModal.isOpen} onClose={() => setActionModal({ ...actionModal, isOpen: false })} title={actionModal.title} onSubmit={handleActionSubmit} placeholder={actionModal.type === 'PHASE' ? 'Ej: Fase 3: Expertos' : 'Ej: Semana 1: Fundamentos'} />
      <Modal isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({...deleteConfirm, isOpen: false})} title="Confirmar Eliminación" maxWidth="max-w-sm">
         <div className="space-y-4"><p className="text-slate-300">{deleteConfirm.title} <br/><span className="text-xs text-red-400">Esta acción no se puede deshacer.</span></p><div className="flex gap-3 justify-end"><Button variant="secondary" onClick={() => setDeleteConfirm({...deleteConfirm, isOpen: false})}>Cancelar</Button><Button variant="danger" onClick={() => { deleteConfirm.onConfirm(); setDeleteConfirm({...deleteConfirm, isOpen: false}); }}>Eliminar</Button></div></div>
      </Modal>
    </div>
  );
};