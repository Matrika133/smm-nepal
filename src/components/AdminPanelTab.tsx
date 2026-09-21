import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  ShoppingCart,
  Receipt,
  List,
  Globe,
  MessageSquare,
  Bell,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Eye,
  Key,
  ShieldCheck,
  Check,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Server,
  QrCode,
  Lock,
  UserCheck,
  UserX,
  CreditCard,
  Building,
  Sparkles,
  Download,
  ExternalLink,
  ChevronRight,
  Send,
  Sliders,
  Award,
  Wallet,
  Briefcase,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Phone,
  Mail,
  Zap,
  Menu,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateSampleProofReceipt } from '../utils/paymentProofHelper';
import {
  UserAccount,
  SMMOrder,
  SMMService,
  PaymentTransaction,
  SupportTicket,
  BroadcastNotification,
  ChildPanel,
  OrderStatus,
  ServiceCategory,
  SystemSettings,
  StaffMember,
  WholesalerProvider,
  PasswordResetRequest
} from '../types';
import {
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_STAFF_MEMBERS,
  DEFAULT_WHOLESALER_PROVIDERS,
  DEFAULT_PASSWORD_RESETS
} from '../data/smmData';
import { PaymentQrSettingsTab } from './PaymentQrSettingsTab';
import { PaymentGatewayManagerTab } from './PaymentGatewayManagerTab';
import { WholesalerApiTab } from './WholesalerApiTab';
import { StaffManagementTab } from './StaffManagementTab';
import { AdminLiveChatDesk } from './AdminLiveChatDesk';
import { AdminEmailConfigTab } from './AdminEmailConfigTab';
import { AdminCronSetupTab } from './AdminCronSetupTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { StaffProfileSecurityModal } from './StaffProfileSecurityModal';
import { AdminDashboardCharts } from './AdminDashboardCharts';
import { SystemUpgradeManagerModal } from './SystemUpgradeManagerModal';
import { getConversationsSummary } from '../utils/liveChatStore';

interface AdminPanelTabProps {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  orders: SMMOrder[];
  services: SMMService[];
  transactions: PaymentTransaction[];
  tickets: SupportTicket[];
  childPanels: ChildPanel[];
  notices: BroadcastNotification[];
  systemSettings?: SystemSettings;
  staffMembers?: StaffMember[];
  wholesalerProviders?: WholesalerProvider[];
  passwordResetRequests?: PasswordResetRequest[];
  initialSection?: string;
  onUpdateCurrentUser?: (updated: Partial<UserAccount>) => void;
  onUpdateSystemSettings?: (settings: SystemSettings) => void;
  onUpdateStaff?: (staff: StaffMember[]) => void;
  onUpdateWholesalerProviders?: (providers: WholesalerProvider[]) => void;
  onUpdatePasswordResetRequests?: (requests: PasswordResetRequest[]) => void;
  onUpdateUsers: (users: UserAccount[]) => void;
  onUpdateOrders: (orders: SMMOrder[]) => void;
  onUpdateServices: (services: SMMService[]) => void;
  onUpdateTransactions: (transactions: PaymentTransaction[]) => void;
  onUpdateTickets: (tickets: SupportTicket[]) => void;
  onUpdateChildPanels: (panels: ChildPanel[]) => void;
  onUpdateNotices: (notices: BroadcastNotification[]) => void;
  onApproveDeposit?: (txId: string, adminNote: string, adminUsername?: string) => void;
  onRejectDeposit?: (txId: string, rejectionReason: string, adminUsername?: string) => void;
  onImpersonateUser?: (user: UserAccount) => void;
  onNavigateTab?: (tab: any) => void;
  onLockAdmin?: () => void;
}

export function AdminPanelTab({
  currentUser,
  allUsers,
  orders,
  services,
  transactions,
  tickets,
  childPanels,
  notices,
  systemSettings = DEFAULT_SYSTEM_SETTINGS,
  staffMembers = DEFAULT_STAFF_MEMBERS,
  wholesalerProviders = DEFAULT_WHOLESALER_PROVIDERS,
  passwordResetRequests = DEFAULT_PASSWORD_RESETS,
  initialSection = 'overview',
  onUpdateCurrentUser,
  onUpdateSystemSettings,
  onUpdateStaff,
  onUpdateWholesalerProviders,
  onUpdatePasswordResetRequests,
  onUpdateUsers,
  onUpdateOrders,
  onUpdateServices,
  onUpdateTransactions,
  onUpdateTickets,
  onUpdateChildPanels,
  onUpdateNotices,
  onApproveDeposit,
  onRejectDeposit,
  onImpersonateUser,
  onNavigateTab,
  onLockAdmin
}: AdminPanelTabProps) {
  const [adminSection, setAdminSection] = useState<
    | 'overview'
    | 'users'
    | 'orders'
    | 'deposits'
    | 'payment_gateways'
    | 'qr_gateways'
    | 'wholesaler_api'
    | 'staff'
    | 'services'
    | 'child_panels'
    | 'password_resets'
    | 'tickets'
    | 'live_chat'
    | 'broadcasts'
    | 'email_config'
    | 'cron_setup'
    | 'settings'
    | 'system_upgrade'
  >((initialSection as any) || 'overview');

  useEffect(() => {
    if (initialSection) {
      setAdminSection(initialSection as any);
    }
  }, [initialSection]);

  // Staff Profile & Security Modal state (triggered from left corner profile card)
  const [isStaffProfileModalOpen, setIsStaffProfileModalOpen] = useState(false);

  // 3-Line Menu Drawer States
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  // Live Chat Summary State for Realtime Badges
  const [chatSummary, setChatSummary] = useState(() => getConversationsSummary());

  useEffect(() => {
    const handleChatSync = () => {
      setChatSummary(getConversationsSummary());
    };
    window.addEventListener('smm_live_chat_event', handleChatSync);
    window.addEventListener('storage', handleChatSync);
    return () => {
      window.removeEventListener('smm_live_chat_event', handleChatSync);
      window.removeEventListener('storage', handleChatSync);
    };
  }, []);

  // Staff Maintenance Approval Modal States
  const [isStaffMaintenanceModalOpen, setIsStaffMaintenanceModalOpen] = useState(false);
  const [staffMaintenanceReason, setStaffMaintenanceReason] = useState('');
  const [staffMaintenanceTargetAction, setStaffMaintenanceTargetAction] = useState<'enable' | 'disable'>('enable');

  // Role Checking & Strict RBAC Enforcement
  const isAdminOrManager =
    currentUser.role === 'admin' ||
    currentUser.role === 'superadmin' ||
    currentUser.role === 'manager' ||
    currentUser.role === 'partner' ||
    currentUser.tier === 'Admin';

  const canAccessSection = (section: string): boolean => {
    if (isAdminOrManager) return true;
    if (currentUser.role === 'staff') {
      const perms = currentUser.staffPermissions;
      if (!perms) return section === 'overview';
      switch (section) {
        case 'overview':
          return true;
        case 'orders':
          return !!perms.canManageOrders;
        case 'services':
          return !!perms.canManageServices;
        case 'deposits':
        case 'payment_gateways':
        case 'qr_gateways':
          return !!perms.canApprovePayments || !!perms.canChangeSettings;
        case 'wholesaler_api':
        case 'child_panels':
        case 'cron_setup':
          return !!perms.canConfigureApis || !!perms.canChangeSettings;
        case 'staff':
          return !!perms.canManageStaff;
        case 'users':
        case 'password_resets':
          return !!perms.canManageUsers;
        case 'tickets':
        case 'live_chat':
          return !!perms.canReplyTickets;
        case 'broadcasts':
        case 'email_config':
          return !!perms.canBroadcastAlerts || !!perms.canChangeSettings;
        case 'settings':
        case 'system_upgrade':
          return !!perms.canChangeSettings || isAdminOrManager;
        default:
          return false;
      }
    }
    return true;
  };

  // User Directory Category Sub-tab: 'users' (clients) vs 'staff' (admins/staff) vs 'all'
  const [userCategoryTab, setUserCategoryTab] = useState<'users' | 'staff' | 'all'>('users');

  // Search and filter states
  const [userSearch, setUserSearch] = useState('');
  const [userTierFilter, setUserTierFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');
  const [depositFilter, setDepositFilter] = useState<'all' | 'Pending' | 'Completed' | 'Failed'>('Pending');

  // User Management Modals
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<UserAccount | null>(null);
  const [balanceAdjustType, setBalanceAdjustType] = useState<'credit' | 'debit'>('credit');
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState<number>(500);
  const [balanceAdjustReason, setBalanceAdjustReason] = useState<string>('Manual Admin Credit / Promotion');

  // Service Edit / Add Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<SMMService | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Partial<SMMService>>({
    name: '',
    category: 'Instagram',
    type: 'Followers',
    ratePer1k: 150,
    minQuantity: 50,
    maxQuantity: 50000,
    speed: '10K/Day',
    averageTime: '15 Minutes',
    description: '',
    refill: true,
    refillDays: 30,
    guaranteed: true,
    dripFeedAvailable: true,
    cancelAvailable: false,
    isActive: true,
  });

  // Bulk Price Modal
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [bulkPercent, setBulkPercent] = useState<number>(10);
  const [bulkDirection, setBulkDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkCategory, setBulkCategory] = useState<string>('all');

  // Broadcast Alert Modal
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeFormData, setNoticeFormData] = useState<Partial<BroadcastNotification>>({
    title: '',
    message: '',
    type: 'deal',
  });

  // Ticket Response Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Screenshot proof modal
  const [proofModalUrl, setProofModalUrl] = useState<string | null>(null);
  const [proofModalTx, setProofModalTx] = useState<PaymentTransaction | null>(null);
  const [proofZoom, setProofZoom] = useState<number>(1);
  const [proofRotation, setProofRotation] = useState<number>(0);

  const openProofViewer = (url: string, tx?: PaymentTransaction | null) => {
    setProofModalUrl(url);
    setProofModalTx(tx || null);
    setProofZoom(1);
    setProofRotation(0);
  };
  const [selectedDepositDetails, setSelectedDepositDetails] = useState<PaymentTransaction | null>(null);

  // System Settings state & live sync
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(
    systemSettings || DEFAULT_SYSTEM_SETTINGS
  );

  // Admin Security & Credentials Configuration state
  const [adminSecurityData, setAdminSecurityData] = useState(() => {
    try {
      const stored = localStorage.getItem('smm_nepal_admin_security');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      adminPin: '7788',
      customAdminPassword: '',
      recoveryEmail: 'smmpanelnepal@gmail.com',
    };
  });

  useEffect(() => {
    if (systemSettings) {
      setSettingsForm(systemSettings);
    }
  }, [systemSettings]);

  // Add New User Modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    password: '',
    balance: 0,
    tier: 'Standard' as UserAccount['tier'],
    role: 'user' as UserAccount['role'],
  });

  // Edit Order Modal state
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SMMOrder | null>(null);
  const [orderEditForm, setOrderEditForm] = useState({
    status: 'Pending' as OrderStatus,
    startCount: 0,
    remains: 0,
    link: '',
  });

  // Bulk Order Selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  // Child Panel Admin Management state
  const [isAddChildPanelModalOpen, setIsAddChildPanelModalOpen] = useState(false);
  const [childPanelFormData, setChildPanelFormData] = useState({
    domain: '',
    adminUsername: 'reseller_admin',
    adminPassword: 'Password#2026',
    currency: 'NPR' as 'NPR' | 'USD' | 'INR',
    priceMonthly: 1200,
    profitMarginPercent: 20,
    theme: 'Emerald Nepal Pro',
    status: 'Active' as ChildPanel['status'],
    nameserver1: 'ns1.smmpanelnepal.com',
    nameserver2: 'ns2.smmpanelnepal.com',
  });

  // Global Child Panel Price and Individual Panel Price Editor State
  const [globalChildPanelPrice, setGlobalChildPanelPrice] = useState<number>(
    systemSettings?.childPanelMonthlyPriceNPR ?? 2200
  );
  const [editingChildPanel, setEditingChildPanel] = useState<ChildPanel | null>(null);
  const [editPanelPrice, setEditPanelPrice] = useState<number>(2200);
  const [editPanelMargin, setEditPanelMargin] = useState<number>(20);

  useEffect(() => {
    if (systemSettings?.childPanelMonthlyPriceNPR) {
      setGlobalChildPanelPrice(systemSettings.childPanelMonthlyPriceNPR);
    }
  }, [systemSettings?.childPanelMonthlyPriceNPR]);

  // Password Reset Management state
  const [resetModalData, setResetModalData] = useState<{
    isOpen: boolean;
    request: PasswordResetRequest | null;
    tempPassword: string;
    adminNote: string;
  }>({
    isOpen: false,
    request: null,
    tempPassword: '',
    adminNote: 'Your account password has been reset by the Admin Team.',
  });

  // Success toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handle Child Panel Admin Creation
  const handleCreateChildPanelAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childPanelFormData.domain.trim()) {
      alert('Please provide a valid domain name (e.g., mysmmpanel.com)');
      return;
    }

    const cleanDomain = childPanelFormData.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const now = new Date();
    const renew = new Date();
    renew.setDate(now.getDate() + 30);

    const ns1 = childPanelFormData.nameserver1.trim() || 'ns1.smmpanelnepal.com';
    const ns2 = childPanelFormData.nameserver2.trim() || 'ns2.smmpanelnepal.com';

    const newPanel: ChildPanel = {
      id: `cp_admin_${Date.now()}`,
      userId: currentUser.id,
      domain: cleanDomain,
      currency: childPanelFormData.currency,
      priceMonthly: childPanelFormData.priceMonthly,
      profitMarginPercent: childPanelFormData.profitMarginPercent,
      adminUsername: childPanelFormData.adminUsername.trim() || 'reseller_admin',
      adminPassword: childPanelFormData.adminPassword.trim() || 'Password#2026',
      nameservers: {
        ns1,
        ns2,
      },
      nameserver1: ns1,
      nameserver2: ns2,
      cnameRecord: 'cname.smmpanelnepal.com',
      dnsVerified: true,
      siteTitle: `${cleanDomain.split('.')[0].toUpperCase()} SMM Store`,
      supportContact: currentUser.email || 'support@smmpanelnepal.com',
      status: childPanelFormData.status,
      theme: childPanelFormData.theme,
      createdAt: now.toISOString().split('T')[0],
      renewDate: renew.toISOString().split('T')[0],
      autoRenew: true,
      totalOrdersForwarded: 0,
      totalEarningsNPR: 0,
      syncedServicesCount: services.length,
    };

    onUpdateChildPanels([newPanel, ...childPanels]);
    setIsAddChildPanelModalOpen(false);
    setChildPanelFormData({
      domain: '',
      adminUsername: 'reseller_admin',
      adminPassword: 'Password#2026',
      currency: 'NPR',
      priceMonthly: 1200,
      profitMarginPercent: 20,
      theme: 'Emerald Nepal Pro',
      status: 'Active',
      nameserver1: 'ns1.smmpanelnepal.com',
      nameserver2: 'ns2.smmpanelnepal.com',
    });
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    showToast(`Child panel "${cleanDomain}" created and activated successfully.`);
  };

  // Toggle Child Panel Status
  const handleToggleChildPanelStatus = (panelId: string, currentStatus: ChildPanel['status']) => {
    const nextStatus: ChildPanel['status'] = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const updated = childPanels.map((p) => (p.id === panelId ? { ...p, status: nextStatus } : p));
    onUpdateChildPanels(updated);
    showToast(`Child panel status changed to: ${nextStatus}`);
  };

  // Delete Child Panel
  const handleDeleteChildPanel = (panelId: string, domain: string) => {
    if (!confirm(`Are you sure you want to remove child panel ${domain}? This will disconnect their reseller API connection.`)) return;
    const updated = childPanels.filter((p) => p.id !== panelId);
    onUpdateChildPanels(updated);
    showToast(`Child panel ${domain} deleted.`);
  };

  // Set / Update Default Child Panel Monthly Price
  const handleSaveGlobalChildPanelPrice = (newPrice: number) => {
    const validPrice = Math.max(100, Number(newPrice) || 2200);
    const updatedSettings: SystemSettings = {
      ...settingsForm,
      childPanelMonthlyPriceNPR: validPrice,
    };
    setSettingsForm(updatedSettings);
    onUpdateSystemSettings(updatedSettings);
    try {
      localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updatedSettings));
    } catch (e) {}
    showToast(`Child panel monthly price updated to Rs. ${validPrice.toLocaleString()} NPR / month.`);
  };

  // Save customized pricing for an individual child panel
  const handleSaveIndividualPanelPrice = () => {
    if (!editingChildPanel) return;
    const updatedPanels = childPanels.map((p) =>
      p.id === editingChildPanel.id
        ? { ...p, priceMonthly: Math.max(0, editPanelPrice), profitMarginPercent: Math.max(0, editPanelMargin) }
        : p
    );
    onUpdateChildPanels(updatedPanels);
    try {
      localStorage.setItem('smm_nepal_child_panels', JSON.stringify(updatedPanels));
    } catch (e) {}
    showToast(`Updated pricing for ${editingChildPanel.domain}: Rs. ${editPanelPrice.toLocaleString()} NPR/mo (${editPanelMargin}% margin).`);
    setEditingChildPanel(null);
  };

  // Password Reset Handlers
  const handleOpenResetModal = (req: PasswordResetRequest) => {
    const randomPass = `NepalPass#${Math.floor(1000 + Math.random() * 9000)}`;
    setResetModalData({
      isOpen: true,
      request: req,
      tempPassword: randomPass,
      adminNote: `Password reset by ${currentUser.username}. Temporary password generated.`,
    });
  };

  const handleProcessPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalData.request || !resetModalData.tempPassword.trim()) {
      alert('Please provide a new temporary password.');
      return;
    }

    const targetReq = resetModalData.request;
    const newPass = resetModalData.tempPassword.trim();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Update user password in allUsers
    const updatedUsers = allUsers.map((u) => {
      if (
        (targetReq.userId && u.id === targetReq.userId) ||
        u.email.toLowerCase() === targetReq.email.toLowerCase() ||
        (targetReq.username && u.username.toLowerCase() === targetReq.username.toLowerCase())
      ) {
        return {
          ...u,
          password: newPass,
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);

    // 2. Update reset request status to Resolved
    const updatedRequests = (passwordResetRequests || []).map((r) => {
      if (r.id === targetReq.id) {
        return {
          ...r,
          status: 'Resolved' as const,
          newPasswordProvided: newPass,
          adminNote: resetModalData.adminNote.trim(),
          resolvedBy: currentUser.username,
          resolvedAt: now,
        };
      }
      return r;
    });

    if (onUpdatePasswordResetRequests) {
      onUpdatePasswordResetRequests(updatedRequests);
    } else {
      localStorage.setItem('smm_nepal_password_resets', JSON.stringify(updatedRequests));
    }

    setResetModalData({ isOpen: false, request: null, tempPassword: '', adminNote: '' });
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    showToast(`Password successfully reset for ${targetReq.email}. New credentials stored.`);
  };

  // Platform Metrics
  const metrics = useMemo(() => {
    const totalDeposited = transactions
      .filter((t) => t.status === 'Completed' && (t.type === 'Deposit' || !t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOrdersCharge = orders.reduce((sum, o) => sum + o.charge, 0);
    const pendingDeposits = transactions.filter((t) => t.status === 'Pending');
    const pendingOrders = orders.filter((o) => o.status === 'Pending');
    const openTickets = tickets.filter((t) => t.status === 'Open');
    const totalUserBalance = allUsers.reduce((sum, u) => sum + u.balance, 0);

    return {
      totalDeposited,
      totalOrdersCharge,
      totalOrdersCount: orders.length,
      totalUsersCount: allUsers.length,
      pendingDepositsCount: pendingDeposits.length,
      pendingDepositsAmount: pendingDeposits.reduce((sum, t) => sum + t.amount, 0),
      pendingOrdersCount: pendingOrders.length,
      openTicketsCount: openTickets.length,
      totalUserBalance,
      activeChildPanelsCount: childPanels.filter((c) => c.status === 'Active').length,
    };
  }, [transactions, orders, allUsers, tickets, childPanels]);

  // Handle Balance Adjust
  const handleSaveBalanceAdjustment = () => {
    if (!selectedUserForBalance || balanceAdjustAmount <= 0) return;

    const delta = balanceAdjustType === 'credit' ? balanceAdjustAmount : -balanceAdjustAmount;
    const newBal = Math.max(0, selectedUserForBalance.balance + delta);

    // Update user in users list
    const updatedUsers = allUsers.map((u) => {
      if (u.id === selectedUserForBalance.id) {
        return {
          ...u,
          balance: newBal,
        };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);

    // Record in transactions ledger
    const newTx: PaymentTransaction = {
      id: `tx-admin-${Date.now()}`,
      userId: selectedUserForBalance.id,
      type: balanceAdjustType === 'credit' ? 'Deposit' : 'Debit',
      method: 'Fonepay',
      amount: balanceAdjustAmount,
      currency: 'NPR',
      fee: 0,
      status: 'Completed',
      transactionId: `ADMIN-${Date.now().toString().slice(-6)}`,
      notes: `[Admin Adjustment] ${balanceAdjustReason} (by ${currentUser.username})`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onUpdateTransactions([newTx, ...transactions]);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    showToast(`Successfully ${balanceAdjustType === 'credit' ? 'credited' : 'debited'} Rs. ${balanceAdjustAmount.toLocaleString()} NPR for ${selectedUserForBalance.username}`);
    setSelectedUserForBalance(null);
    setBalanceAdjustAmount(500);
  };

  // Handle User Tier Change
  const handleChangeUserTier = (userId: string, newTier: UserAccount['tier']) => {
    let promotedToStaff = false;
    let demotedToClient = false;
    let targetUsername = '';

    const updated = allUsers.map((u) => {
      if (u.id === userId) {
        targetUsername = u.username;
        let newRole = u.role;
        if (newTier === 'Admin') {
          newRole = 'admin';
          promotedToStaff = true;
        } else if (newTier === 'Staff') {
          newRole = 'staff';
          promotedToStaff = true;
        } else if (u.role === 'admin' || u.role === 'staff') {
          newRole = 'user';
          demotedToClient = true;
        }
        return { ...u, tier: newTier, role: newRole };
      }
      return u;
    });
    onUpdateUsers(updated);

    if (promotedToStaff) {
      setUserCategoryTab('staff');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      showToast(`User @${targetUsername} promoted to ${newTier} and moved to Staff section!`);
    } else if (demotedToClient) {
      setUserCategoryTab('users');
      showToast(`User @${targetUsername} changed to Client (${newTier}) and moved to Users section.`);
    } else {
      showToast(`Updated user tier to ${newTier} (Console permission synchronized)`);
    }
  };

  // 1-Click Helper to Move/Promote User to Staff Directory
  const handleMoveUserToStaff = (user: UserAccount, targetRole: 'staff' | 'admin' = 'staff') => {
    const updated = allUsers.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          role: targetRole,
          tier: targetRole === 'admin' ? ('Admin' as const) : ('Staff' as const),
        };
      }
      return u;
    });
    onUpdateUsers(updated);
    setUserCategoryTab('staff');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(`User @${user.username} promoted to ${targetRole.toUpperCase()} and moved to Staff section.`);
  };

  // 1-Click Helper to Demote Staff to Customer/User Directory
  const handleMoveStaffToUser = (user: UserAccount) => {
    if (user.id === currentUser.id) {
      alert('You cannot demote your own active administrator account.');
      return;
    }
    const updated = allUsers.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          role: 'user' as const,
          tier: 'Standard' as const,
        };
      }
      return u;
    });
    onUpdateUsers(updated);
    setUserCategoryTab('users');
    showToast(`@${user.username} demoted to Customer and moved to Users section.`);
  };

  // Handle Confirm Delete User
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    const target = userToDelete;
    const updated = allUsers.filter((u) => u.id !== target.id);
    onUpdateUsers(updated);
    setUserToDelete(null);
    showToast(`User @${target.username} (${target.email}) permanently deleted.`);
  };

  // Handle User Status Change (Active / Suspended / Banned)
  const handleChangeUserStatus = (userId: string, newStatus: UserAccount['status']) => {
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    onUpdateUsers(updated);
    showToast(`Updated account status to ${newStatus}`);
  };

  // Handle User Role Change (Admin / User)
  const handleChangeUserRole = (userId: string, newRole: 'admin' | 'user') => {
    let targetUsername = '';
    const updated = allUsers.map((u) => {
      if (u.id === userId) {
        targetUsername = u.username;
        const newTier = newRole === 'admin' ? ('Admin' as const) : u.tier === 'Admin' || u.tier === 'Staff' ? ('Standard' as const) : u.tier;
        return { ...u, role: newRole, tier: newTier };
      }
      return u;
    });
    onUpdateUsers(updated);

    if (newRole === 'admin') {
      setUserCategoryTab('staff');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      showToast(`User @${targetUsername} promoted to Admin and moved to Staff section!`);
    } else {
      setUserCategoryTab('users');
      showToast(`User @${targetUsername} role set to Client and moved to Users section.`);
    }
  };

  // Member Full Details & Edit Modal State
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserAccount | null>(null);
  const [userEditForm, setUserEditForm] = useState<Partial<UserAccount>>({});

  useEffect(() => {
    if (selectedUserForDetails) {
      setUserEditForm({
        username: selectedUserForDetails.username,
        email: selectedUserForDetails.email,
        fullName: selectedUserForDetails.fullName || '',
        phone: selectedUserForDetails.phone || '',
        password: selectedUserForDetails.password || '',
        balance: selectedUserForDetails.balance,
        tier: selectedUserForDetails.tier,
        role: selectedUserForDetails.role || 'user',
        status: selectedUserForDetails.status || 'active',
        apiKey: selectedUserForDetails.apiKey || '',
      });
    }
  }, [selectedUserForDetails]);

  const handleSaveUserDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForDetails) return;

    const updatedUsers = allUsers.map((u) => {
      if (u.id === selectedUserForDetails.id) {
        return {
          ...u,
          username: userEditForm.username?.trim() || u.username,
          email: userEditForm.email?.trim() || u.email,
          fullName: userEditForm.fullName?.trim() || u.fullName,
          phone: userEditForm.phone?.trim() || u.phone,
          password: userEditForm.password?.trim() || u.password,
          balance: Number(userEditForm.balance) ?? u.balance,
          tier: userEditForm.tier || u.tier,
          role: userEditForm.role || u.role,
          status: userEditForm.status || u.status,
        };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    setSelectedUserForDetails(null);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    showToast(`Member profile and details updated successfully.`);
  };

  // Handle Order Status Change
  const handleChangeOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    onUpdateOrders(updated);
    showToast(`Order updated to status: ${newStatus}`);
  };

  // Handle 1-Click Order Refund with INSTANT WALLET CREDIT
  const handleRefundOrder = (order: SMMOrder) => {
    if (order.status === 'Refunded' || order.status === 'Canceled') {
      alert('This order is already refunded or canceled.');
      return;
    }

    if (!confirm(`Are you sure you want to refund Rs. ${order.charge.toLocaleString()} NPR for Order #${order.orderId}? Funds will be immediately credited back to the customer's wallet balance.`)) {
      return;
    }

    // Find the specific customer who owns this order
    const targetUser = allUsers.find(
      (u) =>
        (order.userId && u.id === order.userId) ||
        ((order as any).username && u.username.toLowerCase() === (order as any).username.toLowerCase())
    ) || allUsers.find((u) => u.role !== 'admin') || allUsers[0];

    const targetUserId = targetUser?.id;

    // Refund charge strictly to target user's wallet
    const updatedUsers = allUsers.map((u) => {
      if (u.id === targetUserId) {
        return {
          ...u,
          balance: u.balance + order.charge,
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);

    // Update order status to Refunded
    const updatedOrders = orders.map((o) => (o.id === order.id ? { ...o, status: 'Refunded' as OrderStatus, remains: o.quantity } : o));
    onUpdateOrders(updatedOrders);

    // Record Refund in Transactions
    const refundTx: PaymentTransaction = {
      id: `tx-ref-${Date.now()}`,
      type: 'Refund',
      method: 'Wallet Debit',
      amount: order.charge,
      currency: 'NPR',
      fee: 0,
      status: 'Completed',
      transactionId: `REF-${order.orderId}`,
      notes: `Order #${order.orderId} Refund credited to @${targetUser?.username || 'user'}: ${order.serviceName}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    onUpdateTransactions([refundTx, ...transactions]);

    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    showToast(`Order #${order.orderId} refunded instantly. Rs. ${order.charge.toLocaleString()} NPR credited to @${targetUser?.username || 'user'} wallet.`);
  };

  // Deposit Decision Modal State (Approve / Reject with Mandatory Remarks)
  const [depositDecisionModal, setDepositDecisionModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    tx: PaymentTransaction | null;
    note: string;
    error: string;
  }>({
    isOpen: false,
    type: 'approve',
    tx: null,
    note: '',
    error: '',
  });

  const handleOpenDepositDecision = (tx: PaymentTransaction, type: 'approve' | 'reject') => {
    setDepositDecisionModal({
      isOpen: true,
      type,
      tx,
      note: '',
      error: '',
    });
  };

  const handleConfirmDepositDecision = () => {
    const { type, tx, note } = depositDecisionModal;
    if (!tx) return;

    // Use sensible defaults if admin note is empty
    const trimmedNote = note.trim() || (type === 'approve' ? 'Payment slip verified and approved by admin' : 'Payment verification failed / transaction mismatch');

    if (type === 'approve') {
      if (onApproveDeposit) {
        onApproveDeposit(tx.id, trimmedNote, currentUser.username);
      } else {
        const updatedTransactions = transactions.map((t) =>
          t.id === tx.id
            ? {
                ...t,
                status: 'Completed' as const,
                adminNote: trimmedNote,
                reviewedBy: currentUser.username,
                reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              }
            : t
        );
        onUpdateTransactions(updatedTransactions);

        const targetUserId = tx.userId;
        const targetUsername = tx.userUsername || tx.senderName;
        const targetPhone = tx.senderPhone;

        const updatedUsers = allUsers.map((u) => {
          const isMatch =
            (targetUserId && u.id === targetUserId) ||
            (targetUsername && u.username.toLowerCase() === targetUsername.toLowerCase()) ||
            (targetPhone && u.phone === targetPhone);
          if (isMatch) {
            return {
              ...u,
              balance: (Number(u.balance) || 0) + Number(tx.amount),
              totalDeposited: ((u as any).totalDeposited || 0) + Number(tx.amount),
            };
          }
          return u;
        });
        onUpdateUsers(updatedUsers);
      }

      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      showToast(`Deposit of Rs. ${tx.amount.toLocaleString()} NPR Approved! Credited to client's available balance.`);
    } else {
      // Rejection
      if (onRejectDeposit) {
        onRejectDeposit(tx.id, trimmedNote, currentUser.username);
      } else {
        const updatedTransactions = transactions.map((t) =>
          t.id === tx.id
            ? {
                ...t,
                status: 'Failed' as const,
                adminNote: trimmedNote,
                notes: t.notes ? `${t.notes} | Rejected: ${trimmedNote}` : `Rejected: ${trimmedNote}`,
                reviewedBy: currentUser.username,
                reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              }
            : t
        );
        onUpdateTransactions(updatedTransactions);
      }
      showToast(`Deposit request rejected.`);
    }

    if (selectedDepositDetails && (selectedDepositDetails.id === tx.id || selectedDepositDetails.transactionId === tx.transactionId)) {
      setSelectedDepositDetails(null);
    }

    setDepositDecisionModal({ isOpen: false, type: 'approve', tx: null, note: '', error: '' });
  };

  // Handle Service Add / Edit
  const handleSaveService = () => {
    if (!serviceFormData.name || !serviceFormData.ratePer1k) {
      alert('Please provide a service name and rate per 1k.');
      return;
    }

    if (editingService) {
      // Edit existing
      const updated = services.map((s) =>
        s.id === editingService.id
          ? ({
              ...s,
              ...serviceFormData,
              ratePer1k: Number(serviceFormData.ratePer1k),
              minQuantity: Number(serviceFormData.minQuantity || 50),
              maxQuantity: Number(serviceFormData.maxQuantity || 50000),
            } as SMMService)
          : s
      );
      onUpdateServices(updated);
      showToast(`Service "${serviceFormData.name}" updated successfully.`);
    } else {
      // Create new
      const newServiceId = Math.max(...services.map((s) => s.serviceId || 100), 100) + 1;
      const newService: SMMService = {
        id: `srv-${Date.now()}`,
        serviceId: newServiceId,
        name: serviceFormData.name!,
        category: (serviceFormData.category as ServiceCategory) || 'Instagram',
        type: serviceFormData.type || 'Followers',
        ratePer1k: Number(serviceFormData.ratePer1k),
        minQuantity: Number(serviceFormData.minQuantity || 50),
        maxQuantity: Number(serviceFormData.maxQuantity || 50000),
        speed: serviceFormData.speed || '10K/Day',
        averageTime: serviceFormData.averageTime || '15 Minutes',
        description: serviceFormData.description || 'Fast automated delivery node.',
        refill: serviceFormData.refill ?? true,
        refillDays: Number(serviceFormData.refillDays || 30),
        guaranteed: serviceFormData.guaranteed ?? true,
        dripFeedAvailable: serviceFormData.dripFeedAvailable ?? true,
        cancelAvailable: serviceFormData.cancelAvailable ?? false,
        isActive: serviceFormData.isActive ?? true,
      };
      onUpdateServices([newService, ...services]);
      showToast(`New service added: #${newServiceId} ${newService.name}`);
    }

    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  // Handle Delete Service
  const handleDeleteService = (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service from the catalog?')) return;
    const updated = services.filter((s) => s.id !== serviceId);
    onUpdateServices(updated);
    showToast('Service deleted from catalog.');
  };

  // Handle Bulk Price Adjustment
  const handleApplyBulkPrice = () => {
    if (bulkPercent <= 0) return;
    const multiplier = bulkDirection === 'increase' ? 1 + bulkPercent / 100 : 1 - bulkPercent / 100;

    const updated = services.map((s) => {
      if (bulkCategory !== 'all' && s.category !== bulkCategory) {
        return s;
      }
      const newRate = Math.round(s.ratePer1k * multiplier * 10) / 10;
      return {
        ...s,
        ratePer1k: Math.max(1, newRate),
      };
    });

    onUpdateServices(updated);
    setIsBulkPriceModalOpen(false);
    showToast(`Adjusted prices by ${bulkDirection === 'increase' ? '+' : '-'}${bulkPercent}% across ${bulkCategory === 'all' ? 'all categories' : bulkCategory}.`);
  };

  // Handle Save Broadcast Notice
  const handleSaveNotice = () => {
    if (!noticeFormData.title || !noticeFormData.message) {
      alert('Please provide title and message for broadcast.');
      return;
    }

    const newNotice: BroadcastNotification = {
      id: `notice-${Date.now()}`,
      title: noticeFormData.title!,
      message: noticeFormData.message!,
      type: noticeFormData.type || 'deal',
      date: new Date().toISOString().split('T')[0],
    };

    onUpdateNotices([newNotice, ...notices]);
    setIsNoticeModalOpen(false);
    setNoticeFormData({ title: '', message: '', type: 'deal' });
    showToast('Broadcast notice published to user dashboards.');
  };

  // Handle Delete Notice
  const handleDeleteNotice = (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    onUpdateNotices(updated);
    showToast('Broadcast notice removed.');
  };

  // Handle Reply Ticket
  const handleSendTicketReply = () => {
    if (!selectedTicket || !ticketReplyText.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'Answered' as const,
          updatedAt: 'Just now',
          messages: [
            ...t.messages,
            {
              sender: 'support' as const,
              text: ticketReplyText.trim(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
      }
      return t;
    });

    onUpdateTickets(updated);
    setSelectedTicket(null);
    setTicketReplyText('');
    showToast('Ticket reply sent to customer.');
  };

  // Handle Save System Settings (Syncs immediately with user dashboard & local storage)
  const handleSaveSystemSettings = () => {
    if (onUpdateSystemSettings) {
      onUpdateSystemSettings(settingsForm);
    }
    try {
      localStorage.setItem('smm_nepal_system_settings', JSON.stringify(settingsForm));
      localStorage.setItem('smm_nepal_admin_security', JSON.stringify(adminSecurityData));
    } catch (e) {}

    // If custom admin password provided, update admin user password in users list
    if (adminSecurityData.customAdminPassword) {
      const updatedUsers = allUsers.map((u) => {
        if (u.role === 'admin' || u.email === 'smmpanelnepal@gmail.com' || u.username === 'admin') {
          return { ...u, password: adminSecurityData.customAdminPassword };
        }
        return u;
      });
      onUpdateUsers(updatedUsers);
    }

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    showToast('Platform, Gateway & Admin Security settings saved! Live changes synced.');
  };

  // Handle Add New User
  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.username.trim() || !newUserData.email.trim()) {
      alert('Please provide username and email.');
      return;
    }

    const usernameExists = allUsers.some(
      (u) => u.username.toLowerCase() === newUserData.username.trim().toLowerCase()
    );
    if (usernameExists) {
      alert('Username already exists. Please choose a different username.');
      return;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: newUserData.username.trim(),
      email: newUserData.email.trim(),
      fullName: newUserData.fullName.trim() || newUserData.username.trim(),
      phone: newUserData.phone.trim() || '9841000000',
      password: newUserData.password.trim() || 'nepal123',
      balance: Number(newUserData.balance) || 0,
      currency: 'NPR',
      tier: newUserData.tier,
      role: newUserData.role,
      status: 'active',
      apiKey: `smm_live_np_${Math.random().toString(36).substring(2, 12)}`,
      totalSpent: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onUpdateUsers([newUser, ...allUsers]);
    setIsAddUserModalOpen(false);
    setNewUserData({
      username: '',
      email: '',
      fullName: '',
      phone: '',
      password: '',
      balance: 0,
      tier: 'Standard',
      role: 'user',
    });
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    showToast(`User @${newUser.username} registered successfully with Rs. ${newUser.balance} balance.`);
  };

  // Handle Save Order Edit
  const handleSaveOrderEdit = () => {
    if (!editingOrder) return;
    const updated = orders.map((o) =>
      o.id === editingOrder.id
        ? {
            ...o,
            status: orderEditForm.status,
            startCount: Number(orderEditForm.startCount),
            remains: Number(orderEditForm.remains),
            link: orderEditForm.link.trim() || o.link,
          }
        : o
    );
    onUpdateOrders(updated);
    setIsEditOrderModalOpen(false);
    setEditingOrder(null);
    showToast(`Order #${editingOrder.orderId} updated successfully.`);
  };

  // Handle Bulk Order Status Update
  const handleBulkOrderStatus = (targetStatus: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;
    const updated = orders.map((o) =>
      selectedOrderIds.includes(o.orderId) ? { ...o, status: targetStatus } : o
    );
    onUpdateOrders(updated);
    setSelectedOrderIds([]);
    showToast(`Updated ${selectedOrderIds.length} orders to "${targetStatus}".`);
  };

  // Handle Toggle Select Order
  const handleToggleSelectOrder = (orderId: number) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Handle Select All Orders
  const handleSelectAllOrders = (orderList: SMMOrder[]) => {
    if (selectedOrderIds.length === orderList.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orderList.map((o) => o.orderId));
    }
  };

  // User Classification Helper
  const isAccountStaffOrAdmin = (u: UserAccount) => {
    return (
      u.role === 'admin' ||
      u.role === 'superadmin' ||
      u.role === 'manager' ||
      u.role === 'staff' ||
      u.role === 'support_agent' ||
      u.role === 'order_manager' ||
      u.role === 'finance_manager' ||
      u.tier === 'Staff' ||
      u.tier === 'Admin'
    );
  };

  const customerAccountsCount = useMemo(() => {
    return allUsers.filter((u) => !isAccountStaffOrAdmin(u)).length;
  }, [allUsers]);

  const staffAccountsCount = useMemo(() => {
    return allUsers.filter((u) => isAccountStaffOrAdmin(u)).length;
  }, [allUsers]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const isStaff = isAccountStaffOrAdmin(u);
      if (userCategoryTab === 'users' && isStaff) return false;
      if (userCategoryTab === 'staff' && !isStaff) return false;

      if (userTierFilter !== 'all' && u.tier !== userTierFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchU = u.username.toLowerCase().includes(q);
        const matchE = u.email.toLowerCase().includes(q);
        const matchN = (u.fullName || '').toLowerCase().includes(q);
        const matchP = (u.phone || '').includes(q);
        if (!matchU && !matchE && !matchN && !matchP) return false;
      }
      return true;
    });
  }, [allUsers, userSearch, userTierFilter, userCategoryTab]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchId = String(o.orderId).includes(q);
        const matchSrv = o.serviceName.toLowerCase().includes(q);
        const matchL = o.link.toLowerCase().includes(q);
        if (!matchId && !matchSrv && !matchL) return false;
      }
      return true;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (serviceCategoryFilter !== 'all' && s.category !== serviceCategoryFilter) return false;
      if (serviceSearch.trim()) {
        const q = serviceSearch.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchId = String(s.serviceId).includes(q);
        if (!matchName && !matchId) return false;
      }
      return true;
    });
  }, [services, serviceSearch, serviceCategoryFilter]);

  // Filtered Deposits
  const filteredDeposits = useMemo(() => {
    return transactions.filter((t) => {
      const isDepositType = t.type === 'Deposit' || (!t.type && t.method !== 'Wallet Debit' && t.method !== 'Child Panel Hosting');
      if (!isDepositType) return false;
      if (depositFilter !== 'all' && t.status !== depositFilter) return false;
      return true;
    });
  }, [transactions, depositFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-neutral-950 font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in slide-in-from-top duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Panel Top Navigation Header */}
      <div className="bg-neutral-900/95 border border-neutral-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo & Clickable Logged-in Staff/Admin Profile Identity Card */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="h-11 w-11 rounded-2xl bg-neutral-950 border border-neutral-800 p-1 flex items-center justify-center shrink-0 shadow-inner">
            {settingsForm.adminPanelLogoUrl || settingsForm.siteLogoUrl ? (
              <img
                src={settingsForm.adminPanelLogoUrl || settingsForm.siteLogoUrl}
                alt={settingsForm.adminPanelName || 'Admin'}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="h-full w-full rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Clickable Profile Card Button */}
          <button
            id="admin-staff-profile-btn"
            type="button"
            onClick={() => setIsStaffProfileModalOpen(true)}
            className="text-left group flex items-center gap-2.5 p-1.5 -m-1.5 rounded-2xl hover:bg-neutral-800/60 border border-transparent hover:border-neutral-700/60 transition cursor-pointer"
            title="Click to view staff profile, change password/master key, and edit details"
          >
            {/* Staff Profile Picture */}
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-xl bg-neutral-950 border border-red-500/40 p-0.5 shadow-md flex items-center justify-center overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName || currentUser.username}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-red-600 to-rose-500 rounded-lg flex items-center justify-center text-xs font-black text-white">
                    {(currentUser.username || 'AD').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-neutral-900 animate-pulse"></span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider truncate group-hover:text-red-400 transition-colors">
                  {settingsForm.adminPanelName || 'Admin Console'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-white tracking-tight truncate group-hover:text-red-300 transition-colors">
                  {currentUser.fullName || currentUser.username}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300 uppercase shrink-0">
                  {currentUser.role || 'Staff'}
                </span>
                {currentUser.username && (
                  <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline truncate">
                    @{currentUser.username}
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Right Side: Quick System Upgrade & 3-Line Navigation Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="admin-system-upgrade-quick-btn"
            type="button"
            onClick={() => setAdminSection('system_upgrade')}
            className={`px-3.5 py-2.5 rounded-2xl border transition shadow-lg flex items-center gap-2 cursor-pointer text-xs font-bold ${
              adminSection === 'system_upgrade'
                ? 'bg-red-600 border-red-500 text-white ring-2 ring-red-500/30'
                : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-800 hover:border-neutral-700'
            }`}
            title="System Upgrade & Migration (Preserves all existing users & funds)"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Upgrade System</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono hidden md:inline">
              Zero-Loss
            </span>
          </button>

          <button
            id="admin-three-line-nav-button"
            type="button"
            onClick={() => setIsMenuDrawerOpen(true)}
            className="p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-neutral-600 transition shadow-lg flex items-center justify-center cursor-pointer group"
            title="Open All Admin Services (3-Line Menu)"
            aria-label="Admin Navigation Menu"
          >
            <div className="flex flex-col justify-center gap-1.5 w-5">
              <span className="h-0.5 w-full bg-white rounded-full transition group-hover:bg-red-400"></span>
              <span className="h-0.5 w-full bg-white rounded-full transition group-hover:bg-red-400"></span>
              <span className="h-0.5 w-full bg-white rounded-full transition group-hover:bg-red-400"></span>
            </div>
          </button>
        </div>
      </div>

        {/* =========================================================================
            ADMIN SERVICES THREE-LINE (≡) MENU & NAVIGATION SYSTEM
           ========================================================================= */}
        {(() => {
          const servicesCatalog = [
            {
              id: 'overview',
              label: 'Dashboard & Telemetry',
              category: 'core' as const,
              categoryLabel: 'Core Operations',
              icon: TrendingUp,
              badge: null,
              description: 'System revenue analytics, active orders metrics, and telemetry overview.',
            },
            {
              id: 'orders',
              label: 'Orders Master',
              category: 'core' as const,
              categoryLabel: 'Core Operations',
              icon: ShoppingCart,
              badge: orders.length,
              description: 'Search, filter, refund, restart, and update all user client orders.',
            },
            {
              id: 'services',
              label: 'Services Catalog',
              category: 'core' as const,
              categoryLabel: 'Core Operations',
              icon: List,
              badge: services.length,
              description: 'Manage Nepal & global SMM services, rates per 1,000, and API links.',
            },
            {
              id: 'payment_gateways',
              label: 'Payment Gateway & QR',
              category: 'finance' as const,
              categoryLabel: 'Financial & Gateway',
              icon: CreditCard,
              badge: null,
              description: 'Configure Fonepay QR, eSewa, Khalti, ConnectIPS, and USDT gateways.',
            },
            {
              id: 'deposits',
              label: 'Deposit Approvals',
              category: 'finance' as const,
              categoryLabel: 'Financial & Gateway',
              icon: Receipt,
              badge: metrics.pendingDepositsCount > 0 ? metrics.pendingDepositsCount : null,
              description: 'Verify screenshot slips, match transaction IDs, and credit balances.',
            },
            {
              id: 'live_chat',
              label: 'Live Chat Support Desk',
              category: 'support' as const,
              categoryLabel: 'Customer Support',
              icon: MessageSquare,
              badge: chatSummary.totalUnread > 0 ? chatSummary.totalUnread : null,
              description: 'Live real-time messaging with visitors and registered customers.',
            },
            {
              id: 'tickets',
              label: 'Support Desk Tickets',
              category: 'support' as const,
              categoryLabel: 'Customer Support',
              icon: MessageSquare,
              badge: metrics.openTicketsCount > 0 ? metrics.openTicketsCount : null,
              description: 'Manage customer support tickets, replies, and issue resolution.',
            },
            {
              id: 'users',
              label: 'User Directory',
              category: 'support' as const,
              categoryLabel: 'Customer Support',
              icon: Users,
              badge: allUsers.length,
              description: 'Click member name for full profile, adjust balances, tiers, and passwords.',
            },
            {
              id: 'password_resets',
              label: 'Password Resets',
              category: 'support' as const,
              categoryLabel: 'Customer Support',
              icon: Key,
              badge:
                (passwordResetRequests || []).filter((r) => r.status === 'Pending').length > 0
                  ? (passwordResetRequests || []).filter((r) => r.status === 'Pending').length
                  : null,
              description: 'Review forgot-password requests and issue temporary secure passwords.',
            },
            {
              id: 'broadcasts',
              label: 'Broadcasts & Notices',
              category: 'support' as const,
              categoryLabel: 'Customer Support',
              icon: Bell,
              badge: notices.length,
              description: 'Publish platform alerts, maintenance banners, and ticker updates.',
            },
            {
              id: 'staff',
              label: 'Staff & Team Management',
              category: 'system' as const,
              categoryLabel: 'Team & Security',
              icon: Briefcase,
              badge: staffMembers.length,
              description: 'Hire staff, configure distinct mastercodes/passwords, and set granular RBAC.',
            },
            {
              id: 'wholesaler_api',
              label: 'Wholesaler Provider APIs',
              category: 'reseller' as const,
              categoryLabel: 'API & Reseller',
              icon: Globe,
              badge: wholesalerProviders.length,
              description: 'Connect external wholesale SMM providers, test keys, and sync balance.',
            },
            {
              id: 'child_panels',
              label: 'Reseller Child Panels',
              category: 'reseller' as const,
              categoryLabel: 'API & Reseller',
              icon: Server,
              badge: childPanels.length,
              description: 'Provision white-label reseller domains, nameservers, and profit margins.',
            },
            {
              id: 'email_config',
              label: 'Email Configuration & Dispatcher',
              category: 'support' as const,
              categoryLabel: 'Customer Support',
              icon: Mail,
              badge: null,
              description: 'Configure SMTP credentials, test delivery, and compose broadcasts or direct messages to users.',
            },
            {
              id: 'cron_setup',
              label: 'Cron Setup & Automation',
              category: 'system' as const,
              categoryLabel: 'Team & Security',
              icon: Clock,
              badge: null,
              description: 'Manage background cron tasks, execute sync jobs manually, and inspect logs.',
            },
            {
              id: 'settings',
              label: 'Platform & Branding Settings',
              category: 'system' as const,
              categoryLabel: 'Team & Security',
              icon: Settings,
              badge: null,
              description: 'Admin panel name & logo, website branding, announcement ticker, and maintenance mode.',
            },
            {
              id: 'system_upgrade',
              label: 'System Upgrade & Code Installer',
              category: 'system' as const,
              categoryLabel: 'Team & Security',
              icon: Sparkles,
              badge: 'Zero-Loss',
              description: 'Deploy code upgrades and system revisions with 100% preservation of all existing users, balances, and orders.',
            },
          ];

          const totalPendingBadges =
            (metrics.pendingDepositsCount || 0) +
            (metrics.openTicketsCount || 0) +
            (chatSummary?.totalUnread || 0) +
            ((passwordResetRequests || []).filter((r) => r.status === 'Pending').length || 0) +
            (settingsForm.maintenanceApprovalRequest ? 1 : 0);

          const activeMeta = servicesCatalog.find((s) => s.id === adminSection) || servicesCatalog[0];
          const ActiveIcon = activeMeta.icon;

          return (
            <>
              {/* THREE-LINE SERVICES DRAWER MODAL */}
              {isMenuDrawerOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
                    {/* Drawer Header */}
                    <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between gap-4 bg-neutral-950/70">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                          <Menu className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                            <span>Admin Console Options</span>
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold">
                              16 Services
                            </span>
                          </h2>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMenuDrawerOpen(false)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 cursor-pointer transition"
                        title="Close 3-line menu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Options Box: 2 Options in One Line (2 Columns) */}
                    <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-inner">
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                          {servicesCatalog.map((service) => {
                            const permitted = canAccessSection(service.id);
                            const isActive = adminSection === service.id;
                            const Icon = service.icon;

                            return (
                              <button
                                key={service.id}
                                type="button"
                                disabled={!permitted}
                                onClick={() => {
                                  if (permitted) {
                                    setAdminSection(service.id as any);
                                    setIsMenuDrawerOpen(false);
                                  }
                                }}
                                className={`text-left px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2.5 ${
                                  !permitted
                                    ? 'bg-neutral-900/30 border-neutral-800/40 opacity-40 cursor-not-allowed text-neutral-500'
                                    : isActive
                                    ? 'bg-gradient-to-r from-red-950/70 to-neutral-900 border-red-500 shadow-md shadow-red-500/10 text-white cursor-pointer ring-1 ring-red-500/30'
                                    : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${
                                      isActive
                                        ? 'bg-red-500 text-white shadow-sm'
                                        : 'bg-neutral-950 text-red-400 border border-neutral-800'
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-bold truncate">
                                    {service.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {Boolean(service.badge) && (typeof service.badge === 'number' ? service.badge > 0 : true) && (
                                    <span className="bg-amber-400 text-neutral-950 text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full shadow-sm">
                                      {service.badge}
                                    </span>
                                  )}
                                  {!permitted && (
                                    <Lock className="w-3.5 h-3.5 text-amber-500/80" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <span>Current Session:</span>
                        <span className="text-white font-mono font-bold">@{currentUser.username}</span>
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px] uppercase">
                          {currentUser.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {onLockAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsMenuDrawerOpen(false);
                              onLockAdmin();
                            }}
                            className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-500/40 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                            title="Logout and lock admin panel"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Logout and Lock</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsMenuDrawerOpen(false)}
                          className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}

      {/* PENDING STAFF MAINTENANCE APPROVAL BANNER (FOR ADMIN / MANAGER) */}
      {settingsForm.maintenanceApprovalRequest && isAdminOrManager && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-neutral-900 to-red-950/70 border border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Pending Staff Maintenance Mode Request
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {settingsForm.maintenanceApprovalRequest.requestedAt}
                </span>
              </div>
              <p className="text-xs text-neutral-200 mt-0.5">
                Staff member <strong>@{settingsForm.maintenanceApprovalRequest.requestedBy}</strong> requested to{' '}
                <strong
                  className={
                    settingsForm.maintenanceApprovalRequest.action === 'enable'
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }
                >
                  {settingsForm.maintenanceApprovalRequest.action === 'enable'
                    ? 'TURN ON MAINTENANCE MODE'
                    : 'TURN OFF MAINTENANCE MODE'}
                </strong>
                . Reason: <em>"{settingsForm.maintenanceApprovalRequest.reason}"</em>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const newMode = settingsForm.maintenanceApprovalRequest?.action === 'enable';
                const updated = {
                  ...settingsForm,
                  maintenanceMode: newMode,
                  maintenanceApprovalRequest: null,
                };
                setSettingsForm(updated);
                if (onUpdateSystemSettings) onUpdateSystemSettings(updated);
                try {
                  localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updated));
                } catch (err) {}
                showToast(
                  newMode
                    ? 'Maintenance Mode Approved & Activated! Website is now under maintenance.'
                    : 'Maintenance Mode Disabled! Website is back live online.'
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Apply</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const updated = {
                  ...settingsForm,
                  maintenanceApprovalRequest: null,
                };
                setSettingsForm(updated);
                if (onUpdateSystemSettings) onUpdateSystemSettings(updated);
                try {
                  localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updated));
                } catch (err) {}
                showToast('Staff maintenance request rejected.');
              }}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* RBAC ACCESS CHECK: IF STAFF DOES NOT HAVE ACCESS TO THIS TAB */}
      {!canAccessSection(adminSection) ? (
        <div className="bg-neutral-900/90 border border-red-500/30 rounded-3xl p-10 text-center space-y-4 shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Access Restricted</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
              Your staff account (@{currentUser.username}) does not have permission to access the{' '}
              <strong>{adminSection.toUpperCase()}</strong> service. Please contact a Superadmin, Manager, or Partner to grant you access.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsMenuDrawerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs cursor-pointer shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              <Menu className="w-4 h-4" />
              <span>Open 3-Line Menu</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminSection('overview')}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>

      {/* SECTION 1: OVERVIEW & TELEMETRY */}
      {adminSection === 'overview' && (
        <div className="space-y-6">
          {/* Main KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Deposited Turnover */}
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold">Total Verified Turnover</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-mono font-black text-white">
                Rs. {metrics.totalDeposited.toLocaleString()}{' '}
                <span className="text-xs text-emerald-400 font-normal font-mono">NPR</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-neutral-800 text-neutral-400">
                <span>Total Orders Value</span>
                <span className="text-white font-mono">Rs. {metrics.totalOrdersCharge.toLocaleString()}</span>
              </div>
            </div>

            {/* Total User Funds Card */}
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold">Total User Funds</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-mono font-black text-emerald-400">
                Rs. {(allUsers || []).reduce((sum, u) => sum + (u.balance || 0), 0).toLocaleString()}{' '}
                <span className="text-xs text-emerald-400 font-normal font-mono">NPR</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-neutral-800 text-neutral-400">
                <span>Active Member Accounts</span>
                <span className="text-white font-mono">{(allUsers || []).length} Users</span>
              </div>
            </div>

            {/* Total System Users & Balances */}
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold">Registered Clients</span>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-mono font-black text-white">
                {metrics.totalUsersCount}{' '}
                <span className="text-xs text-neutral-400 font-normal font-mono">Accounts</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-neutral-800 text-neutral-400">
                <span>Combined Client Balance</span>
                <span className="text-blue-400 font-mono font-bold">Rs. {metrics.totalUserBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Orders Statistics */}
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold">Total Orders Processed</span>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-mono font-black text-white">
                {metrics.totalOrdersCount}{' '}
                <span className="text-xs text-neutral-400 font-normal font-mono">Orders</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-neutral-800 text-neutral-400">
                <span>Pending Dispatch</span>
                <span className={`font-mono font-bold ${metrics.pendingOrdersCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {metrics.pendingOrdersCount} In Queue
                </span>
              </div>
            </div>

            {/* Pending Approvals Required */}
            <div className={`rounded-2xl p-5 shadow-xl border transition ${
              metrics.pendingDepositsCount > 0
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-neutral-900/90 border-neutral-800/90'
            }`}>
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold">Deposit Approvals Needed</span>
                <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${
                  metrics.pendingDepositsCount > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-mono font-black ${metrics.pendingDepositsCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                {metrics.pendingDepositsCount}{' '}
                <span className="text-xs font-normal font-mono text-neutral-400">Pending</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-neutral-800 text-neutral-400">
                <span>Value to Verify</span>
                <span className="text-amber-400 font-mono font-bold">Rs. {metrics.pendingDepositsAmount.toLocaleString()} NPR</span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Analytics Visualization Component */}
          <AdminDashboardCharts
            users={allUsers}
            orders={orders}
            transactions={transactions}
            services={services}
          />

          {/* Quick Overview Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Overview */}
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Latest Orders</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminSection('orders')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                >
                  View All ({orders.length}) →
                </button>
              </div>

              <div className="space-y-2.5">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 truncate">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="font-mono text-neutral-400">#{o.orderId}</span>
                        <span className="truncate">{o.serviceName}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono truncate">
                        {o.quantity.toLocaleString()} Qty • Rs. {o.charge.toLocaleString()} NPR • {o.link}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      o.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : o.status === 'In progress'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Deposits Overview */}
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Pending Deposits Queue</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminSection('deposits')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  View Desk →
                </button>
              </div>

              {transactions.filter((t) => t.status === 'Pending').length === 0 ? (
                <div className="p-8 text-center bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <div className="text-xs font-bold text-white">All Deposits Verified</div>
                  <div className="text-[11px] text-neutral-400">There are no pending payments awaiting review.</div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {transactions.filter((t) => t.status === 'Pending').slice(0, 5).map((t) => {
                    const proofUrl = t.screenshotUrl || generateSampleProofReceipt(t);
                    return (
                      <div key={t.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            onClick={() => openProofViewer(proofUrl, t)}
                            className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0 cursor-pointer group relative hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 transition duration-150"
                            title="Click to view full payment proof slip"
                          >
                            <img
                              src={proofUrl}
                              alt="Proof"
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">
                              {t.method} • <span className="text-emerald-400 font-mono">Rs. {t.amount.toLocaleString()}</span>
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono truncate">
                              Ref: {t.transactionId || t.id} • {t.date}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openProofViewer(proofUrl, t)}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-bold text-neutral-200 hover:text-white border border-neutral-700 flex items-center gap-1 cursor-pointer"
                            title="Inspect payment proof"
                          >
                            <ImageIcon className="w-3 h-3 text-emerald-400" />
                            <span>Proof</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDepositDecision(t, 'approve')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-[11px] cursor-pointer shadow-md"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: USER MANAGEMENT */}
      {adminSection === 'users' && (
        <div className="space-y-4">
          {/* Top Category Tabs: Users vs Staff vs All */}
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-2 shadow-xl flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setUserCategoryTab('users')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  userCategoryTab === 'users'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Users / Clients</span>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                  {customerAccountsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserCategoryTab('staff')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  userCategoryTab === 'staff'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff & Admins</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                  {staffAccountsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserCategoryTab('all')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  userCategoryTab === 'all'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>All</span>
                <span className="px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono text-[10px]">
                  {allUsers.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 pr-2">
              <span className="hidden sm:inline">
                {userCategoryTab === 'users'
                  ? 'Showing active customer accounts'
                  : userCategoryTab === 'staff'
                  ? 'Showing accounts with Staff or Admin console privileges'
                  : 'Showing all registered accounts'}
              </span>
            </div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={`Search ${userCategoryTab === 'users' ? 'customers' : userCategoryTab === 'staff' ? 'staff members' : 'accounts'} by username, email, phone, or name...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Tier Filter */}
              <select
                value={userTierFilter}
                onChange={(e) => setUserTierFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-red-500 font-semibold"
              >
                <option value="all">All Account Tiers</option>
                <option value="Standard">Standard</option>
                <option value="Reseller">Reseller (5% Off)</option>
                <option value="VIP">VIP (10% Off)</option>
                <option value="Wholesale">Wholesale (15% Off)</option>
                <option value="Staff">Staff (Console Access)</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>

              {/* Add User Button */}
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Account Tier & Role</th>
                    <th className="py-3 px-4">Current Balance</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-500 text-xs">
                        No accounts found in this section matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u.id === currentUser.id;
                      const isStaffMember = isAccountStaffOrAdmin(u);
                      return (
                        <tr key={u.id} className="hover:bg-neutral-950/50 transition">
                          {/* User Details */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => setSelectedUserForDetails(u)}
                              className="font-bold text-white hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5 text-left group"
                              title="Click to view full member details & edit"
                            >
                              <span className="group-hover:underline">{u.username}</span>
                              {(u.tier === 'Admin' || u.role === 'admin') && (
                                <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[9px] font-mono font-bold">
                                  ADMIN
                                </span>
                              )}
                              {u.tier === 'Staff' && u.role !== 'admin' && (
                                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[9px] font-mono font-bold">
                                  STAFF
                                </span>
                              )}
                              {!isStaffMember && (
                                <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[9px] font-mono">
                                  CLIENT
                                </span>
                              )}
                            </button>
                            <div className="text-[11px] text-neutral-400">{u.email}</div>
                            {u.phone && <div className="text-[10px] text-neutral-500 font-mono">📱 {u.phone}</div>}
                          </td>

                          {/* Tier & Role */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <select
                                value={u.tier}
                                onChange={(e) => handleChangeUserTier(u.id, e.target.value as any)}
                                className="px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-white font-semibold focus:outline-none focus:border-red-500"
                              >
                                <option value="Standard">Standard</option>
                                <option value="Reseller">Reseller (5% Off)</option>
                                <option value="VIP">VIP (10% Off)</option>
                                <option value="Wholesale">Wholesale (15% Off)</option>
                                <option value="Staff">Staff</option>
                                <option value="Admin">Admin</option>
                              </select>

                              <select
                                value={u.role || 'user'}
                                onChange={(e) => handleChangeUserRole(u.id, e.target.value as any)}
                                className="px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 font-semibold focus:outline-none"
                              >
                                <option value="user">Client</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </td>

                          {/* Balance */}
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                            Rs. {u.balance.toLocaleString()} NPR
                          </td>

                          {/* Spent */}
                          <td className="py-3.5 px-4 font-mono text-neutral-300">
                            Rs. {u.totalSpent.toLocaleString()} NPR
                            <div className="text-[10px] text-neutral-500">{u.totalOrders || 0} Orders</div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <select
                              value={u.status || 'active'}
                              onChange={(e) => handleChangeUserStatus(u.id, e.target.value as any)}
                              className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${
                                u.status === 'banned'
                                  ? 'bg-red-950/40 text-red-400 border-red-500/40'
                                  : u.status === 'suspended'
                                  ? 'bg-amber-950/40 text-amber-400 border-amber-500/40'
                                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                              }`}
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                              <option value="banned">Banned</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Quick Move to Staff / Move to Users Button */}
                              {!isSelf && !isStaffMember && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveUserToStaff(u, 'staff')}
                                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                  title="Promote and move user to Staff directory"
                                >
                                  <Briefcase className="w-3 h-3" />
                                  <span>Move to Staff</span>
                                </button>
                              )}

                              {!isSelf && isStaffMember && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStaffToUser(u)}
                                  className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                  title="Demote and move back to Users directory"
                                >
                                  <Users className="w-3 h-3" />
                                  <span>Move to Users</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedUserForDetails(u)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-indigo-500/30"
                                title="View Full Details & Edit Member"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForBalance(u);
                                  setBalanceAdjustType('credit');
                                  setBalanceAdjustAmount(500);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="Adjust User Balance"
                              >
                                <Wallet className="w-3 h-3" />
                                <span>Balance</span>
                              </button>

                              {onImpersonateUser && !isSelf && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onImpersonateUser(u);
                                    showToast(`Logged in as client: ${u.username}`);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] cursor-pointer"
                                  title="Login as this user"
                                >
                                  View As
                                </button>
                              )}

                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(u)}
                                  className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-white border border-red-500/30 text-[11px] font-bold cursor-pointer transition"
                                  title={`Delete User @${u.username}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ORDERS MASTER DESK */}
      {adminSection === 'orders' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders by ID, Service name, target URL link..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-red-500"
            >
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In progress">In progress</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Partial">Partial</option>
              <option value="Canceled">Canceled</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Bulk Operations Bar */}
          {selectedOrderIds.length > 0 && (
            <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs text-white">
                <span className="bg-red-500 text-white font-mono font-bold px-2 py-0.5 rounded-md text-[11px]">
                  {selectedOrderIds.length} Selected
                </span>
                <span className="text-neutral-400">Bulk Actions:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleBulkOrderStatus('In progress')}
                  className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-neutral-950 font-bold text-[11px]"
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkOrderStatus('Completed')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px]"
                >
                  Mark Completed
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkOrderStatus('Canceled')}
                  className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-[11px]"
                >
                  Mark Canceled
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderIds([])}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-[11px]"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                        onChange={() => handleSelectAllOrders(filteredOrders)}
                        className="rounded bg-neutral-900 border-neutral-700 text-red-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Service & Target Link</th>
                    <th className="py-3 px-4">Qty & Charge</th>
                    <th className="py-3 px-4">Live Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-950/50 transition">
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(o.orderId)}
                          onChange={() => handleToggleSelectOrder(o.orderId)}
                          className="rounded bg-neutral-900 border-neutral-700 text-red-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-white">#{o.orderId}</div>
                        <div className="text-[10px] text-neutral-500">{o.createdAt}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-white truncate">{o.serviceName}</div>
                        <a
                          href={o.link.startsWith('http') ? o.link : `https://${o.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-400 hover:underline font-mono truncate block max-w-xs"
                        >
                          {o.link}
                        </a>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-white">{o.quantity.toLocaleString()} Qty</div>
                        <div className="text-emerald-400 font-bold">Rs. {o.charge.toLocaleString()} NPR</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleChangeOrderStatus(o.id, e.target.value as OrderStatus)}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-bold focus:outline-none ${
                            o.status === 'Completed'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                              : o.status === 'In progress'
                              ? 'bg-blue-950/40 text-blue-400 border-blue-500/40'
                              : o.status === 'Refunded' || o.status === 'Canceled'
                              ? 'bg-red-950/40 text-red-400 border-red-500/40'
                              : 'bg-amber-950/40 text-amber-400 border-amber-500/40'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In progress">In progress</option>
                          <option value="Processing">Processing</option>
                          <option value="Completed">Completed</option>
                          <option value="Partial">Partial</option>
                          <option value="Canceled">Canceled</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrder(o);
                              setOrderEditForm({
                                status: o.status,
                                startCount: o.startCount || 0,
                                remains: o.remains || 0,
                                link: o.link,
                              });
                              setIsEditOrderModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Edit Order Parameters"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {o.status !== 'Refunded' && o.status !== 'Canceled' && (
                            <button
                              type="button"
                              onClick={() => handleRefundOrder(o)}
                              className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-[11px] font-bold transition cursor-pointer"
                              title="Cancel Order & Refund Balance"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PAYMENT DEPOSITS & QR DESK */}
      {adminSection === 'deposits' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Manual Nepal QR & Gateway Deposit Requests</h2>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'Pending', 'Completed', 'Failed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setDepositFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    depositFilter === st
                      ? 'bg-emerald-500 text-neutral-950 font-black'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {st === 'all' ? 'All Requests' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Transaction Code & Gateway</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-center">Payment Proof Slip</th>
                    <th className="py-3 px-4">Sender Information</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        No deposit transactions found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredDeposits.map((tx) => {
                      const isPending = tx.status === 'Pending';
                      const proofUrl = tx.screenshotUrl || generateSampleProofReceipt(tx);
                      return (
                        <tr key={tx.id} className="hover:bg-neutral-950/50 transition">
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-white">{tx.transactionId || tx.id}</div>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold">
                              {tx.method}
                            </span>
                            {tx.notes && <div className="text-[11px] text-neutral-400 font-sans mt-0.5">{tx.notes}</div>}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-black text-sm text-emerald-400">
                            Rs. {tx.amount.toLocaleString()} NPR
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {tx.screenshotUrl ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <div
                                  onClick={() => openProofViewer(tx.screenshotUrl!, tx)}
                                  className="w-14 h-14 rounded-xl overflow-hidden border border-neutral-700/80 bg-neutral-950 relative group cursor-pointer shadow-md hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/30 transition duration-150 shrink-0"
                                  title="Click to view full payment slip"
                                >
                                  <img
                                    src={tx.screenshotUrl}
                                    alt="Payment Proof"
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <Eye className="w-4 h-4 text-emerald-400" />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openProofViewer(tx.screenshotUrl!, tx)}
                                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>Inspect</span>
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openProofViewer(proofUrl, tx)}
                                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer border border-neutral-700"
                                  title="Inspect payment voucher slip"
                                >
                                  <FileText className="w-3 h-3 text-emerald-400" />
                                  <span>Voucher</span>
                                </button>
                                <span className="text-[9px] text-neutral-500">Auto Slip</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-neutral-200">{tx.senderName || 'Client'}</div>
                            {tx.senderPhone && (
                              <div className="text-[11px] text-neutral-400 font-mono">📱 {tx.senderPhone}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-neutral-400">
                            {tx.date}
                          </td>

                          <td className="py-3.5 px-4">
                            {isPending ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                Pending Review
                              </span>
                            ) : tx.status === 'Completed' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Completed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                Failed
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setSelectedDepositDetails(tx)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                type="button"
                                onClick={() => openProofViewer(proofUrl, tx)}
                                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                              >
                                <ImageIcon className="w-3 h-3 text-emerald-400" />
                                <span>Proof</span>
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDepositDecision(tx, 'approve')}
                                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-[11px] cursor-pointer shadow-md"
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDepositDecision(tx, 'reject')}
                                    className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-[11px] font-bold cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: SERVICES CATALOG & PRICING */}
      {adminSection === 'services' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search services by ID or name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={serviceCategoryFilter}
                onChange={(e) => setServiceCategoryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-red-500"
              >
                <option value="all">All Categories</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
                <option value="Telegram">Telegram</option>
                <option value="X (Twitter)">X (Twitter)</option>
              </select>

              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>Bulk Price %</span>
              </button>
            </div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">ID & Category</th>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Rate / 1k (NPR)</th>
                    <th className="py-3 px-4">Min / Max</th>
                    <th className="py-3 px-4">Refill Guarantee</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredServices.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-950/50 transition">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-white">#{s.serviceId}</span>
                        <div className="text-[10px] text-neutral-400 font-sans">{s.category}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-white truncate">{s.name}</div>
                        <div className="text-[11px] text-neutral-400 truncate">{s.speed} • {s.averageTime}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                        Rs. {s.ratePer1k} NPR
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        {s.minQuantity.toLocaleString()} / {s.maxQuantity.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        {s.refill ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            {s.refillDays || 30} Days Refill
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px]">
                            No Refill
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingService(s);
                              setServiceFormData({ ...s });
                              setIsServiceModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                            title="Edit Service"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(s.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: CHILD PANELS */}
      {adminSection === 'child_panels' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Reseller Child Panels ({childPanels.length})</h3>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                  Multi-Tenant White-Label
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Deploy white-label SMM portals for partners and resellers connected to our main Nepal node with custom profit margins.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddChildPanelModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Child Panel</span>
            </button>
          </div>

          {/* Child Panel Global Monthly Rental Price Card */}
          <div className="bg-neutral-900/90 border border-indigo-500/40 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Default Child Panel Rental Price</h4>
                  <p className="text-xs text-neutral-400">Set the default monthly subscription fee charged to users renting child panels.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-xs">Rs.</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={globalChildPanelPrice}
                    onChange={(e) => setGlobalChildPanelPrice(Number(e.target.value) || 0)}
                    className="pl-9 pr-3 py-2 w-36 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveGlobalChildPanelPrice(globalChildPanelPrice)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Save Price
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/80 text-xs">
              <span className="text-neutral-400 text-[11px]">Quick Price Presets:</span>
              {[1500, 1800, 2000, 2200, 2500, 3000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setGlobalChildPanelPrice(preset);
                    handleSaveGlobalChildPanelPrice(preset);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
                    globalChildPanelPrice === preset
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  Rs. {preset.toLocaleString()}
                </button>
              ))}
              <span className="text-emerald-400 font-mono text-[11px] ml-auto">
                Current Active: Rs. {(systemSettings?.childPanelMonthlyPriceNPR || 2200).toLocaleString()} NPR / month
              </span>
            </div>
          </div>

          {childPanels.length === 0 ? (
            <div className="p-12 text-center bg-neutral-900/90 rounded-2xl border border-neutral-800 text-neutral-400 text-xs space-y-3">
              <Server className="w-10 h-10 text-neutral-600 mx-auto" />
              <p>No active child panels deployed currently.</p>
              <button
                type="button"
                onClick={() => setIsAddChildPanelModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Deploy First Child Panel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childPanels.map((cp) => (
                <div key={cp.id} className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4 hover:border-neutral-700 transition shadow-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono font-bold text-white text-base flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span>{cp.domain}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">Created: {cp.createdAt}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      cp.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : cp.status === 'Suspended'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {cp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80 font-mono">
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Admin User:</span>
                      <span className="text-white font-semibold">@{cp.adminUsername}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Profit Markup:</span>
                      <span className="text-emerald-400 font-bold">+{cp.profitMarginPercent}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Monthly Rent:</span>
                      <span className="text-white font-semibold">Rs. {cp.priceMonthly}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Orders Forwarded:</span>
                      <span className="text-blue-400 font-bold">{cp.totalOrdersForwarded || 0}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-400 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>Nameserver 1:</span>
                      <span className="text-neutral-300">{cp.nameserver1 || 'ns1.smmpanelnepal.com'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nameserver 2:</span>
                      <span className="text-neutral-300">{cp.nameserver2 || 'ns2.smmpanelnepal.com'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Renewal Date:</span>
                      <span className="text-amber-400 font-semibold">{cp.renewDate || '30 days'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleChildPanelStatus(cp.id, cp.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        cp.status === 'Active'
                          ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {cp.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChildPanel(cp);
                          setEditPanelPrice(cp.priceMonthly ?? globalChildPanelPrice);
                          setEditPanelMargin(cp.profitMarginPercent ?? 20);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-indigo-500/30"
                        title="Edit Price & Margin for this child panel"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Price</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteChildPanel(cp.id, cp.domain)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Delete Child Panel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 7: PASSWORD RESET REQUESTS DESK */}
      {adminSection === 'password_resets' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  User Password Reset Desk ({(passwordResetRequests || []).length})
                </h3>
                {(passwordResetRequests || []).filter(r => r.status === 'Pending').length > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    {(passwordResetRequests || []).filter(r => r.status === 'Pending').length} Pending Action
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                When users request a password reset via the login page, their request appears here. Admin / Staff can review and manually generate/dispatch their new password through the website.
              </p>
            </div>
          </div>

          {(passwordResetRequests || []).length === 0 ? (
            <div className="p-12 text-center bg-neutral-900/90 rounded-2xl border border-neutral-800 text-neutral-400 text-xs space-y-2">
              <Key className="w-10 h-10 text-neutral-600 mx-auto" />
              <p>No password reset requests currently in queue.</p>
            </div>
          ) : (
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800 font-bold">
                    <tr>
                      <th className="px-4 py-3">Req ID</th>
                      <th className="px-4 py-3">User Email & Details</th>
                      <th className="px-4 py-3">Requested At</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Resolution Details</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/70 font-mono">
                    {(passwordResetRequests || []).map((req) => {
                      const isPending = req.status === 'Pending';
                      return (
                        <tr key={req.id} className="hover:bg-neutral-800/40 transition">
                          <td className="px-4 py-3 text-white font-bold">#{req.id.slice(-6)}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white font-sans text-xs flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-blue-400" />
                              <span>{req.email}</span>
                            </div>
                            {req.username && (
                              <div className="text-[11px] text-neutral-400 mt-0.5">
                                Username: @{req.username}
                              </div>
                            )}
                            {req.ipAddress && (
                              <div className="text-[10px] text-neutral-400">IP: {req.ipAddress}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-neutral-300 text-[11px]">
                            {req.requestedAt}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              isPending
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-300 font-sans text-[11px]">
                            {req.status === 'Resolved' ? (
                              <div className="space-y-1">
                                <div className="text-emerald-400 font-mono font-bold text-xs bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
                                  Pass: {req.newPasswordProvided || 'Updated'}
                                </div>
                                <div className="text-[10px] text-neutral-400">
                                  By: {req.resolvedBy} on {req.resolvedAt}
                                </div>
                                {req.adminNote && (
                                  <div className="text-[10px] text-neutral-400 italic">"{req.adminNote}"</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-amber-400/80 italic text-[11px]">Pending admin manual action</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isPending ? (
                              <button
                                type="button"
                                onClick={() => handleOpenResetModal(req)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition inline-flex items-center gap-1 shadow-lg shadow-amber-500/20 cursor-pointer font-sans"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Reset & Send Password</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenResetModal(req)}
                                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition inline-flex items-center gap-1 cursor-pointer font-sans"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Re-issue</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 7: SUPPORT TICKETS DESK */}
      {adminSection === 'tickets' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Client Support Tickets Desk ({tickets.length})</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">Ticket #{t.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Open' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-200 mt-1">{t.subject}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicket(t);
                      setTicketReplyText('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer"
                  >
                    Reply as Staff
                  </button>
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300 space-y-2">
                  {t.messages.map((m, idx) => (
                    <div key={idx} className={`p-2 rounded-lg ${m.sender === 'user' ? 'bg-neutral-900' : 'bg-emerald-950/30 border border-emerald-500/30'}`}>
                      <div className="text-[10px] text-neutral-400 font-bold uppercase">{m.sender}:</div>
                      <p className="mt-0.5">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: LIVE CHAT REALTIME SUPPORT DESK */}
      {adminSection === 'live_chat' && (
        <AdminLiveChatDesk currentUser={currentUser} />
      )}

      {/* SECTION 8: BROADCAST NOTICES */}
      {adminSection === 'broadcasts' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Broadcast Alerts & User Announcements</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Announcements published here appear immediately across all client dashboards. You can manage or delete them anytime.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Announcement</span>
            </button>
          </div>

          {notices.length === 0 ? (
            <div className="p-12 text-center bg-neutral-900/60 border border-neutral-800/80 rounded-2xl space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Active Broadcast Notices</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                You haven't posted any broadcast notices yet, or all previous notices have been deleted.
              </p>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer"
              >
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{n.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                            n.type === 'alert'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : n.type === 'deal'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {n.type}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete announcement "${n.title}"?`)) {
                            handleDeleteNotice(n.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-neutral-950 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-500/40 transition cursor-pointer shrink-0"
                        title="Delete this announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {n.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500 font-mono">
                    <span>Published: {n.date}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove announcement "${n.title}"?`)) {
                          handleDeleteNotice(n.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 font-sans font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: PAYMENT GATEWAYS & QR CODES */}
      {(adminSection === 'payment_gateways' || adminSection === 'qr_gateways') && (
        <PaymentGatewayManagerTab
          settings={systemSettings || DEFAULT_SYSTEM_SETTINGS}
          onUpdateSettings={(newSettings) => {
            if (onUpdateSystemSettings) onUpdateSystemSettings(newSettings);
            setSettingsForm(newSettings);
          }}
          showToast={showToast}
        />
      )}

      {/* SECTION: WHOLESALER SMM PROVIDER APIS */}
      {adminSection === 'wholesaler_api' && (
        <WholesalerApiTab
          providers={wholesalerProviders || DEFAULT_WHOLESALER_PROVIDERS}
          services={services}
          orders={orders}
          usdToNprRate={settingsForm?.usdToNprRate || 136.5}
          onUpdateProviders={(newProvs) => {
            if (onUpdateWholesalerProviders) onUpdateWholesalerProviders(newProvs);
          }}
          onUpdateOrders={onUpdateOrders}
          onUpdateServices={onUpdateServices}
          showToast={showToast}
        />
      )}

      {/* SECTION: STAFF MEMBERS & HIRING */}
      {adminSection === 'staff' && (
        <StaffManagementTab
          staffMembers={staffMembers || DEFAULT_STAFF_MEMBERS}
          allUsers={allUsers}
          currentUser={currentUser}
          onUpdateStaff={(newStaff) => {
            if (onUpdateStaff) onUpdateStaff(newStaff);
          }}
          onUpdateUsers={onUpdateUsers}
          showToast={showToast}
        />
      )}

      {/* SECTION: EMAIL SETTINGS & BROADCAST DISPATCHER */}
      {adminSection === 'email_config' && (
        <AdminEmailConfigTab
          settings={systemSettings || DEFAULT_SYSTEM_SETTINGS}
          allUsers={allUsers}
          currentUser={currentUser}
          onUpdateSettings={(newSettings) => {
            if (onUpdateSystemSettings) onUpdateSystemSettings(newSettings);
            setSettingsForm(newSettings);
          }}
          showToast={showToast}
        />
      )}

      {/* SECTION: CRON SETUP & AUTOMATION */}
      {adminSection === 'cron_setup' && (
        <AdminCronSetupTab
          systemSettings={systemSettings || DEFAULT_SYSTEM_SETTINGS}
          onUpdateSettings={(newSettings) => {
            const merged: SystemSettings = { ...(systemSettings || DEFAULT_SYSTEM_SETTINGS), ...newSettings };
            if (onUpdateSystemSettings) onUpdateSystemSettings(merged);
            setSettingsForm(merged);
          }}
          showToast={showToast}
        />
      )}

      {/* SECTION 9: PLATFORM & WEBSITE MASTER SETTINGS (MODULAR CONSOLIDATED SETTINGS) */}
      {adminSection === 'settings' && (
        <AdminSettingsTab
          systemSettings={systemSettings || DEFAULT_SYSTEM_SETTINGS}
          onUpdateSettings={(newSettings) => {
            const merged: SystemSettings = { ...(systemSettings || DEFAULT_SYSTEM_SETTINGS), ...newSettings };
            if (onUpdateSystemSettings) onUpdateSystemSettings(merged);
            setSettingsForm(merged);
          }}
          showToast={showToast}
          currentUser={currentUser}
          onNavigateSection={(sec) => setAdminSection(sec as any)}
        />
      )}

      {/* SECTION 10: SYSTEM UPGRADE & CODE INSTALLER (ZERO-LOSS GUARANTEE) */}
      {adminSection === 'system_upgrade' && (
        <SystemUpgradeManagerModal
          availableUsers={allUsers}
          services={services}
          orders={orders}
          transactions={transactions as any}
          systemSettings={systemSettings || DEFAULT_SYSTEM_SETTINGS}
          onUpdateServices={onUpdateServices}
          onUpdateSystemSettings={(newSettings) => {
            const merged = { ...(systemSettings || DEFAULT_SYSTEM_SETTINGS), ...newSettings };
            if (onUpdateSystemSettings) onUpdateSystemSettings(merged);
            setSettingsForm(merged);
          }}
          onReloadUsers={() => onUpdateUsers([...allUsers])}
        />
      )}

      {false && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Platform Identity & Website Settings</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Customize your website name, custom brand logo, domain URL, tagline, support channels, and admin security. Changes sync live across all user dashboards.
              </p>
            </div>
            <button
              id="save-settings-top-btn"
              type="button"
              onClick={handleSaveSystemSettings}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>Save & Sync Realtime</span>
            </button>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Website Name, Logo & Visual Identity */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Website Name, Logo & Branding
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  Live Preview
                </span>
              </div>

              {/* Logo Preview Box */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-inner">
                  {settingsForm.siteLogoUrl ? (
                    <img
                      src={settingsForm.siteLogoUrl}
                      alt={settingsForm.siteName || 'Website Logo'}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center">
                      <div className="h-full w-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                        <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-neutral-200 truncate">
                    {settingsForm.siteName || 'SMM Panel Nepal'}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono truncate">
                    {settingsForm.siteUrl || 'https://smmpanelnepal.com'}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{settingsForm.siteLogoUrl ? 'Custom Logo Active' : 'Default Icon Active'}</span>
                  </div>
                </div>

                {settingsForm.siteLogoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsForm({ ...settingsForm, siteLogoUrl: '' });
                      showToast('Logo cleared. Will revert to default brand icon.');
                    }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-neutral-800 text-xs transition cursor-pointer"
                    title="Reset to default icon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3 text-xs">
                {/* Website / Brand Name */}
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">
                    Website Name / Brand Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="setting-site-name-input"
                    type="text"
                    value={settingsForm.siteName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., SMM Panel Nepal"
                  />
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Displayed across header navbar, browser title, login modals, and invoices.
                  </p>
                </div>

                {/* Website URL / Domain */}
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Website URL / Domain</span>
                  </label>
                  <input
                    id="setting-site-url-input"
                    type="text"
                    value={settingsForm.siteUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., https://smmpanelnepal.com"
                  />
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Official website URL used for child panel links, referral URLs, and API endpoints.
                  </p>
                </div>

                {/* Upload Logo or Provide URL */}
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                  <span className="font-bold text-emerald-400 block text-[11px]">
                    Change Website Logo
                  </span>
                  
                  {/* File Upload Button */}
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">
                      Upload Logo Image from Computer / Phone (PNG, JPG, SVG, WebP)
                    </label>
                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-neutral-700 hover:border-emerald-500 bg-neutral-900 hover:bg-neutral-800/60 text-neutral-300 hover:text-white cursor-pointer transition text-xs font-semibold">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Choose Image File...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 1024 * 1024 * 1024) {
                            alert('File is too large. Maximum upload size is 1GB (1024 MB).');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              setSettingsForm({ ...settingsForm, siteLogoUrl: result });
                              showToast('New logo image loaded! Click Save to apply.');
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Or External Logo Image URL */}
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">
                      Or Paste Direct Logo Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={settingsForm.siteLogoUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, siteLogoUrl: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                        placeholder="https://example.com/logo.png"
                      />
                      {settingsForm.siteLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, siteLogoUrl: '' })}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Slogan / Tagline */}
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">
                    Website Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={settingsForm.siteTagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteTagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., Nepal #1 Automated Social Media Growth Terminal"
                  />
                </div>

                {/* Favicon URL */}
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">
                    Favicon / Tab Icon URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={settingsForm.siteFaviconUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteFaviconUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-emerald-500 text-[11px]"
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>

                {/* Admin Panel Custom Name & Logo Branding */}
                <div className="pt-4 border-t border-neutral-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400 block text-xs flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Admin Panel Name & Logo Branding
                    </span>
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold">
                      Console Identity
                    </span>
                  </div>

                  {/* Header Bar Identity Preview */}
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-700 p-1 flex items-center justify-center shrink-0 shadow-inner">
                      {settingsForm.adminPanelLogoUrl || settingsForm.siteLogoUrl ? (
                        <img
                          src={settingsForm.adminPanelLogoUrl || settingsForm.siteLogoUrl}
                          alt={settingsForm.adminPanelName || 'Admin Logo'}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider truncate">
                        {settingsForm.adminPanelName || 'Admin Console'}
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {currentUser.fullName || currentUser.username} ({currentUser.role})
                      </div>
                    </div>
                  </div>

                  {/* Admin Panel Name Input */}
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">
                      Admin Panel Name
                    </label>
                    <input
                      id="admin-panel-name-input"
                      type="text"
                      value={settingsForm.adminPanelName || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, adminPanelName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold focus:outline-none focus:border-red-500 text-xs"
                      placeholder="e.g. SMM Nepal Admin Terminal"
                    />
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Shown at top left of the admin console header next to the logged in staff identity.
                    </p>
                  </div>

                  {/* Admin Panel Logo Input */}
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <span className="font-bold text-neutral-300 block text-[11px]">
                      Change Admin Panel Logo
                    </span>

                    {/* File Upload Button */}
                    <label className="flex items-center justify-center gap-2 p-2 rounded-xl border border-dashed border-neutral-700 hover:border-red-500 bg-neutral-900 hover:bg-neutral-800/60 text-neutral-300 hover:text-white cursor-pointer transition text-xs font-semibold">
                      <Upload className="w-3.5 h-3.5 text-red-400" />
                      <span>Choose Admin Logo File...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 1024 * 1024 * 1024) {
                            alert('File is too large. Maximum upload size is 1GB (1024 MB).');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              setSettingsForm({ ...settingsForm, adminPanelLogoUrl: result });
                              showToast('Admin panel logo uploaded! Click Save to apply.');
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Direct URL Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="url"
                        value={settingsForm.adminPanelLogoUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adminPanelLogoUrl: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-[11px] focus:outline-none focus:border-red-500"
                        placeholder="Or paste direct logo image URL"
                      />
                      {settingsForm.adminPanelLogoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsForm({ ...settingsForm, adminPanelLogoUrl: '' });
                            showToast('Admin logo reset to website logo or default.');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold transition cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Announcement Ticker & Maintenance Switch */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Announcement Ticker & Maintenance
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">
                    Live Header Marquee Announcement Ticker
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.announcementTicker}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcementTicker: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                    placeholder="Broadcast text displayed on the top marquee of user dashboard..."
                  />
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Streamed live at the top of every active user screen.
                  </p>
                </div>

                {/* Maintenance Mode Toggle & Approval Workflow */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white block text-xs">Platform Maintenance Mode</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            settingsForm.maintenanceMode
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {settingsForm.maintenanceMode ? 'UNDER MAINTENANCE' : 'LIVE ONLINE'}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        When active, customer website displays full-screen under maintenance notice.
                      </span>
                    </div>

                    {isAdminOrManager ? (
                      <button
                        type="button"
                        onClick={() => {
                          const newMode = !settingsForm.maintenanceMode;
                          const updated = {
                            ...settingsForm,
                            maintenanceMode: newMode,
                          };
                          setSettingsForm(updated);
                          if (onUpdateSystemSettings) {
                            onUpdateSystemSettings(updated);
                          }
                          try {
                            localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updated));
                          } catch (err) {}
                          showToast(
                            newMode
                              ? 'Maintenance Mode activated! User website is now showing maintenance screen.'
                              : 'Maintenance Mode turned OFF! User website is now LIVE online.'
                          );
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                          settingsForm.maintenanceMode
                            ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
                        }`}
                      >
                        {settingsForm.maintenanceMode ? 'Turn OFF Maintenance' : 'Turn ON Maintenance'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setStaffMaintenanceTargetAction(settingsForm.maintenanceMode ? 'disable' : 'enable');
                          setIsStaffMaintenanceModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Request Mode Change</span>
                      </button>
                    )}
                  </div>

                  {/* Staff policy & pending request notices */}
                  {!isAdminOrManager && (
                    <div className="text-[11px] p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400">
                      <strong className="text-amber-400">Staff Notice:</strong> Any change to platform maintenance mode requires Superadmin approval before taking effect.
                    </div>
                  )}

                  {settingsForm.maintenanceApprovalRequest && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Staff Request: @{settingsForm.maintenanceApprovalRequest.requestedBy}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {settingsForm.maintenanceApprovalRequest.requestedAt}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300">
                        Action requested:{' '}
                        <strong className={settingsForm.maintenanceApprovalRequest.action === 'enable' ? 'text-red-400' : 'text-emerald-400'}>
                          {settingsForm.maintenanceApprovalRequest.action === 'enable' ? 'Enable Maintenance Mode' : 'Disable Maintenance Mode'}
                        </strong>
                        <br />
                        Reason: <em>"{settingsForm.maintenanceApprovalRequest.reason}"</em>
                      </p>

                      {isAdminOrManager && (
                        <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
                          <button
                            type="button"
                            onClick={() => {
                              const newMode = settingsForm.maintenanceApprovalRequest?.action === 'enable';
                              const updated = {
                                ...settingsForm,
                                maintenanceMode: newMode,
                                maintenanceApprovalRequest: null,
                              };
                              setSettingsForm(updated);
                              if (onUpdateSystemSettings) onUpdateSystemSettings(updated);
                              try {
                                localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updated));
                              } catch (err) {}
                              showToast(newMode ? 'Approved! Maintenance mode activated.' : 'Approved! Website restored live.');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer"
                          >
                            Approve & Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...settingsForm,
                                maintenanceApprovalRequest: null,
                              };
                              setSettingsForm(updated);
                              if (onUpdateSystemSettings) onUpdateSystemSettings(updated);
                              try {
                                localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updated));
                              } catch (err) {}
                              showToast('Staff maintenance request rejected.');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Link to Payment Gateways Tab */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-400 block text-xs">Payment Gateway Management</span>
                    <span className="text-[11px] text-neutral-400">
                      Configure Fonepay QR, eSewa, Khalti, ConnectIPS Bank, USDT, limits & exchange rates.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminSection('payment_gateways')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer shrink-0 ml-2"
                  >
                    Open Gateways →
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Support Desk & Official Contact Channels */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Phone className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Support Desk & Official Contact Channels
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1 font-semibold">
                      WhatsApp Support Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono text-[11px]"
                      placeholder="+977 9841000000"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1 font-semibold">
                      Telegram Support Channel / Handle
                    </label>
                    <input
                      type="text"
                      value={settingsForm.telegramHandle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, telegramHandle: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono text-[11px]"
                      placeholder="@smmpanelnepal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1 font-semibold">
                      Official Support Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.supportEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-[11px]"
                      placeholder="smmpanelnepal@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1 font-semibold">
                      Support Hotline / Phone
                    </label>
                    <input
                      type="text"
                      value={settingsForm.supportPhone || '+977 9841000000'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono text-[11px]"
                      placeholder="+977 9841000000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Protected Admin Security & Master PIN Control */}
            <div className="bg-neutral-900/90 border border-red-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Admin Terminal Security & Master PIN
                  </h4>
                </div>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold">
                  256-Bit Protection
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <label className="text-[10px] text-neutral-400 block font-semibold">Master Admin Security PIN</label>
                  <input
                    type="text"
                    value={adminSecurityData.adminPin}
                    onChange={(e) =>
                      setAdminSecurityData({ ...adminSecurityData, adminPin: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-mono text-xs tracking-widest font-bold focus:border-red-500 focus:outline-none"
                    placeholder="Enter PIN (4-8 digits)"
                  />
                  <p className="text-[9px] text-neutral-500 mt-1">Required for terminal lock & unlock.</p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <label className="text-[10px] text-neutral-400 block font-semibold">Change Admin Password</label>
                  <input
                    type="password"
                    value={adminSecurityData.customAdminPassword}
                    onChange={(e) =>
                      setAdminSecurityData({ ...adminSecurityData, customAdminPassword: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:border-red-500 focus:outline-none"
                    placeholder="Enter new master password"
                  />
                  <p className="text-[9px] text-neutral-500 mt-1">Leave empty to keep current password.</p>
                </div>
              </div>
            </div>

            {/* Card 5: Enterprise HTTP Security Headers & Hardened Cookies */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Hardened HTTP Security Headers, Session Cookies & Rate Limiting
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-emerald-500/30">
                  Grade A+ Active
                </span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Platform endpoints enforce bank-grade HTTP headers, strict session cookie directives, rate-limiting guards against DDoS/brute-force, and defense-in-depth stealth authentication.
              </p>

              {/* Security Header Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">Referrer-Policy</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/90 font-mono">strict-origin-when-cross-origin</p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">Session Cookies</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">HARDENED</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/90 font-mono">HttpOnly; Secure; SameSite=Strict</p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">API Rate Limiter</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">120 REQ/MIN</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono">express-rate-limit on /api/*</p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">Login Rate Limiting</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">5 REQ / 15 MIN</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono">IP brute-force lockout guard</p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">Stealth Login Path</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">DEFENCE-IN-DEPTH</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono">/api/auth/secure-vault-entry</p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">HSTS & Nosniff</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">ENFORCED</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono">max-age=31536000 • X-Frame DENY</p>
                </div>
              </div>

              {/* IP-Allowlisting & Defence-in-Depth Controls */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Login IP-Allowlisting & Defence-in-Depth Path</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">Active on /api/auth/*</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Restrict login and administrative endpoints strictly to authorized office/admin IP addresses. Leave empty to allow all IPs (rate-limiting still strictly enforced: max 5 attempts/15 mins).
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 103.140.0.1, 27.34.0.0/16, or leave blank"
                    value={adminSecurityData.allowedLoginIps || ''}
                    onChange={(e) => setAdminSecurityData({ ...adminSecurityData, allowedLoginIps: e.target.value })}
                    className="flex-1 w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/auth/ip-allowlist', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ips: adminSecurityData.allowedLoginIps || '' }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          showToast('IP Allowlist configuration synced with server.');
                        }
                      } catch {
                        showToast('IP Allowlist saved locally.');
                      }
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition whitespace-nowrap cursor-pointer"
                  >
                    Sync Allowlist
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Non-Standard Stealth Login Route:</span>
                  <div className="flex items-center gap-2 font-mono">
                    <code className="text-amber-400 select-all">/api/auth/secure-vault-entry</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('/api/auth/secure-vault-entry');
                        showToast('Copied stealth path: /api/auth/secure-vault-entry');
                      }}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-sans font-bold cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: Domain Authentication (SPF, DMARC, DKIM) & CAA DNS Directives */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Domain DNS Authentication: SPF, DMARC, DKIM & CAA Records
                  </h4>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-500/30">
                  Target Domain: bhattdigitall.ai.studio
                </span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Publish these standard DNS TXT records to protect your domain reputation, eliminate email spoofing/phishing, guarantee inbox delivery, and restrict SSL issuance.
              </p>

              {/* 1. SPF Record */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">1. SPF (Sender Policy Framework)</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">TXT</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Host: <code className="text-emerald-400">bhattdigitall.ai.studio</code></span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Authorizes your specific mail provider to send emails on behalf of your domain:
                </p>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between font-mono text-[11px]">
                  <code className="text-emerald-400 select-all">v=spf1 include:your-mail-provider.com ~all</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('v=spf1 include:your-mail-provider.com ~all');
                      showToast('Copied SPF TXT Record');
                    }}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-sans font-bold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-neutral-400">
                  <span className="text-neutral-500">Quick Provider Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('v=spf1 include:_spf.google.com ~all');
                      showToast('Copied Google Workspace SPF');
                    }}
                    className="underline hover:text-white"
                  >
                    Google Workspace
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('v=spf1 include:spf.sendinblue.com ~all');
                      showToast('Copied Brevo SPF');
                    }}
                    className="underline hover:text-white"
                  >
                    Brevo (Sendinblue)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('v=spf1 include:zoho.com ~all');
                      showToast('Copied Zoho Mail SPF');
                    }}
                    className="underline hover:text-white"
                  >
                    Zoho Mail
                  </button>
                </div>
              </div>

              {/* 2. DMARC Record */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">2. DMARC (Domain-based Message Authentication)</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">TXT</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Host: <code className="text-emerald-400">_dmarc.bhattdigitall.ai.studio</code></span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Instructs recipient servers to quarantine spoofed emails and dispatch forensic reports:
                </p>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between font-mono text-[11px]">
                  <code className="text-emerald-400 select-all">v=DMARC1; p=quarantine; rua=mailto:dmarc@bhattdigitall.ai.studio</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('v=DMARC1; p=quarantine; rua=mailto:dmarc@bhattdigitall.ai.studio');
                      showToast('Copied DMARC TXT Record');
                    }}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-sans font-bold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* 3. DKIM Signing */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">3. DKIM Signing (DomainKeys Identified Mail)</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">TXT Key</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Enable in Email Provider Console</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Log in to your email provider (Google Workspace Admin Console, Zoho Mail Control Panel, or Brevo Domain Settings), generate your 2048-bit DKIM Key, and publish the TXT record they provide (typically under selector <code className="text-amber-300">google._domainkey</code> or <code className="text-amber-300">mail._domainkey</code>).
                </p>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                  <span>Host: <span className="text-emerald-400">&lt;selector&gt;._domainkey.bhattdigitall.ai.studio</span></span>
                  <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-300 font-sans">Provider Specific</span>
                </div>
              </div>

              {/* 4. CAA DNS Records */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>4. CAA Records (Certificate Authority Authorization)</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">Restricts SSL issuance to Let's Encrypt</span>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <code className="text-emerald-400 select-all">0 issue "letsencrypt.org"</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('0 issue "letsencrypt.org"');
                        showToast('Copied: 0 issue "letsencrypt.org"');
                      }}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-sans font-bold cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <code className="text-emerald-400 select-all">0 issuewild "letsencrypt.org"</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('0 issuewild "letsencrypt.org"');
                        showToast('Copied: 0 issuewild "letsencrypt.org"');
                      }}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-sans font-bold cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <code className="text-emerald-400 select-all">0 iodef "mailto:smmpanelnepal@gmail.com"</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('0 iodef "mailto:smmpanelnepal@gmail.com"');
                        showToast('Copied: 0 iodef "mailto:smmpanelnepal@gmail.com"');
                      }}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-sans font-bold cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Master DNS Export & Sync Suite */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-xs text-neutral-300 font-medium">
                  Ready for Cloudflare, cPanel, Namecheap, Route 53 or BIND DNS
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const fullBundle = `; DNS Configuration Bundle for bhattdigitall.ai.studio
; SPF
bhattdigitall.ai.studio. IN TXT "v=spf1 include:your-mail-provider.com ~all"

; DMARC
_dmarc.bhattdigitall.ai.studio. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@bhattdigitall.ai.studio"

; DKIM
google._domainkey.bhattdigitall.ai.studio. IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."

; CAA
bhattdigitall.ai.studio. IN CAA 0 issue "letsencrypt.org"
bhattdigitall.ai.studio. IN CAA 0 issuewild "letsencrypt.org"
bhattdigitall.ai.studio. IN CAA 0 iodef "mailto:smmpanelnepal@gmail.com"`;
                      navigator.clipboard.writeText(fullBundle);
                      showToast('Copied full DNS records bundle to clipboard!');
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold transition cursor-pointer"
                  >
                    Copy All DNS Bundle
                  </button>

                  <a
                    href="/api/dns/zone-file"
                    download="bhattdigitall.ai.studio.zone"
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition text-center cursor-pointer"
                  >
                    Download .zone File
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl">
            <span className="text-xs text-neutral-400">
              Changes take effect immediately across all active user views upon saving.
            </span>
            <button
              id="save-settings-bottom-btn"
              type="button"
              onClick={handleSaveSystemSettings}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save & Sync All Settings</span>
            </button>
          </div>
        </div>
      )}
      </>
      )}

      {/* MODAL: STAFF MAINTENANCE APPROVAL REQUEST */}
      {isStaffMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Request Maintenance Mode</h3>
                  <p className="text-[11px] text-neutral-400">Requires Superadmin Approval</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffMaintenanceModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!staffMaintenanceReason.trim()) {
                  alert('Please provide a reason for the maintenance mode change.');
                  return;
                }
                const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
                const req = {
                  requestedBy: currentUser.username,
                  staffName: currentUser.fullName,
                  action: staffMaintenanceTargetAction,
                  reason: staffMaintenanceReason.trim(),
                  requestedAt: now,
                };
                const updated = {
                  ...settingsForm,
                  maintenanceApprovalRequest: req,
                };
                setSettingsForm(updated);
                if (onUpdateSystemSettings) onUpdateSystemSettings(updated);
                try {
                  localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updated));
                } catch (err) {}
                setIsStaffMaintenanceModalOpen(false);
                setStaffMaintenanceReason('');
                showToast('Maintenance request submitted! Awaiting administrator approval.');
              }}
              className="space-y-4 text-xs"
            >
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-amber-400 block font-semibold uppercase font-mono">
                  Staff Approval Policy
                </span>
                <p className="text-[11px] text-neutral-300">
                  Staff members cannot directly turn maintenance mode on or off. Submitting this request creates an urgent ticket for the Administrator to review and activate.
                </p>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">Requested Action</label>
                <select
                  value={staffMaintenanceTargetAction}
                  onChange={(e) => setStaffMaintenanceTargetAction(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="enable">Enable Maintenance Mode (Take Website Offline)</option>
                  <option value="disable">Disable Maintenance Mode (Restore Live Website)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">
                  Reason / Technical Work Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={staffMaintenanceReason}
                  onChange={(e) => setStaffMaintenanceReason(e.target.value)}
                  placeholder="e.g. Updating wholesale payment endpoints, server backup, or database indexing..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsStaffMaintenanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Submit for Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BALANCE ADJUSTMENT */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Adjust Client Balance: {selectedUserForBalance.username}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForBalance(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBalanceAdjustType('credit')}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    balanceAdjustType === 'credit'
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  + Credit (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceAdjustType('debit')}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    balanceAdjustType === 'debit'
                      ? 'bg-red-500 text-white'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  - Debit (Deduct)
                </button>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Amount (in NPR Rs.):</label>
                <input
                  type="number"
                  value={balanceAdjustAmount}
                  onChange={(e) => setBalanceAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Admin Reason / Particulars:</label>
                <input
                  type="text"
                  value={balanceAdjustReason}
                  onChange={(e) => setBalanceAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Fonepay Direct Cash Deposit, Goodwill Credit, Promotional Bonus"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForBalance(null)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBalanceAdjustment}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Confirm Balance Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingService ? 'Edit SMM Service' : 'Add New SMM Service'}
              </h3>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Service Title:</label>
                <input
                  type="text"
                  value={serviceFormData.name || ''}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  placeholder="e.g., Instagram Followers [Real Active - 30 Days Refill Guarantee]"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Category:</label>
                  <select
                    value={serviceFormData.category || 'Instagram'}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Telegram">Telegram</option>
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="Spotify">Spotify</option>
                    <option value="Website Traffic">Website Traffic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Rate / 1k (NPR Rs.):</label>
                  <input
                    type="number"
                    value={serviceFormData.ratePer1k || 100}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, ratePer1k: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Min Quantity:</label>
                  <input
                    type="number"
                    value={serviceFormData.minQuantity || 50}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, minQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Max Quantity:</label>
                  <input
                    type="number"
                    value={serviceFormData.maxQuantity || 50000}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, maxQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Speed:</label>
                  <input
                    type="text"
                    value={serviceFormData.speed || '10K - 20K / Day'}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, speed: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Refill Days:</label>
                  <input
                    type="number"
                    value={serviceFormData.refillDays || 30}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, refillDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description:</label>
                <textarea
                  value={serviceFormData.description || ''}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  placeholder="Service details and specifications..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveService}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BULK PRICE ADJUSTMENT */}
      {isBulkPriceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-400" />
                Bulk Price Adjustment (%)
              </h3>
              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBulkDirection('increase')}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    bulkDirection === 'increase'
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  + Increase Rates (%)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkDirection('decrease')}
                  className={`flex-1 py-2 rounded-xl font-bold transition ${
                    bulkDirection === 'decrease'
                      ? 'bg-red-500 text-white'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  - Decrease Rates (%)
                </button>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Percentage (%):</label>
                <input
                  type="number"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Target Category:</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                >
                  <option value="all">All Services (Entire Catalog)</option>
                  <option value="Instagram">Instagram Only</option>
                  <option value="TikTok">TikTok Only</option>
                  <option value="YouTube">YouTube Only</option>
                  <option value="Facebook">Facebook Only</option>
                  <option value="Telegram">Telegram Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkPrice}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Apply Price Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST ALERT */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Post User Broadcast Notice
              </h3>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Title:</label>
                <input
                  type="text"
                  value={noticeFormData.title || ''}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
                  placeholder="e.g., Fonepay Instant Cashback Promo 5%"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Message Content:</label>
                <textarea
                  value={noticeFormData.message || ''}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, message: e.target.value })}
                  rows={3}
                  placeholder="Notice message visible on every user's dashboard..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Alert Style:</label>
                <select
                  value={noticeFormData.type || 'deal'}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                >
                  <option value="deal">Special Deal / Promotion</option>
                  <option value="info">General System Information</option>
                  <option value="warning">Maintenance / Speed Update</option>
                  <option value="success">Success / New Feature</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotice}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Publish Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TICKET REPLY */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Support Desk: Ticket #{selectedTicket.ticketNumber}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-neutral-300">{selectedTicket.subject}</div>

              <div className="max-h-48 overflow-y-auto space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                {selectedTicket.messages.map((m, i) => (
                  <div key={i} className={`p-2 rounded-lg ${m.sender === 'user' ? 'bg-neutral-900' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20'}`}>
                    <span className="font-bold text-[10px] uppercase text-neutral-400">{m.sender}:</span>
                    <p className="mt-0.5">{m.text}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Staff Reply:</label>
                <textarea
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  rows={3}
                  placeholder="Type official staff response..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTicketReply}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Send Staff Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Register New User Account
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  placeholder="e.g., sujan_smm"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="e.g., sujan@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                    placeholder="Sujan Shrestha"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="9841XXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Initial Balance (NPR Rs.)</label>
                  <input
                    type="number"
                    value={newUserData.balance}
                    onChange={(e) => setNewUserData({ ...newUserData, balance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Password</label>
                  <input
                    type="text"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="nepal123"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Account Tier</label>
                  <select
                    value={newUserData.tier}
                    onChange={(e) => setNewUserData({ ...newUserData, tier: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Reseller">Reseller (5% Off)</option>
                    <option value="VIP">VIP (10% Off)</option>
                    <option value="Wholesale">Wholesale (15% Off)</option>
                    <option value="Staff">Staff (Console Access)</option>
                    <option value="Admin">Admin (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">User Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ORDER */}
      {isEditOrderModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                Edit Order #{editingOrder.orderId}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditOrderModalOpen(false);
                  setEditingOrder(null);
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Service</label>
                <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-medium">
                  {editingOrder.serviceName}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Target Link</label>
                <input
                  type="text"
                  value={orderEditForm.link}
                  onChange={(e) => setOrderEditForm({ ...orderEditForm, link: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Start Count</label>
                  <input
                    type="number"
                    value={orderEditForm.startCount}
                    onChange={(e) => setOrderEditForm({ ...orderEditForm, startCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Remains</label>
                  <input
                    type="number"
                    value={orderEditForm.remains}
                    onChange={(e) => setOrderEditForm({ ...orderEditForm, remains: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Order Status</label>
                <select
                  value={orderEditForm.status}
                  onChange={(e) => setOrderEditForm({ ...orderEditForm, status: e.target.value as OrderStatus })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="In progress">In progress</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Partial">Partial</option>
                  <option value="Canceled">Canceled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setIsEditOrderModalOpen(false);
                  setEditingOrder(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOrderEdit}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Save Order Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADVANCED PROOF SCREENSHOT & VOUCHER INSPECTOR */}
      {proofModalUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header bar with details & quick toolbar */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between gap-3 bg-neutral-950/60 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">Payment Proof Slip</span>
                    {proofModalTx && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        {proofModalTx.method}
                      </span>
                    )}
                  </div>
                  {proofModalTx && (
                    <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2 truncate">
                      <span>Ref: {proofModalTx.transactionId || proofModalTx.id}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">Rs. {proofModalTx.amount.toLocaleString()} NPR</span>
                      {proofModalTx.senderName && (
                        <>
                          <span>•</span>
                          <span>{proofModalTx.senderName}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Toolbar */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setProofZoom((z) => Math.min(z + 0.25, 3))}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setProofZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setProofRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer transition"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <a
                  href={proofModalUrl}
                  download={`Payment-Proof-${proofModalTx?.transactionId || 'Slip'}.jpg`}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer transition"
                  title="Download Proof Image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const win = window.open();
                    if (win) {
                      win.document.write(`<body style="margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${proofModalUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" /></body>`);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer transition"
                  title="Open in New Window"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setProofModalUrl(null)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer transition ml-1"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Viewer Canvas */}
            <div className="flex-1 overflow-auto bg-neutral-950 p-4 flex items-center justify-center min-h-[360px] max-h-[58vh]">
              <div
                className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
                style={{
                  transform: `scale(${proofZoom}) rotate(${proofRotation}deg)`,
                }}
              >
                <img
                  src={proofModalUrl}
                  alt="Payment Proof Receipt"
                  className="max-h-[52vh] w-auto object-contain rounded-xl shadow-2xl border border-neutral-800 select-none"
                />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-500 font-mono">
                  Zoom: {Math.round(proofZoom * 100)}% • Rotation: {proofRotation}°
                </span>
                {(proofZoom !== 1 || proofRotation !== 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setProofZoom(1);
                      setProofRotation(0);
                    }}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset View
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {proofModalTx && proofModalTx.status === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const tx = proofModalTx;
                        setProofModalUrl(null);
                        handleOpenDepositDecision(tx, 'approve');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>✓ Approve & Credit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tx = proofModalTx;
                        setProofModalUrl(null);
                        handleOpenDepositDecision(tx, 'reject');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 font-bold text-xs cursor-pointer transition"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setProofModalUrl(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-semibold cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DEPOSIT FULL DETAILS & PROOF */}
      {selectedDepositDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">Deposit Transaction Full Details & Proof</span>
              </div>
              <button onClick={() => setSelectedDepositDetails(null)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">Transaction ID</span>
                  <strong className="text-white font-mono text-sm">{selectedDepositDetails.transactionId || selectedDepositDetails.id}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">Gateway Method</span>
                  <strong className="text-emerald-400 font-mono">{selectedDepositDetails.method}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">Deposit Amount</span>
                  <strong className="text-emerald-400 font-mono text-sm">Rs. {selectedDepositDetails.amount.toLocaleString()} NPR</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedDepositDetails.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                    selectedDepositDetails.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {selectedDepositDetails.status}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">Sender Name</span>
                  <span className="text-white font-medium">{selectedDepositDetails.senderName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">Sender Phone</span>
                  <span className="text-white font-mono">{selectedDepositDetails.senderPhone || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-500 block text-[10px] uppercase font-mono">Timestamp / Date</span>
                  <span className="text-neutral-300 font-mono">{selectedDepositDetails.date}</span>
                </div>
                {selectedDepositDetails.notes && (
                  <div className="col-span-2">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Notes / Remarks</span>
                    <p className="text-neutral-300 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">{selectedDepositDetails.notes}</p>
                  </div>
                )}
              </div>

              {selectedDepositDetails.screenshotUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300 font-semibold block text-xs">Attached Payment Proof Screenshot:</span>
                    <button
                      type="button"
                      onClick={() => openProofViewer(selectedDepositDetails.screenshotUrl!, selectedDepositDetails)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Fullscreen Inspector</span>
                    </button>
                  </div>
                  <div
                    className="rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center max-h-[360px] p-2 group cursor-pointer relative"
                    onClick={() => openProofViewer(selectedDepositDetails.screenshotUrl!, selectedDepositDetails)}
                  >
                    <img
                      src={selectedDepositDetails.screenshotUrl}
                      alt="Transaction Proof"
                      className="max-h-[340px] w-auto object-contain rounded-lg transition duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-2 text-white font-bold text-xs">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>Click to Enlarge & Inspect</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-neutral-300 font-semibold">No custom receipt file uploaded</div>
                    <div className="text-[11px] text-neutral-500">You can inspect the digital payment voucher slip</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const slip = generateSampleProofReceipt(selectedDepositDetails);
                      openProofViewer(slip, selectedDepositDetails);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Digital Slip</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
              {selectedDepositDetails.status === 'Pending' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDepositDecision(selectedDepositDetails, 'approve')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>✓ Approve & Credit Funds</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDepositDecision(selectedDepositDetails, 'reject')}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>✕ Reject Request</span>
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-neutral-500 font-mono">
                  Reviewed by: <span className="text-neutral-300 font-bold">{selectedDepositDetails.reviewedBy || 'Admin'}</span> {selectedDepositDetails.reviewedAt ? `on ${selectedDepositDetails.reviewedAt}` : ''}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedDepositDetails(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DEPOSIT APPROVE / REJECT DECISION WITH ADMIN NOTE */}
      {depositDecisionModal.isOpen && depositDecisionModal.tx && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                {depositDecisionModal.type === 'approve' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <h3 className="text-base font-bold text-white">
                  {depositDecisionModal.type === 'approve' ? 'Approve & Credit Deposit' : 'Reject Deposit Request'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDepositDecisionModal({ isOpen: false, type: 'approve', tx: null, note: '', error: '' })}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction summary card */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">User / Sender:</span>
                <span className="text-white font-bold">{depositDecisionModal.tx.userUsername || depositDecisionModal.tx.senderName || 'Client'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Transaction ID:</span>
                <span className="text-white font-mono font-bold">{depositDecisionModal.tx.transactionId || depositDecisionModal.tx.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Payment Gateway:</span>
                <span className="text-emerald-400 font-semibold">{depositDecisionModal.tx.method}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                <span className="text-neutral-300 font-bold">Deposit Amount to Credit:</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  Rs. {depositDecisionModal.tx.amount.toLocaleString()} NPR
                </span>
              </div>
            </div>

            {/* Payment Proof Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 text-xs font-semibold block">Attached Payment Proof Slip:</span>
                <button
                  type="button"
                  onClick={() =>
                    openProofViewer(
                      depositDecisionModal.tx?.screenshotUrl ||
                        generateSampleProofReceipt(depositDecisionModal.tx!),
                      depositDecisionModal.tx
                    )
                  }
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Slip</span>
                </button>
              </div>
              <div 
                className="rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center p-2 cursor-pointer hover:border-emerald-500/50 transition max-h-40 group relative"
                onClick={() =>
                  openProofViewer(
                    depositDecisionModal.tx?.screenshotUrl ||
                      generateSampleProofReceipt(depositDecisionModal.tx!),
                    depositDecisionModal.tx
                  )
                }
              >
                <img
                  src={
                    depositDecisionModal.tx?.screenshotUrl ||
                    generateSampleProofReceipt(depositDecisionModal.tx!)
                  }
                  alt="Slip Proof"
                  className="max-h-36 w-auto object-contain rounded group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs gap-1.5 transition">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Click to inspect</span>
                </div>
              </div>
            </div>

            {/* Note or Remarks input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 block">
                {depositDecisionModal.type === 'approve'
                  ? 'Admin Verification Note (Optional / Pre-filled):'
                  : 'Rejection Reason (Will be displayed to client):'}
              </label>
              <textarea
                value={depositDecisionModal.note}
                onChange={(e) =>
                  setDepositDecisionModal((prev) => ({ ...prev, note: e.target.value, error: '' }))
                }
                placeholder={
                  depositDecisionModal.type === 'approve'
                    ? 'e.g., Payment verified in statement. Wallet credited.'
                    : 'e.g., Transaction ID not found in bank records / Slip mismatch'
                }
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              {depositDecisionModal.type === 'reject' && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Transaction ID not found in statement',
                    'Payment amount does not match',
                    'Duplicate transaction slip',
                    'Unclear / blurry screenshot proof',
                  ].map((quickReason) => (
                    <button
                      key={quickReason}
                      type="button"
                      onClick={() =>
                        setDepositDecisionModal((prev) => ({ ...prev, note: quickReason, error: '' }))
                      }
                      className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>
              )}
              {depositDecisionModal.error && (
                <p className="text-red-400 text-xs font-bold">{depositDecisionModal.error}</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() =>
                  setDepositDecisionModal({ isOpen: false, type: 'approve', tx: null, note: '', error: '' })
                }
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-bold cursor-pointer"
              >
                Cancel
              </button>
              {depositDecisionModal.type === 'approve' ? (
                <button
                  type="button"
                  onClick={handleConfirmDepositDecision}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm & Credit Rs. {depositDecisionModal.tx.amount.toLocaleString()} NPR</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDepositDecision}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Rejection</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CHILD PANEL */}
      {isAddChildPanelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-indigo-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Deploy New Reseller Child Panel</h3>
              </div>
              <button
                onClick={() => setIsAddChildPanelModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChildPanelAdmin} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Reseller Domain Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. nepalsmmportal.com"
                      value={childPanelFormData.domain}
                      onChange={(e) => setChildPanelFormData({ ...childPanelFormData, domain: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Point reseller domain's NS records to our nameservers.
                  </p>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Reseller Admin Username</label>
                  <input
                    type="text"
                    required
                    value={childPanelFormData.adminUsername}
                    onChange={(e) => setChildPanelFormData({ ...childPanelFormData, adminUsername: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Reseller Admin Password</label>
                  <input
                    type="text"
                    required
                    value={childPanelFormData.adminPassword}
                    onChange={(e) => setChildPanelFormData({ ...childPanelFormData, adminPassword: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Profit Markup Margin (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={childPanelFormData.profitMarginPercent}
                    onChange={(e) => setChildPanelFormData({ ...childPanelFormData, profitMarginPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-bold font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Monthly License Fee (NPR)</label>
                  <input
                    type="number"
                    min="0"
                    value={childPanelFormData.priceMonthly}
                    onChange={(e) => setChildPanelFormData({ ...childPanelFormData, priceMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Currency</label>
                  <select
                    value={childPanelFormData.currency}
                    onChange={(e) => setChildPanelFormData({ ...childPanelFormData, currency: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="NPR">NPR (Nepalese Rupee)</option>
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Deployment Status</label>
                  <select
                    value={childPanelFormData.status}
                    onChange={(e) => setChildPanelFormData({ ...childPanelFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Active">Active & Live</option>
                    <option value="Configuring">Configuring</option>
                    <option value="Pending DNS">Pending DNS</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Primary Nameserver 1</label>
                  <input
                    type="text"
                    value={childPanelFormData.nameserver1}
                    onChange={(e) => setChildPanelFormData({ ...childPanelFormData, nameserver1: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Secondary Nameserver 2</label>
                  <input
                    type="text"
                    value={childPanelFormData.nameserver2}
                    onChange={(e) => setChildPanelFormData({ ...childPanelFormData, nameserver2: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddChildPanelModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision Child Panel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CHILD PANEL PRICE & MARGIN */}
      {editingChildPanel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-indigo-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Edit Child Panel Pricing</h3>
                  <p className="text-xs text-neutral-400 font-mono">{editingChildPanel.domain}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingChildPanel(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1.5">
                  Monthly Rental Fee (NPR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editPanelPrice}
                    onChange={(e) => setEditPanelPrice(Number(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono font-bold text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[1000, 1500, 1800, 2000, 2200, 2500, 3000].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditPanelPrice(p)}
                      className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono cursor-pointer"
                    >
                      Rs. {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1.5">
                  Reseller Profit Markup Margin (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={editPanelMargin}
                    onChange={(e) => setEditPanelMargin(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-emerald-400 font-mono font-bold text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">%</span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Markup added on top of your main panel services for this reseller.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingChildPanel(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveIndividualPanelPrice}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Save Panel Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL PASSWORD RESET DESK */}
      {resetModalData.isOpen && resetModalData.request && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Manual Password Reset & Dispatch</h3>
              </div>
              <button
                onClick={() => setResetModalData({ isOpen: false, request: null, tempPassword: '', adminNote: '' })}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 space-y-2 text-xs">
              <div className="text-neutral-400">
                Target User Email: <strong className="text-white font-mono">{resetModalData.request.email}</strong>
              </div>
              {resetModalData.request.username && (
                <div className="text-neutral-400">
                  Target Account: <strong className="text-amber-400 font-mono">@{resetModalData.request.username}</strong>
                </div>
              )}
              <div className="text-neutral-400 text-[11px]">
                Requested on: {resetModalData.request.requestedAt} (IP: {resetModalData.request.ipAddress || 'Nepal Local'})
              </div>
            </div>

            <form onSubmit={handleProcessPasswordReset} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  New Password to Assign & Dispatch <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={resetModalData.tempPassword}
                    onChange={(e) => setResetModalData({ ...resetModalData, tempPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="Enter or generate password"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPass = `NepalPass#${Math.floor(1000 + Math.random() * 9000)}`;
                      setResetModalData({ ...resetModalData, tempPassword: newPass });
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold whitespace-nowrap text-xs cursor-pointer border border-neutral-700"
                  >
                    Auto Generate
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  This will immediately update the user's password in the system and log the resolution.
                </p>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Admin Resolution Note</label>
                <textarea
                  rows={2}
                  value={resetModalData.adminNote}
                  onChange={(e) => setResetModalData({ ...resetModalData, adminNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Password dispatched via website desk."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setResetModalData({ isOpen: false, request: null, tempPassword: '', adminNote: '' })}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Update & Dispatch Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MEMBER FULL DETAILS & EDIT */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {selectedUserForDetails.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Member Profile: @{selectedUserForDetails.username}
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    ID: {selectedUserForDetails.id} • Joined: {selectedUserForDetails.createdAt || 'N/A'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Cards inside Modal */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl">
                <span className="text-[10px] text-neutral-400 block">Current Balance</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  Rs. {selectedUserForDetails.balance.toLocaleString()} NPR
                </span>
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl">
                <span className="text-[10px] text-neutral-400 block">Total Spent</span>
                <span className="text-base font-mono font-bold text-white">
                  Rs. {selectedUserForDetails.totalSpent.toLocaleString()} NPR
                </span>
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl">
                <span className="text-[10px] text-neutral-400 block">Total Orders</span>
                <span className="text-base font-mono font-bold text-blue-400">
                  {selectedUserForDetails.totalOrders || 0} Orders
                </span>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveUserDetails} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Username</label>
                  <input
                    type="text"
                    required
                    value={userEditForm.username || ''}
                    onChange={(e) => setUserEditForm({ ...userEditForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEditForm.email || ''}
                    onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={userEditForm.fullName || ''}
                    onChange={(e) => setUserEditForm({ ...userEditForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={userEditForm.phone || ''}
                    onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Wallet Balance (NPR Rs.)</label>
                  <input
                    type="number"
                    value={userEditForm.balance ?? 0}
                    onChange={(e) => setUserEditForm({ ...userEditForm, balance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Account Password</label>
                  <input
                    type="text"
                    value={userEditForm.password || ''}
                    onChange={(e) => setUserEditForm({ ...userEditForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Account Tier</label>
                  <select
                    value={userEditForm.tier || 'Standard'}
                    onChange={(e) => setUserEditForm({ ...userEditForm, tier: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Reseller">Reseller (5% Off)</option>
                    <option value="VIP">VIP (10% Off)</option>
                    <option value="Wholesale">Wholesale (15% Off)</option>
                    <option value="Staff">Staff (Console Access)</option>
                    <option value="Admin">Admin (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">User Permission Role</label>
                  <select
                    value={userEditForm.role || 'user'}
                    onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold"
                  >
                    <option value="user">Standard Client</option>
                    <option value="staff">Staff Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 mb-1 font-semibold">Account Status</label>
                  <select
                    value={userEditForm.status || 'active'}
                    onChange={(e) => setUserEditForm({ ...userEditForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold"
                  >
                    <option value="active">Active (Normal)</option>
                    <option value="suspended">Suspended (Temporary Hold)</option>
                    <option value="banned">Banned (Blocked Access)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 mb-1 font-semibold">API Secret Token Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={userEditForm.apiKey || ''}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(userEditForm.apiKey || '');
                        showToast('API key copied to clipboard.');
                      }}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Copy API Key
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedUserForDetails;
                      setSelectedUserForDetails(null);
                      setSelectedUserForBalance(target);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Adjust Balance</span>
                  </button>

                  {onImpersonateUser && selectedUserForDetails.id !== currentUser.id && (
                    <button
                      type="button"
                      onClick={() => {
                        onImpersonateUser(selectedUserForDetails);
                        showToast(`Logged in as client: ${selectedUserForDetails.username}`);
                        setSelectedUserForDetails(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs cursor-pointer"
                    >
                      Login As User
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForDetails(null)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    Save All Member Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE USER CONFIRMATION */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Delete User Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-4 space-y-2 text-xs">
              <p className="text-neutral-200">
                Are you sure you want to permanently delete user <strong className="text-red-400">@{userToDelete.username}</strong> ({userToDelete.email})?
              </p>
              <div className="text-neutral-400 text-[11px] space-y-1 pt-1 border-t border-red-500/20">
                <div>• Current Balance: <strong className="text-white font-mono">Rs. {userToDelete.balance.toLocaleString()} NPR</strong></div>
                <div>• Account Tier: <strong className="text-white font-mono">{userToDelete.tier}</strong></div>
                <div>• Total Spent: <strong className="text-white font-mono">Rs. {userToDelete.totalSpent.toLocaleString()} NPR</strong></div>
              </div>
              <p className="text-red-300 font-semibold text-[11px] pt-1">
                ⚠️ Warning: This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Profile & Security Modal (Triggered by clicking left corner profile card) */}
      {isStaffProfileModalOpen && (
        <StaffProfileSecurityModal
          isOpen={isStaffProfileModalOpen}
          currentUser={currentUser}
          staffMember={staffMembers.find((s) => s.username.toLowerCase() === currentUser.username.toLowerCase() || s.id === currentUser.id)}
          onClose={() => setIsStaffProfileModalOpen(false)}
          onUpdateCurrentUser={(updated) => {
            if (onUpdateCurrentUser) {
              onUpdateCurrentUser(updated);
            }
            const updatedUsers = allUsers.map((u) => {
              if (u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()) {
                return { ...u, ...updated };
              }
              return u;
            });
            onUpdateUsers(updatedUsers);
            try {
              localStorage.setItem('smm_nepal_users', JSON.stringify(updatedUsers));
              const currentActive = JSON.parse(localStorage.getItem('smm_nepal_active_user') || '{}');
              localStorage.setItem('smm_nepal_active_user', JSON.stringify({ ...currentActive, ...updated }));
            } catch (err) {}
          }}
          onUpdateStaffMember={(updated) => {
            if (onUpdateStaff) {
              const updatedStaff = staffMembers.map((s) => {
                if (s.username.toLowerCase() === currentUser.username.toLowerCase() || s.id === currentUser.id) {
                  return { ...s, ...updated };
                }
                return s;
              });
              onUpdateStaff(updatedStaff);
              try {
                localStorage.setItem('smm_nepal_staff_members', JSON.stringify(updatedStaff));
              } catch (err) {}
            }
          }}
          onLockAdmin={() => {
            setIsStaffProfileModalOpen(false);
            if (onLockAdmin) {
              onLockAdmin();
            }
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
