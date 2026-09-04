import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { 
  ApiProduct, 
  ApiKey, 
  CreditWallet, 
  GatewayApiResponse, 
  KeyEnvironment,
  RequestLogStatus
} from '../types';

/**
 * SHA-256 helper in browser for API key hashing
 */
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a new MHT API Key (with secure prefix and hash)
 */
export async function generateMhtApiKey(params: {
  userId: string;
  name: string;
  environment: KeyEnvironment;
}): Promise<{ rawKey: string; apiKeyData: ApiKey }> {
  const prefix = params.environment === 'TEST' ? 'mht_test_' : 'mht_live_';
  const entropy = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .substring(0, 32);

  const rawKey = `${prefix}${entropy}`;
  const keyHash = await hashKey(rawKey);
  const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const maskedKey = `${prefix}••••••••${rawKey.slice(-4)}`;

  const apiKeyData: ApiKey = {
    id: keyId,
    keyId: keyId,
    keyPrefix: prefix,
    maskedKey: maskedKey,
    keyHash: keyHash,
    environment: params.environment,
    name: params.name || (params.environment === 'TEST' ? 'Clé Sandbox' : 'Clé Production Live'),
    status: 'ACTIVE',
    ownerId: params.userId,
    createdAt: new Date().toISOString(),
    lastUsedAt: undefined,
    permissions: ['all']
  };

  await setDoc(doc(db, 'api_keys', keyId), apiKeyData);

  return { rawKey, apiKeyData };
}

/**
 * Executes a simulated API Gateway call through MHT Gateway
 */
export async function executeGatewayRequest(params: {
  userId: string;
  apiKey: ApiKey;
  product: ApiProduct;
  customPayload?: Record<string, unknown>;
  environment: KeyEnvironment;
}): Promise<GatewayApiResponse> {
  const { userId, apiKey, product, customPayload, environment } = params;
  const startTime = performance.now();
  const requestId = `req_mht_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // 1. Validate API Key
  if (apiKey.status !== 'ACTIVE') {
    throw new Error(`La clé API [${apiKey.maskedKey}] est actuellement ${apiKey.status.toLowerCase()}.`);
  }

  if (apiKey.environment !== environment) {
    throw new Error(`Incompatibilité d'environnement : La clé fournie est de type ${apiKey.environment}, mais la requête cible ${environment}.`);
  }

  // 2. Check if product is live-ready or requires partner
  if (environment === 'LIVE' && product.status === 'PARTNER_REQUIRED') {
    throw new Error(
      `Service en attente de partenaire : Le produit "${product.name}" requiert un contrat d'interconnexion bancaire ou télécom pour le mode LIVE. Veuillez utiliser le mode SANDBOX.`
    );
  }

  if (environment === 'LIVE' && product.status === 'COMING_SOON') {
    throw new Error(`Le produit "${product.name}" est actuellement en cours de déploiement et sera disponible prochainement.`);
  }

  // 3. Fetch user wallet & calculate costs
  const walletRef = doc(db, 'credit_wallets', userId);
  const walletSnap = await getDoc(walletRef);
  
  let currentBalance = 25.00;
  let totalConsumed = 0;
  
  if (walletSnap.exists()) {
    const data = walletSnap.data() as CreditWallet;
    currentBalance = data.creditBalance;
    totalConsumed = data.totalConsumed || 0;
  }

  const units = 1;
  const customerCost = product.pricePerUnit * units;
  const providerCost = product.providerCostPerUnit * units;
  const margin = Number((customerCost - providerCost).toFixed(6));

  if (currentBalance < customerCost) {
    throw new Error(`Solde de crédits insuffisant. Coût estimé : $${customerCost.toFixed(4)}, Solde actuel : $${currentBalance.toFixed(4)}. Veuillez recharger vos MHT Credits.`);
  }

  // 4. Simulate realistic execution & latency
  const baseLatency = product.latencyAvgMs || 250;
  const simulatedJitter = Math.floor(Math.random() * 80) - 40;
  const actualLatency = Math.max(80, baseLatency + simulatedJitter);

  await new Promise(resolve => setTimeout(resolve, Math.min(actualLatency, 700)));

  // Generate domain-specific mock response based on product
  let responseData: unknown = null;
  let logStatus: RequestLogStatus = 'SUCCESS';
  let statusCode = 200;

  switch (product.slug) {
    case 'gemini-flash':
      responseData = {
        model: 'gemini-2.5-flash',
        prompt_preview: customPayload?.prompt || 'Question transmise au modèle MHT Gemini Flash',
        output: `[MHT Gateway Response] Réponse traitée avec succès par l'infrastructure MHT APIs. Routage exécuté vers Google Vertex AI en ${actualLatency}ms. Tous les contrôles de sécurité et de quotas ont été validés.`,
        tokens_used: { prompt: 32, completion: 74, total: 106 }
      };
      break;

    case 'imagen-3':
      responseData = {
        task_id: `img_gen_${Date.now()}`,
        status: 'COMPLETED',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        metadata: { width: 1024, height: 1024, style: 'photorealistic', format: 'png' }
      };
      break;

    case 'veo-video':
      responseData = {
        job_id: `veo_job_${Date.now()}`,
        status: 'PROCESSING_SANDBOX',
        duration_sec: customPayload?.duration || 5,
        resolution: '1080p',
        webhook_callback: 'https://api.mht.technology/webhooks/video/complete'
      };
      break;

    case 'mpesa-c2b-collection':
      responseData = {
        transaction_id: `mht_mpesa_${Date.now()}`,
        checkout_request_id: `ws_CO_${Date.now()}`,
        response_code: '0',
        response_description: 'Success. Request accepted for processing (SANDBOX STK PUSH)',
        customer_message: 'Success. Request accepted for processing'
      };
      break;

    case 'market-cash-gateway':
      responseData = {
        market_cash_ref: `MCASH_TXN_${Date.now()}`,
        status: 'INTERCONNECT_ROUTED',
        source: 'Market-Cash Mobile Wallet',
        gateway: 'MHT APIs Unified Banking Hub',
        destination_partner: 'Mobile Money Gateway (SANDBOX)',
        fee_applied: customerCost,
        timestamp: new Date().toISOString()
      };
      break;

    case 'sms-global-otp':
      responseData = {
        message_id: `sms_mht_${Date.now()}`,
        recipient: customPayload?.to || '+243810000000',
        delivery_status: 'DELIVERED',
        segments: 1,
        carrier: 'Vodacom / Orange / Airtel Global Interconnect'
      };
      break;

    case 'esim-provision':
      responseData = {
        iccid: `898822000000${Math.floor(1000000 + Math.random() * 9000000)}`,
        matching_id: `MHT-ESIM-${Math.floor(100000 + Math.random() * 900000)}`,
        smdp_address: 'smdp.mht.technology',
        qr_code_payload: 'LPA:1$smdp.mht.technology$MHT-ACTIVATION-TOKEN',
        status: 'READY_FOR_PROFILE_DOWNLOAD'
      };
      break;

    case 'identity-kyc-verify':
      responseData = {
        verification_id: `kyc_mht_${Date.now()}`,
        status: 'VERIFIED',
        confidence_match: 0.992,
        checks: {
          document_authentic: true,
          face_match: true,
          liveness: true,
          pep_sanction_clean: true
        }
      };
      break;

    default:
      responseData = {
        message: `Exécution simulée réussie via MHT Gateway pour le produit ${product.name}.`,
        timestamp: new Date().toISOString(),
        product_id: product.id,
        environment: environment
      };
      break;
  }

  // 5. Update user wallet balance & write transaction
  const newBalance = Number((currentBalance - customerCost).toFixed(6));
  const newTotalConsumed = Number((totalConsumed + customerCost).toFixed(6));

  await updateDoc(walletRef, {
    creditBalance: newBalance,
    totalConsumed: newTotalConsumed,
    updatedAt: new Date().toISOString()
  });

  const txnId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await setDoc(doc(db, 'credit_transactions', txnId), {
    id: txnId,
    userId: userId,
    type: 'usage',
    amount: -customerCost,
    balanceBefore: currentBalance,
    balanceAfter: newBalance,
    reference: `API-${product.slug.toUpperCase()}`,
    description: `Consommation API: ${product.name} (Environnement ${environment})`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  // 6. Update API key last used timestamp
  await updateDoc(doc(db, 'api_keys', apiKey.id), {
    lastUsedAt: new Date().toISOString()
  });

  // 7. Write to api_request_logs (sanitized)
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const sanitizedPayloadString = JSON.stringify(customPayload || { note: 'Exécution sandbox test standard' });
  
  await setDoc(doc(db, 'api_request_logs', logId), {
    id: logId,
    requestId: requestId,
    userId: userId,
    apiKeyId: apiKey.id,
    apiKeyName: apiKey.name,
    productId: product.id,
    productName: product.name,
    providerId: product.providerId,
    providerName: product.providerName || 'MHT Hub',
    environment: environment,
    endpoint: product.endpoint,
    method: product.httpMethod,
    status: logStatus,
    statusCode: statusCode,
    units: units,
    providerCost: providerCost,
    customerCost: customerCost,
    margin: margin,
    currency: 'USD',
    latencyMs: actualLatency,
    sanitizedPayload: sanitizedPayloadString,
    createdAt: new Date().toISOString()
  });

  const totalTimeMs = Math.round(performance.now() - startTime);

  return {
    success: true,
    requestId: requestId,
    timestamp: new Date().toISOString(),
    environment: environment,
    data: responseData,
    usage: {
      units: units,
      unitName: product.unitName,
      cost: customerCost,
      currency: 'USD',
      latencyMs: totalTimeMs
    }
  };
}

/**
 * Top up credits (Sandbox recharge or simulated checkout)
 */
export async function addCreditsToWallet(params: {
  userId: string;
  amount: number;
  paymentMethod: string;
  isSandbox?: boolean;
}): Promise<void> {
  const walletRef = doc(db, 'credit_wallets', params.userId);
  const snap = await getDoc(walletRef);
  
  let currentBalance = 0;
  if (snap.exists()) {
    currentBalance = (snap.data() as CreditWallet).creditBalance || 0;
  }

  const newBalance = Number((currentBalance + params.amount).toFixed(2));

  await setDoc(walletRef, {
    uid: params.userId,
    creditBalance: newBalance,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  const txnId = `txn_topup_${Date.now()}`;
  await setDoc(doc(db, 'credit_transactions', txnId), {
    id: txnId,
    userId: params.userId,
    type: params.isSandbox ? 'bonus' : 'purchase',
    amount: params.amount,
    balanceBefore: currentBalance,
    balanceAfter: newBalance,
    reference: `RELOAD-${Date.now().toString().slice(-6)}`,
    description: `Recharge de crédits MHT (${params.paymentMethod})`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  const billId = `bill_${Date.now()}`;
  await setDoc(doc(db, 'billing_transactions', billId), {
    id: billId,
    userId: params.userId,
    amount: params.amount,
    currency: 'USD',
    status: 'PAID',
    paymentMethod: params.paymentMethod,
    invoiceNumber: `INV-MHT-${Date.now().toString().slice(-6)}`,
    planName: 'Crédits à la demande',
    creditsAdded: params.amount,
    createdAt: new Date().toISOString()
  });
}
