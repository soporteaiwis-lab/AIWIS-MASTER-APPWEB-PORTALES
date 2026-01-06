import React, { useState, useEffect } from 'react';
import { CompanyPortal, User, UserRole, Lesson, ForumPost } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { ActionModal } from '../components/ActionModal';
import { 
  PlayCircle, CheckCircle, Lock, BookOpen, Users, 
  LayoutDashboard, LogOut, Settings, Plus, MessageSquare, Edit3, Link as LinkIcon, FileText, Menu, X, Trash2, Edit, Layers, Database, Send, ChevronDown, ChevronUp, AlertCircle, Save
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
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false); 
  const [editForm, setEditForm] = useState<Partial<Lesson>>({});
  
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
         if (foundLesson.completed !== selectedLesson.completed || foundLesson.title !== selectedLesson.title || foundLesson.description !== selectedLesson.description) {
            setSelectedLesson(foundLesson);
         }
       } else {
         // Lesson deleted? Close modal
         setSelectedLesson(null);
       }
    }
  }, [company, selectedLesson]);

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

  // --- Handlers ---
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

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
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
    if (isCreating && editForm.title) {
      const newLesson: Lesson = {
        id: `l-${Date.now()}`,
        title: editForm.title,
        description: editForm.description || '',
        thumbnail: `https://picsum.photos/seed/${Date.now()}/400/225`,
        duration: editForm.duration || '0m',
        completed: false,
        videoUrl: editForm.videoUrl,
        transcription: editForm.transcription,
        quizUrl: editForm.quizUrl
      };
      onCreateLesson(company.id, currentPhase.id, currentModule.id, newLesson);
      setIsCreating(false);
      setIsEditing(false);
      setSelectedLesson(null);
    } else if (selectedLesson && editForm.id) {
      onUpdateLesson(company.id, currentPhase.id, currentModule.id, { ...selectedLesson, ...editForm } as Lesson);
      setIsEditing(false);
      setSelectedLesson({ ...selectedLesson, ...editForm } as Lesson);
    }
  };

  const handleDeleteCurrentLesson = () => {
    if (selectedLesson && currentPhase && currentModule && window.confirm('¿Borrar esta clase permanentemente?')) {
      onDeleteLesson(company.id, currentPhase.id, currentModule.id, selectedLesson.id);
      setSelectedLesson(null); // Explicitly clear selection
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

  // --- VIEWS ---

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
         <div className="w-8 h-8 rounded mr-3 flex items-center justify-center font-bold text-white shadow-lg transition-colors duration-500" style={{ backgroundColor: primaryColor }}>
           {company.name.charAt(0)}
         </div>
         <span className="font-bold text-white truncate">{company.name}</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <LayoutDashboard size={20} style={{ color: activeTab === 'dashboard' ? primaryColor : undefined }} />
          Dashboard
        </button>
        <button onClick={() => { setActiveTab('content'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'content' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <BookOpen size={20} style={{ color: activeTab === 'content' ? primaryColor : undefined }} />
          Contenidos
        </button>
        <button onClick={() => { setActiveTab('team'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'team' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <Users size={20} style={{ color: activeTab === 'team' ? primaryColor : undefined }} />
          Equipo
        </button>
        <button onClick={() => { setActiveTab('forum'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'forum' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
          <MessageSquare size={20} style={{ color: activeTab === 'forum' ? primaryColor : undefined }} />
          Foro
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="User" /> : <span className="text-xs">{currentUser.name.charAt(0)}</span>}
           </div>
           <div className="overflow-hidden">
             <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
             <div className="text-xs text-slate-500 truncate capitalize">{isMaster ? 'Mentor' : currentUser.role.toLowerCase()}</div>
           </div>
        </div>
        <Button variant="secondary" fullWidth onClick={onLogout} className="justify-start px-2">
          <LogOut size={16} className="mr-2" /> Salir
        </Button>
      </div>
    </>
  );

  const DashboardView = () => {
    const pieData = [
      { name: 'Completado', value: stats.completed },
      { name: 'Pendiente', value: stats.total - stats.completed }
    ];

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
             <p className="text-slate-400">Estado general del portal y tu progreso.</p>
          </div>
          {isMaster && (
             <div className="flex gap-2">
                <Button variant="secondary" onClick={onBackToMaster} className="text-xs"><Database size={14} className="mr-2"/> Master DB</Button>
                <Button variant="secondary" onClick={() => setShowConfigModal(true)} className="text-xs"><Settings size={14} className="mr-2"/> Config</Button>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <Card className="flex items-center gap-4 border-l-4 border-l-indigo-500">
              <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400"><BookOpen size={24}/></div>
              <div>
                 <div className="text-2xl font-bold text-white">{stats.total}</div>
                 <div className="text-xs text-slate-400">Clases Totales</div>
              </div>
           </Card>
           <Card className="flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400"><CheckCircle size={24}/></div>
              <div>
                 <div className="text-2xl font-bold text-white">{stats.completed}</div>
                 <div className="text-xs text-slate-400">Clases Vistas</div>
              </div>
           </Card>
           <Card className="flex items-center gap-4 border-l-4 border-l-amber-500">
              <div className="p-3 bg-amber-500/10 rounded-full text-amber-400"><AlertCircle size={24}/></div>
              <div>
                 <div className="text-2xl font-bold text-white">{stats.total - stats.completed}</div>
                 <div className="text-xs text-slate-400">Pendientes</div>
              </div>
           </Card>
           <Card className="flex items-center gap-4 border-l-4 border-l-purple-500">
              <div className="p-3 bg-purple-500/10 rounded-full text-purple-400"><Users size={24}/></div>
              <div>
                 <div className="text-2xl font-bold text-white">{company.users.length}</div>
                 <div className="text-xs text-slate-400">Miembros Equipo</div>
              </div>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-6">Tu Progreso</h3>
              <div className="h-[250px] flex items-center justify-center">
                 {stats.total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                             <Cell fill={primaryColor} />
                             <Cell fill="#1e293b" />
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border:'none'}}/>
                       </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <span className="text-slate-500">No hay contenido aún.</span>
                 )}
              </div>
              <div className="text-center mt-4">
                 <span className="text-4xl font-bold text-white">{stats.percentage}%</span>
                 <p className="text-slate-400 text-sm">Completado</p>
              </div>
           </Card>
           
           <Card>
              <h3 className="text-lg font-bold text-white mb-4">Última Actividad Foro</h3>
              <div className="space-y-4">
                 {company.posts.slice(0, 3).map(post => (
                    <div key={post.id} className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                       <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                             {post.userAvatar ? <img src={post.userAvatar} className="rounded-full"/> : post.userName.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-300">{post.userName}</span>
                       </div>
                       <p className="text-xs text-slate-400 line-clamp-2">{post.content}</p>
                    </div>
                 ))}
                 {company.posts.length === 0 && <p className="text-slate-500 text-sm">No hay actividad reciente.</p>}
                 <Button fullWidth variant="secondary" onClick={() => setActiveTab('forum')} className="text-xs">Ir al Foro</Button>
              </div>
           </Card>
        </div>
      </div>
    );
  };

  const ContentView = () => {
    return (
       <div className="space-y-6 animate-fade-in pb-20">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Contenidos</h1>
            <p className="text-slate-400">Explora tus fases, módulos y clases.</p>
          </div>

          {/* Phase Tabs */}
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
             {company.phases.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => { setActivePhase(idx); setActiveWeek(0); }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 border ${
                    activePhase === idx 
                      ? 'text-white border-transparent' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                  style={{ backgroundColor: activePhase === idx ? primaryColor : undefined }}
                >
                  <Layers size={16} /> {phase.title}
                  {isMaster && (
                     <span onClick={(e) => handleDeletePhaseClick(e, phase.id)} className="ml-2 hover:text-red-300"><X size={12}/></span>
                  )}
                </button>
             ))}
             {isMaster && (
               <button onClick={handleAddPhaseClick} className="px-4 py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:text-white flex items-center gap-2">
                 <Plus size={16} /> Nueva Fase
               </button>
             )}
          </div>

          {/* Modules Tabs */}
          {currentPhase && (
             <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-slate-800/50">
                {currentPhase.modules.map((module, idx) => (
                  <button
                    key={module.id}
                    onClick={() => setActiveWeek(idx)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      activeWeek === idx 
                        ? 'bg-slate-800 text-white border-slate-700' 
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    {module.title}
                    {isMaster && (
                       <span onClick={(e) => handleDeleteModuleClick(e, module.id)} className="ml-2 hover:text-red-400"><X size={10}/></span>
                    )}
                  </button>
                ))}
                {isMaster && (
                  <button onClick={handleAddModuleClick} className="whitespace-nowrap px-3 py-1 rounded-lg text-xs border border-dashed border-slate-700 text-slate-500 hover:text-white flex items-center gap-1">
                     <Plus size={12} /> Nuevo Módulo
                  </button>
                )}
             </div>
          )}

          {/* Content Grid */}
          {currentModule ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentModule.lessons.map(lesson => {
                   const embedUrl = getYoutubeEmbed(lesson.videoUrl);
                   return (
                     <div key={lesson.id} className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col">
                        <div className="relative aspect-video bg-slate-950">
                           {embedUrl ? (
                              <iframe 
                                src={embedUrl} 
                                title={lesson.title}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                              ></iframe>
                           ) : (
                              <div className="w-full h-full relative cursor-pointer" onClick={() => handleOpenLesson(lesson)}>
                                 <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                       <PlayCircle size={32} style={{ color: primaryColor }} />
                                    </div>
                                 </div>
                              </div>
                           )}
                           {lesson.completed && (
                              <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg pointer-events-none">
                                 <CheckCircle size={12} /> Visto
                              </div>
                           )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleOpenLesson(lesson)}>{lesson.title}</h3>
                              {isMaster && <button onClick={() => handleEditLesson(lesson)} className="text-slate-500 hover:text-white"><Edit3 size={14}/></button>}
                           </div>
                           <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">{lesson.description}</p>
                           <Button fullWidth variant="secondary" onClick={() => handleOpenLesson(lesson)} className="mt-auto text-xs">
                              Ver Detalles / Material
                           </Button>
                        </div>
                     </div>
                   );
                })}
                {isMaster && (
                   <div onClick={handleCreateLessonStart} className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-slate-500 hover:text-white hover:border-slate-600 cursor-pointer min-h-[300px]">
                      <Plus size={32} />
                      <span className="text-sm font-medium mt-2">Agregar Clase</span>
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
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Título de la Clase</label>
                   <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Descripción</label>
                   <textarea rows={3} value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Duración (Ej: 45m)</label>
                      <input type="text" value={editForm.duration || ''} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Video URL (YouTube/Meet)</label>
                      <input type="text" placeholder="https://youtube.com/..." value={editForm.videoUrl || ''} onChange={e => setEditForm({...editForm, videoUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Quiz / Examen URL</label>
                      <input type="text" placeholder="https://docs.google.com/forms/..." value={editForm.quizUrl || ''} onChange={e => setEditForm({...editForm, quizUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Transcripción / Notas</label>
                   <textarea rows={6} value={editForm.transcription || ''} onChange={e => setEditForm({...editForm, transcription: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none font-mono text-sm" />
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-800">
                   {!isCreating ? (<Button variant="danger" onClick={handleDeleteCurrentLesson} className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"><Trash2 size={16} /> Eliminar</Button>) : <div></div>}
                   <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => { setIsEditing(false); if(isCreating) setSelectedLesson(null); }}>Cancelar</Button>
                      <Button onClick={handleSaveLesson}>{isCreating ? 'Crear Clase' : 'Guardar Cambios'}</Button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
                   {selectedLesson.videoUrl ? (
                      <iframe width="100%" height="100%" src={getYoutubeEmbed(selectedLesson.videoUrl) || selectedLesson.videoUrl} title={selectedLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                   ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col text-slate-500 gap-2"><PlayCircle size={48} /><span>Video no disponible</span></div>
                   )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2 space-y-4">
                      <h3 className="text-lg font-bold text-white">Sobre esta clase</h3>
                      <p className="text-slate-400 leading-relaxed">{selectedLesson.description || 'Sin descripción.'}</p>
                      {selectedLesson.transcription && (
                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mt-4">
                           <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2"><FileText size={16} /> Transcripción / Notas</div>
                           <p className="text-sm text-slate-400 whitespace-pre-line leading-relaxed">{selectedLesson.transcription}</p>
                        </div>
                      )}
                   </div>
                   <div className="space-y-4">
                      <Card className="p-4 space-y-3">
                         <div className="text-xs font-bold text-slate-500 uppercase">Tu Progreso</div>
                         <Button fullWidth variant={selectedLesson.completed ? 'ghost' : 'primary'} className={selectedLesson.completed ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : ''} onClick={() => handleToggleCompleteWrapper()}>
                            {selectedLesson.completed ? <><CheckCircle size={18} /> Completada</> : "Marcar como Vista"}
                         </Button>
                         {selectedLesson.quizUrl && (<a href={selectedLesson.quizUrl} target="_blank" rel="noopener noreferrer" className="block"><Button fullWidth variant="secondary" className="border-indigo-500/30 text-indigo-300 hover:text-white"><LinkIcon size={16} /> Realizar Quiz</Button></a>)}
                      </Card>
                      {isMaster && <Button variant="secondary" fullWidth onClick={() => handleEditLesson(selectedLesson)}><Edit3 size={16} /> Editar Contenido</Button>}
                   </div>
                </div>
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