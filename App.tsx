import React, { useState } from 'react';
import { CompanyPortal, User, UserRole, AppState, Lesson, Phase, WeekModule, ForumPost, StudyResource } from './types';
import { INITIAL_COMPANIES, MASTER_USER } from './services/data';
import { LoginView } from './views/LoginView';
import { MasterDashboard } from './views/MasterDashboard';
import { CompanyPortalView } from './views/CompanyPortal';

const App: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyPortal[]>(INITIAL_COMPANIES);
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    currentView: 'LOGIN',
    selectedCompanyId: null,
  });

  // Handle Login Logic
  const handleLogin = (email: string, pass: string, isMaster: boolean, companySlug?: string) => {
    
    if (isMaster) {
      if (email.toLowerCase() === 'armin@aiwis.cl' && pass === '123') { // Simplified check
        setAppState({
          currentUser: MASTER_USER,
          currentView: 'MASTER_DASHBOARD',
          selectedCompanyId: null
        });
        return;
      } else {
        alert('Credenciales Master incorrectas');
        return;
      }
    } else {
      // Client Login
      const company = companies.find(c => c.slug === companySlug);
      if (!company) {
        alert('Empresa no encontrada');
        return;
      }

      const foundUser = company.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
      
      if (foundUser) {
        setAppState({
          currentUser: foundUser,
          currentView: 'COMPANY_PORTAL',
          selectedCompanyId: company.id
        });
      } else {
        alert('Email o contraseña incorrectos para este portal.');
      }
    }
  };

  // --- ACTIONS ---

  const handleCreateCompany = (name: string, color: string) => {
    const newCompany: CompanyPortal = {
      id: `c${Date.now()}`,
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      themeColor: color,
      createdAt: new Date().toISOString(),
      phases: [],
      users: [],
      posts: [],
      resources: [],
      skillLabels: { prompting: 'Prompting', analysis: 'Análisis', tools: 'Herramientas', strategy: 'Estrategia' }
    };
    setCompanies([...companies, newCompany]);
  };

  const handleUpdateCompanyRaw = (companyId: string, rawJson: string) => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed.id || !parsed.name) throw new Error("JSON Inválido: Falta ID o Nombre");
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, ...parsed } : c));
      return true;
    } catch (e) {
      alert("Error al guardar JSON: " + (e as Error).message);
      return false;
    }
  };

  // --- NEW: AI MASS IMPORT HANDLER ---
  const handleImportAIStructure = (companyId: string, data: { phases: Phase[], users: User[], resources: StudyResource[] }) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      return {
        ...c,
        phases: [...c.phases, ...data.phases],
        users: [...c.users, ...data.users],
        resources: [...c.resources, ...data.resources]
      };
    }));
  };

  // USER MANAGEMENT

  const handleAddUser = (companyId: string, user: User) => {
    setCompanies(prev => prev.map(c => {
       if (c.id !== companyId) return c;
       return { ...c, users: [...c.users, user] };
    }));
  };

  const handleDeleteUser = (companyId: string, userId: string) => {
    setCompanies(prev => prev.map(c => {
       if (c.id !== companyId) return c;
       return {
         ...c,
         users: c.users.filter(u => u.id !== userId)
       };
    }));
  };

  const handleUpdateUser = (companyId: string, updatedUser: User) => {
    setCompanies(prev => prev.map(c => {
       if (c.id !== companyId) return c;
       return {
         ...c,
         users: c.users.map(u => u.id === updatedUser.id ? updatedUser : u)
       };
    }));
  };

  // CONTENT MANAGEMENT

  const handleDeleteLesson = (companyId: string, phaseId: string, moduleId: string, lessonId: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      return {
        ...c,
        phases: c.phases.map(p => {
          if (p.id !== phaseId) return p;
          return {
             ...p,
             modules: p.modules.map(m => {
                if(m.id !== moduleId) return m;
                return {
                   ...m,
                   lessons: m.lessons.filter(l => l.id !== lessonId)
                };
             })
          };
        })
      };
    }));
  };

  const handleUpdateLesson = (companyId: string, phaseId: string, moduleId: string, updatedLesson: Lesson) => {
     setCompanies(prev => prev.map(c => {
       if (c.id !== companyId) return c;
       return {
         ...c,
         phases: c.phases.map(p => {
           if (p.id !== phaseId) return p;
           return {
             ...p,
             modules: p.modules.map(m => {
               if (m.id !== moduleId) return m;
               return {
                 ...m,
                 lessons: m.lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l)
               };
             })
           };
         })
       };
     }));
  };

  const handleCreateLesson = (companyId: string, phaseId: string, moduleId: string, lesson: Lesson) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      return {
        ...c,
        phases: c.phases.map(p => {
          if (p.id !== phaseId) return p;
          return {
            ...p,
            modules: p.modules.map(m => {
              if (m.id !== moduleId) return m;
              return {
                ...m,
                lessons: [...m.lessons, lesson]
              };
            })
          };
        })
      };
    }));
  };

  const handleToggleComplete = (companyId: string, phaseId: string, moduleId: string, lessonId: string) => {
    setCompanies(prev => {
      return prev.map(c => {
        if (c.id !== companyId) return c;
        const updatedPhases = c.phases.map(p => {
          if (p.id !== phaseId) return p;
          return {
            ...p,
            modules: p.modules.map(m => {
              if (m.id !== moduleId) return m;
              return {
                ...m,
                lessons: m.lessons.map(l => {
                   if (l.id !== lessonId) return l;
                   return { ...l, completed: !l.completed };
                })
              };
            })
          };
        });
        
        // Progress Calc
        let totalLessons = 0;
        let completedLessons = 0;
        updatedPhases.forEach(p => p.modules.forEach(m => m.lessons.forEach(l => {
          totalLessons++;
          if (l.completed) completedLessons++;
        })));
        const newProgressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
        
        const updatedUsers = c.users.map(u => ({ ...u, progress: newProgressPercent }));

        return { ...c, phases: updatedPhases, users: updatedUsers };
      });
    });
  };

  const handleAddPost = (companyId: string, post: ForumPost) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, posts: [post, ...c.posts] } : c));
  };
  
  const handleAddResource = (companyId: string, resource: StudyResource) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, resources: [...c.resources, resource] } : c));
  };

  const handleDeleteResource = (companyId: string, resourceId: string) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, resources: c.resources.filter(r => r.id !== resourceId) } : c));
  };

  // --- HIERARCHY MANAGEMENT ---

  const handleAddPhase = (companyId: string, title: string) => {
    const newPhase: Phase = { id: `p-${Date.now()}`, title, modules: [] };
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, phases: [...c.phases, newPhase] } : c));
  };

  const handleDeletePhase = (companyId: string, phaseId: string) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, phases: c.phases.filter(p => p.id !== phaseId) } : c));
  };

  const handleUpdatePhase = (companyId: string, phaseId: string, title: string) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, phases: c.phases.map(p => p.id === phaseId ? { ...p, title } : p) } : c));
  };

  const handleAddModule = (companyId: string, phaseId: string, title: string) => {
    const newModule: WeekModule = { id: `m-${Date.now()}`, title, lessons: [] };
    setCompanies(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      return {
        ...c,
        phases: c.phases.map(p => p.id === phaseId ? { ...p, modules: [...p.modules, newModule] } : p)
      };
    }));
  };

  const handleDeleteModule = (companyId: string, phaseId: string, moduleId: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      return {
        ...c,
        phases: c.phases.map(p => p.id === phaseId ? { ...p, modules: p.modules.filter(m => m.id !== moduleId) } : p)
      };
    }));
  };

  const handleUpdateModule = (companyId: string, phaseId: string, moduleId: string, title: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      return {
        ...c,
        phases: c.phases.map(p => p.id === phaseId ? {
             ...p, modules: p.modules.map(m => m.id === moduleId ? { ...m, title } : m)
        } : p)
      };
    }));
  };

  const handleUpdateCompany = (companyId: string, data: Partial<CompanyPortal>) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, ...data } : c));
  };

  // --- NAVIGATION ---

  const handleMasterSelectCompany = (companyId: string) => {
    setAppState(prev => ({
      ...prev,
      currentView: 'COMPANY_PORTAL',
      selectedCompanyId: companyId
    }));
  };

  const handleBackToMaster = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'MASTER_DASHBOARD',
      selectedCompanyId: null
    }));
  };

  const handleLogout = () => {
    setAppState({
      currentUser: null,
      currentView: 'LOGIN',
      selectedCompanyId: null
    });
  };

  // -- RENDER LOGIC --

  if (appState.currentView === 'LOGIN') {
    return (
      <LoginView 
        onLogin={handleLogin} 
        companies={companies.map(c => ({ id: c.id, name: c.name, slug: c.slug }))} 
      />
    );
  }

  if (appState.currentView === 'MASTER_DASHBOARD' && appState.currentUser?.role === UserRole.MASTER) {
    return (
      <MasterDashboard
        companies={companies}
        onSelectCompany={handleMasterSelectCompany}
        onCreateCompany={handleCreateCompany}
        onLogout={handleLogout}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdateUser={handleUpdateUser}
        onDeleteLesson={handleDeleteLesson}
        onUpdatePhase={handleUpdatePhase}
        onUpdateModule={handleUpdateModule}
        onDeletePhase={handleDeletePhase}
        onDeleteModule={handleDeleteModule}
        onUpdateCompanyRaw={handleUpdateCompanyRaw}
        onImportAIStructure={handleImportAIStructure}
      />
    );
  }

  if (appState.currentView === 'COMPANY_PORTAL' && appState.selectedCompanyId) {
    const activeCompany = companies.find(c => c.id === appState.selectedCompanyId);
    if (!activeCompany) return <div>Error loading company data</div>;

    return (
      <CompanyPortalView
        company={activeCompany}
        currentUser={appState.currentUser!}
        onLogout={handleLogout}
        onBackToMaster={appState.currentUser?.role === UserRole.MASTER ? handleBackToMaster : undefined}
        onUpdateLesson={handleUpdateLesson}
        onCreateLesson={handleCreateLesson}
        onDeleteLesson={handleDeleteLesson}
        onToggleComplete={handleToggleComplete}
        onAddPhase={handleAddPhase}
        onDeletePhase={handleDeletePhase}
        onAddModule={handleAddModule}
        onDeleteModule={handleDeleteModule}
        onUpdateCompany={handleUpdateCompany}
        onAddPost={handleAddPost}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onAddResource={handleAddResource}
        onDeleteResource={handleDeleteResource}
      />
    );
  }

  return <div>Loading...</div>;
};

export default App;