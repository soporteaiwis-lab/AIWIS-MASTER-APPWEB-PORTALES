import React, { useState, useEffect } from 'react';
import { CompanyPortal, User, UserRole, Lesson } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { ActionModal } from '../components/ActionModal';
import { 
  PlayCircle, CheckCircle, Lock, BookOpen, Users, 
  LayoutDashboard, LogOut, Settings, Plus, Github, MessageSquare, Edit3, Link as LinkIcon, FileText, Menu, X, Trash2, Edit, Layers, Database
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  onUpdateCompany
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'students'>('home');
  const [activePhase, setActivePhase] = useState(0);
  const [activeWeek, setActiveWeek] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modals State
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // Creating a new lesson
  const [editForm, setEditForm] = useState<Partial<Lesson>>({});
  
  // Custom Action Modals
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; title: string; type: 'PHASE' | 'MODULE'; parentId?: string }>({ isOpen: false, title: '', type: 'PHASE' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; title: string; onConfirm: () => void }>({ isOpen: false, title: '', onConfirm: () => {} });

  // Config Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({ name: company.name, themeColor: company.themeColor });

  const isMaster = currentUser.role === UserRole.MASTER;
  const primaryColor = company.themeColor;

  // --- SYNCHRONIZATION LOGIC ---
  // This ensures that if the company data changes (e.g. toggle complete), the modal updates immediately
  useEffect(() => {
    if (selectedLesson) {
       // Search for the currently selected lesson in the updated company data
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
         // Only update if there are changes to avoid loops, but specifically check 'completed'
         if (foundLesson.completed !== selectedLesson.completed || foundLesson.title !== selectedLesson.title || foundLesson.description !== selectedLesson.description) {
            setSelectedLesson(foundLesson);
         }
       }
    }
  }, [company, selectedLesson]);

  // Safety check: if activePhase is out of bounds (e.g. after deletion), reset to 0
  useEffect(() => {
    if (activePhase >= company.phases.length && company.phases.length > 0) {
      setActivePhase(0);
    }
  }, [company.phases.length, activePhase]);

  // Safety check: if activeWeek is out of bounds (e.g. after deletion), reset to 0
  useEffect(() => {
    const currentP = company.phases[activePhase];
    if (currentP && activeWeek >= currentP.modules.length && currentP.modules.length > 0) {
      setActiveWeek(0);
    }
  }, [company.phases, activePhase, activeWeek]);

  const currentPhase = company.phases[activePhase];
  const currentModule = currentPhase?.modules[activeWeek];

  // --- Handlers ---

  const handleAddPhaseClick = () => {
    setActionModal({ isOpen: true, title: 'Nueva Fase', type: 'PHASE' });
  };

  const handleAddModuleClick = () => {
    if (!currentPhase) {
        alert("Primero debes crear o seleccionar una Fase.");
        return;
    }
    setActionModal({ isOpen: true, title: `Nuevo Módulo en ${currentPhase.title}`, type: 'MODULE', parentId: currentPhase.id });
  };

  const handleActionSubmit = (value: string) => {
    if (actionModal.type === 'PHASE') {
      onAddPhase(company.id, value);
    } else if (actionModal.type === 'MODULE' && actionModal.parentId) {
      onAddModule(company.id, actionModal.parentId, value);
    }
    setActionModal({ ...actionModal, isOpen: false });
  };

  const handleDeletePhaseClick = (e: React.MouseEvent, phaseId: string) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      title: '¿Eliminar Fase y todo su contenido?',
      onConfirm: () => onDeletePhase(company.id, phaseId)
    });
  };

  const handleDeleteModuleClick = (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    if (currentPhase) {
      setDeleteConfirm({
        isOpen: true,
        title: '¿Eliminar Módulo y sus clases?',
        onConfirm: () => onDeleteModule(company.id, currentPhase.id, moduleId)
      });
    }
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
    setEditForm({
      title: '', description: '', duration: '0m', videoUrl: '', transcription: '', quizUrl: ''
    });
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
    if (selectedLesson && currentPhase && currentModule) {
      if(window.confirm('¿Borrar esta clase permanentemente?')) {
        onDeleteLesson(company.id, currentPhase.id, currentModule.id, selectedLesson.id);
        setSelectedLesson(null);
      }
    }
  };

  const handleToggleCompleteWrapper = () => {
     if(currentPhase && currentModule && selectedLesson) {
        onToggleComplete(company.id, currentPhase.id, currentModule.id, selectedLesson.id);
        // Note: We do NOT manually update selectedLesson here. 
        // We rely on the useEffect above to catch the change from the parent 'company' prop.
        // This ensures the "Database" is the single source of truth.
     }
  };

  const handleSaveConfig = () => {
    onUpdateCompany(company.id, configForm);
    setShowConfigModal(false);
  };

  // Helper to extract YouTube ID
  const getEmbedUrl = (url?: string) => {
     if (!url) return '';
     if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://www.youtube.com/embed/${id}`;
     }
     return url;
  };

  // -- Component: Sidebar Content --
  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
         <div 
            className="w-8 h-8 rounded mr-3 flex items-center justify-center font-bold text-white shadow-lg transition-colors duration-500"
            style={{ backgroundColor: primaryColor }}
         >
           {company.name.charAt(0)}
         </div>
         <span className="font-bold text-white truncate">{company.name}</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'home' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
          <LayoutDashboard size={20} style={{ color: activeTab === 'home' ? primaryColor : undefined }} />
          Aula Virtual
        </button>
        <button 
          onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'students' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
          <Users size={20} style={{ color: activeTab === 'students' ? primaryColor : undefined }} />
          Estudiantes / Comunidad
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="User" /> : <span className="text-xs">{currentUser.name.charAt(0)}</span>}
           </div>
           <div className="overflow-hidden">
             <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
             <div className="text-xs text-slate-500 truncate capitalize">{isMaster ? 'Mentor AIWIS' : currentUser.role.toLowerCase()}</div>
           </div>
        </div>
        <Button variant="secondary" fullWidth onClick={onLogout} className="justify-start px-2">
          <LogOut size={16} className="mr-2" /> Salir
        </Button>
      </div>
    </>
  );

  // -- View: Dashboard / Classes --
  const DashboardView = () => {
    return (
      <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Hola, <span style={{ color: primaryColor }}>{currentUser.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400">Bienvenido a tu portal de transformación digital.</p>
          </div>
          
          {isMaster && (
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button variant="secondary" onClick={onBackToMaster} className="text-xs md:text-sm bg-slate-800/50 border-slate-700 hover:bg-slate-800">
                 <Database size={14} className="mr-2 text-emerald-500" /> Base de Datos Master
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => { setConfigForm({ name: company.name, themeColor: company.themeColor }); setShowConfigModal(true); }}
                className="text-xs md:text-sm"
              >
                 <Settings size={14} className="mr-2" /> Configurar Portal
              </Button>
            </div>
          )}
        </div>

        {/* Phase Selector */}
        <div className="space-y-4">
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide items-center min-h-[60px]">
             {company.phases.map((phase, idx) => (
                <div key={phase.id} className="relative group shrink-0">
                  <button
                    onClick={() => { setActivePhase(idx); setActiveWeek(0); }}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg whitespace-nowrap flex items-center gap-2 ${
                      activePhase === idx 
                        ? 'text-white scale-105' 
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                    style={{ backgroundColor: activePhase === idx ? primaryColor : undefined }}
                  >
                    <Layers size={16} />
                    {phase.title}
                  </button>
                  {isMaster && (
                    <button 
                       onClick={(e) => handleDeletePhaseClick(e, phase.id)}
                       className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-600"
                       title="Eliminar Fase"
                    >
                       <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {isMaster && (
                <button 
                  onClick={handleAddPhaseClick}
                  className="px-4 py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 flex items-center shrink-0 transition-colors"
                >
                  <Plus size={18} className="mr-2"/> Nueva Fase
                </button>
              )}
          </div>
        </div>

        {/* Weeks/Modules */}
        {(company.phases.length > 0 || isMaster) && (
           <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide items-center border-b border-slate-800/50 min-h-[60px]">
              {currentPhase?.modules.map((module, idx) => (
                <div key={module.id} className="relative group shrink-0">
                  <button
                    onClick={() => setActiveWeek(idx)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeWeek === idx 
                        ? 'bg-slate-800 text-white border border-slate-700' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {module.title}
                  </button>
                  {isMaster && (
                    <button 
                       onClick={(e) => handleDeleteModuleClick(e, module.id)}
                       className="absolute -top-2 -right-1 bg-slate-700 text-red-400 p-0.5 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-slate-600 hover:text-red-300"
                       title="Eliminar Módulo"
                    >
                       <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {isMaster && company.phases.length > 0 && currentPhase && (
                <button 
                  onClick={handleAddModuleClick}
                  className="whitespace-nowrap px-3 py-1 rounded-lg text-xs border border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 flex items-center gap-1 shrink-0 ml-2"
                >
                   <Plus size={12} /> Nuevo Módulo
                </button>
              )}
            </div>
        )}

        {/* Content Grid */}
        {currentModule ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <BookOpen size={20} style={{ color: primaryColor }} /> 
              {currentModule.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentModule.lessons.map(lesson => (
                <div 
                  key={lesson.id} 
                  className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative"
                >
                  <div className="relative aspect-video bg-slate-950 cursor-pointer" onClick={() => handleOpenLesson(lesson)}>
                    <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                         <PlayCircle size={32} style={{ color: primaryColor }} />
                      </div>
                    </div>
                    {lesson.completed && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-fade-in">
                        <CheckCircle size={12} /> Visto
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {lesson.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                       <h3 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">{lesson.title}</h3>
                       {isMaster && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleEditLesson(lesson); }}
                           className="text-slate-500 hover:text-white p-1"
                         >
                           <Edit3 size={14} />
                         </button>
                       )}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{lesson.description}</p>
                  </div>
                </div>
              ))}
              {isMaster && (
                 <div 
                    onClick={handleCreateLessonStart}
                    className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-slate-500 hover:text-white hover:border-slate-600 cursor-pointer min-h-[200px]"
                 >
                    <Plus size={32} />
                    <span className="text-sm font-medium mt-2">Agregar Clase</span>
                 </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
             {company.phases.length > 0 ? (
                <>
                   <p>Selecciona una fase y módulo para ver el contenido.</p>
                   {isMaster && company.phases.length > 0 && !currentPhase?.modules.length && (
                       <div className="mt-4 flex flex-col items-center gap-2">
                           <p className="text-sm text-indigo-400">Esta fase no tiene módulos.</p>
                           <Button variant="secondary" onClick={handleAddModuleClick}><Plus size={16} /> Crear Primer Módulo</Button>
                       </div>
                   )}
                </>
             ) : (
                <div className="flex flex-col items-center">
                   <p className="mb-4">Portal vacío.</p>
                   {isMaster && <Button onClick={handleAddPhaseClick}><Plus size={16} /> Crear Primera Fase</Button>}
                </div>
             )}
          </div>
        )}
      </div>
    );
  };

  // -- View: Students --
  const StudentView = () => {
    // Transform data for chart
    const data = company.users.map(u => ({
      name: u.name.split(' ')[0],
      progress: u.progress || 0
    }));

    return (
      <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
        <h1 className="text-2xl font-bold text-white mb-6">Comunidad {company.name}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Progreso Global</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                    cursor={{fill: '#334155', opacity: 0.4}}
                  />
                  <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={primaryColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg">
                <span className="text-slate-400 text-sm">Estudiantes Activos</span>
                <span className="text-xl font-bold text-white">{company.users.filter(u => u.role === UserRole.STUDENT).length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg">
                <span className="text-slate-400 text-sm">Tasa de Completitud Promedio</span>
                <span className="text-xl font-bold text-emerald-400">
                   {company.users.length > 0 
                     ? Math.round(company.users.reduce((acc, u) => acc + (u.progress || 0), 0) / company.users.length) 
                     : 0}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {company.users.map(user => (
            <Card key={user.id} className="hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-300">
                    {user.name.charAt(0)}
                 </div>
                 <div>
                   <h4 className="font-bold text-white">{user.name}</h4>
                   <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                     {user.role}
                   </span>
                 </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Progreso General</span>
                  <span>{user.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${user.progress}%`, backgroundColor: primaryColor }}
                  ></div>
                </div>
              </div>
            </Card>
          ))}
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
      <div 
         className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
         onClick={() => setIsMobileMenuOpen(false)}
      >
         <div 
            className={`w-64 h-full bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={e => e.stopPropagation()}
         >
            <div className="flex justify-end p-4">
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                  <X size={24} />
               </button>
            </div>
            <SidebarContent />
         </div>
      </div>
      
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center z-40 sticky top-0">
         <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-200">
                <Menu size={24} />
             </button>
             <span className="font-bold text-white">{company.name}</span>
         </div>
         <div 
           className="w-6 h-6 rounded flex items-center justify-center font-bold text-white text-xs"
           style={{ backgroundColor: primaryColor }}
         >
           {company.name.charAt(0)}
         </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'home' ? <DashboardView /> : <StudentView />}
        </div>
      </main>

      {/* LESSON PLAYER / EDITOR MODAL */}
      <Modal 
        isOpen={!!selectedLesson} 
        onClose={() => setSelectedLesson(null)} 
        title={isEditing ? (isCreating ? 'Nueva Clase' : 'Editar Clase') : (selectedLesson?.title || 'Clase')}
        maxWidth="max-w-4xl"
      >
        {selectedLesson && (
           isEditing ? (
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Título de la Clase</label>
                   <input 
                      type="text" 
                      value={editForm.title || ''} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Descripción</label>
                   <textarea 
                      rows={3}
                      value={editForm.description || ''} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Duración (Ej: 45m)</label>
                      <input 
                          type="text" 
                          value={editForm.duration || ''} 
                          onChange={e => setEditForm({...editForm, duration: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Video URL (YouTube/Meet)</label>
                      <input 
                          type="text" 
                          placeholder="https://youtube.com/..."
                          value={editForm.videoUrl || ''} 
                          onChange={e => setEditForm({...editForm, videoUrl: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Quiz / Examen URL</label>
                      <input 
                          type="text" 
                          placeholder="https://docs.google.com/forms/..."
                          value={editForm.quizUrl || ''} 
                          onChange={e => setEditForm({...editForm, quizUrl: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Transcripción / Notas</label>
                   <textarea 
                      rows={6}
                      value={editForm.transcription || ''} 
                      onChange={e => setEditForm({...editForm, transcription: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none font-mono text-sm"
                   />
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-800">
                   {!isCreating ? (
                      <Button variant="danger" onClick={handleDeleteCurrentLesson} className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white">
                         <Trash2 size={16} /> Eliminar
                      </Button>
                   ) : <div></div>}
                   <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => { setIsEditing(false); if(isCreating) setSelectedLesson(null); }}>Cancelar</Button>
                      <Button onClick={handleSaveLesson}>{isCreating ? 'Crear Clase' : 'Guardar Cambios'}</Button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                {/* Video Player Area */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
                   {selectedLesson.videoUrl ? (
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={getEmbedUrl(selectedLesson.videoUrl)} 
                        title={selectedLesson.title}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                   ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col text-slate-500 gap-2">
                         <PlayCircle size={48} />
                         <span>Video no disponible</span>
                      </div>
                   )}
                </div>

                {/* Lesson Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2 space-y-4">
                      <h3 className="text-lg font-bold text-white">Sobre esta clase</h3>
                      <p className="text-slate-400 leading-relaxed">{selectedLesson.description || 'Sin descripción.'}</p>
                      
                      {selectedLesson.transcription && (
                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mt-4">
                           <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
                             <FileText size={16} /> Transcripción / Notas
                           </div>
                           <p className="text-sm text-slate-400 whitespace-pre-line leading-relaxed">
                             {selectedLesson.transcription}
                           </p>
                        </div>
                      )}
                   </div>
                   
                   <div className="space-y-4">
                      <Card className="p-4 space-y-3">
                         <div className="text-xs font-bold text-slate-500 uppercase">Tu Progreso</div>
                         <Button 
                            fullWidth 
                            variant={selectedLesson.completed ? 'ghost' : 'primary'}
                            className={selectedLesson.completed ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : ''}
                            onClick={handleToggleCompleteWrapper}
                         >
                            {selectedLesson.completed ? <><CheckCircle size={18} /> Completada</> : "Marcar como Vista"}
                         </Button>
                         
                         {selectedLesson.quizUrl && (
                           <a href={selectedLesson.quizUrl} target="_blank" rel="noopener noreferrer" className="block">
                             <Button fullWidth variant="secondary" className="border-indigo-500/30 text-indigo-300 hover:text-white">
                               <LinkIcon size={16} /> Realizar Quiz
                             </Button>
                           </a>
                         )}
                      </Card>

                      {isMaster && (
                         <Button variant="secondary" fullWidth onClick={() => handleEditLesson(selectedLesson)}>
                            <Edit3 size={16} /> Editar Contenido
                         </Button>
                      )}
                   </div>
                </div>
             </div>
           )
        )}
      </Modal>

      {/* PORTAL CONFIG MODAL */}
      <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} title="Configuración del Portal" maxWidth="max-w-md">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-400 mb-1">Nombre del Portal</label>
               <input 
                  type="text" 
                  value={configForm.name} 
                  onChange={e => setConfigForm({...configForm, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-400 mb-1">Color Principal</label>
               <div className="flex gap-2 flex-wrap">
                  {['#6366f1', '#10b981', '#a855f7', '#f43f5e', '#f59e0b', '#3b82f6', '#ec4899'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setConfigForm({...configForm, themeColor: color})}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${configForm.themeColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
               </div>
            </div>
            <div className="pt-4 flex gap-3">
               <Button variant="secondary" fullWidth onClick={() => setShowConfigModal(false)}>Cancelar</Button>
               <Button fullWidth onClick={handleSaveConfig}>Guardar</Button>
            </div>
         </div>
      </Modal>

      {/* Action Modal (Prompt replacement) */}
      <ActionModal 
         isOpen={actionModal.isOpen} 
         onClose={() => setActionModal({ ...actionModal, isOpen: false })} 
         title={actionModal.title}
         onSubmit={handleActionSubmit}
         placeholder={actionModal.type === 'PHASE' ? 'Ej: Fase 3: Expertos' : 'Ej: Semana 1: Fundamentos'}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({...deleteConfirm, isOpen: false})} title="Confirmar Eliminación" maxWidth="max-w-sm">
         <div className="space-y-4">
            <p className="text-slate-300">
               {deleteConfirm.title} <br/>
               <span className="text-xs text-red-400">Esta acción no se puede deshacer.</span>
            </p>
            <div className="flex gap-3 justify-end">
               <Button variant="secondary" onClick={() => setDeleteConfirm({...deleteConfirm, isOpen: false})}>Cancelar</Button>
               <Button variant="danger" onClick={() => { deleteConfirm.onConfirm(); setDeleteConfirm({...deleteConfirm, isOpen: false}); }}>Eliminar</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};