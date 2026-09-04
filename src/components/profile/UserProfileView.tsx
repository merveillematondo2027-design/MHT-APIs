import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Save, 
  Check, 
  Lock, 
  Key, 
  Wallet,
  Sparkles
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export const UserProfileView: React.FC = () => {
  const { currentUser, userProfile, wallet, role } = useAuth();
  
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
  const [country, setCountry] = useState(userProfile?.country || 'République Démocratique du Congo');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        companyName,
        country,
        phone,
        updatedAt: new Date().toISOString()
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="user-profile-view" className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold text-blue-400">COMPTE DÉVELOPPEUR MHT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Profil & Organisation
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Gérez les coordonnées de votre compte, les informations de votre entreprise et vos accès de sécurité.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-center gap-5">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold font-mono shadow-lg shadow-blue-600/30 shrink-0">
          {displayName ? displayName.slice(0, 2).toUpperCase() : 'MHT'}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-xl font-bold text-white">{displayName || 'Développeur MHT'}</h2>
          <p className="text-xs font-mono text-slate-400">{currentUser?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2.5 py-0.5 border border-blue-500/30 uppercase font-bold">
              Rôle : {role}
            </span>
            <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2.5 py-0.5 border border-emerald-500/30 font-bold">
              Solde : ${(wallet?.creditBalance ?? 25.0).toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
        <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-400" />
          <span>Informations Générales</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Adresse Email (Lecture seule)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 pl-9 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Entreprise / Projet
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Mungwele Tech"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pays de résidence / enregistrement
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Numéro de Téléphone (Mobile Money / Alertes)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {savedSuccess ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Check className="h-4 w-4" />
                Modifications enregistrées !
              </span>
            ) : <span></span>}

            <button
              id="btn-save-profile"
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer mon profil'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
