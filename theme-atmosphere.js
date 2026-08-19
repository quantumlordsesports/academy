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

  // --- Thunderbolt / Lightning System ---
  let lightningState = {
    active: false,
    timer: 0,
    nextStrikeTime: 350 + Math.random() * 500, // frames (~8-15 seconds)
    intensity: 0,
    bolts: [],
    x: 0
  };

  function createLightningBolt(startX, startY, endY) {
    const segments = [];
    let curX = startX;
    let curY = startY;
    const maxSegmentLength = 22;

    while (curY < endY) {
      const nextY = curY + Math.random() * maxSegmentLength + 10;
      const nextX = curX + (Math.random() - 0.5) * 35;
      segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

      // Fork chance
      if (Math.random() < 0.25 && segments.length < 18) {
        let forkX = nextX;
        let forkY = nextY;
        for (let j = 0; j < 3; j++) {
          const fNextX = forkX + (Math.random() - 0.4) * 30;
          const fNextY = forkY + Math.random() * 20 + 8;
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

  function triggerLightning() {
    lightningState.active = true;
    lightningState.intensity = 1.0;
    lightningState.x = Math.random() * (width * 0.7) + width * 0.15;
    const strikeEndY = Math.random() * (height * 0.45) + height * 0.25;
    lightningState.bolts = createLightningBolt(lightningState.x, 0, strikeEndY);
  }

  function updateLightning() {
    lightningState.timer++;
    if (lightningState.timer >= lightningState.nextStrikeTime) {
      triggerLightning();
      lightningState.timer = 0;
      lightningState.nextStrikeTime = 400 + Math.random() * 600; // Next strike in 8-16 seconds
    }

    if (lightningState.active) {
      lightningState.intensity -= 0.038;
      if (lightningState.intensity <= 0) {
        lightningState.active = false;
        lightningState.intensity = 0;
        lightningState.bolts = [];
      }
    }
  }

  function drawLightning(ctx) {
    if (!lightningState.active || lightningState.intensity <= 0) return;

    ctx.save();
    // Ambient Flash Illumination across the sky
    const flashGrad = ctx.createRadialGradient(
      lightningState.x, 0, 0,
      lightningState.x, 0, width * 0.9
    );
    flashGrad.addColorStop(0, `rgba(0, 240, 255, ${lightningState.intensity * 0.18})`);
    flashGrad.addColorStop(0.4, `rgba(139, 92, 246, ${lightningState.intensity * 0.10})`);
    flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flashGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw the lightning bolt lines
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer glow pass
    ctx.strokeStyle = `rgba(0, 240, 255, ${lightningState.intensity * 0.6})`;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    lightningState.bolts.forEach(seg => {
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
    });
    ctx.stroke();

    // Inner bright core
    ctx.strokeStyle = `rgba(255, 255, 255, ${lightningState.intensity * 0.95})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    lightningState.bolts.forEach(seg => {
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
    });
    ctx.stroke();

    ctx.restore();
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

      updateLightning();
      drawLightning(ctx);
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
