/**
 * VYBE MARKET — Interactive Real-time 3D Mascot Character (Vybe Bot)
 * Powered by Three.js with procedural skeletal & hierarchical rigging,
 * smooth damped kinematics, multi-point cyber lighting, and mouse tracking.
 */

(function () {
  'use strict';

  let scene, camera, renderer;
  let mascotGroup, rigRoot;
  let headGroup, torsoGroup, chestGroup, backpackGroup;
  let leftShoulder, rightShoulder, leftElbow, rightElbow;
  let leftPaw, rightPaw;
  let leftEar, rightEar;
  let leftEyeGroup, rightEyeGroup, leftPupil, rightPupil;
  let leftEyelid, rightEyelid, leftHappyEye, rightHappyEye;
  let mouthMesh, blushLeft, blushRight;
  let leftHip, rightHip, leftLeg, rightLeg;
  let tailSegments = [];
  let floatingAccessories = [];
  let groundGlowDisc;

  let animFrameId = null;
  let isRunning = false;
  let currentState = 'idle';
  let clock;
  let containerEl = null;

  // Pointer tracking
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let isPointerActive = false;

  // Natural Blinking timer
  let blinkTimer = 0;
  let nextBlinkTime = 3.2;
  let isBlinking = false;
  let blinkProgress = 0;

  // Ear twitch timer
  let earTwitchTimer = 0;
  let earTwitchActive = false;

  // Reduced motion preference
  let prefersReducedMotion = false;

  // Target poses for smooth damping (LERP)
  const pose = {
    rootY: 0,
    rootRotY: 0,
    rootRotZ: 0,
    headPitch: 0,
    headYaw: 0,
    headRoll: 0,
    torsoPitch: 0,
    torsoYaw: 0,
    leftArm: { x: 0.15, y: 0.1, z: 0.25 },
    rightArm: { x: 0.15, y: -0.1, z: -0.25 },
    leftElbow: 0.2,
    rightElbow: 0.2,
    pupilX: 0,
    pupilY: 0,
    eyeScaleY: 1,
    happyEyes: false,
    earsDroop: false,
    glowIntensity: 1.5,
  };

  const currentPose = JSON.parse(JSON.stringify(pose));

  function init(containerId = 'auth-avatar-stage') {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js is not loaded yet. Mascot3D will defer initialization.');
      return false;
    }

    containerEl = document.getElementById(containerId) || document.getElementById('auth-avatar');
    if (!containerEl) {
      console.warn('Mascot3D: Container element not found:', containerId);
      return false;
    }

    prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Canvas container setup
    let canvasWrap = document.getElementById('mascot3dWrap');
    if (!canvasWrap) {
      canvasWrap = document.createElement('div');
      canvasWrap.id = 'mascot3dWrap';
      canvasWrap.className = 'w-full h-full flex items-center justify-center relative pointer-events-none select-none z-15';
      canvasWrap.style.minHeight = '320px';
      canvasWrap.style.maxHeight = '420px';
      
      const insertTarget = containerEl.querySelector('.mascot-stage-center') || containerEl;
      const rigContainer = insertTarget.querySelector('.mascot-floating-rig');
      if (rigContainer) {
        rigContainer.style.display = 'none'; // Hide CSS image rig
        insertTarget.insertBefore(canvasWrap, rigContainer);
      } else {
        insertTarget.appendChild(canvasWrap);
      }
    }

    const width = canvasWrap.clientWidth || 360;
    const height = canvasWrap.clientHeight || 360;

    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);
    camera.lookAt(0, 0.05, 0);

    // 3. Renderer with transparent background & soft tone mapping
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.id = 'mascot3dCanvas';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.maxHeight = '400px';
    renderer.domElement.style.display = 'block';

    canvasWrap.innerHTML = '';
    canvasWrap.appendChild(renderer.domElement);

    // 4. Lighting
    setupLighting();

    // 5. Build 3D Mascot Character Model
    buildCharacterRig();

    // 6. Build Floating Orbiting Accessories
    buildFloatingAccessories();

    clock = new THREE.Clock();

    // 7. Event Listeners
    setupEvents();

    // 8. Start Render Loop
    start();

    console.log('✨ VYBE Mascot 3D Character successfully initialized in WebGL!');
    return true;
  }

  function setupLighting() {
    // Ambient light - balanced warm fill
    const ambientLight = new THREE.AmbientLight(0xe8eeff, 0.85);
    scene.add(ambientLight);

    // Key Light - soft directional light from top-front
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
    keyLight.position.set(2.5, 4, 4);
    scene.add(keyLight);

    // Cyan Neon Rim Light - casts cyber glow on shoulders and ears from behind
    const cyanRimLight = new THREE.PointLight(0x00f5ff, 2.2, 12);
    cyanRimLight.position.set(-2.5, 1.5, -2);
    scene.add(cyanRimLight);

    // Secondary Purple/Indigo Fill Light from opposite side
    const purpleFill = new THREE.PointLight(0x818cf8, 1.6, 10);
    purpleFill.position.set(2.5, -1, 1.5);
    scene.add(purpleFill);

    // Ground cyan glow from pedestal
    const pedestalLight = new THREE.PointLight(0x06b6d4, 1.4, 6);
    pedestalLight.position.set(0, -1.8, 0.5);
    scene.add(pedestalLight);
  }

  function buildCharacterRig() {
    mascotGroup = new THREE.Group();
    mascotGroup.position.set(0, -0.25, 0);
    scene.add(mascotGroup);

    rigRoot = new THREE.Group();
    mascotGroup.add(rigRoot);

    // === MATERIALS ===
    // Glossy Vibrant Blue-Purple Body Armor
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x5650f8,
      roughness: 0.2,
      metalness: 0.22,
    });

    // Darker Blue Trim
    const darkBlueMat = new THREE.MeshStandardMaterial({
      color: 0x3d37cc,
      roughness: 0.25,
      metalness: 0.3,
    });

    // Radiant Cyan Emissive Neon
    const cyanNeonMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.5,
      roughness: 0.15,
    });

    // Soft White / Pearl
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf4f7ff,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Cute Cheeks Blush
    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xff3b77,
      emissive: 0xff2565,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    });

    // === 1. TORSO & CHEST ===
    torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0, 0);
    rigRoot.add(torsoGroup);

    // Upper body capsule
    const torsoGeo = new THREE.CylinderGeometry(0.5, 0.42, 0.95, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMat);
    torsoMesh.position.y = 0.45;
    torsoGroup.add(torsoMesh);

    // Belly plate (smoother front curve)
    const bellyGeo = new THREE.SphereGeometry(0.44, 20, 20);
    bellyGeo.scale(0.9, 1.1, 0.5);
    const bellyMesh = new THREE.Mesh(bellyGeo, darkBlueMat);
    bellyMesh.position.set(0, 0.42, 0.24);
    torsoGroup.add(bellyMesh);

    // Glowing Cyan Chest Emblem ('V' Shape)
    chestGroup = new THREE.Group();
    chestGroup.position.set(0, 0.58, 0.42);
    
    // Left diagonal of 'V'
    const vLeftGeo = new THREE.BoxGeometry(0.065, 0.22, 0.05);
    const vLeft = new THREE.Mesh(vLeftGeo, cyanNeonMat);
    vLeft.rotation.z = Math.PI / 5.2;
    vLeft.position.x = -0.065;
    chestGroup.add(vLeft);

    // Right diagonal of 'V'
    const vRight = new THREE.Mesh(vLeftGeo, cyanNeonMat);
    vRight.rotation.z = -Math.PI / 5.2;
    vRight.position.x = 0.065;
    chestGroup.add(vRight);
    torsoGroup.add(chestGroup);

    // Waist Belt with Cyan Trim Ring
    const beltGeo = new THREE.TorusGeometry(0.44, 0.035, 12, 32);
    const beltMesh = new THREE.Mesh(beltGeo, cyanNeonMat);
    beltMesh.rotation.x = Math.PI / 2;
    beltMesh.position.set(0, 0.12, 0);
    torsoGroup.add(beltMesh);

    // === 2. BACKPACK / CYBER BOOSTER ===
    backpackGroup = new THREE.Group();
    backpackGroup.position.set(0, 0.55, -0.42);

    const packGeo = new THREE.BoxGeometry(0.5, 0.52, 0.22);
    const packMesh = new THREE.Mesh(packGeo, darkBlueMat);
    backpackGroup.add(packMesh);

    // Dual Thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.18, 16);
    const thrusterLeft = new THREE.Mesh(thrusterGeo, cyanNeonMat);
    thrusterLeft.position.set(-0.16, -0.22, 0);
    backpackGroup.add(thrusterLeft);

    const thrusterRight = new THREE.Mesh(thrusterGeo, cyanNeonMat);
    thrusterRight.position.set(0.16, -0.22, 0);
    backpackGroup.add(thrusterRight);

    torsoGroup.add(backpackGroup);

    // === 3. HEAD & EXPRESSIVE FACE ===
    headGroup = new THREE.Group();
    headGroup.position.set(0, 1.25, 0);
    torsoGroup.add(headGroup);

    // Smooth Anime-Proportioned Head
    const headGeo = new THREE.SphereGeometry(0.72, 32, 28);
    headGeo.scale(1.08, 0.96, 1.0);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    headGroup.add(headMesh);

    // Cheeks fullness
    const cheekLeftGeo = new THREE.SphereGeometry(0.24, 16, 16);
    cheekLeftGeo.scale(1.2, 0.8, 0.9);
    const cheekLeft = new THREE.Mesh(cheekLeftGeo, bodyMat);
    cheekLeft.position.set(-0.48, -0.16, 0.42);
    headGroup.add(cheekLeft);

    const cheekRight = new THREE.Mesh(cheekLeftGeo, bodyMat);
    cheekRight.position.set(0.48, -0.16, 0.42);
    headGroup.add(cheekRight);

    // Cute Pointed Cyber Cat Ears
    leftEar = new THREE.Group();
    leftEar.position.set(-0.52, 0.6, 0.05);
    leftEar.rotation.z = Math.PI / 8;
    leftEar.rotation.y = -Math.PI / 16;

    const earOuterGeo = new THREE.ConeGeometry(0.24, 0.62, 16);
    earOuterGeo.scale(1, 1, 0.65);
    const earOuterLeft = new THREE.Mesh(earOuterGeo, bodyMat);
    earOuterLeft.position.y = 0.28;
    leftEar.add(earOuterLeft);

    // Glowing Cyan Inner-Ear Channel
    const earInnerGeo = new THREE.ConeGeometry(0.14, 0.45, 14);
    earInnerGeo.scale(1, 1, 0.4);
    const earInnerLeft = new THREE.Mesh(earInnerGeo, cyanNeonMat);
    earInnerLeft.position.set(0, 0.25, 0.08);
    leftEar.add(earInnerLeft);

    headGroup.add(leftEar);

    rightEar = new THREE.Group();
    rightEar.position.set(0.52, 0.6, 0.05);
    rightEar.rotation.z = -Math.PI / 8;
    rightEar.rotation.y = Math.PI / 16;

    const earOuterRight = new THREE.Mesh(earOuterGeo, bodyMat);
    earOuterRight.position.y = 0.28;
    rightEar.add(earOuterRight);

    const earInnerRight = new THREE.Mesh(earInnerGeo, cyanNeonMat);
    earInnerRight.position.set(0, 0.25, 0.08);
    rightEar.add(earInnerRight);

    headGroup.add(rightEar);

    // === EYES & EXPRESSIVE MORPHS ===
    const eyeBgMat = new THREE.MeshBasicMaterial({ color: 0x090e24 });
    const eyeIrisMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // LEFT EYE
    leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.28, 0.06, 0.64);
    leftEyeGroup.rotation.y = -Math.PI / 18;

    // Sclera / eye contour
    const eyeScleraGeo = new THREE.SphereGeometry(0.185, 20, 20);
    eyeScleraGeo.scale(0.85, 1.15, 0.35);
    const leftSclera = new THREE.Mesh(eyeScleraGeo, eyeBgMat);
    leftEyeGroup.add(leftSclera);

    // Iris / Pupil
    leftPupil = new THREE.Group();
    leftPupil.position.set(0, -0.01, 0.07);

    const irisGeo = new THREE.CircleGeometry(0.13, 24);
    const leftIris = new THREE.Mesh(irisGeo, eyeIrisMat);
    leftPupil.add(leftIris);

    // Eye Core Pupil (Dark Center)
    const pupilCoreGeo = new THREE.CircleGeometry(0.08, 20);
    const leftPupilCore = new THREE.Mesh(pupilCoreGeo, new THREE.MeshBasicMaterial({ color: 0x050818 }));
    leftPupilCore.position.z = 0.005;
    leftPupil.add(leftPupilCore);

    // Primary Glossy Highlight Glint (Top-Right)
    const glint1Geo = new THREE.CircleGeometry(0.045, 16);
    const glint1 = new THREE.Mesh(glint1Geo, eyeHighlightMat);
    glint1.position.set(0.045, 0.05, 0.01);
    leftPupil.add(glint1);

    // Secondary Glint (Bottom-Left)
    const glint2Geo = new THREE.CircleGeometry(0.024, 12);
    const glint2 = new THREE.Mesh(glint2Geo, eyeHighlightMat);
    glint2.position.set(-0.045, -0.045, 0.01);
    leftPupil.add(glint2);

    leftEyeGroup.add(leftPupil);

    // Eyelid for Blinking
    const eyelidGeo = new THREE.PlaneGeometry(0.32, 0.34);
    leftEyelid = new THREE.Mesh(eyelidGeo, bodyMat);
    leftEyelid.position.set(0, 0.28, 0.09); // initially retracted up
    leftEyeGroup.add(leftEyelid);

    // Happy Eye Arch Shape (^ shape for celebrations)
    const happyEyeGeo = new THREE.TorusGeometry(0.12, 0.03, 10, 20, Math.PI);
    leftHappyEye = new THREE.Mesh(happyEyeGeo, cyanNeonMat);
    leftHappyEye.rotation.z = Math.PI;
    leftHappyEye.position.set(0, -0.02, 0.08);
    leftHappyEye.visible = false;
    leftEyeGroup.add(leftHappyEye);

    headGroup.add(leftEyeGroup);

    // RIGHT EYE
    rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.28, 0.06, 0.64);
    rightEyeGroup.rotation.y = Math.PI / 18;

    const rightSclera = new THREE.Mesh(eyeScleraGeo, eyeBgMat);
    rightEyeGroup.add(rightSclera);

    rightPupil = new THREE.Group();
    rightPupil.position.set(0, -0.01, 0.07);

    const rightIris = new THREE.Mesh(irisGeo, eyeIrisMat);
    rightPupil.add(rightIris);

    const rightPupilCore = new THREE.Mesh(pupilCoreGeo, new THREE.MeshBasicMaterial({ color: 0x050818 }));
    rightPupilCore.position.z = 0.005;
    rightPupil.add(rightPupilCore);

    const rGlint1 = new THREE.Mesh(glint1Geo, eyeHighlightMat);
    rGlint1.position.set(0.045, 0.05, 0.01);
    rightPupil.add(rGlint1);

    const rGlint2 = new THREE.Mesh(glint2Geo, eyeHighlightMat);
    rGlint2.position.set(-0.045, -0.045, 0.01);
    rightPupil.add(rGlint2);

    rightEyeGroup.add(rightPupil);

    rightEyelid = new THREE.Mesh(eyelidGeo, bodyMat);
    rightEyelid.position.set(0, 0.28, 0.09);
    rightEyeGroup.add(rightEyelid);

    rightHappyEye = new THREE.Mesh(happyEyeGeo, cyanNeonMat);
    rightHappyEye.rotation.z = Math.PI;
    rightHappyEye.position.set(0, -0.02, 0.08);
    rightHappyEye.visible = false;
    rightEyeGroup.add(rightHappyEye);

    headGroup.add(rightEyeGroup);

    // BLUSH CHEEKS
    const blushGeo = new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.055, 0.12, 10, 16) : new THREE.CylinderGeometry(0.055, 0.055, 0.18, 14);
    blushGeo.rotateZ(Math.PI / 3);
    blushLeft = new THREE.Mesh(blushGeo, blushMat);
    blushLeft.position.set(-0.48, -0.16, 0.58);
    headGroup.add(blushLeft);

    blushRight = new THREE.Mesh(blushGeo, blushMat);
    blushRight.rotation.z = -Math.PI / 3;
    blushRight.position.set(0.48, -0.16, 0.58);
    headGroup.add(blushRight);

    // MOUTH (Cute cat curved line)
    const mouthGeo = new THREE.TorusGeometry(0.08, 0.018, 8, 16, Math.PI);
    mouthMesh = new THREE.Mesh(mouthGeo, new THREE.MeshBasicMaterial({ color: 0x1f1f3a }));
    mouthMesh.rotation.z = Math.PI;
    mouthMesh.position.set(0, -0.22, 0.69);
    headGroup.add(mouthMesh);

    // === 4. ARTICULATED ARMS & PAWS ===
    // LEFT ARM
    leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.58, 0.72, 0.05);
    torsoGroup.add(leftShoulder);

    const armUpperGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.38, 16);
    const armUpperLeft = new THREE.Mesh(armUpperGeo, bodyMat);
    armUpperLeft.position.y = -0.18;
    leftShoulder.add(armUpperLeft);

    // Cyan shoulder ring
    const armRingGeo = new THREE.TorusGeometry(0.125, 0.02, 10, 24);
    const shoulderRingLeft = new THREE.Mesh(armRingGeo, cyanNeonMat);
    shoulderRingLeft.rotation.x = Math.PI / 2;
    shoulderRingLeft.position.y = -0.05;
    leftShoulder.add(shoulderRingLeft);

    leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.36, 0);
    leftShoulder.add(leftElbow);

    const forearmGeo = new THREE.CylinderGeometry(0.11, 0.125, 0.36, 16);
    const forearmLeft = new THREE.Mesh(forearmGeo, bodyMat);
    forearmLeft.position.y = -0.17;
    leftElbow.add(forearmLeft);

    // Glowing cyan wrist cuff
    const wristRing = new THREE.Mesh(armRingGeo, cyanNeonMat);
    wristRing.rotation.x = Math.PI / 2;
    wristRing.position.y = -0.28;
    leftElbow.add(wristRing);

    // Cute rounded paw
    const pawGeo = new THREE.SphereGeometry(0.145, 18, 18);
    pawGeo.scale(1.1, 0.9, 1.2);
    leftPaw = new THREE.Mesh(pawGeo, bodyMat);
    leftPaw.position.set(0, -0.42, 0.02);
    leftElbow.add(leftPaw);

    // RIGHT ARM
    rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.58, 0.72, 0.05);
    torsoGroup.add(rightShoulder);

    const armUpperRight = new THREE.Mesh(armUpperGeo, bodyMat);
    armUpperRight.position.y = -0.18;
    rightShoulder.add(armUpperRight);

    const shoulderRingRight = new THREE.Mesh(armRingGeo, cyanNeonMat);
    shoulderRingRight.rotation.x = Math.PI / 2;
    shoulderRingRight.position.y = -0.05;
    rightShoulder.add(shoulderRingRight);

    rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.36, 0);
    rightShoulder.add(rightElbow);

    const forearmRight = new THREE.Mesh(forearmGeo, bodyMat);
    forearmRight.position.y = -0.17;
    rightElbow.add(forearmRight);

    const wristRingRight = new THREE.Mesh(armRingGeo, cyanNeonMat);
    wristRingRight.rotation.x = Math.PI / 2;
    wristRingRight.position.y = -0.28;
    rightElbow.add(wristRingRight);

    rightPaw = new THREE.Mesh(pawGeo, bodyMat);
    rightPaw.position.set(0, -0.42, 0.02);
    rightElbow.add(rightPaw);

    // === 5. LEGS & CYBER SNEAKERS ===
    leftHip = new THREE.Group();
    leftHip.position.set(-0.25, 0.05, 0);
    torsoGroup.add(leftHip);

    const legGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.45, 16);
    const leftLegMesh = new THREE.Mesh(legGeo, bodyMat);
    leftLegMesh.position.y = -0.22;
    leftHip.add(leftLegMesh);

    // Left Sneaker
    const shoeGroupLeft = new THREE.Group();
    shoeGroupLeft.position.set(0, -0.44, 0.06);

    const shoeUpperGeo = new THREE.BoxGeometry(0.24, 0.18, 0.42);
    const shoeUpperLeft = new THREE.Mesh(shoeUpperGeo, bodyMat);
    shoeGroupLeft.add(shoeUpperLeft);

    const shoeSoleGeo = new THREE.BoxGeometry(0.26, 0.07, 0.46);
    const shoeSoleLeft = new THREE.Mesh(shoeSoleGeo, whiteMat);
    shoeSoleLeft.position.y = -0.1;
    shoeGroupLeft.add(shoeSoleLeft);

    // Glowing Cyan Trim on Shoe
    const shoeGlowGeo = new THREE.BoxGeometry(0.27, 0.03, 0.44);
    const shoeGlowLeft = new THREE.Mesh(shoeGlowGeo, cyanNeonMat);
    shoeGlowLeft.position.y = -0.05;
    shoeGroupLeft.add(shoeGlowLeft);

    leftHip.add(shoeGroupLeft);

    // Right Leg & Sneaker
    rightHip = new THREE.Group();
    rightHip.position.set(0.25, 0.05, 0);
    torsoGroup.add(rightHip);

    const rightLegMesh = new THREE.Mesh(legGeo, bodyMat);
    rightLegMesh.position.y = -0.22;
    rightHip.add(rightLegMesh);

    const shoeGroupRight = new THREE.Group();
    shoeGroupRight.position.set(0, -0.44, 0.06);

    const shoeUpperRight = new THREE.Mesh(shoeUpperGeo, bodyMat);
    shoeGroupRight.add(shoeUpperRight);

    const shoeSoleRight = new THREE.Mesh(shoeSoleGeo, whiteMat);
    shoeSoleRight.position.y = -0.1;
    shoeGroupRight.add(shoeSoleRight);

    const shoeGlowRight = new THREE.Mesh(shoeGlowGeo, cyanNeonMat);
    shoeGlowRight.position.y = -0.05;
    shoeGroupRight.add(shoeGlowRight);

    rightHip.add(shoeGroupRight);

    // === 6. FLEXIBLE 4-SEGMENT CYBER TAIL ===
    let parentJoint = torsoGroup;
    let segPos = new THREE.Vector3(0, 0.15, -0.42);
    tailSegments = [];

    for (let i = 0; i < 4; i++) {
      const joint = new THREE.Group();
      joint.position.copy(segPos);
      parentJoint.add(joint);

      const radius = 0.075 - i * 0.012;
      const tailMeshGeo = new THREE.CylinderGeometry(radius, radius * 1.15, 0.18, 12);
      const isTip = (i === 3);
      const tailMesh = new THREE.Mesh(tailMeshGeo, isTip ? cyanNeonMat : bodyMat);
      tailMesh.rotation.x = Math.PI / 3;
      tailMesh.position.set(0, 0.06, -0.08);
      joint.add(tailMesh);

      tailSegments.push(joint);
      parentJoint = joint;
      segPos = new THREE.Vector3(0, 0.1, -0.15);
    }

    // === 7. AMBIENT CYAN PEDESTAL DISC ===
    const discGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.05, 36);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.35,
    });
    groundGlowDisc = new THREE.Mesh(discGeo, discMat);
    groundGlowDisc.position.set(0, -0.75, 0);
    rigRoot.add(groundGlowDisc);
  }

  function buildFloatingAccessories() {
    floatingAccessories = [];

    // 1. Mini 3D Shopping Cart (Cyan wireframe/solid)
    const cartGroup = new THREE.Group();
    const cartMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x0099ff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.4
    });
    const basketGeo = new THREE.BoxGeometry(0.3, 0.22, 0.26);
    const basket = new THREE.Mesh(basketGeo, cartMat);
    cartGroup.add(basket);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    [[-0.1, -0.13, 0.1], [0.1, -0.13, 0.1], [-0.1, -0.13, -0.1], [0.1, -0.13, -0.1]].forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, cartMat);
      wheel.position.set(...pos);
      cartGroup.add(wheel);
    });

    cartGroup.position.set(-1.45, 0.9, 0.2);
    cartGroup.userData = { baseY: 0.9, phase: 0, speed: 1.8, orbitRadius: 1.45, angle: 0 };
    scene.add(cartGroup);
    floatingAccessories.push(cartGroup);

    // 2. Mini Golden Shopping Bag (Warm accent from reference art)
    const bagGroup = new THREE.Group();
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0xffa500,
      emissive: 0xff8800,
      emissiveIntensity: 0.5,
      roughness: 0.3
    });
    const bagBodyGeo = new THREE.BoxGeometry(0.24, 0.28, 0.16);
    const bagBody = new THREE.Mesh(bagBodyGeo, bagMat);
    bagGroup.add(bagBody);

    // Bag Handle
    const handleGeo = new THREE.TorusGeometry(0.07, 0.015, 8, 16, Math.PI);
    const handle = new THREE.Mesh(handleGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    handle.position.set(0, 0.14, 0);
    bagGroup.add(handle);

    bagGroup.position.set(1.4, 0.75, -0.1);
    bagGroup.userData = { baseY: 0.75, phase: 2.1, speed: 1.4, orbitRadius: 1.4, angle: Math.PI };
    scene.add(bagGroup);
    floatingAccessories.push(bagGroup);

    // 3. Cyber Percent Discount Tag
    const tagGroup = new THREE.Group();
    const tagMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });
    const tagGeo = new THREE.BoxGeometry(0.18, 0.24, 0.03);
    const tagMesh = new THREE.Mesh(tagGeo, tagMat);
    tagGroup.add(tagMesh);

    tagGroup.position.set(-1.1, -0.2, 0.3);
    tagGroup.userData = { baseY: -0.2, phase: 3.5, speed: 2.0, orbitRadius: 1.1, angle: Math.PI * 0.7 };
    scene.add(tagGroup);
    floatingAccessories.push(tagGroup);
  }

  function setupEvents() {
    // Window / Modal mouse tracker
    const targetArea = document.getElementById('authModal') || window;
    
    const handlePointerMove = (e) => {
      if (!containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Clamp mouse coordinates to realistic natural boundaries
      mouse.targetX = Math.max(-1.5, Math.min(1.5, normX));
      mouse.targetY = Math.max(-1.2, Math.min(1.2, normY));
      isPointerActive = true;
    };

    const handlePointerLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
      isPointerActive = false;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);

    // Visibility observer to pause loop when tab or modal is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stop();
      } else {
        const modal = document.getElementById('authModal');
        if (modal && !modal.classList.contains('hidden')) {
          start();
        }
      }
    });

    // Resize observer
    if (window.ResizeObserver && containerEl) {
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerEl);
    } else {
      window.addEventListener('resize', handleResize);
    }
  }

  function handleResize() {
    if (!renderer || !camera || !containerEl) return;
    const canvasWrap = document.getElementById('mascot3dWrap');
    if (!canvasWrap) return;

    const width = canvasWrap.clientWidth || 360;
    const height = canvasWrap.clientHeight || 360;

    if (width > 0 && height > 0) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }

  /**
   * Set High-Level State Reaction
   * @param {string} state - 'idle' | 'watching' | 'peek' | 'turned-away' | 'success' | 'error' | 'welcome'
   */
  function setState(state) {
    currentState = state;
    if (!clock) return;

    switch (state) {
      case 'watching':
        // Focused on email: turns head toward form (to the right +X), pupil focuses right, welcoming arm pose
        pose.rootRotY = 0.18;
        pose.headPitch = 0.05;
        pose.headYaw = 0.42; // Turn toward form on the right
        pose.headRoll = 0.06;
        pose.torsoPitch = 0.04;
        pose.torsoYaw = 0.15;
        pose.pupilX = 0.04;
        pose.pupilY = -0.015;
        // Right arm extends forward/right
        pose.rightArm = { x: -0.65, y: -0.35, z: 0.45 };
        pose.rightElbow = 0.45;
        // Left arm relaxed at side
        pose.leftArm = { x: 0.1, y: 0.05, z: 0.2 };
        pose.leftElbow = 0.2;
        pose.happyEyes = false;
        pose.earsDroop = false;
        break;

      case 'peek':
        // Password masked: Both arms raise to cover eyes ("No peeking!")
        pose.rootRotY = 0;
        pose.headPitch = -0.05;
        pose.headYaw = 0;
        pose.headRoll = -0.05;
        pose.torsoPitch = 0.02;
        pose.torsoYaw = 0;
        pose.pupilX = 0;
        pose.pupilY = 0;
        // Paws cover eyes
        pose.leftArm = { x: -1.48, y: 0.58, z: -0.32 };
        pose.leftElbow = 1.35;
        pose.rightArm = { x: -1.48, y: -0.58, z: 0.32 };
        pose.rightElbow = 1.35;
        pose.happyEyes = false;
        pose.earsDroop = false;
        break;

      case 'turned-away':
        // Password shown: turns whole head and body away shyly
        pose.rootRotY = -0.55;
        pose.headPitch = -0.08;
        pose.headYaw = -0.75; // Look far left away from password
        pose.headRoll = 0.1;
        pose.torsoPitch = 0;
        pose.torsoYaw = -0.3;
        pose.pupilX = -0.05;
        pose.pupilY = 0;
        // Shy hands close to chest
        pose.leftArm = { x: -0.85, y: 0.4, z: -0.1 };
        pose.leftElbow = 0.8;
        pose.rightArm = { x: -0.7, y: -0.3, z: 0.15 };
        pose.rightElbow = 0.75;
        pose.happyEyes = false;
        pose.earsDroop = false;
        break;

      case 'success':
        // Celebratory victory hop, both hands raised in V shape
        pose.rootRotY = 0;
        pose.headPitch = 0.18;
        pose.headYaw = 0;
        pose.headRoll = 0;
        pose.torsoPitch = -0.05;
        pose.torsoYaw = 0;
        pose.pupilX = 0;
        pose.pupilY = 0.02;
        // Both hands high up in victory
        pose.leftArm = { x: -2.3, y: 0.25, z: 0.75 };
        pose.leftElbow = 0.25;
        pose.rightArm = { x: -2.3, y: -0.25, z: -0.75 };
        pose.rightElbow = 0.25;
        pose.happyEyes = true;
        pose.earsDroop = false;
        break;

      case 'error':
        // Concerned expression: head droops, ears pin back, slight tremble
        pose.rootRotY = 0;
        pose.headPitch = -0.25;
        pose.headYaw = 0;
        pose.headRoll = 0.08;
        pose.torsoPitch = 0.1;
        pose.torsoYaw = 0;
        pose.pupilX = 0;
        pose.pupilY = -0.03;
        // Arms tuck in defensively
        pose.leftArm = { x: -0.35, y: 0.2, z: 0.1 };
        pose.leftElbow = 0.55;
        pose.rightArm = { x: -0.35, y: -0.2, z: -0.1 };
        pose.rightElbow = 0.55;
        pose.happyEyes = false;
        pose.earsDroop = true;
        break;

      case 'welcome':
      case 'register':
        // Friendly welcoming wave with right hand
        pose.rootRotY = 0.1;
        pose.headPitch = 0.08;
        pose.headYaw = 0.2;
        pose.headRoll = -0.06;
        pose.torsoPitch = 0;
        pose.torsoYaw = 0.08;
        pose.pupilX = 0.02;
        pose.pupilY = 0.01;
        // Right hand raised in wave
        pose.rightArm = { x: -1.75, y: -0.35, z: -0.55 };
        pose.rightElbow = 0.65;
        pose.leftArm = { x: 0.15, y: 0.1, z: 0.2 };
        pose.leftElbow = 0.2;
        pose.happyEyes = false;
        pose.earsDroop = false;
        break;

      case 'idle':
      case 'neutral':
      default:
        // Relaxed, friendly floating pose with natural eye tracking
        pose.rootRotY = 0;
        pose.headPitch = 0;
        pose.headYaw = 0;
        pose.headRoll = 0;
        pose.torsoPitch = 0;
        pose.torsoYaw = 0;
        pose.pupilX = 0;
        pose.pupilY = 0;
        pose.leftArm = { x: 0.15, y: 0.1, z: 0.25 };
        pose.leftElbow = 0.2;
        pose.rightArm = { x: 0.15, y: -0.1, z: -0.25 };
        pose.rightElbow = 0.2;
        pose.happyEyes = false;
        pose.earsDroop = false;
        break;
    }
  }

  function updateAnimation(delta, time) {
    if (!rigRoot) return;

    // Smooth lerp mouse coordinates
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    // Interpolation damping speed
    const lerpSpeed = delta * 6.5;

    // 1. Natural Breathing & Floating Levitation
    const floatSpeed = prefersReducedMotion ? 0.8 : 2.2;
    const floatAmplitude = prefersReducedMotion ? 0.02 : 0.07;
    const idleY = Math.sin(time * floatSpeed) * floatAmplitude;
    const idleBreath = Math.sin(time * 2.8) * 0.025;

    currentPose.rootY += (idleY - currentPose.rootY) * lerpSpeed;
    rigRoot.position.y = currentPose.rootY;

    // Breathing Torso Scale
    torsoGroup.scale.set(1 + idleBreath * 0.5, 1 + idleBreath, 1 + idleBreath * 0.5);

    // 2. Head Tilt & Cursor Tracking
    let targetHeadYaw = pose.headYaw;
    let targetHeadPitch = pose.headPitch;

    // Blend in pointer tracking when not covering eyes or turned away
    if (currentState === 'idle' || currentState === 'neutral' || currentState === 'watching' || currentState === 'welcome') {
      targetHeadYaw += mouse.x * 0.35;
      targetHeadPitch += mouse.y * 0.25;
    }

    currentPose.headYaw += (targetHeadYaw - currentPose.headYaw) * lerpSpeed;
    currentPose.headPitch += (targetHeadPitch - currentPose.headPitch) * lerpSpeed;
    currentPose.headRoll += (pose.headRoll - currentPose.headRoll) * lerpSpeed;

    headGroup.rotation.y = currentPose.headYaw;
    headGroup.rotation.x = -currentPose.headPitch;
    headGroup.rotation.z = currentPose.headRoll;

    // 3. Eye Pupils Tracking
    let targetPupilX = pose.pupilX + (mouse.x * 0.035);
    let targetPupilY = pose.pupilY + (mouse.y * 0.03);

    // Clamp pupil bounds
    targetPupilX = Math.max(-0.065, Math.min(0.065, targetPupilX));
    targetPupilY = Math.max(-0.05, Math.min(0.05, targetPupilY));

    currentPose.pupilX += (targetPupilX - currentPose.pupilX) * lerpSpeed;
    currentPose.pupilY += (targetPupilY - currentPose.pupilY) * lerpSpeed;

    if (leftPupil && rightPupil) {
      leftPupil.position.x = currentPose.pupilX;
      leftPupil.position.y = currentPose.pupilY;
      rightPupil.position.x = currentPose.pupilX;
      rightPupil.position.y = currentPose.pupilY;
    }

    // 4. Natural Blinking & Expression Morphs
    blinkTimer += delta;
    if (blinkTimer > nextBlinkTime && !isBlinking) {
      isBlinking = true;
      blinkProgress = 0;
      nextBlinkTime = 2.8 + Math.random() * 3.5;
    }

    if (isBlinking) {
      blinkProgress += delta * 12; // Fast blink
      let eyelidOffset;
      if (blinkProgress < Math.PI) {
        eyelidOffset = 0.28 - (Math.sin(blinkProgress) * 0.32);
      } else {
        eyelidOffset = 0.28;
        isBlinking = false;
        blinkTimer = 0;
      }
      leftEyelid.position.y = eyelidOffset;
      rightEyelid.position.y = eyelidOffset;
    } else {
      leftEyelid.position.y = 0.28;
      rightEyelid.position.y = 0.28;
    }

    // Happy eyes toggle for celebration
    if (leftHappyEye && rightHappyEye) {
      leftHappyEye.visible = pose.happyEyes;
      rightHappyEye.visible = pose.happyEyes;
      leftPupil.visible = !pose.happyEyes;
      rightPupil.visible = !pose.happyEyes;
    }

    // 5. Ear Twitch & Droop
    earTwitchTimer += delta;
    let earAngleL = Math.PI / 8;
    let earAngleR = -Math.PI / 8;

    if (pose.earsDroop) {
      earAngleL = Math.PI / 4.5;
      earAngleR = -Math.PI / 4.5;
    } else if (earTwitchTimer > 4.2) {
      earAngleL += Math.sin(time * 24) * 0.12;
      if (earTwitchTimer > 4.7) earTwitchTimer = 0;
    }

    leftEar.rotation.z += (earAngleL - leftEar.rotation.z) * lerpSpeed;
    rightEar.rotation.z += (earAngleR - rightEar.rotation.z) * lerpSpeed;

    // 6. Arms & Waving Animation
    let targetLeftArm = { ...pose.leftArm };
    let targetRightArm = { ...pose.rightArm };

    // Waving dynamic swing during 'welcome'
    if (currentState === 'welcome' || currentState === 'register') {
      targetRightArm.z += Math.sin(time * 6.5) * 0.28;
      targetRightArm.x += Math.cos(time * 6.5) * 0.15;
    }

    // Success celebratory cheering bounce
    if (currentState === 'success') {
      targetLeftArm.y += Math.sin(time * 8) * 0.18;
      targetRightArm.y -= Math.sin(time * 8) * 0.18;
    }

    currentPose.leftArm.x += (targetLeftArm.x - currentPose.leftArm.x) * lerpSpeed;
    currentPose.leftArm.y += (targetLeftArm.y - currentPose.leftArm.y) * lerpSpeed;
    currentPose.leftArm.z += (targetLeftArm.z - currentPose.leftArm.z) * lerpSpeed;

    currentPose.rightArm.x += (targetRightArm.x - currentPose.rightArm.x) * lerpSpeed;
    currentPose.rightArm.y += (targetRightArm.y - currentPose.rightArm.y) * lerpSpeed;
    currentPose.rightArm.z += (targetRightArm.z - currentPose.rightArm.z) * lerpSpeed;

    leftShoulder.rotation.set(currentPose.leftArm.x, currentPose.leftArm.y, currentPose.leftArm.z);
    rightShoulder.rotation.set(currentPose.rightArm.x, currentPose.rightArm.y, currentPose.rightArm.z);

    currentPose.leftElbow += (pose.leftElbow - currentPose.leftElbow) * lerpSpeed;
    currentPose.rightElbow += (pose.rightElbow - currentPose.rightElbow) * lerpSpeed;
    leftElbow.rotation.x = currentPose.leftElbow;
    rightElbow.rotation.x = currentPose.rightElbow;

    // 7. Tail Sinuous Wagging
    const tailSpeed = (currentState === 'success') ? 9.5 : 3.2;
    tailSegments.forEach((segment, idx) => {
      const wag = Math.sin(time * tailSpeed + idx * 0.65) * 0.18;
      segment.rotation.y = wag;
      segment.rotation.z = Math.cos(time * (tailSpeed * 0.5) + idx * 0.5) * 0.08;
    });

    // 8. Ground Pedestal Cyan Glow Breathing
    if (groundGlowDisc) {
      const glowScale = 1 + Math.sin(time * 2.5) * 0.06;
      groundGlowDisc.scale.set(glowScale, 1, glowScale);
      groundGlowDisc.material.opacity = 0.28 + Math.sin(time * 2.5) * 0.12;
    }

    // 9. Orbiting 3D Floating Accessories
    floatingAccessories.forEach((item) => {
      const u = item.userData;
      u.angle += delta * 0.45;
      item.position.y = u.baseY + Math.sin(time * u.speed + u.phase) * 0.08;
      item.rotation.y += delta * 1.2;
      item.rotation.x = Math.sin(time + u.phase) * 0.15;
    });
  }

  function render() {
    if (!isRunning) return;
    animFrameId = requestAnimationFrame(render);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    updateAnimation(delta, time);
    renderer.render(scene, camera);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    if (clock) clock.start();
    render();
  }

  function stop() {
    isRunning = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  // Export public interface
  window.Mascot3D = {
    init,
    setState,
    start,
    stop,
    handleResize
  };

})();
