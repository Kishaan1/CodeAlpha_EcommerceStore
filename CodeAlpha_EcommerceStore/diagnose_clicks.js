/**
 * diagnose_clicks.js
 * ------------------
 * Diagnoses why clicks don't work in the browser.
 * Strategy: Fetch the real HTML, find every element that wireEvents() tries
 * to access via el.* or document.getElementById(*), and check if it exists.
 * Then simulate DOMContentLoaded to see if init()/wireEvents() throws.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function fetch(urlPath) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + urlPath, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

(async () => {
  console.log('=== PHASE 1: Diagnosing why ALL buttons are unresponsive ===\n');

  // 1. Get the real HTML from the server
  const html = await fetch('/');
  console.log('HTML length:', html.length, 'bytes');

  // 2. Read app.js source
  const appJsPath = path.join(__dirname, 'public', 'js', 'app.js');
  const appJs = fs.readFileSync(appJsPath, 'utf-8');

  // 3. Find all IDs referenced in app.js that use $('...') or document.getElementById('...')
  const refsById = new Set();
  // Pattern: $('someId')
  const p1 = /\$\(['"]([^'"]+)['"]\)/g;
  let m;
  while ((m = p1.exec(appJs)) !== null) refsById.add(m[1]);
  // Pattern: document.getElementById('someId')
  const p2 = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
  while ((m = p2.exec(appJs)) !== null) refsById.add(m[1]);

  console.log('\nTotal unique IDs referenced in app.js:', refsById.size);

  // 4. Check which IDs exist in the HTML
  const missing = [];
  const found = [];
  for (const id of refsById) {
    // Look for id="xxx" or id='xxx'
    const re = new RegExp(`id=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
    if (re.test(html)) {
      found.push(id);
    } else {
      missing.push(id);
    }
  }

  console.log('Found in HTML:', found.length);
  console.log('MISSING from HTML:', missing.length);
  if (missing.length > 0) {
    console.log('\n--- MISSING ELEMENT IDs (referenced in app.js but not in index.html) ---');
    missing.forEach(id => console.log('  ✗', id));
  }

  // 5. Now check wireEvents specifically - find el.* references WITHOUT null guards
  // Extract the wireEvents function body
  const wireStart = appJs.indexOf('function wireEvents()');
  if (wireStart < 0) {
    console.log('\n✗ wireEvents() NOT FOUND in app.js!');
    return;
  }

  // Find matching closing brace
  let braceCount = 0;
  let wireEnd = -1;
  for (let i = appJs.indexOf('{', wireStart); i < appJs.length; i++) {
    if (appJs[i] === '{') braceCount++;
    if (appJs[i] === '}') braceCount--;
    if (braceCount === 0) { wireEnd = i + 1; break; }
  }
  const wireBody = appJs.substring(wireStart, wireEnd);

  console.log('\n--- Checking for UNGUARDED el.* accesses in wireEvents() ---');
  // Find all el.xxx.addEventListener lines
  const lines = wireBody.split('\n');
  let crashers = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match el.something.addEventListener (without being preceded by 'if (el.something)')
    const elMatch = line.match(/^el\.(\w+)\.(addEventListener|onclick)/);
    if (elMatch) {
      const elName = elMatch[1];
      // Check if previous non-empty line is a null guard
      let prevLine = '';
      for (let j = i - 1; j >= 0; j--) {
        if (lines[j].trim()) { prevLine = lines[j].trim(); break; }
      }
      const isGuarded = prevLine.includes(`if (el.${elName})`) || prevLine.includes(`el.${elName} &&`);
      if (!isGuarded) {
        crashers.push({ prop: elName, line: line.substring(0, 80), guarded: false });
      }
    }
  }

  if (crashers.length > 0) {
    console.log('\n⚠️  UNGUARDED el.* accesses that WILL CRASH if element is null:');
    crashers.forEach(c => {
      const elId = c.prop;
      // Find corresponding $('id') or getElementById call in el object init
      const elObjMatch = appJs.match(new RegExp(`${elId}:\\s*\\$\\(['"]([^'"]+)['"]\\)`));
      const mappedId = elObjMatch ? elObjMatch[1] : '?';
      const existsInHtml = found.includes(mappedId);
      console.log(`  el.${c.prop} (maps to id="${mappedId}") → ${existsInHtml ? 'EXISTS in HTML' : '✗ MISSING from HTML → WILL CRASH'}`);
    });
  }

  // 6. Check the init() function for any early crash potential
  console.log('\n--- Checking init() function calls for potential crashes ---');
  const initStart = appJs.indexOf('async function init()');
  if (initStart >= 0) {
    const initBrace = appJs.indexOf('{', initStart);
    let bc = 0;
    let initEnd = -1;
    for (let i = initBrace; i < appJs.length; i++) {
      if (appJs[i] === '{') bc++;
      if (appJs[i] === '}') bc--;
      if (bc === 0) { initEnd = i + 1; break; }
    }
    const initBody = appJs.substring(initStart, initEnd);
    const initCalls = initBody.match(/\b\w+\(/g) || [];
    console.log('  init() calls:', initCalls.join(', '));

    // Check each function called by init - do they reference el.* unsafely?
    const initFns = initBody.split('\n')
      .map(l => l.trim())
      .filter(l => l.match(/^\w+\(/) && !l.startsWith('//'))
      .map(l => l.replace(/\(.*/, ''));
    
    for (const fnName of initFns) {
      const fnStart = appJs.indexOf(`function ${fnName}(`);
      if (fnStart < 0) continue;
      const fnBrace = appJs.indexOf('{', fnStart);
      let bc2 = 0, fnEnd2 = -1;
      for (let i = fnBrace; i < appJs.length; i++) {
        if (appJs[i] === '{') bc2++;
        if (appJs[i] === '}') bc2--;
        if (bc2 === 0) { fnEnd2 = i + 1; break; }
      }
      const fnBody = appJs.substring(fnStart, fnEnd2);
      // Check for el.* without null guards that reference missing IDs
      const elRefs = fnBody.match(/el\.(\w+)\./g) || [];
      const uniqueRefs = [...new Set(elRefs.map(r => r.replace(/^el\./, '').replace(/\.$/, '')))];
      for (const ref of uniqueRefs) {
        const elObjMatch = appJs.match(new RegExp(`${ref}:\\s*\\$\\(['"]([^'"]+)['"]\\)`));
        const mappedId = elObjMatch ? elObjMatch[1] : null;
        if (mappedId && missing.includes(mappedId)) {
          console.log(`  ⚠️  ${fnName}() uses el.${ref} (id="${mappedId}") which is MISSING from HTML`);
        }
      }
    }
  }

  // 7. Check for any CSS rules that block pointer events globally
  console.log('\n--- Checking for CSS pointer-events:none ---');
  const cssPath = path.join(__dirname, 'public', 'css', 'styles.css');
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf-8');
    const pointerNoneMatches = css.match(/[^}]*pointer-events\s*:\s*none[^}]*/g) || [];
    if (pointerNoneMatches.length > 0) {
      console.log('  pointer-events:none rules found:');
      pointerNoneMatches.forEach(rule => {
        // Find the selector
        const trimmed = rule.trim();
        console.log('  ', trimmed.substring(0, 120));
      });
    } else {
      console.log('  No pointer-events:none rules found');
    }
  }

  // 8. Check inline styles in HTML for pointer-events:none
  const inlinePointerNone = html.match(/pointer-events\s*:\s*none/gi) || [];
  console.log('  Inline pointer-events:none in HTML:', inlinePointerNone.length, 'occurrences');

  // 9. Check for canvas elements and their z-index/pointer-events  
  console.log('\n--- Checking for canvas/overlay elements that might block clicks ---');
  const canvasMatches = html.match(/<canvas[^>]*>/gi) || [];
  console.log('  Canvas elements in HTML:', canvasMatches.length);
  canvasMatches.forEach(c => console.log('   ', c.substring(0, 100)));

  // 10. Check if THREE.js script loads and potentially blocks
  const threeScripts = html.match(/three[^"']*/gi) || [];
  console.log('  Three.js references:', threeScripts.length);

  // 11. Check if there's a loading screen that persists
  const loadingScreen = html.match(/id=["'](loading|splash|preloader|loader)[^"']*["']/gi) || [];
  console.log('  Loading screens:', loadingScreen.length);
  loadingScreen.forEach(l => console.log('   ', l));

  // 12. NEW: Check for script loading errors by verifying all src scripts exist
  console.log('\n--- Checking if all <script src="..."> files exist locally ---');
  const scriptSrcs = [...html.matchAll(/src=["']([^"']+\.js)["']/g)].map(m => m[1]);
  for (const src of scriptSrcs) {
    if (src.startsWith('http')) {
      console.log(`  External: ${src.substring(0, 80)} (cannot verify)`);
    } else {
      const localPath = path.join(__dirname, 'public', src.replace(/^\//, ''));
      const exists = fs.existsSync(localPath);
      console.log(`  ${exists ? '✓' : '✗ MISSING'} ${src} → ${localPath}`);
    }
  }

  // 13. Check for THREE.js mascot that might cover the modal
  console.log('\n--- Checking Three.js mascot canvas positioning ---');
  const mascotCanvasMatch = html.match(/<div[^>]*id=["']mascot-3d-container["'][^>]*>/i);
  if (mascotCanvasMatch) {
    console.log('  Mascot container found:', mascotCanvasMatch[0].substring(0, 120));
    // Check for z-index and pointer-events in the container and parents
    const containerIdx = html.indexOf(mascotCanvasMatch[0]);
    const surrounding = html.substring(Math.max(0, containerIdx - 500), containerIdx + 500);
    const zMatch = surrounding.match(/z-(?:index|[0-9]+)/gi);
    const peMatch = surrounding.match(/pointer-events[^;]*/gi);
    if (zMatch) console.log('  z-index nearby:', zMatch.join(', '));
    if (peMatch) console.log('  pointer-events nearby:', peMatch.join(', '));
  }

  console.log('\n=== DIAGNOSIS COMPLETE ===');
})();
