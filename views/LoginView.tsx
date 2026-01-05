import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Button } from '../components/Button';
import { Lock, Building2, UserCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, pass: string, isMaster: boolean, companySlug?: string) => void;
  companies: { id: string; name: string; slug: string }[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, companies }) => {
  const [activeTab, setActiveTab] = useState<'master' | 'client'>('master');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  // Pre-fill credentials for convenience when switching tabs
  useEffect(() => {
    if (activeTab === 'master') {
      setUsername('aiwis');
      setPassword('1234');
    } else {
      setUsername('');
      setPassword('');
    }
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'master') {
      onLogin(username, password, true);
    } else {
      onLogin(username, password, false, selectedCompany);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AIWIS Portal
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Plataforma de Adopción IA Corporativa</p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('master')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'master' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Master Admin
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'client' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cliente / Alumno
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'client' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Empresa</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  required
                >
                  <option value="">Seleccionar Empresa...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Usuario</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeTab === 'master' ? "aiwis" : "Tu usuario"}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                required
              />
            </div>
          </div>

          <Button fullWidth type="submit" className="mt-4">
            {activeTab === 'master' ? 'Ingresar como Master' : 'Ingresar al Portal'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Desarrollado por AIWIS Technology &copy; 2026
        </div>
      </div>
    </div>
  );
};