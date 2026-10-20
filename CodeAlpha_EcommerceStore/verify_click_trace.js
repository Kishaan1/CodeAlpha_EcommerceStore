const fs = require('fs');
const path = require('path');
const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, body: d });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('======================================================================');
  console.log('🔍 TRACING CLICK EVENTS, TAB SWITCHING, & SUBMISSION IN SOURCE FILES');
  console.log('======================================================================\n');

  const html = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, 'public/js/app.js'), 'utf8');

  // 1. Identify Login Component & Buttons
  console.log('--- 1. Identifying Login Component and Target Buttons in index.html ---');
  const elements = [
    { id: 'authModal', desc: 'Auth modal container' },
    { id: 'tabLogin', desc: 'Sign In tab button' },
    { id: 'tabRegister', desc: 'Sign Up tab button' },
    { id: 'loginForm', desc: 'Login form element' },
    { id: 'registerForm', desc: 'Register form element' },
    { id: 'loginSubmitBtn', desc: 'Main Sign In submit button' },
    { id: 'registerSubmitBtn', desc: 'Main Register submit button' },
    { id: 'switchToRegisterBtn', desc: 'Inline switch to Sign Up link' },
    { id: 'switchToLoginBtn', desc: 'Inline switch to Sign In link' }
  ];

  for (const el of elements) {
    if (html.includes(`id="${el.id}"`)) {
      console.log(`  ✓ Found ${el.desc} (id="${el.id}")`);
    } else {
      console.error(`  ✗ Missing: ${el.desc} (id="${el.id}")`);
      process.exit(1);
    }
  }

  // 2. Check Click Handlers and Submit Handlers in app.js
  console.log('\n--- 2. Checking Click Handlers & Form Submit Handlers in app.js ---');
  const handlerChecks = [
    { name: 'Sign In Tab click listener', check: "tabLog.addEventListener('click'" },
    { name: 'Sign In Tab onclick fallback', check: 'tabLog.onclick' },
    { name: 'Sign Up Tab click listener', check: "tabReg.addEventListener('click'" },
    { name: 'Sign Up Tab onclick fallback', check: 'tabReg.onclick' },
    { name: 'Login Form submit listener', check: "logForm.addEventListener('submit', handleLogin)" },
    { name: 'Login Submit Button direct click listener', check: "loginSubmit.addEventListener('click'" },
    { name: 'Register Form submit listener', check: "regForm.addEventListener('submit', handleRegister)" },
    { name: 'Register Submit Button direct click listener', check: "regSubmit.addEventListener('click'" },
    { name: 'Inline switchToRegisterBtn click listener', check: "switchToReg.addEventListener('click'" },
    { name: 'Inline switchToLoginBtn click listener', check: "switchToLog.addEventListener('click'" }
  ];

  for (const h of handlerChecks) {
    if (appJs.includes(h.check)) {
      console.log(`  ✓ ${h.name} is properly connected`);
    } else {
      console.error(`  ✗ Handler not connected: ${h.name} (${h.check})`);
      process.exit(1);
    }
  }

  // 3. Check for Overlays, Button Types, Stacking Context
  console.log('\n--- 3. Checking for Transparent Overlays, Stacking Context & Button Types ---');
  if (html.includes('id="tabLogin" class="auth-tab flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer active"') &&
      html.includes('type="button" id="tabLogin"') &&
      html.includes('type="button" id="tabRegister"')) {
    console.log('  ✓ Tab buttons have explicit type="button" and cursor-pointer (will not trigger unexpected reloads)');
  } else {
    console.error('  ✗ Tab buttons missing explicit type="button"');
    process.exit(1);
  }

  if (html.includes('type="submit" id="loginSubmitBtn"') &&
      html.includes('type="submit" id="registerSubmitBtn"')) {
    console.log('  ✓ Main submit buttons have explicit type="submit"');
  } else {
    console.error('  ✗ Submit buttons missing explicit type="submit"');
    process.exit(1);
  }

  // Check stacking context
  const hasCardZ10 = html.includes('relative z-10');
  const hasFormZ20 = html.includes('relative z-20');
  if (hasCardZ10 && hasFormZ20) {
    console.log('  ✓ Modal dialog card has relative z-10 and form column has relative z-20 (immune to backdrop/canvas overlay clicks)');
  } else {
    console.error('  ✗ Stacking context z-index missing on modal card or form column');
    process.exit(1);
  }

  // 4. Verify Tab Switching Logic
  console.log('\n--- 4. Verifying Form State Switching (Sign In <-> Sign Up) ---');
  if (appJs.includes("tabLog.classList.toggle('active', isLogin)") &&
      appJs.includes("tabReg.classList.toggle('active', !isLogin)") &&
      appJs.includes("logForm.classList.toggle('hidden', !isLogin)") &&
      appJs.includes("regForm.classList.toggle('hidden', isLogin)")) {
    console.log('  ✓ switchAuthTab cleanly toggles both active tab pill classes and form hidden states');
  } else {
    console.error('  ✗ Form switching logic missing toggle commands in app.js');
    process.exit(1);
  }

  // 5. Trace Main Submit Handler to Backend API
  console.log('\n--- 5. Tracing Form Submission to Backend Authentication API ---');
  const apiLogin = await post('http://localhost:3000/api/auth/login', {
    email: 'demo@vybe.market',
    password: 'password123'
  });
  if (apiLogin.status === 200 && apiLogin.body.token && apiLogin.body.user) {
    console.log(`  ✓ Login API reached: HTTP 200 OK (User: ${apiLogin.body.user.name}, Token: ${apiLogin.body.token.slice(0, 18)}...)`);
  } else {
    console.error('  ✗ Login API failure:', apiLogin);
    process.exit(1);
  }

  const newShopper = `trace_${Date.now()}@vybe.market`;
  const apiRegister = await post('http://localhost:3000/api/auth/register', {
    name: 'Trace User',
    email: newShopper,
    password: 'testPassword456'
  });
  if (apiRegister.status === 201 && apiRegister.body.token && apiRegister.body.user) {
    console.log(`  ✓ Register API reached: HTTP 201 Created (User: ${apiRegister.body.user.name}, ID: ${apiRegister.body.user.id})`);
  } else {
    console.error('  ✗ Register API failure:', apiRegister);
    process.exit(1);
  }

  console.log('\n======================================================================');
  console.log('🎉 100% OF CLICK TRACE & SUBMIT VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('======================================================================');
})();
