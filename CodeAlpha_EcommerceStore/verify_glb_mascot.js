const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

async function verifyGLBMascotSystem() {
  console.log('======================================================================');
  console.log('🤖 VERIFYING ONLINE 3D RIGGED CHARACTER (.GLB) & THREE.JS GLTFLoader');
  console.log('======================================================================\n');

  // 1. Static Asset Validation
  console.log('--- 1. Validating 3D Model Asset ---');
  const modelPath = path.join(__dirname, 'public/assets/models/sentinel.glb');
  assert(fs.existsSync(modelPath), 'sentinel.glb file exists at public/assets/models/sentinel.glb');
  
  const stats = fs.statSync(modelPath);
  assert(stats.size > 400000, `sentinel.glb has valid size (${stats.size} bytes)`);

  // Check glTF binary header magic 'glTF' (0x46546C67)
  const fd = fs.openSync(modelPath, 'r');
  const buffer = Buffer.alloc(4);
  fs.readSync(fd, buffer, 0, 4, 0);
  fs.closeSync(fd);
  assert(buffer.toString('utf8') === 'glTF', "sentinel.glb has valid binary header magic 'glTF'");

  // Test HTTP static delivery
  const modelRes = await get('http://localhost:3000/assets/models/sentinel.glb');
  assert(modelRes.status === 200, 'HTTP GET /assets/models/sentinel.glb returns 200 OK');
  assert(modelRes.headers['content-type'].includes('gltf') || modelRes.headers['content-type'].includes('octet-stream'), 
    `Valid content-type: ${modelRes.headers['content-type']}`);

  // 2. DOM & Markup Structure
  console.log('\n--- 2. Validating public/auth.html Structure & Importmap ---');
  const authHtml = fs.readFileSync(path.join(__dirname, 'public/auth.html'), 'utf8');
  assert(authHtml.includes('id="mascot-3d-container"'), 'Container #mascot-3d-container is present in auth.html');
  assert(authHtml.includes('pointer-events-none'), 'Container has pointer-events: none to avoid blocking inputs');
  assert(authHtml.includes('script type="importmap"'), 'Importmap declared for Three.js module resolution');
  assert(authHtml.includes('src="/js/auth3d.js"'), 'Script tag imports /js/auth3d.js as module');
  assert(authHtml.includes('border-cyan-400'), 'Glowing floor platform styled in auth.html');

  // 3. Three.js GLTFLoader Implementation
  console.log('\n--- 3. Validating public/js/auth3d.js Three.js Rig ---');
  const auth3dCode = fs.readFileSync(path.join(__dirname, 'public/js/auth3d.js'), 'utf8');
  assert(auth3dCode.includes('GLTFLoader'), 'GLTFLoader imported and utilized in auth3d.js');
  assert(auth3dCode.includes('THREE.AmbientLight'), 'Ambient studio light configured');
  assert(auth3dCode.includes('THREE.DirectionalLight'), 'Directional key light configured');
  assert(auth3dCode.includes('THREE.PointLight'), 'Fill and rim point lights configured');
  assert(auth3dCode.includes('COVER_EYES'), 'COVER_EYES pose handler defined');
  assert(auth3dCode.includes('LOOK_AWAY'), 'LOOK_AWAY pose handler defined');
  assert(auth3dCode.includes('EMAIL_FOCUS'), 'EMAIL_FOCUS pose handler defined');
  assert(auth3dCode.includes('IDLE'), 'IDLE pose handler defined');
  assert(auth3dCode.includes('requestAnimationFrame'), 'Smooth requestAnimationFrame loop defined');

  // 4. Live Browser Interaction Verification (Puppeteer)
  console.log('\n--- 4. Validating Live Browser WebGL Execution & Interactions ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle2' });

  // Wait for canvas to be mounted by GLTFLoader
  await page.waitForFunction(() => {
    const container = document.getElementById('mascot-3d-container');
    return container && container.querySelector('canvas') !== null;
  }, { timeout: 8000 });

  assert(true, 'Three.js WebGL canvas initialized and rendered in DOM');

  // Verify bone discovery
  const boneStatus = await page.evaluate(() => {
    const bones = window.THREE_BONES || {};
    return {
      hasLeftArm: !!bones.leftArm,
      leftArmName: bones.leftArm ? bones.leftArm.name : null,
      hasRightArm: !!bones.rightArm,
      rightArmName: bones.rightArm ? bones.rightArm.name : null,
      hasHead: !!bones.headBone,
      headName: bones.headBone ? bones.headBone.name : null
    };
  });
  assert(boneStatus.hasLeftArm, `Left arm bone bound (${boneStatus.leftArmName})`);
  assert(boneStatus.hasRightArm, `Right arm bone bound (${boneStatus.rightArmName})`);
  assert(boneStatus.hasHead, `Head bone bound (${boneStatus.headName})`);

  // Test Pose: EMAIL_FOCUS
  await page.focus('#auth-email');
  await new Promise(r => setTimeout(r, 400));
  const poseEmail = await page.evaluate(() => window.Mascot3D ? window.Mascot3D.getState() : '');
  assert(poseEmail === 'EMAIL_FOCUS', `Email focus triggered EMAIL_FOCUS pose (current: ${poseEmail})`);

  // Test Pose: COVER_EYES
  await page.focus('#auth-password');
  await new Promise(r => setTimeout(r, 400));
  const posePass = await page.evaluate(() => window.Mascot3D ? window.Mascot3D.getState() : '');
  assert(posePass === 'COVER_EYES', `Password focus triggered COVER_EYES pose (current: ${posePass})`);

  // Test Typing: COVER_EYES remains active
  await page.type('#auth-password', 'secret');
  await new Promise(r => setTimeout(r, 300));
  const poseTyping = await page.evaluate(() => window.Mascot3D ? window.Mascot3D.getState() : '');
  assert(poseTyping === 'COVER_EYES', `Keystroke typing keeps COVER_EYES pose active (current: ${poseTyping})`);

  // Test Toggle: LOOK_AWAY
  await page.click('#toggle-password-visibility');
  await new Promise(r => setTimeout(r, 400));
  const poseToggle = await page.evaluate(() => window.Mascot3D ? window.Mascot3D.getState() : '');
  assert(poseToggle === 'LOOK_AWAY', `Password visibility toggle triggered LOOK_AWAY pose (current: ${poseToggle})`);

  await browser.close();

  assert(pageErrors.length === 0, `Zero browser runtime errors detected (errors: ${pageErrors.join(', ')})`);

  console.log('\n======================================================================');
  console.log('🎉 100% OF 3D RIGGED CHARACTER (.GLB) VERIFICATION CHECKS PASSED!');
  console.log('======================================================================\n');
}

verifyGLBMascotSystem().catch(err => {
  console.error('\nVerification failed:', err.message);
  process.exit(1);
});
