/**
 * runtime_crash_test.js
 * ---------------------
 * Uses a real HTTP request to test if app.js init crashes at runtime.
 * We inject a test script into the page that catches and reports errors.
 */
const http = require('http');

function httpReq(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  console.log('=== RUNTIME CRASH TEST ===\n');

  // Test 1: Check if the HTML loads the right scripts in the right order
  const home = await httpReq({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' });
  const html = home.body;

  // Find script tag positions
  const scripts = [];
  let idx = 0;
  while (true) {
    const si = html.indexOf('<script', idx);
    if (si < 0) break;
    const ei = html.indexOf('</script>', si);
    if (ei < 0) break;
    const tag = html.substring(si, ei + 9);
    const srcMatch = tag.match(/src=["']([^"']+)["']/);
    scripts.push({
      position: si,
      src: srcMatch ? srcMatch[1] : 'INLINE',
      hasDefer: tag.includes('defer'),
      hasAsync: tag.includes(' async'),
      snippet: tag.substring(0, 120)
    });
    idx = ei + 9;
  }

  console.log('Script loading order:');
  scripts.forEach((s, i) => {
    console.log(`  ${i + 1}. [pos:${s.position}] ${s.src} ${s.hasDefer ? '(defer)' : ''} ${s.hasAsync ? '(async)' : ''}`);
  });

  // Check if app.js comes AFTER the DOM elements it references
  const appJsScript = scripts.find(s => s.src.includes('app.js'));
  const authModalPos = html.indexOf('id="authModal"');
  const loginFormPos = html.indexOf('id="loginForm"');
  const loginBtnPos = html.indexOf('id="loginBtn"');

  console.log('\n--- Script vs DOM element positions ---');
  console.log(`  authModal at position: ${authModalPos}`);
  console.log(`  loginForm at position: ${loginFormPos}`);
  console.log(`  loginBtn at position: ${loginBtnPos}`);
  console.log(`  app.js at position: ${appJsScript ? appJsScript.position : 'NOT FOUND'}`);

  if (appJsScript) {
    if (authModalPos > 0 && appJsScript.position < authModalPos) {
      console.log('\n  ⚠️ app.js loads BEFORE authModal! DOM elements may not exist yet!');
      console.log('     This would cause ALL el.* references to be null at script parse time!');
    } else {
      console.log('\n  ✓ app.js loads after DOM elements');
    }
  }

  // CRITICAL CHECK: Does app.js have defer/async?
  if (appJsScript) {
    if (!appJsScript.hasDefer && !appJsScript.hasAsync) {
      // Check if there's a DOMContentLoaded wrapper
      const appJsContent = require('fs').readFileSync(require('path').join(__dirname, 'public/js/app.js'), 'utf-8');
      const hasDOMContentLoaded = appJsContent.includes('DOMContentLoaded');
      
      console.log(`\n  app.js has defer: ${appJsScript.hasDefer}`);
      console.log(`  app.js has async: ${appJsScript.hasAsync}`);
      console.log(`  app.js has DOMContentLoaded: ${hasDOMContentLoaded}`);
      
      // Check if the el = { ... } object is inside DOMContentLoaded or at top level
      const elObjectLine = appJsContent.indexOf('const el = {');
      const domContentLine = appJsContent.indexOf('DOMContentLoaded');
      
      if (elObjectLine < domContentLine || domContentLine < 0) {
        console.log('\n  ⚠️ CRITICAL: "const el = {...}" is defined at FILE TOP LEVEL (line ~49)');
        console.log('     This means all $("id") calls execute IMMEDIATELY when the script loads.');
        console.log('     If app.js loads in <head> or before DOM elements, ALL el.* will be null!');
        
        // Verify: Is app.js in <head> or before </body>?
        const headEnd = html.indexOf('</head>');
        const bodyEnd = html.indexOf('</body>');
        
        if (appJsScript.position < headEnd) {
          console.log('\n  🚨 CONFIRMED ROOT CAUSE: app.js is in <head>!');
          console.log('     All el.* references are null because DOM hasn\'t been parsed yet.');
          console.log('     Even though DOMContentLoaded wraps init(), the el object itself');
          console.log('     is populated at parse time when DOM elements don\'t exist.');
        } else if (appJsScript.position < bodyEnd) {
          console.log('\n  app.js is before </body> - position OK');
          
          // But check if it's before the elements it references
          const lastDomElement = Math.max(authModalPos, loginFormPos, loginBtnPos);
          if (appJsScript.position < lastDomElement) {
            console.log('  ⚠️ BUT app.js loads BEFORE some DOM elements it references!');
            console.log(`     app.js position: ${appJsScript.position}`);
            console.log(`     Last referenced element position: ${lastDomElement}`);
          }
        }
      }
    }
  }

  // Check: does the script tag have type="module"?
  if (appJsScript) {
    const isModule = appJsScript.snippet.includes('type="module"');
    console.log(`\n  app.js type="module": ${isModule}`);
  }

  // Final check: Look at what happens right around the script tags
  console.log('\n--- Checking for errors in script tag context ---');
  
  // Find the exact app.js script tag and surrounding HTML
  if (appJsScript) {
    const ctx = html.substring(Math.max(0, appJsScript.position - 200), Math.min(html.length, appJsScript.position + 200));
    console.log('  Context around app.js tag:');
    console.log('  ...', ctx.replace(/\s+/g, ' ').substring(0, 300), '...');
  }

  // Check: Is there something AFTER app.js that could throw?
  const afterAppJs = scripts.filter(s => appJsScript && s.position > appJsScript.position);
  if (afterAppJs.length > 0) {
    console.log('\n  Scripts loading AFTER app.js:');
    afterAppJs.forEach(s => console.log(`    ${s.src}`));
  }

  // Test 2: Check if el.year exists (it's accessed in init without null guard)
  const yearEl = html.includes('id="year"');
  console.log(`\n  el.year (id="year") exists: ${yearEl}`);
  if (!yearEl) {
    console.log('  🚨 el.year is null! Line 7765: el.year.textContent = new Date().getFullYear()');
    console.log('     This WILL crash init() before wireEvents() is called!');
  }

  console.log('\n=== TEST COMPLETE ===');
})();
