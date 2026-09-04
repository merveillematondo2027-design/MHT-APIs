import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Key, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Code2, 
  Wallet, 
  Copy, 
  Check, 
  RefreshCw,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Send
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { ApiProduct, ApiKey, KeyEnvironment, GatewayApiResponse } from '../../types';
import { INITIAL_PRODUCTS } from '../../lib/seedData';
import { executeGatewayRequest } from '../../lib/mhtGatewayService';

interface SandboxPlaygroundViewProps {
  initialProduct?: ApiProduct | null;
}

export const SandboxPlaygroundView: React.FC<SandboxPlaygroundViewProps> = ({ initialProduct }) => {
  const { currentUser, wallet, refreshWallet } = useAuth();
  const [products] = useState<ApiProduct[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct>(initialProduct || INITIAL_PRODUCTS[0]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [environment, setEnvironment] = useState<KeyEnvironment>('TEST');
  const [payloadText, setPayloadText] = useState<string>(selectedProduct.sampleRequest);
  
  // Execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResponse, setExecutionResponse] = useState<GatewayApiResponse | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      setPayloadText(initialProduct.sampleRequest);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'api_keys'),
      where('ownerId', '==', currentUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: ApiKey[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ApiKey);
      });
      setApiKeys(list);
      if (list.length > 0 && !selectedKeyId) {
        setSelectedKeyId(list[0].id);
      }
    });
    return () => unsub();
  }, [currentUser]);

  const handleProductChange = (prod: ApiProduct) => {
    setSelectedProduct(prod);
    setPayloadText(prod.sampleRequest);
    setExecutionResponse(null);
    setExecutionError(null);
  };

  const handleRunSimulation = async () => {
    if (!currentUser) return;
    setIsExecuting(true);
    setExecutionError(null);
    setExecutionResponse(null);

    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch {
        throw new Error('Le format JSON du payload est invalide. Veuillez vérifier la syntaxe.');
      }

      let keyToUse = apiKeys.find(k => k.id === selectedKeyId);
      if (!keyToUse) {
        // Fallback default test key representation
        keyToUse = {
          id: 'key_sandbox_auto',
          keyId: 'key_sandbox_auto',
          keyPrefix: environment === 'TEST' ? 'mht_test_' : 'mht_live_',
          maskedKey: `${environment === 'TEST' ? 'mht_test_' : 'mht_live_'}••••••••auto`,
          keyHash: 'sha256_mock',
          environment: environment,
          name: 'Clé Sandbox Automatique',
          status: 'ACTIVE',
          ownerId: currentUser.uid,
          createdAt: new Date().toISOString()
        };
      }

      const res = await executeGatewayRequest({
        userId: currentUser.uid,
        apiKey: keyToUse,
        product: selectedProduct,
        customPayload: parsedPayload,
        environment: environment
      });

      setExecutionResponse(res);
      await refreshWallet();
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setExecutionError(errObj.message || 'Erreur lors de l’exécution du test.');
    } finally {
      setIsExecuting(false);
    }
  };

  const copyResponse = () => {
    if (!executionResponse) return;
    navigator.clipboard.writeText(JSON.stringify(executionResponse, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div id="sandbox-playground-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-blue-400">MHT GATEWAY TEST BENCH</span>
            <span className="rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono px-2 py-0.2">
              SANDBOX ISOLÉE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Banc d'Essai & Playground API
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Testez directement les appels vers la passerelle MHT avec calcul de coût réel, simulation de latence et déduction de crédits.
          </p>
        </div>

        {/* Live Wallet Pill */}
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-900 border border-slate-800 p-2.5 pr-4 self-start md:self-auto">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-emerald-400">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Solde Crédits Sandbox</p>
            <p className="text-sm font-bold font-mono text-emerald-400">
              ${(wallet?.creditBalance ?? 25.0).toFixed(4)} USD
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Product Selector, API Key Selector, Environment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5">
        
        {/* Product selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Produit API à tester
          </label>
          <select
            id="sandbox-product-select"
            value={selectedProduct.id}
            onChange={(e) => {
              const p = products.find(prod => prod.id === e.target.value);
              if (p) handleProductChange(p);
            }}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (${p.pricePerUnit.toFixed(4)}/{p.unitName})
              </option>
            ))}
          </select>
        </div>

        {/* API Key selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Clé API MHT
          </label>
          <select
            id="sandbox-key-select"
            value={selectedKeyId}
            onChange={(e) => setSelectedKeyId(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
          >
            {apiKeys.length === 0 ? (
              <option value="">Clé Sandbox Développeur (Par défaut)</option>
            ) : (
              apiKeys.map(k => (
                <option key={k.id} value={k.id}>
                  {k.name} ({k.maskedKey})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Environment Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Environnement cible
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEnvironment('TEST')}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                environment === 'TEST'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              TEST (Sandbox)
            </button>
            <button
              type="button"
              onClick={() => setEnvironment('LIVE')}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                environment === 'LIVE'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              LIVE
            </button>
          </div>
        </div>

      </div>

      {/* Main Tester Panels: Request Payload Editor vs Live Response Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Request Panel */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-600 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                  {selectedProduct.httpMethod}
                </span>
                <span className="font-mono text-xs text-blue-300 truncate">
                  https://api.mht.technology{selectedProduct.endpoint}
                </span>
              </div>
              <button
                onClick={() => setPayloadText(selectedProduct.sampleRequest)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                title="Réinitialiser l'exemple"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Corps de la requête (JSON Payload) :
            </label>
            <textarea
              id="sandbox-payload-textarea"
              rows={12}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-blue-300 focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Coût estimé : <strong className="text-emerald-400 font-mono">${selectedProduct.pricePerUnit.toFixed(4)}</strong>
            </div>

            <button
              id="sandbox-run-btn"
              onClick={handleRunSimulation}
              disabled={isExecuting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
            >
              <Send className={`h-4 w-4 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Routage en cours...' : 'Exécuter via MHT Gateway'}</span>
            </button>
          </div>
        </div>

        {/* Response Panel */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>Réponse MHT Gateway</span>
              </h3>

              {executionResponse && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] font-mono text-blue-400">
                    <Clock className="h-3 w-3" />
                    {executionResponse.usage.latencyMs} ms
                  </span>
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                  >
                    {copiedResponse ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedResponse ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error state */}
            {executionError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Erreur de Passerelle :</span>
                </div>
                <p className="leading-relaxed">{executionError}</p>
              </div>
            )}

            {/* Success state */}
            {executionResponse && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                  <span>HTTP 200 OK — Request ID: {executionResponse.requestId}</span>
                  <span>-${executionResponse.usage.cost.toFixed(4)} USD</span>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[290px] leading-relaxed">
                  <code>{JSON.stringify(executionResponse.data, null, 2)}</code>
                </pre>
              </div>
            )}

            {/* Empty placeholder */}
            {!executionResponse && !executionError && (
              <div className="py-20 text-center text-slate-500">
                <Terminal className="h-10 w-10 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Prêt pour l'exécution</p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-xs mx-auto">
                  Cliquez sur "Exécuter via MHT Gateway" pour transmettre la requête et observer la réponse en temps réel.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Routage MHT : Traitement et décompte de crédits synchronisés</span>
            <span className="font-mono text-blue-400">MHT Gateway v1.0</span>
          </div>
        </div>

      </div>

    </div>
  );
};
