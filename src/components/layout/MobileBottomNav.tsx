import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Key, 
  Activity, 
  User 
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, setCurrentView }) => {
  const items = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'catalog', label: 'APIs', icon: Layers },
    { id: 'keys', label: 'Clés', icon: Key },
    { id: 'logs', label: 'Activité', icon: Activity },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <div id="mht-mobile-bottom-nav" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl px-2 py-1 transition-all ${
              isActive
                ? 'text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
