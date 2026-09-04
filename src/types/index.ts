export type UserRole = 'developer' | 'business' | 'admin' | 'admin_general';

export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  companyName?: string;
  country?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export type ApiCategory = 
  | 'ai' 
  | 'payment' 
  | 'communication' 
  | 'cloud' 
  | 'telecom' 
  | 'identity' 
  | 'mapping' 
  | 'other';

export type ProviderStatus = 
  | 'ACTIVE' 
  | 'DEGRADED' 
  | 'MAINTENANCE' 
  | 'DISABLED' 
  | 'PENDING_INTEGRATION';

export interface ApiProvider {
  id: string;
  name: string;
  category: ApiCategory;
  status: ProviderStatus;
  environment: 'SANDBOX' | 'LIVE' | 'HYBRID';
  website: string;
  services: string[];
  logo?: string;
  description: string;
  avgLatencyMs?: number;
  successRate?: number;
  totalRequests?: number;
  defaultMarginPercent?: number;
  healthStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 
  | 'AVAILABLE' 
  | 'SANDBOX' 
  | 'COMING_SOON' 
  | 'PARTNER_REQUIRED';

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ApiCategory;
  providerId: string;
  providerName?: string;
  status: ProductStatus;
  pricingModel: 'per_request' | 'per_token' | 'per_second' | 'per_mb' | 'tiered';
  pricePerUnit: number; // in USD (MHT customer price)
  providerCostPerUnit: number; // in USD (cost from supplier)
  currency: string;
  unitName: string; // e.g. "1K tokens", "requête", "SMS", "minute vidéo"
  documentation: string;
  endpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  sampleRequest: string;
  sampleResponse: string;
  latencyAvgMs: number;
  successRate: number;
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type KeyEnvironment = 'TEST' | 'LIVE';
export type KeyStatus = 'ACTIVE' | 'REVOKED' | 'DISABLED';

export interface ApiKey {
  id: string;
  keyId: string;
  keyPrefix: 'mht_test_' | 'mht_live_';
  maskedKey: string;
  keyHash: string;
  environment: KeyEnvironment;
  name: string;
  status: KeyStatus;
  ownerId: string;
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
  permissions?: string[];
}

export interface CreditWallet {
  uid: string;
  creditBalance: number;
  reservedCredits: number;
  totalConsumed: number;
  currency: string;
  updatedAt: string;
}

export type TransactionType = 'purchase' | 'usage' | 'refund' | 'bonus' | 'adjustment';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export type RequestLogStatus = 'SUCCESS' | 'ERROR' | 'RATE_LIMITED' | 'REJECTED';

export interface ApiRequestLog {
  id: string;
  requestId: string;
  userId: string;
  apiKeyId: string;
  apiKeyName?: string;
  apiKeyMasked?: string;
  productId: string;
  productName: string;
  providerId: string;
  providerName: string;
  environment: KeyEnvironment;
  endpoint: string;
  method: string;
  status: RequestLogStatus;
  statusCode: number;
  units: number;
  providerCost: number;
  customerCost: number;
  margin: number;
  mhtMargin?: number;
  currency: string;
  latencyMs: number;
  errorCode?: string;
  errorMessage?: string;
  sanitizedPayload?: string;
  requestPayload?: any;
  responsePayload?: any;
  createdAt: string;
}

export interface BillingTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type?: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  paymentMethod: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  planName?: string;
  description?: string;
  creditsAdded?: number;
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetResource: string;
  details: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: 'free' | 'starter' | 'pro' | 'enterprise';
  planName: string;
  monthlyCredits: number;
  priceMonthly: number;
  status: 'active' | 'canceled' | 'past_due';
  startDate: string;
  nextRenewalDate: string;
  autoRenew: boolean;
}

export type NotificationType = 
  | 'credit_low' 
  | 'key_revoked' 
  | 'api_error' 
  | 'payment' 
  | 'billing' 
  | 'maintenance' 
  | 'new_service' 
  | 'security';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  linkTo?: string;
  createdAt: string;
}

export type AdminAuditAction = 
  | 'USER_SUSPENDED' 
  | 'USER_ACTIVATED' 
  | 'ROLE_CHANGED' 
  | 'CREDITS_ADJUSTED' 
  | 'API_DISABLED' 
  | 'API_UPDATED'
  | 'PROVIDER_UPDATED' 
  | 'KEY_REVOKED' 
  | 'SYSTEM_SETTINGS_UPDATED';

export interface AdminAuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: AdminAuditAction;
  targetType: 'user' | 'api_product' | 'api_provider' | 'api_key' | 'system';
  targetId: string;
  result: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface SystemSettings {
  pricingMarkupPercent: number;
  maintenanceMode: boolean;
  globalNotice?: string;
  allowedRegistration: boolean;
  defaultWelcomeCredits: number;
  updatedAt: string;
}

// MHT Gateway Architectural Contracts (Interfaces for TypeScript)
export interface GatewayApiRequest {
  apiKey: string;
  productId: string;
  payload: Record<string, unknown>;
  environment?: KeyEnvironment;
  clientRequestId?: string;
}

export interface GatewayApiResponse<T = unknown> {
  success: boolean;
  requestId: string;
  timestamp: string;
  environment: KeyEnvironment;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  usage: {
    units: number;
    unitName: string;
    cost: number;
    currency: string;
    latencyMs: number;
  };
}

export interface ProviderAdapter {
  providerId: string;
  name: string;
  executeRequest(request: GatewayApiRequest): Promise<GatewayApiResponse>;
  validateHealth(): Promise<boolean>;
}
