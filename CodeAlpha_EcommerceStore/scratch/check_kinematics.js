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
  await new Promise(r => setTimeout(r, 1000));

  const data = await page.evaluate(() => {
    const head = window.bones.head;
    const items = [];
    head.traverse(c => {
      const v = new THREE.Vector3();
      c.getWorldPosition(v);
      items.push({ name: c.name || c.type, y: v.y, z: v.z });
    });

    const lp = new THREE.Vector3();
    const rp = new THREE.Vector3();
    window.bones.leftPaw.getWorldPosition(lp);
    window.bones.rightPaw.getWorldPosition(rp);

    return {
      items,
      leftPaw: { y: lp.y, z: lp.z, x: lp.x },
      rightPaw: { y: rp.y, z: rp.z, x: rp.x }
    };
  });

  console.log('Hierarchy world Y/Z:', JSON.stringify(data, null, 2));
  await browser.close();
})();
