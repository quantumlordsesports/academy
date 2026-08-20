/**
 * QuantumLords Esports & Academy — Motion Engine v4.0 (Motion.js CDN ESM)
 * Zero-G Physics · 3D Books & Tilt · Dynamic Counters · Tactical Scroll Stagger
 */

import { animate, scroll, inView, stagger } from
  "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

function init() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 1. Top Laser Scroll Progress
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px; width: 0%;
    background: linear-gradient(90deg, #00F0FF, #8B5CF6, #E8C56A);
    z-index: 99999; pointer-events: none;
    box-shadow: 0 0 8px rgba(0,240,255,0.8);
    transition: width 0.08s linear;
  `;
  document.body.appendChild(bar);
  scroll(({ y }) => { bar.style.width = (y.progress * 100).toFixed(1) + '%'; });

  // 2. Zero-G Continuous Oscillation
  document.querySelectorAll('.zero-g-badge, .badge, .tag, [class*="eyebrow"], .tree-origin-core-icon').forEach((el, i) => {
    const yVal = 8 + (i % 3) * 3;
    const dur = 3.8 + (i % 4) * 0.5;
    animate(el,
      { y: [-yVal, yVal, -yVal], rotate: [-(i % 2), i % 2, -(i % 2)] },
      { duration: dur, repeat: Infinity, easing: 'ease-in-out', delay: i * 0.3 }
    );
  });

  // 3. Dynamic Animated Counters
  document.querySelectorAll('[data-counter]').forEach(el => {
    const rawTarget = el.dataset.counter;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';

    inView(el, () => {
      if (rawTarget === 'unlimited' || isNaN(parseFloat(rawTarget))) {
        // High-tech rolling cyber counter resolving to Unlimited
        let count = 0;
        const interval = setInterval(() => {
          count += Math.floor(Math.random() * 85) + 30;
          if (count < 999) {
            el.textContent = prefix + count + '+';
          } else {
            clearInterval(interval);
            el.textContent = prefix + (el.dataset.display || 'Unlimited') + suffix;
          }
        }, 50);
      } else {
        const target = parseFloat(rawTarget);
        animate(0, target, {
          duration: 2.0,
          easing: [0.16, 1, 0.3, 1],
          onUpdate: v => {
            const val = Number.isInteger(target) ? Math.round(v) : v.toFixed(1);
            el.textContent = prefix + val + suffix;
          }
        });
      }
      return () => {};
    }, { amount: 0.3 });
  });

  // 4. 3D Mouse Perspective Tilt on Cards & 3D Books
  const tiltElements = document.querySelectorAll(
    '.tilt-card, .bento-card, .tree-root-card, .book-card-3d-wrap, ' +
    '.map-blueprint-frame, .player-card, .update-item, .comms-card, .floating-sponsor-card'
  );

  tiltElements.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      const maxTilt = card.classList.contains('book-card-3d-wrap') ? 14 : 7;

      animate(card, {
        rotateX: -dy * maxTilt,
        rotateY: dx * maxTilt,
        transformPerspective: 1000
      }, { duration: 0.12, easing: 'ease-out' });
    });

    card.addEventListener('mouseleave', () => {
      animate(card, {
        rotateX: 0,
        rotateY: 0,
        transformPerspective: 1000
      }, { duration: 0.5, easing: [0.34, 1.56, 0.64, 1] });
    });
  });

  // 5. Kinetic Spring Buttons
  document.querySelectorAll('.btn-spring, .button, [class*="btn-"], a[class*="button"]').forEach(btn => {
    btn.addEventListener('mousedown', () => animate(btn, { scale: 0.93 }, { duration: 0.1 }));
    btn.addEventListener('mouseup',   () => animate(btn, { scale: 1 }, { duration: 0.4, easing: [0.34, 1.56, 0.64, 1] }));
    btn.addEventListener('mouseleave',() => animate(btn, { scale: 1 }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] }));
  });

  // 6. Section Scroll Stagger Reveals
  document.querySelectorAll('section, .section-block, .training-tracks-section, #sponsors, #team, #contact').forEach(sec => {
    const items = sec.querySelectorAll('[data-reveal], .bento-card, .book-card-3d-wrap, .map-blueprint-frame, .stat-item-premium');
    if (!items.length) return;
    inView(sec, () => {
      animate(items,
        { opacity: [0, 1], y: [32, 0] },
        { delay: stagger(0.1), duration: 0.7, easing: [0.22, 1, 0.36, 1] }
      );
      items.forEach(el => el.classList.add('is-visible'));
      return () => {};
    }, { amount: 0.15 });
  });

  // 7. Sponsor Stagger Float
  const sponsorCards = document.querySelectorAll('.floating-sponsor-card');
  sponsorCards.forEach((c, i) => {
    animate(c, { y: [0, -(6 + (i % 3) * 3), 0] }, {
      duration: 4 + (i % 4) * 0.7, repeat: Infinity, easing: 'ease-in-out', delay: i * 0.3
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
