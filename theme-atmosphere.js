/**
 * QuantumLords Theme Atmosphere System v2.0
 * - Bright Mode: Flying sakura flower petals & golden/emerald leaves drifting with breeze.
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
  // 1. FLORA / BREEZE PARTICLES (Bright Mode)
  // =========================================================================
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
      this.x += this.speedX + Math.sin(this.time * this.swayFreq) * this.swayAmp;
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

    // Interactive Thunderbolt Trigger on Click/Tap
    window.addEventListener('pointerdown', (e) => {
      if (currentTheme === 'dark') {
        // Trigger lightning branch towards tap position
        triggerLightningStrike(e.clientX, e.clientY);
      }
    }, { passive: true });

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
    currentTheme = isLight ? 'light' : 'dark';
  }

  function render() {
    checkCurrentTheme();
    ctx.clearRect(0, 0, width, height);

    if (currentTheme === 'light') {
      // Light Mode: Sakura Petals & Spring Breeze
      floraParticles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
    } else {
      // Dark Mode: Thunderstorm Atmosphere

      // 1. Distant Faint Stars
      stars.forEach(s => {
        s.update();
        s.draw(ctx);
      });

      // 2. Moving Dark Storm Clouds (Deep Background & Midground)
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
