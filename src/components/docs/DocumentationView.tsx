import React, { useState } from 'react';
import { 
  FileText, 
  Terminal, 
  Code2, 
  Key, 
  Lock, 
  ShieldCheck, 
  Check, 
  Copy, 
  AlertTriangle, 
  ExternalLink,
  Sparkles,
  CreditCard,
  PhoneCall,
  Smartphone,
  Layers,
  ChevronRight
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../../lib/seedData';

export const DocumentationView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'intro' | 'auth' | 'errors' | 'webhooks' | 'sdks'>('intro');
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'python' | 'php'>('curl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div id="documentation-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-blue-400">RÉFÉRENCE TECHNIQUE OFFICIELLE</span>
            <span className="rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-mono px-2 py-0.2">
              v1.0 REST
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Documentation MHT APIs
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Guide d'intégration de la passerelle Mungwele Holding & Technology. Intégrez l'IA, le Mobile Money, les télécoms et le cloud via un point d'accès unifié.
          </p>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: 'intro', label: '1. Introduction & Base URL' },
          { id: 'auth', label: '2. Authentification' },
          { id: 'errors', label: '3. Codes d’Erreurs HTTP' },
          { id: 'webhooks', label: '4. Webhooks & Signatures' },
          { id: 'sdks', label: '5. Exemples d’Intégration' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSection === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Introduction */}
      {activeSection === 'intro' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-400" />
              <span>Architecture & Point d'Entrée Global</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Toutes les requêtes vers les services MHT APIs sont effectuées en HTTPS vers l'URL racine de la passerelle :
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-blue-300 flex items-center justify-between">
              <span>https://api.mht.technology/v1</span>
              <button 
                onClick={() => copyCode('https://api.mht.technology/v1', 'base-url')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'base-url' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              MHT traite chaque appel, valide votre clé d'API, décompte le coût unitaire de votre portefeuille en millième de dollar, route la requête vers le fournisseur cible (Google Vertex, OpenAI, Vodacom M-Pesa, Orange Money, Twilio, etc.) et vous renvoie une réponse unifiée normalisée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="font-bold text-white text-xs mb-1">Format standard</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Toutes les entrées et sorties utilisent le format standard <strong>application/json</strong> et l'encodage UTF-8.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="font-bold text-white text-xs mb-1">Idempotence</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pour les opérations financières (Market-Cash), passez l'en-tête <code>X-Idempotency-Key</code> pour éviter les doubles débits.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="font-bold text-white text-xs mb-1">SLA & Latence</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Infrastructure haute disponibilité redondée avec surveillance 24/7 et latence Gateway &lt; 50ms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Authentication */}
      {activeSection === 'auth' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-400" />
              <span>Authentification par En-Tête HTTP Bearer</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              L'authentification s'effectue à l'aide de l'en-tête HTTP standard <code>Authorization</code> contenant votre clé d'API secrète :
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 flex items-center justify-between">
              <span>Authorization: Bearer mht_test_9f8e7d6c5b4a3a2b1c0d...</span>
              <button 
                onClick={() => copyCode('Authorization: Bearer mht_test_...', 'auth-header')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'auth-header' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="font-mono font-bold text-amber-300 text-xs">mht_test_...</p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Clés Sandbox. Utilisent les crédits offerts, permettent d'exécuter l'ensemble des scénarios de test sans risque financier.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="font-mono font-bold text-emerald-300 text-xs">mht_live_...</p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Clés Live Production. Exécutent les transactions réelles sur les réseaux bancaires et partenaires connectés.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Errors */}
      {activeSection === 'errors' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <span>Codes d’Erreurs HTTP Normalisés</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              MHT renvoie des codes HTTP standards accompagnés d'un objet JSON explicatif.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 font-mono text-[11px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Code HTTP</th>
                  <th className="px-4 py-3">Nom MHT</th>
                  <th className="px-4 py-3">Cause & Résolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                <tr>
                  <td className="px-4 py-3 text-emerald-400 font-bold">200 OK</td>
                  <td className="px-4 py-3 text-slate-300 font-sans">Succès</td>
                  <td className="px-4 py-3 text-slate-400 font-sans">Requête traitée avec succès par le fournisseur.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-amber-400 font-bold">400 Bad Request</td>
                  <td className="px-4 py-3 text-slate-300 font-sans">Payload Invalide</td>
                  <td className="px-4 py-3 text-slate-400 font-sans">Le corps JSON est malformé ou des champs requis manquent.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-rose-400 font-bold">401 Unauthorized</td>
                  <td className="px-4 py-3 text-slate-300 font-sans">Clé API Invalide</td>
                  <td className="px-4 py-3 text-slate-400 font-sans">Clé d'API absente, révoquée ou invalide.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-rose-400 font-bold">402 Payment Required</td>
                  <td className="px-4 py-3 text-slate-300 font-sans">Solde Insuffisant</td>
                  <td className="px-4 py-3 text-slate-400 font-sans">Votre portefeuille MHT Credits est épuisé. Rechargez votre solde.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-blue-400 font-bold">403 Forbidden</td>
                  <td className="px-4 py-3 text-slate-300 font-sans">Partenaire Requis</td>
                  <td className="px-4 py-3 text-slate-400 font-sans">L'API cible nécessite un contrat d'interconnexion actif (ex: Live Telecom).</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-purple-400 font-bold">429 Too Many Requests</td>
                  <td className="px-4 py-3 text-slate-300 font-sans">Rate Limit Atteint</td>
                  <td className="px-4 py-3 text-slate-400 font-sans">Nombre maximal de requêtes par seconde dépassé.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 4: Webhooks */}
      {activeSection === 'webhooks' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Webhooks & Signatures Cryptographiques HMAC</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pour les événements asynchrones (ex: validation de paiement Mobile Money Market-Cash ou fin de génération vidéo), MHT envoie un événement POST vers votre URL de Webhook avec une signature HMAC-SHA256 dans l'en-tête <code>X-MHT-Signature</code> :
            </p>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`// Exemple de vérification de signature en Node.js
import crypto from 'crypto';

export function verifyMhtWebhook(payloadString, signatureHeader, webhookSecret) {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadString)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expectedSignature)
  );
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Section 5: SDKs & Code Examples */}
      {activeSection === 'sdks' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {['curl', 'js', 'python', 'php'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                  activeLang === lang
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-xs font-mono">
                Exemple complet : Appel IA Multimodal MHT Gemini
              </h3>
              <button
                onClick={() => copyCode(`// Code snippet`, 'snippet-lang')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === 'snippet-lang' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copier</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
              {activeLang === 'curl' && `curl -X POST "https://api.mht.technology/v1/ai/gemini-2.5-flash" \\
  -H "Authorization: Bearer mht_test_votre_cle_api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Analyse les tendances du Mobile Money en RDC pour Mungwele Holding.",
    "temperature": 0.7,
    "max_tokens": 1000
  }'`}

              {activeLang === 'js' && `import axios from 'axios';

async function generateWithMht() {
  const response = await axios.post('https://api.mht.technology/v1/ai/gemini-2.5-flash', {
    prompt: "Analyse les tendances du Mobile Money en RDC pour Mungwele Holding.",
    temperature: 0.7,
    max_tokens: 1000
  }, {
    headers: {
      'Authorization': 'Bearer mht_test_votre_cle_api',
      'Content-Type': 'application/json'
    }
  });

  console.log('Résultat MHT:', response.data);
}`}

              {activeLang === 'python' && `import requests

url = "https://api.mht.technology/v1/ai/gemini-2.5-flash"
headers = {
    "Authorization": "Bearer mht_test_votre_cle_api",
    "Content-Type": "application/json"
}
payload = {
    "prompt": "Analyse les tendances du Mobile Money en RDC pour Mungwele Holding.",
    "temperature": 0.7,
    "max_tokens": 1000
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}

              {activeLang === 'php' && `<?php
$ch = curl_init('https://api.mht.technology/v1/ai/gemini-2.5-flash');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer mht_test_votre_cle_api',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'prompt' => 'Analyse les tendances du Mobile Money en RDC pour Mungwele Holding.'
]));

$response = curl_exec($ch);
curl_close($ch);
echo $response;`}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
