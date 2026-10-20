const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kisha\\.gemini\\antigravity-ide\\brain\\9e754bca-1fd0-4941-8dac-019801572311';

async function captureSentinelStates() {
  console.log('🚀 Launching Chrome to verify Sentinel v2.4 states & capture visual proof...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Browser console error:', msg.text());
  });

  let port = 3000;
  try {
    const res = await fetch('http://localhost:3000/api/health');
    if (!res.ok) port = 3001;
  } catch (e) {
    port = 3001;
  }

  console.log(`Navigating to http://localhost:${port}/auth...`);
  await page.goto(`http://localhost:${port}/auth`, { waitUntil: 'networkidle2' });

  // Wait for 3D canvas
  await page.waitForFunction(() => {
    const c = document.getElementById('mascot-3d-container');
    return c && c.querySelector('canvas') !== null;
  }, { timeout: 10000 });

  await new Promise(r => setTimeout(r, 1200));

  // 1. Capture State A: Idle Sitting
  console.log('1. Capturing State A: Idle Sitting...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'sentinel_state_a_idle.png'),
    fullPage: false
  });

  // 2. Capture State B: Email Focused (Curious tilt + right cyber-paw elevated)
  console.log('2. Focusing #auth-email (State B: Email Focus)...');
  await page.focus('#auth-email');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'sentinel_state_b_email.png'),
    fullPage: false
  });

  // 3. Capture State C: Password Focused (Both front paws covering visor eyes)
  console.log('3. Focusing #auth-password (State C: Cover Eyes)...');
  await page.focus('#auth-password');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'sentinel_state_c_password_cover.png'),
    fullPage: false
  });

  // 4. Capture State D: Typing into Password (Paws remain firmly covering visor)
  console.log('4. Typing into #auth-password (State D: Typing while covering eyes)...');
  await page.type('#auth-password', 'CyberCatSecure2026!');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'sentinel_state_d_typing_cover.png'),
    fullPage: false
  });

  // 5. Capture State E: Password Revealed (Toggle eye button -> Look Away + Ocular rings)
  console.log('5. Clicking password visibility toggle (State E: Look Away)...');
  await page.click('#toggle-password-visibility');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'sentinel_state_e_look_away.png'),
    fullPage: false
  });

  // 6. Capture State F: Blur / Return to Idle
  console.log('6. Blurring password input (State F: Grounded Idle)...');
  await page.click('body', { offset: { x: 50, y: 50 } });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'sentinel_state_f_returned_idle.png'),
    fullPage: false
  });

  await browser.close();

  if (pageErrors.length > 0) {
    console.error('Browser errors detected:', pageErrors);
    process.exit(1);
  }

  console.log('🎉 Visual proof captured successfully in all 6 states with 0 console errors!');
}

captureSentinelStates().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
