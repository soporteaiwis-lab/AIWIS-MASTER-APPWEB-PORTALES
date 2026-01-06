import React, { useState } from 'react';
import { CompanyPortal, User, UserRole, AppState, Lesson, Phase, WeekModule, ForumPost } from './types';
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
  const handleLogin = (u: string, p: string, isMaster: boolean, companySlug?: string) => {
    if (p !== '1234') {
       alert('Contraseña incorrecta. (Use 1234)');
       return;
    }

    if (isMaster) {
      if (u.toLowerCase() === 'aiwis') {
        setAppState({
          currentUser: MASTER_USER,
          currentView: 'MASTER_DASHBOARD',
          selectedCompanyId: null
        });
      } else {
        alert('Usuario Master incorrecto (Prueba aiwis)');
      }
    } else {
      const company = companies.find(c => c.slug === companySlug);
      if (!company) {
        alert('Seleccione una empresa válida');
        return;
      }
      
      const foundUser = company.users.find(user => user.name.toLowerCase().includes(u.toLowerCase()));
      const userToLogin = foundUser || {
        id: `temp-${Date.now()}`,
        name: u || 'Usuario Demo',
        role: UserRole.STUDENT,
        companyId: company.id,
        progress: 0,
        skills: { prompting: 50, analysis: 50, tools: 50, strategy: 50 }
      };

      if (!foundUser) {
        setCompanies(prev => prev.map(c => 
          c.id === company.id ? { ...c, users: [...c.users, userToLogin] } : c
        ));
      }

      setAppState({
        currentUser: userToLogin,
        currentView: 'COMPANY_PORTAL',
        selectedCompanyId: company.id
      });
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
      skillLabels: { prompting: 'Prompting', analysis: 'Análisis', tools: 'Herramientas', strategy: 'Estrategia' }
    };
    setCompanies([...companies, newCompany]);
  };

  const handleUpdateCompanyRaw = (companyId: string, rawJson: string) => {
    try {
      const parsed = JSON.parse(rawJson);
      // Basic validation
      if (!parsed.id || !parsed.name) throw new Error("JSON Inválido: Falta ID o Nombre");
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, ...parsed } : c));
      return true;
    } catch (e) {
      alert("Error al guardar JSON: " + (e as Error).message);
      return false;
    }
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
        
        // 1. Toggle Lesson Status locally
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

        // 2. Recalculate Progress (Simple logic: total completed / total lessons)
        let totalLessons = 0;
        let completedLessons = 0;
        
        updatedPhases.forEach(p => {
          p.modules.forEach(m => {
            m.lessons.forEach(l => {
              totalLessons++;
              if (l.completed) completedLessons++;
            });
          });
        });

        const newProgressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
        
        // In a real DB, we update the specific user's record. Here we update the logged in user or all users for demo simplicity?
        // Let's update the CURRENT user in the company list if possible, or all (demo constraint).
        // Improving logic: Update ONLY the user matching current session if we had session context passed down deep.
        // For now, update all users to keep demo simple or mock specific user update later.
        const updatedUsers = c.users.map(u => ({
          ...u,
          progress: newProgressPercent
        }));

        return {
          ...c,
          phases: updatedPhases,
          users: updatedUsers
        };
      });
    });
  };

  const handleAddPost = (companyId: string, post: ForumPost) => {
    setCompanies(prev => prev.map(c => 
      c.id === companyId 
        ? { ...c, posts: [post, ...c.posts] }
        : c
    ));
  };

  // --- HIERARCHY MANAGEMENT ---

  const handleAddPhase = (companyId: string, title: string) => {
    const newPhase: Phase = {
      id: `p-${Date.now()}`,
      title,
      modules: []
    };
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, phases: [...c.phases, newPhase] } : c));
  };

  const handleDeletePhase = (companyId: string, phaseId: string) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, phases: c.phases.filter(p => p.id !== phaseId) } : c));
  };

  const handleUpdatePhase = (companyId: string, phaseId: string, title: string) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { 
        ...c, 
        phases: c.phases.map(p => p.id === phaseId ? { ...p, title } : p)
    } : c));
  };

  const handleAddModule = (companyId: string, phaseId: string, title: string) => {
    const newModule: WeekModule = {
      id: `m-${Date.now()}`,
      title,
      lessons: []
    };
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
             ...p, 
             modules: p.modules.map(m => m.id === moduleId ? { ...m, title } : m)
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
        // Hierarchy Props
        onAddPhase={handleAddPhase}
        onDeletePhase={handleDeletePhase}
        onAddModule={handleAddModule}
        onDeleteModule={handleDeleteModule}
        onUpdateCompany={handleUpdateCompany}
        onAddPost={handleAddPost}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
      />
    );
  }

  return <div>Loading...</div>;
};

export default App;