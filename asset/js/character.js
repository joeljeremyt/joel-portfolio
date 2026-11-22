/**
 * Joel Jeremy Tanumihardja - Living Sketchbook Portfolio
 * character.js: Character Walking Cycle, Camera Tracking, Dog Companion AI, and About Bubbles
 */

(function () {
  'use strict';

  // Image Sprites Cache
  const SPRITES = {
    standLeft: 'asset/image/joel-stand-left.PNG',
    standRight: 'asset/image/joel-stand-right.PNG',
    walk1Left: 'asset/image/joel-walk1-left.PNG',
    walk2Left: 'asset/image/joel-walk2-left.PNG',
    walk1Right: 'asset/image/joel-walk1-right.PNG',
    walk2Right: 'asset/image/joel-walk2-right.PNG',
    blown1Left: 'asset/image/joel-blown-left.PNG',
    blown2Left: 'asset/image/joel-blown-left2.PNG',
    blown1Right: 'asset/image/joel-blown-right.PNG',
    blown2Right: 'asset/image/joel-blown-right2.PNG',
    grassHome: 'asset/image/grass-home.PNG',
    grassHomeBlown1: 'asset/image/grass-home-blown.PNG',
    grassHomeBlown2: 'asset/image/grass-home-blown2.PNG',
    dogLeft: 'asset/image/dog-left.PNG',
    dogRight: 'asset/image/dog-right.PNG',
    dogProfile: 'asset/image/dog-profile.PNG'
  };

  // Preload all character and dog images to prevent frame-switch flicker
  Object.values(SPRITES).forEach(src => {
    const img = new Image();
    img.src = src;
  });

  // DOM Elements
  const characterEl = document.getElementById('character-actor');
  const characterImg = document.getElementById('character-sprite-img');
  const dogEl = document.getElementById('dog-actor');
  const dogImg = document.getElementById('dog-sprite-img');
  const dogProfileModal = document.getElementById('dog-profile-modal');
  const cvModal = document.getElementById('cv-profile-modal');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.sketch-section');
  const homeGrassEl = document.getElementById('home-grass-bg') || document.querySelector('#home .section-doodle-bg');
  const portalGrassEl = document.getElementById('portal-grass-bg') || document.querySelector('.portal-grass-bg');

  // Input State
  const keys = {
    w: false,
    a: false,
    s: false,
    d: false
  };

  // CV, Project, Doodle Share & Archive Modal Freeze State
  let isCvOpen = false;
  function isAnyModalOpen() {
    const projModal = document.getElementById('project-modal');
    const isProjOpen = projModal && projModal.classList.contains('active');
    const doodleModal = document.getElementById('doodle-share-modal');
    const isDoodleOpen = doodleModal && doodleModal.classList.contains('active');
    const archiveModal = document.getElementById('doodle-archive-modal');
    const isArchiveOpen = archiveModal && archiveModal.classList.contains('active');
    return isCvOpen || (cvModal && cvModal.classList.contains('active')) || isProjOpen || isDoodleOpen || isArchiveOpen || document.body.classList.contains('modal-scroll-lock');
  }
  function isCvModalOpen() {
    return isAnyModalOpen();
  }

  // Character State
  let facing = 'left'; // initial facing direction as requested
  let isMoving = false;
  let walkFrame = 1;
  let walkTimer = 0;
  const WALK_FRAME_INTERVAL = 500; // precisely 0.5s walking cycle
  let currentCharacterSrc = '';

  // Wind-Blown Animation Configuration (Character Hair & Grass-Home Background)
  const BLOWN_DURATION = 3000; // 3 seconds total duration for wind blow
  const BLOWN_FRAME_INTERVAL = 500; // 0.5 sec delay between frame 1 and 2
  const INITIAL_ENTER_BLOWN_DELAY = 800; // <-- INITIAL START TIME (in ms) when entering the portfolio (0.8s)

  // Character Wind-Blown State
  let isBlownActive = false;
  let blownTimer = 0; // accumulated time during the 3-second blown effect
  let blownFrame = 1; // 1: joel-blown-(dir), 2: joel-blown-(dir)2
  let blownFrameTimer = 0; // toggles every 500ms
  let idleStandingTime = 0; // accumulated idle standing time
  let nextBlownDelay = INITIAL_ENTER_BLOWN_DELAY;

  // Grass-Home Wind-Blown State
  let isGrassBlownActive = false;
  let grassBlownTimer = 0;
  let grassBlownFrame = 1; // 1: grass-home-blown, 2: grass-home-blown2
  let grassBlownFrameTimer = 0; // toggles every 500ms
  let grassIdleTime = 0;
  let nextGrassBlownDelay = INITIAL_ENTER_BLOWN_DELAY;
  let currentGrassSrc = '';

  // World & Camera Tracking
  let worldHeight = 6000;
  let charX = window.innerWidth * 0.5;
  let charY = 400;
  let targetCharX = charX;
  let targetCharY = charY;
  let cameraY = 0;
  let targetCameraY = 0;
  const SPEED = 720; // Fast and responsive walking speed

  // Dog State
  let dogX = charX + 120;
  let dogY = charY + 35;
  let dogFacing = 'left';
  let isDogTrotting = false;
  let dogHideTimeout = null;
  let boneTarget = null;

  // Initialize Position
  function initPositions() {
    worldHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 5500);
    const homeSec = document.getElementById('home');
    if (homeSec) {
      const rect = homeSec.getBoundingClientRect();
      const homeCenterY = window.scrollY + rect.top + rect.height * 0.52;
      charY = homeCenterY;
      targetCharY = homeCenterY;
      charX = window.innerWidth * 0.5;
      targetCharX = charX;
      dogX = charX + 120;
      dogY = charY + 35;
    }
  }

  // Set Grass Background Sprite helper
  function setGrassSrc(src) {
    if (currentGrassSrc === src) return;
    currentGrassSrc = src;
    if (homeGrassEl) homeGrassEl.src = src;
    if (portalGrassEl) portalGrassEl.src = src;
  }

  // Trigger Grass Blown Animation
  function triggerGrassBlown() {
    isGrassBlownActive = true;
    grassBlownTimer = 0;
    grassBlownFrame = 1;
    grassBlownFrameTimer = 0;
    grassIdleTime = 0;
    setGrassSrc(SPRITES.grassHomeBlown1);
  }

  // Handle Keyboard Input (Case-insensitive, supports WASD & Arrow keys reliably)
  window.addEventListener('keydown', (e) => {
    // If typing in input or textarea, don't hijack WASD
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    // When a modal is open, disallow character walking and lock screen
    if (isCvModalOpen()) {
      if (e.key === 'Escape') {
        if (isCvOpen || (cvModal && cvModal.classList.contains('active'))) {
          closeCvModal();
          e.preventDefault();
        }
      }
      return;
    }

    const k = e.key ? e.key.toLowerCase() : '';
    const code = e.code || '';

    if (k === 'w' || k === 'arrowup' || code === 'KeyW' || code === 'ArrowUp') {
      keys.w = true;
      e.preventDefault();
    }
    if (k === 's' || k === 'arrowdown' || code === 'KeyS' || code === 'ArrowDown') {
      keys.s = true;
      e.preventDefault();
    }
    if (k === 'a' || k === 'arrowleft' || code === 'KeyA' || code === 'ArrowLeft') {
      keys.a = true;
      e.preventDefault();
    }
    if (k === 'd' || k === 'arrowright' || code === 'KeyD' || code === 'ArrowRight') {
      keys.d = true;
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (isCvModalOpen()) {
      keys.w = false;
      keys.a = false;
      keys.s = false;
      keys.d = false;
      return;
    }

    const k = e.key ? e.key.toLowerCase() : '';
    const code = e.code || '';

    if (k === 'w' || k === 'arrowup' || code === 'KeyW' || code === 'ArrowUp') keys.w = false;
    if (k === 's' || k === 'arrowdown' || code === 'KeyS' || code === 'ArrowDown') keys.s = false;
    if (k === 'a' || k === 'arrowleft' || code === 'KeyA' || code === 'ArrowLeft') keys.a = false;
    if (k === 'd' || k === 'arrowright' || code === 'KeyD' || code === 'ArrowRight') keys.d = false;
  });

  // Mobile On-Screen D-Pad
  const dpadUp = document.getElementById('dpad-up');
  const dpadDown = document.getElementById('dpad-down');
  const dpadLeft = document.getElementById('dpad-left');
  const dpadRight = document.getElementById('dpad-right');

  function bindTouchBtn(btn, keyName) {
    if (!btn) return;
    const press = (e) => {
      if (isCvModalOpen()) return;
      e.preventDefault();
      keys[keyName] = true;
    };
    const release = (e) => {
      e.preventDefault();
      keys[keyName] = false;
    };
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release, { passive: false });
    btn.addEventListener('mousedown', press);
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
  }

  bindTouchBtn(dpadUp, 'w');
  bindTouchBtn(dpadDown, 's');
  bindTouchBtn(dpadLeft, 'a');
  bindTouchBtn(dpadRight, 'd');

  // Mouse Wheel Scroll Synchronization
  window.addEventListener('wheel', (e) => {
    // Strictly prevent character and camera movement when CV modal is open
    if (isCvModalOpen()) return;

    // Smoothly shift target character Y with wheel
    targetCharY += e.deltaY * 0.85;
    const minCharY = 140;
    const maxCharY = worldHeight - 140;
    targetCharY = Math.max(minCharY, Math.min(maxCharY, targetCharY));
  }, { passive: true });

  // Touch Drag / Swipe Scrolling on Mobile Devices
  let touchStartY = null;
  let touchStartX = null;
  window.addEventListener('touchstart', (e) => {
    if (isCvModalOpen()) return;
    if (e.touches && e.touches[0]) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isCvModalOpen()) return;
    if (touchStartY !== null && e.touches && e.touches[0]) {
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = touchStartY - currentY;
      const deltaX = touchStartX - currentX;

      targetCharY += deltaY * 1.2;
      targetCharX -= deltaX * 0.8;

      const minCharY = 140;
      const maxCharY = worldHeight - 140;
      targetCharY = Math.max(minCharY, Math.min(maxCharY, targetCharY));

      const minX = window.innerWidth * 0.08;
      const maxX = window.innerWidth * 0.92;
      targetCharX = Math.max(minX, Math.min(maxX, targetCharX));

      touchStartY = currentY;
      touchStartX = currentX;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    touchStartY = null;
    touchStartX = null;
  });

  // Gliding Character and Camera to a target section by ID
  function glideToSection(sectionId) {
    if (!sectionId) return;
    const targetId = sectionId.replace('#', '');
    const targetSec = document.getElementById(targetId);
    if (targetSec) {
      const rect = targetSec.getBoundingClientRect();
      const secCenterY = window.scrollY + rect.top + rect.height * 0.5;
      targetCharY = secCenterY;
      if (window.Sketchbook && window.Sketchbook.playPaperRustle) {
        window.Sketchbook.playPaperRustle();
      }
    }
  }
  window.glideToSection = glideToSection;
  window.addEventListener('glideToSection', (e) => {
    if (e.detail) glideToSection(e.detail);
  });

  // Navigation Click Gliding
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      glideToSection(targetId);
    });
  });

  // Logo Click: return home
  const logoLink = document.querySelector('.logo-container');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      const homeSec = document.getElementById('home');
      if (homeSec) {
        const rect = homeSec.getBoundingClientRect();
        targetCharY = window.scrollY + rect.top + rect.height * 0.52;
      }
    });
  }

  // Listen to custom bone toss from interactive sandbox
  window.addEventListener('tossBoneToDog', () => {
    boneTarget = {
      x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 200,
      y: charY + 40
    };
    setTimeout(() => {
      boneTarget = null;
    }, 4000);
  });

  // =========================================================================
  // MAIN ANIMATION & GAME LOOP
  // =========================================================================
  let lastTimestamp = performance.now();

  function updateLoop(timestamp) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    // Strict freeze when CV modal is open: only CV modal is scrollable, background completely locked
    if (isCvModalOpen()) {
      keys.w = false;
      keys.a = false;
      keys.s = false;
      keys.d = false;
      isMoving = false;
      walkTimer = 0;
      walkFrame = 1;
      isBlownActive = false;
      blownTimer = 0;
      blownFrame = 1;
      blownFrameTimer = 0;
      idleStandingTime = 0;

      // Maintain standing idle sprite
      const idleSrc = (facing === 'left') ? SPRITES.standLeft : SPRITES.standRight;
      if (characterImg && currentCharacterSrc !== idleSrc) {
        currentCharacterSrc = idleSrc;
        characterImg.src = idleSrc;
      }

      // Stop dog trot animation
      if (dogEl) {
        const dogInner = dogEl.querySelector('.dog-actor-inner');
        if (dogInner) dogInner.classList.remove('dog-trotting');
      }

      // Maintain character in fixed screen coordinates
      const charScreenY = charY - cameraY;
      if (characterEl) {
        characterEl.style.left = `${charX}px`;
        characterEl.style.top = `${charScreenY}px`;
      }

      // Lock window scroll at current camera position
      window.scrollTo({
        top: cameraY,
        behavior: 'instant'
      });

      requestAnimationFrame(updateLoop);
      return;
    }

    worldHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 5500);
    const screenCenterY = window.innerHeight * 0.52;
    const maxScroll = Math.max(0, worldHeight - window.innerHeight);

    // 1. Process Movement Inputs
    let moveX = 0;
    let moveY = 0;

    if (keys.w) moveY -= 1;
    if (keys.s) moveY += 1;
    if (keys.a) moveX -= 1;
    if (keys.d) moveX += 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.7071;
      moveY *= 0.7071;
    }

    if (moveX !== 0 || moveY !== 0) {
      targetCharX += moveX * SPEED * dt;
      targetCharY += moveY * SPEED * dt;
    }

    // Clamp horizontal movement within viewport bounds
    const minX = window.innerWidth * 0.08;
    const maxX = window.innerWidth * 0.92;
    targetCharX = Math.max(minX, Math.min(maxX, targetCharX));

    // Clamp vertical movement to entire world (from near top header to bottom footer)
    const minCharY = 140;
    const maxCharY = worldHeight - 140;
    targetCharY = Math.max(minCharY, Math.min(maxCharY, targetCharY));

    // 2. Smooth Gliding (Lerp)
    const prevCharX = charX;
    const prevCharY = charY;
    charX += (targetCharX - charX) * (1 - Math.exp(-12 * dt));
    charY += (targetCharY - charY) * (1 - Math.exp(-12 * dt));

    const dx = charX - prevCharX;
    const dy = charY - prevCharY;
    const velocity = Math.hypot(dx, dy) / dt;

    // Active movement check: user holding WASD/arrows or character moving with momentum
    const isInputActive = keys.w || keys.a || keys.s || keys.d;
    isMoving = isInputActive || velocity > 18;

    // 3. Direction and Walking Animation Frame Selection
    // Moving Left: alternate between joel-walk1-left and joel-walk2-left
    // Moving Right: alternate between joel-walk1-right and joel-walk2-right
    if (keys.a && !keys.d) {
      facing = 'left';
    } else if (keys.d && !keys.a) {
      facing = 'right';
    } else if (dx < -0.3) {
      facing = 'left';
    } else if (dx > 0.3) {
      facing = 'right';
    }

    let targetCharSrc;
    if (isMoving) {
      // While walking: cancel any blown state immediately
      isBlownActive = false;
      blownTimer = 0;
      blownFrame = 1;
      blownFrameTimer = 0;
      idleStandingTime = 0;

      walkTimer += dt * 1000;
      if (walkTimer >= WALK_FRAME_INTERVAL) {
        walkTimer -= WALK_FRAME_INTERVAL;
        walkFrame = (walkFrame === 1) ? 2 : 1;
      }

      if (facing === 'left') {
        targetCharSrc = (walkFrame === 1) ? SPRITES.walk1Left : SPRITES.walk2Left;
      } else {
        targetCharSrc = (walkFrame === 1) ? SPRITES.walk1Right : SPRITES.walk2Right;
      }
    } else {
      // Character is standing, not walking
      walkTimer = 0;
      walkFrame = 1;

      // Check if it's time to trigger the wind-blown hair animation
      if (!isBlownActive) {
        idleStandingTime += dt * 1000;
        if (idleStandingTime >= nextBlownDelay) {
          isBlownActive = true;
          blownTimer = 0;
          blownFrame = 1;
          blownFrameTimer = 0;
          idleStandingTime = 0;
          nextBlownDelay = 500 + Math.random() * 2000; // <-- HAIR BLOW FREQUENCY: 4s to 8s between blows while standing

          // Also trigger grass-home wind blow in sync with this breeze
          triggerGrassBlown();

          // Trigger a subtle breezy wind swoosh if available
          if (window.Sketchbook && typeof window.Sketchbook.spawnWindSwoosh === 'function') {
            window.Sketchbook.spawnWindSwoosh(false);
          }
        }
      }

      if (isBlownActive) {
        blownTimer += dt * 1000;
        blownFrameTimer += dt * 1000;

        // Toggle back and forth between blown-direction and blown-direction2 every 0.5s
        if (blownFrameTimer >= BLOWN_FRAME_INTERVAL) {
          blownFrameTimer -= BLOWN_FRAME_INTERVAL;
          blownFrame = (blownFrame === 1) ? 2 : 1;
        }

        // Check if 3 seconds duration has finished
        if (blownTimer >= BLOWN_DURATION) {
          isBlownActive = false;
          blownTimer = 0;
          blownFrame = 1;
          blownFrameTimer = 0;
          idleStandingTime = 0;
          targetCharSrc = (facing === 'left') ? SPRITES.standLeft : SPRITES.standRight;
        } else {
          // Select blown sprite according to the direction Joel is facing
          if (facing === 'left') {
            targetCharSrc = (blownFrame === 1) ? SPRITES.blown1Left : SPRITES.blown2Left;
          } else {
            targetCharSrc = (blownFrame === 1) ? SPRITES.blown1Right : SPRITES.blown2Right;
          }
        }
      } else {
        // Normal standing pose
        targetCharSrc = (facing === 'left') ? SPRITES.standLeft : SPRITES.standRight;
      }
    }

    if (characterImg && currentCharacterSrc !== targetCharSrc) {
      currentCharacterSrc = targetCharSrc;
      characterImg.src = targetCharSrc;
    }

    // =========================================================================
    // GRASS-HOME WIND ANIMATION (Home Page & Portal Preview)
    // =========================================================================
    if (!isGrassBlownActive) {
      grassIdleTime += dt * 1000;
      if (grassIdleTime >= nextGrassBlownDelay) {
        triggerGrassBlown();
        nextGrassBlownDelay = 4000 + Math.random() * 4000; // <-- GRASS BLOW FREQUENCY: 4s to 8s
      }
    }

    if (isGrassBlownActive) {
      grassBlownTimer += dt * 1000;
      grassBlownFrameTimer += dt * 1000;

      // Toggle back and forth between grass-home-blown and grass-home-blown2 every 0.5s
      if (grassBlownFrameTimer >= BLOWN_FRAME_INTERVAL) {
        grassBlownFrameTimer -= BLOWN_FRAME_INTERVAL;
        grassBlownFrame = (grassBlownFrame === 1) ? 2 : 1;
      }

      // Return to normal grass-home after 3 seconds
      if (grassBlownTimer >= BLOWN_DURATION) {
        isGrassBlownActive = false;
        grassBlownTimer = 0;
        grassBlownFrame = 1;
        grassBlownFrameTimer = 0;
        grassIdleTime = 0;
        nextGrassBlownDelay = 4000 + Math.random() * 4000;
        setGrassSrc(SPRITES.grassHome);
      } else {
        const targetGrassSrc = (grassBlownFrame === 1) ? SPRITES.grassHomeBlown1 : SPRITES.grassHomeBlown2;
        setGrassSrc(targetGrassSrc);
      }
    }

    // 4. Camera Smooth Glide: Centering Character Vertically
    targetCameraY = charY - screenCenterY;
    targetCameraY = Math.max(0, Math.min(maxScroll, targetCameraY));
    cameraY += (targetCameraY - cameraY) * (1 - Math.exp(-12 * dt));

    window.scrollTo({
      top: cameraY,
      behavior: 'instant'
    });

    // 5. Position Character on Screen (Vertically Centered)
    const charScreenY = charY - cameraY;
    if (characterEl) {
      characterEl.style.left = `${charX}px`;
      characterEl.style.top = `${charScreenY}px`;
    }

    // 6. Dog Companion AI (Trailing Joel)
    let dogTargetX = facing === 'left' ? charX + 125 : charX - 125;
    let dogTargetY = charY + 35;

    if (boneTarget) {
      dogTargetX = boneTarget.x;
      dogTargetY = boneTarget.y;
    }

    const prevDogX = dogX;
    dogX += (dogTargetX - dogX) * (1 - Math.exp(-7 * dt));
    dogY += (dogTargetY - dogY) * (1 - Math.exp(-7 * dt));

    const dogDist = Math.hypot(dogTargetX - dogX, dogTargetY - dogY);
    isDogTrotting = dogDist > 8;

    // Dog Facing Direction
    if (charX > dogX + 10) {
      dogFacing = 'right';
    } else if (charX < dogX - 10) {
      dogFacing = 'left';
    }

    const targetDogSprite = dogFacing === 'left' ? SPRITES.dogLeft : SPRITES.dogRight;
    if (dogImg && dogImg.getAttribute('src') !== targetDogSprite) {
      dogImg.src = targetDogSprite;
    }

    if (dogEl) {
      const dogScreenY = dogY - cameraY;
      dogEl.style.left = `${dogX}px`;
      dogEl.style.top = `${dogScreenY}px`;

      const inner = dogEl.querySelector('.dog-actor-inner');
      if (inner) {
        if (isDogTrotting && !inner.classList.contains('dog-trotting')) {
          inner.classList.add('dog-trotting');
        } else if (!isDogTrotting && inner.classList.contains('dog-trotting')) {
          inner.classList.remove('dog-trotting');
        }
      }
    }

    // 7. Update Active Nav Item based on Character World Y
    updateActiveNav();

    requestAnimationFrame(updateLoop);
  }

  // Update Active Navigation Item
  function updateActiveNav() {
    let currentSectionId = 'home';
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (charY >= top - 120 && charY < top + height - 120) {
        currentSectionId = sec.id;
      }
    });

    navItems.forEach(item => {
      const link = item.querySelector('.nav-link');
      if (link && link.getAttribute('href') === `#${currentSectionId}`) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // DOG CLICK INTERACTION: DOG PROFILE POPUP
  // =========================================================================
  if (dogEl && dogProfileModal) {
    dogEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.Sketchbook) {
        window.Sketchbook.initAudio();
        window.Sketchbook.playDogBark();
      }

      // Position modal near dog
      const dogRect = dogEl.getBoundingClientRect();
      let modalX = dogRect.left + dogRect.width / 2;
      let modalY = dogRect.top - 120;

      // Keep inside screen
      modalX = Math.max(140, Math.min(window.innerWidth - 140, modalX));
      modalY = Math.max(140, Math.min(window.innerHeight - 140, modalY));

      dogProfileModal.style.left = `${modalX}px`;
      dogProfileModal.style.top = `${modalY}px`;
      dogProfileModal.classList.add('active');

      if (dogHideTimeout) clearTimeout(dogHideTimeout);
      dogHideTimeout = setTimeout(() => {
        dogProfileModal.classList.remove('active');
      }, 4200); // appears briefly then disappears again
    });

    const closeDogBtn = document.getElementById('dog-modal-close');
    if (closeDogBtn) {
      closeDogBtn.addEventListener('click', () => {
        dogProfileModal.classList.remove('active');
      });
    }
  }

  // =========================================================================
  // ABOUT PAGE INTERACTIVE ELEMENTS (POLAROID, CV & HOUSE)
  // =========================================================================
  const polaroidEl = document.getElementById('about-polaroid');
  const houseEl = document.getElementById('about-house');
  const cvEl = document.getElementById('about-cv');
  const polaroidBubble = document.getElementById('polaroid-bubble');
  const houseBubble = document.getElementById('house-bubble');
  const cvBubble = document.getElementById('cv-bubble');
  const polaroidTextEl = document.getElementById('polaroid-text');
  const houseTextEl = document.getElementById('house-text');
  const cvTextEl = document.getElementById('cv-text');
  // Note: cvModal is declared at top of file
  const cvModalClose = document.getElementById('cv-modal-close');
  const cvPreviewTrigger = document.getElementById('cv-preview-trigger');

  const TEXT_JOEL = "Hi, I’m Joel Jeremy Tanumihardja, I was born on May 6, 2006. I’m a Visual Communication Design student at UPH.";
  const TEXT_HOUSE = "I am originally from Bandung. I currently reside in Tangerang, Karawaci for my studies.";
  const TEXT_CV = "Check out my CV! Visual communication design student, typography, branding, and creative explorations.";

  let typeTimerJoel = null;
  let typeTimerHouse = null;
  let typeTimerCv = null;
  let closeTimerJoel = null;
  let closeTimerHouse = null;
  let closeTimerCv = null;

  function typeWriterEffect(targetEl, text, speed = 40, callback) {
    targetEl.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        targetEl.textContent += text.charAt(i);
        if (window.Sketchbook && i % 3 === 0) {
          window.Sketchbook.playPencilScratch();
        }
        i++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, speed);
    return interval;
  }

  function openCvModal() {
    if (cvModal) {
      isCvOpen = true;
      targetCharX = charX;
      targetCharY = charY;
      targetCameraY = cameraY;
      keys.w = false;
      keys.a = false;
      keys.s = false;
      keys.d = false;
      isMoving = false;

      cvModal.classList.add('active');
      document.body.classList.add('modal-scroll-lock');
      document.documentElement.classList.add('modal-scroll-lock');
      if (window.Sketchbook) {
        window.Sketchbook.initAudio();
        window.Sketchbook.playPaperRustle();
      }
    }
  }

  function closeCvModal() {
    if (cvModal) {
      isCvOpen = false;
      cvModal.classList.remove('active');
      document.body.classList.remove('modal-scroll-lock');
      document.documentElement.classList.remove('modal-scroll-lock');
      targetCharX = charX;
      targetCharY = charY;
      targetCameraY = cameraY;
      lastTimestamp = performance.now();
    }
  }

  if (polaroidEl && polaroidBubble && polaroidTextEl) {
    polaroidEl.addEventListener('click', () => {
      if (window.Sketchbook) {
        window.Sketchbook.initAudio();
        window.Sketchbook.playPaperRustle();
      }

      if (closeTimerJoel) clearTimeout(closeTimerJoel);
      if (typeTimerJoel) clearInterval(typeTimerJoel);

      polaroidBubble.classList.add('active');
      typeTimerJoel = typeWriterEffect(polaroidTextEl, TEXT_JOEL, 35, () => {
        closeTimerJoel = setTimeout(() => {
          polaroidBubble.classList.remove('active');
        }, 7000);
      });
    });
  }

  if (cvEl && cvBubble && cvTextEl) {
    cvEl.addEventListener('click', () => {
      if (window.Sketchbook) {
        window.Sketchbook.initAudio();
        window.Sketchbook.playPaperRustle();
      }

      if (closeTimerCv) clearTimeout(closeTimerCv);
      if (typeTimerCv) clearInterval(typeTimerCv);

      cvBubble.classList.add('active');
      typeTimerCv = typeWriterEffect(cvTextEl, TEXT_CV, 35, () => {
        closeTimerCv = setTimeout(() => {
          cvBubble.classList.remove('active');
        }, 9000);
      });

      // Also open CV profile modal
      openCvModal();
    });
  }

  if (cvPreviewTrigger) {
    cvPreviewTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openCvModal();
    });
  }

  if (cvModalClose) {
    cvModalClose.addEventListener('click', closeCvModal);
  }

  const cvContactBtn = document.getElementById('cv-contact-btn');
  if (cvContactBtn) {
    cvContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeCvModal();
      if (window.Sketchbook) {
        window.Sketchbook.initAudio();
        window.Sketchbook.playPaperRustle();
      }
      setTimeout(() => {
        if (typeof window.glideToSection === 'function') {
          window.glideToSection('contact');
        } else {
          const contactSec = document.getElementById('contact');
          if (contactSec) {
            contactSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 50);
    });
  }

  window.closeCvModal = closeCvModal;

  if (cvModal) {
    const backdrop = cvModal.querySelector('.cv-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeCvModal);
    }
    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) closeCvModal();
    });

    // Intercept wheel events on modal:
    // 1. Stop propagation so window/character never receives it.
    // 2. Allow .cv-modal-scroll to scroll.
    // 3. If mouse is over card (outside scroll box), route wheel delta to scroll box.
    // 4. Prevent scroll chaining when at top or bottom boundaries.
    cvModal.addEventListener('wheel', (e) => {
      e.stopPropagation();

      const scrollEl = cvModal.querySelector('.cv-modal-scroll');
      if (!scrollEl) return;

      if (scrollEl.contains(e.target)) {
        const isAtTop = scrollEl.scrollTop <= 0 && e.deltaY < 0;
        const isAtBottom = Math.ceil(scrollEl.scrollTop + scrollEl.clientHeight) >= scrollEl.scrollHeight && e.deltaY > 0;
        if (isAtTop || isAtBottom) {
          e.preventDefault();
        }
      } else {
        scrollEl.scrollTop += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });

    // Touch event isolation on modal
    let modalTouchStartY = null;
    cvModal.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      if (e.touches && e.touches[0]) {
        modalTouchStartY = e.touches[0].clientY;
      }
    }, { passive: false });

    cvModal.addEventListener('touchmove', (e) => {
      e.stopPropagation();
      const scrollEl = cvModal.querySelector('.cv-modal-scroll');
      if (!scrollEl || !scrollEl.contains(e.target)) {
        e.preventDefault();
        return;
      }
      if (modalTouchStartY !== null && e.touches && e.touches[0]) {
        const delta = modalTouchStartY - e.touches[0].clientY;
        const isAtTop = scrollEl.scrollTop <= 0 && delta < 0;
        const isAtBottom = Math.ceil(scrollEl.scrollTop + scrollEl.clientHeight) >= scrollEl.scrollHeight && delta > 0;
        if (isAtTop || isAtBottom) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    cvModal.addEventListener('touchend', (e) => {
      e.stopPropagation();
      modalTouchStartY = null;
    }, { passive: false });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCvModal();
    }
  });

  if (houseEl && houseBubble && houseTextEl) {
    houseEl.addEventListener('click', () => {
      if (window.Sketchbook) {
        window.Sketchbook.initAudio();
        window.Sketchbook.playPaperRustle();
      }

      if (closeTimerHouse) clearTimeout(closeTimerHouse);
      if (typeTimerHouse) clearInterval(typeTimerHouse);

      houseBubble.classList.add('active');
      typeTimerHouse = typeWriterEffect(houseTextEl, TEXT_HOUSE, 35, () => {
        closeTimerHouse = setTimeout(() => {
          houseBubble.classList.remove('active');
        }, 7000);
      });
    });
  }

  // Start loop after page load and orientation setup
  function startLoop() {
    initPositions();
    requestAnimationFrame(updateLoop);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startLoop();
  } else {
    window.addEventListener('DOMContentLoaded', startLoop);
    window.addEventListener('load', startLoop);
  }

  window.addEventListener('resize', () => {
    worldHeight = document.documentElement.scrollHeight || 6000;
  });

  window.addEventListener('sketchbookOpened', () => {
    initPositions();

    // Reset wind-blown timers so both hair and grass blow shortly after entering the portfolio!
    idleStandingTime = 0;
    isBlownActive = false;
    blownTimer = 0;
    blownFrame = 1;
    blownFrameTimer = 0;
    nextBlownDelay = INITIAL_ENTER_BLOWN_DELAY;

    grassIdleTime = 0;
    isGrassBlownActive = false;
    grassBlownTimer = 0;
    grassBlownFrame = 1;
    grassBlownFrameTimer = 0;
    nextGrassBlownDelay = INITIAL_ENTER_BLOWN_DELAY;
    setGrassSrc(SPRITES.grassHome);
  });
})();
