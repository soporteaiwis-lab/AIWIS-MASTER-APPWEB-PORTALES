import React, { useState } from 'react';
import { CompanyPortal, User, UserRole, Lesson } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { 
  PlayCircle, CheckCircle, Lock, BookOpen, Users, 
  LayoutDashboard, LogOut, Settings, Plus, Github, MessageSquare, Edit3, Link as LinkIcon, FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CompanyPortalProps {
  company: CompanyPortal;
  currentUser: User;
  onLogout: () => void;
  onBackToMaster?: () => void;
  onUpdateLesson: (companyId: string, phaseId: string, moduleId: string, lesson: Lesson) => void;
  onToggleComplete: (companyId: string, phaseId: string, moduleId: string, lessonId: string) => void;
}

export const CompanyPortalView: React.FC<CompanyPortalProps> = ({ 
  company, 
  currentUser, 
  onLogout, 
  onBackToMaster,
  onUpdateLesson,
  onToggleComplete
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'students'>('home');
  const [activePhase, setActivePhase] = useState(0);
  const [activeWeek, setActiveWeek] = useState(0);
  
  // Lesson Player / Editor State
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lesson>>({});

  const isMaster = currentUser.role === UserRole.MASTER;
  const primaryColor = company.themeColor;

  const currentPhase = company.phases[activePhase];
  const currentModule = currentPhase?.modules[activeWeek];

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsEditing(false);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditForm(lesson);
    setIsEditing(true);
    setSelectedLesson(lesson); // Ensure modal is open
  };

  const handleSaveLesson = () => {
    if (selectedLesson && currentPhase && currentModule && editForm.id) {
      onUpdateLesson(company.id, currentPhase.id, currentModule.id, { ...selectedLesson, ...editForm } as Lesson);
      setIsEditing(false);
      setSelectedLesson({ ...selectedLesson, ...editForm } as Lesson);
    }
  };

  // Helper to extract YouTube ID
  const getEmbedUrl = (url?: string) => {
     if (!url) return '';
     if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://www.youtube.com/embed/${id}`;
     }
     return url; // Assume it's embeddable or link
  };

  // -- Component: Sidebar --
  const Sidebar = () => (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
         <div 
            className="w-8 h-8 rounded mr-3 flex items-center justify-center font-bold text-white shadow-lg"
            style={{ backgroundColor: primaryColor }}
         >
           {company.name.charAt(0)}
         </div>
         <span className="font-bold text-white truncate">{company.name}</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setActiveTab('home')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'home' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
          <LayoutDashboard size={20} style={{ color: activeTab === 'home' ? primaryColor : undefined }} />
          Aula Virtual
        </button>
        <button 
          onClick={() => setActiveTab('students')}
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
    </aside>
  );

  // -- View: Dashboard / Classes --
  const DashboardView = () => {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Hola, <span style={{ color: primaryColor }}>{currentUser.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400">Bienvenido a tu portal de transformación digital.</p>
          </div>
          
          {isMaster && (
            <div className="flex gap-2">
              <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20 flex items-center gap-2">
                <Settings size={14} /> MODO EDITOR
              </span>
              <Button variant="secondary" onClick={onBackToMaster}>Volver a Master</Button>
            </div>
          )}
        </div>

        {/* Phase Selector */}
        {company.phases.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-4">
              {company.phases.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => { setActivePhase(idx); setActiveWeek(0); }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                    activePhase === idx 
                      ? 'text-white scale-105' 
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                  style={{ backgroundColor: activePhase === idx ? primaryColor : undefined }}
                >
                  {phase.title}
                </button>
              ))}
              {isMaster && (
                <button className="px-4 py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 flex items-center">
                  <Plus size={18} />
                </button>
              )}
            </div>

            {/* Weeks/Modules */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {currentPhase?.modules.map((module, idx) => (
                <button
                  key={module.id}
                  onClick={() => setActiveWeek(idx)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeWeek === idx 
                      ? 'bg-slate-800 text-white border border-slate-700' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {module.title}
                </button>
              ))}
            </div>

            {/* Content Grid */}
            {currentModule ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
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
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
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
                     <div className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-slate-500 hover:text-white hover:border-slate-600 cursor-pointer min-h-[200px]">
                        <Plus size={32} />
                        <span className="text-sm font-medium mt-2">Agregar Clase</span>
                     </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <p>No hay módulos creados para esta fase.</p>
                {isMaster && <Button className="mt-4" variant="secondary">Crear Módulo</Button>}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
             <h2 className="text-xl text-slate-400">Portal en construcción</h2>
             {isMaster && <Button className="mt-4">Inicializar Fases</Button>}
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
      <div className="space-y-6 animate-fade-in">
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
                <span className="text-slate-400 text-sm">Tasa de Completitud</span>
                <span className="text-xl font-bold text-emerald-400">45%</span>
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
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">
      <Sidebar />
      
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
         <div className="font-bold text-white">{company.name}</div>
         <Button variant="ghost" onClick={onLogout}><LogOut size={20} /></Button>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'home' ? <DashboardView /> : <StudentView />}
        </div>
      </main>

      {/* LESSON PLAYER / EDITOR MODAL */}
      <Modal 
        isOpen={!!selectedLesson} 
        onClose={() => setSelectedLesson(null)} 
        title={isEditing ? 'Editar Clase' : (selectedLesson?.title || 'Clase')}
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
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                   <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                   <Button onClick={handleSaveLesson}>Guardar Cambios</Button>
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
                      <p className="text-slate-400 leading-relaxed">{selectedLesson.description}</p>
                      
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
                      {/* Action Card */}
                      <Card className="p-4 space-y-3">
                         <div className="text-xs font-bold text-slate-500 uppercase">Tu Progreso</div>
                         <Button 
                            fullWidth 
                            variant={selectedLesson.completed ? 'ghost' : 'primary'}
                            className={selectedLesson.completed ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : ''}
                            onClick={() => {
                              if(currentPhase && currentModule) {
                                onToggleComplete(company.id, currentPhase.id, currentModule.id, selectedLesson.id);
                                setSelectedLesson({...selectedLesson, completed: !selectedLesson.completed});
                              }
                            }}
                         >
                            {selectedLesson.completed ? (
                               <> <CheckCircle size={18} /> Completada </>
                            ) : (
                               "Marcar como Vista"
                            )}
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
    </div>
  );
};
