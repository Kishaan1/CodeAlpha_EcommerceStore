const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kisha\\.gemini\\antigravity-ide\\brain\\9e754bca-1fd0-4941-8dac-019801572311';

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAIL: ${msg}`);
    throw new Error(msg);
  }
  console.log(`✓ PASS: ${msg}`);
}

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: CHROME_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    console.log('Navigating to http://127.0.0.1:3001/auth...');
    await page.goto('http://127.0.0.1:3001/auth', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Verify Header
    const headerData = await page.evaluate(() => {
      const coreBadge = document.querySelector('.flex.items-center.gap-2.px-3.py-1\\.5.rounded-full');
      const onlineBadge = Array.from(document.querySelectorAll('span')).find(s => s.textContent.trim() === 'ONLINE');
      const mascotStatus = document.getElementById('mascotStatusText');
      const statusVisible = mascotStatus ? window.getComputedStyle(mascotStatus).display !== 'none' : false;
      return {
        hasCoreBadge: !!coreBadge,
        hasOnlineBadge: !!onlineBadge,
        statusVisible
      };
    });
    assert(headerData.hasCoreBadge, 'Security Core badge present');
    assert(headerData.hasOnlineBadge, 'ONLINE status pill present');
    assert(!headerData.statusVisible, 'Stray raw status text is hidden/removed');

    // 2. Verify Speech Bubble
    const bubbleData = await page.evaluate(() => {
      const b = document.getElementById('mascot-top-bubble');
      const text = document.getElementById('mascotSpeechText');
      return {
        text: text ? text.textContent : '',
        whiteSpace: b ? window.getComputedStyle(b).whiteSpace : ''
      };
    });
    assert(bubbleData.text.includes("Hi! I'm Vybe Bot"), 'Bubble contains welcome text');
    assert(bubbleData.whiteSpace === 'nowrap', 'Speech bubble has single-line nowrap styling');

    // Screenshot IDLE
    const idlePath = path.join(ARTIFACT_DIR, 'final_auth_idle.png');
    await page.screenshot({ path: idlePath });
    console.log(`Saved IDLE screenshot to ${idlePath}`);

    // 3. Test Password Focus (Elevated Shielding)
    await page.focus('#auth-password');
    await new Promise(r => setTimeout(r, 1200));

    // Screenshot COVER_EYES
    const coverPath = path.join(ARTIFACT_DIR, 'final_auth_password_cover.png');
    await page.screenshot({ path: coverPath });
    console.log(`Saved COVER_EYES screenshot to ${coverPath}`);

    const coverData = await page.evaluate(() => {
      const topBubble = document.getElementById('mascotSpeechText').textContent;
      const targs = window.targetRotations;
      const lp = new THREE.Vector3();
      const rp = new THREE.Vector3();
      window.bones.leftPaw.getWorldPosition(lp);
      window.bones.rightPaw.getWorldPosition(rp);

      return {
        topBubble,
        leftPawY: lp.y,
        rightPawY: rp.y,
        leftPawZ: lp.z,
        rightPawZ: rp.z,
        shoulderTargX: targs.leftShoulder.x
      };
    });
    assert(coverData.topBubble.includes("Shhh... Your password is private!"), 'Top bubble text for COVER_EYES correct');
    assert(coverData.shoulderTargX === 1.95, 'Shoulder target rotation X is 1.95');
    console.log(`Paws in COVER_EYES: Left (y=${coverData.leftPawY.toFixed(3)}, z=${coverData.leftPawZ.toFixed(3)}), Right (y=${coverData.rightPawY.toFixed(3)}, z=${coverData.rightPawZ.toFixed(3)})`);
    assert(coverData.leftPawY >= 0.55 && coverData.rightPawY >= 0.55, 'Both paws elevated to shield the curved visor eyes (y >= 0.55)');

    // 4. Test Typing Keystrokes Lock
    await page.type('#auth-password', 'MySuperSecret2026!');
    await new Promise(r => setTimeout(r, 800));

    // Screenshot TYPING
    const typingPath = path.join(ARTIFACT_DIR, 'final_auth_password_typing.png');
    await page.screenshot({ path: typingPath });
    console.log(`Saved TYPING screenshot to ${typingPath}`);

    const typingData = await page.evaluate(() => {
      const topBubble = document.getElementById('mascotSpeechText').textContent;
      const curState = window.currentMascotState;
      return { topBubble, curState };
    });
    assert(typingData.topBubble.includes("Shhh... Your password is private!"), 'Typing maintains COVER_EYES top bubble');
    assert(typingData.curState === 'COVER_EYES', 'Typing locks COVER_EYES state firmly');

    // 5. Verify Right-panel authentication form fields and buttons are clickable
    await page.click('#auth-email');
    await new Promise(r => setTimeout(r, 600));
    const emailFocused = await page.evaluate(() => document.activeElement.id === 'auth-email');
    assert(emailFocused, 'Email field is clickable and focused');

    const submitBtn = await page.$('#submitAuthBtn, button[type="submit"]');
    assert(!!submitBtn, 'Submit button is present in the DOM');

    assert(errors.length === 0, `Zero runtime errors detected (found: ${errors.join(', ')})`);
    console.log('\n🎉 ALL CHECKS PASSED PERFECTLY WITH ZERO ERRORS!');

  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
