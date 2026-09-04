import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Terminal, 
  X, 
  Copy, 
  Check, 
  ChevronRight,
  RefreshCw,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestLog } from '../../types';

export const RequestLogsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<ApiRequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [envFilter, setEnvFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<ApiRequestLog | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'api_request_logs'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ApiRequestLog[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ApiRequestLog);
      });
      setLogs(list);
      setLoading(false);
    }, (err) => {
      console.warn('Logs query error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesEnv = envFilter === 'all' || log.environment === envFilter;
    const matchesSearch = 
      log.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.method.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesEnv && matchesSearch;
  });

  const exportLogsAsJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mht_api_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div id="request-logs-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-blue-400">MONITORING & TRAÇABILITÉ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Activité & Logs des Requêtes
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Audit complet et diagnostic technique de l'ensemble de vos appels API transitant par MHT Gateway.
          </p>
        </div>

        <button
          id="btn-export-logs"
          onClick={exportLogsAsJson}
          disabled={filteredLogs.length === 0}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-blue-400" />
          <span>Exporter JSON ({filteredLogs.length})</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="logs-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer par Request ID, Endpoint, Produit..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            id="logs-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Tous les statuts HTTP</option>
            <option value="SUCCESS">Succès (200 OK)</option>
            <option value="ERROR">Erreurs (4xx / 5xx)</option>
            <option value="REJECTED">Rejetés (Solde insuffisant / Clé invalide)</option>
          </select>
        </div>

        {/* Environment Filter */}
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            id="logs-env-filter"
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Tous les environnements</option>
            <option value="TEST">TEST (Sandbox)</option>
            <option value="LIVE">LIVE (Production)</option>
          </select>
        </div>

      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Chargement des journaux de requêtes...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 p-4">
            <Activity className="h-10 w-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Aucun log correspondant aux filtres.</p>
            <p className="text-xs text-slate-400 mt-1">Exécutez des requêtes via la Sandbox ou votre code pour voir l'historique.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Statut & Méthode</th>
                  <th className="px-4 py-3">Produit & Endpoint</th>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Latence</th>
                  <th className="px-4 py-3">Coût MHT</th>
                  <th className="px-4 py-3">Date / Heure</th>
                  <th className="px-4 py-3 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {filteredLogs.map((log) => {
                  const isSuccess = log.status === 'SUCCESS';
                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-800/40 transition cursor-pointer"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isSuccess ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          {log.statusCode} {log.method}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-sans">
                        <p className="font-semibold text-white truncate max-w-[180px]">{log.productName}</p>
                        <p className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">{log.endpoint}</p>
                      </td>

                      <td className="px-4 py-3 text-slate-400 truncate max-w-[120px]">
                        {log.requestId}
                      </td>

                      <td className="px-4 py-3 text-slate-300">
                        {log.latencyMs} ms
                      </td>

                      <td className="px-4 py-3 text-emerald-400 font-bold">
                        ${log.customerCost.toFixed(4)}
                      </td>

                      <td className="px-4 py-3 text-slate-400 font-sans text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="h-4 w-4 text-slate-400 inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Drawer / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedLog.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                HTTP {selectedLog.statusCode}
              </span>
              <span className="text-xs font-mono text-slate-400">Request ID: {selectedLog.requestId}</span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              {selectedLog.productName}
            </h2>
            <p className="font-mono text-xs text-blue-400 mt-1">
              {selectedLog.method} {selectedLog.endpoint}
            </p>

            {/* Quick Metrics */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <p className="text-slate-400 text-[10px]">Latence</p>
                <p className="font-mono font-bold text-white mt-0.5">{selectedLog.latencyMs} ms</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Coût Déduit</p>
                <p className="font-mono font-bold text-emerald-400 mt-0.5">${selectedLog.customerCost.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Environnement</p>
                <p className="font-mono font-bold text-amber-300 mt-0.5">{selectedLog.environment}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Clé utilisée</p>
                <p className="font-mono font-bold text-slate-300 mt-0.5 truncate">{selectedLog.apiKeyMasked || 'Par défaut'}</p>
              </div>
            </div>

            {/* Request Payload */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold text-slate-300">Payload de la requête :</p>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(selectedLog.requestPayload, null, 2))}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedPayload ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedPayload ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto max-h-[160px]">
                <code>{JSON.stringify(selectedLog.requestPayload, null, 2)}</code>
              </pre>
            </div>

            {/* Response Payload */}
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-300 mb-1.5">Réponse renvoyée par MHT Gateway :</p>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[180px]">
                <code>{JSON.stringify(selectedLog.responsePayload, null, 2)}</code>
              </pre>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
