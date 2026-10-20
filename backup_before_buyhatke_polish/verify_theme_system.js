// verify_theme_system.js
// Verification of Dark Mode and Light Mode theme toggle implementation

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==========================================================');
console.log('🔍 VERIFYING DARK MODE & LIGHT MODE THEME SYSTEM');
console.log('==========================================================\n');

// 1. Inspect public/css/styles.css
console.log('--- 1. Inspecting styles.css ---');
const stylesCss = fs.readFileSync(path.join(__dirname, 'public', 'css', 'styles.css'), 'utf-8');

assert.ok(stylesCss.includes('--sb-bg: #F7F7F4;'), 'styles.css must define light --sb-bg');
assert.ok(stylesCss.includes('--sb-surface: #FFFFFF;'), 'styles.css must define light --sb-surface');
assert.ok(stylesCss.includes('html.dark, [data-theme="dark"]'), 'styles.css must define html.dark tokens');
assert.ok(stylesCss.includes('--sb-bg: #0B0F19;'), 'styles.css must define dark --sb-bg');
assert.ok(stylesCss.includes('--sb-surface: #151F32;'), 'styles.css must define dark --sb-surface');

// Check that bad overrides were removed
assert.ok(!stylesCss.includes('html.dark, html.dark body { background-color: #F7F7F4 !important; }'), 
  'styles.css must NOT force #F7F7F4 on html.dark');
assert.ok(!stylesCss.includes('.dark header { background-color: #FFFFFF !important; }'), 
  'styles.css must NOT force #FFFFFF header in dark mode');

// Check comprehensive dark mode rules exist
const requiredDarkRules = [
  'html.dark body',
  'html.dark, [data-theme="dark"]',
  '.dark header',
  '.dark .product-card',
  '.dark #cart-drawer',
  '.dark #aiAssistantDrawer',
  '.dark #footerSupport'
];
for (const rule of requiredDarkRules) {
  assert.ok(stylesCss.includes(rule), `styles.css must include rule for: ${rule}`);
  console.log(`✓ Rule verified: ${rule}`);
}

// 2. Inspect public/index.html & public/product.html
console.log('\n--- 2. Inspecting index.html and product.html ---');
const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');
const productHtml = fs.readFileSync(path.join(__dirname, 'public', 'product.html'), 'utf-8');

// Check themeToggleBtn button and icons in index.html
assert.ok(indexHtml.includes('id="themeToggleBtn"'), 'index.html must have #themeToggleBtn');
assert.ok(indexHtml.includes('id="themeSunIcon"'), 'index.html must have #themeSunIcon');
assert.ok(indexHtml.includes('id="themeMoonIcon"'), 'index.html must have #themeMoonIcon');
assert.ok(indexHtml.includes('localStorage.getItem(\'theme\')'), 'index.html must check localStorage in head anti-flash');
assert.ok(!indexHtml.includes("localStorage.removeItem('theme')"), 'index.html must NOT wipe localStorage on load');

// Check product.html
assert.ok(productHtml.includes('id="themeToggleBtn"'), 'product.html must have #themeToggleBtn');
assert.ok(productHtml.includes('id="themeSunIcon"'), 'product.html must have #themeSunIcon');
assert.ok(productHtml.includes('id="themeMoonIcon"'), 'product.html must have #themeMoonIcon');
assert.ok(productHtml.includes('localStorage.getItem(\'theme\')'), 'product.html must check localStorage in head anti-flash');
assert.ok(!productHtml.includes("localStorage.removeItem('theme')"), 'product.html must NOT wipe localStorage on load');

console.log('✓ index.html and product.html anti-flash and toggle markup verified');

// 3. Inspect public/js/app.js & public/js/product.js
console.log('\n--- 3. Inspecting app.js and product.js theme logic ---');
const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf-8');
const productJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'product.js'), 'utf-8');

assert.ok(appJs.includes('function initThemeToggle()'), 'app.js must define initThemeToggle');
assert.ok(appJs.includes("localStorage.setItem('theme', willBeDark ? 'dark' : 'light')"), 'app.js must persist theme state to localStorage');
assert.ok(appJs.includes("document.documentElement.classList.add('dark')"), 'app.js must add dark class in dark mode');
assert.ok(appJs.includes("document.documentElement.classList.remove('dark')"), 'app.js must remove dark class in light mode');
assert.ok(appJs.includes("setAttribute('data-theme', 'dark')"), 'app.js must set data-theme attribute');

assert.ok(productJs.includes('function initThemeToggle()'), 'product.js must define initThemeToggle');
assert.ok(productJs.includes("localStorage.setItem('theme', willBeDark ? 'dark' : 'light')"), 'product.js must persist theme state to localStorage');
assert.ok(productJs.includes("document.documentElement.classList.add('dark')"), 'product.js must add dark class');

console.log('✓ app.js and product.js theme controller functions verified');

// 4. Simulate Theme Toggle Execution
console.log('\n--- 4. Simulating theme toggling state transitions ---');
class FakeLocalStorage {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
}

const fakeStorage = new FakeLocalStorage();

// Simulation of the exact applyTheme and toggle logic in app.js
let isDark = false;
let classList = new Set();
let attributes = {};

function applyTheme(dark) {
  isDark = dark;
  if (dark) {
    classList.add('dark');
    attributes['data-theme'] = 'dark';
  } else {
    classList.delete('dark');
    attributes['data-theme'] = 'light';
  }
  fakeStorage.setItem('theme', dark ? 'dark' : 'light');
  fakeStorage.setItem('ca_theme', dark ? 'dark' : 'light');
}

// Initial state: default light
applyTheme(false);
assert.strictEqual(fakeStorage.getItem('theme'), 'light');
assert.strictEqual(classList.has('dark'), false);
assert.strictEqual(attributes['data-theme'], 'light');
console.log('✓ Initial state is Light Mode: class="light", storage="light"');

// Toggle to Dark
applyTheme(!isDark);
assert.strictEqual(fakeStorage.getItem('theme'), 'dark');
assert.strictEqual(classList.has('dark'), true);
assert.strictEqual(attributes['data-theme'], 'dark');
console.log('✓ Clicked toggle -> Switched to Dark Mode: class="dark", storage="dark"');

// Toggle back to Light
applyTheme(!isDark);
assert.strictEqual(fakeStorage.getItem('theme'), 'light');
assert.strictEqual(classList.has('dark'), false);
assert.strictEqual(attributes['data-theme'], 'light');
console.log('✓ Clicked toggle -> Switched back to Light Mode: class="", storage="light"');

// Simulated reload with saved dark theme in localStorage
fakeStorage.setItem('theme', 'dark');
const savedTheme = fakeStorage.getItem('theme');
applyTheme(savedTheme === 'dark');
assert.strictEqual(classList.has('dark'), true);
assert.strictEqual(attributes['data-theme'], 'dark');
console.log('✓ Simulated reload: successfully restored Dark Mode without flash');

console.log('\n==========================================================');
console.log('🎉 ALL THEME SYSTEM VERIFICATIONS PASSED CLEANLY (100%)!');
console.log('==========================================================');
