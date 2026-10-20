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

  await page.focus('#auth-password');
  await new Promise(r => setTimeout(r, 500));

  const configs = [
    {
      name: 'eyecover_spread_1', // Moderate inward swing
      ls: [-2.52, 0.22, 0.35],
      rs: [-2.52, -0.22, -0.35],
      lf: [0.95, 0.12, 0.22],
      rf: [0.95, -0.12, -0.22],
      lp: [0.35, -0.05, 0.60],
      rp: [0.35, 0.05, -0.60]
    },
    {
      name: 'eyecover_spread_2', // Slightly more spread
      ls: [-2.52, 0.16, 0.32],
      rs: [-2.52, -0.16, -0.32],
      lf: [0.95, 0.08, 0.18],
      rf: [0.95, -0.08, -0.18],
      lp: [0.35, 0, 0.50],
      rp: [0.35, 0, -0.50]
    },
    {
      name: 'eyecover_spread_3', // Direct eye alignment
      ls: [-2.54, 0.10, 0.28],
      rs: [-2.54, -0.10, -0.28],
      lf: [0.95, 0.04, 0.15],
      rf: [0.95, -0.04, -0.15],
      lp: [0.35, 0, 0.40],
      rp: [0.35, 0, -0.40]
    }
  ];

  await page.evaluate(() => {
    if (!window._origRequestAnimationFrame) {
      window._origRequestAnimationFrame = window.requestAnimationFrame;
      const applyOverride = () => {
        if (window.testArmOverride) {
          const c = window.testArmOverride;
          const bs = window.bones;
          if (bs.leftShoulder) bs.leftShoulder.rotation.set(...c.ls);
          if (bs.rightShoulder) bs.rightShoulder.rotation.set(...c.rs);
          if (bs.leftForeleg) bs.leftForeleg.rotation.set(...c.lf);
          if (bs.rightForeleg) bs.rightForeleg.rotation.set(...c.rf);
          if (bs.leftPaw) bs.leftPaw.rotation.set(...c.lp);
          if (bs.rightPaw) bs.rightPaw.rotation.set(...c.rp);
        }
        window._origRequestAnimationFrame(applyOverride);
      };
      window._origRequestAnimationFrame(applyOverride);
    }
  });

  for (const cfg of configs) {
    await page.evaluate((c) => { window.testArmOverride = c; }, cfg);
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: `C:/Users/kisha/.gemini/antigravity-ide/brain/9e754bca-1fd0-4941-8dac-019801572311/test_${cfg.name}.png` });
    console.log(`Saved ${cfg.name}`);
  }

  await browser.close();
})();
