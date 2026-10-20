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

async function verifyHeroRedesign() {
  console.log('--- Step 1: Checking Server HTTP 200 Response ---');
  const res = await get('http://localhost:3000/');
  console.log(`GET / status: ${res.status} (body length: ${res.body.length})`);
  if (res.status !== 200) throw new Error('Home page failed to return HTTP 200');

  console.log('\n--- Step 2: Verifying Hero HTML & Styling in index.html ---');
  const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  const requiredTokens = [
    // 1. Color Palette & Card Container
    'dark:bg-slate-950 dark:text-slate-100',
    'dark:bg-slate-900/80 dark:border-slate-800',

    // 2. Left Hero Column
    'Smart Deals, Best Prices.',
    'bg-gradient-to-r from-rose-400 via-amber-400 to-indigo-400 bg-clip-text text-transparent',
    'COMPARE LIVE ACROSS AMAZON, FLIPKART &amp; CROMA',
    'heroQtyMinus',
    'heroQtyCount',
    'heroQtyPlus',
    'heroCompareBuyBtn',
    'Compare &amp; Buy',

    'rounded-full bg-gradient-to-tr',
    'backdrop-blur-xl relative flex items-center justify-center',
    'heroShowcaseImg',
    'heroBadgeTopRight',
    'heroBadgeBottomLeft',
    'heroSwitcherList',

    // 4. Seamless Integration
    'categoryChips',
    'dealFilterPills',
    'sortSelect',
    'productGrid'
  ];

  for (const token of requiredTokens) {
    if (!html.includes(token)) {
      throw new Error(`Missing expected token in index.html: "${token}"`);
    }
    console.log(`✓ Verified index.html contains: "${token.slice(0, 45)}..."`);
  }

  console.log('\n--- Step 3: Verifying JS Engine in app.js ---');
  const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf8');

  const requiredJsTokens = [
    'heroQtyMinus',
    'heroQtyCount',
    'heroQtyPlus',
    'heroCompareBuyBtn',
    'heroShowcaseImg',
    'heroFeaturedTitle',
    'heroFeaturedPrice',
    'heroFeaturedOriginalPrice',
    'heroFeaturedDiscountBadge',
    'heroProductDesc',
    'heroBadgeTopRight',
    'heroBadgeTopRightText',
    'heroBadgeBottomLeft',
    'heroBadgeBottomLeftText',
    'heroSwitcherList',
    'HERO_FEATURED_ITEMS',
    'renderHeroSwitcher',
    'selectHeroFeatured',
    'initHeroControls',
    'initHeroControls()'
  ];

  for (const token of requiredJsTokens) {
    if (!appJs.includes(token)) {
      throw new Error(`Missing expected JS token in app.js: "${token}"`);
    }
    console.log(`✓ Verified app.js contains: "${token}"`);
  }

  console.log('\n--- Step 4: Verifying CSS Animations in styles.css ---');
  const css = fs.readFileSync(path.join(__dirname, 'public', 'css', 'styles.css'), 'utf8');
  const requiredCss = [
    'spinSlow',
    'animate-spin-slow',
    'bounceSubtle',
    'animate-bounce-subtle',
    'hero-switcher-item',
    'category-chip'
  ];
  for (const token of requiredCss) {
    if (!css.includes(token)) {
      throw new Error(`Missing expected CSS token in styles.css: "${token}"`);
    }
    console.log(`✓ Verified styles.css contains: "${token}"`);
  }

  console.log('\n=============================================');
  console.log('✅ ALL HERO REDESIGN CHECKS PASSED!');
  console.log('=============================================');
}

verifyHeroRedesign().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
