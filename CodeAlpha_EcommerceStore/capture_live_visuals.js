const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kisha\\.gemini\\antigravity-ide\\brain\\9e754bca-1fd0-4941-8dac-019801572311';

async function runVisualAudit() {
  console.log('🚀 Starting Automated Headless Visual Capture & Console Audit...\n');

  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error(`Chrome not found at ${CHROME_PATH}`);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,960'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });

  const consoleLogs = [];
  const pageErrors = [];
  const failedRequests = [];
  const successfulRequests = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleLogs.push({ type, text });
    if (type === 'error') {
      console.error(`[PAGE CONSOLE ERROR]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message || String(err));
    console.error(`[UNHANDLED EXCEPTION]: ${err.message}`);
  });

  page.on('requestfailed', req => {
    failedRequests.push({
      url: req.url(),
      errorText: req.failure() ? req.failure().errorText : 'unknown'
    });
  });

  page.on('response', res => {
    successfulRequests.push({
      url: res.url(),
      status: res.status()
    });
  });

  // Flow 1: Homepage Hero & Product Grid
  console.log('--- Flow 1: Capturing Homepage Hero & Top Section ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForSelector('#editorialOpeningSection', { timeout: 5000 });
  await page.waitForSelector('#curatedGridSection', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1200));

  const shot1 = path.join(ARTIFACT_DIR, 'flow_1_homepage_hero.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`✓ Flow 1 Saved: ${shot1}`);

  // Flow 1B: Scroll down to 4-Column Product Grid with 3-Store Comparison Chips
  console.log('--- Flow 1B: Capturing 4-Column Product Grid & Store Micro-Chips ---');
  await page.evaluate(() => {
    document.getElementById('curatedGridSection').scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));
  const shot1b = path.join(ARTIFACT_DIR, 'flow_1b_product_grid_multistore.png');
  await page.screenshot({ path: shot1b, fullPage: false });
  console.log(`✓ Flow 1B Saved: ${shot1b}`);

  // Flow 2: Interactive Search & Predictive Popover
  console.log('\n--- Flow 2: Capturing Interactive Search & Predictive Results ---');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('#searchInput');
  await page.type('#searchInput', 'Headphones', { delay: 40 });
  await page.waitForSelector('#searchSuggestionsPopover:not(.hidden)', { timeout: 4000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 800));

  const shot2 = path.join(ARTIFACT_DIR, 'flow_2_search_and_filter.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log(`✓ Flow 2 Saved: ${shot2}`);

  // Flow 3: Dedicated Product Details Page with Chart.js 90D Canvas & Matrix
  console.log('\n--- Flow 3: Capturing Dedicated Product Page (product.html?id=1) ---');
  await page.goto('http://localhost:3000/product.html?id=1', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForSelector('#priceChart', { timeout: 5000 }).catch(() => {});
  await page.waitForSelector('#retailerComparisonBody', { timeout: 5000 }).catch(() => {});
  // Scroll slightly down to frame both the comparison matrix and the price chart
  await page.evaluate(() => {
    const chart = document.getElementById('priceChart');
    if (chart) chart.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1200));

  const shot3 = path.join(ARTIFACT_DIR, 'flow_3_product_comparison_chart.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`✓ Flow 3 Saved: ${shot3}`);

  // Flow 4: Populated Cart Drawer Interaction
  console.log('\n--- Flow 4: Capturing Cart Drawer with Itemized Items ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForSelector('#productGrid', { timeout: 5000 });
  // Add first product to cart
  const addCartBtn = await page.$('.product-card [data-action="add-to-cart"]');
  if (addCartBtn) {
    await addCartBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }
  // Open cart drawer
  const cartBtn = await page.$('#cart-btn');
  if (cartBtn) {
    await cartBtn.click();
    await page.waitForSelector('#cart-drawer', { timeout: 3000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 900));
  }

  const shot4 = path.join(ARTIFACT_DIR, 'flow_4_cart_drawer_interaction.png');
  await page.screenshot({ path: shot4, fullPage: false });
  console.log(`✓ Flow 4 Saved: ${shot4}`);

  // Flow 5: Dedicated Authentication Screen (auth.html)
  console.log('\n--- Flow 5: Capturing Split 3D Mascot Authentication Screen ---');
  await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForSelector('#auth3dCanvasWrap', { timeout: 6000 }).catch(() => {});
  await page.waitForSelector('#authForm', { timeout: 5000 }).catch(() => {});
  // Focus on password to see mascot reactive stance
  const pwdInput = await page.$('#authPassword');
  if (pwdInput) {
    await pwdInput.focus();
    await page.type('#authPassword', 'SecretPass123', { delay: 40 });
    await new Promise(r => setTimeout(r, 900));
  }

  const shot5 = path.join(ARTIFACT_DIR, 'flow_5_split_auth_mascot.png');
  await page.screenshot({ path: shot5, fullPage: false });
  console.log(`✓ Flow 5 Saved: ${shot5}`);

  await browser.close();

  // Print Complete Network & Console Audit
  console.log('\n======================================================');
  console.log('📊 AUDIT SUMMARY: CONSOLE & NETWORK INTEGRITY');
  console.log('======================================================');
  console.log(`Total HTTP Responses Recorded: ${successfulRequests.length}`);
  console.log(`HTTP 200/OK Count: ${successfulRequests.filter(r => r.status >= 200 && r.status < 400).length}`);
  console.log(`Failed / Aborted Network Requests: ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    failedRequests.forEach(f => console.log(`   ⚠️ Failed: ${f.url} (${f.errorText})`));
  }

  console.log(`\nJavaScript Runtime Exceptions (pageerror): ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    pageErrors.forEach(e => console.log(`   ❌ Exception: ${e}`));
  }

  const errorConsoleMsgs = consoleLogs.filter(c => c.type === 'error');
  console.log(`Console Error Messages (console.error): ${errorConsoleMsgs.length}`);
  if (errorConsoleMsgs.length > 0) {
    errorConsoleMsgs.forEach(m => console.log(`   ❌ Console Error: ${m.text}`));
  }

  console.log('\nVisual Capture Artifacts Generated:');
  console.log(`1. [Flow 1: Homepage Hero & Grid]: ${shot1}`);
  console.log(`2. [Flow 2: Search & Filter]: ${shot2}`);
  console.log(`3. [Flow 3: Product & Comparison Chart]: ${shot3}`);
  console.log(`4. [Flow 4: Cart Drawer]: ${shot4}`);
  console.log(`5. [Flow 5: Split Auth & Mascot]: ${shot5}`);
  console.log('\n✅ VISUAL AUDIT & SCREENSHOT CAPTURE COMPLETED SUCCESSFULLY!');
}

runVisualAudit().catch(err => {
  console.error('\n❌ Fatal Visual Audit Error:', err);
  process.exit(1);
});
