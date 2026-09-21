import { PaymentTransaction } from '../types';

/**
 * Compresses an image (File or Data URL) using HTML5 Canvas
 * Resizes to max dimension (default 1280px) and outputs high-efficiency JPEG.
 * Reduces 3MB-8MB mobile screenshots down to ~70KB-160KB while preserving
 * sharp text for transaction IDs, amounts, and bank stamps.
 */
export async function compressPaymentProof(
  input: File | string,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    let srcUrl = '';
    let isObjectUrl = false;

    if (typeof input === 'string') {
      srcUrl = input;
    } else {
      srcUrl = URL.createObjectURL(input);
      isObjectUrl = true;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (isObjectUrl) {
        URL.revokeObjectURL(srcUrl);
      }

      let { width, height } = img;

      // Scale down proportionally if larger than bounds
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(typeof input === 'string' ? input : srcUrl);
        return;
      }

      // Draw with white background for transparency safety
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        // Fallback to original
        resolve(typeof input === 'string' ? input : srcUrl);
      }
    };

    img.onerror = (err) => {
      if (isObjectUrl) {
        URL.revokeObjectURL(srcUrl);
      }
      reject(err);
    };

    img.src = srcUrl;
  });
}

/**
 * Generates an SVG Data URI representing an official Nepali payment receipt voucher.
 * Tailored styling for eSewa (green), Khalti (purple), Fonepay (red), Bank Transfer (deep blue), USDT (teal).
 */
export function generateSampleProofReceipt(tx: Partial<PaymentTransaction>): string {
  const method = tx.method || 'Fonepay';
  const txCode = tx.transactionId || tx.id || `TXN-${Date.now().toString().slice(-8)}`;
  const amount = Number(tx.amount || 1000).toLocaleString();
  const sender = tx.senderName || 'Authorized Client';
  const phone = tx.senderPhone || '98XXXXXXXX';
  const date = tx.date || new Date().toISOString().replace('T', ' ').substring(0, 16);
  const status = tx.status || 'Pending';

  let brandColor = '#dc2626'; // Fonepay red
  let brandName = 'Fonepay Direct QR';
  let badgeText = 'FONEPAY MERCHANT';

  if (method.toLowerCase().includes('esewa')) {
    brandColor = '#60bb46';
    brandName = 'eSewa Mobile Wallet';
    badgeText = 'ESEWA VERIFIED';
  } else if (method.toLowerCase().includes('khalti')) {
    brandColor = '#5c2d91';
    brandName = 'Khalti Digital Wallet';
    badgeText = 'KHALTI WALLET';
  } else if (method.toLowerCase().includes('bank') || method.toLowerCase().includes('nabil') || method.toLowerCase().includes('connectips')) {
    brandColor = '#1e3a8a';
    brandName = 'Nepal Banking Network / IPS';
    badgeText = 'BANK TRANSFER';
  } else if (method.toLowerCase().includes('usdt') || method.toLowerCase().includes('crypto')) {
    brandColor = '#0d9488';
    brandName = 'USDT TRC-20 / Crypto';
    badgeText = 'BLOCKCHAIN CONFIRMED';
  }

  const svgContent = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 760" width="540" height="760">
    <defs>
      <linearGradient id="gradHeader" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${brandColor}" />
        <stop offset="100%" stop-color="${brandColor}dd" />
      </linearGradient>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15" />
      </filter>
    </defs>

    <!-- Background card -->
    <rect x="15" y="15" width="510" height="730" rx="28" fill="#ffffff" filter="url(#cardShadow)" stroke="#e5e7eb" stroke-width="1.5" />

    <!-- Top Header Ribbon -->
    <rect x="15" y="15" width="510" height="150" rx="28" fill="url(#gradHeader)" />
    <rect x="15" y="125" width="510" height="40" fill="url(#gradHeader)" />

    <!-- Brand icon badge -->
    <circle cx="270" cy="80" r="32" fill="#ffffff" />
    <circle cx="270" cy="80" r="28" fill="${brandColor}" />
    <!-- Checkmark icon -->
    <path d="M258 80 L266 88 L282 72" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <text x="270" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ${brandName.toUpperCase()}
    </text>
    <text x="270" y="150" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#ffffffcc" text-anchor="middle">
      TRANSACTION SUCCESSFUL • SLIP RECEIPT
    </text>

    <!-- Success check banner -->
    <rect x="170" y="178" width="200" height="30" rx="15" fill="#f0fdf4" stroke="#86efac" stroke-width="1" />
    <text x="270" y="198" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#166534" text-anchor="middle">
      ✓ PAYMENT TRANSMITTED
    </text>

    <!-- Amount Display -->
    <text x="270" y="248" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#6b7280" text-anchor="middle">
      TOTAL AMOUNT PAID
    </text>
    <text x="270" y="294" font-family="Courier, monospace" font-size="36" font-weight="900" fill="#111827" text-anchor="middle">
      Rs. ${amount} <tspan font-size="18" fill="#6b7280" font-weight="600">NPR</tspan>
    </text>

    <!-- Divider -->
    <line x1="45" y1="325" x2="495" y2="325" stroke="#e5e7eb" stroke-dasharray="6,6" stroke-width="2" />

    <!-- Receipt Details Table -->
    <!-- Row 1: Transaction ID -->
    <text x="50" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#6b7280">Transaction ID / Ref:</text>
    <text x="490" y="360" font-family="Courier, monospace" font-size="13" font-weight="800" fill="#111827" text-anchor="end">${txCode}</text>

    <!-- Row 2: Payment Method -->
    <text x="50" y="400" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#6b7280">Gateway / Method:</text>
    <text x="490" y="400" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="${brandColor}" text-anchor="end">${method}</text>

    <!-- Row 3: Recipient -->
    <text x="50" y="440" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#6b7280">Beneficiary / Merchant:</text>
    <text x="490" y="440" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#111827" text-anchor="end">SMM Panel Nepal</text>

    <!-- Row 4: Sender Name -->
    <text x="50" y="480" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#6b7280">Payer / Account Holder:</text>
    <text x="490" y="480" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#111827" text-anchor="end">${sender}</text>

    <!-- Row 5: Sender Phone -->
    <text x="50" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#6b7280">Registered Mobile / ID:</text>
    <text x="490" y="520" font-family="Courier, monospace" font-size="13" font-weight="700" fill="#111827" text-anchor="end">${phone}</text>

    <!-- Row 6: Timestamp -->
    <text x="50" y="560" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#6b7280">Date &amp; Time (NPT):</text>
    <text x="490" y="560" font-family="Courier, monospace" font-size="12" font-weight="600" fill="#374151" text-anchor="end">${date}</text>

    <!-- Row 7: Review Status -->
    <text x="50" y="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#6b7280">Verification Status:</text>
    <text x="490" y="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="${status === 'Completed' ? '#16a34a' : '#d97706'}" text-anchor="end">
      ● ${status.toUpperCase()}
    </text>

    <!-- Bottom QR Stamp area -->
    <rect x="45" y="625" width="450" height="90" rx="16" fill="#f9fafb" stroke="#e5e7eb" />
    <!-- Mini QR representation -->
    <rect x="65" y="640" width="60" height="60" rx="6" fill="#111827" />
    <rect x="75" y="650" width="16" height="16" fill="#ffffff" />
    <rect x="100" y="650" width="16" height="16" fill="#ffffff" />
    <rect x="75" y="675" width="16" height="16" fill="#ffffff" />

    <text x="145" y="660" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#111827">
      ${badgeText}
    </text>
    <text x="145" y="680" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="500" fill="#6b7280">
      Official e-Transaction Receipt • SMM Panel Nepal
    </text>
    <text x="145" y="698" font-family="Courier, monospace" font-size="9" font-weight="600" fill="#9ca3af">
      Auth Ref: #${txCode} • Instant Verification Node
    </text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}
