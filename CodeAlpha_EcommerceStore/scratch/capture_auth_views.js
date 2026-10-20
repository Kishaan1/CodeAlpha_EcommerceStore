const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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

    console.log('Navigating to http://127.0.0.1:3001/auth...');
    await page.goto('http://127.0.0.1:3001/auth', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    // Capture IDLE
    const outIdle = 'C:/Users/kisha/.gemini/antigravity-ide/brain/9e754bca-1fd0-4941-8dac-019801572311/sentinel_calibrated_idle.png';
    await page.screenshot({ path: outIdle });
    console.log('Saved IDLE screenshot to:', outIdle);

    // Focus password to trigger COVER_EYES
    await page.focus('#auth-password');
    await new Promise(r => setTimeout(r, 1200));

    // Capture COVER_EYES
    const outCover = 'C:/Users/kisha/.gemini/antigravity-ide/brain/9e754bca-1fd0-4941-8dac-019801572311/sentinel_calibrated_cover_eyes.png';
    await page.screenshot({ path: outCover });
    console.log('Saved COVER_EYES screenshot to:', outCover);

    // Type into password to check typing lock
    await page.type('#auth-password', 'SecretPass2026!');
    await new Promise(r => setTimeout(r, 800));

    // Capture TYPING
    const outTyping = 'C:/Users/kisha/.gemini/antigravity-ide/brain/9e754bca-1fd0-4941-8dac-019801572311/sentinel_calibrated_typing.png';
    await page.screenshot({ path: outTyping });
    console.log('Saved TYPING screenshot to:', outTyping);

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
