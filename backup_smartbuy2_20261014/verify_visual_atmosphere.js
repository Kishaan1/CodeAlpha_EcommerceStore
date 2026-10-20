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

async function verifyVisualAtmosphere() {
  console.log('--- Step 1: Checking Server HTTP 200 Response ---');
  const res = await get('http://localhost:3000/');
  console.log(`GET / status: ${res.status} (body length: ${res.body.length})`);
  if (res.status !== 200) throw new Error('Home page did not return 200');

  console.log('\n--- Step 2: Verifying Ambient Background in index.html ---');
  const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  const requiredHtml = [
    'bg-grid-pattern',
    'absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse',
    'absolute top-60 -right-20 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10',
    'bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-slate-700/80',
    'border-t border-t-white/10',
    'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75',
    'relative inline-flex rounded-full h-2 w-2 bg-emerald-500',
    'animate-float'
  ];

  for (const token of requiredHtml) {
    if (!html.includes(token)) {
      throw new Error(`Missing expected token in index.html: "${token}"`);
    }
    console.log(`✓ Verified index.html contains: "${token.slice(0, 48)}..."`);
  }

  console.log('\n--- Step 3: Verifying CSS Atmosphere in styles.css ---');
  const css = fs.readFileSync(path.join(__dirname, 'public', 'css', 'styles.css'), 'utf8');

  const requiredCss = [
    '.bg-grid-pattern',
    'linear-gradient',
    'radial-gradient',
    '@keyframes float',
    'transform: translateY(-6px)',
    '.animate-float',
    'border-top: 1px solid rgba(255, 255, 255, 0.12)',
    'rgba(99, 102, 241'
  ];

  for (const token of requiredCss) {
    if (!css.includes(token)) {
      throw new Error(`Missing expected token in styles.css: "${token}"`);
    }
    console.log(`✓ Verified styles.css contains: "${token}"`);
  }

  console.log('\n--- Step 4: Verifying Product Card Frosted Glass & Live Ping in app.js ---');
  const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf8');

  const requiredAppJs = [
    'dark:bg-slate-900/80',
    'dark:backdrop-blur-md',
    'hover:-translate-y-1.5',
    'hover:shadow-[0_20px_35px_-15px_rgba(99,102,241,0.15)]',
    'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75',
    'relative inline-flex rounded-full h-2 w-2 bg-emerald-500'
  ];

  for (const token of requiredAppJs) {
    if (!appJs.includes(token)) {
      throw new Error(`Missing expected token in app.js: "${token}"`);
    }
    console.log(`✓ Verified app.js contains: "${token.slice(0, 48)}..."`);
  }

  console.log('\n=============================================');
  console.log('✅ ALL VISUAL ATMOSPHERE CHECKS PASSED!');
  console.log('=============================================');
}

verifyVisualAtmosphere().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
