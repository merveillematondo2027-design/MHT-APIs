import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Power, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Lock, 
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { ApiKey, KeyEnvironment } from '../../types';
import { generateMhtApiKey } from '../../lib/mhtGatewayService';

export const ApiKeysView: React.FC = () => {
  const { currentUser } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Key Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<KeyEnvironment>('TEST');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRawKey, setGeneratedRawKey] = useState<string | null>(null);
  
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedRawModal, setCopiedRawModal] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'api_keys'),
      where('ownerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ApiKey[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ApiKey);
      });
      // Sort by creation date descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setKeys(list);
      setLoading(false);
    }, (err) => {
      console.warn('API Keys snapshot error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsGenerating(true);

    try {
      const { rawKey } = await generateMhtApiKey({
        userId: currentUser.uid,
        name: newKeyName.trim() || (newKeyEnv === 'TEST' ? 'Clé Sandbox' : 'Clé Live Production'),
        environment: newKeyEnv
      });
      setGeneratedRawKey(rawKey);
      setNewKeyName('');
    } catch (err) {
      console.error('Error generating API key:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleKeyStatus = async (key: ApiKey) => {
    const nextStatus = key.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await updateDoc(doc(db, 'api_keys', key.id), {
      status: nextStatus
    });
  };

  const handleRevokeKey = async (key: ApiKey) => {
    if (window.confirm(`Êtes-vous sûr de vouloir révoquer définitivement la clé "${key.name}" ? Cette action est irréversible.`)) {
      await updateDoc(doc(db, 'api_keys', key.id), {
        status: 'REVOKED',
        revokedAt: new Date().toISOString()
      });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div id="api-keys-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-blue-400">AUTHENTIFICATION & SÉCURITÉ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            MHT API Keys
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Générez et gérez vos clés d'accès pour interagir avec la passerelle MHT APIs en environnement TEST (Sandbox) ou LIVE.
          </p>
        </div>

        <button
          id="btn-create-api-key"
          onClick={() => {
            setGeneratedRawKey(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Créer une nouvelle clé</span>
        </button>
      </div>

      {/* Security Architecture Notice */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col sm:flex-row items-start gap-3.5">
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-2.5 text-blue-400 shrink-0">
          <Lock className="h-5 w-5" />
        </div>
        <div className="space-y-1 text-xs leading-relaxed">
          <p className="font-bold text-white">
            Architecture de Sécurité des Clés MHT :
          </p>
          <p className="text-slate-400">
            Conformément aux normes bancaires et cloud de MHT, les clés secrètes complètes ne sont jamais stockées en clair dans la base de données. Seul le hachage cryptographique (SHA-256) et les 4 derniers caractères sont conservés pour validation.
          </p>
          <p className="text-amber-400/90 font-mono text-[11px] pt-1">
            Préfixes standards : <strong>mht_test_</strong> (Sandbox libre) et <strong>mht_live_</strong> (Production régulée).
          </p>
        </div>
      </div>

      {/* Keys List Table / Cards */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-400" />
            <span>Vos Clés API ({keys.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            {keys.filter(k => k.status === 'ACTIVE').length} actives
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Chargement de vos clés API...
          </div>
        ) : keys.length === 0 ? (
          <div className="py-16 text-center text-slate-500 p-4">
            <Key className="h-10 w-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Aucune clé API active.</p>
            <p className="text-xs text-slate-400 mt-1">Créez votre première clé pour commencer vos appels d'intégration.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Créer une clé Sandbox</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {keys.map((apiKey) => {
              const isTest = apiKey.environment === 'TEST';
              const isRevoked = apiKey.status === 'REVOKED';
              const isDisabled = apiKey.status === 'DISABLED';
              const isActive = apiKey.status === 'ACTIVE';

              return (
                <div 
                  key={apiKey.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    isRevoked ? 'bg-slate-950/40 opacity-60' : 'hover:bg-slate-800/30'
                  }`}
                >
                  {/* Left info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-sm">{apiKey.name}</span>
                      
                      {/* Env badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isTest 
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' 
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {apiKey.environment}
                      </span>

                      {/* Status badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isActive 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' 
                          : isRevoked
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {apiKey.status}
                      </span>
                    </div>

                    {/* Masked Key & Hash */}
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                      <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-blue-300">
                        {apiKey.maskedKey}
                      </span>
                      <button
                        onClick={() => copyToClipboard(apiKey.maskedKey, apiKey.id)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        title="Copier le masque"
                      >
                        {copiedKeyId === apiKey.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Timestamps */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span>Créée le {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                      {apiKey.lastUsedAt && (
                        <span>Dernier appel : {new Date(apiKey.lastUsedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isRevoked && (
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => handleToggleKeyStatus(apiKey)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                          isActive
                            ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        }`}
                        title={isActive ? 'Désactiver temporairement' : 'Réactiver la clé'}
                      >
                        <Power className="h-3.5 w-3.5" />
                        <span>{isActive ? 'Désactiver' : 'Activer'}</span>
                      </button>

                      <button
                        onClick={() => handleRevokeKey(apiKey)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition"
                        title="Révoquer définitivement"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Révoquer</span>
                      </button>
                    </div>
                  )}

                  {isRevoked && (
                    <div className="text-[11px] text-rose-400 font-mono italic">
                      Révoquée le {new Date(apiKey.revokedAt || apiKey.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create API Key */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {!generatedRawKey ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Nouvelle Clé MHT</h2>
                    <p className="text-xs text-slate-400">Génération sécurisée de jeton d'accès</p>
                  </div>
                </div>

                <form onSubmit={handleCreateKey} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nom descriptif de la clé *
                    </label>
                    <input
                      id="input-key-name"
                      type="text"
                      required
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Ex: Serveur Production Market-Cash"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Environnement d'exécution
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewKeyEnv('TEST')}
                        className={`p-3 rounded-xl border text-left transition ${
                          newKeyEnv === 'TEST'
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <p className="text-xs font-bold font-mono">TEST (Sandbox)</p>
                        <p className="text-[10px] mt-1 text-slate-400">Préfixe : mht_test_</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewKeyEnv('LIVE')}
                        className={`p-3 rounded-xl border text-left transition ${
                          newKeyEnv === 'LIVE'
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <p className="text-xs font-bold font-mono">LIVE (Production)</p>
                        <p className="text-[10px] mt-1 text-slate-400">Préfixe : mht_live_</p>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-300 mb-0.5">
                      <Info className="h-3.5 w-3.5 text-blue-400" />
                      Rappel de sécurité
                    </p>
                    La clé brute ne sera affichée qu'une seule fois. Veillez à la sauvegarder dans vos variables d'environnement serveur.
                  </div>

                  <button
                    id="submit-generate-key-btn"
                    type="submit"
                    disabled={isGenerating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    <span>{isGenerating ? 'Génération en cours...' : 'Générer la clé API'}</span>
                  </button>
                </form>
              </>
            ) : (
              /* Success display with raw secret */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Clé API Générée !</h2>
                    <p className="text-xs text-emerald-400">Copiez immédiatement votre clé secrète.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertCircle className="h-4 w-4" />
                    Attention :
                  </p>
                  Pour des raisons de sécurité, cette clé ne sera plus jamais affichée en clair.
                </div>

                <div className="relative">
                  <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 pr-12 font-mono text-xs text-blue-300 break-all select-all">
                    {generatedRawKey}
                  </div>
                  <button
                    id="btn-copy-raw-key"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedRawKey);
                      setCopiedRawModal(true);
                      setTimeout(() => setCopiedRawModal(false), 2000);
                    }}
                    className="absolute right-2 top-2 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-500 transition shadow"
                    title="Copier la clé"
                  >
                    {copiedRawModal ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setGeneratedRawKey(null);
                  }}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
                >
                  J'ai copié ma clé en lieu sûr
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
