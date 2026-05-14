/**
 * 🧩 白板插件 — 许可证模块
 * 零外部依赖，纯 Node.js 内置模块
 * 许可证 Worker: agentforge-license.thewhitewall520.workers.dev
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const LICENSE_HOST = 'agentforge-license.thewhitewall520.workers.dev';
const PRODUCTS = {
  'WB-LITE': { name: '白板 Lite', price: '¥49', features: ['single-project', 'cli', 'gate', 'lessons', 'context-inject', 'cross-platform'] },
  'WB-PRO': { name: '白板 Pro', price: '¥79', features: ['multi-project', 'cli', 'gate', 'lessons', 'context-inject', 'cross-platform', 'patrol', 'alerts', 'audit'] },
  'AF': { name: 'AgentForge', price: '¥149', features: ['multi-project', 'cli', 'gate', 'lessons', 'context-inject', 'cross-platform', 'patrol', 'alerts', 'audit', 'pipeline', 'agent-templates', 'deploy', 'task-queue'] }
};
const FREE_FEATURES = ['single-project', 'cli', 'gate', 'lessons', 'context-inject', 'cross-platform'];

function getLicensePath() {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  return path.join(home, '.openclaw', 'license.json');
}

function getLicenseDir() {
  return path.dirname(getLicensePath());
}

function readLicense() {
  const file = getLicensePath();
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (e) {
    // Corrupted license file — ignore
  }
  return null;
}

function writeLicense(data) {
  const dir = getLicenseDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getLicensePath(), JSON.stringify(data, null, 2), 'utf-8');
}

function hasFeature(feature) {
  const license = readLicense();
  if (!license) return FREE_FEATURES.includes(feature);
  
  const product = PRODUCTS[license.product];
  if (!product) return FREE_FEATURES.includes(feature);
  
  return product.features.includes(feature) || FREE_FEATURES.includes(feature);
}

function getProductName() {
  const license = readLicense();
  if (!license || !PRODUCTS[license.product]) return '白板 Lite (未激活)';
  return PRODUCTS[license.product].name;
}

function getLicenseStatus() {
  const license = readLicense();
  if (!license) {
    return {
      activated: false,
      product: null,
      productName: '白板 Lite',
      buyer: null,
      activatedAt: null,
      features: FREE_FEATURES
    };
  }
  const product = PRODUCTS[license.product];
  return {
    activated: true,
    product: license.product,
    productName: product ? product.name : '未知产品',
    buyer: license.buyer,
    activatedAt: license.activatedAt,
    features: product ? product.features : FREE_FEATURES
  };
}

/**
 * Verify a license code locally (format check)
 * Format: PREFIX-XXXX-XXXX-XXXX (hex chars)
 */
function validateKeyFormat(code) {
  if (!code || typeof code !== 'string') return null;
  const raw = code.trim().toUpperCase();
  
  // Try matching known prefixes
  for (const prefix of Object.keys(PRODUCTS)) {
    if (raw.startsWith(prefix + '-')) {
      const rest = raw.slice(prefix.length + 1);
      const parts = rest.split('-');
      if (parts.length !== 3) continue;
      const hexRe = /^[0-9A-Z]{4}$/;
      if (!hexRe.test(parts[0]) || !hexRe.test(parts[1]) || !hexRe.test(parts[2])) continue;
      return prefix;
    }
  }
  return null;
}

/**
 * Verify a license code
 * Tries Worker first, falls back to local format validation
 */
function verifyLicense(code) {
  return new Promise((resolve) => {
    const prefix = validateKeyFormat(code);
    if (!prefix) {
      resolve({ valid: false, error: '授权码格式无效' });
      return;
    }

    // Try online verification first
    const data = JSON.stringify({ key: code });
    const options = {
      hostname: LICENSE_HOST,
      path: '/verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 5000
    };
    const req = https.request(options, (res) => {
      let result = '';
      res.on('data', chunk => result += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(result);
          if (parsed.ok) {
            resolve({ valid: true, buyer: parsed.buyer || '未知', method: 'online' });
          } else {
            // Online failed, fall back to format validation
            resolve({ valid: true, buyer: '离线激活', method: 'offline', note: '授权码格式有效（未联网验证）' });
          }
        } catch (e) {
          resolve({ valid: true, buyer: '离线激活', method: 'offline', note: '授权码格式有效（未联网验证）' });
        }
      });
    });
    req.on('error', (e) => {
      // Network error, fall back to format validation
      resolve({ valid: true, buyer: '离线激活', method: 'offline', note: '授权码格式有效（无法连接激活服务器）' });
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ valid: true, buyer: '离线激活', method: 'offline', note: '授权码格式有效（连接超时）' });
    });
    req.write(data);
    req.end();
  });
}

/**
 * Register a new license code with the Worker
 * (For admin use via gen-key.js)
 */
function registerLicense(name, prefix) {
  return new Promise((resolve) => {
    const options = {
      hostname: LICENSE_HOST,
      path: `/register?name=${encodeURIComponent(name)}&prefix=${encodeURIComponent(prefix)}`,
      method: 'POST',
      timeout: 10000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ error: '服务器响应异常' }); }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

function activateLicense(code) {
  return new Promise(async (resolve) => {
    // Extract prefix from code to determine product
    const parts = code.split('-');
    let product = 'WB-LITE';
    if (parts.length >= 1) {
      const p = parts[0].toUpperCase();
      if (PRODUCTS[p]) product = p;
    }

    const result = await verifyLicense(code);
    if (result.valid) {
      writeLicense({
        product: product,
        code: code,
        buyer: result.buyer || '未知',
        activatedAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString()
      });
      resolve({ success: true, product: product, productName: PRODUCTS[product].name, buyer: result.buyer });
    } else {
      resolve({ success: false, error: result.error || '激活码无效' });
    }
  });
}

module.exports = {
  PRODUCTS,
  FREE_FEATURES,
  readLicense,
  writeLicense,
  hasFeature,
  getProductName,
  getLicenseStatus,
  verifyLicense,
  activateLicense,
  validateKeyFormat,
  registerLicense
};
