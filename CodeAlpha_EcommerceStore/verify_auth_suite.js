const http = require('http');
const fs = require('fs');
const path = require('path');

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
  console.log('🚀 RUNNING AUTHENTICATION END-TO-END VERIFICATION');
  console.log('======================================================================\n');

  // 1. Verify demo user logins
  console.log('--- 1. Testing Seeded Demo Accounts Login ---');
  const demoUsers = [
    { email: 'demo@vybe.market', password: 'password123' },
    { email: 'you@example.com', password: 'password123' },
    { email: 'test@vybe.market', password: 'password123' }
  ];

  for (const cred of demoUsers) {
    const res = await post('http://localhost:3000/api/auth/login', cred);
    if (res.status === 200 && res.body.token && res.body.user) {
      console.log(`  ✓ Login succeeded for ${cred.email} (User: ${res.body.user.name}, ID: ${res.body.user.id})`);
    } else {
      console.error(`  ✗ Login failed for ${cred.email}:`, res);
      process.exit(1);
    }
  }

  // 2. Testing new user registration
  console.log('\n--- 2. Testing New User Registration & Immediate Login ---');
  const newEmail = `runner_${Date.now()}@test.market`;
  const regRes = await post('http://localhost:3000/api/auth/register', {
    name: 'Automation Tester',
    email: newEmail,
    password: 'securePass789!'
  });
  if (regRes.status === 201 && regRes.body.token && regRes.body.user) {
    console.log(`  ✓ Registration succeeded for ${newEmail} (Token generated: ${regRes.body.token.slice(0, 15)}...)`);
  } else {
    console.error('  ✗ Registration failed:', regRes);
    process.exit(1);
  }

  // Verify that new user can now log in
  const relogRes = await post('http://localhost:3000/api/auth/login', {
    email: newEmail,
    password: 'securePass789!'
  });
  if (relogRes.status === 200 && relogRes.body.token) {
    console.log(`  ✓ Immediate re-login with new account succeeded`);
  } else {
    console.error('  ✗ Re-login failed:', relogRes);
    process.exit(1);
  }

  // 3. Testing invalid login rejection
  console.log('\n--- 3. Testing Validation & Bad Credentials ---');
  const badRes = await post('http://localhost:3000/api/auth/login', {
    email: 'demo@vybe.market',
    password: 'wrong_password_XYZ'
  });
  if (badRes.status === 401) {
    console.log('  ✓ Correctly rejected invalid password with HTTP 401');
  } else {
    console.error('  ✗ Unexpected response for bad credentials:', badRes);
    process.exit(1);
  }

  // 4. Verify Frontend UI hooks
  console.log('\n--- 4. Checking Frontend HTML/CSS/JS Elements ---');
  const html = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, 'public/js/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'public/css/styles.css'), 'utf8');

  const requiredElements = [
    'tabLogin', 'tabRegister', 'loginForm', 'registerForm',
    'quickFillDemoBtn', 'switchToRegisterBtn', 'switchToLoginBtn',
    'googleLoginBtn', 'appleLoginBtn', 'auth-email', 'auth-password',
    'registerName', 'registerEmail', 'registerPassword'
  ];

  for (const el of requiredElements) {
    if (html.includes(el)) {
      console.log(`  ✓ index.html contains element id/name: ${el}`);
    } else {
      console.error(`  ✗ Missing expected element in index.html: ${el}`);
      process.exit(1);
    }
  }

  if (js.includes('quickFillDemoBtn') && js.includes('switchToRegisterBtn') && js.includes('googleLoginBtn')) {
    console.log('  ✓ app.js contains listeners for autofill, tabs, and social buttons');
  } else {
    console.error('  ✗ Missing UI hooks in app.js');
    process.exit(1);
  }

  if (css.includes('#authModal .auth-tab.active')) {
    console.log('  ✓ styles.css has active styling for tabs');
  } else {
    console.error('  ✗ Missing tab active styles in styles.css');
    process.exit(1);
  }

  console.log('\n======================================================================');
  console.log('🎉 ALL AUTHENTICATION TESTS PASSED 100%!');
  console.log('======================================================================');
})();
