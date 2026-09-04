import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  CreditCard, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  ArrowUpRight,
  Smartphone,
  Building,
  Check,
  RefreshCw,
  X
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { BillingTransaction } from '../../types';

export const BillingView: React.FC = () => {
  const { currentUser, userProfile, wallet, refreshWallet } = useAuth();
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Recharge modal states
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | 'bank' | 'sandbox'>('mobile_money');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'billing_transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: BillingTransaction[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as BillingTransaction);
      });
      setTransactions(list);
      setLoading(false);
    }, (err) => {
      console.warn('Billing transactions query note:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleExecuteRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || rechargeAmount <= 0) return;
    setIsProcessing(true);

    try {
      const currentBal = wallet?.creditBalance || 0;
      const newBal = currentBal + rechargeAmount;

      // Update wallet doc
      await updateDoc(doc(db, 'developer_wallets', currentUser.uid), {
        creditBalance: newBal,
        updatedAt: new Date().toISOString()
      });

      // Record transaction
      const transDoc: Omit<BillingTransaction, 'id'> = {
        userId: currentUser.uid,
        amount: rechargeAmount,
        currency: 'USD',
        type: 'RECHARGE',
        paymentMethod: paymentMethod === 'mobile_money' ? 'Mobile Money (M-Pesa / Orange)' : paymentMethod === 'card' ? 'Carte Bancaire' : paymentMethod === 'bank' ? 'Virement Bancaire' : 'Recharge Sandbox Développeur',
        status: 'PAID',
        description: `Recharge de crédits MHT (${rechargeAmount} USD)`,
        invoiceUrl: '#',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'billing_transactions'), transDoc);

      await refreshWallet();
      setRechargeSuccess(true);
      setTimeout(() => {
        setRechargeSuccess(false);
        setIsRechargeModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Error recharging balance:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentBalance = wallet?.creditBalance ?? 25.0;
  const isLowBalance = currentBalance < 5.0;

  return (
    <div id="billing-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-blue-400">GESTION DES CRÉDITS & FACTURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            MHT Credits & Wallet
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Approvisionnez votre compte et suivez vos dépenses API calculées au millième de centime avec transparence totale.
          </p>
        </div>

        <button
          id="btn-open-recharge-modal"
          onClick={() => setIsRechargeModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Recharger mon solde</span>
        </button>
      </div>

      {/* Low balance alert banner */}
      {isLowBalance && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <span>
              <strong>Alerte de solde faible :</strong> Votre solde disponible est inférieur à 5.00 $. Rechargez pour éviter l'interruption de vos requêtes API.
            </span>
          </div>
          <button
            onClick={() => setIsRechargeModalOpen(true)}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400 shrink-0"
          >
            Recharger
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Solde Actuel */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Solde MHT Credits</span>
            <Wallet className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-emerald-400">
            ${currentBalance.toFixed(4)}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Devise principale : USD</span>
            <span className="font-mono text-emerald-400">Actif & Déductible</span>
          </div>
        </div>

        {/* Card 2: Consommation cumulée */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Consommation Totale</span>
            <DollarSign className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            ${(wallet?.totalConsumed || 0).toFixed(4)}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Requêtes cumulées</span>
            <span className="font-mono text-blue-400">Pay-as-you-go</span>
          </div>
        </div>

        {/* Card 3: Formule tarifaire MHT */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Modèle de Tarification</span>
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-white">
              Prépaiement sans abonnement forcé
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Décompte par unité réelle (token IA, SMS envoyé, transaction traitée, Go/mois).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-indigo-300">
            Aucun frais caché ni expiration
          </div>
        </div>

      </div>

      {/* Transactions History */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>Historique des Recharges & Factures ({transactions.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Transactions sécurisées</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Chargement de vos transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-500 p-4">
            <CreditCard className="h-10 w-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Aucune recharge enregistrée pour l'instant.</p>
            <p className="text-xs text-slate-400 mt-1">Votre compte bénéficie initialement des 25.00 $ offerts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Moyen de paiement</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Facture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-sans font-semibold text-white">
                      {tx.description}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-300">
                      {tx.paymentMethod}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      +${tx.amount.toFixed(2)} USD
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-sans text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button 
                        onClick={() => alert(`Facture MHT #${tx.id.slice(0,8)} - ${tx.amount}$ USD acquittée.`)}
                        className="text-blue-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        <Download className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recharge Modal */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            
            <button
              onClick={() => setIsRechargeModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {!rechargeSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Recharge de Crédits</h2>
                    <p className="text-xs text-slate-400">Approvisionnement MHT Gateway</p>
                  </div>
                </div>

                <form onSubmit={handleExecuteRecharge} className="space-y-4">
                  {/* Preset Amount selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Sélectionnez un montant (USD)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setRechargeAmount(amt)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                            rechargeAmount === amt
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Ou montant personnalisé
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="5000"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-emerald-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Payment method selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Méthode de règlement
                    </label>
                    <div className="space-y-2">
                      <label 
                        onClick={() => setPaymentMethod('mobile_money')}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          paymentMethod === 'mobile_money' ? 'bg-blue-950/40 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Smartphone className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-semibold">Mobile Money (M-Pesa / Airtel / Orange)</span>
                        </div>
                        <input type="radio" checked={paymentMethod === 'mobile_money'} readOnly className="accent-blue-600" />
                      </label>

                      <label 
                        onClick={() => setPaymentMethod('card')}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          paymentMethod === 'card' ? 'bg-blue-950/40 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="h-4 w-4 text-blue-400" />
                          <span className="text-xs font-semibold">Carte Bancaire (Visa / Mastercard)</span>
                        </div>
                        <input type="radio" checked={paymentMethod === 'card'} readOnly className="accent-blue-600" />
                      </label>

                      <label 
                        onClick={() => setPaymentMethod('sandbox')}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          paymentMethod === 'sandbox' ? 'bg-blue-950/40 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="h-4 w-4 text-amber-400" />
                          <span className="text-xs font-semibold">Recharge Instantanée Sandbox (Test)</span>
                        </div>
                        <input type="radio" checked={paymentMethod === 'sandbox'} readOnly className="accent-blue-600" />
                      </label>
                    </div>
                  </div>

                  <button
                    id="btn-confirm-recharge"
                    type="submit"
                    disabled={isProcessing || rechargeAmount <= 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    <span>{isProcessing ? 'Validation en cours...' : `Confirmer la recharge (${rechargeAmount} $)`}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Recharge Effectuée !</h3>
                <p className="text-xs text-slate-300">
                  Votre solde MHT Credits a été crédité avec succès de <strong>${rechargeAmount} USD</strong>.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
