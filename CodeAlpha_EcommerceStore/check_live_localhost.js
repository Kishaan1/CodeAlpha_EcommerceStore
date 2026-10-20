const http = require('http');

async function testHttp(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  console.log('1. Checking GET http://localhost:3000/ ...');
  const home = await testHttp({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' });
  console.log('   Status:', home.status, '| HTML bytes:', home.body.length);
  if (!home.body.includes('VYBE MARKET')) throw new Error('Home page title missing');
  if (!home.body.includes('id="loginSubmitBtn"')) throw new Error('loginSubmitBtn missing from HTML');
  if (!home.body.includes('id="tabLogin"')) throw new Error('tabLogin missing from HTML');
  if (!home.body.includes('id="tabRegister"')) throw new Error('tabRegister missing from HTML');
  console.log('   ✓ Home page served with full Auth modal & controls');

  console.log('2. Checking POST http://localhost:3000/api/auth/login ...');
  const login = await testHttp({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'demo@vybe.market', password: 'password123' }));
  console.log('   Status:', login.status);
  const loginData = JSON.parse(login.body);
  console.log('   ✓ Logged in as:', loginData.user?.name, '| Token prefix:', loginData.token?.substring(0, 25) + '...');
  if (login.status !== 200 || !loginData.token) throw new Error('Login failed');

  console.log('3. Checking GET http://localhost:3000/api/auth/me (Protected Route) ...');
  const me = await testHttp({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + loginData.token }
  });
  const meData = JSON.parse(me.body);
  console.log('   Status:', me.status, '| Authenticated User:', meData.user?.email);
  if (me.status !== 200) throw new Error('/api/auth/me failed');

  const testEmail = 'shopper_' + Date.now() + '@vybe.market';
  console.log('4. Checking POST http://localhost:3000/api/auth/register with', testEmail, '...');
  const reg = await testHttp({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ name: 'Live User', email: testEmail, password: 'password123' }));
  console.log('   Status:', reg.status);
  const regData = JSON.parse(reg.body);
  console.log('   ✓ Registered user:', regData.user?.name, '| ID:', regData.user?.id);
  if (reg.status !== 201 || !regData.token) throw new Error('Registration failed');

  console.log('5. Checking Invalid Login Rejection (401) ...');
  const invalidLogin = await testHttp({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'demo@vybe.market', password: 'WrongPassword999' }));
  console.log('   Status:', invalidLogin.status, '| Rejection message:', JSON.parse(invalidLogin.body).error);
  if (invalidLogin.status !== 401) throw new Error('Expected 401 on wrong password');

  console.log('\n======================================================');
  console.log('✅ ALL LOCALHOST:3000 AUTHENTICATION OPTIONS ARE FULLY WORKING!');
  console.log('======================================================');
})();
