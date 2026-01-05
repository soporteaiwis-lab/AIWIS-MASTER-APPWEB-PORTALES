import React, { useState } from 'react';
import { CompanyPortal } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Layout, Users, ExternalLink, Activity, Search, Database, Trash2, Edit2, Layers, Box } from 'lucide-react';

interface MasterDashboardProps {
  companies: CompanyPortal[];
  onSelectCompany: (companyId: string) => void;
  onCreateCompany: (name: string, color: string) => void;
  onLogout: () => void;
  onDeleteUser: (companyId: string, userId: string) => void;
  onDeleteLesson: (companyId: string, phaseId: string, moduleId: string, lessonId: string) => void;
  onUpdatePhase: (companyId: string, phaseId: string, title: string) => void;
  onUpdateModule: (companyId: string, phaseId: string, moduleId: string, title: string) => void;
  onDeletePhase: (companyId: string, phaseId: string) => void;
  onDeleteModule: (companyId: string, phaseId: string, moduleId: string) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ 
  companies, 
  onSelectCompany, 
  onCreateCompany, 
  onLogout,
  onDeleteUser,
  onDeleteLesson,
  onUpdatePhase,
  onUpdateModule,
  onDeletePhase,
  onDeleteModule
}) => {
  const [activeView, setActiveView] = useState<'PORTALS' | 'DATABASE'>('PORTALS');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyColor, setNewCompanyColor] = useState('#6366f1');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCompany(newCompanyName, newCompanyColor);
    setShowCreateModal(false);
    setNewCompanyName('');
  };

  // --- SUB-VIEWS ---

  const PortalsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Portales</h1>
          <p className="text-slate-400">Administra los portales de capacitación de tus clientes corporativos.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus size={18} /> Nuevo Portal
        </Button>
      </div>

       {/* Stats Row */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="flex items-center gap-4 border-l-4 border-l-indigo-500">
            <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400">
              <Layout size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{companies.length}</div>
              <div className="text-sm text-slate-400">Empresas Activas</div>
            </div>
          </Card>
          <Card className="flex items-center gap-4 border-l-4 border-l-purple-500">
            <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
              <Users size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {companies.reduce((acc, c) => acc + c.users.length, 0)}
              </div>
              <div className="text-sm text-slate-400">Estudiantes Totales</div>
            </div>
          </Card>
          <Card className="flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
              <Activity size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm text-slate-400">Uptime Plataforma</div>
            </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <div 
            key={company.id} 
            className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
            onClick={() => onSelectCompany(company.id)}
          >
            <div className="h-2 w-full" style={{ backgroundColor: company.themeColor }}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-xl font-bold text-white border border-slate-700">
                    {company.name.substring(0,2).toUpperCase()}
                </div>
                <div className="px-2 py-1 bg-slate-800 rounded text-xs font-mono text-slate-400">
                  ID: {company.slug}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {company.name}
              </h3>
              <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Estudiantes:</span>
                    <span className="text-white font-medium">{company.users.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Fases Activas:</span>
                    <span className="text-white font-medium">{company.phases.length}</span>
                  </div>
              </div>
              <Button fullWidth variant="secondary" className="group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
                Gestionar Portal <ExternalLink size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all h-full min-h-[280px]"
        >
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
            <Plus size={32} />
          </div>
          <span className="font-medium">Crear Nueva Empresa</span>
        </button>
      </div>
    </div>
  );

  const DatabaseView = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Database className="text-emerald-500" /> Base de Datos Maestra
        </h1>
        <p className="text-slate-400">Vista global de registros y control de integridad.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Filtrar registros por nombre de usuario, empresa o ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-fit">
          <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Users size={18} /> Usuarios Registrados
            </h3>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 font-mono">
              Total: {companies.reduce((acc, c) => acc + c.users.length, 0)}
            </span>
          </div>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-300 uppercase bg-slate-800/30">
                <tr>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {companies.flatMap(c => c.users.map(u => ({...u, companyName: c.name}))).filter(u => 
                  u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  u.companyName.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((user) => (
                  <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                    <td className="px-6 py-4">{user.companyName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${user.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                        onClick={() => {
                           if(window.confirm('¿Eliminar usuario permanentemente?')) onDeleteUser(user.companyId, user.id);
                        }}
                        className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-colors"
                        title="Eliminar usuario"
                       >
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Structure & Content Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[700px]">
          <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Layout size={18} /> Estructura y Contenidos
            </h3>
             <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 font-mono">
              Items: {companies.reduce((acc, c) => acc + c.phases.reduce((acc2, p) => acc2 + p.modules.reduce((acc3, m) => acc3 + m.lessons.length, 0), 0), 0)}
            </span>
          </div>
          <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar flex-1">
             {companies.map(company => (
                <div key={company.id} className="border border-slate-800 rounded-lg p-3 bg-slate-950/30">
                   <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/50">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: company.themeColor}}></div>
                      <div className="text-sm font-bold text-white uppercase tracking-wider">{company.name}</div>
                   </div>
                   
                   {company.phases.map(phase => (
                      <div key={phase.id} className="ml-2 mb-4 relative pl-4 border-l-2 border-slate-800">
                        {/* Phase Header */}
                        <div className="flex items-center justify-between group mb-2">
                           <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                             <Layers size={14} />
                             {phase.title}
                           </div>
                           <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                              <button 
                                onClick={() => {
                                   const newTitle = prompt('Renombrar Fase:', phase.title);
                                   if(newTitle) onUpdatePhase(company.id, phase.id, newTitle);
                                }}
                                className="p-1 text-slate-500 hover:text-indigo-400"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={() => {
                                   if(window.confirm('¿Borrar fase y todo su contenido?')) onDeletePhase(company.id, phase.id);
                                }}
                                className="p-1 text-slate-500 hover:text-red-400"
                              >
                                <Trash2 size={12} />
                              </button>
                           </div>
                        </div>

                        {phase.modules.map(module => (
                           <div key={module.id} className="ml-2 mb-3 pl-4 border-l border-slate-800/50">
                              {/* Module Header */}
                              <div className="flex items-center justify-between group mb-1">
                                 <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                                    <Box size={12} className="text-slate-500" />
                                    {module.title}
                                 </div>
                                 <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                    <button 
                                       onClick={() => {
                                          const newTitle = prompt('Renombrar Módulo:', module.title);
                                          if(newTitle) onUpdateModule(company.id, phase.id, module.id, newTitle);
                                       }}
                                       className="p-1 text-slate-600 hover:text-indigo-400"
                                    >
                                      <Edit2 size={10} />
                                    </button>
                                    <button 
                                       onClick={() => {
                                          if(window.confirm('¿Borrar módulo?')) onDeleteModule(company.id, phase.id, module.id);
                                       }}
                                       className="p-1 text-slate-600 hover:text-red-400"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                 </div>
                              </div>

                              {/* Lessons List */}
                              <div className="space-y-1 mt-1">
                                 {module.lessons.map(lesson => (
                                    <div key={lesson.id} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded hover:bg-slate-800 group ml-2 border border-slate-800/50">
                                       <span className="text-slate-400 truncate max-w-[150px]">{lesson.title}</span>
                                       <button 
                                          onClick={() => {
                                            if(window.confirm('¿Eliminar clase de la base de datos?')) onDeleteLesson(company.id, phase.id, module.id, lesson.id);
                                          }}
                                          className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                       >
                                          <Trash2 size={12} />
                                       </button>
                                    </div>
                                 ))}
                                 {module.lessons.length === 0 && (
                                    <div className="text-[10px] text-slate-600 italic ml-2">Sin clases registradas</div>
                                 )}
                              </div>
                           </div>
                        ))}
                         {phase.modules.length === 0 && (
                            <div className="text-xs text-slate-600 italic ml-4">Sin módulos registrados</div>
                         )}
                      </div>
                   ))}
                   {company.phases.length === 0 && (
                      <div className="text-xs text-slate-500 p-2 text-center border border-dashed border-slate-800 rounded">
                         Portal Vacío
                      </div>
                   )}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">AI</div>
            <span className="font-bold text-lg tracking-tight">AIWIS <span className="text-indigo-400">MASTER</span></span>
          </div>
          <nav className="hidden md:flex gap-1">
             <button 
                onClick={() => setActiveView('PORTALS')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeView === 'PORTALS' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
             >
                Portales
             </button>
             <button 
                onClick={() => setActiveView('DATABASE')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeView === 'DATABASE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
             >
                Base de Datos
             </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Armin Salazar (CEO)
          </div>
          <Button variant="secondary" onClick={onLogout} className="text-xs py-1.5 h-8">Cerrar Sesión</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeView === 'PORTALS' ? <PortalsView /> : <DatabaseView />}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Nueva Empresa Cliente</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Empresa</label>
                <input 
                  autoFocus
                  type="text" 
                  required
                  value={newCompanyName}
                  onChange={e => setNewCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Tech Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Color Tema</label>
                <div className="flex gap-2">
                  {['#6366f1', '#10b981', '#a855f7', '#f43f5e', '#f59e0b'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCompanyColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${newCompanyColor === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1">Crear Portal</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};