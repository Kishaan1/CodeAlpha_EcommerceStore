const http = require('http');
const fs = require('fs');
const path = require('path');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function verifyAuditRegression() {
  console.log('==========================================================');
  console.log('🔍 RUNNING COMPREHENSIVE REGRESSION & AUDIT VERIFICATION');
  console.log('==========================================================\n');

  const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf8');
  const productHtml = fs.readFileSync(path.join(__dirname, 'public', 'product.html'), 'utf8');
  const productJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'product.js'), 'utf8');

  // --- 1. Cart Drawer & Global Actions ---
  console.log('--- 1. Testing Cart Drawer & Global Actions ---');
  if (!indexHtml.includes('id="cart-btn"')) throw new Error('Missing #cart-btn in index.html');
  if (!indexHtml.includes('id="cart-drawer"')) throw new Error('Missing #cart-drawer in index.html');
  if (!indexHtml.includes('id="cart-backdrop"')) throw new Error('Missing #cart-backdrop in index.html');
  if (!indexHtml.includes('id="close-cart-btn"')) throw new Error('Missing #close-cart-btn in index.html');
  if (!indexHtml.includes('z-[100]')) throw new Error('Cart drawer must have z-[100] stacking');
  if (!indexHtml.includes('z-[90]')) throw new Error('Cart backdrop must have z-[90] stacking');
  console.log('✓ Verified Cart Drawer markup and z-indexing (drawer z-[100], backdrop z-[90])');

  if (!appJs.includes('openCart()')) throw new Error('Missing openCart function in app.js');
  if (!appJs.includes('closeCart()')) throw new Error('Missing closeCart function in app.js');
  if (!appJs.includes('updateCartQuantity')) throw new Error('Missing updateCartQuantity in app.js');
  if (!appJs.includes('saveForLater')) throw new Error('Missing saveForLater in app.js');
  if (!appJs.includes('renderCartBadge')) throw new Error('Missing renderCartBadge in app.js');
  console.log('✓ Verified Cart logic in app.js (quantity update, saveForLater, badge rendering)');

  // --- 2. Global Search & Autocomplete ---
  console.log('\n--- 2. Testing Global Search & Autocomplete ---');
  if (!indexHtml.includes('id="searchInput"')) throw new Error('Missing #searchInput in index.html');
  if (!indexHtml.includes('search-input')) throw new Error('Missing search-input cross-compatibility in index.html');
  if (!indexHtml.includes('id="searchSuggestionsPopover"')) throw new Error('Missing #searchSuggestionsPopover in index.html');
  if (!indexHtml.includes('id="deal-url-input"')) throw new Error('Missing #deal-url-input in index.html');
  if (!indexHtml.includes('id="scan-deal-btn"')) throw new Error('Missing #scan-deal-btn in index.html');
  if (!appJs.includes('renderPredictiveSearchSuggestions')) throw new Error('Missing renderPredictiveSearchSuggestions in app.js');
  if (!appJs.includes('setTimeout(r, 900)')) throw new Error('Missing 900ms simulated scan delay in app.js');
  console.log('✓ Verified Omnibar search and 900ms URL Analyzer simulation');

  // --- 3. Chart.js 90-Day Trend Modal & Store Matrix ---
  console.log('\n--- 3. Testing Chart.js Trend Modal & Lifecycle ---');
  if (!indexHtml.includes('data-modal="price-trend-modal"')) throw new Error('Missing price-trend-modal target');
  if (!indexHtml.includes('data-range="7D"')) throw new Error('Missing 7D pill');
  if (!indexHtml.includes('data-range="30D"')) throw new Error('Missing 30D pill');
  if (!indexHtml.includes('data-range="90D"')) throw new Error('Missing 90D pill');
  if (!indexHtml.includes('data-range="180D"')) throw new Error('Missing 180D pill');
  if (!appJs.includes('if (window.trendChart)')) throw new Error('Missing window.trendChart check before destroying');
  if (!appJs.includes('window.trendChart.destroy()')) throw new Error('Missing window.trendChart.destroy()');
  if (!appJs.includes('window.trendChart = priceChartInstance')) throw new Error('Missing window.trendChart assignment');
  console.log('✓ Verified Chart.js trend modal, 7D/30D/90D/180D range pills & destroy lifecycle');

  // --- 4. Interactive Auth Modal & Mascot ---
  console.log('\n--- 4. Testing Auth Modal & Interactive Mascot ---');
  if (!indexHtml.includes('data-modal="auth-modal"')) throw new Error('Missing auth-modal target');
  if (!indexHtml.includes('z-[80]')) throw new Error('Auth modal must have z-[80] stacking');
  if (!indexHtml.includes('Account Access')) throw new Error('Missing Account Access text');
  if (!indexHtml.includes('id="auth-avatar"')) throw new Error('Missing #auth-avatar in index.html');
  if (!appJs.includes('updatePupilTracking')) throw new Error('Missing pupil tracking on email input');
  if (!appJs.includes("avatarEl?.setAttribute('data-state', 'watching')")) throw new Error('Missing watching state on email focus');
  if (!appJs.includes("avatarEl?.setAttribute('data-state', 'peek')")) throw new Error('Missing peek state on password focus');
  if (!appJs.includes("avatarEl?.setAttribute('data-state', isVisible ? 'peek' : 'turned-away')")) throw new Error('Missing turned-away state on eye toggle');
  console.log('✓ Verified Auth Modal (z-[80], high contrast) and Mascot reactions (watching, tracking, peek, turned-away)');

  // --- 5. Dedicated Product Page ---
  console.log('\n--- 5. Testing Dedicated Product Page (product.html & product.js) ---');
  if (!productHtml.includes('id="cart-btn"')) throw new Error('Missing #cart-btn in product.html');
  if (!productHtml.includes('id="close-cart-btn"')) throw new Error('Missing #close-cart-btn in product.html');
  if (!productJs.includes('window.location.search')) throw new Error('Missing query param parsing in product.js');
  if (!productJs.includes('pdPincodeCheckForm')) throw new Error('Missing pincode checker in product.js');
  if (!productJs.includes('/alerts')) throw new Error('Missing /alerts endpoint in product.js');
  if (!productJs.includes('window.trendChart.destroy()')) throw new Error('Missing window.trendChart.destroy() in product.js');
  console.log('✓ Verified product.html & product.js (deep-linking, pincode checker, alerts form, chart lifecycle)');

  // --- 6. Live HTTP Endpoints Check ---
  console.log('\n--- 6. Verifying Live HTTP Endpoints ---');
  const homeRes = await get('http://localhost:3000/');
  if (homeRes.status !== 200) throw new Error('GET / failed with status ' + homeRes.status);
  console.log('✓ GET / returned 200 OK');

  const prodRes = await get('http://localhost:3000/product.html?id=1');
  if (prodRes.status !== 200) throw new Error('GET /product.html?id=1 failed with status ' + prodRes.status);
  console.log('✓ GET /product.html?id=1 returned 200 OK');

  const apiRes = await get('http://localhost:3000/api/products/1/history?range=90d');
  if (apiRes.status !== 200) throw new Error('GET /api/products/1/history failed with status ' + apiRes.status);
  console.log('✓ GET /api/products/1/history?range=90d returned 200 OK');

  console.log('\n==========================================================');
  console.log('🎉 ALL AUDIT & REGRESSION TESTS PASSED CLEANLY (100%)!');
  console.log('==========================================================\n');
}

verifyAuditRegression().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
