import React, { useEffect, useState } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  AlertTriangle, 
  Key, 
  Wallet, 
  CreditCard, 
  ShieldAlert, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { NotificationItem, NotificationType } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [currentUser.uid, 'broadcast']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
      });
      setNotifications(items);
      setLoading(false);
    }, (error) => {
      console.warn('Notifications snapshot note:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!isOpen) return null;

  const markAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach((n) => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await updateDoc(doc(db, 'notifications', notif.id), { read: true });
    }
    if (notif.linkTo) {
      const cleanView = notif.linkTo.replace('/', '');
      onNavigate(cleanView);
      onClose();
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'credit_low':
        return <Wallet className="h-4 w-4 text-amber-400" />;
      case 'key_revoked':
        return <Key className="h-4 w-4 text-rose-400" />;
      case 'api_error':
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case 'payment':
      case 'billing':
        return <CreditCard className="h-4 w-4 text-emerald-400" />;
      case 'security':
        return <ShieldAlert className="h-4 w-4 text-purple-400" />;
      case 'new_service':
      default:
        return <Sparkles className="h-4 w-4 text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div id="notifications-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div 
        id="notifications-drawer-panel"
        className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 p-5 shadow-2xl flex flex-col"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-600/30 border border-blue-500/40 px-2 py-0.5 text-[11px] font-mono font-bold text-blue-300">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                id="mark-all-read-btn"
                onClick={markAllAsRead}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-medium transition"
                title="Tout marquer comme lu"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Tout lire</span>
              </button>
            )}
            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Chargement des alertes...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-slate-600 opacity-50" />
              <p className="text-xs font-medium">Aucune notification pour le moment.</p>
              <p className="text-[11px] text-slate-600 mt-1">Vous recevrez ici les alertes de vos clés API, soldes et services.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  n.read
                    ? 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                    : 'bg-blue-950/30 border-blue-800/50 text-white hover:bg-blue-900/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-lg p-1.5 bg-slate-800/80 border border-slate-700/60">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-semibold truncate text-slate-100">{n.title}</p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/50 text-[10px] text-slate-400">
                      <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.linkTo && (
                        <span className="flex items-center gap-1 text-blue-400 font-medium">
                          Consulter <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">Centre d'alertes MHT Gateway</p>
        </div>
      </div>
    </div>
  );
};
