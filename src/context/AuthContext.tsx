import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, CreditWallet, UserRole, AccountStatus } from '../types';
import { ensureSeedDataInitialized } from '../lib/seedData';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  wallet: CreditWallet | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  activeRoleView: UserRole | null;
  setActiveRoleView: (role: UserRole | null) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, details: { displayName: string; companyName?: string; country?: string; phone?: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAILS = ['merveillematondo2027@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRoleView, setActiveRoleView] = useState<UserRole | null>(null);

  // Initialize seed data on startup
  useEffect(() => {
    ensureSeedDataInitialized();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or create user profile
        const userDocRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDocRef);

        const isSuperAdminEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
        const defaultRole: UserRole = isSuperAdminEmail ? 'admin_general' : 'developer';

        if (!userSnapshot.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Développeur MHT',
            email: user.email || '',
            phone: user.phoneNumber || '',
            photoURL: user.photoURL || '',
            companyName: '',
            country: 'République Démocratique du Congo',
            role: defaultRole,
            accountStatus: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);

          // Setup initial wallet
          const walletRef = doc(db, 'credit_wallets', user.uid);
          const initialWallet: CreditWallet = {
            uid: user.uid,
            creditBalance: 25.00,
            reservedCredits: 0,
            totalConsumed: 0,
            currency: 'USD',
            updatedAt: new Date().toISOString()
          };
          await setDoc(walletRef, initialWallet);

          // Setup welcome bonus transaction
          const txnId = `txn_welcome_${Date.now()}`;
          await setDoc(doc(db, 'credit_transactions', txnId), {
            id: txnId,
            userId: user.uid,
            type: 'bonus',
            amount: 25.00,
            balanceBefore: 0,
            balanceAfter: 25.00,
            reference: 'MHT-WELCOME-BONUS',
            description: 'Crédits de bienvenue Sandbox MHT APIs',
            status: 'COMPLETED',
            createdAt: new Date().toISOString()
          });

          // Create default sandbox key
          const keyId = `key_test_${Math.random().toString(36).substring(2, 10)}`;
          const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          await setDoc(doc(db, 'api_keys', keyId), {
            id: keyId,
            keyId: keyId,
            keyPrefix: 'mht_test_',
            maskedKey: `mht_test_••••••••${randomPart.slice(-4)}`,
            keyHash: `sha256_${randomPart.substring(0, 16)}`,
            environment: 'TEST',
            name: 'Clé Sandbox Initiale',
            status: 'ACTIVE',
            ownerId: user.uid,
            createdAt: new Date().toISOString(),
            lastUsedAt: new Date().toISOString(),
            permissions: ['all_sandbox']
          });

          // Create welcome notification
          const notifId = `notif_${Date.now()}`;
          await setDoc(doc(db, 'notifications', notifId), {
            id: notifId,
            userId: user.uid,
            title: 'Bienvenue sur MHT APIs !',
            message: 'Votre compte développeur a été activé avec 25.00 $ de crédits Sandbox offerts.',
            type: 'new_service',
            read: false,
            linkTo: '/dashboard',
            createdAt: new Date().toISOString()
          });

        } else {
          setUserProfile(userSnapshot.data() as UserProfile);
        }

        // Listen to User Profile changes
        const unsubUser = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          }
        });

        // Listen to Credit Wallet changes
        const walletRef = doc(db, 'credit_wallets', user.uid);
        const unsubWallet = onSnapshot(walletRef, (snap) => {
          if (snap.exists()) {
            setWallet(snap.data() as CreditWallet);
          } else {
            // fallback create
            const fallbackWallet: CreditWallet = {
              uid: user.uid,
              creditBalance: 25.00,
              reservedCredits: 0,
              totalConsumed: 0,
              currency: 'USD',
              updatedAt: new Date().toISOString()
            };
            setDoc(walletRef, fallbackWallet);
            setWallet(fallbackWallet);
          }
        });

        setLoading(false);
        return () => {
          unsubUser();
          unsubWallet();
        };
      } else {
        setUserProfile(null);
        setWallet(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    details: { displayName: string; companyName?: string; country?: string; phone?: string }
  ) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: details.displayName });
      const isSuperAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase());
      const role: UserRole = isSuperAdminEmail ? 'admin_general' : 'developer';
      
      const newProfile: UserProfile = {
        uid: res.user.uid,
        displayName: details.displayName,
        email: email,
        phone: details.phone || '',
        photoURL: '',
        companyName: details.companyName || '',
        country: details.country || 'République Démocratique du Congo',
        role: role,
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUserProfile(newProfile);
    }
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setWallet(null);
    setActiveRoleView(null);
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  };

  const refreshWallet = async () => {
    if (!currentUser) return;
    const snap = await getDoc(doc(db, 'credit_wallets', currentUser.uid));
    if (snap.exists()) {
      setWallet(snap.data() as CreditWallet);
    }
  };

  const actualRole = userProfile?.role || 'developer';
  const effectiveRole = activeRoleView || actualRole;
  const isSuperAdmin = actualRole === 'admin_general' || ADMIN_EMAILS.includes(currentUser?.email || '');
  const isAdmin = isSuperAdmin || actualRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile: userProfile ? { ...userProfile, role: effectiveRole } : null,
        wallet,
        loading,
        isAdmin,
        isSuperAdmin,
        activeRoleView,
        setActiveRoleView,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        logout,
        updateUserProfileData,
        refreshWallet
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
