import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Zap,
  ShoppingCart,
  List,
  Wallet,
  Sparkles,
  LifeBuoy,
  Code,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  Flame,
  Globe,
  Bell,
  RefreshCw,
  LogOut,
  User,
  LogIn,
  UserPlus,
  ChevronDown,
  Settings,
  ShieldCheck,
  Gift,
  AlertTriangle,
  Receipt,
  ShieldAlert,
  Lock,
  QrCode,
  Briefcase,
  Users,
  Server,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import {
  INITIAL_USER,
  DEFAULT_USERS,
  SMM_SERVICES,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_TICKETS,
  BROADCAST_NOTICES,
  INITIAL_CHILD_PANELS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_STAFF_MEMBERS,
  DEFAULT_WHOLESALER_PROVIDERS,
  DEFAULT_PASSWORD_RESETS
} from './data/smmData';
import { generateSampleProofReceipt } from './utils/paymentProofHelper';
import {
  SMMService,
  SMMOrder,
  UserAccount,
  PaymentTransaction,
  SupportTicket,
  ToastNotification,
  UserNotification,
  OrderStatus,
  ChildPanel,
  BroadcastNotification,
  SystemSettings,
  StaffMember,
  WholesalerProvider,
  PasswordResetRequest
} from './types';

export type AppTab =
  | 'dashboard'
  | 'new_order'
  | 'orders'
  | 'services'
  | 'child_panel'
  | 'add_funds'
  | 'transactions'
  | 'referrals'
  | 'profile'
  | 'ai_advisor'
  | 'support'
  | 'api'
  | 'admin';

const TAB_TO_PATH: Record<AppTab, string> = {
  dashboard: '/',
  new_order: '/new-order',
  orders: '/orders',
  services: '/services',
  child_panel: '/child-panels',
  add_funds: '/add-funds',
  transactions: '/transactions',
  referrals: '/referrals',
  profile: '/profile',
  ai_advisor: '/ai-advisor',
  support: '/support',
  api: '/api-docs',
  admin: '/admin',
};

function getAdminCustomPath(): string {
  if (typeof window === 'undefined') return '/admin';
  try {
    const saved = localStorage.getItem('smm_nepal_system_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.adminRoutePath) {
        const slug = parsed.adminRoutePath.replace(/^\/+/, '').trim();
        return slug ? `/${slug}` : '/admin';
      }
    }
  } catch (e) {}
  return '/admin';
}

function getTabFromLocation(customAdminPath?: string): AppTab {
  if (typeof window === 'undefined') return 'dashboard';
  const pathname = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab')?.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  const activeAdminSlug = (customAdminPath || getAdminCustomPath()).toLowerCase().replace(/^\/+/, '').trim() || 'admin';
  const isDefaultAdmin = activeAdminSlug === 'admin';

  // STRICT ACCESS RULE:
  // Default is /admin. Once changed (e.g. to /panel-secret), ONLY the customized slug provides access.
  // /admin is completely disabled and blocked when a custom slug is configured.
  const isMatchAdminPath = isDefaultAdmin
    ? (
        pathname === '/admin' ||
        pathname.startsWith('/admin/') ||
        pathname === '/admin.php' ||
        tabParam === 'admin' ||
        hash === '#admin'
      )
    : (
        pathname === `/${activeAdminSlug}` ||
        pathname.startsWith(`/${activeAdminSlug}/`) ||
        tabParam === activeAdminSlug ||
        hash === `#${activeAdminSlug}`
      );

  if (isMatchAdminPath) {
    return 'admin';
  }
  if (pathname.includes('/new-order') || pathname.includes('/order') || tabParam === 'new_order') return 'new_order';
  if (pathname.includes('/orders') || tabParam === 'orders') return 'orders';
  if (pathname.includes('/services') || tabParam === 'services') return 'services';
  if (pathname.includes('/child-panel') || pathname.includes('/reseller') || tabParam === 'child_panel') return 'child_panel';
  if (pathname.includes('/add-funds') || pathname.includes('/deposit') || tabParam === 'add_funds') return 'add_funds';
  if (pathname.includes('/transactions') || pathname.includes('/ledger') || tabParam === 'transactions') return 'transactions';
  if (pathname.includes('/referrals') || pathname.includes('/affiliate') || tabParam === 'referrals') return 'referrals';
  if (pathname.includes('/profile') || pathname.includes('/settings') || tabParam === 'profile') return 'profile';
  if (pathname.includes('/ai-advisor') || pathname.includes('/ai') || tabParam === 'ai_advisor') return 'ai_advisor';
  if (pathname.includes('/support') || pathname.includes('/tickets') || tabParam === 'support') return 'support';
  if (pathname.includes('/api') || tabParam === 'api') return 'api';
  return 'dashboard';
}

// Tab Components
import { DashboardTab } from './components/DashboardTab';
import { NewOrderTab } from './components/NewOrderTab';
import { OrdersTab } from './components/OrdersTab';
import { ServicesTab } from './components/ServicesTab';
import { ChildPanelTab } from './components/ChildPanelTab';
import { AddFundsTab } from './components/AddFundsTab';
import { TransactionsTab } from './components/TransactionsTab';
import { ReferralTab } from './components/ReferralTab';
import { ProfileTab } from './components/ProfileTab';
import { AIAdvisorTab } from './components/AIAdvisorTab';
import { SupportTab } from './components/SupportTab';
import { APIDocsTab } from './components/APIDocsTab';
import { AdminPanelTab } from './components/AdminPanelTab';
import { AdminLoginGate } from './components/AdminLoginGate';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthDashboard } from './components/AuthDashboard';
import { ToastNotificationContainer } from './components/ToastNotificationContainer';
import { LiveChatWidget } from './components/LiveChatWidget';
import { NotificationBell, playNotificationChime } from './components/NotificationBell';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { InstallWizardModal } from './components/InstallWizardModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(() => getTabFromLocation());

  // Password-protected admin authentication session state (always locked by default)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('smm_admin_authenticated') === 'true';
  });

  // Web Installer & MySQL Configuration State - Pre-installed & Locked by Default
  const [isInstallerLocked, setIsInstallerLocked] = useState<boolean>(true);

  // Active Installation Wizard - Closed by default so users & admins are never blocked
  const [isInstallWizardOpen, setIsInstallWizardOpen] = useState<boolean>(false);

  // Load registered users (SuperAdmin smmpanelnepal@gmail.com available, demo dummy users purged)
  const [availableUsers, setAvailableUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('smm_nepal_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (u: UserAccount) =>
              u &&
              !['usr_roshan_01', 'usr_ktm_agency', 'usr_aarav_mkt', 'usr_nepal_user', 'usr_root_admin'].includes(u.id) &&
              u.email !== 'admin@smmpanelnepal.com'
          );
          if (!filtered.some((u: UserAccount) => u.email === 'smmpanelnepal@gmail.com' || u.username === 'smmpanelnepal')) {
            filtered.unshift(INITIAL_USER);
          }
          return filtered;
        }
      } catch (e) {
        return [INITIAL_USER];
      }
    }
    return [INITIAL_USER];
  });

  // Current active user
  const [user, setUser] = useState<UserAccount>(() => {
    const savedActive = localStorage.getItem('smm_nepal_active_user');
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (
          parsed &&
          !['usr_roshan_01', 'usr_ktm_agency', 'usr_aarav_mkt', 'usr_nepal_user', 'usr_root_admin'].includes(parsed.id) &&
          parsed.email !== 'admin@smmpanelnepal.com' &&
          parsed.username !== 'admin'
        ) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_USER;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const savedStatus = localStorage.getItem('smm_nepal_is_logged_in');
    const savedActive = localStorage.getItem('smm_nepal_active_user');
    return savedStatus === 'true' && !!savedActive;
  });

  const [services, setServices] = useState<SMMService[]>(SMM_SERVICES);
  const [orders, setOrders] = useState<SMMOrder[]>(() => {
    const saved = localStorage.getItem('smm_nepal_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('smm_nepal_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: PaymentTransaction) => {
            // Ensure any manual deposit has a visual proof voucher if screenshot was missing or dropped
            if (t.type === 'Deposit' && !t.screenshotUrl) {
              return { ...t, screenshotUrl: generateSampleProofReceipt(t) };
            }
            return t;
          });
        }
        return INITIAL_TRANSACTIONS;
      } catch (e) {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('smm_nepal_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TICKETS;
      }
    }
    return INITIAL_TICKETS;
  });

  // Child Panel reseller state - Clean and purged for all users
  const [childPanels, setChildPanels] = useState<ChildPanel[]>(() => {
    try {
      localStorage.removeItem('smm_nepal_child_panels');
    } catch (e) {}
    return [];
  });

  const [notices, setNotices] = useState<BroadcastNotification[]>(() => {
    const saved = localStorage.getItem('smm_nepal_notices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return BROADCAST_NOTICES;
      }
    }
    return BROADCAST_NOTICES;
  });

  useEffect(() => {
    localStorage.setItem('smm_nepal_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('smm_nepal_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('smm_nepal_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // System & Platform Global Settings (synced across Admin & User Panels)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('smm_nepal_system_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SYSTEM_SETTINGS;
      }
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('smm_nepal_system_settings', JSON.stringify(systemSettings));
    if (systemSettings.siteName) {
      document.title = systemSettings.siteTagline
        ? `${systemSettings.siteName} - ${systemSettings.siteTagline}`
        : `${systemSettings.siteName} - SMM Reseller Platform`;
    }
  }, [systemSettings]);

  // Synchronize server-side installer status to ensure wizard is permanently locked once installed
  useEffect(() => {
    try {
      localStorage.setItem('smm_installation_locked', 'true');
      localStorage.setItem('smm_installation_completed', 'true');
    } catch (e) {}

    setIsInstallerLocked(true);
    setIsInstallWizardOpen(false);

    fetch('/api/installer/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.installed || data.locked)) {
          try {
            localStorage.setItem('smm_installation_locked', 'true');
            localStorage.setItem('smm_installation_completed', 'true');
          } catch (e) {}
          setIsInstallerLocked(true);
          setIsInstallWizardOpen(false);
        }
      })
      .catch(() => {});
  }, []);

  // Hired Staff Members state
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('smm_nepal_staff_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_STAFF_MEMBERS;
      }
    }
    return DEFAULT_STAFF_MEMBERS;
  });

  useEffect(() => {
    localStorage.setItem('smm_nepal_staff_members', JSON.stringify(staffMembers));
  }, [staffMembers]);

  // Wholesaler SMM Provider APIs state
  const [wholesalerProviders, setWholesalerProviders] = useState<WholesalerProvider[]>(() => {
    const saved = localStorage.getItem('smm_nepal_wholesaler_providers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_WHOLESALER_PROVIDERS;
      }
    }
    return DEFAULT_WHOLESALER_PROVIDERS;
  });

  useEffect(() => {
    localStorage.setItem('smm_nepal_wholesaler_providers', JSON.stringify(wholesalerProviders));
  }, [wholesalerProviders]);

  // Password Reset Requests Desk State
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(() => {
    const saved = localStorage.getItem('smm_nepal_password_resets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PASSWORD_RESETS;
      }
    }
    return DEFAULT_PASSWORD_RESETS;
  });

  useEffect(() => {
    localStorage.setItem('smm_nepal_password_resets', JSON.stringify(passwordResetRequests));
  }, [passwordResetRequests]);

  // Admin Section state (for deep navigation into specific admin panels)
  const [adminInitialSection, setAdminInitialSection] = useState<string>('overview');
  const [adminDropdownOpen, setAdminDropdownOpen] = useState<boolean>(false);

  // Real-time Toast Notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const prevOrdersRef = useRef<Map<string, OrderStatus>>(new Map());
  const isFirstMountRef = useRef<boolean>(true);

  // App Visual Theme (Dark / Light) state
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smm_nepal_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (appTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      localStorage.setItem('smm_nepal_theme', appTheme);
    }
  }, [appTheme]);

  // Real-time Bell Notifications state
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smm_nepal_user_notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return [
      {
        id: 'notif-dep-1',
        title: 'Deposit Approved: +Rs. 2,500 NPR',
        message: 'Your eSewa deposit of Rs. 2,500 (Ref: ESW-8492019) has been verified and credited to your wallet balance.',
        type: 'deposit_approved',
        timestamp: '15m ago',
        isRead: false,
        linkTab: 'transactions',
        amount: 2500,
        referenceId: 'ESW-8492019',
      },
      {
        id: 'notif-tkt-1',
        title: 'Support Ticket #1042 Updated',
        message: 'Support Agent Sabin replied: "Your TikTok Views service rate has been updated with 10% volume discount."',
        type: 'ticket_reply',
        timestamp: '1h ago',
        isRead: false,
        linkTab: 'support',
        ticketNumber: 1042,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('smm_nepal_user_notifications', JSON.stringify(userNotifications));
  }, [userNotifications]);

  const prevTransactionsRef = useRef<Map<string, string>>(new Map());
  const isFirstTxMountRef = useRef<boolean>(true);
  const prevTicketsRef = useRef<Map<string, { status: string; count: number }>>(new Map());
  const isFirstTicketMountRef = useRef<boolean>(true);

  // Low balance warning state
  const [isLowBalance, setIsLowBalance] = useState<boolean>(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // URL routing and browser history synchronization
  useEffect(() => {
    const handleLocationChange = () => {
      const detectedTab = getTabFromLocation(systemSettings.adminRoutePath);
      setActiveTab(detectedTab);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [systemSettings.adminRoutePath]);

  // Keep browser address bar in sync when activeTab updates
  useEffect(() => {
    const adminPath = systemSettings.adminRoutePath || 'admin';
    const cleanAdminSlug = adminPath.replace(/^\/+/, '').trim() || 'admin';
    const effectiveAdminPath = `/${cleanAdminSlug}`;
    const currentPath = window.location.pathname;

    if (activeTab === 'admin') {
      const isAlreadyOnValidAdminRoute =
        currentPath === effectiveAdminPath || currentPath.startsWith(`${effectiveAdminPath}/`);

      if (!isAlreadyOnValidAdminRoute && !window.location.search && !window.location.hash) {
        window.history.pushState({ tab: 'admin' }, '', effectiveAdminPath);
      }
    } else {
      const expectedPath = TAB_TO_PATH[activeTab] || '/';
      if (currentPath !== expectedPath && !window.location.search && !window.location.hash) {
        window.history.pushState({ tab: activeTab }, '', expectedPath);
      }
    }
  }, [activeTab, systemSettings.adminRoutePath]);

  // Sync users and active user with localStorage
  useEffect(() => {
    localStorage.setItem('smm_nepal_users', JSON.stringify(availableUsers));
  }, [availableUsers]);

  useEffect(() => {
    localStorage.setItem('smm_nepal_active_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('smm_nepal_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  // Triggers permanent 'Low Balance' warning banner in navbar if user's balance drops below 50 NPR
  useEffect(() => {
    setIsLowBalance(user.balance < 50);
  }, [user.balance]);

  // Sync orders with localStorage and detect real-time status transitions for toast notifications
  useEffect(() => {
    localStorage.setItem('smm_nepal_orders', JSON.stringify(orders));

    if (isFirstMountRef.current) {
      // First mount: initialize tracking map with existing order statuses without alerting
      orders.forEach((ord) => {
        prevOrdersRef.current.set(ord.id, ord.status);
      });
      isFirstMountRef.current = false;
      return;
    }

    // Check for status changes in orders
    const newToasts: ToastNotification[] = [];
    const currentOrderMap = new Map<string, OrderStatus>();

    orders.forEach((ord) => {
      currentOrderMap.set(ord.id, ord.status);
      const prevStatus = prevOrdersRef.current.get(ord.id);

      if (prevStatus && prevStatus !== ord.status) {
        // Pending -> In progress
        if (prevStatus === 'Pending' && ord.status === 'In progress') {
          newToasts.push({
            id: `toast-${Date.now()}-${ord.id}-prog`,
            orderId: ord.orderId,
            serviceName: ord.serviceName,
            previousStatus: prevStatus,
            newStatus: ord.status,
            title: `Order #${ord.orderId} is now In Progress`,
            message: `Dispatching ${ord.quantity.toLocaleString()} units for "${ord.serviceName}". Speed: High-Speed Node.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'in_progress',
          });
        }
        // Pending or In progress -> Completed
        else if (
          (prevStatus === 'Pending' || prevStatus === 'In progress' || prevStatus === 'Processing') &&
          ord.status === 'Completed'
        ) {
          newToasts.push({
            id: `toast-${Date.now()}-${ord.id}-comp`,
            orderId: ord.orderId,
            serviceName: ord.serviceName,
            previousStatus: prevStatus,
            newStatus: ord.status,
            title: `Order #${ord.orderId} Completed!`,
            message: `Your order for "${ord.serviceName}" has finished with 100% successful delivery.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'completed',
          });
        }
      }
    });

    if (newToasts.length > 0) {
      setToasts((prev) => [...newToasts, ...prev].slice(0, 5));
    }

    // Update ref with latest map
    prevOrdersRef.current = currentOrderMap;
  }, [orders]);

  // Auto-dismiss the oldest toast notification after 6 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(0, prev.length - 1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [toasts]);

  useEffect(() => {
    localStorage.setItem('smm_nepal_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('smm_nepal_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('smm_nepal_child_panels', JSON.stringify(childPanels));
  }, [childPanels]);

  // Toast handlers
  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAllToasts = () => {
    setToasts([]);
  };

  const handleViewOrderFromToast = (orderId: number) => {
    setActiveTab('orders');
  };

  const handleCustomToast = (msg: string) => {
    setToasts((prev) => [
      {
        id: `toast-cust-${Date.now()}`,
        orderId: 0,
        serviceName: 'SMM Notification',
        previousStatus: 'Pending' as OrderStatus,
        newStatus: 'Completed' as OrderStatus,
        title: 'Alert',
        message: msg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'info' as const,
      },
      ...prev,
    ].slice(0, 5));
  };

  const handleCompleteInstallation = (data: {
    dbConfig: any;
    superAdmin: any;
    systemSettings: Partial<SystemSettings>;
  }) => {
    const { dbConfig, superAdmin, systemSettings: newSiteSettings } = data;

    // Purge all legacy/previous demo or test data completely
    try {
      localStorage.removeItem('smm_nepal_orders');
      localStorage.removeItem('smm_nepal_transactions');
      localStorage.removeItem('smm_nepal_tickets');
      localStorage.removeItem('smm_nepal_child_panels');
      localStorage.removeItem('smm_nepal_affiliates');
      localStorage.removeItem('smm_custom_services');
      localStorage.removeItem('smm_services');
    } catch (e) {}

    // Reset runtime state to completely clean slate
    setOrders([]);
    setTransactions([]);
    setTickets([]);
    setChildPanels([]);

    // Save & lock installer permanently
    try {
      localStorage.setItem('smm_installation_locked', 'true');
      localStorage.setItem('smm_db_config', JSON.stringify(dbConfig));
    } catch (e) {}

    setIsInstallerLocked(true);
    setIsInstallWizardOpen(false);

    // Create SuperAdmin user strictly from installer data
    const createdSuperAdmin: UserAccount = {
      id: 'usr_superadmin',
      username: (superAdmin.username || 'smmpanelnepal').toLowerCase().trim(),
      fullName: superAdmin.fullName || 'SMM Super Admin',
      email: (superAdmin.email || 'smmpanelnepal@gmail.com').toLowerCase().trim(),
      password: superAdmin.password || 'password123',
      masterKey: superAdmin.securityPin || '7788',
      masterPassword: superAdmin.securityPin || '7788',
      role: 'superadmin',
      tier: 'Wholesale',
      balance: 100000,
      currency: newSiteSettings.currency || 'NPR',
      totalSpent: 0,
      totalOrders: 0,
      apiKey: `smm_key_${(superAdmin.username || 'admin').toLowerCase()}_live_${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Store ONLY this newly created SuperAdmin account
    setAvailableUsers([createdSuperAdmin]);
    try {
      localStorage.setItem('smm_nepal_users', JSON.stringify([createdSuperAdmin]));
    } catch (e) {}

    // Update global system settings with entered site branding
    const updatedSettings: SystemSettings = {
      ...systemSettings,
      ...newSiteSettings,
      siteName: newSiteSettings.siteName || systemSettings.siteName || 'SMM PANEL NEPAL',
      siteTagline: newSiteSettings.siteTagline || systemSettings.siteTagline,
      currency: newSiteSettings.currency || systemSettings.currency || 'NPR',
      adminRoutePath: newSiteSettings.adminRoutePath || systemSettings.adminRoutePath || 'admin',
      supportEmail: newSiteSettings.supportEmail || systemSettings.supportEmail || superAdmin.email,
      supportPhone: newSiteSettings.supportPhone || systemSettings.supportPhone,
    };

    setSystemSettings(updatedSettings);
    try {
      localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updatedSettings));
    } catch (e) {}

    // Log in directly as the newly created SuperAdmin and unlock admin console
    setUser(createdSuperAdmin);
    setIsLoggedIn(true);
    setIsAdminAuthenticated(true);

    try {
      sessionStorage.setItem('smm_admin_authenticated', 'true');
      localStorage.setItem('smm_nepal_is_logged_in', 'true');
      localStorage.setItem('smm_nepal_active_user', JSON.stringify(createdSuperAdmin));
    } catch (e) {}

    // Navigate to Admin Panel
    const effectiveAdminRoute = `/${(updatedSettings.adminRoutePath || 'admin').replace(/^\/+/, '')}`;
    window.history.pushState({}, '', effectiveAdminRoute);
    setActiveTab('admin');

    handleCustomToast(
      `🎉 Fresh Installation Complete! All prior data purged. Logged in as SuperAdmin @${createdSuperAdmin.username}.`
    );
  };

  // Real-time Deposit Status Listener
  useEffect(() => {
    if (isFirstTxMountRef.current) {
      transactions.forEach((tx) => {
        prevTransactionsRef.current.set(tx.id, tx.status);
      });
      isFirstTxMountRef.current = false;
      return;
    }

    const currentTxMap = new Map<string, string>();
    const newNotifs: UserNotification[] = [];

    transactions.forEach((tx) => {
      currentTxMap.set(tx.id, tx.status);
      const prevStatus = prevTransactionsRef.current.get(tx.id);

      if (prevStatus && prevStatus !== tx.status) {
        if (prevStatus === 'Pending' && tx.status === 'Completed') {
          newNotifs.push({
            id: `notif-tx-appr-${Date.now()}-${tx.id}`,
            title: `Deposit Approved: +Rs. ${tx.amount.toLocaleString()} NPR`,
            message: `Your ${tx.method} deposit of Rs. ${tx.amount.toLocaleString()} (Ref: ${tx.transactionId}) has been verified and credited to your wallet balance.`,
            type: 'deposit_approved',
            timestamp: 'Just now',
            isRead: false,
            linkTab: 'transactions',
            amount: tx.amount,
            referenceId: tx.transactionId,
          });
          playNotificationChime();
          handleCustomToast(`Deposit Approved: Rs. ${tx.amount.toLocaleString()} NPR credited!`);
        } else if (prevStatus === 'Pending' && tx.status === 'Failed') {
          newNotifs.push({
            id: `notif-tx-fail-${Date.now()}-${tx.id}`,
            title: `Deposit Rejected: Rs. ${tx.amount.toLocaleString()} NPR`,
            message: `Your ${tx.method} deposit could not be verified. Note: ${tx.adminNote || 'Payment verification rejected by admin'}.`,
            type: 'deposit_rejected',
            timestamp: 'Just now',
            isRead: false,
            linkTab: 'add_funds',
            amount: tx.amount,
            referenceId: tx.transactionId,
          });
          playNotificationChime();
          handleCustomToast(`Deposit could not be verified (Ref: ${tx.transactionId})`);
        }
      }
    });

    if (newNotifs.length > 0) {
      setUserNotifications((prev) => [...newNotifs, ...prev]);
    }

    prevTransactionsRef.current = currentTxMap;
  }, [transactions]);

  // Real-time Support Ticket Listener
  useEffect(() => {
    if (isFirstTicketMountRef.current) {
      tickets.forEach((t) => {
        prevTicketsRef.current.set(t.id, { status: t.status, count: t.messages?.length || 0 });
      });
      isFirstTicketMountRef.current = false;
      return;
    }

    const currentTicketMap = new Map<string, { status: string; count: number }>();
    const newNotifs: UserNotification[] = [];

    tickets.forEach((t) => {
      const msgCount = t.messages?.length || 0;
      currentTicketMap.set(t.id, { status: t.status, count: msgCount });
      const prevInfo = prevTicketsRef.current.get(t.id);

      if (prevInfo) {
        // Detect new message from support agent or AI advisor
        if (msgCount > prevInfo.count) {
          const lastMsg = t.messages[msgCount - 1];
          if (lastMsg && (lastMsg.sender === 'support' || lastMsg.sender === 'ai_agent')) {
            const senderLabel = lastMsg.sender === 'support' ? 'Support Desk' : 'AI Assistant';
            newNotifs.push({
              id: `notif-tkt-msg-${Date.now()}-${t.id}`,
              title: `Support Ticket #${t.ticketNumber} Reply`,
              message: `${senderLabel}: "${lastMsg.text.slice(0, 90)}${lastMsg.text.length > 90 ? '...' : ''}"`,
              type: 'ticket_reply',
              timestamp: 'Just now',
              isRead: false,
              linkTab: 'support',
              ticketNumber: t.ticketNumber,
            });
            playNotificationChime();
            handleCustomToast(`New reply on Ticket #${t.ticketNumber}`);
          }
        } else if (prevInfo.status !== t.status) {
          if (t.status === 'Answered' && prevInfo.status === 'Open') {
            newNotifs.push({
              id: `notif-tkt-ans-${Date.now()}-${t.id}`,
              title: `Ticket #${t.ticketNumber} Answered`,
              message: `Your ticket "${t.subject}" has been answered by support staff.`,
              type: 'ticket_reply',
              timestamp: 'Just now',
              isRead: false,
              linkTab: 'support',
              ticketNumber: t.ticketNumber,
            });
            playNotificationChime();
          } else if (t.status === 'Closed' && prevInfo.status !== 'Closed') {
            newNotifs.push({
              id: `notif-tkt-cls-${Date.now()}-${t.id}`,
              title: `Ticket #${t.ticketNumber} Closed`,
              message: `Ticket "${t.subject}" has been resolved and closed.`,
              type: 'ticket_closed',
              timestamp: 'Just now',
              isRead: false,
              linkTab: 'support',
              ticketNumber: t.ticketNumber,
            });
            playNotificationChime();
          }
        }
      }
    });

    if (newNotifs.length > 0) {
      setUserNotifications((prev) => [...newNotifs, ...prev]);
    }

    prevTicketsRef.current = currentTicketMap;
  }, [tickets]);

  // Live Test Simulation Trigger
  const handleSimulateAlert = (type: 'deposit_approved' | 'ticket_reply') => {
    const notifId = `notif-sim-${Date.now()}`;
    if (type === 'deposit_approved') {
      const amount = 3000;
      const newNotif: UserNotification = {
        id: notifId,
        title: `Deposit Approved: +Rs. ${amount.toLocaleString()} NPR`,
        message: `Your Fonepay QR deposit of Rs. ${amount.toLocaleString()} (Ref: FP-849102) has been verified and credited.`,
        type: 'deposit_approved',
        timestamp: 'Just now',
        isRead: false,
        linkTab: 'transactions',
        amount: amount,
        referenceId: 'FP-849102',
      };
      setUserNotifications((prev) => [newNotif, ...prev]);
      playNotificationChime();
      handleCustomToast(`Deposit Approved: Rs. ${amount.toLocaleString()} NPR credited!`);
    } else {
      const ticketNum = 1045;
      const newNotif: UserNotification = {
        id: notifId,
        title: `Support Ticket #${ticketNum} Reply`,
        message: `Support Lead: "We have reviewed your request. Delivery throughput is boosted on Node #2."`,
        type: 'ticket_reply',
        timestamp: 'Just now',
        isRead: false,
        linkTab: 'support',
        ticketNumber: ticketNum,
      };
      setUserNotifications((prev) => [newNotif, ...prev]);
      playNotificationChime();
      handleCustomToast(`New reply on Support Ticket #${ticketNum}`);
    }
  };

  const isSuperOrAdmin =
    user?.role === 'admin' ||
    user?.role === 'superadmin' ||
    user?.role === 'staff' ||
    user?.email?.toLowerCase() === 'smmpanelnepal@gmail.com' ||
    user?.tier === 'Admin' ||
    user?.tier === 'Staff';

  // Auth Handlers
  const handleLogin = (authenticatedUser: UserAccount) => {
    setUser(authenticatedUser);
    setIsLoggedIn(true);
    localStorage.setItem('smm_nepal_is_logged_in', 'true');
    localStorage.setItem('smm_nepal_current_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('smm_nepal_active_user', JSON.stringify(authenticatedUser));

    const isUserSuperOrAdmin =
      authenticatedUser.role === 'admin' ||
      authenticatedUser.role === 'superadmin' ||
      authenticatedUser.role === 'staff' ||
      authenticatedUser.email?.toLowerCase() === 'smmpanelnepal@gmail.com' ||
      authenticatedUser.tier === 'Admin' ||
      authenticatedUser.tier === 'Staff';

    const currentAdminPath = `/${(systemSettings.adminRoutePath || 'admin').replace(/^\/+/, '')}`;

    if (isUserSuperOrAdmin) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('smm_admin_authenticated', 'true');
        sessionStorage.setItem('smm_admin_login_time', Date.now().toString());
      } catch (e) {}
      window.history.pushState({}, '', currentAdminPath);
      setActiveTab('admin');
    } else {
      window.history.pushState({}, '', '/');
      setActiveTab('dashboard');
    }

    // update in available users list if updated
    setAvailableUsers((prev) =>
      prev.map((u) => (u.id === authenticatedUser.id ? authenticatedUser : u))
    );
  };

  const handleRegister = (newUser: UserAccount) => {
    setAvailableUsers((prev) => [newUser, ...prev]);
    setUser(newUser);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserDropdownOpen(false);
  };

  const handleUpdateUserProfile = (updatedFields: Partial<UserAccount>) => {
    setUser((prev) => {
      const isPrivileged = prev.role === 'admin' || prev.role === 'superadmin';
      const safeFields: Partial<UserAccount> = { ...updatedFields };
      if (!isPrivileged) {
        delete safeFields.role;
        delete safeFields.tier;
        delete safeFields.balance;
        delete safeFields.masterKey;
        delete safeFields.masterPassword;
      }
      const updated = { ...prev, ...safeFields };
      setAvailableUsers((users) =>
        users.map((u) => (u.id === updated.id ? updated : u))
      );
      return updated;
    });
  };

  // Place Order Handler with Security & Validation Checks
  const handlePlaceOrder = (
    orderData: Omit<SMMOrder, 'id' | 'orderId' | 'status' | 'createdAt' | 'startCount' | 'remains'>
  ) => {
    if (!isLoggedIn) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return false;
    }

    const cleanCharge = Number(orderData.charge);
    const cleanQuantity = Number(orderData.quantity);

    if (isNaN(cleanCharge) || cleanCharge < 0 || isNaN(cleanQuantity) || cleanQuantity <= 0) {
      handleCustomToast('Invalid order parameters. Order could not be placed.');
      return false;
    }

    if (user.balance < cleanCharge) {
      handleCustomToast('Insufficient balance. Please add funds to place this order.');
      return false;
    }

    // Sanitize link string
    const cleanLink = (orderData.link || '').trim().replace(/[<>'"\\]/g, '');

    // Deduct balance
    const updatedUser = {
      ...user,
      balance: Math.max(0, user.balance - cleanCharge),
      totalSpent: (user.totalSpent || 0) + cleanCharge,
      totalOrders: (user.totalOrders || 0) + 1,
    };
    setUser(updatedUser);
    setAvailableUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    // Check if any active wholesaler provider has this service mapped with autoDispatch
    const activeWholesaler = wholesalerProviders.find(
      (p) => p.status === 'active' && p.autoDispatch && p.serviceMapping?.[orderData.serviceId]
    );
    const remoteServiceId = activeWholesaler ? activeWholesaler.serviceMapping?.[orderData.serviceId] : undefined;

    // Create new order record
    const newOrderId = Math.floor(8926 + Math.random() * 800);
    const orderRecordId = `ord-${newOrderId}`;
    const newOrder: SMMOrder = {
      ...orderData,
      link: cleanLink,
      charge: cleanCharge,
      quantity: cleanQuantity,
      id: orderRecordId,
      orderId: newOrderId,
      startCount: 0,
      remains: cleanQuantity,
      status: activeWholesaler ? 'In progress' : 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      wholesalerProviderId: activeWholesaler ? activeWholesaler.id : undefined,
      wholesalerStatus: activeWholesaler ? 'Dispatching...' : undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Dispatch in real-time to Wholesaler API Node
    if (activeWholesaler && remoteServiceId) {
      fetch('/api/wholesaler/order/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: activeWholesaler.apiUrl,
          apiKey: activeWholesaler.apiKey,
          service: remoteServiceId,
          link: cleanLink,
          quantity: cleanQuantity,
          name: activeWholesaler.name,
          testMode: activeWholesaler.testMode,
        }),
      })
        .then((res) => res.json())
        .then((resp) => {
          if (resp.success && resp.order) {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === orderRecordId
                  ? {
                      ...o,
                      wholesalerOrderId: resp.order,
                      wholesalerStatus: 'In progress',
                      wholesalerDispatchedAt: new Date().toISOString(),
                    }
                  : o
              )
            );
          } else {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === orderRecordId
                  ? {
                      ...o,
                      wholesalerStatus: 'Dispatch Failed',
                      wholesalerError: resp.error || 'Provider rejected request',
                    }
                  : o
              )
            );
          }
        })
        .catch((err) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderRecordId
                ? {
                    ...o,
                    wholesalerStatus: 'Dispatch Failed',
                    wholesalerError: err.message || 'Connection error',
                  }
                : o
            )
          );
        });
    }

    // Record Order Debit in Transactions Ledger
    const orderTx: PaymentTransaction = {
      id: `tx-ord-${Date.now()}`,
      userId: user.id,
      userUsername: user.username,
      type: 'Debit',
      method: 'Wallet Debit',
      amount: cleanCharge,
      currency: 'NPR',
      fee: 0,
      status: 'Completed',
      transactionId: `ORD-${newOrderId}`,
      notes: `Order #${newOrderId}: ${orderData.serviceName} (${cleanQuantity.toLocaleString()} Qty)`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setTransactions((prev) => [orderTx, ...prev]);

    return true;
  };

  // Add Funds Handler (Submitted for Manual Verification)
  const handleAddFunds = (
    amount: number,
    method: PaymentTransaction['method'],
    txId: string,
    extra?: {
      senderName?: string;
      senderPhone?: string;
      screenshotUrl?: string;
      notes?: string;
      isImmediateApproval?: boolean;
    }
  ) => {
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0 || cleanAmount > 1000000) {
      handleCustomToast('Invalid deposit amount. Must be between Rs. 10 and Rs. 1,000,000.');
      return;
    }

    const cleanTxId = (txId || '').trim().replace(/[<>'"\\]/g, '');
    const isImmediate = extra?.isImmediateApproval === true;

    if (isImmediate) {
      const updatedUser: UserAccount = {
        ...user,
        balance: (Number(user.balance) || 0) + cleanAmount,
        totalDeposited: ((user as any).totalDeposited || 0) + cleanAmount,
      };
      setUser(updatedUser);
      setAvailableUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      try {
        localStorage.setItem('smm_nepal_active_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      userUsername: user.username,
      type: 'Deposit',
      method,
      amount: cleanAmount,
      currency: 'NPR',
      fee: 0,
      status: isImmediate ? 'Completed' : 'Pending',
      transactionId: cleanTxId,
      senderName: (extra?.senderName || user.fullName || user.username || '').replace(/[<>'"\\]/g, ''),
      senderPhone: (extra?.senderPhone || user.phone || '').replace(/[<>'"\\]/g, ''),
      screenshotUrl:
        extra?.screenshotUrl ||
        generateSampleProofReceipt({
          method,
          transactionId: cleanTxId,
          amount: cleanAmount,
          senderName: extra?.senderName || user.fullName || user.username,
          senderPhone: extra?.senderPhone || user.phone,
          status: isImmediate ? 'Completed' : 'Pending',
        }),
      notes: extra?.notes ? extra.notes.replace(/[<>'"\\]/g, '') : undefined,
      adminNote: isImmediate ? 'Auto-approved deposit gateway' : undefined,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      try {
        localStorage.setItem('smm_nepal_transactions', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Manual Approval / Verification Handler for Pending Deposits with Admin Note Requirement
  const handleApproveDeposit = (txId: string, adminNote: string = 'Approved by Admin', adminUsername?: string) => {
    const targetTx = transactions.find((t) => t.id === txId || t.transactionId === txId);
    if (!targetTx || targetTx.status === 'Completed') return;

    // Target user matching: by userId, or userUsername, or senderName, or senderPhone, or fallback to current user
    const targetUserId = targetTx.userId;
    const targetUsername = targetTx.userUsername || targetTx.senderName;
    const targetPhone = targetTx.senderPhone;

    let targetUser = availableUsers.find(
      (u) =>
        (targetUserId && u.id === targetUserId) ||
        (targetUsername && u.username.toLowerCase() === targetUsername.toLowerCase()) ||
        (targetPhone && u.phone === targetPhone)
    );

    if (!targetUser) {
      targetUser = user;
    }

    const creditedAmount = Number(targetTx.amount) || 0;
    const newTargetBalance = (Number(targetUser.balance) || 0) + creditedAmount;

    // Update target user in available users list
    const updatedAvailableUsers = availableUsers.map((u) => {
      if (u.id === targetUser!.id || u.username.toLowerCase() === targetUser!.username.toLowerCase()) {
        return {
          ...u,
          balance: newTargetBalance,
          totalDeposited: ((u as any).totalDeposited || 0) + creditedAmount,
        };
      }
      return u;
    });

    setAvailableUsers(updatedAvailableUsers);
    try {
      localStorage.setItem('smm_nepal_users', JSON.stringify(updatedAvailableUsers));
    } catch (e) {}

    // If current logged-in user is the one receiving the deposit, update active user state immediately
    if (user.id === targetUser.id || user.username.toLowerCase() === targetUser.username.toLowerCase()) {
      const updatedActiveUser: UserAccount = {
        ...user,
        balance: newTargetBalance,
        totalDeposited: ((user as any).totalDeposited || 0) + creditedAmount,
      };
      setUser(updatedActiveUser);
      try {
        localStorage.setItem('smm_nepal_active_user', JSON.stringify(updatedActiveUser));
      } catch (e) {}
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedTransactions = transactions.map((t) =>
      t.id === targetTx.id
        ? {
            ...t,
            status: 'Completed' as const,
            adminNote: adminNote.trim(),
            reviewedBy: adminUsername || user.username || 'Admin',
            reviewedAt: now,
          }
        : t
    );

    setTransactions(updatedTransactions);
    try {
      localStorage.setItem('smm_nepal_transactions', JSON.stringify(updatedTransactions));
    } catch (e) {}
  };

  // Manual Rejection Handler for Pending Deposits with Rejection Reason Requirement
  const handleRejectDeposit = (txId: string, rejectionReason: string, adminUsername?: string) => {
    const targetTx = transactions.find((t) => t.id === txId || t.transactionId === txId);
    if (!targetTx) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const reasonText = rejectionReason.trim() || 'Payment verification failed.';

    const updatedTransactions = transactions.map((t) =>
      t.id === targetTx.id
        ? {
            ...t,
            status: 'Failed' as const,
            adminNote: reasonText,
            notes: t.notes ? `${t.notes} | Rejected: ${reasonText}` : `Rejected: ${reasonText}`,
            reviewedBy: adminUsername || user.username || 'Admin',
            reviewedAt: now,
          }
        : t
    );

    setTransactions(updatedTransactions);
    try {
      localStorage.setItem('smm_nepal_transactions', JSON.stringify(updatedTransactions));
    } catch (e) {}
  };

  // Refill Order Handler
  const handleRefillOrder = (orderId: number) => {
    alert(`Refill request for Order #${orderId} has been submitted to automated API node.`);
  };

  // Quick Order from Services / Dashboard
  const handleSelectServiceToOrder = (service: SMMService) => {
    setActiveTab('new_order');
  };

  // Support Ticket Handlers
  const handleCreateTicket = (subject: string, orderId?: number, initialMessage?: string) => {
    const newNum = Math.floor(4022 + Math.random() * 500);
    const newTkt: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: newNum,
      subject,
      orderId,
      status: 'Open',
      priority: 'Medium',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: 'Just now',
      messages: initialMessage
        ? [
            {
              sender: 'user',
              text: initialMessage,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]
        : [],
    };

    setTickets((prev) => [newTkt, ...prev]);
  };

  const handleAddTicketMessage = (ticketId: string, text: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const isAiResponse = text.includes('Hello!') || text.includes('Order') || text.includes('refill') || text.length > 80;
          return {
            ...t,
            updatedAt: 'Just now',
            status: isAiResponse ? 'Answered' : 'Open',
            messages: [
              ...t.messages,
              {
                sender: isAiResponse ? 'ai_agent' : 'user',
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        }
        return t;
      })
    );
  };

  // Child Panel Reseller Handlers
  const handleCreateChildPanel = (panelData: Omit<ChildPanel, 'id' | 'createdAt' | 'renewDate' | 'totalOrdersForwarded' | 'totalEarningsNPR' | 'syncedServicesCount'>): boolean => {
    if (user.balance < panelData.priceMonthly) {
      return false;
    }

    const updatedBalance = user.balance - panelData.priceMonthly;
    const updatedUser: UserAccount = {
      ...user,
      balance: updatedBalance,
      totalSpent: user.totalSpent + panelData.priceMonthly,
    };
    setUser(updatedUser);
    setAvailableUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    const now = new Date();
    const renew = new Date();
    renew.setDate(now.getDate() + 30);

    const newPanel: ChildPanel = {
      ...panelData,
      id: `cp_${Date.now()}`,
      userId: user.id,
      createdAt: now.toISOString().split('T')[0],
      renewDate: renew.toISOString().split('T')[0],
      totalOrdersForwarded: 0,
      totalEarningsNPR: 0,
      syncedServicesCount: services.length,
    };

    setChildPanels((prev) => [newPanel, ...prev]);

    // Record Payment Transaction for Child Panel Hosting License
    const rentTx: PaymentTransaction = {
      id: `tx-cp-${Date.now()}`,
      method: 'eSewa',
      amount: panelData.priceMonthly,
      currency: 'NPR',
      fee: 0,
      status: 'Completed',
      transactionId: `CP-HOST-${Date.now().toString().slice(-6)}`,
      notes: `Child Panel Hosting License for ${panelData.domain} (30 Days)`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setTransactions((prev) => [rentTx, ...prev]);

    return true;
  };

  const handleRenewChildPanel = (panelId: string): boolean => {
    const target = childPanels.find((p) => p.id === panelId);
    if (!target) return false;

    if (user.balance < target.priceMonthly) {
      alert(`Insufficient funds to renew child panel. Balance: Rs. ${user.balance.toLocaleString()} NPR, Needed: Rs. ${target.priceMonthly.toLocaleString()} NPR.`);
      return false;
    }

    const updatedBalance = user.balance - target.priceMonthly;
    const updatedUser: UserAccount = {
      ...user,
      balance: updatedBalance,
      totalSpent: user.totalSpent + target.priceMonthly,
    };
    setUser(updatedUser);
    setAvailableUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    const renew = new Date();
    renew.setDate(renew.getDate() + 30);

    setChildPanels((prev) =>
      prev.map((p) =>
        p.id === panelId
          ? { ...p, renewDate: renew.toISOString().split('T')[0], status: 'Active' as const }
          : p
      )
    );

    const rentTx: PaymentTransaction = {
      id: `tx-cp-renew-${Date.now()}`,
      method: 'eSewa',
      amount: target.priceMonthly,
      currency: 'NPR',
      fee: 0,
      status: 'Completed',
      transactionId: `CP-RENEW-${Date.now().toString().slice(-6)}`,
      notes: `Child Panel Renewal for ${target.domain} (+30 Days)`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setTransactions((prev) => [rentTx, ...prev]);

    alert(`Child panel ${target.domain} successfully renewed for 30 days!`);
    return true;
  };

  const handleToggleAutoRenewChildPanel = (panelId: string) => {
    setChildPanels((prev) =>
      prev.map((p) => (p.id === panelId ? { ...p, autoRenew: !p.autoRenew } : p))
    );
  };

  const handleUpdateChildPanelMargin = (panelId: string, marginPercent: number) => {
    setChildPanels((prev) =>
      prev.map((p) => (p.id === panelId ? { ...p, profitMarginPercent: marginPercent } : p))
    );
  };

  // If navigating to /admin, isolate completely from regular client website
  if (activeTab === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginGate
          availableUsers={availableUsers}
          onAuthenticated={(adminAcc) => {
            setIsAdminAuthenticated(true);
            setIsLoggedIn(true);
            setUser(adminAcc);
          }}
          onCancel={() => {
            window.history.pushState({}, '', '/');
            setActiveTab('dashboard');
          }}
          onUpdateUsers={setAvailableUsers}
          onOpenInstaller={() => setIsInstallWizardOpen(true)}
        />
      );
    }

    // Authenticated Admin View: Standalone Full-screen Admin Console
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-red-500/30 selection:text-red-200">
        {/* Main Admin Panel Body */}
        <main className="flex-1 w-full mx-auto">
          <AdminPanelTab
            currentUser={user}
            allUsers={availableUsers}
            orders={orders}
            services={services}
            transactions={transactions}
            tickets={tickets}
            childPanels={childPanels}
            notices={notices}
            systemSettings={systemSettings}
            staffMembers={staffMembers}
            wholesalerProviders={wholesalerProviders}
            passwordResetRequests={passwordResetRequests}
            initialSection={adminInitialSection}
            onUpdateCurrentUser={handleUpdateUserProfile}
            onUpdateSystemSettings={setSystemSettings}
            onUpdateStaff={setStaffMembers}
            onUpdateWholesalerProviders={setWholesalerProviders}
            onUpdatePasswordResetRequests={setPasswordResetRequests}
            onUpdateUsers={setAvailableUsers}
            onUpdateOrders={setOrders}
            onUpdateServices={setServices}
            onUpdateTransactions={setTransactions}
            onUpdateTickets={setTickets}
            onUpdateChildPanels={setChildPanels}
            onUpdateNotices={setNotices}
            onApproveDeposit={handleApproveDeposit}
            onRejectDeposit={handleRejectDeposit}
            onImpersonateUser={(targetUser) => {
              setUser(targetUser);
              setActiveTab('dashboard');
            }}
            onNavigateTab={setActiveTab}
            onLockAdmin={() => {
              try {
                sessionStorage.removeItem('smm_admin_authenticated');
                localStorage.removeItem('smm_admin_authenticated');
              } catch (e) {}
              setIsAdminAuthenticated(false);
              const effectiveAdminRoute = `/${(systemSettings.adminRoutePath || 'admin').replace(/^\/+/, '')}`;
              window.history.pushState({}, '', effectiveAdminRoute);
              setActiveTab('admin');
            }}
          />
        </main>

        {/* Admin Toast Notifications */}
        <ToastNotificationContainer
          toasts={toasts}
          onDismiss={handleDismissToast}
          onViewOrder={handleViewOrderFromToast}
          onClearAll={handleClearAllToasts}
        />
      </div>
    );
  }

  const isStaffOrAdmin =
    (isLoggedIn && (
      user?.role === 'admin' ||
      user?.role === 'superadmin' ||
      user?.role === 'manager' ||
      user?.role === 'partner' ||
      user?.role === 'staff' ||
      user?.tier === 'Admin' ||
      user?.tier === 'Staff'
    )) ||
    isAdminAuthenticated;

  // Global Maintenance Mode Guard: If maintenance mode is active,
  // block visitor/client website with clean MaintenanceScreen (Only Email Contact).
  if (systemSettings.maintenanceMode) {
    return <MaintenanceScreen systemSettings={systemSettings} />;
  }

  // If not logged in on standard routes, show the Login and Registration Dashboard
  if (!isLoggedIn) {
    return (
      <>
        <AuthDashboard
          availableUsers={availableUsers}
          systemSettings={systemSettings}
          isInstallerLocked={true}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onOpenAdmin={() => {
            const effectiveAdminRoute = `/${(systemSettings.adminRoutePath || 'admin').replace(/^\/+/, '')}`;
            window.history.pushState({}, '', effectiveAdminRoute);
            setActiveTab('admin');
          }}
        />

        {/* Web Database & SuperAdmin Installation Wizard Modal (only if explicitly invoked) */}
        {isInstallWizardOpen && (
          <InstallWizardModal
            isOpen={isInstallWizardOpen}
            onClose={() => setIsInstallWizardOpen(false)}
            onCompleteInstallation={handleCompleteInstallation}
            isReinstall={true}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 py-3.5">
        {/* Permanent Low Balance Warning Banner */}
        {isLowBalance && (
          <div
            id="low-balance-navbar-banner"
            role="alert"
            className="max-w-7xl mx-auto mb-3 bg-gradient-to-r from-red-950/90 via-amber-950/80 to-red-950/90 border border-amber-500/60 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-950/40 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Low Balance Warning
                  </span>
                  <span className="text-xs font-mono font-bold text-red-400">
                    Rs. {user.balance.toLocaleString()} NPR
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Your account balance has dropped below <strong>50 NPR</strong>. Auto-processing and instant dispatch may be paused until topped up.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('add_funds')}
              className="shrink-0 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Add Funds (eSewa / Khalti)</span>
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Corner: Brand Logo + Interactive User Profile Picture & Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-0">
            <div className="flex items-center gap-3">
              {/* Site Logo */}
              <div className="flex items-center gap-2.5 shrink-0">
                {systemSettings.siteLogoUrl ? (
                  <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center p-1.5 overflow-hidden shadow-lg shadow-emerald-500/10">
                    <img
                      src={systemSettings.siteLogoUrl}
                      alt={systemSettings.siteName || 'Logo'}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
                    <div className="h-full w-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                    </div>
                  </div>
                )}
                <div className="hidden lg:block">
                  <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                    {systemSettings.siteName || 'SMM PANEL NEPAL'}
                  </h1>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {systemSettings.siteTagline || 'Social Media Marketing Platform'}
                  </p>
                </div>
              </div>

              {/* Left Corner Interactive User Profile Card (Click to open profile) - Shows Username only */}
              <button
                id="user-left-corner-profile-btn"
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="text-left group flex items-center gap-2.5 p-1.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-emerald-500/50 transition cursor-pointer shadow-sm"
                title="Click your profile to manage name, email, photo, password, and logout"
              >
                <div className="relative shrink-0">
                  <div className="h-8 w-8 rounded-xl bg-neutral-950 border border-emerald-500/40 p-0.5 shadow-md flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="h-full w-full object-cover rounded-[7px]"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-[7px] flex items-center justify-center text-xs font-black text-neutral-950">
                        {(user.username || 'US').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-neutral-900 animate-pulse"></span>
                </div>

                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-200 truncate max-w-[120px] group-hover:text-emerald-400 transition-colors">
                      @{user.username}
                    </span>
                  </div>
                  <div className="text-[9px] text-neutral-400 font-mono">
                    Account Profile
                  </div>
                </div>
              </button>
            </div>

            {/* Balance in user panel shown below website logo and user profile: just Rs .. (Clickable to Add Funds) */}
            <button
              id="header-balance-clickable-btn"
              type="button"
              onClick={() => setActiveTab('add_funds')}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/50 transition cursor-pointer flex items-center gap-2 shadow-sm self-start sm:self-auto"
              title="Click to add funds"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left font-mono">
                <span className="text-xs font-black text-emerald-400">
                  Rs. {user.balance.toLocaleString()}
                </span>
              </div>
            </button>
          </div>

          {/* Right Corner: Notification Bell + Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <NotificationBell
              notifications={userNotifications}
              onMarkAsRead={(id) =>
                setUserNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                )
              }
              onMarkAllAsRead={() =>
                setUserNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
              }
              onClearAll={() => setUserNotifications([])}
              onDeleteNotification={(id) =>
                setUserNotifications((prev) => prev.filter((n) => n.id !== id))
              }
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSimulateAlert={handleSimulateAlert}
            />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-3 overflow-x-auto scrollbar-none hidden md:flex items-center gap-1.5 border-t border-neutral-800/80 pt-2.5 relative">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'new_order', label: 'New Order', icon: Zap },
            { id: 'orders', label: 'Order History', icon: ShoppingCart },
            { id: 'services', label: 'Services & Rates', icon: List },
            { id: 'child_panel', label: 'Child Panel', icon: Globe },
            { id: 'add_funds', label: 'Add Funds', icon: Wallet },
            { id: 'transactions', label: 'Transactions', icon: Receipt },
            { id: 'referrals', label: 'Referral System (1.8%)', icon: Gift },
            { id: 'ai_advisor', label: 'AI Strategist', icon: Sparkles },
            { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
            { id: 'api', label: 'Reseller API', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setAdminDropdownOpen(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-neutral-950 font-bold shadow-lg shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Admin Panel Direct Entry Button - Strictly restricted to Staff and Admin accounts */}
          {isSuperOrAdmin && (
            <div className="shrink-0 ml-auto">
              <button
                id="admin-panel-direct-btn"
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  (activeTab as string) === 'admin'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'text-red-400 hover:text-white hover:bg-red-950/50 border border-red-500/30'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Admin Panel</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 border-t border-neutral-800 mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'new_order', label: 'New Order', icon: Zap },
                { id: 'orders', label: 'Order History', icon: ShoppingCart },
                { id: 'services', label: 'Services', icon: List },
                { id: 'child_panel', label: 'Child Panel', icon: Globe },
                { id: 'add_funds', label: 'Add Funds', icon: Wallet },
                { id: 'transactions', label: 'Transactions', icon: Receipt },
                { id: 'referrals', label: 'Referrals (1.8%)', icon: Gift },
                { id: 'ai_advisor', label: 'AI Strategist', icon: Sparkles },
                { id: 'support', label: 'Support', icon: LifeBuoy },
                { id: 'api', label: 'Reseller API', icon: Code },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      isActive
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : 'bg-neutral-900 text-neutral-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Admin Panel Direct Entry Option - Strictly restricted to Staff and Admin accounts */}
            {isSuperOrAdmin && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-left text-xs font-bold text-red-300 hover:text-white flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Admin Panel Console</span>
                  </div>
                  <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold">
                    Staff / Admin
                  </span>
                </button>
              </div>
            )}

            {/* Mobile Auth Actions */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setProfileModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>@{user.username}</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs font-semibold text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            user={user}
            orders={orders}
            services={services}
            notices={notices}
            onNavigateTab={setActiveTab}
            onQuickOrder={handleSelectServiceToOrder}
            systemSettings={systemSettings}
          />
        )}

        {activeTab === 'new_order' && (
          <NewOrderTab
            services={services}
            user={user}
            onPlaceOrder={handlePlaceOrder}
            onSelectServiceDetails={handleSelectServiceToOrder}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            onRefillOrder={handleRefillOrder}
            onNavigateToNewOrder={() => setActiveTab('new_order')}
          />
        )}

        {activeTab === 'services' && (
          <ServicesTab
            services={services}
            onSelectServiceToOrder={handleSelectServiceToOrder}
          />
        )}

        {activeTab === 'child_panel' && (
          <ChildPanelTab
            user={user}
            childPanels={childPanels.filter((p) => !p.userId || p.userId === user.id)}
            onCreateChildPanel={handleCreateChildPanel}
            onRenewChildPanel={handleRenewChildPanel}
            onToggleAutoRenew={handleToggleAutoRenewChildPanel}
            onUpdateMargin={handleUpdateChildPanelMargin}
            onNavigateTab={setActiveTab}
            systemSettings={systemSettings}
          />
        )}

        {activeTab === 'add_funds' && (
          <AddFundsTab
            user={user}
            transactions={transactions}
            systemSettings={systemSettings}
            onAddFunds={handleAddFunds}
            onNavigateToTransactions={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab
            user={user}
            transactions={transactions}
            onNavigateTab={setActiveTab}
            systemSettings={systemSettings}
          />
        )}

        {activeTab === 'referrals' && (
          <ReferralTab
            user={user}
            onAddFunds={handleAddFunds}
            onNavigateTab={setActiveTab}
            systemSettings={systemSettings}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            user={user}
            onUpdateUser={handleUpdateUserProfile}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'ai_advisor' && <AIAdvisorTab />}

        {activeTab === 'support' && (
          <SupportTab
            tickets={tickets}
            orders={orders}
            onCreateTicket={handleCreateTicket}
            onAddTicketMessage={handleAddTicketMessage}
          />
        )}

        {activeTab === 'api' && (
          <APIDocsTab user={user} services={services} systemSettings={systemSettings} />
        )}
      </main>

      {/* Auth Modal (Login / Register / Forgot Password) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        availableUsers={availableUsers}
        systemSettings={systemSettings}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Profile & API Settings Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        user={user}
        onClose={() => setProfileModalOpen(false)}
        onUpdateUser={handleUpdateUserProfile}
        onLogout={handleLogout}
        onNavigateTab={setActiveTab}
        theme={appTheme}
        onToggleTheme={setAppTheme}
        showToast={handleCustomToast}
      />

      {/* Toast Notification Container */}
      <ToastNotificationContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onViewOrder={handleViewOrderFromToast}
        onClearAll={handleClearAllToasts}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 px-4 text-center text-xs text-neutral-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>{systemSettings.siteName || 'SMM Panel Nepal'} • Official Nepalese Rupee (NPR) Reseller Network</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
            <span>Payments: Fonepay QR • eSewa • Khalti • ConnectIPS • IME Pay</span>
            <span>•</span>
            <span>24/7 Fast Automated Dispatch</span>
          </div>
        </div>
      </footer>

      {/* Floating Live Chat Widget */}
      <LiveChatWidget currentUser={user} systemSettings={systemSettings} />

      {/* Floating PWA Install App Button at Bottom Right */}
      <PWAInstallButton variant="floating" />

      {/* Web Database & SuperAdmin Installation Wizard Modal (only if explicitly invoked) */}
      {isInstallWizardOpen && (
        <InstallWizardModal
          isOpen={isInstallWizardOpen}
          onClose={() => setIsInstallWizardOpen(false)}
          onCompleteInstallation={handleCompleteInstallation}
          isReinstall={true}
        />
      )}

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
export default App;

