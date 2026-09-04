import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { ApiProvider, ApiProduct, SystemSettings } from '../types';

export const INITIAL_PROVIDERS: ApiProvider[] = [
  {
    id: 'google-ai',
    name: 'Google Vertex AI & Gemini',
    category: 'ai',
    status: 'ACTIVE',
    environment: 'HYBRID',
    website: 'https://cloud.google.com/vertex-ai',
    services: ['Gemini 2.5 Flash', 'Gemini Pro', 'Imagen 3', 'Veo Video', 'Embeddings'],
    description: 'Infrastructure d’IA générative multimodale haute performance par Google.',
    avgLatencyMs: 240,
    successRate: 99.94,
    totalRequests: 142580,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'openai',
    name: 'OpenAI Enterprise',
    category: 'ai',
    status: 'ACTIVE',
    environment: 'HYBRID',
    website: 'https://openai.com',
    services: ['GPT-4o', 'GPT-4o mini', 'DALL-E 3', 'Whisper Speech', 'TTS'],
    description: 'Modèles de langage avancés, vision par ordinateur et génération de contenu.',
    avgLatencyMs: 310,
    successRate: 99.88,
    totalRequests: 98400,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mpesa-africa',
    name: 'M-Pesa Africa Gateway',
    category: 'payment',
    status: 'PENDING_INTEGRATION',
    environment: 'SANDBOX',
    website: 'https://developer.safaricom.co.ke',
    services: ['C2B Collection', 'B2C Payout', 'STK Push', 'Balance Query'],
    description: 'Passerelle Mobile Money panafricaine pour les paiements marchands et déboursements.',
    avgLatencyMs: 820,
    successRate: 98.40,
    totalRequests: 12040,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'orange-airtel-money',
    name: 'Orange & Airtel Money Hub',
    category: 'payment',
    status: 'PENDING_INTEGRATION',
    environment: 'SANDBOX',
    website: 'https://developer.orange.com',
    services: ['Orange Money WebPay', 'Airtel Money Collection', 'USSD Push'],
    description: 'Agrégateur de paiement mobile money pour l’Afrique centrale et de l’Ouest.',
    avgLatencyMs: 950,
    successRate: 97.90,
    totalRequests: 8400,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banking-gateway',
    name: 'MHT Core Banking Interconnect',
    category: 'payment',
    status: 'PENDING_INTEGRATION',
    environment: 'SANDBOX',
    website: 'https://mht.technology/banking',
    services: ['Virements SEPA/SWIFT', 'Émission Cartes Virtuelles', 'Vérification IBAN'],
    description: 'Passerelle bancaire régulée pour les institutions financières et fintechs.',
    avgLatencyMs: 1200,
    successRate: 99.10,
    totalRequests: 3200,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'twilio-infobip',
    name: 'Telecom Communication Hub',
    category: 'communication',
    status: 'ACTIVE',
    environment: 'HYBRID',
    website: 'https://www.twilio.com',
    services: ['SMS Global', 'OTP Verification', 'WhatsApp Business API', 'Voice IVR'],
    description: 'Routage mondial de SMS transactionnels, codes OTP et notifications WhatsApp.',
    avgLatencyMs: 180,
    successRate: 99.70,
    totalRequests: 215000,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'esim-connect',
    name: 'MHT Global eSIM Services',
    category: 'telecom',
    status: 'ACTIVE',
    environment: 'HYBRID',
    website: 'https://mht.technology/esim',
    services: ['Profils eSIM Data', 'Activation Instantanée', 'Top-up Forfait'],
    description: 'Fourniture et gestion automatisée de profils eSIM pour plus de 160 pays.',
    avgLatencyMs: 450,
    successRate: 99.60,
    totalRequests: 19400,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kyc-identity',
    name: 'MHT Identity & KYC Shield',
    category: 'identity',
    status: 'ACTIVE',
    environment: 'HYBRID',
    website: 'https://mht.technology/identity',
    services: ['Scan Passeport / CNI', 'Liveness Check', 'Vérification Registres Nationaux'],
    description: 'Vérification d’identité biométrique et conformité anti-fraude en temps réel.',
    avgLatencyMs: 650,
    successRate: 99.20,
    totalRequests: 43200,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mht-cloud-storage',
    name: 'MHT Cloud Vault & Object Storage',
    category: 'cloud',
    status: 'ACTIVE',
    environment: 'HYBRID',
    website: 'https://mht.technology/cloud',
    services: ['S3 Compatible Storage', 'CDN Edge Caching', 'Chiffrement Zero-Knowledge'],
    description: 'Stockage d’objets distribué et sécurisé avec conformité de souveraineté des données.',
    avgLatencyMs: 95,
    successRate: 99.99,
    totalRequests: 540000,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_PRODUCTS: ApiProduct[] = [
  {
    id: 'gemini-flash',
    name: 'Gemini 2.5 Flash Text & Multimodal',
    slug: 'gemini-flash',
    description: 'Génération de texte ultra-rapide, raisonnement avancé, analyse de documents et traitement multimodal.',
    category: 'ai',
    providerId: 'google-ai',
    providerName: 'Google Vertex AI & Gemini',
    status: 'AVAILABLE',
    pricingModel: 'per_token',
    pricePerUnit: 0.00035, // MHT Price per 1k tokens
    providerCostPerUnit: 0.00015, // Provider cost
    currency: 'USD',
    unitName: '1K tokens',
    endpoint: '/v1/ai/gemini-flash',
    httpMethod: 'POST',
    documentation: 'Permet de générer du texte, résumer des articles, coder et dialoguer avec une latence inférieure à 300ms.',
    sampleRequest: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: "Explique l'infrastructure MHT APIs en 2 phrases." }],
      temperature: 0.7,
      max_tokens: 500
    }, null, 2),
    sampleResponse: JSON.stringify({
      id: "mht_resp_892f3a",
      object: "chat.completion",
      created: 1740998400,
      model: "gemini-2.5-flash",
      choices: [{
        message: {
          role: "assistant",
          content: "MHT APIs est la passerelle centralisée de Mungwele Holding & Technology qui unifie l'accès aux services d'IA, de paiement, de télécoms et de cloud. Elle offre aux développeurs une couche robuste d'authentification, de facturation et de supervision."
        },
        finish_reason: "stop"
      }],
      usage: { prompt_tokens: 28, completion_tokens: 64, total_tokens: 92, cost_usd: 0.000032 }
    }, null, 2),
    latencyAvgMs: 240,
    successRate: 99.9,
    isPopular: true,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'imagen-3',
    name: 'MHT Imagen 3 Studio',
    slug: 'imagen-3',
    description: 'Génération d’images photoréalistes et artistiques de haute résolution à partir de descriptions textuelles.',
    category: 'ai',
    providerId: 'google-ai',
    providerName: 'Google Vertex AI & Gemini',
    status: 'AVAILABLE',
    pricingModel: 'per_request',
    pricePerUnit: 0.035,
    providerCostPerUnit: 0.020,
    currency: 'USD',
    unitName: 'Image générée',
    endpoint: '/v1/ai/images/generate',
    httpMethod: 'POST',
    documentation: 'Génère jusqu’à 4 images par requête avec choix du ratio (1:1, 16:9, 9:16) et du niveau de détail.',
    sampleRequest: JSON.stringify({
      prompt: "Un centre de données futuriste avec des circuits lumineux bleus dans un style minimaliste",
      aspect_ratio: "16:9",
      number_of_images: 1,
      safety_filter_level: "block_medium_and_above"
    }, null, 2),
    sampleResponse: JSON.stringify({
      id: "mht_img_44a10c",
      created: 1740998400,
      images: [
        { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80", mime_type: "image/png" }
      ],
      usage: { images_count: 1, cost_usd: 0.035 }
    }, null, 2),
    latencyAvgMs: 1450,
    successRate: 99.5,
    isPopular: true,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'veo-video',
    name: 'Veo AI Video Generator',
    slug: 'veo-video',
    description: 'Génération de clips vidéo cinématiques HD 1080p avec physique cohérente et contrôle de caméra.',
    category: 'ai',
    providerId: 'google-ai',
    providerName: 'Google Vertex AI & Gemini',
    status: 'SANDBOX',
    pricingModel: 'per_second',
    pricePerUnit: 0.080,
    providerCostPerUnit: 0.050,
    currency: 'USD',
    unitName: 'Seconde vidéo',
    endpoint: '/v1/ai/video/generate',
    httpMethod: 'POST',
    documentation: 'Crée des vidéos courtes de 5 à 10 secondes. Actuellement disponible en mode Sandbox MHT.',
    sampleRequest: JSON.stringify({
      prompt: "Vue aérienne d'une métropole africaine moderne connectée au coucher du soleil",
      duration_seconds: 5,
      resolution: "1080p",
      fps: 24
    }, null, 2),
    sampleResponse: JSON.stringify({
      id: "mht_vid_task_9011",
      status: "processing",
      eta_seconds: 45,
      webhook_url: "https://votre-app.com/webhooks/video"
    }, null, 2),
    latencyAvgMs: 3500,
    successRate: 98.8,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mpesa-c2b-collection',
    name: 'Mobile Money STK Push (M-Pesa)',
    slug: 'mpesa-c2b-collection',
    description: 'Déclenche une invite de paiement USSD sécurisée directement sur le téléphone du client pour encaissement.',
    category: 'payment',
    providerId: 'mpesa-africa',
    providerName: 'M-Pesa Africa Gateway',
    status: 'PARTNER_REQUIRED',
    pricingModel: 'tiered',
    pricePerUnit: 0.065,
    providerCostPerUnit: 0.035,
    currency: 'USD',
    unitName: 'Transaction',
    endpoint: '/v1/payments/mobile-money/stk-push',
    httpMethod: 'POST',
    documentation: 'Prévu pour intégrer Market-Cash et d’autres applications de commerce. Requiert agrément opérateur pour mode LIVE.',
    sampleRequest: JSON.stringify({
      phone_number: "+243810000000",
      amount: 10.00,
      currency: "USD",
      reference: "MCASH-ORDER-7891",
      description: "Recharge portefeuille Market-Cash"
    }, null, 2),
    sampleResponse: JSON.stringify({
      transaction_id: "mht_txn_sandbox_8831",
      status: "PENDING_CUSTOMER_PIN",
      partner: "M-Pesa Africa",
      reference: "MCASH-ORDER-7891",
      amount: 10.00,
      currency: "USD",
      note: "SANDBOX SIMULATION: Intégration bancaire/télécom réelle requise en production."
    }, null, 2),
    latencyAvgMs: 980,
    successRate: 98.4,
    isPopular: true,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'market-cash-gateway',
    name: 'Market-Cash Interconnect Gateway',
    slug: 'market-cash-gateway',
    description: 'Interface unifiée de transfert et recharge portefeuille conçue pour l’écosystème fintech Market-Cash.',
    category: 'payment',
    providerId: 'banking-gateway',
    providerName: 'MHT Core Banking Interconnect',
    status: 'PARTNER_REQUIRED',
    pricingModel: 'per_request',
    pricePerUnit: 0.050,
    providerCostPerUnit: 0.025,
    currency: 'USD',
    unitName: 'Recharge / Transfert',
    endpoint: '/v1/payments/market-cash/transfer',
    httpMethod: 'POST',
    documentation: 'Route les opérations de Market-Cash vers le bon partenaire (Mobile Money, Carte, Banque) avec confirmation sécurisée.',
    sampleRequest: JSON.stringify({
      market_cash_account_id: "mc_user_44921",
      destination_provider: "mpesa",
      amount: 25.00,
      currency: "USD"
    }, null, 2),
    sampleResponse: JSON.stringify({
      status: "QUEUED_ROUTING",
      flow: "Market-Cash -> MHT APIs -> Fournisseur Partenaire -> Client",
      notice: "Contrat de partenariat financier requis pour exécution en direct."
    }, null, 2),
    latencyAvgMs: 850,
    successRate: 99.1,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sms-global-otp',
    name: 'Global SMS & OTP Deliverability',
    slug: 'sms-global-otp',
    description: 'Envoi instantané de SMS transactionnels et validation de codes OTP à 6 chiffres avec routage direct.',
    category: 'communication',
    providerId: 'twilio-infobip',
    providerName: 'Telecom Communication Hub',
    status: 'AVAILABLE',
    pricingModel: 'per_request',
    pricePerUnit: 0.018,
    providerCostPerUnit: 0.009,
    currency: 'USD',
    unitName: 'SMS',
    endpoint: '/v1/telecom/sms/send',
    httpMethod: 'POST',
    documentation: 'Permet d’expédier des alertes de sécurité, confirmations de transaction et messages de bienvenue.',
    sampleRequest: JSON.stringify({
      to: "+243820000000",
      sender_id: "MHT_AUTH",
      message: "Votre code de sécurité MHT est : 481920. Valable 5 minutes."
    }, null, 2),
    sampleResponse: JSON.stringify({
      message_id: "mht_sms_991823",
      status: "DELIVERED_NETWORK",
      parts: 1,
      cost_usd: 0.018
    }, null, 2),
    latencyAvgMs: 190,
    successRate: 99.7,
    isPopular: true,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'esim-provision',
    name: 'MHT Global eSIM Automated Provisioning',
    slug: 'esim-provision',
    description: 'Émission de profil eSIM instantané (QR Code / SM-DP+) pour connectivité 4G/5G internationale.',
    category: 'telecom',
    providerId: 'esim-connect',
    providerName: 'MHT Global eSIM Services',
    status: 'AVAILABLE',
    pricingModel: 'per_request',
    pricePerUnit: 1.800,
    providerCostPerUnit: 1.200,
    currency: 'USD',
    unitName: 'Profil eSIM',
    endpoint: '/v1/telecom/esim/provision',
    httpMethod: 'POST',
    documentation: 'Génère un QR code d’installation immédiate pour les téléphones compatibles avec forfait de données.',
    sampleRequest: JSON.stringify({
      country_iso: "CD",
      data_bundle_gb: 5,
      validity_days: 30,
      customer_email: "dev@entreprise.com"
    }, null, 2),
    sampleResponse: JSON.stringify({
      iccid: "8988220000004928172",
      smdp_address: "smdp.mht.technology",
      activation_code: "LPA:1$smdp.mht.technology$MHT-PROV-9018",
      qr_code_url: "https://api.mht.technology/qr/sample-esim.png",
      status: "READY_FOR_DOWNLOAD"
    }, null, 2),
    latencyAvgMs: 420,
    successRate: 99.6,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'identity-kyc-verify',
    name: 'MHT Identity & Biometric KYC',
    category: 'identity',
    slug: 'identity-kyc-verify',
    description: 'Contrôle d’authenticité de documents d’identité officiels et comparaison faciale anti-usurpation.',
    providerId: 'kyc-identity',
    providerName: 'MHT Identity & KYC Shield',
    status: 'AVAILABLE',
    pricingModel: 'per_request',
    pricePerUnit: 0.450,
    providerCostPerUnit: 0.280,
    currency: 'USD',
    unitName: 'Vérification KYC',
    endpoint: '/v1/identity/verify',
    httpMethod: 'POST',
    documentation: 'Permet de respecter les exigences réglementaires AML/KYC en moins de 10 secondes.',
    sampleRequest: JSON.stringify({
      document_type: "PASSPORT",
      country: "CD",
      document_image_base64: "[BASE64_DATA]",
      selfie_image_base64: "[BASE64_DATA]"
    }, null, 2),
    sampleResponse: JSON.stringify({
      verification_id: "mht_kyc_55819",
      result: "VERIFIED",
      confidence_score: 0.984,
      extracted_data: {
        full_name: "KAPINGA MUKENDI",
        document_number: "CD1098472",
        expiry_date: "2030-08-15"
      }
    }, null, 2),
    latencyAvgMs: 680,
    successRate: 99.3,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cloud-vault-storage',
    name: 'MHT S3 Cloud Vault Storage',
    slug: 'cloud-vault-storage',
    description: 'Espace de stockage d’objets distribué et chiffré pour vos sauvegardes et médias.',
    category: 'cloud',
    providerId: 'mht-cloud-storage',
    providerName: 'MHT Cloud Vault & Object Storage',
    status: 'AVAILABLE',
    pricingModel: 'per_mb',
    pricePerUnit: 0.025,
    providerCostPerUnit: 0.012,
    currency: 'USD',
    unitName: 'Go / mois',
    endpoint: '/v1/cloud/storage/bucket',
    httpMethod: 'POST',
    documentation: 'Compatible avec les SDKs S3 standards pour stocker et servir vos assets.',
    sampleRequest: JSON.stringify({
      bucket: "mon-app-backups",
      region: "mht-central-africa-1",
      encryption: "AES256"
    }, null, 2),
    sampleResponse: JSON.stringify({
      bucket_id: "bkt_99281a",
      arn: "arn:mht:storage:::mon-app-backups",
      endpoint_url: "https://mon-app-backups.storage.mht.technology",
      status: "ACTIVE"
    }, null, 2),
    latencyAvgMs: 95,
    successRate: 99.99,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  pricingMarkupPercent: 35.0, // 35% default margin
  maintenanceMode: false,
  globalNotice: 'Bienvenue sur la version MVP de MHT APIs. L’environnement SANDBOX est actif avec 25.00 MHT Credits offerts.',
  allowedRegistration: true,
  defaultWelcomeCredits: 25.00,
  updatedAt: new Date().toISOString(),
};

/**
 * Initializes Firestore seed data if collections are empty
 */
export async function seedInitialCatalogData() {
  return ensureSeedDataInitialized();
}

export async function ensureSeedDataInitialized() {
  try {
    const settingsDoc = await getDoc(doc(db, 'system_settings', 'global_config'));
    if (!settingsDoc.exists()) {
      // Initialize system settings
      await setDoc(doc(db, 'system_settings', 'global_config'), INITIAL_SYSTEM_SETTINGS);
      
      // Batch write providers
      const batch = writeBatch(db);
      for (const provider of INITIAL_PROVIDERS) {
        batch.set(doc(db, 'api_providers', provider.id), provider);
      }
      for (const product of INITIAL_PRODUCTS) {
        batch.set(doc(db, 'api_products', product.id), product);
      }
      await batch.commit();
      console.log('MHT APIs initial database seeded successfully.');
    }
  } catch (err) {
    console.warn('Seed initialization check handled gracefully:', err);
  }
}
