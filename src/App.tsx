import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LandingPage } from './components/landing/LandingPage';
import { DeveloperDashboard } from './components/dashboard/DeveloperDashboard';
import { ApiCatalogView } from './components/catalog/ApiCatalogView';
import { ApiKeysView } from './components/keys/ApiKeysView';
import { SandboxPlaygroundView } from './components/sandbox/SandboxPlaygroundView';
import { RequestLogsView } from './components/logs/RequestLogsView';
import { BillingView } from './components/billing/BillingView';
import { DocumentationView } from './components/docs/DocumentationView';
import { AdminConsoleView } from './components/admin/AdminConsoleView';
import { UserProfileView } from './components/profile/UserProfileView';
import { AuthModal } from './components/auth/AuthModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { ApiProduct } from './types';

export function App() {
  const { currentUser, loading } = useAuth();

  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedProductForSandbox, setSelectedProductForSandbox] = useState<ApiProduct | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigateToSandbox = (product: ApiProduct) => {
    setSelectedProductForSandbox(product);
    setCurrentView('sandbox');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-4"></div>
        <p className="font-mono text-xs text-blue-400">Chargement de MHT APIs Gateway...</p>
      </div>
    );
  }

  const isLanding = currentView === 'landing';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 font-sans">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAuth={handleOpenAuth}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      {isLanding ? (
        <main className="flex-1">
          <LandingPage
            onNavigate={(view) => {
              if ((view === 'dashboard' || view === 'keys' || view === 'billing' || view === 'profile') && !currentUser) {
                handleOpenAuth('login');
              } else {
                setCurrentView(view);
              }
            }}
            onOpenAuth={handleOpenAuth}
            onSelectProductForSandbox={handleNavigateToSandbox}
          />
        </main>
      ) : (
        <div className="flex-1 flex w-full">
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
          />

          <main className="flex-1 pb-20 lg:pb-8 overflow-y-auto">
            {currentView === 'dashboard' && (
              <DeveloperDashboard
                onNavigate={setCurrentView}
                onOpenSandboxWithProduct={() => {
                  setCurrentView('sandbox');
                }}
              />
            )}

            {currentView === 'catalog' && (
              <ApiCatalogView
                onNavigateToSandbox={handleNavigateToSandbox}
                onNavigateToDocs={() => setCurrentView('docs')}
              />
            )}

            {currentView === 'keys' && <ApiKeysView />}

            {currentView === 'sandbox' && (
              <SandboxPlaygroundView initialProduct={selectedProductForSandbox} />
            )}

            {currentView === 'logs' && <RequestLogsView />}
            {currentView === 'billing' && <BillingView />}
            {currentView === 'docs' && <DocumentationView />}
            {currentView === 'admin' && <AdminConsoleView />}
            {currentView === 'profile' && <UserProfileView />}
          </main>
        </div>
      )}

      {!isLanding && (
        <MobileBottomNav
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          if (currentView === 'landing') {
            setCurrentView('dashboard');
          }
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onNavigate={setCurrentView}
      />
    </div>
  );
}

export default App;
