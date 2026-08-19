/**
 * QuantumLords Theme Atmosphere System
 * - Bright Mode: Flying sakura flower petals & golden/emerald leaves drifting with breeze.
 * - Dark Mode: Drifting volumetric nebula clouds, twinkling multi-depth moving stars, and realistic subtle thunderbolt lightning flashes.
 */

(function () {
  let canvas, ctx;
  let animationFrameId = null;
  let currentTheme = 'dark';
  let width = window.innerWidth;
  let height = window.innerHeight;

  // --- Flora / Breeze Particles (Bright Mode) ---
  const floraParticles = [];
  const FLORA_COUNT = 38;

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
      this.opacity = Math.random() * 0.45 + 0.45; // 0.45 - 0.9
      this.swayAmp = Math.random() * 1.8 + 0.6;
      this.swayFreq = Math.random() * 0.02 + 0.01;
      this.time = Math.random() * 1000;

      // Particle Type: 0 = Sakura Petal (Rose Pink), 1 = Sakura Petal (Soft Blossom), 2 = Emerald Leaf, 3 = Golden Amber Leaf
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
      this.x += this.speedX + Math.sin(this.time * this.swayFreq) * this.swayAmp;
      this.y += this.speedY + Math.cos(this.time * this.swayFreq * 0.7) * 0.4;

      // Wrap around bounds
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
        // Draw delicate curved sakura petal
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.9, this.size * 0.6, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.9, this.size * 0.6, -this.size * 0.8, -this.size * 0.5, 0, -this.size);
        
        const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, this.color2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Center petal vein
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.6);
        ctx.lineTo(0, this.size * 0.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      } else {
        // Draw breeze leaf
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.8, 0);
        ctx.quadraticCurveTo(0, -this.size * 0.5, this.size * 0.8, 0);
        ctx.quadraticCurveTo(0, this.size * 0.5, -this.size * 0.8, 0);
        
        const grad = ctx.createLinearGradient(-this.size, 0, this.size, 0);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, this.color2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Leaf spine
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

  // --- Dark Mode Atmosphere (Stars, Nebula Clouds & Lightning) ---
  const stars = [];
  const STAR_COUNT = 90;
  const nebulaClouds = [];
  const NEBULA_COUNT = 5;

  class Star {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.12;
      this.speedY = (Math.random() - 0.5) * 0.12;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.twinkleSpeed = Math.random() * 0.03 + 0.01;
      this.phase = Math.random() * Math.PI * 2;
      this.color = Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#00F0FF' : '#E8C56A');
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
      ctx.globalAlpha = Math.max(0.1, currentAlpha);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Bright cross star sparkle
      if (this.radius > 1.4 && currentAlpha > 0.7) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x - 4, this.y);
        ctx.lineTo(this.x + 4, this.y);
        ctx.moveTo(this.x, this.y - 4);
        ctx.lineTo(this.x, this.y + 4);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  class NebulaCloud {
    constructor(index) {
      this.index = index;
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * (height * 0.85);
      this.radius = Math.random() * 250 + 200;
      this.speedX = (Math.random() * 0.15 + 0.05) * (Math.random() > 0.5 ? 1 : -1);
      this.speedY = (Math.random() * 0.08 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
      this.phase = Math.random() * Math.PI * 2;
      this.phaseSpeed = Math.random() * 0.005 + 0.002;
      
      const palettes = [
        { r: 0, g: 240, b: 255, maxAlpha: 0.045 },   // Neon Cyan
        { r: 139, g: 92, b: 246, maxAlpha: 0.040 },  // Cosmic Violet
        { r: 232, g: 197, b: 106, maxAlpha: 0.035 }, // Imperial Gold
        { r: 255, g: 0, b: 85, maxAlpha: 0.030 },    // Cyber Crimson
        { r: 14, g: 116, b: 144, maxAlpha: 0.040 }   // Deep Oceanic
      ];
      this.palette = palettes[this.index % palettes.length];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.phase += this.phaseSpeed;

      if (this.x < -this.radius) this.x = width + this.radius;
      if (this.x > width + this.radius) this.x = -this.radius;
      if (this.y < -this.radius) this.y = height + this.radius;
      if (this.y > height + this.radius) this.y = -this.radius;
    }

    draw(ctx) {
      const alpha = this.palette.maxAlpha * (0.8 + 0.2 * Math.sin(this.phase));
      const currentRadius = this.radius * (1 + 0.08 * Math.sin(this.phase * 0.7));

      ctx.save();
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentRadius);
      const { r, g, b } = this.palette;
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Thunderbolt / Lightning System (High-Frequency & Multi-Variation) ---
  const activeStrikes = [];

  function createLightningBolt(startX, startY, endX, endY) {
    const segments = [];
    let curX = startX;
    let curY = startY;
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(8, Math.floor(distance / 18));
    const stepX = dx / steps;
    const stepY = dy / steps;

    for (let i = 0; i < steps; i++) {
      const nextX = curX + stepX + (Math.random() - 0.5) * 32;
      const nextY = curY + stepY + (Math.random() - 0.5) * 14;
      segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

      // Fork branch chance
      if (Math.random() < 0.32 && segments.length < 24) {
        let forkX = nextX;
        let forkY = nextY;
        const forkSteps = Math.floor(Math.random() * 4) + 2;
        for (let j = 0; j < forkSteps; j++) {
          const fNextX = forkX + (Math.random() - 0.5) * 28 + (dx > 0 ? 8 : -8);
          const fNextY = forkY + Math.random() * 22 + 6;
          segments.push({ x1: forkX, y1: forkY, x2: fNextX, y2: fNextY, isFork: true });
          forkX = fNextX;
          forkY = fNextY;
        }
      }

      curX = nextX;
      curY = nextY;
    }
    return segments;
  }

  function spawnStrike(type = null) {
    if (!type) {
      const rand = Math.random();
      if (rand < 0.55) type = 'direct'; // Vertical ground fork strike
      else if (rand < 0.82) type = 'crawler'; // High sky crawler
      else type = 'sheet'; // Ambient cloud flash
    }

    const colors = [
      { glow: 'rgba(0, 240, 255, 0.75)', core: '#ffffff', flash: 'rgba(0, 240, 255, 0.22)' },
      { glow: 'rgba(192, 132, 252, 0.75)', core: '#ffffff', flash: 'rgba(139, 92, 246, 0.18)' },
      { glow: 'rgba(232, 197, 106, 0.70)', core: '#fffdf0', flash: 'rgba(232, 197, 106, 0.16)' }
    ];
    const colorScheme = colors[Math.floor(Math.random() * colors.length)];

    let startX, startY, endX, endY, bolts = [];

    if (type === 'direct') {
      startX = Math.random() * (width * 0.8) + width * 0.1;
      startY = 0;
      endX = startX + (Math.random() - 0.5) * (width * 0.25);
      endY = Math.random() * (height * 0.55) + height * 0.25;
      bolts = createLightningBolt(startX, startY, endX, endY);
    } else if (type === 'crawler') {
      startX = Math.random() * (width * 0.4) + width * 0.05;
      startY = Math.random() * (height * 0.25);
      endX = startX + Math.random() * (width * 0.5) + width * 0.2;
      endY = startY + (Math.random() - 0.5) * 60;
      bolts = createLightningBolt(startX, startY, endX, endY);
    } else {
      startX = Math.random() * width;
      startY = Math.random() * (height * 0.35);
    }

    activeStrikes.push({
      type,
      x: startX,
      y: startY,
      bolts,
      intensity: 1.0,
      decay: Math.random() * 0.045 + 0.040,
      color: colorScheme,
      flicker: true
    });

    // 40% chance of a rapid twin secondary strike
    if (Math.random() < 0.40) {
      setTimeout(() => {
        if (currentTheme === 'dark') {
          spawnStrike('direct');
        }
      }, Math.random() * 120 + 70);
    }
  }

  let lightningTimer = 0;
  let nextLightningInterval = Math.floor(Math.random() * 80) + 70; // High frequency (~1.2 - 2.5s)

  function updateAndDrawLightning(ctx) {
    lightningTimer++;
    if (lightningTimer >= nextLightningInterval) {
      spawnStrike();
      lightningTimer = 0;
      nextLightningInterval = Math.floor(Math.random() * 90) + 60; // 1 to 2.5 seconds between strikes
    }

    for (let i = activeStrikes.length - 1; i >= 0; i--) {
      const strike = activeStrikes[i];
      strike.intensity -= strike.decay;

      if (strike.intensity <= 0) {
        activeStrikes.splice(i, 1);
        continue;
      }

      ctx.save();
      const currentIntensity = strike.flicker && Math.random() < 0.25 
        ? strike.intensity * 0.6 
        : strike.intensity;

      // 1. Ambient Sky Flash Glow
      const flashRadius = strike.type === 'sheet' ? width * 1.1 : width * 0.85;
      const flashGrad = ctx.createRadialGradient(
        strike.x, strike.y, 0,
        strike.x, strike.y, flashRadius
      );
      flashGrad.addColorStop(0, strike.color.flash.replace(/[\d\.]+\)$/, `${currentIntensity * 0.35})`));
      flashGrad.addColorStop(0.5, strike.color.flash.replace(/[\d\.]+\)$/, `${currentIntensity * 0.12})`));
      flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Lightning Bolt Paths
      if (strike.bolts.length > 0) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer electric halo glow
        ctx.strokeStyle = strike.color.glow.replace(/[\d\.]+\)$/, `${currentIntensity * 0.85})`);
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        strike.bolts.forEach(seg => {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        });
        ctx.stroke();

        // Secondary mid-core
        ctx.strokeStyle = strike.color.glow;
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        strike.bolts.forEach(seg => {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        });
        ctx.stroke();

        // High-voltage bright white core
        ctx.strokeStyle = strike.color.core;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        strike.bolts.forEach(seg => {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        });
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // --- Main Init and Animation Loop ---
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
      canvas.style.zIndex = '0'; // Behind content
      canvas.style.opacity = '1';
      canvas.style.transition = 'opacity 0.5s ease';
      document.body.insertBefore(canvas, document.body.firstChild);
    }

    ctx = canvas.getContext('2d');
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Initialize particles
    floraParticles.length = 0;
    for (let i = 0; i < FLORA_COUNT; i++) {
      floraParticles.push(new FloraParticle(true));
    }

    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(new Star());
    }

    nebulaClouds.length = 0;
    for (let i = 0; i < NEBULA_COUNT; i++) {
      nebulaClouds.push(new NebulaCloud(i));
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
    currentTheme = isLight ? 'light' : 'dark';
  }

  function render() {
    checkCurrentTheme();
    ctx.clearRect(0, 0, width, height);

    if (currentTheme === 'light') {
      // Render Flying Sakura Flora Breeze
      floraParticles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
    } else {
      // Render Dark Cosmic Storm (Clouds, Stars & Thunderbolts)
      nebulaClouds.forEach(c => {
        c.update();
        c.draw(ctx);
      });

      stars.forEach(s => {
        s.update();
        s.draw(ctx);
      });

      updateAndDrawLightning(ctx);
    }

    animationFrameId = requestAnimationFrame(render);
  }

  function startLoop() {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(render);
    }
  }

  // Hook into DOMContentLoaded and theme toggles
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAtmosphere);
  } else {
    initAtmosphere();
  }

  window.updateAtmosphereTheme = function () {
    checkCurrentTheme();
  };
})();
