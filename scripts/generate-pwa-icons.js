import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple CRC32 implementation for PNG chunks
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcVal = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image pixels
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(width, height) / 2;
  const innerR = outerR * (isMaskable ? 0.75 : 0.88);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Dark Emerald / Neutral gradient
      const tY = y / height;
      let r = Math.round(5 + tY * 10);
      let g = Math.round(18 + tY * 25);
      let b = Math.round(15 + tY * 20);
      let a = 255;

      if (!isMaskable && dist > innerR) {
        // Rounded corner container for 'any' purpose icon
        const cornerR = width * 0.22;
        const inBoxX = Math.abs(dx) <= (width / 2 - cornerR);
        const inBoxY = Math.abs(dy) <= (height / 2 - cornerR);
        if (!inBoxX && !inBoxY) {
          const cdx = Math.abs(dx) - (width / 2 - cornerR);
          const cdy = Math.abs(dy) - (height / 2 - cornerR);
          if (Math.sqrt(cdx * cdx + cdy * cdy) > cornerR) {
            a = 0; // transparent corners
          }
        }
      }

      if (a > 0) {
        // Draw Emerald SMM Shield / Circle Emblem in center
        if (dist <= innerR * 0.72) {
          // Circle inner gradient: Emerald (#10b981 to #059669)
          const embT = (dy + innerR * 0.72) / (innerR * 1.44);
          r = Math.round(16 + embT * 5);
          g = Math.round(185 - embT * 35);
          b = Math.round(129 - embT * 24);
        }

        // Draw Lightning Bolt / S Logo in the center
        // Bolt shape approximation
        const nx = dx / (width * 0.4);
        const ny = dy / (height * 0.4);
        const isLightning =
          (ny >= -0.6 && ny <= -0.05 && nx >= -0.2 - ny * 0.4 && nx <= 0.3 - ny * 0.2) ||
          (ny >= -0.15 && ny <= 0.6 && nx >= -0.35 - ny * 0.2 && nx <= 0.15 - ny * 0.4);

        if (isLightning) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
console.log('Generating PWA PNG icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));

// Also generate SVG icon for desktop browser favicon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="shield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="180" fill="url(#shield)"/>
  <path d="M280 120 L180 270 L260 270 L232 392 L332 242 L252 242 Z" fill="#ffffff" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
console.log('PWA icons created successfully in public/');
