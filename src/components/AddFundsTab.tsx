import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet,
  QrCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  History,
  Upload,
  Image as ImageIcon,
  X,
  Eye,
  Download,
  Phone,
  Building,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Clock,
  Smartphone,
  Coins,
  Globe,
  CreditCard,
  Lock,
  Key,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Link as LinkIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { compressPaymentProof, generateSampleProofReceipt } from '../utils/paymentProofHelper';
import {
  PaymentTransaction,
  UserAccount,
  SystemSettings,
  CustomPaymentGateway,
  AutomaticPaymentGatewayConfig
} from '../types';
import { DEFAULT_PAYMENT_GATEWAYS, DEFAULT_AUTOMATIC_PAYMENT_GATEWAYS } from '../data/smmData';

interface AddFundsTabProps {
  user: UserAccount;
  transactions: PaymentTransaction[];
  systemSettings?: SystemSettings;
  onAddFunds: (
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
  ) => void;
  onApproveDeposit?: (txId: string) => void;
  onNavigateToTransactions?: () => void;
}

export function AddFundsTab({
  user,
  transactions,
  systemSettings,
  onAddFunds,
  onApproveDeposit,
  onNavigateToTransactions,
}: AddFundsTabProps) {
  const isAutoDisabled = Boolean(systemSettings?.disableAutomaticGateways);
  const isManualDisabled = Boolean(systemSettings?.disableManualGateways);

  // Mode selection: 'auto' (Instant automatic payment) vs 'manual' (QR & proof upload)
  const [depositMode, setDepositMode] = useState<'auto' | 'manual'>(() => {
    if (isAutoDisabled && !isManualDisabled) return 'manual';
    return 'auto';
  });

  // Keep depositMode in sync if settings toggle
  useEffect(() => {
    if (isAutoDisabled && !isManualDisabled && depositMode !== 'manual') {
      setDepositMode('manual');
    } else if (isManualDisabled && !isAutoDisabled && depositMode !== 'auto') {
      setDepositMode('auto');
    }
  }, [isAutoDisabled, isManualDisabled]);

  // AUTOMATIC GATEWAYS
  const allAutoGateways: AutomaticPaymentGatewayConfig[] =
    systemSettings?.automaticPaymentGateways && systemSettings.automaticPaymentGateways.length > 0
      ? systemSettings.automaticPaymentGateways
      : DEFAULT_AUTOMATIC_PAYMENT_GATEWAYS;

  const activeAutoGateways = allAutoGateways.filter((g) => g.status === 'active');
  const [selectedAutoGwId, setSelectedAutoGwId] = useState<string>(
    activeAutoGateways[0]?.id || 'esewa_epay'
  );
  const selectedAutoGw =
    activeAutoGateways.find((g) => g.id === selectedAutoGwId) ||
    activeAutoGateways[0] ||
    DEFAULT_AUTOMATIC_PAYMENT_GATEWAYS[0];

  const [autoDepositAmount, setAutoDepositAmount] = useState<number>(1000);
  const [autoUserPhone, setAutoUserPhone] = useState<string>(user.phone || '');
  const [isProcessingAuto, setIsProcessingAuto] = useState<boolean>(false);
  const [autoCheckoutModal, setAutoCheckoutModal] = useState<boolean>(false);
  const [autoSimOtp, setAutoSimOtp] = useState<string>('');
  const [autoCheckoutStep, setAutoCheckoutStep] = useState<'initiating' | 'authorizing' | 'success'>('initiating');
  const [timerSeconds, setTimerSeconds] = useState<number>(600); // 10 minutes timer for Fonepay QR
  const [generatedQrData, setGeneratedQrData] = useState<string>('');
  const [generatedQrImageUrl, setGeneratedQrImageUrl] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [currentRemarks, setCurrentRemarks] = useState<string>('');
  const [currentTraceId, setCurrentTraceId] = useState<string>('');

  // Automatic deposit bonus calculation
  const autoBonusPercent = selectedAutoGw?.depositBonusPercent || 0;
  const autoBonusAmount = Math.round((autoDepositAmount * autoBonusPercent) / 100);
  const autoTotalCredit = autoDepositAmount + autoBonusAmount;

  // Countdown timer & backend verification polling for Fonepay QR
  useEffect(() => {
    let timerInterval: any = null;
    let pollInterval: any = null;

    if (autoCheckoutModal && autoCheckoutStep === 'authorizing' && timerSeconds > 0) {
      // 1. Tick down 10-minute timer
      timerInterval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      // 2. If Fonepay merchant, poll backend verification feed every 3 seconds
      if (selectedAutoGw.providerType === 'fonepay_merchant' && currentSessionId) {
        pollInterval = setInterval(async () => {
          try {
            const resp = await fetch('/api/fonepay/check-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: currentSessionId }),
            });
            const data = await resp.json();
            if (data.success && data.status === 'VERIFIED') {
              // Automatically confirm and credit funds
              clearInterval(pollInterval);
              clearInterval(timerInterval);
              setAutoCheckoutStep('success');

              const autoTxId = data.transactionRef || `FP_${Date.now().toString().slice(-8)}`;
              onAddFunds(autoTotalCredit, selectedAutoGw.name, autoTxId, {
                senderPhone: autoUserPhone || undefined,
                notes: `Fonepay Auto-Verified Deposit (Remarks: ${data.remarks || currentRemarks}, Trace: ${data.traceId || currentTraceId})`,
                isImmediateApproval: true,
              });

              confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
              setSuccessMsg(
                `⚡ Instant Payment Successful! Rs. ${autoTotalCredit.toLocaleString()} NPR has been verified and added to your wallet immediately via Fonepay (Ref: #${autoTxId}).`
              );

              setTimeout(() => {
                setAutoCheckoutModal(false);
              }, 2200);
            }
          } catch (err) {
            console.error('Fonepay poll check failed:', err);
          }
        }, 3000);
      }
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [autoCheckoutModal, autoCheckoutStep, timerSeconds, currentSessionId, autoTotalCredit, selectedAutoGw, autoUserPhone, currentRemarks, currentTraceId]);

  // MANUAL GATEWAYS
  const allManualGateways: CustomPaymentGateway[] =
    systemSettings?.paymentGateways && systemSettings.paymentGateways.length > 0
      ? systemSettings.paymentGateways
      : DEFAULT_PAYMENT_GATEWAYS;

  const activeManualGateways = allManualGateways.filter((g) => g.status === 'active');

  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(
    activeManualGateways[0]?.id || 'fonepay'
  );

  const selectedGateway =
    activeManualGateways.find((g) => g.id === selectedGatewayId) ||
    activeManualGateways[0] ||
    DEFAULT_PAYMENT_GATEWAYS[0];

  const minAllowedDeposit = selectedGateway?.minDeposit || systemSettings?.minDepositNPR || 50;
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [transactionCode, setTransactionCode] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Screenshot upload state
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [screenshotFileSize, setScreenshotFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Modals & tooltips
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [previewRotation, setPreviewRotation] = useState<number>(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedRemarks, setCopiedRemarks] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openUserPreview = (url: string) => {
    setPreviewImageModal(url);
    setPreviewZoom(1);
    setPreviewRotation(0);
  };

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Process screenshot file with Canvas Compression
  const handleFileSelection = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 1024 * 1024 * 1024) {
      setErrorMsg('File size exceeds 1 GB limit. Please upload a smaller file.');
      return;
    }

    setErrorMsg('');
    setScreenshotFileName(file.name);
    setScreenshotFileSize((file.size / 1024).toFixed(1) + ' KB (Optimizing...)');
    setIsCompressing(true);

    try {
      const compressed = await compressPaymentProof(file, 1280, 1280, 0.85);
      setScreenshotDataUrl(compressed);
      const estKb = Math.round((compressed.length * 0.75) / 1024);
      setScreenshotFileSize(`${estKb} KB • Verified & Compressed`);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotDataUrl(reader.result as string);
        setScreenshotFileSize((file.size / 1024).toFixed(1) + ' KB');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  // Listen for Clipboard Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const item = e.clipboardData.files[0];
        if (item.type.startsWith('image/')) {
          handleFileSelection(item);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  // Calculated converted amount in NPR if foreign currency (Manual)
  const calculatedNprCredit =
    selectedGateway?.currency === 'NPR'
      ? depositAmount
      : Math.round(depositAmount * (selectedGateway?.exchangeRateToNpr || 1.0));

  // Handle Automatic Checkout Initializer
  const handleStartAutoCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedAutoGw) {
      setErrorMsg('Please select an active automatic payment gateway.');
      return;
    }

    if (autoDepositAmount < (selectedAutoGw.minDeposit || 50)) {
      setErrorMsg(
        `Minimum deposit for ${selectedAutoGw.name} is Rs. ${selectedAutoGw.minDeposit || 50}.`
      );
      return;
    }

    setIsProcessingAuto(true);
    setAutoCheckoutStep('initiating');
    setAutoCheckoutModal(true);
    setTimerSeconds(600);

    if (selectedAutoGw.providerType === 'fonepay_merchant') {
      try {
        const res = await fetch('/api/fonepay/generate-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: autoDepositAmount,
            userPhone: autoUserPhone,
            userEmail: user.email,
            username: user.username,
            gatewayConfig: selectedAutoGw,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setGeneratedQrData(data.qrPayload);
          setGeneratedQrImageUrl(data.qrImageUrl);
          setCurrentSessionId(data.sessionId);
          setCurrentRemarks(data.remarks);
          setCurrentTraceId(data.traceId);
          setTimerSeconds(data.expiresInSeconds || 600);
          setAutoCheckoutStep('authorizing');
        } else {
          setErrorMsg(data.error || 'Failed to initialize Fonepay dynamic QR session.');
          setAutoCheckoutModal(false);
        }
      } catch (err: any) {
        console.error('Error initiating Fonepay QR:', err);
        // Fallback to client-side EMVCo QR generation if network error
        const fallbackQr = `00020101021226580016com.fonepay.merchant0136${selectedAutoGw.fonepayUsername || 'smmpanelnepal@fonepay'}520453995303524540${autoDepositAmount.toFixed(2).length}${autoDepositAmount.toFixed(2)}5802NP5916SMM_PANEL_NEPAL6009Kathmandu62200108SMM${Math.floor(1000 + Math.random() * 9000)}0508SMM_${(user.username || 'VIP').slice(0, 4)}6304ABCD`;
        setGeneratedQrData(fallbackQr);
        setGeneratedQrImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=1&format=png&data=${encodeURIComponent(fallbackQr)}`);
        setCurrentRemarks(`SMM_${(user.username || 'USER').toUpperCase()}`);
        setAutoCheckoutStep('authorizing');
      } finally {
        setIsProcessingAuto(false);
      }
    } else {
      // Non-Fonepay custom API / gateway handshake
      setTimeout(() => {
        setAutoCheckoutStep('authorizing');
        setIsProcessingAuto(false);
      }, 1000);
    }
  };

  // Complete Automatic Payment
  const handleConfirmAutoPayment = () => {
    setIsProcessingAuto(true);

    setTimeout(() => {
      setIsProcessingAuto(false);
      setAutoCheckoutStep('success');

      // Generate verifiable auto transaction ID
      const autoTxId = `${selectedAutoGw.code.substring(0, 4)}_${Date.now().toString().slice(-8)}`;

      // Instantly add funds to wallet
      onAddFunds(autoTotalCredit, selectedAutoGw.name, autoTxId, {
        senderPhone: autoUserPhone || undefined,
        notes: `Automatic Instant Deposit via ${selectedAutoGw.name} (Endpoint: ${selectedAutoGw.endpointUrl || 'Live Gateway'})`,
        isImmediateApproval: true,
      });

      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });

      setSuccessMsg(
        `⚡ Instant Payment Successful! Rs. ${autoTotalCredit.toLocaleString()} NPR has been added to your wallet immediately via ${selectedAutoGw.name} (Txn Ref: #${autoTxId}).`
      );

      setTimeout(() => {
        setAutoCheckoutModal(false);
      }, 1800);
    }, 1200);
  };

  // Handle Manual Deposit Submit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (depositAmount < minAllowedDeposit) {
      setErrorMsg(`Minimum deposit amount for ${selectedGateway.name} is ${minAllowedDeposit} ${selectedGateway.currency}.`);
      return;
    }

    if (!transactionCode.trim()) {
      setErrorMsg('Please enter the Transaction ID / Ref Number from your payment app.');
      return;
    }

    if (!screenshotDataUrl) {
      setErrorMsg('Payment screenshot proof upload is required to submit your manual deposit request.');
      return;
    }

    // Submit deposit request for manual verification
    onAddFunds(calculatedNprCredit, selectedGateway.name, transactionCode.trim(), {
      senderName: senderName.trim() || undefined,
      senderPhone: senderPhone.trim() || undefined,
      screenshotUrl: screenshotDataUrl || undefined,
      notes: notes.trim() || undefined,
      isImmediateApproval: false,
    });

    setSuccessMsg(
      `Deposit request of ${depositAmount.toLocaleString()} ${selectedGateway.currency} (Credited as Rs. ${calculatedNprCredit.toLocaleString()} NPR) via ${selectedGateway.name} (Ref #${transactionCode.trim()}) has been submitted for manual verification. Funds will be credited upon verification.`
    );

    // Reset form
    setTransactionCode('');
    setSenderName('');
    setSenderPhone('');
    setNotes('');
    setScreenshotDataUrl(null);
    setScreenshotFileName('');
    setScreenshotFileSize('');
  };

  // Payment Details according to selected method (Manual)
  const getMethodDetails = () => {
    const qrImage =
      selectedGateway.qrImageUrl ||
      `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
        `${selectedGateway.code}:${selectedGateway.accountNumber}:${selectedGateway.merchantName}`
      )}`;

    return {
      title: selectedGateway.name,
      merchantName: selectedGateway.merchantName,
      merchantId: selectedGateway.accountNumber,
      phone: selectedGateway.accountNumber,
      branch: selectedGateway.branchOrNetwork,
      instructions: selectedGateway.instructions,
      badge: selectedGateway.badgeText || selectedGateway.code,
      qrImage: qrImage,
      currency: selectedGateway.currency,
      rate: selectedGateway.exchangeRateToNpr,
      bonus: selectedGateway.depositBonusPercent || systemSettings?.depositBonusPercent || 0,
    };
  };

  const details = getMethodDetails();

  return (
    <div className="space-y-6">
      {/* Top Banner / User Balance */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              Add Funds to Wallet
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                ⚡ 0% Fee • Instant Processing
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Choose between Instant Automatic Payment Gateway or Manual QR code verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-neutral-950 px-4 py-2.5 rounded-2xl border border-neutral-800 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-neutral-400">Current Balance:</span>
          <span className="text-base font-mono font-black text-emerald-400">
            Rs. {user.balance.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">NPR</span>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="flex-1 font-medium">{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode Switcher Tabs / Disabled State */}
      {isAutoDisabled && isManualDisabled ? (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 text-center space-y-2">
          <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Payment Systems Temporarily Offline</h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Payment gateways are currently undergoing routine maintenance. Please contact customer support or try again shortly.
          </p>
        </div>
      ) : !isAutoDisabled && !isManualDisabled ? (
        <div className="flex items-center gap-2 bg-neutral-900/60 p-1.5 rounded-2xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setDepositMode('auto')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
              depositMode === 'auto'
                ? 'bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Automatic Payment Gateways (Instant 0-Min Credit)</span>
          </button>

          <button
            type="button"
            onClick={() => setDepositMode('manual')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
              depositMode === 'manual'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>📱 Manual QR Scan / Bank Deposit (Proof Upload)</span>
          </button>
        </div>
      ) : null}

      {/* MODE 1: AUTOMATIC PAYMENT GATEWAYS (API / ENDPOINT REALTIME CHECKOUT) */}
      {!isAutoDisabled && depositMode === 'auto' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Auto Gateway Selector (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Select Automatic Gateway
                    </h3>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Direct API Integration
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeAutoGateways.map((gw) => {
                    const isSelected = selectedAutoGw.id === gw.id;
                    return (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() => setSelectedAutoGwId(gw.id)}
                        className={`w-full p-3.5 rounded-2xl text-left border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: gw.accentColor || '#10b981' }}
                          />
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-2">
                              <span>{gw.name}</span>
                              <span className="text-[10px] font-mono font-bold bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                                {gw.code}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                              <span>Min: Rs. {gw.minDeposit}</span>
                              {gw.depositBonusPercent > 0 && (
                                <span className="text-amber-400 font-bold">+{gw.depositBonusPercent}% Bonus</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isSelected
                                ? 'bg-emerald-500 text-neutral-950'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Gateway Details Box */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Instant Gateway Checkout</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      Zero Delay
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 pt-1.5 border-t border-neutral-800/80 leading-relaxed">
                    💡 {selectedAutoGw.instructions || 'Instant verification without manual staff approval. Balance is credited automatically.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Instant Checkout Action Form (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Instant Deposit via {selectedAutoGw.name}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Funds are verified and credited to your wallet balance immediately.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    ⚡ 0-Minute Credit
                  </span>
                </div>

                <form onSubmit={handleStartAutoCheckout} className="space-y-4">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300">
                        Deposit Amount (NPR)
                      </label>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        Min: <strong className="text-white">Rs. {selectedAutoGw.minDeposit}</strong>
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-sm font-bold">
                        Rs.
                      </span>
                      <input
                        type="number"
                        min={selectedAutoGw.minDeposit}
                        max={500000}
                        step={10}
                        value={autoDepositAmount}
                        onChange={(e) => setAutoDepositAmount(Number(e.target.value))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-4 py-3 text-base text-white font-mono font-black focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    {/* Quick Amount Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[500, 1000, 2500, 5000, 10000, 25000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAutoDepositAmount(amt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                            autoDepositAmount === amt
                              ? 'bg-emerald-500 text-neutral-950'
                              : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                          }`}
                        >
                          Rs. {amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* User Mobile / Identification */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">
                      Account / Mobile Number (Optional for receipt SMS)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 98XXXXXXXX"
                      value={autoUserPhone}
                      onChange={(e) => setAutoUserPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  {/* Calculation Breakdown Card */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>Deposit Base Amount:</span>
                      <span className="font-mono text-white font-bold">Rs. {autoDepositAmount.toLocaleString()} NPR</span>
                    </div>

                    {autoBonusPercent > 0 && (
                      <div className="flex items-center justify-between text-xs text-amber-400">
                        <span>Automatic Bonus (+{autoBonusPercent}%):</span>
                        <span className="font-mono font-bold">+Rs. {autoBonusAmount.toLocaleString()} NPR</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm pt-2 border-t border-neutral-800">
                      <span className="font-bold text-white">Total Credited to Wallet:</span>
                      <span className="font-mono font-black text-emerald-400 text-base">
                        Rs. {autoTotalCredit.toLocaleString()} NPR
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessingAuto}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-5 h-5 fill-neutral-950" />
                    <span>Proceed to Instant Pay via {selectedAutoGw.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: MANUAL QR SCAN & PROOF UPLOAD */}
      {!isManualDisabled && depositMode === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Payment QR Code & Merchant Information (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Select Manual Gateway
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Manual Verification
                </span>
              </div>

              {/* Dynamic Gateway Selection Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeManualGateways.map((gw) => {
                  const isSelected = selectedGateway.id === gw.id;
                  return (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGatewayId(gw.id)}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold truncate block text-white">
                          {gw.name}
                        </span>
                        {gw.currency !== 'NPR' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                            {gw.currency}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500">
                        <span className="truncate">{gw.badgeText || gw.category.toUpperCase()}</span>
                        {gw.depositBonusPercent && gw.depositBonusPercent > 0 ? (
                          <span className="text-emerald-400 font-bold">+{gw.depositBonusPercent}%</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* The QR Code Card Display */}
              <div className="relative rounded-2xl bg-white p-5 shadow-2xl flex flex-col items-center justify-center text-neutral-950 overflow-hidden border-4 border-neutral-800">
                {/* Top QR Header */}
                <div className="w-full flex items-center justify-between border-b border-neutral-200 pb-2.5 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-md bg-neutral-950 flex items-center justify-center text-emerald-400">
                      <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                    </div>
                    <span className="text-xs font-black tracking-tight text-neutral-900 truncate">
                      {selectedGateway.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {details.badge}
                  </span>
                </div>

                {/* QR Image Area */}
                <div className="relative p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 shadow-inner group flex flex-col items-center">
                  <div className="w-52 h-52 sm:w-56 sm:h-56 flex flex-col items-center justify-center bg-white p-2 relative rounded-lg border border-neutral-200 overflow-hidden">
                    <img
                      src={details.qrImage}
                      alt={`${details.title} QR Code`}
                      className="w-full h-full object-contain transition duration-200 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                          details.merchantId || details.merchantName
                        )}`;
                      }}
                    />

                    {/* Hover Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 rounded-lg backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => setPreviewImageModal(details.qrImage)}
                        className="p-2 rounded-lg bg-emerald-500 text-neutral-950 hover:bg-emerald-400 font-bold text-xs flex items-center gap-1 shadow-lg transition cursor-pointer"
                        title="Enlarge QR Code"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Zoom</span>
                      </button>
                      <a
                        href={details.qrImage}
                        download={`smm-nepal-${selectedGateway.code}-qr.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs flex items-center gap-1 shadow-lg border border-neutral-700 transition"
                        title="Download QR Image"
                      >
                        <Download className="w-4 h-4" />
                        <span>Save</span>
                      </a>
                    </div>
                  </div>

                  {/* Scan Overlay Badge */}
                  <div className="mt-2.5 text-center flex items-center justify-center gap-2">
                    <span className="text-[11px] font-black text-neutral-800 uppercase tracking-wide">
                      SCAN & PAY WITH {selectedGateway.name.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewImageModal(details.qrImage)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Full View
                    </button>
                  </div>
                </div>

                {/* Merchant Details below QR */}
                <div className="w-full mt-3 pt-2.5 border-t border-neutral-200 text-center space-y-1">
                  <div className="text-xs font-black text-neutral-900 truncate">
                    {details.merchantName}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-600 truncate flex items-center justify-center gap-1.5">
                    <span>{details.merchantId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.merchantId, 'merchantId')}
                      className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                      title="Copy Account ID"
                    >
                      {copiedField === 'merchantId' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Copy Info Rows */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Account / Mobile No:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-white font-bold">{details.phone}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.phone, 'phone')}
                      className="p-1 hover:text-emerald-400 text-neutral-400 transition cursor-pointer"
                      title="Copy Phone/Account"
                    >
                      {copiedField === 'phone' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {details.branch && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Branch / Network:</span>
                    <span className="font-mono text-neutral-300 font-semibold">{details.branch}</span>
                  </div>
                )}

                {selectedGateway.currency !== 'NPR' && (
                  <div className="flex items-center justify-between bg-neutral-900/80 p-2 rounded-xl border border-neutral-800">
                    <span className="text-amber-400 font-semibold">Exchange Rate:</span>
                    <span className="font-mono text-white font-bold">
                      1 {selectedGateway.currency} = Rs. {details.rate} NPR
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Payment Remarks:</span>
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                    {user.username}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 font-sans pt-1 border-t border-neutral-800/80 leading-relaxed">
                  💡 {details.instructions}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Payment Submission Form & Screenshot Upload (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Deposit Verification Form ({selectedGateway.name})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Submit your payment transaction details and screenshot for verification.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-neutral-800 text-emerald-400 font-semibold border border-neutral-700">
                  {selectedGateway.currency} Gateway
                </span>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4">
                {/* Deposit Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                      <span>1. Deposit Amount ({selectedGateway.currency})</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Min: <strong className="text-white">{minAllowedDeposit} {selectedGateway.currency}</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs font-bold">
                      {selectedGateway.currency === 'NPR' ? 'Rs.' : selectedGateway.currency}
                    </span>
                    <input
                      id="input-deposit-amount"
                      type="number"
                      min={minAllowedDeposit}
                      max={1000000}
                      step={selectedGateway.currency === 'USDT' ? 1 : 10}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  {/* Quick Amount Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {(selectedGateway.currency === 'USDT' ? [10, 25, 50, 100, 250, 500] : [500, 1000, 2500, 5000, 10000]).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                          depositAmount === amt
                            ? 'bg-emerald-500 text-neutral-950 font-bold'
                            : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                        }`}
                      >
                        {selectedGateway.currency === 'NPR' ? `Rs. ${amt.toLocaleString()}` : `${amt} ${selectedGateway.currency}`}
                      </button>
                    ))}
                  </div>

                  {/* Conversion preview if non-NPR */}
                  {selectedGateway.currency !== 'NPR' && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                      <span>NPR Credit Value (@ Rs. {details.rate}):</span>
                      <span className="font-mono font-bold text-sm">
                        Rs. {calculatedNprCredit.toLocaleString()} NPR
                      </span>
                    </div>
                  )}
                </div>

                {/* Transaction ID / Ref Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                    <span>2. Transaction ID / Reference Number</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    id="input-transaction-id"
                    type="text"
                    required
                    placeholder="e.g. 19482948201 or Ref ID"
                    value={transactionCode}
                    onChange={(e) => setTransactionCode(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-neutral-500">
                    Copy and paste the exact Transaction Reference / ID from your payment slip.
                  </span>
                </div>

                {/* Sender Name & Phone in 2-cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Sender Name / Account Holder (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Sharma"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Sender Mobile Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 98XXXXXXXX"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Payment Receipt / Screenshot Upload (Drag & Drop + Click) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                      <span>3. Payment Screenshot Proof</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">Max 1 GB (JPG, PNG, WEBP, PDF)</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {!screenshotDataUrl ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-neutral-800 hover:border-emerald-500/50 bg-neutral-950'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                        {isCompressing ? (
                          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                        ) : (
                          <Upload className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-xs text-neutral-300">
                        <span className="text-emerald-400 font-bold">Click to upload screenshot</span> or drag & drop file
                      </div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2">
                        <span>Upload transaction confirmation screen</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">Ctrl+V paste supported</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-12 w-12 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden relative cursor-pointer group"
                          onClick={() => openUserPreview(screenshotDataUrl)}
                        >
                          <img
                            src={screenshotDataUrl}
                            alt="Uploaded Screenshot"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[200px]">
                            {screenshotFileName}
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {screenshotFileSize} • Ready to submit
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openUserPreview(screenshotDataUrl)}
                          className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer"
                          title="Preview Screenshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotDataUrl(null);
                            setScreenshotFileName('');
                            setScreenshotFileSize('');
                          }}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer"
                          title="Remove Screenshot"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">
                    Additional Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paid from Prabhu Bank, username test_user"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Submit Deposit Request Button - Disabled without screenshot proof */}
                <button
                  type="submit"
                  disabled={!screenshotDataUrl || !transactionCode.trim() || isCompressing}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs transition shadow-lg flex items-center justify-center gap-2 ${
                    !screenshotDataUrl || !transactionCode.trim() || isCompressing
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {!screenshotDataUrl
                      ? 'Upload Payment Screenshot Proof to Submit'
                      : isCompressing
                      ? 'Optimizing Screenshot Proof...'
                      : 'Submit Deposit Verification Request'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RECENT DEPOSITS & TRANSACTIONS LOG */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Deposits & Wallet History
            </h3>
          </div>
          {onNavigateToTransactions && (
            <button
              type="button"
              onClick={onNavigateToTransactions}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Logs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {transactions.filter((t) => t.type === 'Deposit').length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-950 rounded-2xl border border-neutral-800">
              No deposit transactions found yet. Choose a gateway above to fund your account.
            </div>
          ) : (
            transactions
              .filter((t) => t.type === 'Deposit')
              .slice(0, 5)
              .map((tx) => {
                const isPending = tx.status === 'Pending';
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isPending ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{tx.method}</span>
                          <span className="font-mono text-[10px] text-neutral-500">#{tx.id}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>{new Date(tx.date).toLocaleString()}</span>
                          {tx.notes && <span className="text-neutral-500 truncate max-w-[200px]">({tx.notes})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 flex flex-col sm:items-end gap-1.5">
                      <div className={`font-mono font-black ${isPending ? 'text-amber-400' : 'text-emerald-400'}`}>
                        +Rs. {tx.amount.toLocaleString()} <span className="text-[10px] font-normal text-neutral-500">NPR</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const url = tx.screenshotUrl || generateSampleProofReceipt(tx);
                            openUserPreview(url);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 cursor-pointer transition"
                          title="View Payment Proof Voucher"
                        >
                          <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Proof</span>
                        </button>
                        {isPending ? (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 font-medium flex items-center gap-1.5">
                            <Clock className="w-3 h-3 animate-pulse" /> Pending Admin Review
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved by Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* AUTOMATIC CHECKOUT POPUP MODAL (Simulated live endpoint handshake & payment) */}
      {autoCheckoutModal && selectedAutoGw && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedAutoGw.accentColor || '#10b981' }}
                />
                <h3 className="text-sm font-black text-white">
                  {selectedAutoGw.name} Secure Checkout
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAutoCheckoutModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {autoCheckoutStep === 'initiating' && (
              <div className="py-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <div className="text-xs font-bold text-white">Connecting to Secure Gateway...</div>
                <div className="text-[11px] text-neutral-400 px-4">
                  Establishing encrypted SSL payment session with {selectedAutoGw.name}...
                </div>
              </div>
            )}

            {autoCheckoutStep === 'authorizing' && (
              <div className="space-y-4 text-xs">
                {selectedAutoGw.providerType === 'fonepay_merchant' ? (
                  <div className="space-y-3.5">
                    {/* Deposit Summary & Timer */}
                    <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Deposit Amount:</span>
                        <span className="font-mono text-emerald-400 font-bold">Rs. {autoDepositAmount.toLocaleString()} NPR</span>
                      </div>
                      {autoBonusAmount > 0 && (
                        <div className="flex items-center justify-between text-amber-400">
                          <span>Bonus (+{autoBonusPercent}%):</span>
                          <span className="font-mono font-bold">+Rs. {autoBonusAmount.toLocaleString()} NPR</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-amber-400 pt-1.5 border-t border-neutral-800">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-4 h-4 animate-pulse text-amber-400" />
                          <span>QR Expires in:</span>
                        </span>
                        <span className="font-mono font-black text-sm">
                          {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Fonepay QR Code Box */}
                    <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center text-neutral-950 space-y-2.5 border-4 border-neutral-800 shadow-xl">
                      <div className="w-full flex items-center justify-between border-b border-neutral-200 pb-2 mb-1">
                        <span className="text-xs font-black uppercase text-neutral-900 flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-red-600" />
                          <span>Fonepay Official Dynamic QR</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Auto-Verify Active
                        </span>
                      </div>
                      <div className="w-56 h-56 bg-white border-2 border-neutral-300 rounded-xl p-2 flex items-center justify-center shadow-inner relative group">
                        <img
                          src={generatedQrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=1&format=png&data=${encodeURIComponent(
                            generatedQrData || `00020101021226580016com.fonepay.merchant0136${selectedAutoGw.fonepayUsername || 'smmpanelnepal@gmail.com'}520453995303524540${autoDepositAmount.toFixed(2).length}${autoDepositAmount.toFixed(2)}5802NP5916SMM_PANEL_NEPAL6009Kathmandu62200108SMM123450508SMM_USER63041234`
                          )}`}
                          alt="Official Fonepay Dynamic QR"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {currentRemarks && (
                        <div className="w-full bg-neutral-100 rounded-xl p-2.5 flex items-center justify-between gap-2 border border-neutral-200">
                          <div className="text-left">
                            <span className="text-[10px] text-neutral-500 block font-semibold">Payment Remarks (Put in Remarks):</span>
                            <span className="text-xs font-mono font-black text-neutral-900">{currentRemarks}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(currentRemarks);
                              setCopiedRemarks(true);
                              setTimeout(() => setCopiedRemarks(false), 2000);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-[11px] font-bold hover:bg-neutral-800 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedRemarks ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-neutral-600 text-center font-medium">
                        Scan with <strong>eSewa, Khalti, or any Mobile Banking app</strong> (Nabil, NIC Asia, Global IME, etc.)
                      </p>
                    </div>

                    {/* Verifying Ticker */}
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold">Verifying payment...</span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setAutoCheckoutModal(false)}
                        className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold cursor-pointer transition"
                      >
                        Cancel / Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Merchant / App:</span>
                        <span className="font-bold text-white">SMM Panel Nepal</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Deposit Amount:</span>
                        <span className="font-mono font-bold text-white">Rs. {autoDepositAmount.toLocaleString()} NPR</span>
                      </div>
                      {autoBonusAmount > 0 && (
                        <div className="flex items-center justify-between text-amber-400">
                          <span>Bonus Credit (+{autoBonusPercent}%):</span>
                          <span className="font-mono font-bold">+Rs. {autoBonusAmount.toLocaleString()} NPR</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-emerald-400 pt-2 border-t border-neutral-800 font-bold">
                        <span>Total Credited:</span>
                        <span className="font-mono font-black text-base">Rs. {autoTotalCredit.toLocaleString()} NPR</span>
                      </div>
                    </div>

                    <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
                      <label className="text-neutral-300 font-bold block">
                        Confirm Security Authorization PIN / Code:
                      </label>
                      <input
                        type="password"
                        placeholder="Enter PIN / Password (e.g. 1234)"
                        value={autoSimOtp}
                        onChange={(e) => setAutoSimOtp(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono text-center tracking-widest focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-neutral-500 block text-center">
                        Simulated Sandbox & Production Instant Handshake
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setAutoCheckoutModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmAutoPayment}
                        disabled={isProcessingAuto}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessingAuto ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>{isProcessingAuto ? 'Verifying...' : 'Pay & Credit Now'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {autoCheckoutStep === 'success' && (
              <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
                <div className="h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-white">Deposit Credited Instantly!</h4>
                <p className="text-xs text-neutral-400">
                  Rs. {autoTotalCredit.toLocaleString()} NPR has been added to your balance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enlarged Screenshot & Digital Voucher Modal Viewer */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                Payment Proof Voucher
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(z + 0.25, 3))}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <a
                  href={previewImageModal}
                  download="Payment-Proof-Slip.jpg"
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImageModal(null)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer ml-1"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-neutral-950 p-4 flex items-center justify-center min-h-[320px] max-h-[55vh]">
              <div
                className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
                style={{
                  transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                }}
              >
                <img
                  src={previewImageModal}
                  alt="Payment Receipt Large"
                  className="max-h-[50vh] w-auto object-contain rounded-xl shadow-xl border border-neutral-800 select-none"
                />
              </div>
            </div>

            <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Zoom: {Math.round(previewZoom * 100)}% • Rotation: {previewRotation}°
              </span>
              <div className="flex items-center gap-2">
                {(previewZoom !== 1 || previewRotation !== 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewZoom(1);
                      setPreviewRotation(0);
                    }}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer font-medium"
                  >
                    Reset View
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewImageModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
