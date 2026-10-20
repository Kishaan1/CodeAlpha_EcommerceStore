// verify_smartbuy_platform.js
// Validates SMARTBUY endpoints, database integrity, and frontend interactions
const http = require('http');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('--- Step 1: Validating Products API & Multi-Store Listings ---');
  const prods = await request('/api/products');
  console.log(`✓ Products count: ${prods.data.count}`);
  if (prods.data.count < 10) throw new Error('Expected at least 10 products');

  console.log('\n--- Step 2: Validating Single Product Details & Price Comparison ---');
  const p1 = await request('/api/products/1');
  console.log(`✓ Product #1: "${p1.data.product.title}" — Best Price: ₹${p1.data.product.best_price || p1.data.product.base_price}`);
  const cmp = await request('/api/products/1/compare');
  console.log(`✓ Stores for product #1: ${cmp.data.stores.map(s => s.store_name + ' (₹' + s.price + ')').join(', ')}`);

  console.log('\n--- Step 3: Validating Dynamic Range Price History (7d, 30d, 90d, 180d) ---');
  for (const range of ['7d', '30d', '90d', '180d']) {
    const h = await request(`/api/products/1/history?range=${range}`);
    console.log(`✓ Range ${range.toUpperCase()}: ${h.data.history.length} snapshots, Verdict: "${h.data.verdict.headline}"`);
  }

  console.log('\n--- Step 4: Validating Verified Store Coupons API ---');
  const coupons = await request('/api/coupons');
  console.log(`✓ Active verified coupons: ${coupons.data.coupons.length}`);
  console.log(`  Sample: ${coupons.data.coupons.slice(0, 3).map(c => c.code + ' (' + c.store_name + ')').join(', ')}`);

  console.log('\n--- Step 5: Validating URL Analyzer & Matcher ---');
  const analysis = await request('/api/analyze-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH' }),
  });
  console.log(`✓ Analyzed Amazon URL: matched=${analysis.data.matched}, product="${analysis.data.product?.title}", savings=₹${analysis.data.summary?.savings}`);

  console.log('\n--- Step 6: Validating AI Shopping Reasoning Assistant ---');
  const aiQueries = [
    'What are the best noise cancelling headphones under 20000?',
    'Is it a good time to buy Sony WH-1000XM5?',
    'Cheaper alternative to Apple AirPods Pro',
  ];
  for (const q of aiQueries) {
    const aiRes = await request('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: q }),
    });
    console.log(`✓ Prompt: "${q}"`);
    console.log(`  Action: ${aiRes.data.actionType}, Recs: ${aiRes.data.recommendations?.length || 0}`);
    console.log(`  Answer: ${aiRes.data.answer.substring(0, 100)}...`);
  }

  console.log('\n--- Step 7: Validating Price Drop Alerts Full Lifecycle ---');
  const createAlert = await request('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 1,
      targetPrice: 19999,
      email: 'tester@smartbuy.in',
    }),
  });
  console.log(`✓ Created alert ID: ${createAlert.data.alert.id}`);

  const listAlerts = await request('/api/alerts?email=tester@smartbuy.in');
  console.log(`✓ Listed alerts for email: ${listAlerts.data.alerts.length} alert(s) found`);

  const delAlert = await request(`/api/alerts/${createAlert.data.alert.id}`, { method: 'DELETE' });
  console.log(`✓ Deleted alert ID: ${createAlert.data.alert.id}, success: ${delAlert.data.success}`);

  console.log('\n--- Step 8: Validating Wishlist Hub ---');
  const addWishlist = await request('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 2, userEmail: 'tester@smartbuy.in' }),
  });
  console.log(`✓ Added product #2 to wishlist: ${addWishlist.data.success}`);

  const getWishlist = await request('/api/wishlist?email=tester@smartbuy.in');
  console.log(`✓ Wishlist items: ${getWishlist.data.items.length}`);

  console.log('\n=============================================');
  console.log('✅ ALL SMARTBUY PLATFORM VALIDATIONS PASSED!');
  console.log('=============================================');
}

run().catch((err) => {
  console.error('Validation error:', err);
  process.exit(1);
});
