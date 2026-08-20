/**
 * QuantumLords Esports — Motion Effects Engine v3.0
 * Zero-G Physics · 3D Tilt · Dynamic Counters · Tactical Animations
 * Uses Motion.js (CDN ESM) for spring-physics and scroll triggers
 */

import { animate, scroll, inView, stagger } from
  "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

/* ═══════════════════════════════════════════════════════════════════
   1. SCROLL REVEAL — section-level inView staggering
═══════════════════════════════════════════════════════════════════ */
function initScrollReveals() {
  // All [data-reveal] elements stagger in when section enters
  document.querySelectorAll('.section-block, .training-tracks-section, #sponsors, #contact').forEach(section => {
    const items = section.querySelectorAll('[data-reveal], [data-reveal-left], [data-reveal-scale]');
    if (!items.length) return;

    inView(section, () => {
      // Stagger each item with Motion
      items.forEach((el, i) => {
        const delay = parseFloat(el.dataset.delay || 0) * 0.1 + i * 0.08;
        const revealType = el.hasAttribute('data-reveal-left') ? 'left' :
                           el.hasAttribute('data-reveal-scale') ? 'scale' : 'up';

        const from = revealType === 'left'  ? { opacity: 0, x: -40 }
                   : revealType === 'scale' ? { opacity: 0, scale: 0.88 }
                   :                          { opacity: 0, y: 32 };
        const to   = revealType === 'scale' ? { opacity: 1, scale: 1 }
                   : revealType === 'left'  ? { opacity: 1, x: 0 }
                   :                          { opacity: 1, y: 0 };

        animate(el, from, { duration: 0 }); // snap to hidden
        animate(el, to, {
          delay,
          duration: 0.7,
          easing: revealType === 'scale' ? [0.34, 1.56, 0.64, 1] : [0.22, 1, 0.36, 1]
        });

        el.classList.add('is-visible'); // also trigger CSS progress bars
      });

      return () => {}; // don't un-animate on scroll out
    }, { amount: 0.15 });
  });

  // Hero entrance — special staggered intro
  const heroItems = document.querySelectorAll('#hero [data-reveal], #home [data-reveal]');
  heroItems.forEach((el, i) => {
    animate(el, { opacity: 0, y: 40 }, { duration: 0 });
    animate(el, { opacity: 1, y: 0 }, {
      delay: 0.2 + i * 0.15,
      duration: 0.9,
      easing: [0.22, 1, 0.36, 1]
    });
    el.classList.add('is-visible');
  });
}

/* ═══════════════════════════════════════════════════════════════════
   2. ZERO-G FLOATING BADGES — Motion spring physics oscillation
═══════════════════════════════════════════════════════════════════ */
function initZeroGBadges() {
  const badges = document.querySelectorAll('.zero-g-badge');
  badges.forEach((badge, i) => {
    const yRange = 8 + (i % 3) * 4;
    const dur    = 3.5 + (i % 4) * 0.7;
    const rotMax = 1.5 + (i % 2) * 0.8;

    animate(badge,
      { y: [-yRange * 0.5, yRange, -yRange * 0.5], rotate: [-rotMax, rotMax, -rotMax] },
      { duration: dur, repeat: Infinity, easing: 'ease-in-out', delay: i * 0.4 }
    );
  });

  // Also float the sponsor hero card if present
  const titleSponsor = document.querySelector('.title-sponsor-hero');
  if (titleSponsor) {
    animate(titleSponsor,
      { y: [0, -8, 0] },
      { duration: 5, repeat: Infinity, easing: 'ease-in-out' }
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════
   3. DYNAMIC COUNTERS — animated number counting on scroll
═══════════════════════════════════════════════════════════════════ */
function initDynamicCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  counters.forEach(el => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';

    inView(el, () => {
      animate(0, target, {
        duration: 2.2,
        easing: [0.16, 1, 0.3, 1],
        onUpdate: v => {
          const val = Number.isInteger(target) ? Math.round(v) : v.toFixed(1);
          el.textContent = prefix + val + suffix;
        }
      });
      return () => {};
    }, { amount: 0.5 });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   4. 3D TILT EFFECT — mouse-tracking perspective warp
═══════════════════════════════════════════════════════════════════ */
function initTiltEffect() {
  const tiltTargets = [
    ...document.querySelectorAll('.tree-root-card'),
    ...document.querySelectorAll('.bento-card'),
    ...document.querySelectorAll('.book-card-3d'),
    ...document.querySelectorAll('.map-card-3d'),
    ...document.querySelectorAll('.comms-card'),
    ...document.querySelectorAll('.floating-sponsor-card'),
  ];

  tiltTargets.forEach(card => {
    let shineEl = card.querySelector('.tilt-shine, .tree-shine');

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2); // -1 to 1
      const dy   = (e.clientY - cy) / (rect.height / 2); // -1 to 1

      const maxTilt = card.classList.contains('bento-card') ? 6
                    : card.classList.contains('comms-card')  ? 5
                    : card.classList.contains('floating-sponsor-card') ? 4
                    : 8;

      const rotX = -dy * maxTilt;
      const rotY =  dx * maxTilt;

      animate(card, {
        rotateX: rotX,
        rotateY: rotY,
        transformPerspective: 900,
      }, { duration: 0.12, easing: 'ease-out' });

      // Update shine position
      if (shineEl) {
        const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
        const my = ((e.clientY - rect.top ) / rect.height * 100).toFixed(1) + '%';
        card.style.setProperty('--mx', mx);
        card.style.setProperty('--my', my);
      }
    });

    card.addEventListener('mouseleave', () => {
      animate(card, {
        rotateX: 0, rotateY: 0, transformPerspective: 900,
      }, { duration: 0.5, easing: [0.34, 1.56, 0.64, 1] });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   5. SPRING BUTTON KINETICS — press bounce
═══════════════════════════════════════════════════════════════════ */
function initSpringButtons() {
  document.querySelectorAll('.btn-spring, .button-primary, .button-secondary, .action-btn-primary').forEach(btn => {
    btn.addEventListener('mousedown', () => {
      animate(btn, { scale: 0.94 }, { duration: 0.1, easing: 'ease-out' });
    });
    btn.addEventListener('mouseup', () => {
      animate(btn, { scale: 1 }, { duration: 0.4, easing: [0.34, 1.56, 0.64, 1] });
    });
    btn.addEventListener('mouseleave', () => {
      animate(btn, { scale: 1 }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   6. SPONSOR STAGGER FLOAT — zero-G continuous oscillation
═══════════════════════════════════════════════════════════════════ */
function initSponsorFloat() {
  const cards = document.querySelectorAll('.floating-sponsor-card');
  cards.forEach((card, i) => {
    animate(card,
      { y: [0, -(6 + (i % 3) * 3), 0] },
      {
        duration: 4 + (i % 4) * 0.8,
        repeat: Infinity,
        easing: 'ease-in-out',
        delay: i * 0.35
      }
    );
  });

  // Scroll-triggered stagger entrance
  inView('#sponsors', () => {
    animate(cards,
      { opacity: [0, 1], y: [30, 0] },
      { delay: stagger(0.12), duration: 0.7, easing: [0.22, 1, 0.36, 1] }
    );
    return () => {};
  }, { amount: 0.1 });
}

/* ═══════════════════════════════════════════════════════════════════
   7. BENTO GRID STAGGER — training tracks entrance
═══════════════════════════════════════════════════════════════════ */
function initBentoStagger() {
  const bentoSection = document.querySelector('.training-tracks-section');
  if (!bentoSection) return;

  const cards = bentoSection.querySelectorAll('.bento-card');
  inView(bentoSection, () => {
    animate(cards,
      { opacity: [0, 1], y: [40, 0], scale: [0.95, 1] },
      {
        delay: stagger(0.12),
        duration: 0.75,
        easing: [0.22, 1, 0.36, 1]
      }
    );
    cards.forEach(c => c.classList.add('is-visible'));
    return () => {};
  }, { amount: 0.1 });
}

/* ═══════════════════════════════════════════════════════════════════
   8. SCROLL PROGRESS BAR — top of page tactical indicator
═══════════════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px; width: 0%;
    background: linear-gradient(90deg, #00F0FF, #8B5CF6, #E8C56A);
    z-index: 99999; transition: width 0.1s linear;
    box-shadow: 0 0 6px rgba(0,240,255,0.7);
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  scroll(({ y }) => {
    const pct = (y.progress * 100).toFixed(1) + '%';
    bar.style.width = pct;
  });
}

/* ═══════════════════════════════════════════════════════════════════
   9. TACTICAL SCANLINE ON HERO
═══════════════════════════════════════════════════════════════════ */
function initTacticalScanline() {
  const hero = document.querySelector('#hero, .hero, section:first-of-type');
  if (!hero) return;
  hero.style.position = hero.style.position || 'relative';
  hero.style.overflow = hero.style.overflow || 'hidden';

  const line = document.createElement('div');
  line.style.cssText = `
    position: absolute; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,240,255,0.5), transparent);
    box-shadow: 0 0 6px rgba(0,240,255,0.4);
    pointer-events: none; z-index: 2; top: 0;
  `;
  hero.appendChild(line);

  animate(line, { y: ['0px', '100vh'] }, {
    duration: 5, repeat: Infinity, easing: 'linear'
  });
}

/* ═══════════════════════════════════════════════════════════════════
   10. PLAYER CARD STAGGER on Roster section
═══════════════════════════════════════════════════════════════════ */
function initRosterStagger() {
  const rosterSection = document.querySelector('#roster, .roster-section, #team');
  if (!rosterSection) return;

  const cards = rosterSection.querySelectorAll('.tree-root-card');
  if (!cards.length) return;

  inView(rosterSection, () => {
    animate(cards,
      { opacity: [0, 1], y: [40, 0] },
      { delay: stagger(0.15), duration: 0.7, easing: [0.22, 1, 0.36, 1] }
    );
    return () => {};
  }, { amount: 0.15 });
}

/* ═══════════════════════════════════════════════════════════════════
   INIT ALL
═══════════════════════════════════════════════════════════════════ */
function init() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  initScrollProgress();
  initScrollReveals();
  initZeroGBadges();
  initDynamicCounters();
  initTiltEffect();
  initSpringButtons();
  initSponsorFloat();
  initBentoStagger();
  initTacticalScanline();
  initRosterStagger();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
