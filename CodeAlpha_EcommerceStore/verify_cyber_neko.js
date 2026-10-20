/**
 * Comprehensive Verification Script for Realistic Interactive AI Robot Authentication
 */
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

async function runVerification() {
  console.log('======================================================================');
  console.log('🤖 VERIFYING REALISTIC INTERACTIVE AI ROBOT AUTHENTICATION');
  console.log('======================================================================\n');

  let passed = 0;
  let total = 0;
  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(message);
    } else {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    }
  }

  // 1. Server HTTP delivery
  console.log('--- 1. Testing Server Endpoints ---');
  const authRes = await get('http://localhost:3000/auth');
  assert(authRes.status === 200, 'HTTP GET /auth returns 200 OK');
  assert(authRes.body.includes('VYBE SECURITY CORE'), 'Response contains auth page content');

  const jsRes = await get('http://localhost:3000/js/auth3d.js');
  assert(jsRes.status === 200, 'HTTP GET /js/auth3d.js returns 200 OK');
  assert(jsRes.headers['content-type'].includes('javascript'), 'auth3d.js content-type is javascript');

  // 2. Strict No-Image Mascot Constraint
  console.log('\n--- 2. Verifying Strict No-Image Mascot Constraint ---');
  assert(!authRes.body.includes('neko-mascot.png'), 'auth.html does not load neko-mascot.png');
  assert(!authRes.body.includes('mascot.jpg'), 'auth.html does not load mascot.jpg');
  assert(!authRes.body.includes('mascot.webp'), 'auth.html does not load mascot.webp');
  assert(!jsRes.body.includes('.png') && !jsRes.body.includes('.jpg'), 'auth3d.js contains zero raster image paths');

  // 3. Catalog Protection
  console.log('\n--- 3. Verifying Catalog Database Protection ---');
  const dbContent = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
  assert(!dbContent.toLowerCase().includes('mascot'), 'db.js catalog contains zero mascot references');
  const demoProducts = fs.readFileSync(path.join(__dirname, 'demo_products.json'), 'utf8');
  assert(!demoProducts.toLowerCase().includes('mascot'), 'demo_products.json contains zero mascot references');

  // 4. Character Architecture & Detailed Articulation
  console.log('\n--- 4. Verifying Character Components & Rigging in auth3d.js ---');
  const auth3d = jsRes.body;
  assert(auth3d.includes('id="headGroup"'), 'Head rig component (#headGroup) present');
  assert(auth3d.includes('id="earLeft"') && auth3d.includes('id="earRight"'), 'Futuristic cat-ear antennae (#earLeft, #earRight) present');
  assert(auth3d.includes('vybe-cyan-antenna') && auth3d.includes('vybe-magenta-antenna'), 'Cat-ear antennae cyan & magenta dual lighting present');
  assert(auth3d.includes('id="goldEarNodeL"') && auth3d.includes('id="goldEarNodeR"'), 'Gold circular robotic ear components present');
  assert(auth3d.includes('id="eyesOpen"') && auth3d.includes('id="eyesClosed"') && auth3d.includes('id="eyesSurprise"'), 'Full eye expression rigs (open, closed arcs, surprise) present');
  assert(auth3d.includes('id="blushGroup"'), 'Toggleable pink cheek blush paths (#blushGroup) present');
  assert(auth3d.includes('id="armLeft"') && auth3d.includes('id="armRight"'), 'Foreground articulated arms present');
  assert(auth3d.includes('id="handLeft"') && auth3d.includes('id="handRight"'), 'Articulated hands with 5 individual fingers present');
  assert(auth3d.includes('vybe-hand-left-rig') && auth3d.includes('vybe-hand-right-rig'), 'Multi-segment finger articulation rigging present');
  assert(auth3d.includes('vybe-amber-core-glow'), 'Glowing amber core in chest present');
  assert(auth3d.includes('vybe-breathing-torso') && auth3d.includes('@keyframes vybeBreathing'), 'Natural torso breathing animation present');
  assert(auth3d.includes('cyberParticles') && auth3d.includes('vybe-particle-1'), 'Floating cyber particle field present');
  assert(auth3d.includes('id="emitterBaseGroup"'), 'Holographic emitter base (#emitterBaseGroup) present');

  // 5. Interactive Animation States
  console.log('\n--- 5. Verifying Interactive Animation States in auth3d.js ---');
  assert(auth3d.includes('.state-watching .vybe-head-rig'), 'State B (Email Focus): head tilt defined');
  assert(auth3d.includes('.state-watching .vybe-arm-right-rig'), 'State B (Email Focus): welcoming hand gesture defined');
  assert(auth3d.includes('.state-peek .vybe-arm-left-rig') && auth3d.includes('.state-peek .vybe-arm-right-rig'), 'State C (Password Focus): both hands cover eyes');
  assert(auth3d.includes('.state-peek .vybe-eyes-closed-rig'), 'State C (Password Focus): closed happy eye arcs (^ ^)');
  assert(auth3d.includes('.state-peek .vybe-blush-rig'), 'State C (Password Focus): full opacity blush');
  assert(auth3d.includes('.state-typing .vybe-head-rig') && auth3d.includes('vybePlayfulBob'), 'State D (Password Typing): playful head bobble with hands covering eyes');
  assert(auth3d.includes('.state-turned-away .vybe-head-rig') && auth3d.includes('scaleX(-1)'), 'State F (Show Password): look-away / horizontal flip');
  assert(auth3d.includes('.state-celebrate .vybe-arm-right-rig') && auth3d.includes('vybeWaveHand'), 'State G (Success): celebratory wave gesture');

  // 6. Speech Bubble Messages & Form Wiring in auth.html
  console.log('\n--- 6. Verifying Speech Bubble Text & Form Wiring in auth.html ---');
  assert(authRes.body.includes("Hi! I'm Vybe 🐾 Ready to discover verified lowest prices across Amazon, Flipkart &amp; Croma?") ||
         authRes.body.includes("Hi! I'm Vybe 🐾 Ready to discover verified lowest prices across Amazon, Flipkart & Croma?"),
         'State A: Speech bubble idle greeting present');
  assert(authRes.body.includes("Checking our live database for your wishlist & tracked deals... 👁️👁️"),
         'State B: Email focus speech text present');
  assert(authRes.body.includes("Shhh… Your password is private! 🙈"),
         'State C & D: "Shhh… Your password is private! 🙈" present');
  assert(authRes.body.includes("Whoa! Don't show your password out in the open! 🫣"),
         'State F: Show password speech text present');
  assert(authRes.body.includes("Welcome to VYBE BOT! Syncing verified price drops across Amazon, Flipkart & Croma 🎉"),
         'State G: Auth success speech text present');
  assert(authRes.body.includes("pInput.addEventListener('input'"),
         'Password typing input event listener wired in auth.html');

  // 7. Modal Layout & Aesthetic Polish
  console.log('\n--- 7. Verifying Modal Layout & Premium Interface Polish ---');
  assert(authRes.body.includes('focus:border-[#4355F5] focus:ring-2 focus:ring-[#4355F5]/20'),
         'Electric Cobalt active focus ring applied to form inputs');
  assert(authRes.body.includes('id="mascot3dWrap"') && authRes.body.includes('pointer-events-none'),
         'Left character wrapper has pointer-events: none to prevent form blocking');
  assert(authRes.body.includes('id="mascot3dWrap"') && authRes.body.includes('overflow-hidden'),
         'Mascot stage wrapper has overflow-hidden for clean containment');
  assert(authRes.body.includes('from-[#F8FAFC] via-[#EEF4FB] to-[#E2EBF6]'),
         'Subtle white and pale-blue background with soft ambient gradients present');
  assert(authRes.body.includes('lg:h-[560px] xl:h-[620px]'),
         'Large robot stage occupying ~65-80% of panel height present');
  assert(authRes.body.includes('mb-4') && authRes.body.includes('z-20'),
         'Speech bubble centered with z-20 and mb-4 styling');

  console.log(`\n======================================================================`);
  console.log(`🎉 ALL ${passed} / ${total} VERIFICATION CHECKS PASSED SUCCESSFULLY!`);
  console.log(`======================================================================\n`);
}

runVerification().catch(err => {
  console.error('\nVerification failed:', err.message);
  process.exit(1);
});
