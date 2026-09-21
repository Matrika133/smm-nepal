export type ServiceCategory =
  | 'Instagram'
  | 'TikTok'
  | 'YouTube'
  | 'Facebook'
  | 'Telegram'
  | 'X (Twitter)'
  | 'Spotify'
  | 'LinkedIn'
  | 'Discord'
  | 'Website Traffic';

export type ServiceType =
  | 'Followers'
  | 'Likes'
  | 'Views'
  | 'Comments'
  | 'Subscribers'
  | 'Watch Time'
  | 'Shares / Retweets'
  | 'Members'
  | 'Live Stream'
  | 'Custom Comments';

export interface SMMService {
  id: string;
  serviceId: number;
  name: string;
  category: ServiceCategory;
  type: ServiceType;
  ratePer1k: number; // in NPR (Nepalese Rupees)
  minQuantity: number;
  maxQuantity: number;
  averageTime: string;
  speed: string;
  description: string;
  refill: boolean;
  refillDays?: number;
  guaranteed: boolean;
  dripFeedAvailable: boolean;
  cancelAvailable: boolean;
  isPopular?: boolean;
  isActive?: boolean;
  logoUrl?: string; // Custom app icon or service logo
}

export type OrderStatus =
  | 'Pending'
  | 'In progress'
  | 'Processing'
  | 'Completed'
  | 'Partial'
  | 'Canceled'
  | 'Refunded';

export type UserTier = 'Standard' | 'Reseller' | 'VIP' | 'Wholesale' | 'Staff' | 'Admin';

export type StaffRole =
  | 'superadmin'
  | 'admin'
  | 'manager'
  | 'partner'
  | 'staff'
  | 'support_agent'
  | 'order_manager'
  | 'finance_manager'
  | 'custom';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  password?: string;
  masterKey?: string;
  masterPassword?: string;
  balance: number; // in NPR or site currency
  currency: 'NPR' | 'USD' | 'INR' | string;
  tier: UserTier;
  role?: StaffRole | 'admin' | 'staff' | 'user';
  status?: 'active' | 'suspended' | 'banned' | 'Active' | 'Suspended' | 'Banned';
  apiKey: string;
  totalSpent: number; // in NPR
  totalOrders: number;
  totalDeposited?: number;
  avatarUrl?: string;
  theme?: 'dark' | 'light';
  createdAt?: string;
  department?: string;
  staffPermissions?: StaffPermissions;
}

export interface EmailConfig {
  isEnabled?: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpUsername?: string;
  smtpPassword?: string;
  isConfigured?: boolean;
  senderName: string;
  senderEmail: string;
  encryption: 'TLS' | 'SSL' | 'None';
  sendGridApiKey?: string;
  notifyOnRegistration?: boolean;
  notifyOnDeposit?: boolean;
  notifyOnOrderComplete?: boolean;
  notifyOnTicketReply?: boolean;
  enabledForLogin?: boolean;
  enabledForRegistration?: boolean;
  enabledForPasswordForgot?: boolean;
  enabledForOrders?: boolean;
  enabledForDeposits?: boolean;
}

export interface StaffPermissions {
  canManageOrders: boolean;
  canApprovePayments: boolean;
  canManageServices: boolean;
  canReplyTickets: boolean;
  canManageUsers: boolean;
  canConfigureApis: boolean;
  canManageStaff: boolean;
  canChangeSettings: boolean;
  canBroadcastAlerts: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  masterKey?: string; // Master key required for staff login
  department: string;
  role: StaffRole;
  permissions: StaffPermissions;
  salaryNpr?: number;
  status: 'active' | 'suspended';
  hiredDate: string;
  lastActive?: string;
}

export interface WholesalerProvider {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  status: 'active' | 'inactive' | 'testing';
  balance?: number;
  currency?: string;
  autoDispatch: boolean;
  serviceMapping?: { [localServiceId: string]: number };
  lastSync?: string;
  notes?: string;
  testMode?: boolean;
  usdRate?: number;
  balanceNpr?: number;
}

export interface SMMOrder {
  id: string;
  orderId: number;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  link: string;
  quantity: number;
  charge: number; // in NPR
  startCount: number;
  remains: number;
  status: OrderStatus;
  createdAt: string;
  userId?: string;
  username?: string;
  dripFeed?: {
    runs: number;
    intervalMinutes: number;
    completedRuns: number;
  };
  customComments?: string[];
  wholesalerProviderId?: string;
  wholesalerOrderId?: number | string;
  wholesalerStatus?: string;
  wholesalerError?: string;
  wholesalerDispatchedAt?: string;
  wholesalerStartCount?: number;
  wholesalerRemains?: number;
  wholesalerCharge?: number | string;
}

export interface LoginFormData {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  tier?: 'Standard' | 'Reseller' | 'VIP';
  referralCode?: string;
}

export interface PaymentTransaction {
  id: string;
  userId?: string;
  userUsername?: string;
  type?: 'Deposit' | 'Debit' | 'Refund' | 'Commission';
  method:
    | 'Fonepay'
    | 'eSewa'
    | 'Khalti'
    | 'Bank Transfer (ConnectIPS)'
    | 'IME Pay'
    | 'Crypto (USDT TRC20)'
    | 'Wallet Debit'
    | 'Child Panel Hosting'
    | 'Referral Bonus'
    | string;
  amount: number; // in NPR
  currency: 'NPR';
  fee: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  transactionId: string;
  senderName?: string;
  senderPhone?: string;
  screenshotUrl?: string;
  notes?: string;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  date: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: number;
  subject: string;
  orderId?: number;
  status: 'Open' | 'Answered' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
  messages: {
    sender: 'user' | 'support' | 'ai_agent';
    text: string;
    timestamp: string;
  }[];
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'deal' | 'alert';
  date: string;
}

export interface ToastNotification {
  id: string;
  orderId: number;
  serviceName: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  title: string;
  message: string;
  timestamp: string;
  type: 'in_progress' | 'completed' | 'info' | 'warning';
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'deposit_approved' | 'deposit_rejected' | 'ticket_reply' | 'ticket_closed' | 'order_update' | 'system';
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
  amount?: number;
  ticketNumber?: number;
  referenceId?: string;
}

export type ChildPanelTheme =
  | 'Dark Cyber'
  | 'Neon Emerald'
  | 'Minimalist Slate'
  | 'Royal Purple'
  | 'Ocean Blue';

export type ChildPanelStatus =
  | 'Active'
  | 'Pending DNS'
  | 'Configuring'
  | 'Expired'
  | 'Suspended';

export interface ChildPanel {
  id: string;
  userId?: string;
  domain: string;
  adminUsername: string;
  adminPassword?: string;
  currency: 'NPR' | 'USD' | 'INR';
  priceMonthly: number; // in NPR
  status: ChildPanelStatus;
  nameservers: {
    ns1: string;
    ns2: string;
  };
  nameserver1?: string;
  nameserver2?: string;
  cnameRecord: string;
  createdAt: string;
  renewDate: string;
  autoRenew: boolean;
  theme: ChildPanelTheme | string;
  totalOrdersForwarded: number;
  totalEarningsNPR: number;
  dnsVerified: boolean;
  lastDnsCheck?: string;
  profitMarginPercent: number; // e.g. 25 for +25% markup
  siteTitle: string;
  supportContact: string;
  syncedServicesCount: number;
}

export type PaymentGatewayCategory =
  | 'nepal_wallet'
  | 'nepal_bank'
  | 'crypto'
  | 'india_upi'
  | 'international'
  | 'custom';

export interface CustomPaymentGateway {
  id: string; // e.g. 'fonepay', 'esewa', 'khalti', 'bank', 'imepay', 'usdt', 'gw_prabhu_pay', 'gw_cellpay', etc.
  name: string; // e.g. 'Fonepay Direct QR', 'Prabhu Pay', 'Indian UPI (GPay/Paytm)'
  code: string; // e.g. 'FONEPAY', 'PRABHU_PAY', 'INDIAN_UPI'
  category: PaymentGatewayCategory;
  currency: string; // 'NPR', 'INR', 'USD', 'USDT'
  exchangeRateToNpr: number; // 1 unit in currency = X NPR (default 1 for NPR, 1.60 for INR, 136.5 for USD)
  status: 'active' | 'inactive';
  isBuiltIn?: boolean;
  badgeText?: string; // e.g. 'All Banks QR', '0% Fee', 'Instant', 'Auto Rate'
  accentColor?: string; // Hex color code for UI cards and badges
  logoUrl?: string; // Custom gateway logo URL or badge image

  // Account and Merchant credentials
  merchantName: string;
  accountNumber: string; // Phone, Account Number, ID, or Crypto Wallet Address
  branchOrNetwork?: string; // Bank branch name or crypto network (e.g. TRC20, BEP20)
  qrImageUrl?: string; // Uploaded Base64 image or Image URL
  instructions: string; // Guidance shown to user on Add Funds page

  // Limits & Rules
  minDeposit: number;
  maxDeposit?: number;
  processingFeePercent: number; // usually 0%
  depositBonusPercent: number; // e.g. 5% cashback
  autoApprove?: boolean;
  requiredProofFields?: ('transaction_id' | 'sender_phone' | 'sender_name' | 'screenshot' | 'notes')[];
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface AutomaticPaymentGatewayConfig {
  id: string;
  name: string; // e.g. "Auto eSewa ePay v2", "Khalti Automated Gateway", "Custom API Gateway", "Stripe Auto PG"
  code: string; // e.g. 'AUTO_ESEWA', 'AUTO_KHALTI', 'CUSTOM_AUTO_API', 'STRIPE_AUTO'
  providerType: 'custom_endpoint' | 'esewa_epay' | 'khalti_epay' | 'fonepay_merchant' | 'stripe' | 'razorpay_upi';
  status: 'active' | 'inactive';
  mode: 'live' | 'sandbox';
  endpointUrl: string; // The endpoint URL for checkout initialization / payment request
  publicKey: string; // Public Key / Client ID / Merchant ID
  secretKey: string; // Secret Key / API Key / Secret Token (masked in UI)
  webhookSecret?: string; // Webhook Secret / Verification Signature Token
  fonepayUsername?: string; // Fonepay Business Login Username / Email / Mobile
  fonepayPassword?: string; // Fonepay Business Login Password
  fonepayLoginUrl?: string; // Fonepay Merchant Portal / Website Login URL for backend verification
  fonepayQrImageUrl?: string; // Uploaded or Static Real Fonepay Merchant QR Standee Image (Direct from Fonepay)
  fonepayMerchantCode?: string; // Real 6-7 digit Fonepay Merchant Code
  fonepayPan?: string; // Fonepay Merchant PAN or Account ID
  currency: string; // 'NPR', 'USD', 'INR'
  exchangeRateToNpr: number;
  minDeposit: number;
  maxDeposit?: number;
  processingFeePercent: number;
  depositBonusPercent: number;
  accentColor?: string;
  badgeText?: string;
  logoUrl?: string; // Custom gateway logo URL
  instructions: string;
  autoApprove: boolean; // Always true for instant automatic gateway
  createdAt: string;
  updatedAt?: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | 'untested';
}

export interface PasswordResetRequest {
  id: string;
  userId?: string;
  email: string;
  username?: string;
  phone?: string;
  status: 'Pending' | 'Reset Completed' | 'Resolved' | 'Rejected';
  requestedAt: string;
  newPassword?: string;
  newPasswordProvided?: string;
  adminNote?: string;
  adminNotes?: string;
  handledBy?: string;
  handledAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  ipAddress?: string;
}

export interface MaintenanceApprovalRequest {
  requestedBy: string;
  staffName?: string;
  action: 'enable' | 'disable';
  reason: string;
  requestedAt: string;
}

export interface CronExecutionLog {
  id: string;
  jobName: string;
  status: 'success' | 'failed' | 'running';
  message: string;
  executedAt: string;
  durationMs?: number;
}

export interface CronJobItem {
  id: string;
  name: string;
  description: string;
  interval: string;
  command: string;
  endpoint: string;
  status: 'active' | 'paused';
  lastRun?: string;
  nextRun?: string;
}

export interface SocialLoginSettings {
  disableAllSocialLogins?: boolean;
  googleEnabled?: boolean;
  googleClientId?: string;
  googleClientSecret?: string;
  githubEnabled?: boolean;
  githubClientId?: string;
  githubClientSecret?: string;
  facebookEnabled?: boolean;
  facebookAppId?: string;
  facebookAppSecret?: string;
  telegramEnabled?: boolean;
}

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleTag?: string;
  headerCode?: string;
  footerCode?: string;
}

export interface SystemConfigSettings {
  orderMaxLimit?: number;
  dripFeedEnabled?: boolean;
  registrationEnabled?: boolean;
  emailVerificationRequired?: boolean;
  autoSyncProviders?: boolean;
  autoRefundFailedOrders?: boolean;
  lowBalanceThresholdNPR?: number;
  sessionTimeoutMinutes?: number;
}

export interface CronSettings {
  cronSecretKey?: string;
  isWebsiteConnected?: boolean;
  connectedDomain?: string;
  connectedAt?: string;
  domainVerificationStatus?: 'connected' | 'disconnected' | 'verifying';
  autoSyncOrders?: boolean;
  autoSyncStatus?: boolean;
  autoCurrencyRefresh?: boolean;
  autoExpirePendingDeposits?: boolean;
  lastRun?: string;
  executionLogs?: CronExecutionLog[];
}

export interface SystemSettings {
  siteName: string;
  siteTagline: string;
  siteUrl?: string;
  domainUrl?: string;
  currency?: string;
  defaultCurrency?: string;
  siteLogoUrl?: string;
  siteLogoText?: string;
  siteFaviconUrl?: string;
  announcementTicker: string;
  maintenanceMode: boolean;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
  maintenanceEstimatedTime?: string;
  maintenanceApprovalRequest?: MaintenanceApprovalRequest | null;
  minDepositNPR: number;
  usdToNprRate: number;
  inrToNprRate?: number;
  depositBonusPercent: number;
  whatsappNumber: string;
  telegramHandle: string;
  supportEmail: string;
  supportPhone?: string;
  fonepayMerchant: string;
  fonepayNumber: string;
  fonepayQrImage: string;
  esewaId: string;
  esewaName: string;
  esewaQrImage?: string;
  khaltiId: string;
  khaltiName: string;
  khaltiQrImage?: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankQrImage?: string;
  imePayQrImage?: string;
  usdtTrc20Address: string;
  usdtQrImage?: string;
  paymentGateways?: CustomPaymentGateway[];
  automaticPaymentGateways?: AutomaticPaymentGatewayConfig[];
  autoGatewayConfig?: AutomaticPaymentGatewayConfig;
  disableAutomaticGateways?: boolean;
  disableManualGateways?: boolean;
  adminPanelName?: string;
  adminPanelLogoUrl?: string;
  adminRoutePath?: string;
  emailConfig?: EmailConfig;
  socialLoginSettings?: SocialLoginSettings;
  seoSettings?: SeoSettings;
  systemConfig?: SystemConfigSettings;
  cronSettings?: CronSettings;
  childPanelMonthlyPriceNPR?: number;
  homepageStats?: HomepageStatsConfig;
  maxFileUploadSizeMB?: number;
  systemUpgradeHistory?: SystemUpgradeLog[];
}

export interface SystemUpgradeLog {
  id: string;
  version: string;
  timestamp: string;
  performedBy: string;
  status: 'Success' | 'In Progress' | 'Failed';
  preservedUsersCount: number;
  preservedBalancesNPR: number;
  preservedOrdersCount: number;
  details: string[];
  uploadedFileName?: string;
  uploadedFileSize?: string;
  fileChecksum?: string;
  packageType?: string;
}

export interface HomepageStatsConfig {
  useCustomStats: boolean;
  totalUsers: number;
  totalServices: number;
  totalOrders: number;
  systemUptime: string; // e.g. "99.98%"
  activeResellers: number;
  satisfactionRate: string; // e.g. "99.9%"
  badgeText?: string;
}

export interface PasswordResetToken {
  token: string;
  email: string;
  userId?: string;
  role?: string;
  expiresAt: number; // Unix epoch ms (12 hours)
  createdAt: number;
  used: boolean;
}

export interface SentEmailLog {
  id: string;
  recipient: string;
  recipientName?: string;
  subject: string;
  body: string;
  sentAt: string;
  sentBy: string;
  status: 'Sent' | 'Failed';
}

