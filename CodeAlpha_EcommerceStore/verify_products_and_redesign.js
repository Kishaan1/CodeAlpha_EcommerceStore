// verify_products_and_redesign.js
// Verification of Product Rendering, Discovery Redesign, and Live Catalog

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function verifyProductsAndRedesign() {
  console.log('==========================================================');
  console.log('🔍 VERIFYING RESTORED PRODUCTS & BUYHATKE REDESIGN');
  console.log('==========================================================\n');

  // 1. Live Server HTTP Response
  console.log('--- 1. Testing Live Server Endpoints ---');
  const homeRes = await get('http://localhost:3000/');
  assert.strictEqual(homeRes.status, 200, 'Home page must return 200 OK');
  console.log('✓ GET / returned 200 OK (length:', homeRes.body.length, ')');

  const prodRes = await get('http://localhost:3000/product.html?id=1');
  assert.strictEqual(prodRes.status, 200, 'Product page must return 200 OK');
  console.log('✓ GET /product.html?id=1 returned 200 OK');

  const apiRes = await get('http://localhost:3000/api/products');
  assert.strictEqual(apiRes.status, 200, 'Products API must return 200 OK');
  const apiData = JSON.parse(apiRes.body);
  const products = apiData.products || [];
  assert.ok(products.length >= 10, 'Products API must return at least 10 products');
  console.log(`✓ GET /api/products returned ${products.length} live products`);

  // 2. Inspecting app.js rendering logic
  console.log('\n--- 2. Testing Product Card Rendering in app.js ---');
  const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf8');

  // Check discountPercent & originalPrice declarations
  assert.ok(appJs.includes('const originalPrice = product.original_price || Math.round(product.price * 1.25);'),
    'app.js must declare originalPrice in productCardHtml');
  assert.ok(appJs.includes('const discountPercent = product.discount_percent || Math.max(0, Math.round(((originalPrice - product.price) / originalPrice) * 100));'),
    'app.js must declare discountPercent in productCardHtml');
  console.log('✓ Variables originalPrice and discountPercent are safely declared');

  // Check Fallback Demonstration Catalog
  assert.ok(appJs.includes('FALLBACK_DEMO_PRODUCTS'), 'app.js must define FALLBACK_DEMO_PRODUCTS');
  assert.ok(appJs.includes('state.products = FALLBACK_DEMO_PRODUCTS;'), 'app.js must fall back to demonstration catalog on API outage');
  console.log('✓ Verified local demonstration catalog fallback exists and is connected');

  // 3. Testing 3-Store Comparison Micro-Bar on Product Cards
  console.log('\n--- 3. Testing 3-Store Comparison Micro-Bar on Cards ---');
  assert.ok(appJs.includes('Amazon</span>'), 'Product card must display Amazon price');
  assert.ok(appJs.includes('Flipkart</span>'), 'Product card must display Flipkart price');
  assert.ok(appJs.includes('Croma</span>'), 'Product card must display Croma price');
  assert.ok(appJs.includes('data-action="view-trend"'), 'Product card must include 90D trend button');
  console.log('✓ Verified 3-store micro-comparison strip and 90D trend button on cards');

  // 4. Testing Buyhatke Deal Radar Hero in index.html
  console.log('\n--- 4. Testing Buyhatke Deal Radar Hero in index.html ---');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  assert.ok(indexHtml.includes("India's #1 Multi-Store Price Radar"), 'index.html must display Deal Radar badge');
  assert.ok(indexHtml.includes('Never Overpay Online Again.'), 'index.html must display Buyhatke-style headline');
  assert.ok(indexHtml.includes('Deal of the Day'), 'index.html must display Deal of the Day featured card');
  assert.ok(indexHtml.includes('Save ₹23.40 buying on Amazon'), 'index.html must display live store savings callout');
  assert.ok(indexHtml.includes('Multi-Store Match'), 'index.html must display 4-store trust bar');
  console.log('✓ Verified Buyhatke Deal Radar hero and multi-store trust bar');

  // 5. Testing Pincode Hubs & Sample Deals
  console.log('\n--- 5. Testing Delivery Hubs and Sample Deals ---');
  assert.ok(indexHtml.includes('pincodeQuickHubs'), 'index.html must include pincodeQuickHubs');
  assert.ok(indexHtml.includes('Bengaluru (560001)'), 'index.html must include Bengaluru hub');
  assert.ok(indexHtml.includes('sample-deal-btn'), 'index.html must include sample-deal-btn');
  console.log('✓ Verified Indian delivery hubs and 1-click sample deal buttons');

  // 6. Simulating Product Rendering in JS Sandbox
  console.log('\n--- 6. Simulating Product Rendering in JS Sandbox ---');
  const vm = require('vm');
  const fakeEl = {
    innerHTML: '',
    textContent: '',
    className: '',
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    appendChild: () => {},
    setAttribute: () => {},
    removeAttribute: () => {},
    style: {}
  };
  const sandbox = {
    window: { location: { hash: '' }, addEventListener: () => {}, matchMedia: () => ({ matches: false }) },
    document: {
      body: fakeEl,
      querySelectorAll: () => [],
      querySelector: () => null,
      getElementById: () => fakeEl,
      addEventListener: () => {},
      documentElement: fakeEl,
      createElement: () => fakeEl
    },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    localStorage: { getItem: () => null, setItem: () => null, removeItem: () => null },
    setTimeout: () => {},
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    URLSearchParams: require('url').URLSearchParams,
    console: console
  };
  vm.createContext(sandbox);
  vm.runInContext(appJs, sandbox);

  for (let i = 0; i < products.length; i++) {
    const cardHtml = sandbox.productCardHtml(products[i]);
    assert.ok(cardHtml && cardHtml.length > 500, `Card #${i + 1} must render complete HTML`);
    assert.ok(cardHtml.includes(products[i].name), `Card #${i + 1} must contain product name`);
  }
  console.log(`✓ All ${products.length} products rendered safely with 0 errors in sandbox`);

  console.log('\n==========================================================');
  console.log('🎉 ALL RESTORED PRODUCT & REDESIGN CHECKS PASSED (100%)!');
  console.log('==========================================================');
}

verifyProductsAndRedesign().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
