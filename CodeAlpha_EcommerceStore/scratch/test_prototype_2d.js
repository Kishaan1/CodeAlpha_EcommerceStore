const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kisha\\.gemini\\antigravity-ide\\brain\\9e754bca-1fd0-4941-8dac-019801572311';

// Build a standalone test HTML page containing the complete 2.5D SVG Chibi Mecha-Cat Sentinel
const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Plus Jakarta Sans', 'Noto Color Emoji', sans-serif; background: #F7F6F2; }

    @keyframes sentinelFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes tailWag {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(6deg); }
    }
    @keyframes holoPulse {
      0%, 100% { opacity: 0.55; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.03); }
    }
    @keyframes sparkleDrift {
      0% { transform: translateY(0px) scale(0.8); opacity: 0.3; }
      50% { transform: translateY(-12px) scale(1.2); opacity: 0.8; }
      100% { transform: translateY(-24px) scale(0.8); opacity: 0.2; }
    }

    .sentinel-floating {
      animation: sentinelFloat 3.8s ease-in-out infinite;
    }
    .sentinel-tail-wag {
      transform-origin: 275px 320px;
      animation: tailWag 3.2s ease-in-out infinite;
    }
    .holo-glow-ring {
      transform-origin: 230px 430px;
      animation: holoPulse 2.8s ease-in-out infinite;
    }

    /* Core Arm & Head Transition Pivots */
    #sentinel-arm-left {
      transform-origin: 165px 235px;
      transition: transform 0.45s cubic-bezier(0.34, 1.4, 0.64, 1);
    }
    #sentinel-arm-right {
      transform-origin: 295px 235px;
      transition: transform 0.45s cubic-bezier(0.34, 1.4, 0.64, 1);
    }
    #sentinel-head {
      transform-origin: 230px 200px;
      transition: transform 0.45s cubic-bezier(0.34, 1.4, 0.64, 1);
    }

    /* Visor Eyes Transitions */
    #eyes-default, #eyes-cover, #eyes-surprise {
      transition: opacity 0.25s ease-in-out;
    }

    /* STATES */
    /* State A: IDLE */
    .state-idle #sentinel-arm-left { transform: rotate(0deg); }
    .state-idle #sentinel-arm-right { transform: rotate(0deg); }
    .state-idle #sentinel-head { transform: rotate(0deg); }
    .state-idle #eyes-default { opacity: 1; }
    .state-idle #eyes-cover { opacity: 0; }
    .state-idle #eyes-surprise { opacity: 0; }

    /* State B: EMAIL_FOCUS */
    .state-email-focus #sentinel-arm-left { transform: rotate(8deg); }
    .state-email-focus #sentinel-arm-right { transform: rotate(-78deg) translate(20px, -14px); }
    .state-email-focus #sentinel-head { transform: rotate(8deg) translateY(-2px); }
    .state-email-focus #eyes-default { opacity: 1; transform: translateX(3px); }
    .state-email-focus #eyes-cover { opacity: 0; }
    .state-email-focus #eyes-surprise { opacity: 0; }

    /* State C: COVER_EYES */
    .state-cover-eyes #sentinel-arm-left { transform: rotate(-114deg) translate(34px, -18px); }
    .state-cover-eyes #sentinel-arm-right { transform: rotate(114deg) translate(-34px, -18px); }
    .state-cover-eyes #sentinel-head { transform: translateY(3px); }
    .state-cover-eyes #eyes-default { opacity: 0; }
    .state-cover-eyes #eyes-cover { opacity: 1; }
    .state-cover-eyes #eyes-surprise { opacity: 0; }

    /* State D: LOOK_AWAY */
    .state-look-away #sentinel-arm-left { transform: rotate(15deg); }
    .state-look-away #sentinel-arm-right { transform: rotate(-15deg); }
    .state-look-away #sentinel-head { transform: rotate(-24deg) scaleX(-1) translateX(-42px); }
    .state-look-away #eyes-default { opacity: 0; }
    .state-look-away #eyes-cover { opacity: 0; }
    .state-look-away #eyes-surprise { opacity: 1; }
  </style>
</head>
<body class="p-8 flex items-center justify-center min-h-screen">
  <div id="sentinel-wrapper" class="state-idle w-[460px] h-[520px] relative flex items-center justify-center">

    <!-- Sparkles -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-12 left-16 text-cyan-400 text-lg animate-pulse">✦</div>
      <div class="absolute top-28 right-12 text-cyan-400 text-sm animate-pulse" style="animation-delay: 1s;">✦</div>
      <div class="absolute bottom-32 left-8 text-cyan-400 text-sm animate-pulse" style="animation-delay: 1.5s;">✦</div>
    </div>

    <!-- SVG ILLUSTRATED CHIBI MECHA-CAT SENTINEL -->
    <svg viewBox="0 0 460 480" class="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.06)]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradients -->
        <linearGradient id="whiteCeramicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="55%" stop-color="#F8FAFC" />
          <stop offset="100%" stop-color="#E2E8F0" />
        </linearGradient>

        <linearGradient id="visorGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0F172A" />
          <stop offset="35%" stop-color="#070A12" />
          <stop offset="100%" stop-color="#020408" />
        </linearGradient>

        <linearGradient id="purpleAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#4C1D95" />
        </linearGradient>

        <linearGradient id="holoConeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#00F0FF" stop-opacity="0.0" />
        </linearGradient>

        <radialGradient id="floorShadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0F172A" stop-opacity="0.18" />
          <stop offset="60%" stop-color="#0F172A" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#0F172A" stop-opacity="0.0" />
        </radialGradient>

        <!-- Glow Filters -->
        <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="pinkGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- 1. Holographic Floor Emitter & Radial Contact Shadow -->
      <g id="holographic-base">
        <!-- Upward light beam glow -->
        <polygon points="175,432 285,432 260,370 200,370" fill="url(#holoConeGrad)" />

        <!-- Soft ground shadow -->
        <ellipse cx="230" cy="434" rx="95" ry="18" fill="url(#floorShadowGrad)" />

        <!-- Concentric glowing rings -->
        <ellipse cx="230" cy="430" rx="130" ry="22" stroke="#00F0FF" stroke-width="2.5" fill="none" opacity="0.45" class="holo-glow-ring" filter="url(#cyanGlow)" />
        <ellipse cx="230" cy="430" rx="92" ry="15" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.65" />
        <ellipse cx="230" cy="430" rx="55" ry="9" stroke="#00F0FF" stroke-width="3" fill="none" opacity="0.85" filter="url(#cyanGlow)" />
      </g>

      <!-- 2. Floating Chibi Sentinel Character Assembly -->
      <g id="sentinel-character" class="sentinel-floating">

        <!-- A. Tail -->
        <g id="sentinel-tail" class="sentinel-tail-wag">
          <!-- Segmented white & purple links -->
          <path d="M 265 295 Q 315 285 325 240 Q 330 200 305 180" fill="none" stroke="url(#whiteCeramicGrad)" stroke-width="12" stroke-linecap="round" />
          <path d="M 285 280 Q 315 265 322 235" fill="none" stroke="#7C3AED" stroke-width="12" stroke-linecap="butt" />
          <!-- Glowing cyan tail tip -->
          <circle cx="304" cy="180" r="7" fill="#00F0FF" filter="url(#cyanGlow)" />
        </g>

        <!-- B. Floating Legs & Feet -->
        <g id="sentinel-legs">
          <!-- Left Leg (viewer's left) -->
          <rect x="194" y="300" width="22" height="40" rx="10" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <circle cx="205" cy="342" r="8" fill="#1E293B" stroke="#7C3AED" stroke-width="1.5" />
          <rect x="196" y="342" width="18" height="38" rx="9" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <path d="M 193 378 Q 205 372 217 378 Q 219 390 207 392 Q 191 392 193 378 Z" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <ellipse cx="205" cy="390" rx="7" ry="2" fill="#00F0FF" />

          <!-- Right Leg (viewer's right) -->
          <rect x="244" y="300" width="22" height="40" rx="10" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <circle cx="255" cy="342" r="8" fill="#1E293B" stroke="#7C3AED" stroke-width="1.5" />
          <rect x="246" y="342" width="18" height="38" rx="9" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <path d="M 243 378 Q 255 372 267 378 Q 269 390 257 392 Q 241 392 243 378 Z" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <ellipse cx="255" cy="390" rx="7" ry="2" fill="#00F0FF" />
        </g>

        <!-- C. Torso -->
        <g id="sentinel-torso">
          <!-- Dark composite under-belly -->
          <path d="M 195 295 Q 230 315 265 295 Q 255 320 230 320 Q 205 320 195 295 Z" fill="#0F172A" />
          <!-- White Ceramic Chest Shell -->
          <path d="M 175 235 Q 230 225 285 235 Q 295 275 282 305 Q 230 318 178 305 Q 165 275 175 235 Z" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="2" />
          <!-- Purple contour seam -->
          <path d="M 182 255 Q 230 248 278 255" fill="none" stroke="#818CF8" stroke-width="1.5" />
          <!-- Center Chest Cat Crest Emblem -->
          <circle cx="230" cy="275" r="16" fill="#0F172A" stroke="#7C3AED" stroke-width="1.8" />
          <circle cx="230" cy="275" r="12" fill="#1E293B" />
          <!-- Cyan Glowing Cat Face Emblem -->
          <path d="M 223 271 L 230 281 L 237 271 L 235 269 L 230 275 L 225 269 Z" fill="#00F0FF" filter="url(#cyanGlow)" />
          <circle cx="230" cy="275" r="2.5" fill="#00F0FF" />
        </g>

        <!-- D. Articulated Arms (Layered between torso and head) -->
        <!-- Left Arm Rig (viewer's left) -->
        <g id="sentinel-arm-left">
          <!-- Shoulder Pauldron -->
          <circle cx="165" cy="235" r="15" fill="url(#whiteCeramicGrad)" stroke="#7C3AED" stroke-width="1.5" />
          <!-- Upper Arm -->
          <rect x="156" y="235" width="18" height="38" rx="8" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <rect x="155" y="252" width="20" height="4" rx="2" fill="#7C3AED" />
          <!-- Elbow Joint -->
          <circle cx="165" cy="275" r="8" fill="#1E293B" />
          <!-- Forearm -->
          <rect x="157" y="275" width="16" height="36" rx="8" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <!-- Mecha Paw with Cyan Contact Pads -->
          <ellipse cx="165" cy="316" rx="15" ry="13" fill="url(#whiteCeramicGrad)" stroke="#7C3AED" stroke-width="1.5" />
          <circle cx="159" cy="320" r="2.5" fill="#00F0FF" />
          <circle cx="165" cy="323" r="2.5" fill="#00F0FF" />
          <circle cx="171" cy="320" r="2.5" fill="#00F0FF" />
        </g>

        <!-- Right Arm Rig (viewer's right) -->
        <g id="sentinel-arm-right">
          <!-- Shoulder Pauldron -->
          <circle cx="295" cy="235" r="15" fill="url(#whiteCeramicGrad)" stroke="#7C3AED" stroke-width="1.5" />
          <!-- Upper Arm -->
          <rect x="286" y="235" width="18" height="38" rx="8" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <rect x="285" y="252" width="20" height="4" rx="2" fill="#7C3AED" />
          <!-- Elbow Joint -->
          <circle cx="295" cy="275" r="8" fill="#1E293B" />
          <!-- Forearm -->
          <rect x="287" y="275" width="16" height="36" rx="8" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="1.5" />
          <!-- Mecha Hand with Pointing Index Finger -->
          <ellipse cx="295" cy="316" rx="15" ry="13" fill="url(#whiteCeramicGrad)" stroke="#7C3AED" stroke-width="1.5" />
          <rect x="296" y="322" width="6" height="15" rx="3" fill="url(#whiteCeramicGrad)" stroke="#7C3AED" stroke-width="1.2" />
          <rect x="284" y="318" width="6" height="10" rx="3" fill="url(#whiteCeramicGrad)" stroke="#7C3AED" stroke-width="1.2" transform="rotate(-30 287 323)" />
          <circle cx="295" cy="320" r="2.5" fill="#00F0FF" />
        </g>

        <!-- E. Head Rig (Sculpted Cranium, Ears, Visor & Dynamic LED Displays) -->
        <g id="sentinel-head">
          <!-- Sculpted Cat Ears -->
          <!-- Left Ear -->
          <path d="M 160 115 L 138 45 L 200 85 Z" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="2" />
          <path d="M 158 110 L 145 58 L 192 88 Z" fill="#4C1D95" />
          <path d="M 158 105 L 148 68 L 186 90 Z" fill="#00F0FF" filter="url(#cyanGlow)" />
          <!-- Right Ear -->
          <path d="M 300 115 L 322 45 L 260 85 Z" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="2" />
          <path d="M 302 110 L 315 58 L 268 88 Z" fill="#4C1D95" />
          <path d="M 302 105 L 312 68 L 274 90 Z" fill="#00F0FF" filter="url(#cyanGlow)" />

          <!-- Over-Ear Communication Hubs -->
          <ellipse cx="145" cy="148" rx="14" ry="18" fill="#0F172A" stroke="#00F0FF" stroke-width="2" />
          <ellipse cx="145" cy="148" rx="9" ry="12" fill="#7C3AED" />
          <ellipse cx="315" cy="148" rx="14" ry="18" fill="#0F172A" stroke="#00F0FF" stroke-width="2" />
          <ellipse cx="315" cy="148" rx="9" ry="12" fill="#7C3AED" />

          <!-- Large Rounded Porcelain Helmet Cranium -->
          <path d="M 148 145 C 148 80, 312 80, 312 145 C 312 205, 148 205, 148 145 Z" fill="url(#whiteCeramicGrad)" stroke="#6366F1" stroke-width="2.5" />
          <!-- Purple Trim Groove -->
          <path d="M 156 142 C 156 90, 304 90, 304 142" fill="none" stroke="#7C3AED" stroke-width="2" />

          <!-- Glossy Indigo/Black Curved Visor Face -->
          <path d="M 160 135 C 160 118, 300 118, 300 135 C 300 172, 160 172, 160 135 Z" fill="url(#visorGlassGrad)" stroke="#1E293B" stroke-width="2" />
          <!-- Specular Upper Rim Highlight Arc -->
          <path d="M 168 132 C 185 125, 275 125, 292 132" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2.5" stroke-linecap="round" />
          <!-- Cyan Lower Visor Glow -->
          <path d="M 163 148 C 163 168, 297 168, 297 148" fill="none" stroke="#00F0FF" stroke-width="1" opacity="0.35" />

          <!-- DYNAMIC DIGITAL VISOR DISPLAYS -->

          <!-- 1. Default Eyes (State A: Idle & State B: Email Focus) -->
          <g id="eyes-default">
            <!-- Left Eye Pill -->
            <rect x="185" y="137" width="24" height="18" rx="9" fill="#00F0FF" filter="url(#cyanGlow)" />
            <!-- Right Eye Pill -->
            <rect x="251" y="137" width="24" height="18" rx="9" fill="#00F0FF" filter="url(#cyanGlow)" />
            <!-- Cat Chevron Mouth -->
            <path d="M 226 150 Q 230 154 234 150" fill="none" stroke="#00F0FF" stroke-width="2.5" stroke-linecap="round" filter="url(#cyanGlow)" />
          </g>

          <!-- 2. Cover Eyes (State C: Password Focused & Keystroke Locked) -->
          <g id="eyes-cover">
            <!-- Left Eye Arc (^) -->
            <path d="M 184 148 Q 196 136 208 148" fill="none" stroke="#00F0FF" stroke-width="3.5" stroke-linecap="round" filter="url(#cyanGlow)" />
            <!-- Right Eye Arc (^) -->
            <path d="M 252 148 Q 264 136 276 148" fill="none" stroke="#00F0FF" stroke-width="3.5" stroke-linecap="round" filter="url(#cyanGlow)" />
            <!-- Pink Cheek Blush Dashes -->
            <g id="sentinel-blush">
              <path d="M 180 156 L 183 164 M 186 156 L 189 164 M 192 156 L 195 164" stroke="#FF66B2" stroke-width="2.5" stroke-linecap="round" filter="url(#pinkGlow)" />
              <path d="M 265 156 L 268 164 M 271 156 L 274 164 M 277 156 L 280 164" stroke="#FF66B2" stroke-width="2.5" stroke-linecap="round" filter="url(#pinkGlow)" />
            </g>
            <!-- Shy Cat Mouth (w) -->
            <path d="M 223 153 Q 226.5 157 230 153 Q 233.5 157 237 153" fill="none" stroke="#00F0FF" stroke-width="2.2" stroke-linecap="round" filter="url(#cyanGlow)" />
          </g>

          <!-- 3. Surprise Eyes (State D: Password Revealed / Look Away) -->
          <g id="eyes-surprise">
            <!-- Left Eye Shocked Ring -->
            <circle cx="197" cy="146" r="11" fill="none" stroke="#00F0FF" stroke-width="3.5" filter="url(#cyanGlow)" />
            <!-- Right Eye Shocked Ring -->
            <circle cx="263" cy="146" r="11" fill="none" stroke="#00F0FF" stroke-width="3.5" filter="url(#cyanGlow)" />
            <!-- Shocked Mouth (o) -->
            <circle cx="230" cy="154" r="3.5" fill="#00F0FF" filter="url(#cyanGlow)" />
          </g>

        </g>

      </g>
    </svg>

  </div>
</body>
</html>
`;

const testFile = path.join(__dirname, 'test_2d_sentinel.html');
fs.writeFileSync(testFile, testHtml);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 700 });
  await page.goto('file:///' + testFile.replace(/\\/g, '/'));
  await new Promise(r => setTimeout(r, 600));

  const states = ['state-idle', 'state-email-focus', 'state-cover-eyes', 'state-look-away'];
  for (const st of states) {
    await page.evaluate((s) => {
      const el = document.getElementById('sentinel-wrapper');
      el.className = s + ' w-[460px] h-[520px] relative flex items-center justify-center';
    }, st);
    await new Promise(r => setTimeout(r, 600));
    const shotPath = path.join(ARTIFACT_DIR, `test_2d_${st}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`Saved ${shotPath}`);
  }

  await browser.close();
})();
