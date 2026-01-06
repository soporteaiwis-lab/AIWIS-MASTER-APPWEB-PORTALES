import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Lock, Building2, Mail } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, pass: string, isMaster: boolean, companySlug?: string) => void;
  companies: { id: string; name: string; slug: string }[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, companies }) => {
  const [activeTab, setActiveTab] = useState<'master' | 'client'>('master');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    if (activeTab === 'master') {
      setEmail('armin@aiwis.cl');
      setPassword('123');
    } else {
      setEmail('');
      setPassword('');
    }
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'master') {
      onLogin(email, password, true);
    } else {
      onLogin(email, password, false, selectedCompany);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px]"></div>
      </div>

      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
             <span className="text-2xl font-bold text-white">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            AIWIS Portal
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Plataforma de Capacitación Corporativa</p>
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
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Email Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
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

          <Button fullWidth type="submit" className="mt-4 py-3 text-sm font-bold tracking-wide">
            {activeTab === 'master' ? 'Ingresar al Dashboard' : 'Acceder al Portal'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-600">
          ¿Problemas de acceso? Contacta a soporte@aiwis.cl
        </div>
      </div>
    </div>
  );
};