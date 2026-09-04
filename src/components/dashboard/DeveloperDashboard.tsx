import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  Activity, 
  Key, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  Terminal, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { ApiKey, ApiRequestLog } from '../../types';
import { INITIAL_PRODUCTS } from '../../lib/seedData';

interface DeveloperDashboardProps {
  onNavigate: (view: string) => void;
  onOpenSandboxWithProduct?: (productId: string) => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  onNavigate,
  onOpenSandboxWithProduct,
}) => {
  const { currentUser, userProfile, wallet, refreshWallet } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [recentLogs, setRecentLogs] = useState<ApiRequestLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to user API keys
    const keysQuery = query(
      collection(db, 'api_keys'),
      where('ownerId', '==', currentUser.uid)
    );
    const unsubKeys = onSnapshot(keysQuery, (snap) => {
      const keysList: ApiKey[] = [];
      snap.forEach((docSnap) => {
        keysList.push({ id: docSnap.id, ...docSnap.data() } as ApiKey);
      });
      setApiKeys(keysList);
    });

    // Listen to recent API request logs
    const logsQuery = query(
      collection(db, 'api_request_logs'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(8)
    );
    const unsubLogs = onSnapshot(logsQuery, (snap) => {
      const logList: ApiRequestLog[] = [];
      snap.forEach((docSnap) => {
        logList.push({ id: docSnap.id, ...docSnap.data() } as ApiRequestLog);
      });
      setRecentLogs(logList);
      setLoading(false);
    }, (err) => {
      console.warn('Dashboard logs snapshot handled:', err);
      setLoading(false);
    });

    return () => {
      unsubKeys();
      unsubLogs();
    };
  }, [currentUser]);

  const activeKeysCount = apiKeys.filter(k => k.status === 'ACTIVE').length;
  const totalRequestsCount = recentLogs.length;
  const totalSpentMonth = wallet?.totalConsumed || 0;
  const errorsCount = recentLogs.filter(l => l.status === 'ERROR' || l.status === 'REJECTED').length;
  const usedProductsCount = new Set(recentLogs.map(l => l.productId)).size;

  return (
    <div id="developer-dashboard" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-800/40 p-5 sm:p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-300 border border-blue-500/30">
              MHT DEVELOPER CONSOLE
            </span>
            <span className="text-xs text-slate-400">Environnement Sandbox Connecté</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Bonjour, {userProfile?.displayName || 'Développeur MHT'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Supervisez vos consommations API, vos clés d'accès et exécutez vos tests d'interconnexion en temps réel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-quick-key-btn"
            onClick={() => onNavigate('keys')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Gérer les Clés</span>
          </button>
          <button
            id="dash-quick-sandbox-btn"
            onClick={() => onNavigate('sandbox')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Terminal className="h-4 w-4 text-blue-400" />
            <span>Banc Sandbox</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Crédits disponibles */}
        <div 
          onClick={() => onNavigate('billing')}
          className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Crédits Disponibles</span>
            <Wallet className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            ${(wallet?.creditBalance ?? 25.0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>MHT Credits</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400" />
          </p>
        </div>

        {/* KPI 2: Consommation du mois */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Consommation Mois</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">
            ${totalSpentMonth.toFixed(4)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Dépenses estimées
          </p>
        </div>

        {/* KPI 3: Nombre de requêtes */}
        <div 
          onClick={() => onNavigate('logs')}
          className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Requêtes API</span>
            <Activity className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">
            {totalRequestsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {errorsCount === 0 ? '100% Succès' : `${errorsCount} Erreurs signalées`}
          </p>
        </div>

        {/* KPI 4: Clés actives */}
        <div 
          onClick={() => onNavigate('keys')}
          className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Clés Actives</span>
            <Key className="h-4 w-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">
            {activeKeysCount} / {apiKeys.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {usedProductsCount} APIs sollicitées
          </p>
        </div>

      </div>

      {/* Two Column Layout: Quick Sandbox Tester & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick API Actions & Popular APIs */}
        <div className="lg:col-span-1 space-y-4">
          
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>APIs Prêtes à Tester</span>
              </h3>
              <button 
                onClick={() => onNavigate('catalog')}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Catalogue
              </button>
            </div>

            <div className="space-y-2.5">
              {INITIAL_PRODUCTS.slice(0, 4).map((prod) => (
                <div 
                  key={prod.id}
                  onClick={() => onNavigate('sandbox')}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition truncate">
                      {prod.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ${prod.pricePerUnit.toFixed(4)} / {prod.unitName}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition shrink-0" />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => onNavigate('sandbox')}
                className="w-full py-2 rounded-xl bg-blue-600/10 border border-blue-500/30 text-xs font-semibold text-blue-300 hover:bg-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Ouvrir le Banc d'Essai</span>
              </button>
            </div>
          </div>

          {/* Partner Notice Card */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Routage MHT Sécurisé
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vos requêtes transitent par la passerelle centrale MHT. Aucune clé fournisseur tierce n'est exposée côté client.
            </p>
          </div>

        </div>

        {/* Right Column: Real-time Recent Activity & Request Logs */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  <span>Activité Récente (MHT Logs)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Journal en direct de vos requêtes passées via la passerelle.
                </p>
              </div>

              <button
                id="view-all-logs-btn"
                onClick={() => onNavigate('logs')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
              >
                <span>Voir tout</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Logs Table / Cards */}
            {recentLogs.length === 0 ? (
              <div className="py-14 text-center text-slate-500 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <Terminal className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-medium text-slate-300">Aucune requête API enregistrée</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Exécutez votre premier test dans le banc d'essai Sandbox pour voir apparaître les logs en direct.
                </p>
                <button
                  onClick={() => onNavigate('sandbox')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Tester une API maintenant</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => onNavigate('logs')}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.status === 'SUCCESS' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {log.statusCode} {log.method}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{log.productName}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate">{log.endpoint}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono">
                      <span className="text-slate-400 text-[11px]">{log.latencyMs}ms</span>
                      <span className="text-emerald-400 font-semibold text-[11px]">
                        -${log.customerCost.toFixed(4)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Routage MHT : Journal d'audit et diagnostic actif</span>
            <button
              onClick={() => onNavigate('docs')}
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Guide d'intégration SDK</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
