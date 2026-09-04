import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Sparkles, 
  CreditCard, 
  PhoneCall, 
  Smartphone, 
  Cloud, 
  Fingerprint, 
  Terminal, 
  FileText, 
  X, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
  Activity,
  Code
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ApiProduct, ProductStatus, ApiCategory } from '../../types';
import { INITIAL_PRODUCTS } from '../../lib/seedData';

interface ApiCatalogViewProps {
  onNavigateToSandbox: (product: ApiProduct) => void;
  onNavigateToDocs: () => void;
}

export const ApiCatalogView: React.FC<ApiCatalogViewProps> = ({
  onNavigateToSandbox,
  onNavigateToDocs,
}) => {
  const [products, setProducts] = useState<ApiProduct[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeModalProduct, setActiveModalProduct] = useState<ApiProduct | null>(null);
  const [snippetTab, setSnippetTab] = useState<'curl' | 'js' | 'python'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    // Listen to real-time products collection if updated in Firestore
    const unsub = onSnapshot(collection(db, 'api_products'), (snap) => {
      if (!snap.empty) {
        const list: ApiProduct[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as ApiProduct);
        });
        setProducts(list);
      }
    }, (err) => {
      console.warn('Products snapshot note:', err);
    });
    return () => unsub();
  }, []);

  const categories = [
    { id: 'all', label: 'Toutes les catégories', icon: Layers },
    { id: 'ai', label: 'Intelligence Artificielle', icon: Sparkles },
    { id: 'payment', label: 'Paiements & FinTech', icon: CreditCard },
    { id: 'communication', label: 'Communication & SMS', icon: PhoneCall },
    { id: 'telecom', label: 'Télécoms & eSIM', icon: Smartphone },
    { id: 'cloud', label: 'Cloud & Stockage', icon: Cloud },
    { id: 'identity', label: 'Identité & KYC', icon: Fingerprint },
  ];

  const statuses = [
    { id: 'all', label: 'Tous les statuts' },
    { id: 'AVAILABLE', label: 'Disponible' },
    { id: 'SANDBOX', label: 'Sandbox' },
    { id: 'PARTNER_REQUIRED', label: 'Partenaire requis' },
    { id: 'COMING_SOON', label: 'Bientôt disponible' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.providerName && p.providerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Disponible
          </span>
        );
      case 'SANDBOX':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] font-mono font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            Sandbox
          </span>
        );
      case 'PARTNER_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[11px] font-mono font-semibold text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
            Partenaire requis
          </span>
        );
      case 'COMING_SOON':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-400">
            Bientôt disponible
          </span>
        );
    }
  };

  const generateCodeSnippet = (prod: ApiProduct, lang: 'curl' | 'js' | 'python') => {
    const fullUrl = `https://api.mht.technology${prod.endpoint}`;
    if (lang === 'curl') {
      return `curl -X ${prod.httpMethod} "${fullUrl}" \\
  -H "Authorization: Bearer mht_test_votre_cle_api" \\
  -H "Content-Type: application/json" \\
  -d '${prod.sampleRequest.replace(/\n/g, '')}'`;
    } else if (lang === 'js') {
      return `import axios from 'axios';

const response = await axios.${prod.httpMethod.toLowerCase()}('${fullUrl}', ${prod.sampleRequest}, {
  headers: {
    'Authorization': 'Bearer mht_test_votre_cle_api',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`;
    } else {
      return `import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer mht_test_votre_cle_api",
    "Content-Type": "application/json"
}
payload = ${prod.sampleRequest}

response = requests.${prod.httpMethod.toLowerCase()}(url, json=payload, headers=headers)
print(response.json())`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div id="api-catalog-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-blue-400">MHT GATEWAY ECOSYSTEM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Catalogue des APIs MHT
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Explorez les points d'accès centralisés par Mungwele Holding & Technology pour l'IA, les télécoms, le cloud et les paiements.
          </p>
        </div>

        <button
          onClick={onNavigateToDocs}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition self-start md:self-auto"
        >
          <FileText className="h-4 w-4 text-blue-400" />
          <span>Documentation SDK</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="catalog-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une API (ex: Gemini, SMS, M-Pesa, eSIM, KYC)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 pl-10 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            id="catalog-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            {statuses.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            id={`product-card-${product.id}`}
            className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-5 hover:border-slate-700 transition group shadow-lg"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate max-w-[160px]">
                  {product.providerName || 'MHT Hub'}
                </span>
                {getStatusBadge(product.status)}
              </div>

              {/* Product Name */}
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                {product.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Endpoint Preview Pill */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-blue-400">
                <span className="text-slate-400 font-bold">{product.httpMethod}</span>
                <span className="truncate">{product.endpoint}</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tarif unitaire :</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${product.pricePerUnit.toFixed(4)} / {product.unitName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id={`btn-view-details-${product.id}`}
                  onClick={() => setActiveModalProduct(product)}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Détails & Code</span>
                </button>

                <button
                  id={`btn-sandbox-${product.id}`}
                  onClick={() => onNavigateToSandbox(product)}
                  className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition flex items-center justify-center gap-1.5"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Tester</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-16 text-center text-slate-500 rounded-2xl bg-slate-900/40 border border-slate-800">
          <Layers className="h-10 w-10 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">Aucune API trouvée pour ces critères.</p>
          <p className="text-xs text-slate-400 mt-1">Essayez de réinitialiser vos filtres ou votre recherche.</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {activeModalProduct && (
        <div id="product-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            
            <button
              onClick={() => setActiveModalProduct(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-slate-400">{activeModalProduct.providerName}</span>
              {getStatusBadge(activeModalProduct.status)}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {activeModalProduct.name}
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {activeModalProduct.description}
            </p>

            {/* Partner Note if required */}
            {activeModalProduct.status === 'PARTNER_REQUIRED' && (
              <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Information d'intégration :</strong> Cette API est disponible en mode <strong>SANDBOX</strong> immédiat. Le mode <strong>LIVE</strong> requiert l'activation du protocole d'interconnexion bancaire ou télécom MHT.
                </span>
              </div>
            )}

            {/* Pricing Details Breakdown */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div>
                <p className="text-slate-400 text-[11px]">Prix Public MHT</p>
                <p className="font-mono font-bold text-emerald-400 mt-0.5">
                  ${activeModalProduct.pricePerUnit.toFixed(5)}
                </p>
                <p className="text-[10px] text-slate-400">par {activeModalProduct.unitName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Latence Moyenne</p>
                <p className="font-mono font-bold text-blue-400 mt-0.5">
                  ~{activeModalProduct.latencyAvgMs} ms
                </p>
                <p className="text-[10px] text-slate-400">Routage MHT</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Taux de Succès</p>
                <p className="font-mono font-bold text-indigo-400 mt-0.5">
                  {activeModalProduct.successRate}%
                </p>
                <p className="text-[10px] text-slate-400">SLA plateforme</p>
              </div>
            </div>

            {/* Code Snippet Tabs */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSnippetTab('curl')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                      snippetTab === 'curl' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setSnippetTab('js')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                      snippetTab === 'js' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Node.js / JS
                  </button>
                  <button
                    onClick={() => setSnippetTab('python')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                      snippetTab === 'python' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Python
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(generateCodeSnippet(activeModalProduct, snippetTab))}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                >
                  {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSnippet ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-blue-300 overflow-x-auto">
                <code>{generateCodeSnippet(activeModalProduct, snippetTab)}</code>
              </pre>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveModalProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  const p = activeModalProduct;
                  setActiveModalProduct(null);
                  onNavigateToSandbox(p);
                }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
              >
                <Terminal className="h-4 w-4" />
                <span>Tester dans le Sandbox</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
