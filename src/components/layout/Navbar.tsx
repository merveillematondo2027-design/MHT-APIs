import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Key, 
  Wallet, 
  Sparkles, 
  Layers, 
  Menu, 
  X,
  ExternalLink,
  Code2,
  Lock,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  unreadNotifsCount: number;
  onToggleNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenAuth,
  unreadNotifsCount,
  onToggleNotifications,
}) => {
  const { currentUser, userProfile, wallet, logout, isAdmin, isSuperAdmin, activeRoleView, setActiveRoleView } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { key: UserRole | null; label: string }[] = [
    { key: null, label: `Mon rôle réel (${userProfile?.role || 'developer'})` },
    { key: 'developer', label: 'Vue Développeur' },
    { key: 'business', label: 'Vue Business / Entreprise' },
    { key: 'admin', label: 'Vue Administrateur' },
    { key: 'admin_general', label: 'Vue Super Admin (Général)' },
  ];

  return (
    <nav id="mht-navbar" className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            id="brand-logo-btn"
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30 group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-extrabold tracking-wider text-white">MHT</span>
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-mono font-semibold text-blue-400 border border-blue-500/20">APIs</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Mungwele Holding & Technology</p>
            </div>
          </button>

          {/* Sandbox Indicator badge */}
          <div className="hidden md:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            SANDBOX ACTIVE
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          <button
            id="nav-link-landing"
            onClick={() => setCurrentView('landing')}
            className={`text-sm font-medium transition-colors ${
              currentView === 'landing' ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Accueil
          </button>
          <button
            id="nav-link-catalog"
            onClick={() => setCurrentView('catalog')}
            className={`text-sm font-medium transition-colors ${
              currentView === 'catalog' ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Catalogue APIs
          </button>
          <button
            id="nav-link-docs"
            onClick={() => setCurrentView('docs')}
            className={`text-sm font-medium transition-colors ${
              currentView === 'docs' ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Documentation
          </button>
          <button
            id="nav-link-sandbox"
            onClick={() => setCurrentView('sandbox')}
            className={`text-sm font-medium transition-colors ${
              currentView === 'sandbox' ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Banc d'Essai
          </button>
        </div>

        {/* Right Action Section */}
        <div className="flex items-center gap-3">
          
          {currentUser ? (
            <>
              {/* Credit Wallet Badge */}
              <button
                id="navbar-wallet-btn"
                onClick={() => setCurrentView('billing')}
                className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition"
              >
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span className="font-mono font-semibold text-emerald-400">
                  ${(wallet?.creditBalance ?? 25.0).toFixed(2)}
                </span>
                <span className="text-slate-400 text-[11px]">MHT Credits</span>
              </button>

              {/* Role Switcher for Admin testing */}
              {isAdmin && (
                <div className="relative">
                  <button
                    id="role-switch-dropdown-btn"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 px-2.5 py-1.5 text-xs text-indigo-300 hover:bg-indigo-900/60 transition"
                    title="Changer de vue de rôle pour tester"
                  >
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="hidden xl:inline text-[11px] font-mono">
                      {activeRoleView ? `Vue: ${activeRoleView}` : `Rôle: ${userProfile?.role}`}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl z-50">
                      <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                        Mode de test de rôles
                      </div>
                      {roles.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setActiveRoleView(r.key);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition ${
                            activeRoleView === r.key || (r.key === null && !activeRoleView)
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notification Bell */}
              <button
                id="notifications-bell-btn"
                onClick={onToggleNotifications}
                className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Console Workspace Button */}
              <button
                id="enter-console-btn"
                onClick={() => setCurrentView('dashboard')}
                className={`hidden md:flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-blue-500/25'
                    : 'bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30'
                }`}
              >
                <Terminal className="h-4 w-4" />
                <span>Console MHT</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-1.5 pr-2.5 text-xs text-slate-200 hover:border-slate-700 transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                    {userProfile?.displayName || userProfile?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-lg p-2 shadow-2xl z-50 text-slate-200">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">{userProfile?.displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{userProfile?.email}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-block rounded bg-blue-900/40 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-300 border border-blue-700/50">
                          {userProfile?.role?.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                          ${(wallet?.creditBalance ?? 25.0).toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      >
                        <Terminal className="h-4 w-4 text-blue-400" />
                        Developer Console
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('keys');
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      >
                        <Key className="h-4 w-4 text-amber-400" />
                        Mes Clés API
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('billing');
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      >
                        <Wallet className="h-4 w-4 text-emerald-400" />
                        Crédits & Facturation
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        Profil & Entreprise
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setCurrentView('admin-supervision');
                            setUserDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 transition mt-1 border border-purple-800/40"
                        >
                          <Shield className="h-4 w-4 text-purple-400" />
                          Console Administrateur
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        id="logout-btn"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-login"
                onClick={() => onOpenAuth('login')}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
              >
                Se connecter
              </button>
              <button
                id="btn-register"
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition"
              >
                <span>Créer un compte</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-2">
          <div className="flex items-center gap-2 mb-3 px-2 py-1 rounded bg-amber-500/10 text-amber-300 text-xs font-mono">
            <span>Environnement Sandbox : 25.00$ de crédits offerts</span>
          </div>
          <button
            onClick={() => { setCurrentView('landing'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
          >
            Accueil MHT
          </button>
          <button
            onClick={() => { setCurrentView('catalog'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
          >
            Catalogue APIs
          </button>
          <button
            onClick={() => { setCurrentView('docs'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
          >
            Documentation
          </button>
          <button
            onClick={() => { setCurrentView('sandbox'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
          >
            Banc d'Essai (Sandbox)
          </button>
          {currentUser && (
            <>
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-blue-400 hover:bg-slate-900"
                >
                  Developer Console
                </button>
                <button
                  onClick={() => { setCurrentView('keys'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
                >
                  Mes Clés API
                </button>
                <button
                  onClick={() => { setCurrentView('logs'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
                >
                  Logs & Activité
                </button>
                <button
                  onClick={() => { setCurrentView('billing'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
                >
                  Crédits & Facturation
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
