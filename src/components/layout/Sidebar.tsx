import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Key, 
  Activity, 
  FileText, 
  Wallet, 
  User, 
  Shield, 
  Server, 
  Users, 
  Sliders, 
  History,
  Terminal,
  Cpu,
  Sparkles,
  Zap,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { userProfile, isAdmin, isSuperAdmin } = useAuth();

  const developerNav = [
    { id: 'dashboard', label: 'Accueil / Console', icon: LayoutDashboard },
    { id: 'catalog', label: 'Catalogue des APIs', icon: Layers, badge: '9 APIs' },
    { id: 'keys', label: 'MHT API Keys', icon: Key },
    { id: 'sandbox', label: 'Banc d\'Essai Sandbox', icon: Terminal, badge: 'Direct' },
    { id: 'logs', label: 'MHT Logs & Activité', icon: Activity },
    { id: 'billing', label: 'MHT Credits & Factures', icon: Wallet },
    { id: 'docs', label: 'MHT Docs', icon: FileText },
    { id: 'profile', label: 'Profil & Entreprise', icon: User },
  ];

  const adminNav = [
    { id: 'admin-supervision', label: 'MHT Supervision', icon: Zap, badge: 'Live' },
    { id: 'admin-users', label: 'Gestion Utilisateurs', icon: Users },
    { id: 'admin-providers', label: 'MHT Providers', icon: Server },
    { id: 'admin-products', label: 'Tarifs & Produits', icon: DollarSign },
    { id: 'admin-audit', label: 'Audit Administratif', icon: History },
  ];

  return (
    <aside id="mht-desktop-sidebar" className="hidden lg:flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-md p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      
      {/* Platform Sub-header */}
      <div className="mb-4 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <p className="text-xs font-mono font-semibold text-slate-200">MHT Gateway v1</p>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">Infrastructure unifiée</p>
      </div>

      {/* Developer Navigation Section */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Espace Développeur
        </p>
        {developerNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => setCurrentView(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Navigation Section */}
      {isAdmin && (
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Console Admin
            </p>
            <span className="rounded bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-mono text-purple-300">
              {isSuperAdmin ? 'GENERAL' : 'ADMIN'}
            </span>
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-admin-${item.id}`}
                onClick={() => setCurrentView(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:bg-purple-950/40 hover:text-purple-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-purple-900/60 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-purple-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* System Status Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800/80">
        <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-200">Statut MHT APIs</span>
            <span className="text-emerald-400 font-mono text-[10px]">100% Opérationnel</span>
          </div>
          <p className="text-[10px] text-slate-400">Routage centralisé MHT</p>
        </div>
      </div>
    </aside>
  );
};
