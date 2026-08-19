/**
 * QuantumLords Theme Atmosphere System
 * - Bright Mode: Flying sakura flower petals & golden/emerald leaves drifting with breeze.
 * - Dark Mode: Drifting volumetric nebula clouds and twinkling multi-depth moving cosmic stars.
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

  // --- Dark Mode Atmosphere (Cosmic Stars & Volumetric Nebula Clouds) ---
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

  // --- Glowing Nocturnal Cyber Bats (Dark Mode Background) ---
  const bats = [];
  const BAT_COUNT = 28;

  class GlowingBat {
    constructor(randomizePos = true) {
      this.reset(randomizePos);
    }

    reset(randomizePos = true) {
      this.direction = Math.random() > 0.45 ? 1 : -1;
      this.scale = Math.random() * 0.70 + 0.38; // Multi-depth scale (0.38x to 1.08x)
      this.x = randomizePos ? Math.random() * width : (this.direction === 1 ? -60 : width + 60);
      this.y = Math.random() * (height * 0.85) + 30;

      this.speedX = (Math.random() * 1.8 + 1.1) * this.direction * this.scale;
      this.speedY = (Math.random() * 0.6 - 0.3) * this.scale;

      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.22 + 0.16;
      this.glideTimer = Math.floor(Math.random() * 120);
      this.isGliding = false;

      this.swoopPhase = Math.random() * Math.PI * 2;
      this.swoopSpeed = Math.random() * 0.032 + 0.016;
      this.swoopAmp = Math.random() * 1.7 + 0.6;

      // Luminous Glow Aura & Eye Colors (Cyan, Violet, Gold, Crimson)
      const glowPalettes = [
        { glow: 'rgba(0, 240, 255, 0.65)', eye: '#00F0FF', rim: 'rgba(0, 240, 255, 0.40)' },
        { glow: 'rgba(192, 132, 252, 0.60)', eye: '#C084FC', rim: 'rgba(192, 132, 252, 0.35)' },
        { glow: 'rgba(255, 215, 0, 0.60)', eye: '#FFD700', rim: 'rgba(255, 215, 0, 0.35)' },
        { glow: 'rgba(255, 0, 85, 0.60)', eye: '#FF0055', rim: 'rgba(255, 0, 85, 0.35)' }
      ];
      this.theme = glowPalettes[Math.floor(Math.random() * glowPalettes.length)];
      this.alpha = Math.min(0.92, this.scale * 0.75 + 0.25);
    }

    update() {
      this.swoopPhase += this.swoopSpeed;
      this.glideTimer++;

      // Periodic natural gliding intervals
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

      // Wrap around screen bounds
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

      // Aerodynamic banking rotation
      const bankAngle = Math.sin(this.swoopPhase) * 0.22;
      ctx.rotate(bankAngle);

      // Flapping position (-1 to 1)
      const flap = this.isGliding ? 0.22 : Math.sin(this.wingPhase);
      const wingY = flap * 12;

      // Luminous Glow Aura
      ctx.shadowColor = this.theme.glow;
      ctx.shadowBlur = 10 * this.scale;

      // Scalloped Wings (Dark silhouette with glowing luminous rim)
      ctx.fillStyle = '#060911';
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

      // Bat Body Torso
      ctx.fillStyle = '#0a0f1c';
      ctx.beginPath();
      ctx.ellipse(0, 2, 3.2, 6.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(0, -4.5, 3.0, 0, Math.PI * 2);
      ctx.fill();

      // Pointed Ears
      ctx.beginPath();
      ctx.moveTo(-2.4, -4.5);
      ctx.lineTo(-4.2, -9.5);
      ctx.lineTo(-1.1, -6.2);
      ctx.moveTo(2.4, -4.5);
      ctx.lineTo(4.2, -9.5);
      ctx.lineTo(1.1, -6.2);
      ctx.fill();

      // Glowing Cyber Eyes with Radiant Flare
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

  // --- Ethereal Aurora Borealis Curtain System (Dark Mode) ---
  class AuroraRibbon {
    constructor(config) {
      this.baseYRatio = config.baseYRatio || 0.28;
      this.amplitude = config.amplitude || 45;
      this.wavelength = config.wavelength || 0.0025;
      this.speed = config.speed || 0.0008;
      this.colorStops = config.colorStops;
      this.verticalHeight = config.verticalHeight || 320;
      this.phase = config.phase || Math.random() * Math.PI * 2;
      this.time = Math.random() * 1000;
      this.harmonicSpeed = config.harmonicSpeed || 0.0015;
      this.harmonicAmp = config.harmonicAmp || 22;
      this.harmonicWavelength = config.harmonicWavelength || 0.005;
      this.opacity = config.opacity || 0.28;
    }

    update() {
      this.time += 1;
    }

    draw(ctx) {
      const baseY = height * this.baseYRatio;
      const step = 24;
      const points = [];

      for (let x = -40; x <= width + 40; x += step) {
        const primaryWave = Math.sin(x * this.wavelength + this.time * this.speed + this.phase) * this.amplitude;
        const secondaryWave = Math.cos(x * this.harmonicWavelength - this.time * this.harmonicSpeed + this.phase * 1.5) * this.harmonicAmp;
        const y = baseY + primaryWave + secondaryWave;
        points.push({ x, y });
      }

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = this.opacity * (0.85 + 0.15 * Math.sin(this.time * 0.008));

      // Draw flowing vertical gradient curtain
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const topY = Math.min(p1.y, p2.y) - this.verticalHeight * 0.75;
        const bottomY = Math.max(p1.y, p2.y) + this.verticalHeight * 0.25;

        const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
        this.colorStops.forEach(stop => {
          grad.addColorStop(stop.offset, stop.color);
        });

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, topY);
        ctx.lineTo(p2.x, topY);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  const auroras = [
    // 1. Radiant Emerald & Cyan Aurora Wave
    new AuroraRibbon({
      baseYRatio: 0.22,
      amplitude: 55,
      wavelength: 0.0020,
      speed: 0.0006,
      verticalHeight: 380,
      harmonicSpeed: 0.0012,
      harmonicAmp: 25,
      harmonicWavelength: 0.0045,
      opacity: 0.32,
      phase: 0,
      colorStops: [
        { offset: 0, color: 'rgba(0, 0, 0, 0)' },
        { offset: 0.25, color: 'rgba(0, 240, 255, 0.08)' }, // Neon Cyan
        { offset: 0.55, color: 'rgba(0, 255, 102, 0.22)' }, // Emerald Green
        { offset: 0.85, color: 'rgba(16, 185, 129, 0.15)' }, // Mint Green
        { offset: 1, color: 'rgba(0, 0, 0, 0)' }
      ]
    }),
    // 2. Cosmic Plasma Violet & Magenta Aurora Wave
    new AuroraRibbon({
      baseYRatio: 0.32,
      amplitude: 65,
      wavelength: 0.0018,
      speed: 0.0009,
      verticalHeight: 340,
      harmonicSpeed: 0.0018,
      harmonicAmp: 30,
      harmonicWavelength: 0.0038,
      opacity: 0.26,
      phase: 2.1,
      colorStops: [
        { offset: 0, color: 'rgba(0, 0, 0, 0)' },
        { offset: 0.30, color: 'rgba(139, 92, 246, 0.10)' }, // Violet
        { offset: 0.65, color: 'rgba(192, 132, 252, 0.24)' }, // Plasma Purple
        { offset: 0.90, color: 'rgba(236, 72, 153, 0.12)' }, // Magenta
        { offset: 1, color: 'rgba(0, 0, 0, 0)' }
      ]
    }),
    // 3. Electric Cyan & Solar Amber Ribbon Wave
    new AuroraRibbon({
      baseYRatio: 0.18,
      amplitude: 45,
      wavelength: 0.0028,
      speed: 0.0007,
      verticalHeight: 300,
      harmonicSpeed: 0.0014,
      harmonicAmp: 20,
      harmonicWavelength: 0.006,
      opacity: 0.22,
      phase: 4.2,
      colorStops: [
        { offset: 0, color: 'rgba(0, 0, 0, 0)' },
        { offset: 0.35, color: 'rgba(0, 240, 255, 0.14)' }, // Cyan
        { offset: 0.70, color: 'rgba(232, 197, 106, 0.18)' }, // Imperial Gold
        { offset: 1, color: 'rgba(0, 0, 0, 0)' }
      ]
    })
  ];

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
      // Render Dark Cosmic Night Sky:
      // 1. Flowing Aurora Borealis Curtains
      auroras.forEach(a => {
        a.update();
        a.draw(ctx);
      });

      // 2. Volumetric Nebula Clouds
      nebulaClouds.forEach(c => {
        c.update();
        c.draw(ctx);
      });

      // 3. Twinkling Cosmic Stars
      stars.forEach(s => {
        s.update();
        s.draw(ctx);
      });

      // 4. Glowing Nocturnal Cyber Bats
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
