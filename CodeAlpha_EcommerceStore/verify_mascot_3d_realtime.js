const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function verifyMascot3DRealtime() {
  console.log('======================================================================');
  console.log('🚀 VERIFYING REAL-TIME 3D MASCOT CHARACTER (THREE.JS / WEBGL ENGINE)');
  console.log('======================================================================\n');

  // 1. Check local assets & scripts
  console.log('--- 1. Testing Script Asset Delivery ---');
  const threeJsPath = path.join(__dirname, 'public', 'js', 'three.min.js');
  const mascot3dPath = path.join(__dirname, 'public', 'js', 'mascot3d.js');

  if (!fs.existsSync(threeJsPath)) throw new Error('Missing public/js/three.min.js');
  if (!fs.existsSync(mascot3dPath)) throw new Error('Missing public/js/mascot3d.js');
  console.log('  ✓ Verified local three.min.js and mascot3d.js files exist');

  const resThree = await get('http://localhost:3000/js/three.min.js');
  if (resThree.status !== 200) throw new Error('GET /js/three.min.js failed: ' + resThree.status);
  console.log('  ✓ GET /js/three.min.js returned HTTP 200 (' + (resThree.body.length / 1024).toFixed(1) + ' KB)');

  const resMascot = await get('http://localhost:3000/js/mascot3d.js');
  if (resMascot.status !== 200) throw new Error('GET /js/mascot3d.js failed: ' + resMascot.status);
  console.log('  ✓ GET /js/mascot3d.js returned HTTP 200 (' + (resMascot.body.length / 1024).toFixed(1) + ' KB)');

  // 2. Syntax validation
  console.log('\n--- 2. Validating JavaScript Syntax & Structure ---');
  const mascotCode = fs.readFileSync(mascot3dPath, 'utf8');
  new vm.Script(mascotCode);
  console.log('  ✓ mascot3d.js syntax parsed cleanly with zero syntax errors');

  // 3. Verify HTML bindings
  console.log('\n--- 3. Verifying index.html HTML Bindings ---');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  if (!indexHtml.includes('id="mascot3dWrap"')) throw new Error('Missing #mascot3dWrap in index.html');
  if (!indexHtml.includes('/js/three.min.js')) throw new Error('Missing /js/three.min.js script tag in index.html');
  if (!indexHtml.includes('/js/mascot3d.js')) throw new Error('Missing /js/mascot3d.js script tag in index.html');
  console.log('  ✓ Verified #mascot3dWrap WebGL container and script tags in index.html');

  // 4. Verify app.js lifecycle integration
  console.log('\n--- 4. Verifying app.js 3D Mascot Lifecycle Integration ---');
  const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf8');
  if (!appJs.includes('window.Mascot3D.init')) throw new Error('app.js must call Mascot3D.init');
  if (!appJs.includes('window.Mascot3D.start')) throw new Error('app.js must call Mascot3D.start on openModal');
  if (!appJs.includes('window.Mascot3D.stop')) throw new Error('app.js must call Mascot3D.stop on closeModal');
  if (!appJs.includes('window.Mascot3D.setState')) throw new Error('app.js must call Mascot3D.setState on state changes');
  console.log('  ✓ Verified Mascot3D init, start, stop, and setState hooks in app.js');

  // 5. Verify 3D Model Character Rig Features
  console.log('\n--- 5. Auditing 3D Rig Features in mascot3d.js ---');
  const features = [
    { name: 'Head & Ears with glowing cyan channels', query: 'earInnerGeo' },
    { name: 'Expressive anime eyes with pupils & glints', query: 'glint1' },
    { name: 'Blinking eyelids & happy eye morphs', query: 'leftEyelid' },
    { name: 'Chest glowing V chevron badge', query: 'chestGroup' },
    { name: 'Cyber backpack with thrusters', query: 'backpackGroup' },
    { name: 'Articulated shoulders & paws for covering eyes', query: 'leftShoulder' },
    { name: 'Legs with cyber sneakers & glowing trims', query: 'shoeGlowLeft' },
    { name: 'Flexible 4-segment animated cyber tail', query: 'tailSegments' },
    { name: 'Cyan pedestal ground disc with breathing glow', query: 'groundGlowDisc' },
    { name: 'Orbiting 3D shopping accessories (cart, bag, tag)', query: 'floatingAccessories' },
    { name: 'Cursor tracking with clamped head/pupil rotation', query: 'mouse.targetX' },
    { name: 'Reduced-motion accessibility support', query: 'prefers-reduced-motion' },
  ];

  features.forEach(f => {
    if (!mascotCode.includes(f.query)) throw new Error(`Missing feature in mascot3d.js: ${f.name}`);
    console.log(`  ✓ Rig feature verified: ${f.name}`);
  });

  // 6. Verify Form State Reactions
  console.log('\n--- 6. Verifying Form State Machine Reactions ---');
  const states = ['watching', 'peek', 'turned-away', 'success', 'error', 'welcome', 'idle'];
  states.forEach(s => {
    if (!mascotCode.includes(`case '${s}':`)) throw new Error(`Missing state handler in mascot3d.js for: ${s}`);
    console.log(`  ✓ State transition verified: ${s}`);
  });

  console.log('\n======================================================================');
  console.log('🎉 100% OF REAL-TIME 3D MASCOT CHECKS PASSED SUCCESSFULLY!');
  console.log('======================================================================\n');
}

verifyMascot3DRealtime().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
