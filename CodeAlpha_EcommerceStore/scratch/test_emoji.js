const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://127.0.0.1:3001/auth', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(async () => {
    // Add Google Font Noto Color Emoji
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap';
    document.head.appendChild(link);
    await document.fonts.ready;

    const bubble = document.getElementById('mascot-top-bubble');
    const textSpan = document.getElementById('mascotSpeechText');
    if (bubble) {
      bubble.style.maxWidth = '360px';
      bubble.style.whiteSpace = 'nowrap';
      bubble.style.fontFamily = "'Plus Jakarta Sans', 'Noto Color Emoji', sans-serif";
    }
    if (textSpan) {
      textSpan.textContent = "Shhh... Your password is private! 🙈";
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/kisha/.gemini/antigravity-ide/brain/9e754bca-1fd0-4941-8dac-019801572311/test_noto_emoji.png' });
  await browser.close();
  console.log('Saved test_noto_emoji.png');
})();
