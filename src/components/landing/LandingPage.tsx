import React, { useState } from 'react';
import { 
  Terminal, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Cpu, 
  Sparkles, 
  CreditCard, 
  PhoneCall, 
  Cloud, 
  Fingerprint, 
  Globe, 
  Code2, 
  Lock, 
  CheckCircle2, 
  FileText,
  Workflow,
  Server,
  Key,
  Database,
  Smartphone
} from 'lucide-react';
import { ApiCategory, ApiProduct, ProductStatus } from '../../types';
import { INITIAL_PRODUCTS } from '../../lib/seedData';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSelectProductForSandbox?: (product: ApiProduct) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenAuth,
  onSelectProductForSandbox,
}) => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'Toutes les catégories', icon: Layers },
    { id: 'ai', label: 'Intelligence Artificielle', icon: Sparkles },
    { id: 'payment', label: 'Paiements & FinTech', icon: CreditCard },
    { id: 'communication', label: 'Communication & SMS', icon: PhoneCall },
    { id: 'telecom', label: 'Télécoms & eSIM', icon: Smartphone },
    { id: 'cloud', label: 'Cloud & Stockage', icon: Cloud },
    { id: 'identity', label: 'Identité & KYC', icon: Fingerprint },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? INITIAL_PRODUCTS
    : INITIAL_PRODUCTS.filter(p => p.category === selectedCategory);

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

  return (
    <div id="mht-landing-page" className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80">
        
        {/* Background glow accents (dark tech style) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-mono font-medium text-blue-300 mb-6">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>Mungwele Holding & Technology — Plateforme API Officielle</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            MHT APIs
            <span className="block mt-2 text-2xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-blue-400 via-indigo-300 to-slate-200 bg-clip-text text-transparent font-bold">
              L'Infrastructure Unifiée pour vos Applications
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connectez votre application aux services numériques dont elle a besoin depuis une infrastructure unique.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              id="hero-explore-btn"
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-500 hover:scale-[1.02] transition"
            >
              <span>Explorer les APIs</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              id="hero-docs-btn"
              onClick={() => onNavigate('docs')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              <FileText className="h-4 w-4 text-slate-400" />
              <span>Documentation</span>
            </button>

            {!currentUser ? (
              <button
                id="hero-signup-btn"
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-950/60 px-5 py-3 text-sm font-semibold text-blue-300 hover:bg-blue-900/60 transition"
              >
                <Key className="h-4 w-4 text-blue-400" />
                <span>Créer un compte</span>
              </button>
            ) : (
              <button
                id="hero-console-btn"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-950/60 px-5 py-3 text-sm font-semibold text-blue-300 hover:bg-blue-900/60 transition"
              >
                <Terminal className="h-4 w-4 text-blue-400" />
                <span>Ouvrir la Console</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <p className="text-2xl font-bold font-mono text-white">99.9%</p>
              <p className="text-xs text-slate-400 mt-0.5">Disponibilité SLA</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <p className="text-2xl font-bold font-mono text-blue-400">&lt; 250ms</p>
              <p className="text-xs text-slate-400 mt-0.5">Latence Moyenne</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <p className="text-2xl font-bold font-mono text-emerald-400">25.00 $</p>
              <p className="text-xs text-slate-400 mt-0.5">Crédits Sandbox Offerts</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <p className="text-2xl font-bold font-mono text-indigo-400">1 Clé Unique</p>
              <p className="text-xs text-slate-400 mt-0.5">Accès Multi-Fournisseurs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Gateway Architecture Diagram */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
              Architecture MHT Gateway
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Comment MHT unifie vos intégrations
            </p>
            <p className="text-sm text-slate-300 mt-3">
              MHT agit comme couche intermédiaire sécurisée entre votre application cliente et les fournisseurs externes partenaires.
            </p>
          </div>

          {/* Diagram Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-5xl mx-auto">
            
            {/* Step 1: Client Application */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center relative shadow-lg">
              <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto mb-4 text-blue-400">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">APPLICATION CLIENTE</h3>
              <p className="text-xs text-slate-400 mt-2">
                Votre app Web, mobile, SaaS, Market-Cash, ou script backend.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-[11px] text-blue-400">
                Bearer mht_test_...
              </div>
            </div>

            {/* Step 2: MHT APIs Central Hub */}
            <div className="rounded-2xl bg-gradient-to-b from-blue-950/80 to-slate-900 border-2 border-blue-500/50 p-6 text-center relative shadow-2xl ring-1 ring-blue-500/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                Passerelle Centrale
              </div>
              <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-600/40">
                <Cpu className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-white text-lg tracking-tight">MHT APIs</h3>
              <p className="text-xs text-slate-300 mt-2">
                Authentification, Quotas & Crédits, Routage dynamique, Facturation & Supervision.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[10px] font-mono text-slate-300">
                <span className="rounded bg-slate-800 px-2 py-0.5 border border-slate-700">Sécurité Zero-Secret</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 border border-slate-700">MHT Margin</span>
              </div>
            </div>

            {/* Step 3: External Providers */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center relative shadow-lg">
              <div className="h-12 w-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mx-auto mb-4 text-purple-400">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">FOURNISSEURS & PARTENAIRES</h3>
              <p className="text-xs text-slate-400 mt-2">
                Google Vertex, OpenAI, M-Pesa, Orange Money, Banques, Twilio, eSIM.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-[11px] text-purple-400">
                Exécution & Réponse
              </div>
            </div>

          </div>

          {/* Ecosystem Callout: Market-Cash & Mungwele IA Studio */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/20 p-6 sm:p-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-400 shrink-0">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    Market-Cash Fintech Hub
                    <span className="text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2">Prêt</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    MHT APIs est architecturé pour alimenter Market-Cash (recharges Mobile Money, virements bancaires et paiements marchands) via une passerelle unique avec confirmation asynchrone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-3 text-purple-400 shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    Mungwele IA Studio
                    <span className="text-[10px] font-mono rounded bg-purple-500/20 text-purple-300 px-1.5 py-0.2">Prêt</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Les applications d'IA générative MHT exploitent la même passerelle unifiée pour consommer Gemini, GPT-4o, Imagen 3 et Veo sans multiplier les clés fournisseurs.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Live API Catalog Preview Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
                Catalogue MHT
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Explorez nos Produits API
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Statuts transparents : disponible, sandbox ou intégration partenaire requise.
              </p>
            </div>
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              <span>Voir tout le catalogue ({INITIAL_PRODUCTS.length} APIs)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-medium transition ${
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-6 hover:border-slate-700 transition group hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      {product.providerName || 'MHT Gateway'}
                    </span>
                    {getStatusBadge(product.status)}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="text-slate-400">Tarification MHT :</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      ${product.pricePerUnit.toFixed(4)} / {product.unitName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('sandbox')}
                      className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-1.5"
                    >
                      <Terminal className="h-3.5 w-3.5 text-blue-400" />
                      <span>Tester Sandbox</span>
                    </button>
                    <button
                      onClick={() => onNavigate('docs')}
                      className="rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Consulter la documentation"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-sm">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono font-bold text-white text-sm">MHT APIs</p>
                <p className="text-xs text-slate-400">Mungwele Holding & Technology</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition">Catalogue</button>
              <button onClick={() => onNavigate('docs')} className="hover:text-white transition">Documentation</button>
              <button onClick={() => onNavigate('sandbox')} className="hover:text-white transition">Banc d'Essai</button>
              <button onClick={() => onNavigate('billing')} className="hover:text-white transition">Facturation</button>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              © {new Date().getFullYear()} MHT APIs. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};
