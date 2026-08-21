/**
 * QuantumLords Theme Atmosphere System v3.0
 * - Bright Mode: Dynamic Wind Streams & Breeze Eddies, Flying funny character emotes (Tung Tung Emotes 01-06)
 *                tumbling and soaring in the wind, Sakura & Leaf Petals, and Random Edge Peeking (tung tung peek).
 * - Dark Mode: Atmospheric Thunderstorm with Branching Thunderbolts, Moving Dark Storm Clouds,
 *              Multi-Depth Rain Drops with Splashes, and Nocturnal Cyber Bats.
 */

(function () {
  let canvas, ctx;
  let animationFrameId = null;
  let currentTheme = 'dark';
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Global Thunderstorm Ambient Flash State
  let ambientFlashAlpha = 0;
  let flashOrigin = { x: 0, y: 0 };
  let activeLightningBolts = [];

  // =========================================================================
  // 0. ASSET MANAGER FOR TUNG TUNG BRIGHT MODE ASSETS
  // =========================================================================
  const TUNG_EMOTE_FILENAMES = [
    'Tung tung emote 01.png',
    'Tung tung emote 02.png',
    'Tung tung emote 03.png',
    'Tung tung emote 04.png',
    'Tung tung emote 05.png',
    'Tung tung emote 06.png'
  ];
  const TUNG_PEEK_FILENAME = 'tung tung peek.png';

  const loadedTungEmotes = [];
  let loadedTungPeekImage = null;
  let assetsInitialized = false;

  function resolveAssetBase() {
    const scripts = document.querySelectorAll('script[src*="theme-atmosphere.js"]');
    if (scripts.length > 0) {
      const src = scripts[scripts.length - 1].getAttribute('src');
      const lastSlash = src.lastIndexOf('/');
      if (lastSlash !== -1) {
        return src.substring(0, lastSlash + 1);
      }
    }
    const path = window.location.pathname.toLowerCase();
    if (
      path.includes('/roster/') ||
      path.includes('/achievements/') ||
      path.includes('/news/') ||
      path.includes('/tournaments/') ||
      path.includes('/free-fire/') ||
      path.includes('/recruit/') ||
      path.includes('/sponsors/') ||
      path.includes('/contact/') ||
      path.includes('/portal/') ||
      path.includes('/tactics/') ||
      path.includes('/team-updates/') ||
      path.includes('/rewards/')
    ) {
      return '../';
    }
    return './';
  }

  function initTungAssets() {
    if (assetsInitialized) return;
    assetsInitialized = true;
    const base = resolveAssetBase();
    const folder = `${base}assets/TungTung effect/`;

    TUNG_EMOTE_FILENAMES.forEach((filename) => {
      const img = new Image();
      img.src = encodeURI(`${folder}${filename}`);
      img.onload = () => {
        loadedTungEmotes.push(img);
      };
    });

    loadedTungPeekImage = new Image();
    loadedTungPeekImage.src = encodeURI(`${folder}${TUNG_PEEK_FILENAME}`);
  }

  // =========================================================================
  // 1. WIND STREAMS & GUST ENGINE (Bright Mode Atmosphere)
  // =========================================================================
  let globalWindGust = 1.0;
  let gustCycle = 0;
  let nextGustTime = 220;

  const windStreams = [];
  const WIND_STREAM_COUNT = 24;

  class WindStream {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * (width + 200) - 100 : -Math.random() * 200 - 60;
      this.y = Math.random() * height;
      this.length = Math.random() * 240 + 120; // 120px - 360px
      this.speedX = Math.random() * 3.0 + 2.4;
      this.speedY = (Math.random() - 0.48) * 0.9;
      this.thickness = Math.random() * 2.4 + 0.8;
      this.alpha = Math.random() * 0.35 + 0.16;
      this.waveFreq = Math.random() * 0.014 + 0.007;
      this.waveAmp = Math.random() * 16 + 6;
      this.phase = Math.random() * Math.PI * 2;
      this.isSwirl = Math.random() < 0.28;
      this.swirlRadius = Math.random() * 15 + 8;
      this.swirlAngle = 0;

      // Soft light breeze colors: sky cyan, airy white, hint of sunbeam gold
      const palette = [
        'rgba(56, 189, 248, ',   // Sky Cyan
        'rgba(147, 197, 253, ',  // Soft Periwinkle Breeze
        'rgba(255, 255, 255, ',  // Pure Wind Air
        'rgba(251, 191, 36, '    // Sunbeam Gold Breeze
      ];
      this.colorPrefix = palette[Math.floor(Math.random() * palette.length)];
    }

    update() {
      const gustEffect = globalWindGust;
      this.x += (this.speedX * gustEffect);
      this.y += this.speedY;
      this.phase += 0.04 * gustEffect;

      if (this.isSwirl) {
        this.swirlAngle += 0.065 * gustEffect;
      }

      if (this.x - this.length > width + 80) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.save();
      const currentAlpha = this.alpha * (0.8 + 0.2 * Math.sin(this.phase));
      ctx.strokeStyle = `${this.colorPrefix}${currentAlpha})`;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();

      const segments = 14;
      const segLength = this.length / segments;

      for (let i = 0; i <= segments; i++) {
        const segX = this.x - (this.length - i * segLength);
        const segY = this.y + Math.sin((segX * this.waveFreq) + this.phase) * this.waveAmp;

        if (i === 0) {
          ctx.moveTo(segX, segY);
        } else {
          ctx.lineTo(segX, segY);
        }
      }
      ctx.stroke();

      // Swirl micro-vortex at head of wind
      if (this.isSwirl) {
        const headX = this.x;
        const headY = this.y + Math.sin((headX * this.waveFreq) + this.phase) * this.waveAmp;
        ctx.beginPath();
        ctx.arc(
          headX,
          headY,
          this.swirlRadius,
          this.swirlAngle,
          this.swirlAngle + Math.PI * 1.35
        );
        ctx.strokeStyle = `${this.colorPrefix}${currentAlpha * 0.85})`;
        ctx.lineWidth = Math.max(0.6, this.thickness * 0.75);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function updateWindGustSystem() {
    gustCycle++;
    if (gustCycle >= nextGustTime) {
      // Trigger dynamic wind gust
      globalWindGust = 2.4 + Math.random() * 1.5;
      gustCycle = 0;
      nextGustTime = Math.floor(Math.random() * 260) + 200; // 3.5s to 7.5s interval
    } else if (globalWindGust > 1.0) {
      globalWindGust -= 0.015;
      if (globalWindGust < 1.0) globalWindGust = 1.0;
    }
  }

  // =========================================================================
  // 2. FLYING TUNG TUNG FUNNY CHARACTER PARTICLES (Bright Mode)
  // =========================================================================
  const tungFlyingParticles = [];
  const TUNG_PARTICLE_COUNT = 16;

  class TungTungFlyingParticle {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.imgIndex = Math.floor(Math.random() * 6); // Pick emote 0 to 5
      this.x = initial ? Math.random() * (width + 120) - 60 : -Math.random() * 100 - 60;
      this.y = initial ? Math.random() * height : Math.random() * height * 0.95;
      
      // Sizing & depth layers: distant (34-44px), midground (46-58px), foreground (62-76px)
      const layerRand = Math.random();
      if (layerRand < 0.40) {
        this.size = Math.random() * 10 + 34; // Small
        this.speedX = Math.random() * 1.6 + 1.8;
        this.speedY = (Math.random() - 0.45) * 0.8;
        this.opacity = Math.random() * 0.25 + 0.60;
        this.depth = 0;
      } else if (layerRand < 0.80) {
        this.size = Math.random() * 12 + 46; // Medium
        this.speedX = Math.random() * 2.2 + 2.4;
        this.speedY = (Math.random() - 0.42) * 1.1;
        this.opacity = Math.random() * 0.20 + 0.78;
        this.depth = 1;
      } else {
        this.size = Math.random() * 14 + 60; // Large foreground
        this.speedX = Math.random() * 2.8 + 3.0;
        this.speedY = (Math.random() - 0.40) * 1.4;
        this.opacity = Math.random() * 0.15 + 0.85;
        this.depth = 2;
      }

      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.055;
      this.wobblePhase = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.035 + 0.02;
      this.wobbleAmp = Math.random() * 2.2 + 1.0;
      this.time = Math.random() * 1000;
    }

    update() {
      this.time += 1;
      this.wobblePhase += this.wobbleSpeed;
      
      const gust = globalWindGust;
      this.angle += this.angularSpeed * (0.8 + gust * 0.4);

      // Carried forward and upward by breeze
      this.x += (this.speedX * gust) + Math.sin(this.wobblePhase) * this.wobbleAmp;
      this.y += this.speedY + Math.cos(this.wobblePhase * 0.8) * (this.wobbleAmp * 0.7);

      if (this.x > width + 100 || this.y > height + 100 || this.y < -120) {
        this.reset(false);
      }
    }

    draw(ctx) {
      if (loadedTungEmotes.length === 0) return;
      const img = loadedTungEmotes[this.imgIndex % loadedTungEmotes.length];
      if (!img || !img.complete) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;

      // Soft wind-motion shadow
      if (this.depth === 2) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
      }

      const half = this.size * 0.5;
      ctx.drawImage(img, -half, -half, this.size, this.size);
      ctx.restore();
    }
  }

  // =========================================================================
  // 3. SPECIAL TUNG TUNG EDGE PEEKING CONTROLLER (Bright Mode Only)
  // =========================================================================
  let peekController = null;

  class TungTungPeekController {
    constructor() {
      this.wrapper = null;
      this.img = null;
      this.isActive = false;
      this.peekTimer = null;
      this.nextPeekTimeout = null;
      this.initDOM();
      this.scheduleNextPeek(3200); // First peek after 3.2 seconds
    }

    initDOM() {
      if (document.getElementById('tungTungPeekWrapper')) {
        this.wrapper = document.getElementById('tungTungPeekWrapper');
        this.img = document.getElementById('tungTungPeekImg');
        return;
      }

      this.wrapper = document.createElement('div');
      this.wrapper.id = 'tungTungPeekWrapper';
      this.wrapper.className = 'tung-peek-wrapper';

      this.img = document.createElement('img');
      this.img.id = 'tungTungPeekImg';
      this.img.alt = 'Tung Tung Peek';

      const base = resolveAssetBase();
      this.img.src = encodeURI(`${base}assets/TungTung effect/${TUNG_PEEK_FILENAME}`);

      this.wrapper.appendChild(this.img);
      document.body.appendChild(this.wrapper);
    }

    scheduleNextPeek(delay) {
      if (this.nextPeekTimeout) clearTimeout(this.nextPeekTimeout);
      const waitTime = delay || (Math.random() * 4500 + 4000); // 4s to 8.5s
      this.nextPeekTimeout = setTimeout(() => {
        if (currentTheme === 'light') {
          this.triggerRandomPeek();
        } else {
          this.scheduleNextPeek(4000);
        }
      }, waitTime);
    }

    triggerRandomPeek() {
      if (currentTheme !== 'light' || this.isActive || !this.wrapper) return;
      this.isActive = true;

      // Choose side: 'left', 'right', 'bottom', 'top'
      const sides = ['left', 'right', 'bottom', 'top'];
      const side = sides[Math.floor(Math.random() * sides.length)];

      this.wrapper.style.transition = 'none';
      this.wrapper.style.left = 'auto';
      this.wrapper.style.right = 'auto';
      this.wrapper.style.top = 'auto';
      this.wrapper.style.bottom = 'auto';

      let enterTransform = '';
      let activeTransform = '';
      let exitTransform = '';

      if (side === 'left') {
        const topPos = Math.random() * 50 + 25; // 25% to 75%
        this.wrapper.style.left = '0px';
        this.wrapper.style.top = `${topPos}%`;
        enterTransform = 'translate(-115%, 0) rotate(18deg)';
        activeTransform = 'translate(-18%, 0) rotate(10deg)';
        exitTransform = 'translate(-120%, 0) rotate(22deg)';
      } else if (side === 'right') {
        const topPos = Math.random() * 50 + 25; // 25% to 75%
        this.wrapper.style.right = '0px';
        this.wrapper.style.top = `${topPos}%`;
        enterTransform = 'translate(115%, 0) rotate(-18deg) scaleX(-1)';
        activeTransform = 'translate(18%, 0) rotate(-10deg) scaleX(-1)';
        exitTransform = 'translate(120%, 0) rotate(-22deg) scaleX(-1)';
      } else if (side === 'bottom') {
        const leftPos = Math.random() * 60 + 20; // 20% to 80%
        this.wrapper.style.bottom = '0px';
        this.wrapper.style.left = `${leftPos}%`;
        enterTransform = 'translate(-50%, 115%) rotate(6deg)';
        activeTransform = 'translate(-50%, 22%) rotate(2deg)';
        exitTransform = 'translate(-50%, 120%) rotate(-6deg)';
      } else { // top
        const leftPos = Math.random() * 60 + 20;
        this.wrapper.style.top = '0px';
        this.wrapper.style.left = `${leftPos}%`;
        enterTransform = 'translate(-50%, -115%) rotate(180deg)';
        activeTransform = 'translate(-50%, -24%) rotate(180deg)';
        exitTransform = 'translate(-50%, -120%) rotate(180deg)';
      }

      this.wrapper.style.transform = enterTransform;
      this.wrapper.classList.remove('active');

      // Force layout reflow
      void this.wrapper.offsetWidth;

      // Animate In with spring easing
      this.wrapper.style.transition = 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease';
      this.wrapper.style.transform = activeTransform;
      this.wrapper.classList.add('active');

      // Stay peeking for 2.6s - 3.8s
      const stayDuration = Math.random() * 1200 + 2600;
      this.peekTimer = setTimeout(() => {
        this.hidePeek(exitTransform);
      }, stayDuration);
    }

    hidePeek(exitTransform) {
      if (!this.wrapper) return;
      this.wrapper.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease';
      if (exitTransform) {
        this.wrapper.style.transform = exitTransform;
      }
      this.wrapper.classList.remove('active');

      setTimeout(() => {
        this.isActive = false;
        this.scheduleNextPeek();
      }, 550);
    }

    cancelImmediately() {
      if (this.peekTimer) clearTimeout(this.peekTimer);
      if (this.wrapper) {
        this.wrapper.classList.remove('active');
        this.wrapper.style.transform = 'translate(-200%, -200%)';
      }
      this.isActive = false;
    }
  }

  // =========================================================================
  // 4. FLORA / BREEZE PARTICLES (Bright Mode)
  // =========================================================================
  const floraParticles = [];
  const FLORA_COUNT = 34;

  class FloraParticle {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : -30;
      this.y = initial ? Math.random() * height : Math.random() * height * 0.85;
      this.size = Math.random() * 9 + 6; // 6px - 15px
      this.speedX = Math.random() * 1.8 + 1.2;
      this.speedY = Math.random() * 0.9 + 0.3;
      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.04;
      this.flip = Math.random() * Math.PI * 2;
      this.flipSpeed = Math.random() * 0.03 + 0.01;
      this.opacity = Math.random() * 0.45 + 0.45;
      this.swayAmp = Math.random() * 1.8 + 0.6;
      this.swayFreq = Math.random() * 0.02 + 0.01;
      this.time = Math.random() * 1000;

      const rand = Math.random();
      if (rand < 0.45) {
        this.type = 'sakura';
        this.color = '#f472b6';
        this.color2 = '#fda4af';
      } else if (rand < 0.70) {
        this.type = 'blossom';
        this.color = '#fb7185';
        this.color2 = '#fecdd3';
      } else if (rand < 0.85) {
        this.type = 'emerald_leaf';
        this.color = '#34d399';
        this.color2 = '#10b981';
      } else {
        this.type = 'gold_leaf';
        this.color = '#f59e0b';
        this.color2 = '#fbbf24';
      }
    }

    update() {
      this.time += 1;
      this.angle += this.angularSpeed;
      this.flip += this.flipSpeed;
      
      const gust = globalWindGust;
      this.x += (this.speedX * gust) + Math.sin(this.time * this.swayFreq) * this.swayAmp;
      this.y += this.speedY + Math.cos(this.time * this.swayFreq * 0.7) * 0.4;

      if (this.x > width + 40 || this.y > height + 40) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(Math.cos(this.flip), 1);
      ctx.globalAlpha = this.opacity;

      if (this.type === 'sakura' || this.type === 'blossom') {
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.9, this.size * 0.6, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.9, this.size * 0.6, -this.size * 0.8, -this.size * 0.5, 0, -this.size);

        const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, this.color2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.6);
        ctx.lineTo(0, this.size * 0.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.8, 0);
        ctx.quadraticCurveTo(0, -this.size * 0.5, this.size * 0.8, 0);
        ctx.quadraticCurveTo(0, this.size * 0.5, -this.size * 0.8, 0);

        const grad = ctx.createLinearGradient(-this.size, 0, this.size, 0);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, this.color2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-this.size * 0.7, 0);
        ctx.lineTo(this.size * 0.7, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // =========================================================================
  // 2. MOVING DARK STORM CLOUDS (Dark Mode)
  // =========================================================================
  const stormClouds = [];
  const CLOUD_COUNT = 9;

  class DarkStormCloud {
    constructor(index) {
      this.index = index;
      this.reset(true);
    }

    reset(initial = false) {
      this.width = Math.random() * 450 + 350;
      this.height = Math.random() * 180 + 120;
      this.x = initial ? Math.random() * (width + this.width) - this.width : -this.width - 60;
      this.y = Math.random() * (height * 0.55) - 40;
      this.layer = this.index % 3; // 0 = Deep back, 1 = Mid heavy, 2 = Foreground scud
      
      // Speed according to depth
      if (this.layer === 0) {
        this.speedX = Math.random() * 0.18 + 0.08;
        this.baseOpacity = Math.random() * 0.35 + 0.40;
      } else if (this.layer === 1) {
        this.speedX = Math.random() * 0.35 + 0.18;
        this.baseOpacity = Math.random() * 0.30 + 0.45;
      } else {
        this.speedX = Math.random() * 0.55 + 0.30;
        this.baseOpacity = Math.random() * 0.25 + 0.30;
      }

      // Generate organic cloud puffs
      this.puffs = [];
      const puffCount = Math.floor(Math.random() * 6) + 8;
      for (let i = 0; i < puffCount; i++) {
        this.puffs.push({
          relX: (Math.random() - 0.5) * this.width * 0.85,
          relY: (Math.random() - 0.5) * this.height * 0.70,
          radiusX: Math.random() * 110 + 70,
          radiusY: Math.random() * 80 + 50,
          density: Math.random() * 0.4 + 0.6
        });
      }

      // Dark Storm Color Palettes
      const cloudShades = [
        { r: 4, g: 6, b: 12 },    // Obsidian Storm
        { r: 8, g: 12, b: 22 },   // Midnight Thunder
        { r: 12, g: 18, b: 32 },  // Deep Charcoal Blue
        { r: 15, g: 22, b: 38 }   // Atmospheric Storm Gray
      ];
      this.shade = cloudShades[this.index % cloudShades.length];
    }

    update() {
      this.x += this.speedX;
      if (this.x > width + 100) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.save();
      const { r, g, b } = this.shade;

      // Illumination boost from lightning strikes
      const flashBoost = ambientFlashAlpha * 0.85;
      const currentAlpha = Math.min(0.95, this.baseOpacity + flashBoost * 0.5);

      for (let i = 0; i < this.puffs.length; i++) {
        const puff = this.puffs[i];
        const px = this.x + this.width * 0.5 + puff.relX;
        const py = this.y + this.height * 0.5 + puff.relY;

        ctx.save();
        ctx.translate(px, py);

        const grad = ctx.createRadialGradient(0, 0, puff.radiusX * 0.15, 0, 0, puff.radiusX);

        if (flashBoost > 0.05) {
          // Cloud rims catch neon electric illumination during strikes
          const flashR = Math.min(255, r + Math.floor(flashBoost * 180));
          const flashG = Math.min(255, g + Math.floor(flashBoost * 220));
          const flashB = Math.min(255, b + Math.floor(flashBoost * 255));

          grad.addColorStop(0, `rgba(${flashR}, ${flashG}, ${flashB}, ${currentAlpha * puff.density * 0.9})`);
          grad.addColorStop(0.5, `rgba(${r + 15}, ${g + 25}, ${b + 40}, ${currentAlpha * puff.density * 0.6})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        } else {
          // Deep atmospheric dark cloud
          grad.addColorStop(0, `rgba(${r + 8}, ${g + 12}, ${b + 20}, ${currentAlpha * puff.density * 0.85})`);
          grad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${currentAlpha * puff.density * 0.5})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, puff.radiusX, puff.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // =========================================================================
  // 3. THUNDERBOLT & LIGHTNING STRIKE ENGINE (Dark Mode)
  // =========================================================================
  class Thunderbolt {
    constructor(startX, startY, targetX, targetY, isMainFork = true) {
      this.startX = startX;
      this.startY = startY;
      this.targetX = targetX;
      this.targetY = targetY;
      this.isMainFork = isMainFork;
      this.life = 0;
      this.maxLife = Math.floor(Math.random() * 10) + 18; // 18 - 28 frames
      this.segments = [];
      this.branches = [];

      // Color Theme: Electric Neon Cyan & Pure White Plasma Core
      const themes = [
        { outer: 'rgba(0, 240, 255, 0.85)', mid: 'rgba(125, 245, 255, 0.95)', core: '#ffffff', glow: '#00F0FF' },
        { outer: 'rgba(168, 85, 247, 0.80)', mid: 'rgba(216, 180, 254, 0.90)', core: '#ffffff', glow: '#A855F7' },
        { outer: 'rgba(56, 189, 248, 0.85)', mid: 'rgba(186, 230, 253, 0.95)', core: '#ffffff', glow: '#38BDF8' },
        { outer: 'rgba(232, 197, 106, 0.80)', mid: 'rgba(254, 240, 138, 0.90)', core: '#ffffff', glow: '#E8C56A' }
      ];
      this.theme = themes[Math.floor(Math.random() * themes.length)];

      this.generateBolt();
    }

    generateBolt() {
      const points = [{ x: this.startX, y: this.startY }];
      const totalDistY = this.targetY - this.startY;
      const steps = Math.max(12, Math.floor(totalDistY / 28));

      let currX = this.startX;
      let currY = this.startY;

      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        const targetPointX = this.startX + (this.targetX - this.startX) * progress;
        const targetPointY = this.startY + totalDistY * progress;

        const jitterX = (Math.random() - 0.5) * (this.isMainFork ? 48 : 26);
        const jitterY = (Math.random() - 0.5) * 14;

        currX = targetPointX + jitterX;
        currY = targetPointY + jitterY;

        points.push({ x: currX, y: currY });

        // Branching secondary forks
        if (this.isMainFork && Math.random() < 0.28 && i < steps - 2) {
          const branchAngle = (Math.random() - 0.5) * 0.9 + (Math.random() > 0.5 ? 0.6 : -0.6);
          const branchLength = (Math.random() * 0.4 + 0.25) * (height - currY);
          const branchTargetX = currX + Math.sin(branchAngle) * branchLength;
          const branchTargetY = currY + Math.cos(branchAngle) * branchLength;

          const branch = new Thunderbolt(currX, currY, branchTargetX, branchTargetY, false);
          this.branches.push(branch);
        }
      }

      this.segments = points;
    }

    update() {
      this.life++;
      this.branches.forEach(b => b.update());
      return this.life < this.maxLife;
    }

    draw(ctx) {
      if (this.segments.length < 2) return;

      // Realistic lightning flicker function
      let alpha = 1;
      if (this.life <= 3) {
        alpha = Math.random() * 0.4 + 0.6; // initial leader
      } else if (this.life <= 7) {
        alpha = 1.0; // peak return stroke
      } else if (this.life <= 14) {
        alpha = Math.random() > 0.35 ? 0.85 : 0.25; // multi-stage flickering discharge
      } else {
        alpha = Math.max(0, (this.maxLife - this.life) / (this.maxLife - 14)); // ionized decay
      }

      ctx.save();
      ctx.globalAlpha = alpha;

      // 1. Wide Ambient Bloom Pass
      ctx.shadowColor = this.theme.glow;
      ctx.shadowBlur = this.isMainFork ? 24 : 12;
      ctx.strokeStyle = this.theme.outer;
      ctx.lineWidth = this.isMainFork ? 6.5 : 3.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'miter';

      ctx.beginPath();
      ctx.moveTo(this.segments[0].x, this.segments[0].y);
      for (let i = 1; i < this.segments.length; i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.stroke();

      // 2. Bright Mid-Intensity Pass
      ctx.shadowBlur = 10;
      ctx.strokeStyle = this.theme.mid;
      ctx.lineWidth = this.isMainFork ? 3.2 : 1.6;
      ctx.stroke();

      // 3. Hot White Plasma Core Pass
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ffffff';
      ctx.strokeStyle = this.theme.core;
      ctx.lineWidth = this.isMainFork ? 1.4 : 0.8;
      ctx.stroke();

      ctx.restore();

      // Draw branches
      this.branches.forEach(b => b.draw(ctx));
    }
  }

  function triggerLightningStrike(targetX = null, targetY = null) {
    const startX = targetX !== null ? targetX + (Math.random() - 0.5) * 80 : Math.random() * (width * 0.8) + width * 0.1;
    const startY = Math.random() * 50;
    const destX = targetX !== null ? targetX : startX + (Math.random() - 0.5) * 350;
    const destY = targetY !== null ? targetY : Math.random() * (height * 0.4) + height * 0.55;

    const bolt = new Thunderbolt(startX, startY, destX, destY, true);
    activeLightningBolts.push(bolt);

    // Trigger Ambient Sky Flash
    flashOrigin = { x: startX, y: startY };
    ambientFlashAlpha = Math.random() * 0.35 + 0.45; // 0.45 - 0.80

    // Occasional double rapid strike (35% chance)
    if (Math.random() < 0.35) {
      setTimeout(() => {
        if (currentTheme === 'dark') {
          const subStartX = startX + (Math.random() - 0.5) * 120;
          const subDestX = destX + (Math.random() - 0.5) * 160;
          const subBolt = new Thunderbolt(subStartX, startY, subDestX, destY, true);
          activeLightningBolts.push(subBolt);
          ambientFlashAlpha = Math.max(ambientFlashAlpha, Math.random() * 0.3 + 0.35);
        }
      }, Math.random() * 160 + 90);
    }
  }

  // Automatic Lightning Scheduler
  let lightningTimer = 0;
  let nextLightningInterval = Math.floor(Math.random() * 180) + 120; // 2s - 5s at 60fps

  function updateLightningSystem() {
    lightningTimer++;
    if (lightningTimer >= nextLightningInterval) {
      triggerLightningStrike();
      lightningTimer = 0;
      nextLightningInterval = Math.floor(Math.random() * 220) + 140; // Next strike in 2.3s - 6s
    }

    // Decay ambient sky flash
    if (ambientFlashAlpha > 0) {
      ambientFlashAlpha *= 0.88;
      if (ambientFlashAlpha < 0.01) ambientFlashAlpha = 0;
    }

    // Update active bolts
    for (let i = activeLightningBolts.length - 1; i >= 0; i--) {
      const active = activeLightningBolts[i].update();
      if (!active) {
        activeLightningBolts.splice(i, 1);
      }
    }
  }

  function drawAmbientSkyFlash(ctx) {
    if (ambientFlashAlpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // 1. Radial epicenter flash
    const grad = ctx.createRadialGradient(
      flashOrigin.x, flashOrigin.y, 10,
      flashOrigin.x, flashOrigin.y, Math.max(width, height) * 0.95
    );
    grad.addColorStop(0, `rgba(220, 245, 255, ${ambientFlashAlpha * 0.85})`);
    grad.addColorStop(0.3, `rgba(0, 240, 255, ${ambientFlashAlpha * 0.45})`);
    grad.addColorStop(0.7, `rgba(139, 92, 246, ${ambientFlashAlpha * 0.20})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Diffuse atmospheric sheet illumination
    ctx.fillStyle = `rgba(180, 225, 255, ${ambientFlashAlpha * 0.25})`;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  // =========================================================================
  // 4. MULTI-DEPTH RAIN DROPS & SPLASHES (Dark Mode)
  // =========================================================================
  const rainDrops = [];
  const splashParticles = [];
  const RAIN_COUNT = 160;

  class RainDrop {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = Math.random() * (width + 200) - 100;
      this.y = initial ? Math.random() * height : -30;
      this.layer = Math.random(); // 0-0.35: Background, 0.35-0.75: Mid, 0.75-1.0: Foreground

      if (this.layer > 0.75) {
        // Foreground fast, crisp rain
        this.speedY = Math.random() * 9 + 22; // 22 - 31 px/frame
        this.speedX = this.speedY * 0.14;     // wind slant angle
        this.length = Math.random() * 16 + 26; // 26 - 42px
        this.thickness = Math.random() * 0.8 + 1.2;
        this.alpha = Math.random() * 0.35 + 0.45;
        this.color = '#cceeff';
      } else if (this.layer > 0.35) {
        // Midground rain
        this.speedY = Math.random() * 7 + 16;
        this.speedX = this.speedY * 0.13;
        this.length = Math.random() * 12 + 18;
        this.thickness = Math.random() * 0.5 + 0.8;
        this.alpha = Math.random() * 0.25 + 0.30;
        this.color = '#99ddff';
      } else {
        // Distant mist rain
        this.speedY = Math.random() * 5 + 11;
        this.speedX = this.speedY * 0.11;
        this.length = Math.random() * 8 + 12;
        this.thickness = 0.6;
        this.alpha = Math.random() * 0.18 + 0.15;
        this.color = '#66ccff';
      }
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Splash on bottom boundary
      if (this.y >= height - 8) {
        if (this.layer > 0.5 && Math.random() < 0.45) {
          createSplash(this.x, height - Math.random() * 8, this.color);
        }
        this.reset(false);
      }

      if (this.x > width + 80) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.save();
      // Lightning flash makes raindrops flare brightly
      const flashGlow = ambientFlashAlpha * 0.7;
      ctx.globalAlpha = Math.min(1.0, this.alpha + flashGlow);

      ctx.strokeStyle = flashGlow > 0.2 ? '#ffffff' : this.color;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.speedX * (this.length / this.speedY), this.y - this.length);
      ctx.stroke();

      ctx.restore();
    }
  }

  class SplashParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.speedX = (Math.random() - 0.5) * 3.8 + 0.5; // slight wind push
      this.speedY = -(Math.random() * 3.2 + 1.2);
      this.gravity = 0.24;
      this.radius = Math.random() * 1.4 + 0.8;
      this.alpha = Math.random() * 0.5 + 0.5;
      this.life = 0;
      this.maxLife = Math.floor(Math.random() * 8) + 10;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.life++;
      this.alpha = Math.max(0, 1 - (this.life / this.maxLife));
      return this.life < this.maxLife;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function createSplash(x, y, color) {
    const splashCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < splashCount; i++) {
      if (splashParticles.length < 90) {
        splashParticles.push(new SplashParticle(x, y, color));
      }
    }
  }

  // =========================================================================
  // 5. GLOWING NOCTURNAL CYBER BATS (Dark Mode)
  // =========================================================================
  const bats = [];
  const BAT_COUNT = 24;

  class GlowingBat {
    constructor(randomizePos = true) {
      this.reset(randomizePos);
    }

    reset(randomizePos = true) {
      this.direction = Math.random() > 0.45 ? 1 : -1;
      this.scale = Math.random() * 0.65 + 0.38;
      this.x = randomizePos ? Math.random() * width : (this.direction === 1 ? -60 : width + 60);
      this.y = Math.random() * (height * 0.75) + 40;

      this.speedX = (Math.random() * 1.8 + 1.2) * this.direction * this.scale;
      this.speedY = (Math.random() * 0.6 - 0.3) * this.scale;

      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.22 + 0.16;
      this.glideTimer = Math.floor(Math.random() * 120);
      this.isGliding = false;

      this.swoopPhase = Math.random() * Math.PI * 2;
      this.swoopSpeed = Math.random() * 0.032 + 0.016;
      this.swoopAmp = Math.random() * 1.8 + 0.7;

      const glowPalettes = [
        { glow: 'rgba(0, 240, 255, 0.75)', eye: '#00F0FF', rim: 'rgba(0, 240, 255, 0.50)' },
        { glow: 'rgba(192, 132, 252, 0.70)', eye: '#C084FC', rim: 'rgba(192, 132, 252, 0.45)' },
        { glow: 'rgba(255, 215, 0, 0.70)', eye: '#FFD700', rim: 'rgba(255, 215, 0, 0.45)' },
        { glow: 'rgba(255, 0, 85, 0.70)', eye: '#FF0055', rim: 'rgba(255, 0, 85, 0.45)' }
      ];
      this.theme = glowPalettes[Math.floor(Math.random() * glowPalettes.length)];
      this.alpha = Math.min(0.92, this.scale * 0.75 + 0.25);
    }

    update() {
      this.swoopPhase += this.swoopSpeed;
      this.glideTimer++;

      if (this.glideTimer > 115 && Math.random() < 0.04) {
        this.isGliding = true;
        if (this.glideTimer > 175) {
          this.isGliding = false;
          this.glideTimer = 0;
        }
      } else {
        this.isGliding = false;
      }

      if (!this.isGliding) {
        this.wingPhase += this.wingSpeed;
      }

      this.y += Math.sin(this.swoopPhase) * this.swoopAmp + this.speedY;
      this.x += this.speedX;

      if (this.direction === 1 && this.x > width + 80) {
        this.reset(false);
      } else if (this.direction === -1 && this.x < -80) {
        this.reset(false);
      }

      if (this.y < -50) this.y = height + 30;
      if (this.y > height + 50) this.y = -30;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale * this.direction, this.scale);
      ctx.globalAlpha = this.alpha;

      const bankAngle = Math.sin(this.swoopPhase) * 0.22;
      ctx.rotate(bankAngle);

      const flap = this.isGliding ? 0.22 : Math.sin(this.wingPhase);
      const wingY = flap * 12;

      ctx.shadowColor = this.theme.glow;
      ctx.shadowBlur = 10 * this.scale;

      ctx.fillStyle = '#05070e';
      ctx.strokeStyle = this.theme.rim;
      ctx.lineWidth = 1.0;

      // Left Scalloped Bat Wing
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.bezierCurveTo(-8, -11 - wingY, -19, -15 - wingY, -27, -6 - wingY * 0.8);
      ctx.quadraticCurveTo(-21, 2 - wingY * 0.3, -17, 4);
      ctx.quadraticCurveTo(-12, 3, -9, 5);
      ctx.quadraticCurveTo(-4, 4, 0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Scalloped Bat Wing
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.bezierCurveTo(8, -11 - wingY, 19, -15 - wingY, 27, -6 - wingY * 0.8);
      ctx.quadraticCurveTo(21, 2 - wingY * 0.3, 17, 4);
      ctx.quadraticCurveTo(12, 3, 9, 5);
      ctx.quadraticCurveTo(4, 4, 0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bat Torso & Head
      ctx.fillStyle = '#080d1a';
      ctx.beginPath();
      ctx.ellipse(0, 2, 3.2, 6.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -4.5, 3.0, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.beginPath();
      ctx.moveTo(-2.4, -4.5);
      ctx.lineTo(-4.2, -9.5);
      ctx.lineTo(-1.1, -6.2);
      ctx.moveTo(2.4, -4.5);
      ctx.lineTo(4.2, -9.5);
      ctx.lineTo(1.1, -6.2);
      ctx.fill();

      // Glowing Eyes
      ctx.fillStyle = this.theme.eye;
      ctx.shadowColor = this.theme.eye;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(-1.2, -4.8, 0.85, 0, Math.PI * 2);
      ctx.arc(1.2, -4.8, 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // =========================================================================
  // 6. SUBTLE FAINT STARS (Dark Mode Background Depth)
  // =========================================================================
  const stars = [];
  const STAR_COUNT = 55;

  class Star {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 1.2 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.08;
      this.speedY = (Math.random() - 0.5) * 0.08;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.twinkleSpeed = Math.random() * 0.03 + 0.01;
      this.phase = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.phase += this.twinkleSpeed;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw(ctx) {
      const currentAlpha = this.alpha * (0.6 + 0.4 * Math.sin(this.phase));
      ctx.save();
      ctx.globalAlpha = Math.max(0.05, currentAlpha);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // =========================================================================
  // 7. MAIN INITIALIZATION & RENDER PIPELINE
  // =========================================================================
  function initAtmosphere() {
    canvas = document.getElementById('themeAtmosphereCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'themeAtmosphereCanvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '0';
      canvas.style.opacity = '1';
      canvas.style.transition = 'opacity 0.5s ease';
      document.body.insertBefore(canvas, document.body.firstChild);
    }

    ctx = canvas.getContext('2d');
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Interactive Thunderbolt Trigger on Click/Tap (Dark Mode)
    window.addEventListener('pointerdown', (e) => {
      if (currentTheme === 'dark') {
        triggerLightningStrike(e.clientX, e.clientY);
      }
    }, { passive: true });

    // Initialize Tung Tung character assets and peeking controller
    initTungAssets();
    if (!peekController) {
      peekController = new TungTungPeekController();
    }

    // Populate Bright Mode wind streams
    windStreams.length = 0;
    for (let i = 0; i < WIND_STREAM_COUNT; i++) {
      windStreams.push(new WindStream(true));
    }

    // Populate Bright Mode flying emotes
    tungFlyingParticles.length = 0;
    for (let i = 0; i < TUNG_PARTICLE_COUNT; i++) {
      tungFlyingParticles.push(new TungTungFlyingParticle(true));
    }

    // Populate Bright Mode flora
    floraParticles.length = 0;
    for (let i = 0; i < FLORA_COUNT; i++) {
      floraParticles.push(new FloraParticle(true));
    }

    // Populate Dark Mode atmosphere
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(new Star());
    }

    stormClouds.length = 0;
    for (let i = 0; i < CLOUD_COUNT; i++) {
      stormClouds.push(new DarkStormCloud(i));
    }

    rainDrops.length = 0;
    for (let i = 0; i < RAIN_COUNT; i++) {
      rainDrops.push(new RainDrop(true));
    }

    bats.length = 0;
    for (let i = 0; i < BAT_COUNT; i++) {
      bats.push(new GlowingBat(true));
    }

    checkCurrentTheme();
    startLoop();
  }

  function handleResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function checkCurrentTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light' ||
                    document.body.classList.contains('theme-light');
    const prevTheme = currentTheme;
    currentTheme = isLight ? 'light' : 'dark';

    if (prevTheme !== currentTheme && peekController) {
      if (currentTheme === 'dark') {
        peekController.cancelImmediately();
      } else {
        peekController.scheduleNextPeek(2500);
      }
    }
  }

  function render() {
    checkCurrentTheme();
    ctx.clearRect(0, 0, width, height);

    if (currentTheme === 'light') {
      // -------------------------------------------------------------------
      // BRIGHT MODE: WIND STREAMS & FLYING TUNG TUNG FUNNY EMOTES
      // -------------------------------------------------------------------

      // 1. Dynamic Wind Gust Physics System
      updateWindGustSystem();

      // 2. Dynamic Flowing Wind Streams & Swirls
      windStreams.forEach(ws => {
        ws.update();
        ws.draw(ctx);
      });

      // 3. Gentle Sakura Petals & Spring Leaves
      floraParticles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      // 4. Flying Funny Character Pictures (Tung Tung Emotes 01 - 06)
      tungFlyingParticles.forEach(tp => {
        tp.update();
        tp.draw(ctx);
      });

    } else {
      // -------------------------------------------------------------------
      // DARK MODE: THUNDERSTORM ATMOSPHERE
      // -------------------------------------------------------------------

      // Cancel any active peeker in dark mode
      if (peekController && peekController.isActive) {
        peekController.cancelImmediately();
      }

      // 1. Distant Faint Stars
      stars.forEach(s => {
        s.update();
        s.draw(ctx);
      });

      // 2. Moving Dark Storm Clouds
      stormClouds.forEach(c => {
        c.update();
        c.draw(ctx);
      });

      // 3. Lightning Flash Ambient Sky Illumination
      drawAmbientSkyFlash(ctx);

      // 4. Branching Thunderbolts & Lightning Strikes
      updateLightningSystem();
      activeLightningBolts.forEach(b => {
        b.draw(ctx);
      });

      // 5. Multi-Depth Rain Drops & Micro-Splashes
      rainDrops.forEach(r => {
        r.update();
        r.draw(ctx);
      });

      for (let i = splashParticles.length - 1; i >= 0; i--) {
        const alive = splashParticles[i].update();
        if (alive) {
          splashParticles[i].draw(ctx);
        } else {
          splashParticles.splice(i, 1);
        }
      }

      // 6. Glowing Nocturnal Cyber Bats Swooping Through Storm
      bats.forEach(b => {
        b.update();
        b.draw(ctx);
      });
    }

    animationFrameId = requestAnimationFrame(render);
  }

  function startLoop() {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(render);
    }
  }

  // Hook into DOM lifecycle and theme toggle events
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAtmosphere);
  } else {
    initAtmosphere();
  }

  window.updateAtmosphereTheme = function () {
    checkCurrentTheme();
  };

  // Expose manual lightning trigger API if desired
  window.triggerThunderbolt = function (x, y) {
    triggerLightningStrike(x, y);
  };
})();
