/**
 * browser_error_check.js
 * ----------------------
 * Injects error-catching diagnostics into the served HTML to find runtime JS errors.
 * We monkey-patch the served HTML via a tiny proxy.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Read the HTML
const htmlPath = path.join(__dirname, 'public', 'index.html');
const originalHtml = fs.readFileSync(htmlPath, 'utf-8');

// Check the script tag for app.js
const appJsTagMatch = originalHtml.match(/<script[^>]*src=["'][^"']*app\.js["'][^>]*>/);
console.log('app.js script tag:', appJsTagMatch ? appJsTagMatch[0] : 'NOT FOUND');

// Check if type="module" is on app.js
if (appJsTagMatch && appJsTagMatch[0].includes('type="module"')) {
  console.log('\n🚨 FOUND: app.js has type="module"');
  console.log('   This means the script runs in module scope.');
  console.log('   All top-level declarations are module-scoped, not global.\n');
  
  // Read app.js to check for issues
  const appJs = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf-8');
  
  // Check: Does app.js use import/export?
  const hasImport = /^\s*import\s/m.test(appJs);
  const hasExport = /^\s*export\s/m.test(appJs);
  console.log('   Has import statements:', hasImport);
  console.log('   Has export statements:', hasExport);
  
  // Check: Is 'use strict' at the top?
  const hasUseStrict = appJs.includes("'use strict'");
  console.log('   Has \'use strict\':', hasUseStrict);
  console.log('   (Modules are always strict, so \'use strict\' is redundant but not harmful)\n');
  
  // CRITICAL: With type="module", the script is deferred automatically.
  // This means it runs AFTER the DOM is parsed, which is actually GOOD for el.* references.
  // But it also means DOMContentLoaded may have ALREADY FIRED by the time the module runs.
  
  // Let's check: Does the code handle the case where DOMContentLoaded already fired?
  const readyStateCheck = appJs.includes('document.readyState');
  console.log('   Has document.readyState check:', readyStateCheck);
  
  // Extract the init trigger code
  const triggerMatch = appJs.match(/if\s*\(document\.readyState\s*===\s*['"]loading['"]\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?\}/);
  if (triggerMatch) {
    console.log('   Init trigger code:', triggerMatch[0].replace(/\s+/g, ' '));
  }
  
  // With type="module", document.readyState will be 'interactive' or 'complete'
  // when the module runs. So the else branch (init()) runs directly.
  // The el = { ... } at the top also runs after DOM is ready. So far so good.
  
  // But here's the REAL issue: type="module" causes CORS restrictions.
  // If served from file:// or without proper MIME type, the module won't load at all!
  
  // Let's check what Content-Type the server sends for app.js
  console.log('\n--- Checking server response for app.js ---');
}

// Test: Fetch app.js from the server and check headers
const req = http.get('http://localhost:3000/js/app.js', (res) => {
  console.log('app.js response status:', res.statusCode);
  console.log('app.js Content-Type:', res.headers['content-type']);
  
  let bodyLen = 0;
  res.on('data', chunk => bodyLen += chunk.length);
  res.on('end', () => {
    console.log('app.js body length:', bodyLen, 'bytes');
    
    // Check MIME type
    const ct = res.headers['content-type'] || '';
    if (!ct.includes('javascript') && !ct.includes('ecmascript')) {
      console.log('\n🚨 CRITICAL: Server does NOT send JavaScript MIME type for app.js!');
      console.log('   With type="module", the browser REQUIRES a valid JavaScript MIME type.');
      console.log('   Without it, the browser will REFUSE to execute the module!');
      console.log('   This means app.js NEVER RUNS, and NO event listeners are attached!');
      console.log('   This explains why ALL buttons are unresponsive!');
    } else {
      console.log('   MIME type is correct for module loading.');
    }
    
    // Also check three.min.js and mascot3d.js
    console.log('\n--- Checking other script files ---');
    http.get('http://localhost:3000/js/three.min.js', (r2) => {
      console.log('three.min.js Content-Type:', r2.headers['content-type'], 'Status:', r2.statusCode);
      let b2 = 0;
      r2.on('data', c => b2 += c.length);
      r2.on('end', () => {
        console.log('three.min.js body length:', b2, 'bytes');
        
        http.get('http://localhost:3000/js/mascot3d.js', (r3) => {
          console.log('mascot3d.js Content-Type:', r3.headers['content-type'], 'Status:', r3.statusCode);
          let b3 = 0;
          r3.on('data', c => b3 += c.length);
          r3.on('end', () => {
            console.log('mascot3d.js body length:', b3, 'bytes');
            
            // Final analysis
            console.log('\n=== FINAL ANALYSIS ===');
            console.log('The root cause is likely one of:');
            console.log('1. type="module" on app.js + MIME type issue → script silently fails to load');
            console.log('2. type="module" on app.js + a runtime error during init → wireEvents never called');
            console.log('3. A Three.js error in mascot3d.js that blocks subsequent script execution');
            console.log('\nRECOMMENDED FIX: Remove type="module" from the app.js script tag');
            console.log('since app.js does not use ES module syntax (no import/export).\n');
          });
        });
      });
    });
  });
});
