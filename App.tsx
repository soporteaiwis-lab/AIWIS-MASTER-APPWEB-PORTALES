import React, { useState } from 'react';
import { CompanyPortal, User, UserRole, AppState, Lesson } from './types';
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
    // Simulated Authentication Logic
    // Default pass is 1234 for everything per request
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
      // Client Login
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
        progress: 0
      };

      // If new user (not found), add them to state for this session
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

  // Master creates a new company
  const handleCreateCompany = (name: string, color: string) => {
    const newCompany: CompanyPortal = {
      id: `c${Date.now()}`,
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      themeColor: color,
      createdAt: new Date().toISOString(),
      phases: [],
      users: []
    };
    setCompanies([...companies, newCompany]);
  };

  // Master deletes a user
  const handleDeleteUser = (companyId: string, userId: string) => {
    setCompanies(prev => prev.map(c => {
       if (c.id !== companyId) return c;
       return {
         ...c,
         users: c.users.filter(u => u.id !== userId)
       };
    }));
  };

  // Master deletes a lesson (from DB view)
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

  // Update Lesson Details (Video, Transciption, etc)
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

  // Toggle Completion
  const handleToggleComplete = (companyId: string, phaseId: string, moduleId: string, lessonId: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      
      // Also update current user progress if they are logged in this company? 
      // Simplified: Just updating the lesson state in the data structure for now.
      // In a real app, completion is per-user, here we are editing the "Company Template" 
      // or assuming single-tenant per user for simplicity in this demo structure.
      // To mimic "User saw this", we toggle the boolean on the lesson object itself for the session.
      
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
                lessons: m.lessons.map(l => {
                   if (l.id !== lessonId) return l;
                   return { ...l, completed: !l.completed };
                })
              };
            })
          };
        })
      };
    }));
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
        onDeleteUser={handleDeleteUser}
        onDeleteLesson={handleDeleteLesson}
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
        onToggleComplete={handleToggleComplete}
      />
    );
  }

  return <div>Loading...</div>;
};

export default App;
