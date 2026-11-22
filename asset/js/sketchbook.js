/**
 * Joel Jeremy Tanumihardja - Living Sketchbook Portfolio
 * sketchbook.js: Audio Synthesis, Canvas Cursor Scribble Trail, Unfolding Cover, Modal & Sandbox
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (No external audio files needed!)
  // =========================================================================
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play synthesized paper rustle
  function playPaperRustle() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.35;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.Q.setValueAtTime(2, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Play synthesized pencil scratch
  let lastScratchTime = 0;
  function playPencilScratch() {
    if (!soundEnabled || !audioCtx) return;
    const now = performance.now();
    if (now - lastScratchTime < 180) return; // throttle
    lastScratchTime = now;
    try {
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  // Play synthesized cute puppy yip/bark
  function playDogBark() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      
      const t = audioCtx.currentTime;
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.16);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch (e) {}
  }

  // Play synthesized rubber eraser wipe sound
  function playEraserSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.25;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  // Play synthesized magical chime for Bringing Doodles to Life
  function playBringToLifeSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      // Ascending magical arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        const startT = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, startT);

        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.exponentialRampToValueAtTime(0.18, startT + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startT);
        osc.stop(startT + 0.36);
      });

      // Accompanied by a quick paper rustle swoosh
      playPaperRustle();
    } catch (e) {}
  }

  // Play synthesized cute squeak/chirp when clicking a living doodle
  function playDoodleChirp() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.exponentialRampToValueAtTime(1150, t + 0.07);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.16);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch (e) {}
  }

  // Sound toggle button listener
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      soundBtn.innerHTML = soundEnabled
        ? '<svg class="sound-icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> <span class="sound-btn-text">Sound: ON</span>'
        : '<svg class="sound-icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> <span class="sound-btn-text">Sound: OFF</span>';
    });
  }

  // =========================================================================
  // 1B. LOOPING BACKGROUND MUSIC SYSTEM (asset/mp3/background-music.mp3)
  // =========================================================================
  const bgMusic = document.getElementById('bg-music');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const MUSIC_STORAGE_KEY = 'joel_portfolio_music_enabled';

  const TARGET_MUSIC_VOLUME = 0.35; // Gentle, comfortable ambient level
  let musicEnabled = true;
  try {
    musicEnabled = localStorage.getItem(MUSIC_STORAGE_KEY) !== 'false';
  } catch (e) {}

  let isMusicPlaying = false;
  let musicFadeInterval = null;
  let hasInteractedForAudio = false;

  function updateMusicUI() {
    if (!musicToggleBtn) return;
    if (musicEnabled && isMusicPlaying) {
      musicToggleBtn.classList.add('is-playing');
      musicToggleBtn.classList.remove('is-muted');
      musicToggleBtn.setAttribute('aria-pressed', 'true');
      musicToggleBtn.innerHTML = `
        <svg class="music-icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        <span class="music-btn-text">Music: ON</span>
      `;
    } else {
      musicToggleBtn.classList.remove('is-playing');
      musicToggleBtn.classList.add('is-muted');
      musicToggleBtn.setAttribute('aria-pressed', 'false');
      musicToggleBtn.innerHTML = `
        <svg class="music-icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
          <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
        <span class="music-btn-text">Music: OFF</span>
      `;
    }
  }

  function fadeMusicIn(targetVol = TARGET_MUSIC_VOLUME, durationMs = 1200) {
    if (!bgMusic) return;
    clearInterval(musicFadeInterval);
    const steps = 20;
    const stepTime = Math.max(10, Math.floor(durationMs / steps));
    const volStep = targetVol / steps;
    bgMusic.volume = 0;

    musicFadeInterval = setInterval(() => {
      if (!bgMusic) {
        clearInterval(musicFadeInterval);
        return;
      }
      if (bgMusic.volume + volStep >= targetVol) {
        bgMusic.volume = targetVol;
        clearInterval(musicFadeInterval);
      } else {
        bgMusic.volume = Math.min(targetVol, bgMusic.volume + volStep);
      }
    }, stepTime);
  }

  function fadeMusicOut(durationMs = 400, callback) {
    if (!bgMusic) return;
    clearInterval(musicFadeInterval);
    const startVol = bgMusic.volume;
    if (startVol <= 0.02) {
      bgMusic.volume = 0;
      bgMusic.pause();
      if (callback) callback();
      return;
    }
    const steps = 15;
    const stepTime = Math.max(10, Math.floor(durationMs / steps));
    const volStep = startVol / steps;

    musicFadeInterval = setInterval(() => {
      if (!bgMusic) {
        clearInterval(musicFadeInterval);
        return;
      }
      if (bgMusic.volume - volStep <= 0.01) {
        bgMusic.volume = 0;
        bgMusic.pause();
        clearInterval(musicFadeInterval);
        if (callback) callback();
      } else {
        bgMusic.volume = Math.max(0, bgMusic.volume - volStep);
      }
    }, stepTime);
  }

  function startBackgroundMusic() {
    if (!musicEnabled || !bgMusic) return;
    initAudio();

    bgMusic.loop = true;

    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isMusicPlaying = true;
          fadeMusicIn();
          updateMusicUI();
        })
        .catch(() => {
          // Browser prevented autoplay prior to user gesture
          isMusicPlaying = false;
          updateMusicUI();
          attachFirstInteractionAudioListener();
        });
    }
  }

  function pauseBackgroundMusic() {
    if (!bgMusic) return;
    fadeMusicOut(400, () => {
      isMusicPlaying = false;
      updateMusicUI();
    });
  }

  function toggleBackgroundMusic() {
    initAudio();
    if (musicEnabled && isMusicPlaying) {
      musicEnabled = false;
      try { localStorage.setItem(MUSIC_STORAGE_KEY, 'false'); } catch (e) {}
      pauseBackgroundMusic();
      playPaperRustle();
    } else {
      musicEnabled = true;
      try { localStorage.setItem(MUSIC_STORAGE_KEY, 'true'); } catch (e) {}
      startBackgroundMusic();
      playPaperRustle();
    }
  }

  function attachFirstInteractionAudioListener() {
    if (hasInteractedForAudio) return;

    const onFirstUserAction = () => {
      if (hasInteractedForAudio) return;
      hasInteractedForAudio = true;
      initAudio();
      if (musicEnabled && bgMusic && bgMusic.paused) {
        startBackgroundMusic();
      }
      window.removeEventListener('pointerdown', onFirstUserAction);
      window.removeEventListener('keydown', onFirstUserAction);
      window.removeEventListener('touchstart', onFirstUserAction);
    };

    window.addEventListener('pointerdown', onFirstUserAction, { passive: true });
    window.addEventListener('keydown', onFirstUserAction, { passive: true });
    window.addEventListener('touchstart', onFirstUserAction, { passive: true });
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBackgroundMusic();
    });
  }

  // =========================================================================
  // 2. ACCUMULATING CURSOR PENCIL-SCRIBBLE TRAIL & FLOATING ERASER
  // =========================================================================
  const trailCanvas = document.getElementById('cursor-trail-canvas');
  let trailCtx = null;
  let lastMouseX = null;
  let lastMouseY = null;

  function initTrailCanvas() {
    if (!trailCanvas) return;
    trailCtx = trailCanvas.getContext('2d');
    resizeTrailCanvas();
    window.addEventListener('resize', resizeTrailCanvas);
  }

  function resizeTrailCanvas() {
    if (!trailCanvas || !trailCtx) return;
    const dpr = window.devicePixelRatio || 1;
    // Save existing image content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = trailCanvas.width;
    tempCanvas.height = trailCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(trailCanvas, 0, 0);

    trailCanvas.width = window.innerWidth * dpr;
    trailCanvas.height = window.innerHeight * dpr;
    trailCtx.scale(dpr, dpr);
    trailCtx.drawImage(tempCanvas, 0, 0, window.innerWidth, window.innerHeight);
  }

  function addPencilStroke(x, y) {
    if (!trailCtx) return;
    if (lastMouseX === null || lastMouseY === null) {
      lastMouseX = x;
      lastMouseY = y;
      return;
    }

    const dist = Math.hypot(x - lastMouseX, y - lastMouseY);
    if (dist < 2) return; // minimal movement

    trailCtx.save();
    trailCtx.strokeStyle = 'rgba(32, 30, 28, 0.6)';
    trailCtx.lineWidth = 0.8 + Math.random() * 0.4;
    trailCtx.lineCap = 'round';
    trailCtx.lineJoin = 'round';

    // Slightly imperfect pencil jitter
    const jitterX = (Math.random() - 0.5) * 0.8;
    const jitterY = (Math.random() - 0.5) * 0.8;

    trailCtx.beginPath();
    trailCtx.moveTo(lastMouseX, lastMouseY);
    trailCtx.lineTo(x + jitterX, y + jitterY);
    trailCtx.stroke();
    trailCtx.restore();

    playPencilScratch();

    lastMouseX = x;
    lastMouseY = y;
  }

  window.addEventListener('pointermove', (e) => {
    // Only draw after sketchbook is opened
    const loader = document.getElementById('unfold-loader');
    if (loader && !loader.classList.contains('opened')) return;
    addPencilStroke(e.clientX, e.clientY);
  });

  window.addEventListener('pointerdown', (e) => {
    initAudio();
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener('pointerup', () => {
    lastMouseX = null;
    lastMouseY = null;
  });

  // Eraser Button
  const eraserBtn = document.getElementById('floating-eraser-btn');
  if (eraserBtn) {
    eraserBtn.addEventListener('click', () => {
      initAudio();
      playEraserSound();
      if (trailCtx && trailCanvas) {
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      }
      eraserBtn.style.transform = 'scale(0.85) rotate(-15deg)';
      setTimeout(() => {
        eraserBtn.style.transform = '';
      }, 200);
    });
  }

  // =========================================================================
  // 3. UNFOLDING SKETCHBOOK LOADING PAGE (Swipe or Click to Unfold)
  // =========================================================================
  const unfoldLoader = document.getElementById('unfold-loader');
  const sketchbookCover = document.querySelector('.sketchbook-cover');
  const unfoldPrompt = document.querySelector('.unfold-prompt');
  let isUnfolded = false;
  let dragStartX = null;

  function triggerUnfold() {
    if (isUnfolded) return;
    isUnfolded = true;
    initAudio();
    playPaperRustle();

    // Start looping background music as the sketchbook opens
    if (musicEnabled && bgMusic && bgMusic.paused) {
      startBackgroundMusic();
    }

    // Trigger gentle breeze as sketchbook opens
    setTimeout(() => {
      if (typeof spawnWindSwoosh === 'function') spawnWindSwoosh();
    }, 1800);

    if (unfoldLoader) {
      unfoldLoader.classList.add('unfolding');
      setTimeout(() => {
        unfoldLoader.classList.add('opened');
        // Announce readiness to character script
        window.dispatchEvent(new CustomEvent('sketchbookOpened'));
      }, 1200);
    }
  }

  if (unfoldPrompt) {
    unfoldPrompt.addEventListener('click', triggerUnfold);
  }

  if (sketchbookCover) {
    sketchbookCover.addEventListener('pointerdown', (e) => {
      dragStartX = e.clientX;
    });

    sketchbookCover.addEventListener('pointerup', (e) => {
      if (dragStartX !== null) {
        const deltaX = dragStartX - e.clientX;
        if (deltaX > 40 || e.clientX - dragStartX > 40) {
          triggerUnfold();
        }
      }
      dragStartX = null;
    });

    sketchbookCover.addEventListener('click', triggerUnfold);
  }

  // Auto fallback timeout if user is inactive
  window.addEventListener('keydown', (e) => {
    if (!isUnfolded && (e.key === ' ' || e.key === 'Enter')) {
      triggerUnfold();
    }
  });

  // =========================================================================
  // 4. PROJECTS CAROUSEL & PROJECT DETAILS MODAL
  // =========================================================================
  const projectsData = [
    {
      id: 1,
      title: "Fundamental Astronomy",
      category: "Book Design & Typography",
      year: "2024",
      client: "Academic & Self-Initiated Publication",
      image: "asset/image/projects-fundamentalastronomy.png",
      slides: [
        "asset/image/projects-fundamentalastronomy.png",
        "asset/image/projects-fundamentalastronomy1.png",
        "asset/image/projects-fundamentalastronomy2.png",
        "asset/image/projects-fundamentalastronomy3.mp4",
        "asset/image/projects-fundamentalastronomy4.mp4",
        "asset/image/projects-fundamentalastronomy5.png",
        "asset/image/projects-fundamentalastronomy6.png",
        "asset/image/projects-fundamentalastronomy7.png"
      ],
      description: "A conceptual <strong>editorial book</strong> exploring <strong>celestial mechanics</strong>, <strong>astrophysics</strong>, and <strong>monochrome typography</strong> in deep space. Designed with stark monochromatic contrast, orbital geometry, and bespoke <strong>editorial grid systems</strong> created by <strong>Joel Jeremy</strong>.",
      tools: ["Adobe InDesign", "Photoshop", "Editorial Typography", "Grid Systems", "Print Finishing"]
    },
    {
      id: 2,
      title: "Tendangan Bebas",
      category: "Film Poster & Visual Identity",
      year: "2024",
      client: "Samsara TV & Jakarta Film Week",
      image: "asset/image/projects-tendanganbebas.png",
      slides: [
        "asset/image/projects-tendanganbebas.png",
        "asset/image/projects-tendanganbebas1.png",
        "asset/image/projects-tendanganbebas2.png",
        "asset/image/projects-tendanganbebas3.png",
        "asset/image/projects-tendanganbebas4.png"
      ],
      description: "Official <strong>key art and graphic campaign</strong> for the film screening <em>'Tendangan Bebas'</em> featured at <a href=\"https://www.instagram.com/jakartafilmweek?mdxt=MWVoNHRsaDl5OWRvYQ==\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>Jakarta Film Week</strong></a>. Features energetic <strong>hand-drawn lettering</strong>, vibrant <strong>street graffiti aesthetics</strong>, urban Jakarta architecture, and gritty sports imagery for <strong>Samsara TV</strong>.",
      tools: ["Adobe Illustrator", "Procreate", "Hand Lettering", "Key Art Direction", "Film Poster Design"]
    },
    {
      id: 3,
      title: "Faculty of Design UPH",
      category: "Rebranding & Visual Identity",
      year: "2026",
      client: "Faculty of Design, Universitas Pelita Harapan",
      image: "asset/image/projects-fduph.png",
      slides: [
        "asset/image/projects-fduph.png",
        "asset/image/projects-fduph1.mp4",
        "asset/image/projects-fduph2.png",
        "asset/image/projects-fduph3.png",
        "asset/image/projects-fduph4.mp4",
        "asset/image/projects-fduph5.png",
        "asset/image/projects-fduph6.png",
        "asset/image/projects-fduph7.png",
        "asset/image/projects-fduph8.png",
        "asset/image/projects-fduph-9.mp4"
      ],
      description: "Official <strong>rebranding, merchandise, and visual identity system</strong> for <a href=\"https://www.instagram.com/fd.uph?vrfl=ancxcGh6YTRocjdr\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>Faculty of Design UPH (@fd.uph)</strong></a> at <strong>Universitas Pelita Harapan</strong>. Developed comprehensive visual branding and extended the identity across academic programs: <strong>Architecture</strong>, <strong>Professional Architect Education (PPAr)</strong>, <strong>Visual Communication Design (VCD)</strong>, <strong>Interior Design</strong>, and <strong>Product Design</strong>.",
      tools: ["Visual Identity", "Brand Guidelines", "Merchandise & Apparel", "Motion Design", "Typography System"]
    },
    {
      id: 4,
      title: "Sacred Bali Tourism",
      category: "Cultural Tourism & Editorial Poster",
      year: "2024",
      client: "Panorama JTB / World Tourism Exhibition",
      image: "asset/image/projects-balitourism.png",
      slides: [
        "asset/image/projects-balitourism.png",
        "asset/image/projects-balitourism2.jpg"
      ],
      description: "A multi-layered <strong>cultural tourism poster</strong> celebrating <strong>Sacred Bali</strong> for international exhibitions. Features rich traditional <strong>Balinese Barong mythology</strong>, gamelan musicians, tropical botanical foliage, and meticulous <strong>hand-rendered line art</strong>.",
      tools: ["Digital Illustration", "Cultural Research", "Color Layering", "Post-Processing"]
    },
    {
      id: 5,
      title: "HotPost Creative Studio",
      category: "Audio Branding & Apparel",
      year: "2024",
      client: "HotPost Studio",
      image: "asset/image/projects-hotpost.png",
      slides: [
        "asset/image/projects-hotpost.png",
        "asset/image/projects-hotpost-01.png",
        "asset/image/projects-hotpost-02.png"
      ],
      description: "<strong>Visual identity system</strong> and studio sweatshirt apparel crafted for <strong>audio engineers</strong> and <strong>digital creators</strong>. Features a dynamic <strong>flame soundwave equalizer motif</strong> set against studio console mixing aesthetics and custom streetwear lookbook.",
      tools: ["Apparel Design", "Soundwave Vector Art", "Identity Systems", "Lookbook Direction"]
    }
  ];

  let currentProjectIndex = 0;
  let currentSlideIndex = 0;
  const projectCards = document.querySelectorAll('.project-card');
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalMediaStage = document.getElementById('modal-media-stage');
  const modalSlidePrev = document.getElementById('modal-slide-prev');
  const modalSlideNext = document.getElementById('modal-slide-next');
  const modalSlideCounter = document.getElementById('modal-slide-counter');
  const modalSlideThumbs = document.getElementById('modal-slide-thumbs');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalDesc = document.getElementById('modal-desc');
  const modalBadge = document.getElementById('modal-badge');
  const modalTools = document.getElementById('modal-tools');
  const modalPrev = document.getElementById('modal-prev-btn');
  const modalNext = document.getElementById('modal-next-btn');
  const modalContactBtn = document.getElementById('modal-contact-btn');

  function renderModalSlide(slideIdx, direction = null) {
    const project = projectsData[currentProjectIndex];
    if (!project || !modalMediaStage) return;

    const slides = project.slides && project.slides.length > 0 ? project.slides : [project.image];
    const targetIdx = (slideIdx + slides.length) % slides.length;

    // Automatically detect direction if not provided
    if (direction === null && targetIdx !== currentSlideIndex) {
      direction = targetIdx > currentSlideIndex ? 'next' : 'prev';
    }

    currentSlideIndex = targetIdx;
    const mediaSrc = slides[currentSlideIndex];
    const isVideo = mediaSrc.toLowerCase().endsWith('.mp4') || mediaSrc.toLowerCase().endsWith('.webm');

    let newEl;
    if (isVideo) {
      newEl = document.createElement('video');
      newEl.src = mediaSrc;
      newEl.className = 'modal-preview-video';
      newEl.autoplay = true;
      newEl.loop = true;
      newEl.muted = true;
      newEl.playsInline = true;
      newEl.controls = true;
    } else {
      newEl = document.createElement('img');
      newEl.src = mediaSrc;
      newEl.alt = `${project.title} - Slide ${currentSlideIndex + 1}`;
      newEl.className = 'modal-preview-img';
    }

    const currentEl = modalMediaStage.querySelector('.modal-preview-img, .modal-preview-video');

    if (currentEl && direction) {
      // Smooth slide transition animation
      let inClass = 'modal-fade-in';
      let outClass = 'modal-fade-out';
      if (direction === 'next') {
        inClass = 'modal-slide-in-next';
        outClass = 'modal-slide-out-next';
      } else if (direction === 'prev') {
        inClass = 'modal-slide-in-prev';
        outClass = 'modal-slide-out-prev';
      }

      currentEl.className = `${currentEl.className.replace(/modal-slide-[^\s]+|modal-fade-[^\s]+/g, '')} ${outClass}`;
      if (currentEl.tagName === 'VIDEO') {
        try { currentEl.pause(); } catch (err) {}
      }

      newEl.classList.add(inClass);
      modalMediaStage.appendChild(newEl);

      setTimeout(() => {
        if (currentEl && currentEl.parentNode === modalMediaStage) {
          currentEl.remove();
        }
      }, 350);
    } else {
      modalMediaStage.innerHTML = '';
      modalMediaStage.appendChild(newEl);
    }

    if (modalSlideCounter) {
      modalSlideCounter.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
      modalSlideCounter.style.display = slides.length > 1 ? 'block' : 'none';
    }

    if (modalSlidePrev && modalSlideNext) {
      const showArrows = slides.length > 1;
      modalSlidePrev.style.display = showArrows ? 'flex' : 'none';
      modalSlideNext.style.display = showArrows ? 'flex' : 'none';
    }

    // Update active thumbnail
    if (modalSlideThumbs) {
      const thumbs = modalSlideThumbs.querySelectorAll('.slide-thumb-dot');
      thumbs.forEach((thumb, idx) => {
        if (idx === currentSlideIndex) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });
    }
  }

  function openProjectModal(index) {
    currentProjectIndex = (index + projectsData.length) % projectsData.length;
    const project = projectsData[currentProjectIndex];
    if (!project || !projectModal) return;

    currentSlideIndex = 0;
    const slides = project.slides && project.slides.length > 0 ? project.slides : [project.image];

    // Build thumbnail dots
    if (modalSlideThumbs) {
      modalSlideThumbs.innerHTML = '';
      if (slides.length > 1) {
        slides.forEach((src, idx) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = `slide-thumb-dot ${idx === 0 ? 'active' : ''}`;
          const isVid = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');
          dot.title = isVid ? `Slide ${idx + 1} (Video)` : `Slide ${idx + 1}`;
          dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
          dot.addEventListener('click', () => {
            const dir = idx > currentSlideIndex ? 'next' : (idx < currentSlideIndex ? 'prev' : 'fade');
            renderModalSlide(idx, dir);
            initAudio();
            playPaperRustle();
          });
          modalSlideThumbs.appendChild(dot);
        });
      }
    }

    renderModalSlide(0);

    modalTitle.textContent = project.title;
    modalBadge.textContent = project.category;
    modalMeta.textContent = `${project.year} • ${project.client}`;
    modalDesc.innerHTML = project.description;

    modalTools.innerHTML = '';
    project.tools.forEach(tool => {
      const tag = document.createElement('span');
      tag.className = 'tool-tag';
      tag.textContent = tool;
      modalTools.appendChild(tag);
    });

    projectModal.classList.add('active');
    document.body.classList.add('modal-scroll-lock');
    initAudio();
    playPaperRustle();
  }

  function closeProjectModal() {
    if (projectModal) {
      projectModal.classList.remove('active');
      document.body.classList.remove('modal-scroll-lock');
      // Stop any running video inside modal
      if (modalMediaStage) {
        const v = modalMediaStage.querySelector('video');
        if (v) v.pause();
      }
    }
  }

  if (modalSlidePrev) {
    modalSlidePrev.addEventListener('click', () => {
      const project = projectsData[currentProjectIndex];
      const slides = project.slides || [project.image];
      renderModalSlide(currentSlideIndex - 1, 'prev');
      initAudio();
      playPaperRustle();
    });
  }

  if (modalSlideNext) {
    modalSlideNext.addEventListener('click', () => {
      const project = projectsData[currentProjectIndex];
      const slides = project.slides || [project.image];
      renderModalSlide(currentSlideIndex + 1, 'next');
      initAudio();
      playPaperRustle();
    });
  }

  if (modalContactBtn) {
    modalContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeProjectModal();
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

  const cvContactBtn = document.getElementById('cv-contact-btn');
  if (cvContactBtn) {
    cvContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.closeCvModal === 'function') {
        window.closeCvModal();
      } else {
        const cvModal = document.getElementById('cv-profile-modal');
        if (cvModal) {
          cvModal.classList.remove('active');
          document.body.classList.remove('modal-scroll-lock');
          document.documentElement.classList.remove('modal-scroll-lock');
        }
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

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalPrev) modalPrev.addEventListener('click', () => openProjectModal(currentProjectIndex - 1));
  if (modalNext) modalNext.addEventListener('click', () => openProjectModal(currentProjectIndex + 1));

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (projectModal && projectModal.classList.contains('active')) {
      if (e.key === 'Escape') closeProjectModal();
      if (e.key === 'ArrowLeft') {
        const project = projectsData[currentProjectIndex];
        const slides = project.slides || [project.image];
        if (slides.length > 1) {
          renderModalSlide(currentSlideIndex - 1, 'prev');
        } else {
          openProjectModal(currentProjectIndex - 1);
        }
      }
      if (e.key === 'ArrowRight') {
        const project = projectsData[currentProjectIndex];
        const slides = project.slides || [project.image];
        if (slides.length > 1) {
          renderModalSlide(currentSlideIndex + 1, 'next');
        } else {
          openProjectModal(currentProjectIndex + 1);
        }
      }
    }
  });

  // Carousel Buttons on Page
  const prevCarouselBtn = document.getElementById('projects-prev-btn');
  const nextCarouselBtn = document.getElementById('projects-next-btn');
  let carouselOffset = 0;
  let isCarouselSliding = false;

  function applyCarouselData() {
    projectCards.forEach((card, i) => {
      const actualIndex = (i + carouselOffset) % projectsData.length;
      const proj = projectsData[(actualIndex + projectsData.length) % projectsData.length];
      
      // Store accurate project index directly on the card dataset!
      card.dataset.projectIndex = actualIndex;

      const img = card.querySelector('.project-thumb');
      const label = card.querySelector('.project-label');
      const tag = card.querySelector('.project-tag');
      if (img && proj) {
        img.src = proj.image;
        img.alt = proj.title;
      }
      if (label && proj) label.textContent = proj.title;
      if (tag && proj) tag.textContent = proj.category;
      card.setAttribute('aria-label', `${proj.title} — ${proj.category}`);
    });
  }

  function updateCarousel(direction = null) {
    if (!direction) {
      applyCarouselData();
      return;
    }

    if (isCarouselSliding) return;
    isCarouselSliding = true;

    const outClass = direction === 'next' ? 'slide-out-next' : 'slide-out-prev';
    const inClass = direction === 'next' ? 'slide-in-next' : 'slide-in-prev';

    projectCards.forEach(card => card.classList.add(outClass));

    setTimeout(() => {
      applyCarouselData();
      projectCards.forEach(card => {
        card.classList.remove(outClass);
        card.classList.add(inClass);
      });

      requestAnimationFrame(() => {
        setTimeout(() => {
          projectCards.forEach(card => card.classList.remove(inClass));
          isCarouselSliding = false;
        }, 220);
      });
    }, 140);
  }

  // Preload all project cover images so transitions are silky-smooth
  projectsData.forEach(p => {
    const im = new Image();
    im.src = p.image;
  });

  // Card click listeners: ALWAYS read card.dataset.projectIndex!
  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const pIdx = parseInt(card.dataset.projectIndex, 10);
      openProjectModal(isNaN(pIdx) ? 0 : pIdx);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const pIdx = parseInt(card.dataset.projectIndex, 10);
        openProjectModal(isNaN(pIdx) ? 0 : pIdx);
      }
    });
  });

  if (prevCarouselBtn) {
    prevCarouselBtn.addEventListener('click', () => {
      if (isCarouselSliding) return;
      carouselOffset = (carouselOffset - 1 + projectsData.length) % projectsData.length;
      updateCarousel('prev');
      initAudio();
      playPaperRustle();
    });
  }

  if (nextCarouselBtn) {
    nextCarouselBtn.addEventListener('click', () => {
      if (isCarouselSliding) return;
      carouselOffset = (carouselOffset + 1) % projectsData.length;
      updateCarousel('next');
      initAudio();
      playPaperRustle();
    });
  }

  // Initial carousel setup
  applyCarouselData();

  // =========================================================================
  // 5. INTERACTIVE SECTION: DOODLE SANDBOX & LIVING DOODLES
  // =========================================================================
  const doodleStudioCard = document.getElementById('doodle-studio-card');

  // --- DOODLE DRAWING ENGINE ---
  const doodleCanvas = document.getElementById('doodle-draw-canvas');
  const doodleCtx = doodleCanvas ? doodleCanvas.getContext('2d', { willReadFrequently: true }) : null;
  const doodleHint = document.getElementById('doodle-canvas-hint');
  const toolPenBtn = document.getElementById('tool-pen');
  const toolEraserBtn = document.getElementById('tool-eraser');
  const toolUndoBtn = document.getElementById('tool-undo');
  const toolClearBtn = document.getElementById('tool-clear');
  const sizeBtns = document.querySelectorAll('.size-btn');
  const colorBtns = document.querySelectorAll('.color-btn');
  const bringToLifeBtn = document.getElementById('bring-to-life-btn');
  const storeDoodleBtn = document.getElementById('store-doodle-btn');
  const openArchiveBtn = document.getElementById('open-archive-btn');
  const archiveCountBadge = document.getElementById('archive-count-badge');
  const doodleEditingBanner = document.getElementById('doodle-editing-banner');
  const editingPetNameEl = document.getElementById('editing-pet-name');
  const saveEditPetBtn = document.getElementById('save-edit-pet-btn');
  const cancelEditPetBtn = document.getElementById('cancel-edit-pet-btn');
  const wandererCountEl = document.getElementById('wanderer-count');
  const clearWanderersBtn = document.getElementById('clear-wanderers-btn');
  const livingDoodlesLayer = document.getElementById('living-doodles-layer');

  // Pet Archive & Redraw State
  let activeEditingPetId = null;

  // Drawing state
  let currentTool = 'pen'; // 'pen' | 'eraser'
  let currentSize = 3;
  let currentColor = '#1e1d1b';
  let isDrawing = false;
  let strokePoints = [];
  let undoStack = [];
  const MAX_UNDO = 25;
  let hasDrawn = false;

  // Responsive High-DPI Canvas Sizing
  function resizeDoodleCanvas() {
    if (!doodleCanvas || !doodleCtx) return;
    const rect = doodleCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(rect.width);
    const targetH = Math.round(rect.height);

    if (doodleCanvas.width !== targetW * dpr || doodleCanvas.height !== targetH * dpr) {
      // Preserve existing sketch content during resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = doodleCanvas.width;
      tempCanvas.height = doodleCanvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (doodleCanvas.width > 0 && doodleCanvas.height > 0) {
        tempCtx.drawImage(doodleCanvas, 0, 0);
      }

      doodleCanvas.width = targetW * dpr;
      doodleCanvas.height = targetH * dpr;
      doodleCtx.scale(dpr, dpr);
      doodleCtx.lineCap = 'round';
      doodleCtx.lineJoin = 'round';

      if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        doodleCtx.drawImage(tempCanvas, 0, 0, targetW, targetH);
      }
    }
  }

  window.addEventListener('resize', resizeDoodleCanvas);
  setTimeout(resizeDoodleCanvas, 150);

  // Save Canvas State to Undo Stack
  function saveUndoState() {
    if (!doodleCanvas || !doodleCtx) return;
    if (undoStack.length >= MAX_UNDO) undoStack.shift();
    undoStack.push(doodleCtx.getImageData(0, 0, doodleCanvas.width, doodleCanvas.height));
  }

  // Restore Undo State
  function undoLastStroke() {
    if (!doodleCanvas || !doodleCtx) return;
    if (undoStack.length > 0) {
      const prevState = undoStack.pop();
      doodleCtx.putImageData(prevState, 0, 0);
      initAudio();
      playEraserSound();
      if (undoStack.length === 0 && !hasDrawnPixels()) {
        hasDrawn = false;
        if (doodleHint) doodleHint.classList.remove('hidden');
      }
    }
  }

  // Clear Canvas
  function clearDoodleCanvas() {
    if (!doodleCanvas || !doodleCtx) return;
    saveUndoState();
    const rect = doodleCanvas.getBoundingClientRect();
    doodleCtx.clearRect(0, 0, rect.width, rect.height);
    hasDrawn = false;
    if (doodleHint) doodleHint.classList.remove('hidden');
    initAudio();
    playEraserSound();
  }

  // Check if any visible pixels exist on canvas
  function hasDrawnPixels() {
    if (!doodleCanvas || !doodleCtx) return false;
    const imgData = doodleCtx.getImageData(0, 0, doodleCanvas.width, doodleCanvas.height);
    const data = imgData.data;
    for (let i = 3; i < data.length; i += 8) {
      if (data[i] > 15) return true;
    }
    return false;
  }

  // Canvas Drawing Pointer Events
  if (doodleCanvas && doodleCtx) {
    const getPos = (e) => {
      const rect = doodleCanvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    doodleCanvas.addEventListener('pointerdown', (e) => {
      initAudio();
      doodleCanvas.setPointerCapture(e.pointerId);
      isDrawing = true;
      hasDrawn = true;
      if (doodleHint) doodleHint.classList.add('hidden');

      saveUndoState();
      const pos = getPos(e);
      strokePoints = [pos];

      // Draw initial contact dot
      doodleCtx.save();
      if (currentTool === 'eraser') {
        doodleCtx.globalCompositeOperation = 'destination-out';
        doodleCtx.beginPath();
        doodleCtx.arc(pos.x, pos.y, currentSize * 2, 0, Math.PI * 2);
        doodleCtx.fill();
        playEraserSound();
      } else {
        doodleCtx.globalCompositeOperation = 'source-over';
        doodleCtx.fillStyle = currentColor;
        doodleCtx.beginPath();
        doodleCtx.arc(pos.x, pos.y, currentSize / 2, 0, Math.PI * 2);
        doodleCtx.fill();
        playPencilScratch();
      }
      doodleCtx.restore();
    });

    doodleCanvas.addEventListener('pointermove', (e) => {
      if (!isDrawing) return;
      const pos = getPos(e);
      strokePoints.push(pos);

      doodleCtx.save();
      if (currentTool === 'eraser') {
        doodleCtx.globalCompositeOperation = 'destination-out';
        doodleCtx.lineWidth = currentSize * 3.5;
        playEraserSound();
      } else {
        doodleCtx.globalCompositeOperation = 'source-over';
        doodleCtx.strokeStyle = currentColor;
        doodleCtx.lineWidth = currentSize;
        playPencilScratch();
      }
      doodleCtx.lineCap = 'round';
      doodleCtx.lineJoin = 'round';

      // Smooth BÃ©zier curve interpolation through midpoints
      if (strokePoints.length > 2) {
        const p1 = strokePoints[strokePoints.length - 2];
        const p2 = strokePoints[strokePoints.length - 1];
        const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        doodleCtx.beginPath();
        doodleCtx.moveTo(p1.x, p1.y);
        doodleCtx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        doodleCtx.stroke();
      } else if (strokePoints.length === 2) {
        const p1 = strokePoints[0];
        const p2 = strokePoints[1];
        doodleCtx.beginPath();
        doodleCtx.moveTo(p1.x, p1.y);
        doodleCtx.lineTo(p2.x, p2.y);
        doodleCtx.stroke();
      }
      doodleCtx.restore();
    });

    const stopDrawing = (e) => {
      if (isDrawing) {
        isDrawing = false;
        try { doodleCanvas.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    };

    doodleCanvas.addEventListener('pointerup', stopDrawing);
    doodleCanvas.addEventListener('pointercancel', stopDrawing);
    doodleCanvas.addEventListener('pointerleave', stopDrawing);
  }

  // Tool Switching Listeners
  if (toolPenBtn) {
    toolPenBtn.addEventListener('click', () => {
      currentTool = 'pen';
      toolPenBtn.classList.add('active');
      if (toolEraserBtn) toolEraserBtn.classList.remove('active');
      if (doodleCanvas) doodleCanvas.classList.remove('eraser-mode');
      initAudio();
      playPaperRustle();
    });
  }

  if (toolEraserBtn) {
    toolEraserBtn.addEventListener('click', () => {
      currentTool = 'eraser';
      toolEraserBtn.classList.add('active');
      if (toolPenBtn) toolPenBtn.classList.remove('active');
      if (doodleCanvas) doodleCanvas.classList.add('eraser-mode');
      initAudio();
      playEraserSound();
    });
  }

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = parseInt(btn.dataset.size, 10) || 3;
      initAudio();
      playPencilScratch();
    });
  });

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentColor = btn.dataset.color || '#1e1d1b';
      // Automatically return to pen mode when color chosen
      currentTool = 'pen';
      if (toolPenBtn) toolPenBtn.classList.add('active');
      if (toolEraserBtn) toolEraserBtn.classList.remove('active');
      if (doodleCanvas) doodleCanvas.classList.remove('eraser-mode');
      initAudio();
      playPencilScratch();
    });
  });

  if (toolUndoBtn) toolUndoBtn.addEventListener('click', undoLastStroke);
  if (toolClearBtn) toolClearBtn.addEventListener('click', clearDoodleCanvas);

  // Keyboard shortcut: Ctrl+Z or Cmd+Z for Undo
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      e.preventDefault();
      undoLastStroke();
    }
  });

  // =========================================================================
  // ROAMING LIVING DOODLES SYSTEM (RELEASED INTO PORTFOLIO WORLD)
  // =========================================================================
  const livingDoodles = [];
  let doodleIdCounter = 0;
  let lastWanderTime = performance.now();

  function updateWandererCountUI() {
    if (!wandererCountEl) return;
    const count = livingDoodles.length;
    wandererCountEl.textContent = count === 1 ? '1 wandering doodle in world' : `${count} wandering doodles in world`;
    if (clearWanderersBtn) {
      if (count > 0) {
        clearWanderersBtn.classList.remove('hidden');
      } else {
        clearWanderersBtn.classList.add('hidden');
      }
    }
  }

  // Clear / Store all wandering doodles in book
  if (clearWanderersBtn) {
    clearWanderersBtn.addEventListener('click', () => {
      livingDoodles.forEach(d => {
        d.actor.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        d.actor.style.transform = 'translate(-50%, -50%) scale(0.2) rotate(45deg)';
        d.actor.style.opacity = '0';
        setTimeout(() => d.actor.remove(), 420);
      });
      livingDoodles.length = 0;
      updateWandererCountUI();
      if (typeof storeAllPetsInArchive === 'function') {
        storeAllPetsInArchive();
      }
      initAudio();
      playPaperRustle();
    });
  }

  // Crop Doodle from Canvas and Return Data URL
  function cropDoodleDataUrl() {
    if (!doodleCanvas || !doodleCtx) return null;
    const w = doodleCanvas.width;
    const h = doodleCanvas.height;
    const imgData = doodleCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = -1, maxY = -1;

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === -1) return null; // canvas is blank

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pad = Math.round(10 * dpr);
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(w - cropX, (maxX - minX) + pad * 2);
    const cropH = Math.min(h - cropY, (maxY - minY) + pad * 2);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.drawImage(doodleCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    return cropCanvas.toDataURL('image/png');
  }

  // Bring to Life Button Handler
  if (bringToLifeBtn) {
    bringToLifeBtn.addEventListener('click', () => {
      initAudio();
      const doodleUrl = cropDoodleDataUrl();

      if (!doodleUrl) {
        // Nothing drawn yet â€” playful alert and wiggle
        bringToLifeBtn.classList.remove('wiggle');
        void bringToLifeBtn.offsetWidth; // reflow
        bringToLifeBtn.classList.add('wiggle');
        playPencilScratch();
        if (doodleHint) {
          doodleHint.classList.remove('hidden');
          doodleHint.style.color = '#c92a2a';
          setTimeout(() => {
            if (doodleHint) doodleHint.style.color = '';
          }, 1500);
        }
        return;
      }

      // 1. Play magical bring-to-life chime & rustle
      playBringToLifeSound();

      // 2. Spawn temporary pop burst clone from canvas towards screen center
      if (doodleCanvas) {
        const cRect = doodleCanvas.getBoundingClientRect();
        const burstImg = document.createElement('img');
        burstImg.src = doodleUrl;
        burstImg.className = 'doodle-release-burst';
        burstImg.style.left = `${cRect.left + cRect.width / 2}px`;
        burstImg.style.top = `${cRect.top + cRect.height / 2}px`;
        burstImg.style.maxWidth = '105px';
        burstImg.style.maxHeight = '98px';
        burstImg.style.transform = 'translate(-50%, -50%) scale(0.4)';
        burstImg.style.opacity = '0.9';
        document.body.appendChild(burstImg);

        requestAnimationFrame(() => {
          burstImg.style.transform = 'translate(-50%, -50%) scale(1.3) rotate(15deg)';
          burstImg.style.opacity = '0';
        });
        setTimeout(() => burstImg.remove(), 750);
      }

      // 3. Spawn or Update Living Doodle in World & Pet Archive
      if (activeEditingPetId) {
        if (typeof saveEditedPetWithUrl === 'function') {
          saveEditedPetWithUrl(doodleUrl, true);
        } else {
          spawnLivingDoodle(doodleUrl);
        }
      } else {
        if (typeof addNewPetToArchive === 'function') {
          const newPet = addNewPetToArchive(doodleUrl, 'released');
          spawnLivingDoodle(doodleUrl, newPet.id, newPet.name);
        } else {
          spawnLivingDoodle(doodleUrl);
        }
      }

      // 4. Clear Canvas for the next doodle
      clearDoodleCanvas();
    });
  }

  // Spawn Living Doodle Wanderer
  function spawnLivingDoodle(imageUrl, petId = null, petName = null) {
    if (!livingDoodlesLayer) return null;

    doodleIdCounter++;
    const id = `living-doodle-${doodleIdCounter}`;
    const displayName = petName || `Living Doodle #${doodleIdCounter}`;

    const actor = document.createElement('div');
    actor.className = 'living-doodle-actor doodle-idle';
    actor.id = id;
    actor.title = `${displayName} — Click to tickle me or drag to move!`;

    const inner = document.createElement('div');
    inner.className = 'doodle-actor-inner';

    const shadow = document.createElement('div');
    shadow.className = 'doodle-shadow';

    const sprite = document.createElement('img');
    sprite.className = 'doodle-sprite';
    sprite.src = imageUrl;
    sprite.alt = displayName;

    inner.appendChild(shadow);
    inner.appendChild(sprite);
    actor.appendChild(inner);
    livingDoodlesLayer.appendChild(actor);

    // Initial position: center-ish near viewport bottom
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const initialX = Math.max(90, Math.min(winW - 90, winW * 0.5 + (Math.random() - 0.5) * 360));
    const initialY = Math.max(100, Math.min(winH - 110, winH * 0.65 + (Math.random() - 0.5) * 160));

    actor.style.left = `${initialX}px`;
    actor.style.top = `${initialY}px`;

    // Doodle Entity Object
    const doodle = {
      id,
      archivePetId: petId,
      petName: displayName,
      actor,
      inner,
      sprite,
      imageUrl,
      x: initialX,
      y: initialY,
      targetX: 80 + Math.random() * (winW - 160),
      targetY: 90 + Math.random() * (winH - 180),
      speed: 75 + Math.random() * 55, // 75 - 130 px/sec
      state: 'moving', // 'moving' | 'paused'
      pauseTimer: 0.5 + Math.random() * 1.5,
      facing: 'right',
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0
    };

    // Click to tickle / celebrate
    actor.addEventListener('click', (e) => {
      if (doodle.isDragging) return;
      e.stopPropagation();
      initAudio();
      playDoodleChirp();

      // Trigger celebrate bounce
      actor.classList.add('doodle-celebrate');
      setTimeout(() => actor.classList.remove('doodle-celebrate'), 650);
    });

    // Drag and drop doodle around the world
    actor.addEventListener('pointerdown', (e) => {
      doodle.isDragging = true;
      actor.classList.add('is-dragging');
      actor.setPointerCapture(e.pointerId);
      doodle.dragOffsetX = e.clientX - doodle.x;
      doodle.dragOffsetY = e.clientY - doodle.y;
    });

    actor.addEventListener('pointermove', (e) => {
      if (!doodle.isDragging) return;
      doodle.x = e.clientX - doodle.dragOffsetX;
      doodle.y = e.clientY - doodle.dragOffsetY;
      actor.style.left = `${doodle.x}px`;
      actor.style.top = `${doodle.y}px`;
    });

    const finishDrag = (e) => {
      if (doodle.isDragging) {
        doodle.isDragging = false;
        actor.classList.remove('is-dragging');
        try { actor.releasePointerCapture(e.pointerId); } catch (err) {}

        // Pick new destination nearby and resume wandering
        const wW = window.innerWidth;
        const wH = window.innerHeight;
        doodle.targetX = 80 + Math.random() * (wW - 160);
        doodle.targetY = 90 + Math.random() * (wH - 180);
        doodle.state = 'moving';
      }
    };

    actor.addEventListener('pointerup', finishDrag);
    actor.addEventListener('pointercancel', finishDrag);

    livingDoodles.push(doodle);
    updateWandererCountUI();
  }

  // Living Doodles Wandering Animation Loop
  function updateLivingDoodles(now) {
    const dt = Math.min((now - lastWanderTime) / 1000, 0.1);
    lastWanderTime = now;

    // Pause living doodles when modal is open so only the CV modal scrolls/moves
    if (document.body.classList.contains('modal-scroll-lock')) {
      requestAnimationFrame(updateLivingDoodles);
      return;
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    for (let i = 0; i < livingDoodles.length; i++) {
      const d = livingDoodles[i];
      if (d.isDragging) continue;

      if (d.state === 'moving') {
        const dx = d.targetX - d.x;
        const dy = d.targetY - d.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
          // Move towards target
          d.x += (dx / dist) * d.speed * dt;
          d.y += (dy / dist) * d.speed * dt;

          // Face direction of movement (scaleX)
          if (dx > 4 && d.facing !== 'right') {
            d.facing = 'right';
            d.inner.style.transform = 'scaleX(1)';
          } else if (dx < -4 && d.facing !== 'left') {
            d.facing = 'left';
            d.inner.style.transform = 'scaleX(-1)';
          }

          if (!d.actor.classList.contains('doodle-moving')) {
            d.actor.classList.add('doodle-moving');
            d.actor.classList.remove('doodle-idle');
          }
        } else {
          // Reached target -> pause and look around
          d.state = 'paused';
          d.pauseTimer = 1.2 + Math.random() * 2.8;
          d.actor.classList.remove('doodle-moving');
          d.actor.classList.add('doodle-idle');
        }
      } else if (d.state === 'paused') {
        d.pauseTimer -= dt;
        if (d.pauseTimer <= 0) {
          // Pick new random destination inside viewport
          d.targetX = 80 + Math.random() * (winW - 160);
          d.targetY = 90 + Math.random() * (winH - 180);
          d.state = 'moving';
        }
      }

      // Clamp inside screen viewport bounds
      d.x = Math.max(55, Math.min(winW - 55, d.x));
      d.y = Math.max(65, Math.min(winH - 65, d.y));

      d.actor.style.left = `${d.x}px`;
      d.actor.style.top = `${d.y}px`;
    }

    requestAnimationFrame(updateLivingDoodles);
  }

  requestAnimationFrame(updateLivingDoodles);

  // =========================================================================
  // 5B. SAVE DOODLE WORLD POSTCARD & EMAIL SHARING
  // =========================================================================
  const saveDoodleWorldBtn = document.getElementById('save-doodle-world-btn');
  const doodleShareModal = document.getElementById('doodle-share-modal');
  const doodleShareCloseBtn = document.getElementById('doodle-share-close-btn');
  const doodleShareDoneBtn = document.getElementById('doodle-share-done-btn');
  const doodleShareRedownloadBtn = document.getElementById('doodle-share-redownload-btn');
  const doodleSharePreviewImg = document.getElementById('doodle-share-preview-img');
  const doodleEmailForm = document.getElementById('doodle-email-form');
  const doodleEmailInput = document.getElementById('doodle-email-input');

  let currentPostcardDataUrl = null;

  function closeDoodleShareModal() {
    if (doodleShareModal) {
      doodleShareModal.classList.remove('active');
      document.body.classList.remove('modal-scroll-lock');
    }
  }

  if (doodleShareCloseBtn) doodleShareCloseBtn.addEventListener('click', closeDoodleShareModal);
  if (doodleShareDoneBtn) doodleShareDoneBtn.addEventListener('click', closeDoodleShareModal);

  if (doodleShareModal) {
    doodleShareModal.addEventListener('click', (e) => {
      if (e.target === doodleShareModal) closeDoodleShareModal();
    });
  }

  function downloadPostcard(dataUrl) {
    if (!dataUrl) return;
    const dlLink = document.createElement('a');
    dlLink.download = 'Joel-Doodle-World.png';
    dlLink.href = dataUrl;
    document.body.appendChild(dlLink);
    dlLink.click();
    dlLink.remove();
  }

  if (doodleShareRedownloadBtn) {
    doodleShareRedownloadBtn.addEventListener('click', () => {
      if (currentPostcardDataUrl) {
        downloadPostcard(currentPostcardDataUrl);
        initAudio();
        playPaperRustle();
      }
    });
  }

  if (doodleEmailForm) {
    doodleEmailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = doodleEmailInput ? doodleEmailInput.value.trim() : '';
      const subject = encodeURIComponent("My Doodle World from Joel's Sketchbook");
      const body = encodeURIComponent(
        `Hi!\n\nCheck out the doodle world I created in Joel Jeremy Tanumihardja's Living Sketchbook Portfolio!\n\n(I've attached my saved Joel-Doodle-World.png image)\n\nExplore Joel's sketchbook portfolio:\n${window.location.href}\n\nHave a great day!`
      );
      const mailtoUrl = email
        ? `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`
        : `mailto:?subject=${subject}&body=${body}`;

      initAudio();
      playPaperRustle();
      window.location.href = mailtoUrl;
    });
  }

  async function generateDoodleWorldPostcard() {
    const hasCanvasDoodle = hasDrawnPixels();
    const hasWanderers = livingDoodles.length > 0;

    if (!hasCanvasDoodle && !hasWanderers) {
      // Nothing drawn or wandering yet
      if (saveDoodleWorldBtn) {
        saveDoodleWorldBtn.classList.remove('wiggle');
        void saveDoodleWorldBtn.offsetWidth;
        saveDoodleWorldBtn.classList.add('wiggle');
      }
      if (doodleHint) {
        doodleHint.classList.remove('hidden');
        doodleHint.style.color = '#c92a2a';
        doodleHint.innerHTML = '<span>Draw something or click &ldquo;Bring to Life!&rdquo; first to create your world!</span>';
        setTimeout(() => {
          if (doodleHint) {
            doodleHint.style.color = '';
            doodleHint.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="2" x2="22" y2="6"></line><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path></svg><span>Draw your doodle friend here, then click "Bring to Life!"</span>';
          }
        }, 2500);
      }
      initAudio();
      playPencilScratch();
      return null;
    }

    const postW = 1200;
    const postH = 800;
    const postCanvas = document.createElement('canvas');
    postCanvas.width = postW;
    postCanvas.height = postH;
    const ctx = postCanvas.getContext('2d');

    // 1. Warm sketchbook paper background
    ctx.fillStyle = '#fbf8f2';
    ctx.fillRect(0, 0, postW, postH);

    // Subtle paper edge border
    ctx.fillStyle = '#f3ede2';
    ctx.fillRect(0, 0, postW, 14);
    ctx.fillRect(0, postH - 14, postW, 14);
    ctx.fillRect(0, 0, 14, postH);
    ctx.fillRect(postW - 14, 0, 14, postH);

    // Outer pencil border
    ctx.strokeStyle = '#2d2b27';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, postW - 72, postH - 72);

    // Inner dashed pencil margin
    ctx.save();
    ctx.strokeStyle = '#8f8c85';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 5]);
    ctx.strokeRect(48, 48, postW - 96, postH - 96);
    ctx.restore();

    // 2. Postcard Header
    // Title
    ctx.fillStyle = '#1e1d1b';
    ctx.font = "bold 26px 'Courier Prime', Courier, monospace";
    ctx.fillText("JOEL'S LIVING SKETCHBOOK • DOODLE WORLD", 72, 94);

    ctx.fillStyle = '#78756d';
    ctx.font = "14px 'Courier Prime', Courier, monospace";
    ctx.fillText("Hand-drawn sandbox creations brought to life", 72, 118);

    // Date & Stamp on Right
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    ctx.strokeStyle = '#2d2b27';
    ctx.lineWidth = 2;
    ctx.strokeRect(postW - 200, 64, 128, 64);
    ctx.fillStyle = '#2d2b27';
    ctx.font = "bold 11px 'Courier Prime', Courier, monospace";
    ctx.textAlign = 'center';
    ctx.fillText("DOODLE POST", postW - 136, 86);
    ctx.fillText(today, postW - 136, 106);
    ctx.font = "10px sans-serif";
    ctx.fillText("★ ★ ★", postW - 136, 120);
    ctx.textAlign = 'left';

    // Header divider line
    ctx.save();
    ctx.strokeStyle = '#cfcbbf';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(60, 142);
    ctx.lineTo(postW - 60, 142);
    ctx.stroke();
    ctx.restore();

    // 3. Central Sketch Region
    const contentArea = { x: 70, y: 160, w: postW - 140, h: postH - 260 };

    // Draw current canvas strokes if present
    if (hasCanvasDoodle && doodleCanvas) {
      ctx.save();
      const dw = contentArea.w;
      const dh = contentArea.h;
      ctx.drawImage(doodleCanvas, contentArea.x, contentArea.y, dw, dh);
      ctx.restore();
    }

    // 4. Render Living Wanderers into the world scene
    if (hasWanderers) {
      const winW = Math.max(window.innerWidth, 400);
      const winH = Math.max(window.innerHeight, 400);

      livingDoodles.forEach(d => {
        if (!d.sprite) return;
        const normX = Math.max(0.05, Math.min(0.95, d.x / winW));
        const normY = Math.max(0.05, Math.min(0.95, d.y / winH));

        const targetX = contentArea.x + 40 + normX * (contentArea.w - 120);
        const targetY = contentArea.y + 40 + normY * (contentArea.h - 120);

        const spriteW = Math.min(130, Math.max(75, d.sprite.naturalWidth || 95));
        const spriteH = Math.min(120, Math.max(70, d.sprite.naturalHeight || 90));

        // Soft oval drop shadow
        ctx.save();
        ctx.fillStyle = 'rgba(30, 29, 27, 0.16)';
        ctx.beginPath();
        ctx.ellipse(targetX, targetY + spriteH * 0.45, spriteW * 0.36, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Living Doodle Actor
        ctx.save();
        ctx.translate(targetX, targetY);
        if (d.facing === 'left') {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(d.sprite, -spriteW / 2, -spriteH / 2, spriteW, spriteH);
        ctx.restore();
      });
    }

    // 5. Postcard Footer
    // Footer divider line
    ctx.save();
    ctx.strokeStyle = '#cfcbbf';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(60, postH - 96);
    ctx.lineTo(postW - 60, postH - 96);
    ctx.stroke();
    ctx.restore();

    // Footer Text
    ctx.fillStyle = '#1e1d1b';
    ctx.font = "bold 13px 'Courier Prime', Courier, monospace";
    ctx.fillText("JOEL JEREMY TANUMIHARDJA • VISUAL COMMUNICATION DESIGN", 72, postH - 68);
    ctx.fillStyle = '#78756d';
    ctx.font = "12px 'Courier Prime', Courier, monospace";
    ctx.fillText("Faculty of Design, Universitas Pelita Harapan (UPH)", 72, postH - 50);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#1e1d1b';
    ctx.font = "13px 'Courier Prime', Courier, monospace";
    ctx.fillText("instagram: @joel.jeremy.t", postW - 72, postH - 68);
    ctx.fillStyle = '#78756d';
    ctx.font = "12px 'Courier Prime', Courier, monospace";
    ctx.fillText("threads: @nejukeju • joeltanumihardjawork@gmail.com", postW - 72, postH - 50);
    ctx.textAlign = 'left';

    const dataUrl = postCanvas.toDataURL('image/png');
    currentPostcardDataUrl = dataUrl;
    return dataUrl;
  }

  if (saveDoodleWorldBtn) {
    saveDoodleWorldBtn.addEventListener('click', async () => {
      initAudio();
      const postcardUrl = await generateDoodleWorldPostcard();
      if (!postcardUrl) return;

      // 1. Download automatically
      downloadPostcard(postcardUrl);

      // 2. Open Share Modal
      if (doodleSharePreviewImg) doodleSharePreviewImg.src = postcardUrl;
      if (doodleShareModal) {
        doodleShareModal.classList.add('active');
        document.body.classList.add('modal-scroll-lock');
      }

      playBringToLifeSound();
    });
  }

  // =========================================================================
  // 5C. DOODLE PET GLOSSARY & ARCHIVE BOOK SYSTEM (LOCALSTORAGE PERSISTENCE)
  // =========================================================================
  const PET_STORAGE_KEY = 'joel_doodle_pet_archive_v1';
  let petArchive = [];
  let currentArchiveFilter = 'all'; // 'all' | 'released' | 'stored'
  let currentArchiveSearch = '';

  const doodleArchiveModal = document.getElementById('doodle-archive-modal');
  const archiveModalCloseBtn = document.getElementById('archive-modal-close-btn');
  const archiveDoneBtn = document.getElementById('archive-done-btn');
  const archiveSearchInput = document.getElementById('archive-search-input');
  const archiveSearchClearBtn = document.getElementById('archive-search-clear-btn');
  const archiveFilterTabs = document.querySelectorAll('.archive-tab-btn');
  const archiveReleaseAllBtn = document.getElementById('archive-release-all-btn');
  const archiveStoreAllBtn = document.getElementById('archive-store-all-btn');
  const archivePetsGrid = document.getElementById('archive-pets-grid');
  const archiveEmptyState = document.getElementById('archive-empty-state');
  const archiveStatsText = document.getElementById('archive-stats-text');
  const archiveFilterAllCount = document.getElementById('archive-filter-all-count');
  const archiveFilterReleasedCount = document.getElementById('archive-filter-released-count');
  const archiveFilterStoredCount = document.getElementById('archive-filter-stored-count');
  const archiveStartDrawingBtn = document.getElementById('archive-start-drawing-btn');

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadPetArchive() {
    try {
      const raw = localStorage.getItem(PET_STORAGE_KEY);
      if (raw) {
        petArchive = JSON.parse(raw);
        if (!Array.isArray(petArchive)) petArchive = [];
      } else {
        petArchive = [];
      }
    } catch (e) {
      console.warn('Could not read pet archive from storage:', e);
      petArchive = [];
    }
  }

  function savePetArchive() {
    try {
      localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(petArchive));
    } catch (e) {
      console.warn('Could not save pet archive to storage:', e);
    }
    updateArchiveBadges();
  }

  function updateArchiveBadges() {
    const total = petArchive.length;
    const releasedCount = petArchive.filter(p => p.status === 'released').length;
    const storedCount = total - releasedCount;

    if (archiveCountBadge) archiveCountBadge.textContent = total;
    if (archiveFilterAllCount) archiveFilterAllCount.textContent = total;
    if (archiveFilterReleasedCount) archiveFilterReleasedCount.textContent = releasedCount;
    if (archiveFilterStoredCount) archiveFilterStoredCount.textContent = storedCount;

    if (archiveStatsText) {
      archiveStatsText.textContent = total === 1 ? '1 companion in glossary' : `${total} companions in glossary`;
    }
  }

  function addNewPetToArchive(imageUrl, status = 'released') {
    const petId = `pet_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const petName = `Doodle Friend #${petArchive.length + 1}`;
    const newPet = {
      id: petId,
      name: petName,
      imageUrl,
      createdAt: Date.now(),
      status
    };
    petArchive.unshift(newPet);
    savePetArchive();
    return newPet;
  }

  function storeAllPetsInArchive() {
    petArchive.forEach(p => {
      p.status = 'stored';
    });
    savePetArchive();
  }

  function renderPetArchive() {
    if (!archivePetsGrid) return;

    let filtered = petArchive;

    // Filter by tab status
    if (currentArchiveFilter === 'released') {
      filtered = filtered.filter(p => p.status === 'released');
    } else if (currentArchiveFilter === 'stored') {
      filtered = filtered.filter(p => p.status === 'stored');
    }

    // Filter by search query
    if (currentArchiveSearch) {
      filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(currentArchiveSearch));
    }

    if (petArchive.length === 0) {
      archivePetsGrid.innerHTML = '';
      if (archiveEmptyState) archiveEmptyState.classList.remove('hidden');
      return;
    }

    if (archiveEmptyState) archiveEmptyState.classList.add('hidden');

    if (filtered.length === 0) {
      archivePetsGrid.innerHTML = `
        <div class="archive-no-match">
          <p>No companions found matching &ldquo;<strong>${escapeHtml(currentArchiveSearch)}</strong>&rdquo;</p>
          <button id="archive-clear-search-link" class="archive-clear-search-link" type="button">Clear search</button>
        </div>
      `;
      const clrLink = document.getElementById('archive-clear-search-link');
      if (clrLink) {
        clrLink.addEventListener('click', () => {
          if (archiveSearchInput) archiveSearchInput.value = '';
          currentArchiveSearch = '';
          if (archiveSearchClearBtn) archiveSearchClearBtn.classList.add('hidden');
          renderPetArchive();
        });
      }
      return;
    }

    archivePetsGrid.innerHTML = filtered.map(pet => {
      const isRoaming = pet.status === 'released';
      const dateFormatted = new Date(pet.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `
        <div class="archive-pet-card ${isRoaming ? 'pet-roaming' : 'pet-stored'}" data-pet-id="${pet.id}">
          <div class="pet-card-header">
            <span class="pet-status-pill ${isRoaming ? 'status-roaming' : 'status-stored'}">
              <span class="status-dot"></span>
              <span>${isRoaming ? 'Roaming World' : 'Resting in Book'}</span>
            </span>
            <button class="pet-delete-btn" type="button" title="Delete pet from archive" data-action="delete" aria-label="Delete ${escapeHtml(pet.name)}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          <div class="pet-image-stage">
            <img src="${pet.imageUrl}" alt="${escapeHtml(pet.name)}" class="pet-thumb-img">
            <div class="pet-shadow-preview"></div>
          </div>

          <div class="pet-meta-info">
            <div class="pet-name-field" title="Click to rename">
              <input type="text" class="pet-name-input" value="${escapeHtml(pet.name)}" placeholder="Name this pet..." maxlength="30" data-action="rename">
              <svg class="pet-pencil-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </div>
            <span class="pet-date-stamp">Cataloged on ${dateFormatted}</span>
          </div>

          <div class="pet-card-actions">
            <button class="pet-toggle-state-btn ${isRoaming ? 'action-store' : 'action-release'}" type="button" data-action="toggle-release">
              ${isRoaming
                ? `<svg class="btn-stroke-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`
                : `<svg class="btn-stroke-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2.4 6.9 7.1 2.3-7.1 2.4L12 20.5l-2.4-6.9L2.5 11.2l7.1-2.3L12 2z"></path></svg>`}
              <span>${isRoaming ? 'Store in Book' : 'Release to World'}</span>
            </button>
            <button class="pet-redraw-btn" type="button" data-action="redraw" title="Redraw or edit this pet on canvas">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span>Redraw</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Pet Archive Grid Event Delegation
  if (archivePetsGrid) {
    // 1. Rename on input
    archivePetsGrid.addEventListener('input', (e) => {
      const input = e.target.closest('.pet-name-input');
      if (!input) return;
      const card = input.closest('.archive-pet-card');
      if (!card) return;
      const petId = card.dataset.petId;
      const pet = petArchive.find(p => p.id === petId);
      if (pet) {
        pet.name = input.value.trim() || 'Doodle Pet';
        savePetArchive();

        // Update wandering actor tooltip if roaming
        const wanderer = livingDoodles.find(d => d.archivePetId === pet.id);
        if (wanderer) {
          wanderer.petName = pet.name;
          wanderer.actor.title = `${pet.name} — Click to tickle me or drag to move!`;
        }
        if (activeEditingPetId === pet.id && editingPetNameEl) {
          editingPetNameEl.textContent = pet.name;
        }
      }
    });

    // 2. Action Buttons (Toggle Release, Redraw, Delete)
    archivePetsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const card = btn.closest('.archive-pet-card');
      if (!card) return;
      const petId = card.dataset.petId;
      const action = btn.dataset.action;
      const pet = petArchive.find(p => p.id === petId);
      if (!pet) return;

      initAudio();

      if (action === 'toggle-release') {
        if (pet.status === 'released') {
          // Store pet into book
          const wandererIdx = livingDoodles.findIndex(d => d.archivePetId === pet.id);
          if (wandererIdx !== -1) {
            const d = livingDoodles[wandererIdx];
            d.actor.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
            d.actor.style.transform = 'translate(-50%, -50%) scale(0.2) rotate(45deg)';
            d.actor.style.opacity = '0';
            setTimeout(() => d.actor.remove(), 420);
            livingDoodles.splice(wandererIdx, 1);
            updateWandererCountUI();
          }
          pet.status = 'stored';
          savePetArchive();
          renderPetArchive();
          playPaperRustle();
        } else {
          // Release pet into world
          pet.status = 'released';
          spawnLivingDoodle(pet.imageUrl, pet.id, pet.name);
          savePetArchive();
          renderPetArchive();
          playBringToLifeSound();
        }
      } else if (action === 'redraw') {
        startRedrawPet(pet.id);
      } else if (action === 'delete') {
        if (confirm(`Delete "${pet.name}" from your pet glossary?`)) {
          if (pet.status === 'released') {
            const wandererIdx = livingDoodles.findIndex(d => d.archivePetId === pet.id);
            if (wandererIdx !== -1) {
              const d = livingDoodles[wandererIdx];
              d.actor.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
              d.actor.style.transform = 'translate(-50%, -50%) scale(0.2) rotate(45deg)';
              d.actor.style.opacity = '0';
              setTimeout(() => d.actor.remove(), 420);
              livingDoodles.splice(wandererIdx, 1);
              updateWandererCountUI();
            }
          }
          petArchive = petArchive.filter(p => p.id !== pet.id);
          savePetArchive();
          renderPetArchive();
          playEraserSound();
        }
      }
    });
  }

  function openPetArchiveModal() {
    if (!doodleArchiveModal) return;
    renderPetArchive();
    doodleArchiveModal.classList.add('active');
    document.body.classList.add('modal-scroll-lock');
    initAudio();
    playPaperRustle();
  }

  function closePetArchiveModal() {
    if (!doodleArchiveModal) return;
    doodleArchiveModal.classList.remove('active');
    document.body.classList.remove('modal-scroll-lock');
  }

  if (openArchiveBtn) openArchiveBtn.addEventListener('click', openPetArchiveModal);
  if (archiveModalCloseBtn) archiveModalCloseBtn.addEventListener('click', closePetArchiveModal);
  if (archiveDoneBtn) archiveDoneBtn.addEventListener('click', closePetArchiveModal);
  if (archiveStartDrawingBtn) {
    archiveStartDrawingBtn.addEventListener('click', () => {
      closePetArchiveModal();
      if (typeof window.glideToSection === 'function') {
        window.glideToSection('interactive');
      }
    });
  }

  if (doodleArchiveModal) {
    doodleArchiveModal.addEventListener('click', (e) => {
      if (e.target === doodleArchiveModal) closePetArchiveModal();
    });
  }

  // Search & Filter Listeners
  if (archiveSearchInput) {
    archiveSearchInput.addEventListener('input', () => {
      currentArchiveSearch = archiveSearchInput.value.trim().toLowerCase();
      if (archiveSearchClearBtn) {
        if (currentArchiveSearch.length > 0) {
          archiveSearchClearBtn.classList.remove('hidden');
        } else {
          archiveSearchClearBtn.classList.add('hidden');
        }
      }
      renderPetArchive();
    });
  }

  if (archiveSearchClearBtn) {
    archiveSearchClearBtn.addEventListener('click', () => {
      if (archiveSearchInput) archiveSearchInput.value = '';
      currentArchiveSearch = '';
      archiveSearchClearBtn.classList.add('hidden');
      renderPetArchive();
      archiveSearchInput.focus();
    });
  }

  archiveFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      archiveFilterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentArchiveFilter = tab.dataset.filter || 'all';
      renderPetArchive();
      playPaperRustle();
    });
  });

  // Batch Release All & Store All
  if (archiveReleaseAllBtn) {
    archiveReleaseAllBtn.addEventListener('click', () => {
      initAudio();
      let count = 0;
      petArchive.forEach(pet => {
        if (pet.status === 'stored' && pet.imageUrl) {
          pet.status = 'released';
          spawnLivingDoodle(pet.imageUrl, pet.id, pet.name);
          count++;
        }
      });
      if (count > 0) {
        savePetArchive();
        renderPetArchive();
        playBringToLifeSound();
      } else {
        playPencilScratch();
      }
    });
  }

  if (archiveStoreAllBtn) {
    archiveStoreAllBtn.addEventListener('click', () => {
      initAudio();
      livingDoodles.forEach(d => {
        d.actor.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        d.actor.style.transform = 'translate(-50%, -50%) scale(0.2) rotate(45deg)';
        d.actor.style.opacity = '0';
        setTimeout(() => d.actor.remove(), 420);
      });
      livingDoodles.length = 0;
      updateWandererCountUI();
      storeAllPetsInArchive();
      renderPetArchive();
      playPaperRustle();
    });
  }

  // Redraw / Editing Controls
  function exitPetEditMode() {
    activeEditingPetId = null;
    if (doodleEditingBanner) doodleEditingBanner.classList.add('hidden');
  }

  function startRedrawPet(petId) {
    const pet = petArchive.find(p => p.id === petId);
    if (!pet || !pet.imageUrl) return;

    activeEditingPetId = pet.id;
    if (editingPetNameEl) editingPetNameEl.textContent = pet.name;
    if (doodleEditingBanner) doodleEditingBanner.classList.remove('hidden');

    closePetArchiveModal();

    // Load pet's image onto doodle canvas
    const img = new Image();
    img.onload = () => {
      saveUndoState();
      const rect = doodleCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      doodleCtx.clearRect(0, 0, doodleCanvas.width, doodleCanvas.height);

      const targetW = Math.min(rect.width * 0.7, img.width / dpr);
      const targetH = Math.min(rect.height * 0.7, (img.height / (img.width || 1)) * targetW);
      const posX = (rect.width - targetW) / 2;
      const posY = (rect.height - targetH) / 2;

      doodleCtx.drawImage(img, posX, posY, targetW, targetH);
      hasDrawn = true;
      if (doodleHint) doodleHint.classList.add('hidden');
    };
    img.src = pet.imageUrl;

    if (typeof window.glideToSection === 'function') {
      window.glideToSection('interactive');
    }
    playPaperRustle();
  }

  function saveEditedPetWithUrl(newUrl, alsoRelease = false) {
    if (!activeEditingPetId) return;
    const pet = petArchive.find(p => p.id === activeEditingPetId);
    if (!pet) {
      exitPetEditMode();
      return;
    }

    if (newUrl) {
      pet.imageUrl = newUrl;
      if (alsoRelease) {
        pet.status = 'released';
        const existingWandererIdx = livingDoodles.findIndex(d => d.archivePetId === pet.id);
        if (existingWandererIdx !== -1) {
          livingDoodles[existingWandererIdx].actor.remove();
          livingDoodles.splice(existingWandererIdx, 1);
        }
        spawnLivingDoodle(newUrl, pet.id, pet.name);
      } else {
        const roamingDoodle = livingDoodles.find(d => d.archivePetId === pet.id);
        if (roamingDoodle && roamingDoodle.sprite) {
          roamingDoodle.sprite.src = newUrl;
          roamingDoodle.imageUrl = newUrl;
        }
      }
      savePetArchive();
    }

    clearDoodleCanvas();
    exitPetEditMode();
    playPaperRustle();
    playDoodleChirp();

    if (doodleHint) {
      doodleHint.classList.remove('hidden');
      doodleHint.style.color = '#2b7a32';
      doodleHint.innerHTML = `<span>✓ Saved changes for "${escapeHtml(pet.name)}" in glossary!</span>`;
      setTimeout(() => {
        if (doodleHint) {
          doodleHint.style.color = '';
          doodleHint.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="2" x2="22" y2="6"></line><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path></svg><span>Draw your doodle friend here, then click "Bring to Life!"</span>';
        }
      }, 2200);
    }
  }

  function saveEditedPet() {
    const newUrl = cropDoodleDataUrl();
    saveEditedPetWithUrl(newUrl, false);
  }

  if (saveEditPetBtn) saveEditPetBtn.addEventListener('click', saveEditedPet);
  if (cancelEditPetBtn) {
    cancelEditPetBtn.addEventListener('click', () => {
      clearDoodleCanvas();
      exitPetEditMode();
      playEraserSound();
    });
  }

  // Store Doodle Button on Canvas Toolbar (Save directly to glossary without releasing)
  if (storeDoodleBtn) {
    storeDoodleBtn.addEventListener('click', () => {
      initAudio();
      const doodleUrl = cropDoodleDataUrl();

      if (!doodleUrl) {
        storeDoodleBtn.classList.remove('wiggle');
        void storeDoodleBtn.offsetWidth;
        storeDoodleBtn.classList.add('wiggle');
        playPencilScratch();
        if (doodleHint) {
          doodleHint.classList.remove('hidden');
          doodleHint.style.color = '#c92a2a';
          doodleHint.innerHTML = '<span>Draw your animal first before storing it in the glossary!</span>';
          setTimeout(() => {
            if (doodleHint) {
              doodleHint.style.color = '';
              doodleHint.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="2" x2="22" y2="6"></line><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path></svg><span>Draw your doodle friend here, then click "Bring to Life!"</span>';
            }
          }, 2000);
        }
        return;
      }

      if (activeEditingPetId) {
        saveEditedPet();
        return;
      }

      const newPet = addNewPetToArchive(doodleUrl, 'stored');
      clearDoodleCanvas();
      playPaperRustle();
      playDoodleChirp();

      if (openArchiveBtn) {
        openArchiveBtn.classList.remove('wiggle');
        void openArchiveBtn.offsetWidth;
        openArchiveBtn.classList.add('wiggle');
      }

      if (doodleHint) {
        doodleHint.classList.remove('hidden');
        doodleHint.style.color = '#2b7a32';
        doodleHint.innerHTML = `<span>✓ Stored "${escapeHtml(newPet.name)}" in your Pet Glossary book!</span>`;
        setTimeout(() => {
          if (doodleHint) {
            doodleHint.style.color = '';
            doodleHint.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="2" x2="22" y2="6"></line><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path></svg><span>Draw your doodle friend here, then click "Bring to Life!"</span>';
          }
        }, 2200);
      }
    });
  }

  // Restore Released Pets on Startup (Persistence Across Refresh)
  function restoreReleasedPetsOnStartup() {
    loadPetArchive();
    updateArchiveBadges();

    petArchive.forEach(pet => {
      if (pet.status === 'released' && pet.imageUrl) {
        spawnLivingDoodle(pet.imageUrl, pet.id, pet.name);
      }
    });
  }

  // Escape Key to Close Pet Archive Modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (doodleArchiveModal && doodleArchiveModal.classList.contains('active')) {
        closePetArchiveModal();
      }
    }
  });

  // =========================================================================
  // 6. CONTACT FORM: PAPER AIRPLANE ANIMATION
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const sendPlaneBtn = document.getElementById('send-plane-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      initAudio();
      playPaperRustle();

      if (sendPlaneBtn) {
        sendPlaneBtn.innerHTML = '<span>Flying Paper Plane...</span>';
        sendPlaneBtn.style.pointerEvents = 'none';
      }

      // Fly airplane element
      const plane = document.createElement('div');
      plane.innerHTML = '<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#1e1d1b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
      plane.style.position = 'fixed';
      plane.style.left = '50vw';
      plane.style.bottom = '120px';
      plane.style.zIndex = '9999';
      plane.style.transition = 'all 1.4s cubic-bezier(0.1, 0.9, 0.2, 1)';
      document.body.appendChild(plane);

      requestAnimationFrame(() => {
        plane.style.transform = 'translate(60vw, -80vh) rotate(-35deg) scale(0.6)';
        plane.style.opacity = '0';
      });

      setTimeout(() => {
        plane.remove();
        alert("Thanks for your handwritten note! Joel will get back to you soon.");
        contactForm.reset();
        if (sendPlaneBtn) {
          sendPlaneBtn.innerHTML = '<svg class="plane-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg><span>Fly Paper Plane</span>';
          sendPlaneBtn.style.pointerEvents = 'auto';
        }
      }, 1500);
    });
  }

  // =========================================================================
  // 7. DYNAMIC VECTOR WIND SWOOSH ANIMATION (TRIM PATHS SVG EFFECT)
  // =========================================================================
  const windSwooshLayer = document.getElementById('wind-swoosh-layer');
  let windBreezeTimer = null;

  const WIND_PRESETS = [
    // Preset 1: Exact Reference Match (Japanese wave crest with second right crest)
    {
      viewBox: "0 0 720 280",
      strokes: [
        {
          d: "M 35 210 C 130 165, 255 145, 380 160 C 455 170, 515 125, 480 40 C 455 -15, 392 10, 400 65",
          width: 2.8,
          delayRatio: 0.0,
          speedRatio: 1.0
        },
        {
          d: "M 65 225 C 160 180, 275 160, 390 172 C 460 180, 525 138, 495 58 C 475 8, 420 28, 424 75",
          width: 2.3,
          delayRatio: 0.08,
          speedRatio: 0.96
        },
        {
          d: "M 130 234 C 230 195, 345 176, 455 180 C 530 184, 565 145, 608 124 C 648 104, 672 138, 642 164 C 618 184, 588 172, 602 150",
          width: 2.5,
          delayRatio: 0.15,
          speedRatio: 1.04
        },
        {
          d: "M 175 240 C 265 208, 375 190, 475 192 C 542 194, 582 165, 622 144 C 655 126, 672 154, 650 174",
          width: 1.9,
          delayRatio: 0.22,
          speedRatio: 0.98
        }
      ]
    },
    // Preset 2: Double Flowing Wave Crests
    {
      viewBox: "0 0 700 270",
      strokes: [
        {
          d: "M 40 190 C 130 150, 220 185, 310 145 C 365 120, 395 70, 365 30 C 335 -5, 290 15, 305 55 C 325 105, 430 175, 545 135 C 605 115, 635 65, 605 35",
          width: 2.6,
          delayRatio: 0.0,
          speedRatio: 1.0
        },
        {
          d: "M 65 205 C 150 168, 235 200, 320 160 C 372 135, 405 88, 380 50 C 355 20, 318 35, 330 70 C 350 115, 445 188, 555 150 C 615 130, 645 85, 620 55",
          width: 2.2,
          delayRatio: 0.09,
          speedRatio: 0.97
        },
        {
          d: "M 110 218 C 190 185, 275 210, 360 175 C 440 145, 515 200, 610 165 C 655 148, 680 115, 660 90",
          width: 1.8,
          delayRatio: 0.17,
          speedRatio: 1.03
        },
        {
          d: "M 160 228 C 240 200, 320 220, 400 190 C 470 165, 540 210, 630 180",
          width: 1.5,
          delayRatio: 0.24,
          speedRatio: 1.0
        }
      ]
    },
    // Preset 3: Sweeping Horizon Breeze with Curl Finale
    {
      viewBox: "0 0 740 240",
      strokes: [
        {
          d: "M 30 160 C 150 120, 290 170, 440 130 C 540 100, 610 135, 670 100 C 705 80, 720 45, 690 25 C 660 5, 625 25, 640 55",
          width: 2.7,
          delayRatio: 0.0,
          speedRatio: 1.0
        },
        {
          d: "M 60 175 C 175 135, 310 185, 455 145 C 550 115, 620 150, 680 115 C 712 95, 725 65, 702 45",
          width: 2.2,
          delayRatio: 0.08,
          speedRatio: 0.98
        },
        {
          d: "M 115 190 C 220 155, 350 198, 485 160 C 570 135, 645 165, 705 135",
          width: 1.8,
          delayRatio: 0.16,
          speedRatio: 1.02
        },
        {
          d: "M 170 202 C 270 170, 390 210, 515 175 C 595 152, 665 178, 725 150",
          width: 1.4,
          delayRatio: 0.24,
          speedRatio: 0.96
        }
      ]
    }
  ];

  function spawnWindSwoosh(allowCompanion = true, preferredQuadrant = null) {
    if (!windSwooshLayer || document.hidden) return;

    // Pick random preset (weighted towards reference wave)
    const presetIdx = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * WIND_PRESETS.length);
    const preset = WIND_PRESETS[presetIdx];

    // Each wind appears maximum 1-4 separate strokes
    const strokeCount = Math.floor(Math.random() * 4) + 1; // 1, 2, 3, or 4
    const activeStrokes = preset.strokes.slice(0, strokeCount);

    // Quadrant positioning: 0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right
    const quad = preferredQuadrant !== null ? preferredQuadrant : Math.floor(Math.random() * 4);

    let posX, posY;
    if (quad === 0) {
      posX = 3 + Math.random() * 25; // 3vw - 28vw
      posY = 8 + Math.random() * 32; // 8vh - 40vh
    } else if (quad === 1) {
      posX = 34 + Math.random() * 26; // 34vw - 60vw
      posY = 8 + Math.random() * 32;  // 8vh - 40vh
    } else if (quad === 2) {
      posX = 3 + Math.random() * 25; // 3vw - 28vw
      posY = 44 + Math.random() * 30; // 44vh - 74vh
    } else {
      posX = 34 + Math.random() * 26; // 34vw - 60vw
      posY = 44 + Math.random() * 30; // 44vh - 74vh
    }

    const container = document.createElement('div');
    container.className = 'wind-gust-container';

    const scale = 0.82 + Math.random() * 0.32; // 0.82 - 1.14
    const flipH = Math.random() > 0.72 ? -1 : 1; // occasional right-to-left
    const flipV = Math.random() > 0.82 ? -1 : 1; // occasional vertical inversion
    const rot = (Math.random() - 0.5) * 8; // -4deg to +4deg

    container.style.left = `${posX}vw`;
    container.style.top = `${posY}vh`;
    container.style.transform = `scale(${flipH * scale}, ${flipV * scale}) rotate(${rot}deg)`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', preset.viewBox);
    svg.setAttribute('class', 'wind-gust-svg');

    activeStrokes.forEach(s => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', s.d);
      path.setAttribute('class', 'wind-vector-stroke');
      path.style.strokeWidth = `${s.width}px`;
      svg.appendChild(path);
    });

    container.appendChild(svg);
    windSwooshLayer.appendChild(container);

    // Slower, graceful fluid duration: ~3.2s - 4.0s (not rushed or rapid)
    const baseDuration = 3200 + Math.random() * 700;

    const paths = svg.querySelectorAll('.wind-vector-stroke');
    const animPromises = [];

    paths.forEach((path, idx) => {
      const strokeData = activeStrokes[idx];
      let totalLen = 600;
      try {
        totalLen = Math.ceil(path.getTotalLength());
      } catch (e) {}

      path.style.strokeDasharray = `${totalLen} ${totalLen}`;
      path.style.strokeDashoffset = `${totalLen}`;

      const strokeDuration = baseDuration * (strokeData.speedRatio || 1);
      const strokeDelay = (strokeData.delayRatio || 0) * 350; // stagger 0 to ~120ms

      // Slower Trim Paths keyframes:
      // 0%: strokeDashoffset = totalLen, opacity = 0 (completely un-drawn)
      // 8%: strokeDashoffset = totalLen * 0.88, opacity = 0.95
      // 44%: strokeDashoffset = 0, opacity = 1 (gradual, fluid draw-on along curve)
      // 66%: strokeDashoffset = 0, opacity = 1 (generous apex hold to appreciate brush gesture)
      // 88%: strokeDashoffset = -totalLen * 0.72, opacity = 0.85 (graceful progressive tail erase)
      // 100%: strokeDashoffset = -totalLen, opacity = 0 (completely erased & dissolved)
      try {
        const anim = path.animate([
          { strokeDashoffset: totalLen, opacity: 0 },
          { strokeDashoffset: totalLen * 0.88, opacity: 0.95, offset: 0.08 },
          { strokeDashoffset: 0, opacity: 1, offset: 0.44 },
          { strokeDashoffset: 0, opacity: 1, offset: 0.66 },
          { strokeDashoffset: -totalLen * 0.72, opacity: 0.85, offset: 0.88 },
          { strokeDashoffset: -totalLen, opacity: 0, offset: 1.0 }
        ], {
          duration: strokeDuration,
          delay: strokeDelay,
          easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
          fill: 'forwards'
        });

        if (anim && anim.finished) {
          animPromises.push(anim.finished);
        }
      } catch (e) {}
    });

    // Clean up DOM safely when all path animations complete
    const finishCleanup = () => {
      if (container.parentNode) container.remove();
    };

    if (animPromises.length > 0) {
      Promise.all(animPromises).then(finishCleanup).catch(finishCleanup);
    }
    // Hard fallback cleanup
    setTimeout(finishCleanup, baseDuration + 1000);

    // Sometimes spawn a companion wind in another area of the screen (38% chance)
    if (allowCompanion && Math.random() < 0.38) {
      // Pick opposite diagonal quadrant for balanced composition
      const oppQuad = (quad + 2) % 4;
      const companionDelay = 400 + Math.random() * 800; // 0.4s to 1.2s later
      setTimeout(() => {
        spawnWindSwoosh(false, oppQuad);
      }, companionDelay);
    }
  }

  function scheduleNextBreeze() {
    clearTimeout(windBreezeTimer);
    // More frequent interval: approximately 2.5 to 5.5 seconds
    const delay = 2500 + Math.random() * 3000;
    windBreezeTimer = setTimeout(() => {
      spawnWindSwoosh(true);
      scheduleNextBreeze();
    }, delay);
  }

  function initBreezyWindSystem() {
    if (!windSwooshLayer) return;
    // Initial gust shortly after load/unfold (2.2 seconds)
    setTimeout(() => {
      spawnWindSwoosh(true);
      scheduleNextBreeze();
    }, 2200);
  }

  // Expose global helpers
  window.Sketchbook = {
    initAudio,
    playPaperRustle,
    playPencilScratch,
    playDogBark,
    playEraserSound,
    playBringToLifeSound,
    playDoodleChirp,
    startBackgroundMusic,
    pauseBackgroundMusic,
    toggleBackgroundMusic,
    spawnWindSwoosh
  };

  // Run initial setup
  initTrailCanvas();
  restoreReleasedPetsOnStartup();
  initBreezyWindSystem();

  // Initialize Background Looping Music
  if (musicEnabled) {
    startBackgroundMusic();
  } else {
    updateMusicUI();
  }
})();
