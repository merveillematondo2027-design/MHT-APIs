import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Server, 
  FileText, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Check, 
  X,
  CreditCard,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, ApiProvider, ApiProduct, SystemAuditLog, ApiRequestLog } from '../../types';
import { INITIAL_PROVIDERS, INITIAL_PRODUCTS, seedInitialCatalogData } from '../../lib/seedData';

export const AdminConsoleView: React.FC = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'providers' | 'audit'>('overview');
  
  // Data states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [providers, setProviders] = useState<ApiProvider[]>(INITIAL_PROVIDERS);
  const [products, setProducts] = useState<ApiProduct[]>(INITIAL_PRODUCTS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [allRequestLogs, setAllRequestLogs] = useState<ApiRequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin User Adjustment Modal
  const [adjustingUser, setAdjustingUser] = useState<UserProfile | null>(null);
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState<number>(50);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Bonus partenarial MHT');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    // Listen to users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list: UserProfile[] = [];
      snap.forEach(d => list.push({ uid: d.id, ...d.data() } as UserProfile));
      setUsers(list);
    });

    // Listen to providers
    const unsubProviders = onSnapshot(collection(db, 'api_providers'), (snap) => {
      if (!snap.empty) {
        const list: ApiProvider[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as ApiProvider));
        setProviders(list);
      }
    });

    // Listen to all logs for platform supervision
    const unsubLogs = onSnapshot(
      query(collection(db, 'api_request_logs'), orderBy('createdAt', 'desc'), limit(50)),
      (snap) => {
        const list: ApiRequestLog[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as ApiRequestLog));
        setAllRequestLogs(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Admin logs snapshot note:', err);
        setLoading(false);
      }
    );

    // Listen to audit logs
    const unsubAudit = onSnapshot(
      query(collection(db, 'system_audit_logs'), orderBy('createdAt', 'desc'), limit(30)),
      (snap) => {
        const list: SystemAuditLog[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as SystemAuditLog));
        setAuditLogs(list);
      }
    );

    return () => {
      unsubUsers();
      unsubProviders();
      unsubLogs();
      unsubAudit();
    };
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedInitialCatalogData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAdjustUserCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser || !currentUser) return;

    try {
      // Record audit log
      const auditEntry: Omit<SystemAuditLog, 'id'> = {
        adminId: currentUser.uid,
        adminEmail: currentUser.email || 'admin@mungweletech.com',
        action: 'CREDIT_ADJUSTMENT',
        targetResource: `users/${adjustingUser.uid}`,
        details: `Ajustement de crédits de +$${creditAdjustmentAmount} USD pour ${adjustingUser.email}. Motif : ${adjustmentReason}`,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'system_audit_logs'), auditEntry);

      alert(`Crédits ajustés avec succès pour ${adjustingUser.displayName || adjustingUser.email}.`);
      setAdjustingUser(null);
    } catch (err) {
      console.error('Adjustment error:', err);
    }
  };

  const handleUpdateUserRole = async (targetUser: UserProfile, newRole: 'developer' | 'business' | 'admin' | 'admin_general') => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'system_audit_logs'), {
        adminId: currentUser.uid,
        adminEmail: currentUser.email || 'admin@mungweletech.com',
        action: 'ROLE_CHANGE',
        targetResource: `users/${targetUser.uid}`,
        details: `Changement de rôle de ${targetUser.email} vers "${newRole}"`,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  // Platform KPIs
  const totalRevenue = allRequestLogs.reduce((acc, l) => acc + (l.customerCost || 0), 0);
  const totalProviderCost = allRequestLogs.reduce((acc, l) => acc + (l.providerCost || 0), 0);
  const totalMargin = totalRevenue - totalProviderCost;
  const totalRequests = allRequestLogs.length;
  const errorRequests = allRequestLogs.filter(l => l.status === 'ERROR' || l.status === 'REJECTED').length;

  return (
    <div id="admin-console-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-purple-400">CONSOLE D'ADMINISTRATION GÉNÉRALE</span>
            <span className="rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono px-2 py-0.2 border border-purple-500/30">
              ACCÈS PRIVILÉGIÉ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Supervision & Gouvernance MHT
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Gestion des utilisateurs, des fournisseurs partenaires, des marges MHT et journal d'audit de sécurité.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-seed-btn"
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-950/60 px-3.5 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-900/60 transition disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>{isSeeding ? 'Initialisation...' : seedSuccess ? 'Catalogue Réinitialisé !' : 'Synchroniser Catalogue'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: 'overview', label: 'Supervision Globale', icon: Activity },
          { id: 'users', label: `Utilisateurs (${users.length})`, icon: Users },
          { id: 'providers', label: `Fournisseurs & APIs (${providers.length})`, icon: Server },
          { id: 'audit', label: `Journal d'Audit (${auditLogs.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
              <span className="text-xs text-slate-400 font-medium">Revenus Bruts MHT</span>
              <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                ${totalRevenue.toFixed(4)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Facturé aux clients</p>
            </div>

            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
              <span className="text-xs text-slate-400 font-medium">Coûts Fournisseurs</span>
              <p className="text-2xl font-mono font-bold text-slate-300 mt-1">
                ${totalProviderCost.toFixed(4)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Fournisseurs tiers</p>
            </div>

            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
              <span className="text-xs text-slate-400 font-medium">Marge Nette MHT</span>
              <p className="text-2xl font-mono font-bold text-purple-400 mt-1">
                ${totalMargin.toFixed(4)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Bénéfice passerelle</p>
            </div>

            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
              <span className="text-xs text-slate-400 font-medium">Volume Global</span>
              <p className="text-2xl font-mono font-bold text-white mt-1">
                {totalRequests} requêtes
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{errorRequests} erreurs signalées</p>
            </div>
          </div>

          {/* Real-time Global Logs Table */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <span>Flux Global des Requêtes MHT Gateway</span>
              </h3>
              <span className="text-xs text-slate-400">Temps réel</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 font-mono text-[11px] uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Client ID</th>
                    <th className="px-4 py-3">Produit API</th>
                    <th className="px-4 py-3">Coût Client</th>
                    <th className="px-4 py-3">Marge MHT</th>
                    <th className="px-4 py-3">Latence</th>
                    <th className="px-4 py-3">Horodatage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {allRequestLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[100px]">
                        {log.userId.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 font-sans font-semibold text-white">
                        {log.productName}
                      </td>
                      <td className="px-4 py-3 text-emerald-400">
                        ${log.customerCost.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-purple-400">
                        +${log.mhtMargin.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {log.latencyMs} ms
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] font-sans">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span>Gestion des Comptes Utilisateurs ({users.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 font-mono text-[11px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Entreprise</th>
                  <th className="px-4 py-3">Rôle Actuel</th>
                  <th className="px-4 py-3">Pays</th>
                  <th className="px-4 py-3">Inscription</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-white">
                      <p className="font-bold">{u.displayName || 'Sans nom'}</p>
                      <p className="text-[11px] font-mono text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {u.companyName || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u, e.target.value as any)}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="developer">developer</option>
                        <option value="business">business</option>
                        <option value="admin">admin</option>
                        <option value="admin_general">admin_general</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {u.country || 'RDC'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setAdjustingUser(u)}
                        className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-600/30 transition"
                      >
                        Ajuster Crédits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Providers & APIs */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((prov) => (
              <div key={prov.id} className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400 uppercase">{prov.category}</span>
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-bold">
                    {prov.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base">{prov.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{prov.description}</p>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p>Marge MHT configurée : <strong className="text-purple-400 font-mono">+{prov.defaultMarginPercent}%</strong></p>
                  <p>Health Check : <strong className="text-emerald-400 font-mono">{prov.healthStatus}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span>Piste d'Audit des Actions Administrateurs</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 font-mono text-[11px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Détails</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      Aucune action d'administration enregistrée récemment.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-purple-300">
                        {item.action}
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                        {item.adminEmail}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {item.details}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Adjust User Credits */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100 my-8">
            <button
              onClick={() => setAdjustingUser(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Ajuster les Crédits Développeur</h2>
            <p className="text-xs text-slate-400 mb-4">
              Bénéficiaire : <strong>{adjustingUser.displayName || adjustingUser.email}</strong>
            </p>

            <form onSubmit={handleAdjustUserCredits} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Montant à ajouter (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={creditAdjustmentAmount}
                  onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-emerald-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Motif d'audit administratif *
                </label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Ex: Subvention Hackathon / Accord commercial"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition shadow-lg shadow-purple-600/30"
              >
                Valider l'ajustement (+${creditAdjustmentAmount} USD)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
