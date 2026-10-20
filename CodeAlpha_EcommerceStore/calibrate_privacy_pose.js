const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kisha\\.gemini\\antigravity-ide\\brain\\9e754bca-1fd0-4941-8dac-019801572311';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  await page.goto('http://127.0.0.1:3001/auth', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#mascot-3d-canvas canvas', { timeout: 12000 });

  // Focus password
  await page.focus('#auth-password');
  await new Promise(r => setTimeout(r, 1200));

  const shot = path.join(ARTIFACT_DIR, 'test_recalibrated_cover_eyes.png');
  await page.screenshot({ path: shot });
  console.log('Saved screenshot:', shot);

  await browser.close();
})();
