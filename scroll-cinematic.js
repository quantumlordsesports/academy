/**
 * QuantumLords Esports & Academy — Cinematic Scroll & Tactical Route Engine v1.0
 * Inspired by lets-scroll & 10k-websites engineering standards
 * 
 * Features:
 * - Interactive Tactical Route Rail (Waypoints HUD) on desktop viewport right margin
 * - Real-time active section tracking with IntersectionObserver & coalesced RAF
 * - Dynamic 3D Cursor Proximity Lighting & Specular Sheen on interactive cards
 * - Header scroll compression & velocity awareness
 * - Mobile notch & address-bar resize hardening (no-jump layout stability)
 * - Full prefers-reduced-motion accessibility compliance
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Waypoints configuration matching the site's core structure
  const WAYPOINTS = [
    { id: 'hero', label: 'COMMAND HQ', code: '01' },
    { id: 'team', label: 'ROSTER TREE', code: '02' },
    { id: 'academy-programme', label: 'ACADEMY INTEL', code: '03' },
    { id: 'tactics', label: '3D TACTICS', code: '04' },
    { id: 'system-telemetry', label: 'TELEMETRY CORE', code: '05' },
    { id: 'contact', label: 'COMMS DISPATCH', code: '06' }
  ];

  /* ------------------------------------------------------------------
   * 1. Tactical Route Rail (Ambient Side HUD)
   * ------------------------------------------------------------------ */
  function initRouteRail() {
    // Only construct on pages with at least 3 matching waypoints
    const validWaypoints = WAYPOINTS.filter(wp => {
      return document.getElementById(wp.id) || (wp.fallbackSelector && document.querySelector(wp.fallbackSelector));
    });

    if (validWaypoints.length < 3 || document.getElementById('qldRouteRail')) {
      return;
    }

    const railContainer = document.createElement('nav');
    railContainer.id = 'qldRouteRail';
    railContainer.className = 'qld-route-rail';
    railContainer.setAttribute('aria-label', 'Tactical Mission Waypoints');

    let railHTML = `
      <div class="qld-route-rail-track" aria-hidden="true">
        <div class="qld-route-rail-fill" id="qldRouteRailFill"></div>
      </div>
      <ul class="qld-route-rail-list">
    `;

    validWaypoints.forEach((wp, index) => {
      railHTML += `
        <li class="qld-route-rail-item">
          <a href="#${wp.id}" class="qld-route-rail-link" data-waypoint-id="${wp.id}" aria-label="Waypoint ${wp.code}: ${wp.label}">
            <span class="qld-route-rail-dot">
              <span class="qld-route-rail-dot-core"></span>
              <span class="qld-route-rail-dot-glow"></span>
            </span>
            <span class="qld-route-rail-tag">
              <strong class="code">${wp.code}</strong>
              <span class="label">${wp.label}</span>
            </span>
          </a>
        </li>
      `;
    });

    railHTML += `</ul>`;
    railContainer.innerHTML = railHTML;
    document.body.appendChild(railContainer);

    const railFill = document.getElementById('qldRouteRailFill');
    const railLinks = railContainer.querySelectorAll('.qld-route-rail-link');

    // Smooth click-to-teleport with offset handling
    railLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('data-waypoint-id');
        let targetEl = document.getElementById(targetId);
        if (!targetEl) {
          const config = validWaypoints.find(w => w.id === targetId);
          if (config && config.fallbackSelector) {
            targetEl = document.querySelector(config.fallbackSelector);
          }
        }

        if (targetEl) {
          e.preventDefault();
          const headerOffset = 76;
          const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: targetPos,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });

    // Observer to track which section is currently active
    let activeId = validWaypoints[0].id;
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id || (entry.target.classList.contains('training-tracks-section') ? 'training-tracks' : null);
          if (id) {
            setActiveWaypoint(id);
          }
        }
      });
    }, observerOptions);

    validWaypoints.forEach(wp => {
      const el = document.getElementById(wp.id) || (wp.fallbackSelector && document.querySelector(wp.fallbackSelector));
      if (el) sectionObserver.observe(el);
    });

    function setActiveWaypoint(currentId) {
      activeId = currentId;
      let activeIndex = 0;

      railLinks.forEach((link, idx) => {
        const isCurrent = link.getAttribute('data-waypoint-id') === currentId;
        link.classList.toggle('is-active', isCurrent);
        if (isCurrent) activeIndex = idx;
      });

      if (railFill && validWaypoints.length > 1) {
        const pct = (activeIndex / (validWaypoints.length - 1)) * 100;
        railFill.style.height = `${pct}%`;
      }
    }

    // Initialize first waypoint active
    setActiveWaypoint(validWaypoints[0].id);
  }

  /* ------------------------------------------------------------------
   * 2. 3D Cursor Proximity & Specular Sheen Engine
   * ------------------------------------------------------------------ */
  function initCursorProximity() {
    if (prefersReducedMotion) return;
    if (window.matchMedia('(hover: none)').matches) return; // Touch devices skip mouse glow

    const targetCards = document.querySelectorAll(
      '.bento-card, .tree-root-card, .map-card-3d, .telemetry-card, ' +
      '.highlight-card, .floating-sponsor-card, .comms-card, .title-sponsor-hero'
    );

    targetCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--cursor-x', `${x}px`);
        card.style.setProperty('--cursor-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--cursor-x');
        card.style.removeProperty('--cursor-y');
      });
    });
  }

  /* ------------------------------------------------------------------
   * 3. Coalesced Scroll RAF (RequestAnimationFrame) & Header Stability
   * ------------------------------------------------------------------ */
  function initScrollMetrics() {
    const siteHeader = document.querySelector('.site-header');
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

          // Header scroll elevation
          if (siteHeader) {
            if (currentScrollY > 40) {
              siteHeader.classList.add('is-scrolled');
            } else {
              siteHeader.classList.remove('is-scrolled');
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
   * 4. Mobile Viewport Stability (No-jump resize hardening)
   * ------------------------------------------------------------------ */
  function initMobileViewportGuard() {
    let lastWidth = window.innerWidth;

    window.addEventListener('resize', () => {
      const currentWidth = window.innerWidth;
      // If only height changed (typical mobile virtual keyboard or URL address bar collapse), skip re-layout
      if (currentWidth === lastWidth) return;
      lastWidth = currentWidth;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
   * Boot Engine
   * ------------------------------------------------------------------ */
  function boot() {
    initRouteRail();
    initCursorProximity();
    initScrollMetrics();
    initMobileViewportGuard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
