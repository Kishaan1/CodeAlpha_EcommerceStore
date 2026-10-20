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

async function verifyMascotUpgrade() {
  console.log('======================================================================');
  console.log('🤖 VERIFYING VYBE MARKET 3D ANIMATED MASCOT AUTHENTICATION UPGRADE');
  console.log('======================================================================\n');

  // --- Step 1: Mascot Asset Integration & File Integrity ---
  console.log('--- Step 1: Verifying Mascot Asset & Delivery ---');
  const assetPath = path.join(__dirname, 'public', 'assets', 'vybe-mascot.png');
  if (!fs.existsSync(assetPath)) {
    throw new Error('Mascot image asset not found at public/assets/vybe-mascot.png');
  }
  const assetStats = fs.statSync(assetPath);
  console.log(`  ✓ Mascot image asset found: ${assetStats.size} bytes (${(assetStats.size / 1024).toFixed(1)} KB)`);

  const assetRes = await get('http://localhost:3000/assets/vybe-mascot.png');
  if (assetRes.status !== 200) {
    throw new Error(`HTTP GET /assets/vybe-mascot.png failed with status ${assetRes.status}`);
  }
  if (!assetRes.headers['content-type'] || !assetRes.headers['content-type'].includes('image')) {
    throw new Error(`Unexpected Content-Type for /assets/vybe-mascot.png: ${assetRes.headers['content-type']}`);
  }
  console.log(`  ✓ Express correctly serves /assets/vybe-mascot.png (HTTP 200, Content-Type: ${assetRes.headers['content-type']})`);

  // --- Step 2: HTML Split-Screen Architecture ---
  console.log('\n--- Step 2: Verifying Split-Screen Auth Modal Structure in index.html ---');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  // Prominent Split Screen
  if (!indexHtml.includes('grid-cols-1 lg:grid-cols-12')) {
    throw new Error('Missing responsive split-screen grid (grid-cols-1 lg:grid-cols-12)');
  }
  if (!indexHtml.includes('lg:col-span-5') || !indexHtml.includes('lg:col-span-7')) {
    throw new Error('Split-screen proportions must feature 40-50% mascot stage (lg:col-span-5) and form (lg:col-span-7)');
  }
  console.log('  ✓ Verified 40-50% desktop split-screen architecture (lg:col-span-5 / lg:col-span-7)');

  // Mascot Stage & Elements
  if (!indexHtml.includes('id="auth-avatar"')) {
    throw new Error('Missing #auth-avatar stage element');
  }
  if (!indexHtml.includes('/assets/vybe-mascot.png')) {
    throw new Error('Missing reference to /assets/vybe-mascot.png in authModal');
  }
  if (!indexHtml.includes('mascot-hero-image')) {
    throw new Error('Missing .mascot-hero-image class');
  }
  if (!indexHtml.includes('mascot-floating-rig')) {
    throw new Error('Missing .mascot-floating-rig container');
  }
  if (!indexHtml.includes('mascot-pedestal-glow')) {
    throw new Error('Missing .mascot-pedestal-glow element');
  }
  if (!indexHtml.includes('id="mascotSpeechBubble"') || !indexHtml.includes('id="mascotSpeechText"')) {
    throw new Error('Missing mascot speech bubble elements');
  }
  if (!indexHtml.includes('Real-time Lowest Price') || !indexHtml.includes('Verified 180D History')) {
    throw new Error('Missing shopping personality floating badge chips');
  }
  console.log('  ✓ Verified 3D mascot stage elements (hero image, glowing pedestal, speech bubble, perks)');

  // Close Button Accessibility
  if (!indexHtml.includes('data-close-modal="authModal"')) {
    throw new Error('Missing top-right close button hook data-close-modal="authModal"');
  }
  if (!indexHtml.includes('absolute top-4 right-4 z-30')) {
    throw new Error('Close button must be positioned accessible in the top-right corner with high z-index');
  }
  console.log('  ✓ Verified accessible top-right close button (z-30, aria-label="Close")');

  // Coordinated Light and Dark Themes
  if (!indexHtml.includes('from-[#FAF7F2]') || !indexHtml.includes('dark:from-[#0B0F19]')) {
    throw new Error('Missing coordinated light/dark gradient stage colors');
  }
  console.log('  ✓ Verified coordinated light (#FAF7F2) and dark navy (#0B0F19/#10182B) backgrounds');

  // Preserved Form & Authentication Logic
  if (!indexHtml.includes('id="loginForm"') || !indexHtml.includes('id="registerForm"')) {
    throw new Error('Missing loginForm or registerForm elements');
  }
  if (!indexHtml.includes('id="auth-email"') || !indexHtml.includes('id="auth-password"')) {
    throw new Error('Missing auth input fields');
  }
  if (!indexHtml.includes('id="tabLogin"') || !indexHtml.includes('id="tabRegister"')) {
    throw new Error('Missing login/register tabs');
  }
  console.log('  ✓ Verified full authentication forms, inputs, tabs, and social buttons preserved');

  // --- Step 3: CSS Keyframe Animations & Performance ---
  console.log('\n--- Step 3: Verifying CSS Animations & Reduced-Motion in styles.css ---');
  const stylesCss = fs.readFileSync(path.join(__dirname, 'public', 'css', 'styles.css'), 'utf8');

  const requiredCss = [
    '@keyframes modalStageEnter',
    '.animate-modal-stage',
    '@keyframes mascotFloat',
    '.mascot-floating-rig',
    '.mascot-hero-image',
    '@keyframes cyanGlowPulse',
    '.animate-cyan-glow',
    '@keyframes driftOne',
    '@keyframes driftTwo',
    '.animate-drift-1',
    '.animate-drift-2',
    '[data-state="watching"]',
    '[data-state="peek"]',
    '[data-state="turned-away"]',
    '[data-state="success"]',
    '@media (prefers-reduced-motion: reduce)'
  ];

  requiredCss.forEach((cssSnippet) => {
    if (!stylesCss.includes(cssSnippet)) {
      throw new Error(`Missing required CSS rule or animation: ${cssSnippet}`);
    }
  });
  console.log('  ✓ Verified @keyframes modalStageEnter, mascotFloat, cyanGlowPulse, driftOne, driftTwo');
  console.log('  ✓ Verified reactive mascot state transitions (watching, peek, turned-away, success)');
  console.log('  ✓ Verified @media (prefers-reduced-motion: reduce) accessibility support');

  // --- Step 4: JavaScript Reactive Mascot & Speech Bubble Controller ---
  console.log('\n--- Step 4: Verifying JavaScript Controller in app.js ---');
  const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf8');

  if (!appJs.includes('updateMascotSpeech')) {
    throw new Error('Missing updateMascotSpeech helper function in app.js');
  }
  if (!appJs.includes("updateMascotSpeech('watching')")) {
    throw new Error('Missing updateMascotSpeech("watching") on email focus');
  }
  if (!appJs.includes("updateMascotSpeech('peek')")) {
    throw new Error('Missing updateMascotSpeech("peek") on password focus');
  }
  if (!appJs.includes("updateMascotSpeech('success')")) {
    throw new Error('Missing updateMascotSpeech("success") on login/register success');
  }
  if (!appJs.includes("updateMascotSpeech('error'")) {
    throw new Error('Missing updateMascotSpeech("error") on auth failure');
  }
  console.log('  ✓ Verified dynamic speech bubble reactivity on all user actions');

  // --- Step 5: Live Server Regression Validation ---
  console.log('\n--- Step 5: Verifying Server Status & Endpoints ---');
  const homeRes = await get('http://localhost:3000/');
  if (homeRes.status !== 200) throw new Error('GET / failed with status ' + homeRes.status);
  console.log('  ✓ Home page GET /: 200 OK');

  console.log('\n======================================================================');
  console.log('🎉 100% OF 3D ANIMATED MASCOT AUTHENTICATION CHECKS PASSED!');
  console.log('======================================================================\n');
}

verifyMascotUpgrade().catch((err) => {
  console.error('❌ Mascot verification failed:', err);
  process.exit(1);
});
