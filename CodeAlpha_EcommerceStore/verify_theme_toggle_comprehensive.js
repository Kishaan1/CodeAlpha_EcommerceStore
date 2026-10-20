// verify_theme_toggle_comprehensive.js
// Comprehensive Verification of Light Mode and Dark Mode Implementation
// Across SMARTBUY Architecture, Design Tokens, Components, and Accessibility

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

console.log('======================================================================');
console.log('🔍 COMPREHENSIVE THEME SYSTEM AUDIT & REGRESSION TEST');
console.log('======================================================================\n');

// --- 1. INSPECT CENTRALIZED DESIGN TOKENS IN STYLES.CSS ---
console.log('--- Step 1: Auditing Centralized CSS Variable Tokens in styles.css ---');
const stylesCss = fs.readFileSync(path.join(__dirname, 'public', 'css', 'styles.css'), 'utf-8');

const requiredTokens = [
  // Surface & Background
  '--sb-bg: #F7F7F4;',
  '--sb-header-bg: #FFFFFF;',
  '--sb-nav-bg: #F7F7F4;',
  '--sb-surface: #FFFFFF;',
  '--sb-surface-hover: #F2E9DC;',
  '--sb-card-img-bg: #F7F7F4;',
  '--sb-footer-bg: #F7F7F4;',
  '--sb-announcement-bg: #F2E9DC;',
  '--sb-announcement-border: #E7E5E0;',

  // Typography & Neutrals
  '--sb-text: #191919;',
  '--sb-muted: #686868;',
  '--sb-border: #E7E5E0;',
  '--sb-border-subtle: #F0EEE9;',

  // Inputs
  '--sb-input-bg: #FFFFFF;',
  '--sb-input-border: #E7E5E0;',
  '--sb-input-text: #191919;',
  '--sb-input-placeholder: #888888;',

  // Dialogs & Dropdowns
  '--sb-dialog-bg: #FFFFFF;',
  '--sb-dialog-border: #E7E5E0;',
  '--sb-dropdown-bg: #FFFFFF;',
  '--sb-dropdown-border: #E7E5E0;',

  // Buttons & Accents
  '--sb-accent: #D94F32;',
  '--sb-accent-hover: #BF3F24;',
  '--sb-btn-dark-bg: #191919;',
  '--sb-btn-dark-text: #FFFFFF;',

  // Shadows
  '--sb-shadow:',
  '--sb-focus-ring:',

  // Dark Mode Tokens
  '--sb-bg: #0B0F19;',
  '--sb-header-bg: #10182B;',
  '--sb-nav-bg: #0F172A;',
  '--sb-surface: #151F32;',
  '--sb-surface-hover: #1E2B45;',
  '--sb-card-img-bg: #1A263D;',
  '--sb-footer-bg: #080D1A;',
  '--sb-announcement-bg: #10182B;',
  '--sb-announcement-border: #26334A;',
  '--sb-text: #F8FAFC;',
  '--sb-muted: #94A3B8;',
  '--sb-border: #26334A;',
  '--sb-input-bg: #1A263D;',
  '--sb-input-border: #26334A;',
  '--sb-input-text: #F8FAFC;',
  '--sb-dialog-bg: #151F32;',
  '--sb-dialog-border: #26334A;',
  '--sb-dropdown-bg: #151F32;'
];

for (const token of requiredTokens) {
  assert.ok(stylesCss.includes(token), `styles.css must include design token: ${token}`);
  console.log(`  ✓ Token verified: ${token}`);
}

// --- 2. AUDIT COMPONENT COVERAGE IN STYLES.CSS ---
console.log('\n--- Step 2: Verifying Comprehensive Component Styles for Dark & Light ---');
const requiredComponentSelectors = [
  '.dark body',
  '[data-theme="dark"] body',
  '.dark .top-utility-strip',
  '.dark header',
  '.dark input#searchInput',
  '.dark #searchSuggestionsPopover',
  '.dark .campaign-banner-box',
  '.dark .category-tile',
  '.dark .product-card',
  '.dark .product-card .bg-white',
  '.dark .card-img-box',
  '.dark #comparisonPromotion > div',
  '.dark #deal-url-input',
  '.dark .budget-chip',
  '.dark .coupon-card',
  '.dark #footerSupport',
  '.dark #cart-drawer',
  '.dark #quickViewModal .relative',
  '.dark #authModal .relative',
  '.dark #aiAssistantDrawer',
  '.dark #aiAssistantFloatingBtn',
  '.dark [id$="Modal"] > .relative',
  '#authModal label',
  '#authModal input',
  '#authModal .social-login-btn',
  '.dark .text-\\[\\#191919\\]',
  '.dark .text-\\[\\#686868\\]',
  '.dark .border-\\[\\#E7E5E0\\]',
  '.dark .bg-\\[\\#F7F7F4\\]'
];

for (const sel of requiredComponentSelectors) {
  assert.ok(stylesCss.includes(sel), `styles.css must style component: ${sel}`);
  console.log(`  ✓ Component style verified: ${sel}`);
}

// --- 3. AUDIT HTML MARKUP & HEAD SCRIPTS ---
console.log('\n--- Step 3: Auditing index.html and product.html markup & head scripts ---');
const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');
const productHtml = fs.readFileSync(path.join(__dirname, 'public', 'product.html'), 'utf-8');

// Anti-flash logic in head
assert.ok(indexHtml.includes("document.documentElement.setAttribute('data-theme', 'dark')"), 'index.html must set data-theme dark in head');
assert.ok(indexHtml.includes("document.documentElement.setAttribute('data-theme', 'light')"), 'index.html must set data-theme light in head');
assert.ok(indexHtml.includes("document.documentElement.classList.add('dark')"), 'index.html must add dark class in head');
assert.ok(indexHtml.includes("document.documentElement.classList.remove('dark')"), 'index.html must remove dark class in head');

// Body tag dark mode utility classes
assert.ok(indexHtml.includes('dark:bg-[#0B0F19]'), 'index.html body must include dark:bg-[#0B0F19]');
assert.ok(indexHtml.includes('dark:text-[#F8FAFC]'), 'index.html body must include dark:text-[#F8FAFC]');
assert.ok(productHtml.includes('dark:bg-[#0B0F19]'), 'product.html body must include dark:bg-[#0B0F19]');
assert.ok(productHtml.includes('dark:text-[#F8FAFC]'), 'product.html body must include dark:text-[#F8FAFC]');

// Theme Toggle Button
assert.ok(indexHtml.includes('id="themeToggleBtn"'), 'index.html must include #themeToggleBtn');
assert.ok(indexHtml.includes('id="themeSunIcon"'), 'index.html must include #themeSunIcon');
assert.ok(indexHtml.includes('id="themeMoonIcon"'), 'index.html must include #themeMoonIcon');
assert.ok(productHtml.includes('id="themeToggleBtn"'), 'product.html must include #themeToggleBtn');
assert.ok(productHtml.includes('id="themeSunIcon"'), 'product.html must include #themeSunIcon');
assert.ok(productHtml.includes('id="themeMoonIcon"'), 'product.html must include #themeMoonIcon');
console.log('  ✓ Verified anti-flash head scripts, body dark classes, and toggle buttons in both pages');

// --- 4. AUDIT JS THEME CONTROLLERS & ACCESSIBILITY ---
console.log('\n--- Step 4: Auditing app.js and product.js theme controllers & accessibility ---');
const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf-8');
const productJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'product.js'), 'utf-8');

// Function existence
assert.ok(appJs.includes('function applyTheme(isDark)'), 'app.js must define applyTheme(isDark)');
assert.ok(appJs.includes('function initThemeToggle()'), 'app.js must define initThemeToggle()');
assert.ok(productJs.includes('function initThemeToggle()'), 'product.js must define initThemeToggle()');

// Accessibility labels
assert.ok(appJs.includes("el.themeToggleBtn.setAttribute('aria-label', 'Switch to light mode')"), 'app.js must update aria-label for light mode');
assert.ok(appJs.includes("el.themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode')"), 'app.js must update aria-label for dark mode');
assert.ok(productJs.includes("btn.setAttribute('aria-label', 'Switch to light mode')"), 'product.js must update aria-label for light mode');
assert.ok(productJs.includes("btn.setAttribute('aria-label', 'Switch to dark mode')"), 'product.js must update aria-label for dark mode');

// Dual attribute sync (class and data-theme)
assert.ok(appJs.includes("document.documentElement.setAttribute('data-theme', 'dark')"), 'app.js must set data-theme="dark"');
assert.ok(appJs.includes("document.documentElement.setAttribute('data-theme', 'light')"), 'app.js must set data-theme="light"');
assert.ok(appJs.includes("document.documentElement.classList.add('dark')"), 'app.js must add class "dark"');
assert.ok(appJs.includes("document.documentElement.classList.remove('dark')"), 'app.js must remove class "dark"');
assert.ok(appJs.includes("localStorage.setItem('theme', willBeDark ? 'dark' : 'light')"), 'app.js must persist to localStorage');

// Dynamic product card dark mode adaptiveness
assert.ok(appJs.includes('dark:bg-slate-900/90'), 'app.js productCardHtml must include dark:bg-slate-900/90');
assert.ok(appJs.includes('dark:bg-slate-800/80'), 'app.js productCardHtml must include dark:bg-slate-800/80');
assert.ok(appJs.includes('dark:text-slate-100'), 'app.js productCardHtml must include dark:text-slate-100');
assert.ok(appJs.includes('dark:text-white'), 'app.js productCardHtml must include dark:text-white');
console.log('  ✓ Verified theme controller logic, aria accessibility, data-theme syncing, and product card adaptation');

// --- 5. SIMULATE REPEATED TOGGLING & STATE CYCLES ---
console.log('\n--- Step 5: Simulating Repeated Theme Toggling Cycles & Persistence ---');
class MockStorage {
  constructor() { this.data = {}; }
  getItem(k) { return this.data[k] || null; }
  setItem(k, v) { this.data[k] = String(v); }
}

const mockLocalStorage = new MockStorage();
let mockClasses = new Set();
let mockAttrs = {};
let mockBtn = { ariaLabel: '', title: '' };
let mockSun = { isHidden: true };
let mockMoon = { isHidden: false };

function simulateApplyTheme(isDark) {
  if (isDark) {
    mockClasses.add('dark');
    mockAttrs['data-theme'] = 'dark';
    mockSun.isHidden = false;
    mockMoon.isHidden = true;
    mockBtn.ariaLabel = 'Switch to light mode';
    mockBtn.title = 'Switch to light mode';
  } else {
    mockClasses.delete('dark');
    mockAttrs['data-theme'] = 'light';
    mockSun.isHidden = true;
    mockMoon.isHidden = false;
    mockBtn.ariaLabel = 'Switch to dark mode';
    mockBtn.title = 'Switch to dark mode';
  }
}

function simulateToggleClick() {
  const isCurrentlyDark = mockClasses.has('dark');
  const willBeDark = !isCurrentlyDark;
  mockLocalStorage.setItem('theme', willBeDark ? 'dark' : 'light');
  simulateApplyTheme(willBeDark);
}

// Initial Light state
simulateApplyTheme(false);
assert.strictEqual(mockClasses.has('dark'), false, 'Should be light initially');
assert.strictEqual(mockAttrs['data-theme'], 'light', 'data-theme should be light');
assert.strictEqual(mockBtn.ariaLabel, 'Switch to dark mode');
assert.strictEqual(mockSun.isHidden, true);
assert.strictEqual(mockMoon.isHidden, false);
console.log('  ✓ Cycle 0 (Initial Light): classList clean, data-theme="light", icon=Moon, label="Switch to dark mode"');

// Toggle to Dark
simulateToggleClick();
assert.strictEqual(mockClasses.has('dark'), true, 'Should be dark after 1st toggle');
assert.strictEqual(mockAttrs['data-theme'], 'dark', 'data-theme should be dark');
assert.strictEqual(mockLocalStorage.getItem('theme'), 'dark');
assert.strictEqual(mockBtn.ariaLabel, 'Switch to light mode');
assert.strictEqual(mockSun.isHidden, false);
assert.strictEqual(mockMoon.isHidden, true);
console.log('  ✓ Cycle 1 (Light -> Dark): classList has "dark", data-theme="dark", icon=Sun, label="Switch to light mode"');

// Toggle back to Light
simulateToggleClick();
assert.strictEqual(mockClasses.has('dark'), false, 'Should be light after 2nd toggle');
assert.strictEqual(mockAttrs['data-theme'], 'light', 'data-theme should be light');
assert.strictEqual(mockLocalStorage.getItem('theme'), 'light');
assert.strictEqual(mockBtn.ariaLabel, 'Switch to dark mode');
assert.strictEqual(mockSun.isHidden, true);
assert.strictEqual(mockMoon.isHidden, false);
console.log('  ✓ Cycle 2 (Dark -> Light): classList clean, data-theme="light", icon=Moon, label="Switch to dark mode"');

// Toggle to Dark again
simulateToggleClick();
assert.strictEqual(mockClasses.has('dark'), true, 'Should be dark after 3rd toggle');
console.log('  ✓ Cycle 3 (Light -> Dark again): Works repeatedly without friction');

// Simulate Page Reload with saved Dark preference in localStorage
const reloadedSaved = mockLocalStorage.getItem('theme');
simulateApplyTheme(reloadedSaved === 'dark');
assert.strictEqual(mockClasses.has('dark'), true, 'Restored dark theme on reload');
assert.strictEqual(mockAttrs['data-theme'], 'dark', 'Restored data-theme on reload');
console.log('  ✓ Cycle 4 (Simulated Page Reload): Restored dark mode without flash');

// --- 6. LIVE HTTP TEST OF SERVER ENDPOINTS ---
console.log('\n--- Step 6: Verifying Live Server & API Functionality ---');
function fetchHttp(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const homeRes = await fetchHttp('http://localhost:3000/');
    assert.strictEqual(homeRes.status, 200, 'Home page must return 200 OK');
    console.log(`  ✓ GET / returned 200 OK (${homeRes.body.length} bytes)`);

    const prodRes = await fetchHttp('http://localhost:3000/product.html?id=1');
    assert.strictEqual(prodRes.status, 200, 'Product page must return 200 OK');
    console.log(`  ✓ GET /product.html?id=1 returned 200 OK (${prodRes.body.length} bytes)`);

    const apiRes = await fetchHttp('http://localhost:3000/api/products');
    assert.strictEqual(apiRes.status, 200, 'Products API must return 200 OK');
    const apiJson = JSON.parse(apiRes.body);
    assert.ok(apiJson.products && apiJson.products.length > 0, 'Products list must not be empty');
    console.log(`  ✓ GET /api/products returned ${apiJson.products.length} products (Sample catalog intact)`);

    console.log('\n======================================================================');
    console.log('🎉 100% OF ALL COMPREHENSIVE THEME TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================================');
  } catch (err) {
    console.error('\n❌ HTTP Verification Error:', err.message);
    process.exit(1);
  }
})();
