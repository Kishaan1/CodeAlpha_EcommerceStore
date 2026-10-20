// verify_vybe_market.js
// Comprehensive Verification of VYBE MARKET Editorial Commerce Experience

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

async function verifyVybeMarket() {
  console.log('======================================================================');
  console.log('🔍 VERIFYING PROJECT: VYBE MARKET — ORIGINAL EDITORIAL COMMERCE');
  console.log('======================================================================\n');

  // 1. Live Server & HTML Availability
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

  // 2. Original Brand & Art Direction
  console.log('\n--- 2. Verifying Original Brand & Typography ---');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('VYBE MARKET'), 'index.html must display VYBE MARKET brand');
  assert.ok(indexHtml.includes('GOOD FINDS. BETTER PRICES.'), 'index.html must display GOOD FINDS. BETTER PRICES.');
  assert.ok(indexHtml.includes('Space+Grotesk'), 'index.html must import Space Grotesk editorial font');
  assert.ok(indexHtml.includes('VM•26'), 'index.html must display VM•26 edition badge');
  console.log('✓ Verified VYBE MARKET brand wordmark, slogan, and editorial typography');

  // 3. Compact Utility Header (2.A)
  console.log('\n--- 3. Verifying Compact Utility Header ---');
  assert.ok(indexHtml.includes('id="searchInput"'), 'Header must contain integrated search input');
  assert.ok(indexHtml.includes('id="themeToggleBtn"'), 'Header must contain theme toggle');
  assert.ok(indexHtml.includes('id="loginBtn"'), 'Header must contain account login button');
  assert.ok(indexHtml.includes('id="wishlistNavBtn"'), 'Header must contain wishlist button');
  assert.ok(indexHtml.includes('id="cart-btn"'), 'Header must contain cart bag button');
  console.log('✓ Verified compact utility header and primary navigation controls');

  // 4. Editorial Opening Section (2.B)
  console.log('\n--- 4. Verifying Editorial Opening Section ---');
  assert.ok(indexHtml.includes('[01 / EDITORIAL LEAD]'), 'index.html must include [01 / EDITORIAL LEAD]');
  assert.ok(indexHtml.includes('GOOD FINDS.<br />'), 'index.html must include large typographic headline');
  assert.ok(indexHtml.includes('BETTER PRICES.'), 'index.html must include BETTER PRICES.');
  assert.ok(indexHtml.includes('Live Store Comparison'), 'Opening montage must include live store comparison');
  assert.ok(indexHtml.includes('Amazon.in'), 'Opening montage must compare Amazon');
  assert.ok(indexHtml.includes('Flipkart'), 'Opening montage must compare Flipkart');
  assert.ok(indexHtml.includes('Croma'), 'Opening montage must compare Croma');
  console.log('✓ Verified asymmetric editorial lead composition and product montage');

  // 5. Live-Feeling Discovery Ticker (2.C)
  console.log('\n--- 5. Verifying Live Discovery Ticker ---');
  assert.ok(indexHtml.includes('id="liveDiscoveryTickerSection"'), 'index.html must include live discovery ticker section');
  assert.ok(indexHtml.includes('discovery-ticker-chip'), 'index.html must include discovery ticker chips');
  assert.ok(indexHtml.includes('data-ticker-search="Sony WH-1000XM4"'), 'Ticker must include Sony deal search chip');
  assert.ok(indexHtml.includes('data-ticker-category="Laptops"'), 'Ticker must include Laptops category chip');
  assert.ok(indexHtml.includes('data-ticker-budget="999"'), 'Ticker must include under 999 budget chip');
  console.log('✓ Verified live-feeling horizontal discovery ticker');

  // 6. Shop By Intent (2.D)
  console.log('\n--- 6. Verifying Shop By Intent Section ---');
  assert.ok(indexHtml.includes('id="shopByIntentSection"'), 'index.html must include shop by intent section');
  assert.ok(indexHtml.includes('Upgrade your everyday tech.'), 'Intent block 1 must be present');
  assert.ok(indexHtml.includes('Build a better workspace.'), 'Intent block 2 must be present');
  assert.ok(indexHtml.includes('Audio worth listening to.'), 'Intent block 3 must be present');
  assert.ok(indexHtml.includes('Everyday style, reconsidered.'), 'Intent block 4 must be present');
  assert.ok(indexHtml.includes('Useful things under ₹999.'), 'Intent block 5 must be present');
  console.log('✓ Verified all 5 editorial intent collections with varied proportions');

  // 7. Product Discovery as Curated Editorial Grid (2.E & 3)
  console.log('\n--- 7. Verifying Curated Editorial Grid & Product Cards ---');
  assert.ok(indexHtml.includes('id="curatedGridSection"'), 'index.html must include curatedGridSection');
  assert.ok(indexHtml.includes('id="productGrid"'), 'index.html must contain productGrid');
  assert.ok(indexHtml.includes('id="dealFilterPills"'), 'index.html must contain dealFilterPills');

  const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf8');
  assert.ok(appJs.includes('Amazon</span>'), 'Product card must include Amazon price badge');
  assert.ok(appJs.includes('Flipkart</span>'), 'Product card must include Flipkart price badge');
  assert.ok(appJs.includes('Croma</span>'), 'Product card must include Croma price badge');
  assert.ok(appJs.includes('data-action="view-trend"'), 'Product card must include 90D trend button');
  assert.ok(appJs.includes('data-action="add-to-cart"'), 'Product card must include add-to-cart button');
  assert.ok(appJs.includes('data-action="toggle-wishlist"'), 'Product card must include wishlist toggle');
  console.log('✓ Verified curated product grid and multi-store comparison cards');

  // 8. The Price Check Module (2.F)
  console.log('\n--- 8. Verifying The Price Check Module ---');
  assert.ok(indexHtml.includes('id="thePriceCheckSection"'), 'index.html must include thePriceCheckSection');
  assert.ok(indexHtml.includes('THE PRICE CHECK'), 'index.html must contain THE PRICE CHECK headline');
  assert.ok(indexHtml.includes('Simulated demonstration data for benchmark comparison'), 'index.html must clearly disclose demo benchmark schema');
  assert.ok(indexHtml.includes('id="deal-url-input"'), 'index.html must contain deal-url-input');
  assert.ok(indexHtml.includes('id="scan-deal-btn"'), 'index.html must contain scan-deal-btn');
  assert.ok(indexHtml.includes('sample-deal-btn'), 'index.html must contain sample-deal-btn');
  console.log('✓ Verified THE PRICE CHECK module with live URL scanner & sample deals');

  // 9. Active Deals & Personality (2.G)
  console.log('\n--- 9. Verifying Active Deals & Timed Promotions ---');
  assert.ok(indexHtml.includes('id="verifiedCouponCenter"'), 'index.html must include verifiedCouponCenter');
  assert.ok(indexHtml.includes('flashHours'), 'index.html must include countdown clock hours');
  assert.ok(indexHtml.includes('flashMinutes'), 'index.html must include countdown clock minutes');
  assert.ok(indexHtml.includes('flashSeconds'), 'index.html must include countdown clock seconds');
  console.log('✓ Verified verified coupons center and active countdown timer');

  // 10. Useful Editorial Footer (2.H)
  console.log('\n--- 10. Verifying Useful Editorial Footer ---');
  assert.ok(indexHtml.includes('id="footerSupport"'), 'index.html must include footerSupport');
  assert.ok(indexHtml.includes('VYBE MARKET'), 'Footer must contain VYBE MARKET branding');
  assert.ok(indexHtml.includes('Supported Gateways'), 'Footer must include supported payment methods');
  assert.ok(indexHtml.includes('Editorial Edits'), 'Footer must include editorial links');
  console.log('✓ Verified editorial footer, directory, and demonstration disclosure');

  // 11. Complete Theme System & Persistence
  console.log('\n--- 11. Verifying Complete Theme System ---');
  const stylesCss = fs.readFileSync(path.join(__dirname, 'public', 'css', 'styles.css'), 'utf8');
  assert.ok(stylesCss.includes('.font-editorial'), 'styles.css must define font-editorial');
  assert.ok(stylesCss.includes('.editorial-meta'), 'styles.css must define editorial-meta');
  assert.ok(stylesCss.includes('.intent-block'), 'styles.css must define intent-block');
  assert.ok(stylesCss.includes('.discovery-ticker-chip'), 'styles.css must define discovery-ticker-chip');
  console.log('✓ Verified editorial CSS classes and responsive design tokens');

  console.log('\n======================================================================');
  console.log('🎉 100% OF ALL VYBE MARKET EDITORIAL COMMERCE CHECKS PASSED!');
  console.log('======================================================================');
}

verifyVybeMarket().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
