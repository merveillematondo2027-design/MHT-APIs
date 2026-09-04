import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Globe, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('République Démocratique du Congo');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'register') {
        if (!displayName.trim()) {
          throw new Error('Veuillez renseigner votre nom complet.');
        }
        await registerWithEmail(email, password, {
          displayName,
          companyName,
          country,
          phone,
        });
        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Un lien de réinitialisation vous a été envoyé par email.');
      }
    } catch (err: unknown) {
      const errObj = err as { code?: string; message?: string };
      let message = errObj.message || 'Une erreur est survenue lors de l’authentification.';
      if (errObj.code === 'auth/user-not-found' || errObj.code === 'auth/wrong-password' || errObj.code === 'auth/invalid-credential') {
        message = 'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.';
      } else if (errObj.code === 'auth/email-already-in-use') {
        message = 'Cette adresse email est déjà associée à un compte MHT.';
      } else if (errObj.code === 'auth/weak-password') {
        message = 'Le mot de passe doit comporter au moins 6 caractères.';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMsg(errObj.message || 'Erreur lors de la connexion Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div 
        id="auth-modal-card" 
        className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100 my-8"
      >
        
        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/30">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' && 'Connexion à MHT APIs'}
              {mode === 'register' && 'Créer un compte Développeur'}
              {mode === 'forgot' && 'Récupération de compte'}
            </h2>
            <p className="text-xs text-slate-400">
              Mungwele Holding & Technology Developer Console
            </p>
          </div>
        </div>

        {/* Error / Success Notices */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick Google Sign In */}
        {mode !== 'forgot' && (
          <div className="mb-5">
            <button
              id="google-auth-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700/80 hover:border-slate-600 transition disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Continuer avec Google</span>
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-800"></div>
              <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase">
                Ou par email
              </span>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="register-input-name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Jean Mukendi"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Entreprise / Projet</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="register-input-company"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Mungwele Tech"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pays</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="register-input-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Ex: RDC, France..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Téléphone (Optionnel)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="register-input-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+243..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Adresse Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="auth-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@mungweletech.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Mot de passe *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="auth-input-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Offre Sandbox Développeur :</strong> Votre compte sera automatiquement crédité de <strong>25.00 $</strong> de MHT Credits offerts pour tester l’ensemble des APIs.
              </span>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
          >
            <span>
              {loading 
                ? 'Traitement en cours...' 
                : mode === 'login' 
                  ? 'Se connecter à la Console' 
                  : mode === 'register' 
                    ? 'Créer mon compte MHT' 
                    : 'Envoyer le lien de réinitialisation'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'login' && (
            <p>
              Pas encore de compte ?{' '}
              <button
                id="switch-to-register-btn"
                onClick={() => { setMode('register'); setErrorMsg(null); }}
                className="font-semibold text-blue-400 hover:underline"
              >
                Inscrivez-vous gratuitement
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Vous avez déjà un compte ?{' '}
              <button
                id="switch-to-login-btn"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                className="font-semibold text-blue-400 hover:underline"
              >
                Connectez-vous
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className="font-semibold text-blue-400 hover:underline"
            >
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
