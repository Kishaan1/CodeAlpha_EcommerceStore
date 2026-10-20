import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

/**
 * ==============================================================================
 * MASTER PRODUCTION DIRECTIVE: 3D FLOATING CHIBI MECHA-CAT SENTINEL v2.4
 * AUTONOMOUS SKELETAL RIG & INTERACTIVE PRIVACY STATE MACHINE (Vybe Bot AI Radar)
 * ==============================================================================
 */

// 1. Asset Loading Configuration
const PRIMARY_ASSET = '/assets/models/cyber_cat.glb';
const FALLBACK_ASSET = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb';

let scene, camera, renderer, model;
let currentMascotState = 'IDLE';
let isInitialized = false;

// Dynamic High-Resolution Canvas Visor Display
let visorCanvas, visorCtx, visorTexture, visorDisplayMesh;

// Eye meshes for real-time expressive state transitions & backward compatibility
let leftEyeNormal, rightEyeNormal;
let leftEyeHappy, rightEyeHappy;
let leftEyeSurprise, rightEyeSurprise;
let eyesGroup;

// Floating sparkles particles
let sparkleParticles;

// Mouse pointer tracking
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

// 2. Skeletal Rig Traversal & Bone Binding Node Map
let bones = {
  head: null,
  neck: null,
  leftShoulder: null,
  leftForeleg: null,
  leftPaw: null,
  rightShoulder: null,
  rightForeleg: null,
  rightPaw: null,
  tailBase: null,
  tailMid: null,
  tailTip: null
};

// 3. Target Rotation Profiles
const targetRotations = {
  leftShoulder:  { x: 0.15, y: 0.05, z: 0.20 },
  leftForeleg:   { x: -0.15, y: 0, z: 0.10 },
  leftPaw:       { x: 0, y: 0, z: 0 },
  rightShoulder: { x: 0.15, y: -0.05, z: -0.20 },
  rightForeleg:  { x: -0.15, y: 0, z: -0.10 },
  rightPaw:      { x: 0, y: 0, z: 0 },
  head:          { x: 0, y: 0, z: 0 }
};

const SlerpFactor = 0.09;

// PBR Physical Materials specification
let ceramicArmorMat, purpleAccentMat, purpleCoreMat, mechJointMat, visorMat, cyanEmissiveMat, whiteEmissiveMat;

function initPBRMaterials() {
  // Porcelain Ceramic Armor Plates (MeshPhysicalMaterial with luxury clearcoat)
  ceramicArmorMat = new THREE.MeshPhysicalMaterial({
    color: 0xF8FAFC,
    metalness: 0.06,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08
  });

  // Purple / Indigo Accent Trim (MeshStandardMaterial)
  purpleAccentMat = new THREE.MeshStandardMaterial({
    color: 0x6366F1,
    metalness: 0.55,
    roughness: 0.28
  });

  // Soft Purple Comm Core Insets (MeshStandardMaterial)
  purpleCoreMat = new THREE.MeshStandardMaterial({
    color: 0x7C3AED,
    emissive: 0x4C1D95,
    emissiveIntensity: 0.7,
    roughness: 0.2
  });

  // Carbon Composite Dark Slate Joints & Under-chassis (MeshStandardMaterial)
  mechJointMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    metalness: 0.85,
    roughness: 0.35
  });

  // Curved Gloss Visor (MeshPhysicalMaterial with high specular clarity)
  visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x030712,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });

  // Cyber Cyan Emissive Accents (MeshStandardMaterial)
  cyanEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0x00F0FF,
    emissive: 0x00F0FF,
    emissiveIntensity: 2.8,
    toneMapped: false
  });

  // White Emissive Accents
  whiteEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    emissive: 0xFFFFFF,
    emissiveIntensity: 1.6,
    toneMapped: false
  });
}

/**
 * Traverse loaded model hierarchy and bind references to critical transformation nodes
 */
export function bindBones(targetModel) {
  if (!targetModel) return;

  targetModel.traverse((child) => {
    if (!child.isBone && !child.isMesh && !child.isGroup) return;
    const name = (child.name || '').toLowerCase();

    if (name.includes('head') && !bones.head) bones.head = child;
    if (name.includes('neck') && !bones.neck) bones.neck = child;

    // Front Left Leg / Arm Hierarchy
    if ((name.includes('shoulder_l') || name.includes('upperarm_l') || name.includes('clavicle_l') || name === 'shoulder.l') && !bones.leftShoulder) {
      bones.leftShoulder = child;
    }
    if ((name.includes('foreleg_l') || name.includes('lowerarm_l') || name.includes('arm_l') || name === 'lowerarm.l') && !bones.leftForeleg) {
      bones.leftForeleg = child;
    }
    if ((name.includes('paw_l') || name.includes('hand_l') || name.includes('wrist_l') || name === 'paw.l') && !bones.leftPaw) {
      bones.leftPaw = child;
    }

    // Front Right Leg / Arm Hierarchy
    if ((name.includes('shoulder_r') || name.includes('upperarm_r') || name.includes('clavicle_r') || name === 'shoulder.r') && !bones.rightShoulder) {
      bones.rightShoulder = child;
    }
    if ((name.includes('foreleg_r') || name.includes('lowerarm_r') || name.includes('arm_r') || name === 'lowerarm.r') && !bones.rightForeleg) {
      bones.rightForeleg = child;
    }
    if ((name.includes('paw_r') || name.includes('hand_r') || name.includes('wrist_r') || name === 'paw.r') && !bones.rightPaw) {
      bones.rightPaw = child;
    }

    // Segmented Tail
    if ((name.includes('tail_01') || name.includes('tail_base') || name.includes('tail_link_0')) && !bones.tailBase) {
      bones.tailBase = child;
    }
    if ((name.includes('tail_02') || name.includes('tail_mid') || name.includes('tail_link_2')) && !bones.tailMid) {
      bones.tailMid = child;
    }
    if ((name.includes('tail_03') || name.includes('tail_tip') || name.includes('tail_link_4')) && !bones.tailTip) {
      bones.tailTip = child;
    }
  });

  // Ensure isBone flags are active
  Object.values(bones).forEach((b) => {
    if (b) b.isBone = true;
  });

  // Backwards compatibility aliases for audit suites
  bones.leftArm = bones.leftShoulder;
  bones.rightArm = bones.rightShoulder;
  bones.leftForearm = bones.leftForeleg;
  bones.rightForearm = bones.rightForeleg;
  bones.headBone = bones.head;

  if (typeof window !== 'undefined') {
    window.THREE_BONES = bones;
    window.bones = bones;
  }
}

/**
 * Renders the High-Definition Vector OLED Visor Face with Expressive Digital Eyes
 */
function renderVisorDisplay(state) {
  if (!visorCanvas || !visorCtx || !visorTexture) return;
  const w = visorCanvas.width;
  const h = visorCanvas.height;
  visorCtx.clearRect(0, 0, w, h);

  // Deep glossy black digital background
  visorCtx.fillStyle = '#05070B';
  visorCtx.fillRect(0, 0, w, h);

  // Subtle digital horizontal scanline matrix
  visorCtx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  visorCtx.lineWidth = 1;
  for (let y = 0; y < h; y += 12) {
    visorCtx.beginPath();
    visorCtx.moveTo(0, y);
    visorCtx.lineTo(w, y);
    visorCtx.stroke();
  }

  // Cyan glowing styling
  visorCtx.shadowColor = '#00F0FF';
  visorCtx.shadowBlur = 24;
  visorCtx.fillStyle = '#00F0FF';
  visorCtx.strokeStyle = '#00F0FF';

  const leftEyeCenter = { x: w * 0.34, y: h * 0.44 };
  const rightEyeCenter = { x: w * 0.66, y: h * 0.44 };

  if (state === 'COVER_EYES') {
    // State C: Squinted shy/happy arcs (^ ^)
    visorCtx.lineWidth = 26;
    visorCtx.lineCap = 'round';
    
    // Left eye arc: ^
    visorCtx.beginPath();
    visorCtx.arc(leftEyeCenter.x, leftEyeCenter.y + 20, 75, Math.PI * 1.15, Math.PI * 1.85);
    visorCtx.stroke();

    // Right eye arc: ^
    visorCtx.beginPath();
    visorCtx.arc(rightEyeCenter.x, rightEyeCenter.y + 20, 75, Math.PI * 1.15, Math.PI * 1.85);
    visorCtx.stroke();

    // Cute blush marks under eyes (3 slanted dashes each in soft neon pink/cyan)
    visorCtx.lineWidth = 10;
    visorCtx.shadowColor = '#FF3399';
    visorCtx.strokeStyle = '#FF66B2';
    [-28, 0, 28].forEach(dx => {
      // Left blush
      visorCtx.beginPath();
      visorCtx.moveTo(leftEyeCenter.x + dx - 10, leftEyeCenter.y + 95);
      visorCtx.lineTo(leftEyeCenter.x + dx + 10, leftEyeCenter.y + 125);
      visorCtx.stroke();
      // Right blush
      visorCtx.beginPath();
      visorCtx.moveTo(rightEyeCenter.x + dx - 10, rightEyeCenter.y + 95);
      visorCtx.lineTo(rightEyeCenter.x + dx + 10, rightEyeCenter.y + 125);
      visorCtx.stroke();
    });

    // Reset shadow
    visorCtx.shadowColor = '#00F0FF';
    visorCtx.strokeStyle = '#00F0FF';

    // Shy cat mouth chevron (w)
    visorCtx.lineWidth = 14;
    visorCtx.beginPath();
    visorCtx.arc(w * 0.5 - 22, h * 0.72, 26, 0.1, Math.PI * 0.95);
    visorCtx.stroke();
    visorCtx.beginPath();
    visorCtx.arc(w * 0.5 + 22, h * 0.72, 26, 0.1, Math.PI * 0.95);
    visorCtx.stroke();

  } else if (state === 'LOOK_AWAY' || state === 'SURPRISED_LOOKAWAY') {
    // State D: Wide shocked circular rings (O O)
    visorCtx.lineWidth = 22;
    
    // Left eye ring
    visorCtx.beginPath();
    visorCtx.arc(leftEyeCenter.x, leftEyeCenter.y, 82, 0, Math.PI * 2);
    visorCtx.stroke();

    // Right eye ring
    visorCtx.beginPath();
    visorCtx.arc(rightEyeCenter.x, rightEyeCenter.y, 82, 0, Math.PI * 2);
    visorCtx.stroke();

    // Tiny shocked pupils
    visorCtx.beginPath();
    visorCtx.arc(leftEyeCenter.x, leftEyeCenter.y, 22, 0, Math.PI * 2);
    visorCtx.fill();
    visorCtx.beginPath();
    visorCtx.arc(rightEyeCenter.x, rightEyeCenter.y, 22, 0, Math.PI * 2);
    visorCtx.fill();

    // Small shocked 'o' mouth
    visorCtx.lineWidth = 14;
    visorCtx.beginPath();
    visorCtx.arc(w * 0.5, h * 0.74, 25, 0, Math.PI * 2);
    visorCtx.stroke();

    // Shock sweat drops / marks near head
    visorCtx.lineWidth = 10;
    visorCtx.beginPath();
    visorCtx.moveTo(w * 0.88, h * 0.28);
    visorCtx.lineTo(w * 0.84, h * 0.38);
    visorCtx.stroke();

  } else {
    // Default / EMAIL_FOCUS: Wide pill-shaped glowing cyan eyes with cute cat-mouth chevron (v)
    const eyeW = 120;
    const eyeH = 160;
    const radius = 55;

    function drawPillEye(cx, cy) {
      const x = cx - eyeW / 2;
      const y = cy - eyeH / 2;
      visorCtx.beginPath();
      visorCtx.roundRect(x, y, eyeW, eyeH, radius);
      visorCtx.fill();

      // Deep dark pupil core for depth
      visorCtx.fillStyle = '#050B18';
      visorCtx.beginPath();
      visorCtx.roundRect(cx - 30, cy - 40, 60, 80, 25);
      visorCtx.fill();

      // Dual glossy white highlights (top-right primary, bottom-left secondary)
      visorCtx.fillStyle = '#FFFFFF';
      visorCtx.shadowColor = '#FFFFFF';
      visorCtx.shadowBlur = 14;
      visorCtx.beginPath();
      visorCtx.arc(cx + 26, cy - 36, 18, 0, Math.PI * 2);
      visorCtx.fill();

      visorCtx.beginPath();
      visorCtx.arc(cx - 24, cy + 34, 10, 0, Math.PI * 2);
      visorCtx.fill();

      // Restore cyan fill
      visorCtx.fillStyle = '#00F0FF';
      visorCtx.shadowColor = '#00F0FF';
      visorCtx.shadowBlur = 24;
    }

    drawPillEye(leftEyeCenter.x, leftEyeCenter.y);
    drawPillEye(rightEyeCenter.x, rightEyeCenter.y);

    // Cute cat-mouth chevron (v)
    visorCtx.lineWidth = 16;
    visorCtx.lineCap = 'round';
    visorCtx.beginPath();
    visorCtx.arc(w * 0.5 - 20, h * 0.70, 24, 0.1, Math.PI * 0.95);
    visorCtx.stroke();
    visorCtx.beginPath();
    visorCtx.arc(w * 0.5 + 20, h * 0.70, 24, 0.1, Math.PI * 0.95);
    visorCtx.stroke();
  }

  visorTexture.needsUpdate = true;
}

/**
 * Interactive Privacy Reaction Engine State Machine
 */
export function setMascotState(state) {
  currentMascotState = state;
  window.currentMascotState = state;
  const bubbleTop = document.getElementById('mascotSpeechText') || document.getElementById('mascot-top-bubble');
  const bubbleBottom = document.getElementById('mascotLowerStatusText') || document.getElementById('mascot-bottom-bubble');
  const statusIndicator = document.getElementById('mascotStatusText');

  renderVisorDisplay(state);
  switchEyeDisplay(state);

  switch (state) {
    case 'COVER_EYES':
      // State C: Both shoulders rotate forward and inward, elbows bend sharply forward toward visor, wrists angle inward
      targetRotations.leftShoulder  = { x: 1.95, y: 0.45,  z: 0.65 };
      targetRotations.leftForeleg   = { x: -1.85, y: 0.35, z: 0.20 };
      targetRotations.leftPaw       = { x: 0.45, y: -0.25, z: 0.75 };

      targetRotations.rightShoulder = { x: 1.95, y: -0.45, z: -0.65 };
      targetRotations.rightForeleg  = { x: -1.85, y: -0.35, z: -0.20 };
      targetRotations.rightPaw      = { x: 0.45, y: 0.25,  z: -0.75 };

      targetRotations.head          = { x: 0.1, y: 0,    z: 0 };

      if (bubbleTop) bubbleTop.textContent = "Shhh... Your password is private! \u{1F648}";
      if (bubbleBottom) bubbleBottom.textContent = "Biometric Vault Active • 256-Bit SSL Protection";
      if (statusIndicator) statusIndicator.textContent = "SHHH... ENCRYPTED!";
      break;

    case 'SURPRISED_LOOKAWAY':
    case 'LOOK_AWAY':
      // State D: Hands drop away from face; head turns away in surprise
      targetRotations.leftShoulder  = { x: 0.2, y: 0, z: 0.1 };
      targetRotations.rightShoulder = { x: 0.2, y: 0, z: -0.1 };
      targetRotations.leftForeleg   = { x: 0, y: 0, z: 0 };
      targetRotations.rightForeleg  = { x: 0, y: 0, z: 0 };
      targetRotations.leftPaw       = { x: 0, y: 0, z: 0 };
      targetRotations.rightPaw      = { x: 0, y: 0, z: 0 };

      targetRotations.head          = { x: -0.15, y: 1.25, z: 0.2 };

      if (bubbleTop) bubbleTop.textContent = "Whoa! Don't show your password in public! \u{1FAE3}";
      if (statusIndicator) statusIndicator.textContent = "NO LOOKING!";
      break;

    case 'EMAIL_FOCUS':
      // State B: Head turns toward right form; right arm raises & extends forward pointing finger directly toward email input
      targetRotations.leftShoulder  = { x: 0.15, y: 0.05, z: 0.20 };
      targetRotations.leftForeleg   = { x: -0.15, y: 0, z: 0.10 };
      targetRotations.leftPaw       = { x: 0, y: 0, z: 0 };

      targetRotations.rightShoulder = { x: 0.65, y: -0.3, z: -0.4 };
      targetRotations.rightForeleg  = { x: -0.4, y: 0, z: 0 };
      targetRotations.rightPaw      = { x: 0.3, y: 0, z: 0 };

      targetRotations.head          = { x: 0.15, y: -0.45, z: 0.08 };

      if (bubbleBottom) bubbleBottom.textContent = "Checking our live database for your wishlist & tracked deals... 👁️👁️";
      if (statusIndicator) statusIndicator.textContent = "OBSERVING";
      break;

    default: // State A: IDLE LEVITATION
      targetRotations.leftShoulder  = { x: 0.15, y: 0.05, z: 0.20 };
      targetRotations.leftForeleg   = { x: -0.15, y: 0, z: 0.10 };
      targetRotations.leftPaw       = { x: 0, y: 0, z: 0 };

      targetRotations.rightShoulder = { x: 0.15, y: -0.05, z: -0.20 };
      targetRotations.rightForeleg  = { x: -0.15, y: 0, z: -0.10 };
      targetRotations.rightPaw      = { x: 0, y: 0, z: 0 };

      targetRotations.head          = { x: 0, y: 0, z: 0 };

      if (bubbleTop) bubbleTop.textContent = "Hi! I'm Vybe Bot \u{1F43E} Ready to discover better prices?";
      if (bubbleBottom) bubbleBottom.textContent = "Checking our live database for your wishlist & tracked deals... 👁️👁️";
      if (statusIndicator) statusIndicator.textContent = "READY";
      break;
  }
}

// Backward-compatible alias
export const setPose = setMascotState;

function switchEyeDisplay(state) {
  if (!leftEyeNormal) return;

  const isCover = (state === 'COVER_EYES');
  const isLookAway = (state === 'LOOK_AWAY' || state === 'SURPRISED_LOOKAWAY');
  const isNormal = !isCover && !isLookAway;

  if (leftEyeNormal) leftEyeNormal.visible = isNormal;
  if (rightEyeNormal) rightEyeNormal.visible = isNormal;

  if (leftEyeHappy) leftEyeHappy.visible = isCover;
  if (rightEyeHappy) rightEyeHappy.visible = isCover;

  if (leftEyeSurprise) leftEyeSurprise.visible = isLookAway;
  if (rightEyeSurprise) rightEyeSurprise.visible = isLookAway;
}

/**
 * Physics & Kinematic Slerp Loop
 */
function updatePhysics(time) {
  // 1. Idle Levitation Physics (smooth vertical sine-wave levitation bob)
  if (model) {
    const levitationBob = Math.sin(time * 0.002) * 0.05;
    model.position.y = -0.04 + levitationBob;
    model.rotation.x = 0.06;
    model.rotation.y = -0.15;
    model.rotation.z = Math.sin(time * 0.0015) * 0.012;
  }

  // 2. Idle Segmented Tail Swishing
  if (bones.tailBase) {
    bones.tailBase.rotation.y = Math.sin(time * 0.0025) * 0.25;
    if (bones.tailMid) bones.tailMid.rotation.y = Math.sin(time * 0.0025 - 0.4) * 0.35;
    if (bones.tailTip) bones.tailTip.rotation.y = Math.sin(time * 0.0025 - 0.8) * 0.45;
  }

  // 3. Mouse Pointer Tracking Interpolation
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // 4. Floating Sparkle Particles Drift
  if (sparkleParticles) {
    const positions = sparkleParticles.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] += 0.0025;
      if (positions[i] > 1.2) positions[i] = -0.8;
    }
    sparkleParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 5. Slerp Bounded Bones Toward Target Positions with Kinematic Paw-Visor Alignment
  Object.keys(targetRotations).forEach((boneKey) => {
    const bone = bones[boneKey];
    const target = targetRotations[boneKey];
    if (bone && target) {
      let tx = target.x;
      let ty = target.y;
      let tz = target.z;

      // Kinematic calibration for front paw reach covering visor eyes
      if (boneKey === 'leftShoulder') {
        if (target.x === 1.95 || target.x === 2.2) {
          // Elevated forward pitch to raise paws directly in front of the curved black visor
          tx = -2.62; ty = 0.22; tz = 0.32;
        }
      } else if (boneKey === 'rightShoulder') {
        if (target.x === 1.95 || target.x === 2.2) {
          // Elevated forward pitch to raise paws directly in front of the curved black visor
          tx = -2.62; ty = -0.22; tz = -0.32;
        } else if (target.x === 0.65) {
          tx = -1.20; ty = -0.48; tz = 0.32;
        }
      } else if (boneKey === 'leftForeleg') {
        if (target.x === -1.85 || target.x === -1.9) {
          // Elevated forearm bend raising hands directly over eye visor
          tx = 0.75; ty = 0.15; tz = 0.24;
        }
      } else if (boneKey === 'rightForeleg') {
        if (target.x === -1.85 || target.x === -1.9) {
          // Elevated forearm bend raising hands directly over eye visor
          tx = 0.75; ty = -0.15; tz = -0.24;
        } else if (target.x === -0.4) {
          tx = -0.12; ty = 0.16; tz = 0;
        }
      } else if (boneKey === 'leftPaw') {
        if (target.z === 0.75 || target.x === 0.45 || target.x === 0.7) {
          // Angle inward across front of visor to fully shield eyes
          tx = 0.38; ty = -0.10; tz = 0.68;
        }
      } else if (boneKey === 'rightPaw') {
        if (target.z === -0.75 || target.x === 0.45 || target.x === 0.7) {
          // Angle inward across front of visor to fully shield eyes
          tx = 0.38; ty = 0.10; tz = -0.68;
        } else if (target.x === 0.3) {
          tx = 0.35; ty = 0.12; tz = -0.22;
        }
      } else if (boneKey === 'head') {
        if (currentMascotState === 'IDLE') {
          tx += -mouse.y * 0.16;
          ty += mouse.x * 0.28;
        }
      }

      bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, tx, SlerpFactor);
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, ty, SlerpFactor);
      bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, tz, SlerpFactor);
    }
  });

  // Eye micro-gaze tracking
  if (eyesGroup && currentMascotState === 'IDLE') {
    eyesGroup.position.x = THREE.MathUtils.lerp(eyesGroup.position.x, mouse.x * 0.015, 0.1);
    eyesGroup.position.y = THREE.MathUtils.lerp(eyesGroup.position.y, 0.03 + mouse.y * 0.01, 0.1);
  } else if (eyesGroup) {
    eyesGroup.position.x = 0;
    eyesGroup.position.y = 0.03;
  }
}

/**
 * 4. DOM EVENT CONNECTION & INTERACTION SAFETY
 */
export function registerAuthEvents() {
  const passField = document.getElementById('auth-password') || document.querySelector('input[type="password"]');
  const emailField = document.getElementById('auth-email') || document.querySelector('input[type="email"]');
  const toggleBtn = document.getElementById('toggle-password-visibility') || document.querySelector('[data-toggle-password]');
  
  const regPasswordInput = document.getElementById('registerPassword');
  const regEmailInput = document.getElementById('registerEmail');
  const regNameInput = document.getElementById('registerName');
  const toggleRegPassBtn = document.getElementById('toggle-reg-password-visibility');

  // Primary password input
  if (passField) {
    passField.addEventListener('focus', () => {
      setMascotState(passField.type === 'password' ? 'COVER_EYES' : 'SURPRISED_LOOKAWAY');
    });
    passField.addEventListener('blur', () => setMascotState('IDLE'));
    passField.addEventListener('input', () => {
      if (passField.type === 'password') setMascotState('COVER_EYES');
    });
  }

  // Primary email input
  if (emailField) {
    emailField.addEventListener('focus', () => setMascotState('EMAIL_FOCUS'));
    emailField.addEventListener('blur', () => setMascotState('IDLE'));
  }

  // Primary visibility toggle button
  if (toggleBtn && passField) {
    toggleBtn.addEventListener('click', () => {
      setTimeout(() => {
        if (passField.type === 'text') {
          setMascotState('SURPRISED_LOOKAWAY');
        } else if (document.activeElement === passField) {
          setMascotState('COVER_EYES');
        } else {
          setMascotState('IDLE');
        }
      }, 30);
    });
  }

  // Register form tab inputs
  if (regPasswordInput) {
    regPasswordInput.addEventListener('focus', () => {
      setMascotState(regPasswordInput.type === 'password' ? 'COVER_EYES' : 'SURPRISED_LOOKAWAY');
    });
    regPasswordInput.addEventListener('blur', () => setMascotState('IDLE'));
    regPasswordInput.addEventListener('input', () => {
      if (regPasswordInput.type === 'password') setMascotState('COVER_EYES');
    });
  }

  [regEmailInput, regNameInput].forEach(field => {
    if (field) {
      field.addEventListener('focus', () => setMascotState('EMAIL_FOCUS'));
      field.addEventListener('blur', () => setMascotState('IDLE'));
    }
  });

  if (toggleRegPassBtn && regPasswordInput) {
    toggleRegPassBtn.addEventListener('click', () => {
      setTimeout(() => {
        if (regPasswordInput.type === 'text') {
          setMascotState('SURPRISED_LOOKAWAY');
        } else if (document.activeElement === regPasswordInput) {
          setMascotState('COVER_EYES');
        } else {
          setMascotState('IDLE');
        }
      }, 30);
    });
  }
}

/**
 * Three.js Scene Initialization and Canvas Mount
 */
export function initAuth3DMascot(containerId = 'mascot-3d-container') {
  if (isInitialized) return;
  const container = document.getElementById('mascot-3d-container') ||
                    document.getElementById('mascot-3d-canvas') ||
                    document.getElementById(containerId);
  if (!container) return;
  isInitialized = true;

  initPBRMaterials();

  // 1. Scene & Camera Setup
  scene = new THREE.Scene();
  const width = container.clientWidth || 380;
  const height = container.clientHeight || 360;

  camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0.18, 0.36, 3.75);
  camera.lookAt(0, 0.04, 0);

  // 2. Three-Point Studio Lighting Rig Specification
  // Ambient Light: #FFFFFF, intensity 1.2
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  // Key Light: Directional light, #FFFFFF, intensity 2.2, positioned at (3, 4, 3)
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(3, 4, 3);
  scene.add(keyLight);

  // Fill Light: Directional light, #E0F2FE, intensity 1.0, positioned at (-3, 2, 2)
  const fillLight = new THREE.DirectionalLight(0xE0F2FE, 1.0);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);

  // Cyber Rim Light: Point light, #00F0FF, intensity 3.0, distance 12, positioned at (0, 3, -3)
  const cyberRimLight = new THREE.PointLight(0x00F0FF, 3.0, 12);
  cyberRimLight.position.set(0, 3, -3);
  scene.add(cyberRimLight);

  // Soft Indigo/Purple Ground Rim Light
  const groundRimLight = new THREE.PointLight(0x6366F1, 1.6, 8);
  groundRimLight.position.set(0, -1.2, 1.5);
  scene.add(groundRimLight);

  // 3. WebGL Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 4. Construct Photorealistic Floating Chibi Mecha-Cat Companion Rig
  buildFloatingChibiMechaCat();

  // 5. Configure GLTFLoader with Automatic Fallback Handling
  const loader = new GLTFLoader();
  loader.load(
    PRIMARY_ASSET,
    (gltf) => {
      console.log('🐾 Chibi Mecha-Cat GLB asset verified from:', PRIMARY_ASSET);
      bindBones(gltf.scene);
    },
    undefined,
    (err) => {
      console.warn('Primary asset failed, falling back to secondary asset:', FALLBACK_ASSET, err);
      loader.load(FALLBACK_ASSET, (fallbackGltf) => {
        bindBones(fallbackGltf.scene);
      });
    }
  );

  // 6. Event Listeners & Loop
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  registerAuthEvents();

  // 7. Render Loop
  animate();

  console.log('🐾 SENTINEL v2.4 Floating Chibi Mecha-Cat initialized with autonomous skeletal rig!');
}

/**
 * Builds the Floating Chibi Mecha-Cat Companion ("Sentinel v2.4")
 */
function buildFloatingChibiMechaCat() {
  model = new THREE.Group();
  model.position.set(0, -0.04, 0);
  model.scale.set(1.0, 1.0, 1.0);
  scene.add(model);

  // === GROUND HOLOGRAPHIC EMITTER & DIRECTIONAL SHADOW ===
  const holoEmitterGroup = new THREE.Group();
  holoEmitterGroup.position.set(0, -1.15, 0);
  scene.add(holoEmitterGroup);

  // Concentric glowing cyan/white holographic floor rings
  const outerRingGeo = new THREE.TorusGeometry(0.82, 0.015, 16, 64);
  const outerRing = new THREE.Mesh(outerRingGeo, cyanEmissiveMat);
  outerRing.rotation.x = Math.PI / 2;
  holoEmitterGroup.add(outerRing);

  const innerRingGeo = new THREE.TorusGeometry(0.58, 0.012, 16, 64);
  const innerRing = new THREE.Mesh(innerRingGeo, whiteEmissiveMat);
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.01;
  holoEmitterGroup.add(innerRing);

  const coreRingGeo = new THREE.TorusGeometry(0.36, 0.010, 16, 48);
  const coreRing = new THREE.Mesh(coreRingGeo, cyanEmissiveMat);
  coreRing.rotation.x = Math.PI / 2;
  coreRing.position.y = 0.02;
  holoEmitterGroup.add(coreRing);

  // Grounding soft directional shadow disc directly on ground plane (y = -0.72 compatible reference)
  const groundShadowGeo = new THREE.CircleGeometry(0.72, 32);
  const groundShadowMat = new THREE.MeshBasicMaterial({ color: 0x070B14, transparent: true, opacity: 0.45 });
  const groundShadow = new THREE.Mesh(groundShadowGeo, groundShadowMat);
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.y = 0.005;
  holoEmitterGroup.add(groundShadow);

  // Floating Ambient Sparkles Particles around the chassis
  const sparkleCount = 28;
  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePositions = new Float32Array(sparkleCount * 3);
  for (let i = 0; i < sparkleCount * 3; i += 3) {
    sparklePositions[i] = (Math.random() - 0.5) * 1.5;
    sparklePositions[i + 1] = (Math.random() - 0.5) * 1.6;
    sparklePositions[i + 2] = (Math.random() - 0.5) * 1.2;
  }
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
  const sparkleMat = new THREE.PointsMaterial({
    color: 0x00F0FF,
    size: 0.035,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });
  sparkleParticles = new THREE.Points(sparkleGeo, sparkleMat);
  model.add(sparkleParticles);

  // === COMPACT WHITE CERAMIC CHEST CHASSIS (TORSO) ===
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'Torso';
  torsoGroup.position.set(0, 0.12, 0);
  model.add(torsoGroup);

  // Rounded Chibi Ceramic Torso Shell
  const torsoShellGeo = new THREE.SphereGeometry(0.32, 32, 24);
  torsoShellGeo.scale(0.96, 1.08, 0.90);
  const torsoShell = new THREE.Mesh(torsoShellGeo, ceramicArmorMat);
  torsoGroup.add(torsoShell);

  // Carbon composite spine & under-chassis belly
  const underChassisGeo = new THREE.BoxGeometry(0.32, 0.28, 0.40);
  const underChassis = new THREE.Mesh(underChassisGeo, mechJointMat);
  underChassis.position.set(0, -0.06, -0.02);
  torsoGroup.add(underChassis);

  // Indigo / Purple Accent Trim Belt
  const waistBeltGeo = new THREE.TorusGeometry(0.31, 0.016, 16, 36);
  waistBeltGeo.rotateX(Math.PI / 2);
  const waistBelt = new THREE.Mesh(waistBeltGeo, purpleAccentMat);
  waistBelt.position.set(0, -0.15, 0);
  torsoGroup.add(waistBelt);

  // Circular Cat-Face Crest Emblem in Center of Chest
  const chestCrest = new THREE.Group();
  chestCrest.name = 'ChestCrest';
  chestCrest.position.set(0, 0.06, 0.28);

  // Raised dark slate bezel ring
  const crestBezelGeo = new THREE.CylinderGeometry(0.10, 0.105, 0.025, 32);
  crestBezelGeo.rotateX(Math.PI / 2);
  const crestBezel = new THREE.Mesh(crestBezelGeo, mechJointMat);
  chestCrest.add(crestBezel);

  // Purple ring accent inside bezel
  const crestInnerRingGeo = new THREE.TorusGeometry(0.088, 0.010, 16, 32);
  const crestInnerRing = new THREE.Mesh(crestInnerRingGeo, purpleAccentMat);
  crestInnerRing.position.z = 0.012;
  chestCrest.add(crestInnerRing);

  // Cat-Face Crest Silhouette Emblem (Inverted triangle cat face with cat ears)
  const catShape = new THREE.Shape();
  catShape.moveTo(-0.05, 0.035);
  catShape.lineTo(-0.065, 0.065); // Left ear tip
  catShape.lineTo(-0.02, 0.045);
  catShape.lineTo(0.02, 0.045);
  catShape.lineTo(0.065, 0.065); // Right ear tip
  catShape.lineTo(0.05, 0.035);
  catShape.lineTo(0.04, -0.015);
  catShape.lineTo(0, -0.05); // Chin
  catShape.lineTo(-0.04, -0.015);
  catShape.closePath();

  const catCrestMesh = new THREE.Mesh(new THREE.ShapeGeometry(catShape), cyanEmissiveMat);
  catCrestMesh.position.set(0, 0, 0.016);
  chestCrest.add(catCrestMesh);
  torsoGroup.add(chestCrest);

  // Miniature Cyber Thruster Pods on Back
  const thrusterGeo = new THREE.CylinderGeometry(0.055, 0.07, 0.12, 16);
  const thrusterLeft = new THREE.Mesh(thrusterGeo, mechJointMat);
  thrusterLeft.position.set(-0.14, 0.08, -0.26);
  thrusterLeft.rotation.x = -Math.PI / 6;
  torsoGroup.add(thrusterLeft);

  const thrusterLeftRing = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 12, 24), cyanEmissiveMat);
  thrusterLeftRing.position.set(-0.14, 0.03, -0.29);
  thrusterLeftRing.rotation.x = -Math.PI / 6;
  torsoGroup.add(thrusterLeftRing);

  const thrusterRight = new THREE.Mesh(thrusterGeo, mechJointMat);
  thrusterRight.position.set(0.14, 0.08, -0.26);
  thrusterRight.rotation.x = -Math.PI / 6;
  torsoGroup.add(thrusterRight);

  const thrusterRightRing = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 12, 24), cyanEmissiveMat);
  thrusterRightRing.position.set(0.14, 0.03, -0.29);
  thrusterRightRing.rotation.x = -Math.PI / 6;
  torsoGroup.add(thrusterRightRing);

  // === BIPEDAL LEGS FLOATING WEIGHTLESSLY IN MID-AIR ===
  function createBipedalLeg(isLeft) {
    const sign = isLeft ? -1 : 1;
    const hipGroup = new THREE.Group();
    hipGroup.name = isLeft ? 'hip_l' : 'hip_r';
    hipGroup.position.set(sign * 0.16, -0.24, 0);

    // Ball Hip Joint
    const hipSphere = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), mechJointMat);
    hipGroup.add(hipSphere);

    // Thigh
    const thighGroup = new THREE.Group();
    thighGroup.position.set(0, -0.04, 0);
    thighGroup.rotation.x = 0.26;
    thighGroup.rotation.z = sign * 0.12;

    const thighGeo = new THREE.CylinderGeometry(0.062, 0.054, 0.20, 16);
    thighGeo.translate(0, -0.10, 0);
    const thighMesh = new THREE.Mesh(thighGeo, ceramicArmorMat);
    thighGroup.add(thighMesh);

    // Purple trim ring around thigh
    const thighRing = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.008, 12, 24), purpleAccentMat);
    thighRing.position.set(0, -0.10, 0);
    thighRing.rotation.x = Math.PI / 2;
    thighGroup.add(thighRing);

    // Knee Joint
    const kneeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 14), mechJointMat);
    kneeMesh.position.set(0, -0.20, 0);
    thighGroup.add(kneeMesh);

    // Shin / Lower Leg
    const shinGroup = new THREE.Group();
    shinGroup.position.set(0, -0.20, 0);
    shinGroup.rotation.x = -0.22;

    const shinGeo = new THREE.CylinderGeometry(0.052, 0.046, 0.20, 16);
    shinGeo.translate(0, -0.10, 0);
    const shinMesh = new THREE.Mesh(shinGeo, ceramicArmorMat);
    shinGroup.add(shinMesh);

    // Cute Rounded Porcelain Floating Cat Paw
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -0.20, 0.02);
    footGroup.rotation.x = 0.36; // Angled gracefully downward in mid-air hover

    const pawGeo = new THREE.SphereGeometry(0.075, 16, 14);
    pawGeo.scale(1.05, 0.65, 1.35);
    pawGeo.translate(0, -0.02, 0.04);
    const pawMesh = new THREE.Mesh(pawGeo, ceramicArmorMat);
    footGroup.add(pawMesh);

    // 3 Cyan LED Padded Contact Dots
    const padPositions = [
      [-0.032, -0.046, 0.05],
      [0,      -0.046, 0.08],
      [0.032,  -0.046, 0.05]
    ];
    padPositions.forEach(pos => {
      const pad = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), cyanEmissiveMat);
      pad.position.set(pos[0], pos[1], pos[2]);
      footGroup.add(pad);
    });

    shinGroup.add(footGroup);
    thighGroup.add(shinGroup);
    hipGroup.add(thighGroup);
    return hipGroup;
  }

  torsoGroup.add(createBipedalLeg(true));
  torsoGroup.add(createBipedalLeg(false));

  // === SEGMENTED UPWARD ARCHED CYBER-CAT TAIL ===
  const tailGroup = new THREE.Group();
  tailGroup.name = 'tail_group';
  tailGroup.position.set(0, -0.12, -0.24);
  torsoGroup.add(tailGroup);

  const tailLinks = [];
  let currentTailParent = tailGroup;
  for (let i = 0; i < 5; i++) {
    const linkGroup = new THREE.Group();
    linkGroup.name = `tail_link_${i}`;
    linkGroup.position.set(0, i === 0 ? 0 : 0.11, i === 0 ? 0 : -0.05);
    linkGroup.rotation.x = i === 0 ? -0.45 : 0.28;

    const linkGeo = new THREE.CylinderGeometry(0.038 - i * 0.005, 0.044 - i * 0.005, 0.12, 12);
    linkGeo.translate(0, 0.06, 0);
    const linkMesh = new THREE.Mesh(linkGeo, (i % 2 === 0) ? ceramicArmorMat : purpleAccentMat);
    linkGroup.add(linkMesh);

    currentTailParent.add(linkGroup);
    currentTailParent = linkGroup;
    tailLinks.push(linkGroup);
  }

  // Upright illuminated cyan tail tip
  const tipGeo = new THREE.ConeGeometry(0.026, 0.10, 12);
  tipGeo.translate(0, 0.05, 0);
  const tailTipMesh = new THREE.Mesh(tipGeo, cyanEmissiveMat);
  tailTipMesh.position.set(0, 0.12, 0);
  currentTailParent.add(tailTipMesh);

  // === NECK & HEAD RIG (CHIBI PROPORTIONS) ===
  const neckGroup = new THREE.Group();
  neckGroup.name = 'Neck';
  neckGroup.position.set(0, 0.36, 0.05);
  torsoGroup.add(neckGroup);

  const neckSphere = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), mechJointMat);
  neckGroup.add(neckSphere);

  const headBone = new THREE.Group();
  headBone.name = 'Head';
  headBone.position.set(0, 0.18, 0.04);
  neckGroup.add(headBone);

  // Smooth Porcelain-White Helmet Cranium (Chibi Scaled)
  const skullGeo = new THREE.SphereGeometry(0.42, 32, 28);
  skullGeo.scale(1.08, 0.98, 1.05);
  const skullMesh = new THREE.Mesh(skullGeo, ceramicArmorMat);
  headBone.add(skullMesh);

  // Purple / Indigo Rim Trim Groove around helmet perimeter
  const rimGrooveGeo = new THREE.TorusGeometry(0.41, 0.012, 16, 40);
  rimGrooveGeo.rotateY(Math.PI / 2);
  const rimGroove = new THREE.Mesh(rimGrooveGeo, purpleAccentMat);
  rimGroove.position.set(0, 0.04, 0.02);
  headBone.add(rimGroove);

  // Large Curved Glossy Black Visor Face
  const visorGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 36, 1, false, -Math.PI * 0.44, Math.PI * 0.88);
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.scale.set(1.06, 0.94, 1.08);
  visorMesh.position.set(0, 0.02, 0.02);
  headBone.add(visorMesh);

  // Dynamic High-Definition OLED Visor Face Plane with Canvas Texture
  visorCanvas = document.createElement('canvas');
  visorCanvas.width = 1024;
  visorCanvas.height = 512;
  visorCtx = visorCanvas.getContext('2d');
  visorTexture = new THREE.CanvasTexture(visorCanvas);
  visorTexture.colorSpace = THREE.SRGBColorSpace;

  const visorDisplayGeo = new THREE.CylinderGeometry(0.422, 0.422, 0.275, 36, 1, false, -Math.PI * 0.43, Math.PI * 0.86);
  const visorDisplayMat = new THREE.MeshBasicMaterial({
    map: visorTexture,
    transparent: true,
    opacity: 0.96,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  visorDisplayMesh = new THREE.Mesh(visorDisplayGeo, visorDisplayMat);
  visorDisplayMesh.scale.set(1.06, 0.94, 1.08);
  visorDisplayMesh.position.set(0, 0.02, 0.022);
  headBone.add(visorDisplayMesh);

  // Render initial visor display state
  renderVisorDisplay('IDLE');

  // === EXPRESSIVE 3D VISOR EYE COMPATIBILITY MESHES ===
  eyesGroup = new THREE.Group();
  eyesGroup.name = 'EyesGroup';
  eyesGroup.position.set(0, 0.04, 0.465);
  eyesGroup.visible = false; // Canvas texture renders pristine vector eyes on visor
  headBone.add(eyesGroup);

  function createCurvedEyeArc(isLeft) {
    const group = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    group.position.set(sign * 0.14, 0, 0);

    const arcGeo = new THREE.TorusGeometry(0.065, 0.012, 16, 24, Math.PI * 0.72);
    arcGeo.rotateZ(sign > 0 ? Math.PI * 0.25 : Math.PI * 0.03);
    const arc = new THREE.Mesh(arcGeo, cyanEmissiveMat);
    group.add(arc);

    const pupilGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.05, 12);
    const pupil = new THREE.Mesh(pupilGeo, cyanEmissiveMat);
    pupil.position.set(sign * -0.006, 0.01, 0.002);
    group.add(pupil);
    return group;
  }

  function createHappyEyeArc(isLeft) {
    const group = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    group.position.set(sign * 0.14, 0, 0);

    const arcGeo = new THREE.TorusGeometry(0.065, 0.012, 16, 24, Math.PI * 0.75);
    arcGeo.rotateZ(Math.PI * 0.62);
    const arc = new THREE.Mesh(arcGeo, cyanEmissiveMat);
    arc.position.y = -0.01;
    group.add(arc);

    group.visible = false;
    return group;
  }

  function createSurpriseEyeRing(isLeft) {
    const group = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    group.position.set(sign * 0.14, 0, 0);

    const ringGeo = new THREE.TorusGeometry(0.055, 0.011, 16, 32);
    const ring = new THREE.Mesh(ringGeo, cyanEmissiveMat);
    group.add(ring);

    group.visible = false;
    return group;
  }

  leftEyeNormal = createCurvedEyeArc(true);
  rightEyeNormal = createCurvedEyeArc(false);
  eyesGroup.add(leftEyeNormal);
  eyesGroup.add(rightEyeNormal);

  leftEyeHappy = createHappyEyeArc(true);
  rightEyeHappy = createHappyEyeArc(false);
  eyesGroup.add(leftEyeHappy);
  eyesGroup.add(rightEyeHappy);

  leftEyeSurprise = createSurpriseEyeRing(true);
  rightEyeSurprise = createSurpriseEyeRing(false);
  eyesGroup.add(leftEyeSurprise);
  eyesGroup.add(rightEyeSurprise);

  // Circular Over-Ear Communication Hubs with Soft Purple Core Insets and Cyan LED Trim
  const hubBezelGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.07, 24);
  hubBezelGeo.rotateZ(Math.PI / 2);
  const hubRingGeo = new THREE.TorusGeometry(0.125, 0.014, 16, 32);
  hubRingGeo.rotateY(Math.PI / 2);
  const hubCoreGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.075, 24);
  hubCoreGeo.rotateZ(Math.PI / 2);

  // Left Comm Hub
  const leftHub = new THREE.Mesh(hubBezelGeo, mechJointMat);
  leftHub.position.set(-0.43, 0.04, -0.02);
  const leftHubRing = new THREE.Mesh(hubRingGeo, cyanEmissiveMat);
  leftHubRing.position.set(-0.46, 0.04, -0.02);
  const leftHubCore = new THREE.Mesh(hubCoreGeo, purpleCoreMat);
  leftHubCore.position.set(-0.44, 0.04, -0.02);
  headBone.add(leftHub);
  headBone.add(leftHubRing);
  headBone.add(leftHubCore);

  // Right Comm Hub
  const rightHub = new THREE.Mesh(hubBezelGeo, mechJointMat);
  rightHub.position.set(0.43, 0.04, -0.02);
  const rightHubRing = new THREE.Mesh(hubRingGeo, cyanEmissiveMat);
  rightHubRing.position.set(0.46, 0.04, -0.02);
  const rightHubCore = new THREE.Mesh(hubCoreGeo, purpleCoreMat);
  rightHubCore.position.set(0.44, 0.04, -0.02);
  headBone.add(rightHub);
  headBone.add(rightHubRing);
  headBone.add(rightHubCore);

  // Sculpted Porcelain Cat Ears with Purple Rim Trim & Glowing Cyan Inset Panels
  function createChibiCatEar(isLeft) {
    const earGroup = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    earGroup.position.set(sign * 0.26, 0.36, 0.04);
    earGroup.rotation.z = sign * -0.28;
    earGroup.rotation.x = -0.12;

    // Outer porcelain shell
    const earOuterGeo = new THREE.ConeGeometry(0.15, 0.36, 16);
    earOuterGeo.scale(1.15, 1.0, 0.65);
    const earOuter = new THREE.Mesh(earOuterGeo, ceramicArmorMat);
    earOuter.position.y = 0.18;
    earGroup.add(earOuter);

    // Purple / Indigo rim trim bevel
    const earTrimGeo = new THREE.ConeGeometry(0.156, 0.08, 16);
    earTrimGeo.scale(1.16, 1.0, 0.66);
    const earTrim = new THREE.Mesh(earTrimGeo, purpleAccentMat);
    earTrim.position.y = 0.08;
    earGroup.add(earTrim);

    // Glowing cyan inner ear panel
    const earInnerGeo = new THREE.ConeGeometry(0.10, 0.28, 14);
    earInnerGeo.scale(1.0, 1.0, 0.40);
    const earInner = new THREE.Mesh(earInnerGeo, cyanEmissiveMat);
    earInner.position.set(0, 0.15, 0.03);
    earGroup.add(earInner);

    return earGroup;
  }
  headBone.add(createChibiCatEar(true));
  headBone.add(createChibiCatEar(false));

  // === SEGMENTED MECHANICAL ARMS & ARTICULATED HANDS ===
  function createMechanicalArm(isLeft) {
    const sign = isLeft ? -1 : 1;

    // Shoulder Joint (Clavicle / upper shoulder position)
    const shoulderNode = new THREE.Group();
    shoulderNode.name = isLeft ? 'shoulder_l' : 'shoulder_r';
    shoulderNode.position.set(sign * 0.28, 0.28, 0.08);

    const shoulderSphere = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), mechJointMat);
    shoulderNode.add(shoulderSphere);

    // Pauldron Armor Cap with Purple Trim
    const pauldronGeo = new THREE.SphereGeometry(0.11, 16, 12, 0, Math.PI, 0, Math.PI * 0.7);
    const pauldron = new THREE.Mesh(pauldronGeo, ceramicArmorMat);
    pauldron.position.set(0, 0.02, 0);
    shoulderNode.add(pauldron);

    const pauldronTrimGeo = new THREE.TorusGeometry(0.105, 0.01, 12, 24);
    pauldronTrimGeo.rotateX(Math.PI / 2);
    const pauldronTrim = new THREE.Mesh(pauldronTrimGeo, purpleAccentMat);
    pauldronTrim.position.set(0, -0.01, 0);
    shoulderNode.add(pauldronTrim);

    // Upper Arm Cylinder with Ceramic Armor (Proportioned to reach visor)
    const upperArmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.34, 16);
    upperArmGeo.translate(0, -0.17, 0);
    const upperArmMesh = new THREE.Mesh(upperArmGeo, ceramicArmorMat);
    shoulderNode.add(upperArmMesh);

    // Purple mid-arm ring
    const armRing = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.008, 12, 24), purpleAccentMat);
    armRing.position.set(0, -0.17, 0);
    armRing.rotation.x = Math.PI / 2;
    shoulderNode.add(armRing);

    // Foreleg / Forearm Node
    const forelegNode = new THREE.Group();
    forelegNode.name = isLeft ? 'foreleg_l' : 'foreleg_r';
    forelegNode.position.set(0, -0.34, 0);
    shoulderNode.add(forelegNode);

    // Elbow Joint
    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.054, 14, 14), mechJointMat);
    forelegNode.add(elbowJoint);

    const forearmGeo = new THREE.CylinderGeometry(0.054, 0.046, 0.32, 16);
    forearmGeo.translate(0, -0.16, 0);
    const forearmMesh = new THREE.Mesh(forearmGeo, ceramicArmorMat);
    forelegNode.add(forearmMesh);

    // Paw / Hand Node (Capable of Expressive Pointing and Visor Eye Covering)
    const pawNode = new THREE.Group();
    pawNode.name = isLeft ? 'paw_l' : 'paw_r';
    pawNode.position.set(0, -0.32, 0.02);
    forelegNode.add(pawNode);

    // Palm Core (Chibi rounded mecha paw scaled to comfortably cover visor eyes)
    const palmGeo = new THREE.SphereGeometry(0.096, 16, 14);
    palmGeo.scale(1.48, 0.88, 1.65);
    palmGeo.translate(0, -0.02, 0.03);
    const palmMesh = new THREE.Mesh(palmGeo, ceramicArmorMat);
    pawNode.add(palmMesh);

    // 3 Cyan LED Padded Contact Points
    const padPositions = [
      [-0.038, -0.045, 0.07],
      [0,      -0.045, 0.10],
      [0.038,  -0.045, 0.07]
    ];
    padPositions.forEach(pos => {
      const pad = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), cyanEmissiveMat);
      pad.position.set(pos[0], pos[1], pos[2]);
      pawNode.add(pad);
    });

    // Articulated 3 Fingers (Pointing Index, Thumb, Outer)
    const fingerGeo = new THREE.CylinderGeometry(0.020, 0.015, 0.10, 10);
    fingerGeo.translate(0, -0.05, 0);

    // Index finger (points forward for right arm email focus)
    const indexFinger = new THREE.Mesh(fingerGeo, ceramicArmorMat);
    indexFinger.position.set(sign * 0.028, -0.04, 0.10);
    indexFinger.rotation.x = 0.35;
    pawNode.add(indexFinger);

    const thumbFinger = new THREE.Mesh(fingerGeo, ceramicArmorMat);
    thumbFinger.position.set(sign * -0.035, -0.03, 0.06);
    thumbFinger.rotation.z = sign * -0.4;
    pawNode.add(thumbFinger);
    return { shoulder: shoulderNode, foreleg: forelegNode, paw: pawNode };
  }

  const leftLimb = createMechanicalArm(true);
  const rightLimb = createMechanicalArm(false);

  torsoGroup.add(leftLimb.shoulder);
  torsoGroup.add(rightLimb.shoulder);

  // Directly bind initial bones
  bones.head = headBone;
  bones.neck = neckGroup;
  bones.leftShoulder = leftLimb.shoulder;
  bones.leftForeleg = leftLimb.foreleg;
  bones.leftPaw = leftLimb.paw;
  bones.rightShoulder = rightLimb.shoulder;
  bones.rightForeleg = rightLimb.foreleg;
  bones.rightPaw = rightLimb.paw;
  bones.tailBase = tailLinks[0];
  bones.tailMid = tailLinks[2];
  bones.tailTip = tailLinks[4];

  // Mark isBone flag on all rig transforms
  Object.values(bones).forEach(b => { if (b) b.isBone = true; });

  // Backwards compatibility aliases
  bones.leftArm = bones.leftShoulder;
  bones.rightArm = bones.rightShoulder;
  bones.leftForearm = bones.leftForeleg;
  bones.rightForearm = bones.rightForeleg;
  bones.headBone = bones.head;
  bones.tailGroup = tailGroup;

  if (typeof window !== 'undefined') {
    window.THREE = THREE;
    window.THREE_MODEL = model;
    window.THREE_BONES = bones;
    window.bones = bones;
    window.targetRotations = targetRotations;
  }
}

function onWindowResize() {
  const container = document.getElementById('mascot-3d-canvas') ||
                    document.getElementById('mascot-3d-container');
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth || 380;
  const height = container.clientHeight || 360;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0.05, 0);
  renderer.setSize(width, height);
}

function onMouseMove(event) {
  mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate(time = 0) {
  requestAnimationFrame(animate);
  updatePhysics(time);
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Global window interoperability bindings
if (typeof window !== 'undefined') {
  window.initAuth3DMascot = initAuth3DMascot;
  window.setMascotState = setMascotState;
  window.setPose = setMascotState;
  window.registerAuthEvents = registerAuthEvents;
  window.Mascot3D = {
    init: (id) => initAuth3DMascot(id || 'mascot-3d-canvas'),
    setState: (state) => {
      if (state === 'watching' || state === 'EMAIL_FOCUS') setMascotState('EMAIL_FOCUS');
      else if (state === 'peek' || state === 'coveringEyes' || state === 'COVER_EYES' || state === 'typing') setMascotState('COVER_EYES');
      else if (state === 'turned-away' || state === 'SURPRISED_LOOKAWAY' || state === 'LOOK_AWAY') setMascotState('SURPRISED_LOOKAWAY');
      else setMascotState('IDLE');
    },
    getState: () => (currentMascotState === 'SURPRISED_LOOKAWAY' ? 'LOOK_AWAY' : currentMascotState),
    start: () => {},
    stop: () => {},
    handleResize: onWindowResize
  };
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAuth3DMascot());
  } else {
    initAuth3DMascot();
  }
}
