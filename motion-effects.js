/**
 * QuantumLords Esports & Academy — Motion Engine v5.0 (Motion.js CDN ESM)
 * Features:
 * - Top Laser Scroll Progress
 * - Zero-G Continuous Oscillation
 * - Dynamic Animated Cyber Counters
 * - 3D Mouse Perspective Tilt on Cards & 3D Books
 * - Kinetic Spring Buttons
 * - Section Scroll Stagger Reveals
 * - Sponsor Stagger Float
 * - Motion-Powered Global Floating Tactical Menu HUD everywhere
 */

import { animate, scroll, inView, stagger } from
  "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

function resolveBasePath() {
  const scripts = document.querySelectorAll('script[src*="motion-effects.js"]');
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
  return '';
}

const BASE_PATH = resolveBasePath();

// Ensure floating-menu.css is loaded
function ensureFloatingMenuStyles() {
  const existingLink = document.querySelector('link[href*="floating-menu.css"]');
  if (!existingLink) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${BASE_PATH}floating-menu.css`;
    document.head.appendChild(link);
  }
}

// ----------------------------------------------------
// Universal Floating Menu HUD DOM Creation & Motion
// ----------------------------------------------------
function setupFloatingMenu() {
  ensureFloatingMenuStyles();

  if (document.getElementById('qldFloatingMenuTrigger')) return;

  const currentPath = window.location.pathname.toLowerCase();

  function isCurrent(pageKey) {
    if (pageKey === 'home') {
      return currentPath.endsWith('index.html') && !currentPath.includes('/roster') && !currentPath.includes('/tactics') && !currentPath.includes('/recruit') && !currentPath.includes('/rewards') && !currentPath.includes('/contact') && !currentPath.includes('/team-updates') && !currentPath.includes('/portal') || currentPath.endsWith('/') || currentPath === '';
    }
    return currentPath.includes(`/${pageKey}`);
  }

  // 1. Create Floating Action Trigger Button (FAB)
  const fab = document.createElement('button');
  fab.id = 'qldFloatingMenuTrigger';
  fab.className = 'qld-fab-trigger';
  fab.setAttribute('aria-label', 'Toggle Quantum Tactical Navigation Menu');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('title', 'Quantum Tactical Navigation Menu (Hotkey: M)');

  fab.innerHTML = `
    <div class="qld-fab-halo" aria-hidden="true"></div>
    <div class="qld-fab-icon-core">
      <svg class="qld-fab-svg" viewBox="0 0 24 24" id="qldFabIcon">
        <path d="M3 6h18M3 12h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="qld-fab-body">
      <div class="qld-fab-title-row">
        <span class="qld-fab-beacon" aria-hidden="true"></span>
        <span class="qld-fab-label">HUD MENU</span>
        <span class="qld-fab-key-badge" aria-hidden="true">M</span>
      </div>
      <span class="qld-fab-sub">TACTICAL NAV</span>
    </div>
  `;

  document.body.appendChild(fab);

  // Motion Idle Floating Loop on FAB
  animate(fab, 
    { y: [-3, 3, -3] }, 
    { duration: 3.8, repeat: Infinity, easing: 'ease-in-out' }
  );

  // 2. Create Tactical HUD Backdrop & Modal Dialog
  const backdrop = document.createElement('div');
  backdrop.id = 'qldFloatingHudBackdrop';
  backdrop.className = 'qld-hud-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  const navItems = [
    {
      id: 'home',
      name: 'Home HQ',
      url: `${BASE_PATH}index.html`,
      desc: 'Command Battle Station, Telemetry & Live Matches',
      icon: '⚡',
      badge: isCurrent('home') ? 'ACTIVE' : ''
    },
    {
      id: 'roster',
      name: 'Pro Squad Roster',
      url: `${BASE_PATH}roster/index.html`,
      desc: 'Tier-1 Player Dossiers, Roles & Combat Stats',
      icon: '🛡️',
      badge: isCurrent('roster') ? 'ACTIVE' : ''
    },
    {
      id: 'tactics',
      name: 'Tactics & Playbook',
      url: `${BASE_PATH}tactics/index.html`,
      desc: 'Interactive Drop Maps, Gun Meta & HUD Sensitivity',
      icon: '📖',
      badge: isCurrent('tactics') ? 'ACTIVE' : ''
    },
    {
      id: 'team-updates',
      name: 'Team Updates & Scrims',
      url: `${BASE_PATH}team-updates/index.html`,
      desc: 'Tournament Schedule, Match Results & Video Highlights',
      icon: '🏆',
      badge: isCurrent('team-updates') ? 'ACTIVE' : ''
    },
    {
      id: 'recruit',
      name: 'Recruitment & Trials',
      url: `${BASE_PATH}recruit/index.html`,
      desc: 'Free Fire Academy Applications & Tryouts',
      icon: '🎯',
      badge: isCurrent('recruit') ? 'ACTIVE' : ''
    },
    {
      id: 'rewards',
      name: 'Rewards & Vault',
      url: `${BASE_PATH}rewards/index.html`,
      desc: 'Daily Redeem Codes, Drops & Diamond Claim',
      icon: '🎁',
      badge: isCurrent('rewards') ? 'ACTIVE' : ''
    },
    {
      id: 'contact',
      name: 'Comms & Contact HQ',
      url: `${BASE_PATH}contact/index.html`,
      desc: 'Official Discord Base, Management & Sponsorships',
      icon: '📡',
      badge: isCurrent('contact') ? 'ACTIVE' : ''
    },
    {
      id: 'portal',
      name: 'Cadet Academy Portal',
      url: `${BASE_PATH}portal.html`,
      desc: 'Cadet Dashboard, Training Syllabus & Locked Intel',
      icon: '🔐',
      badge: isCurrent('portal') ? 'ACTIVE' : ''
    }
  ];

  const squadPlayers = [
    { name: 'Nishad', ign: '—͞ƝɪꜱʜAᴅ', role: 'Rusher / Sniper', url: `${BASE_PATH}roster/nishad.html` },
    { name: 'Roman', ign: 'ΔPOCΔLYPSE', role: 'Rusher / Support', url: `${BASE_PATH}roster/roman.html` },
    { name: 'Santo', ign: 'ᴀꜱ̷ᴄᴇㅤ', role: 'Bomber', url: `${BASE_PATH}roster/santo.html` },
    { name: 'Shahriar', ign: 'SHAHRIAR', role: 'Entry Rusher', url: `${BASE_PATH}roster/shahriar.html` }
  ];

  backdrop.innerHTML = `
    <div class="qld-hud-dialog" role="dialog" aria-modal="true" aria-labelledby="qldHudTitle">
      <!-- Top Header -->
      <div class="qld-hud-header">
        <div class="qld-hud-header-brand">
          <img src="${BASE_PATH}assets/logo.png" alt="QuantumLords Crest" class="qld-hud-header-logo" onerror="this.style.display='none'"/>
          <div class="qld-hud-header-titles">
            <h2 id="qldHudTitle" class="qld-hud-header-title">QUANTUM<span>LORDS</span> // HUD</h2>
            <div class="qld-hud-header-status">
              <span class="dot"></span> SYSTEM ONLINE · READY
            </div>
          </div>
        </div>

        <!-- Search Input -->
        <div class="qld-hud-search-wrap">
          <svg class="qld-hud-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="qldHudSearchInput" class="qld-hud-search-input" placeholder="Search tactics, roster, pages..." autocomplete="off" spellcheck="false" />
          <button type="button" id="qldHudSearchClear" class="qld-hud-search-clear" aria-label="Clear search">✕</button>
        </div>

        <!-- Close Button -->
        <button type="button" id="qldHudCloseBtn" class="qld-hud-close-btn" aria-label="Close Tactical HUD">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Main Scrollable HUD Content -->
      <div class="qld-hud-body" id="qldHudBody">
        <!-- Section: Mission Operations -->
        <div class="qld-hud-section">
          <div class="qld-hud-section-label">⚡ Primary Navigation & Intel Operations</div>
          <div class="qld-hud-grid" id="qldHudNavGrid">
            ${navItems.map(item => `
              <a href="${item.url}" class="qld-hud-card ${item.badge ? 'is-current' : ''}" data-hud-name="${item.name.toLowerCase()} ${item.desc.toLowerCase()}">
                <div class="qld-hud-card-icon">${item.icon}</div>
                <div class="qld-hud-card-info">
                  <div class="qld-hud-card-title">
                    ${item.name}
                    ${item.badge ? `<span class="qld-hud-badge-active">${item.badge}</span>` : ''}
                  </div>
                  <div class="qld-hud-card-desc">${item.desc}</div>
                </div>
                <svg class="qld-hud-card-arrow" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Section: Squad Fast Teleport -->
        <div class="qld-hud-section">
          <div class="qld-hud-section-label">🛡️ Squad Fast Teleport // Pro Players</div>
          <div class="qld-hud-squad-row" id="qldHudSquadGrid">
            ${squadPlayers.map(p => `
              <a href="${p.url}" class="qld-hud-player-card" data-hud-name="${p.name.toLowerCase()} ${p.ign.toLowerCase()} ${p.role.toLowerCase()}">
                <div class="qld-hud-player-avatar">${p.name[0]}</div>
                <div class="qld-hud-player-meta">
                  <span class="qld-hud-player-ign">${p.ign}</span>
                  <span class="qld-hud-player-role">${p.role}</span>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Footer Utilities -->
      <div class="qld-hud-footer">
        <div class="qld-hud-utils-group">
          <button type="button" class="qld-hud-util-btn" id="qldHudThemeBtn">
            <span>🌓</span> Theme Switch
          </button>
          <button type="button" class="qld-hud-util-btn" id="qldHudBgmBtn">
            <span>🎵</span> Music Toggle
          </button>
          <button type="button" class="qld-hud-util-btn" id="qldHudTopBtn">
            <span>🔝</span> Top of Page
          </button>
          <button type="button" class="qld-hud-util-btn" id="qldHudDiscordBtn">
            <span>📋</span> Copy Discord
          </button>
        </div>
        <div class="qld-hud-copyright">
          QUANTUM LORDS ESPORTS © 2026
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const dialog = backdrop.querySelector('.qld-hud-dialog');
  const closeBtn = backdrop.querySelector('#qldHudCloseBtn');
  const searchInput = backdrop.querySelector('#qldHudSearchInput');
  const searchClear = backdrop.querySelector('#qldHudSearchClear');
  const fabSvg = fab.querySelector('#qldFabIcon');

  let isOpen = false;

  function openHUD() {
    if (isOpen) return;
    isOpen = true;

    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    fab.classList.add('is-active');
    fab.setAttribute('aria-expanded', 'true');

    // Morph FAB SVG into X
    fabSvg.innerHTML = `
      <line x1="18" y1="6" x2="6" y2="18" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke-width="2.5" stroke-linecap="round"/>
    `;

    // Motion.js Spring Animations
    animate(backdrop, { opacity: [0, 1] }, { duration: 0.25, easing: 'ease-out' });
    animate(dialog, 
      { opacity: [0, 1], scale: [0.92, 1], y: [24, 0] }, 
      { duration: 0.38, easing: [0.16, 1, 0.3, 1] }
    );

    // Stagger Cards Entry
    const cards = backdrop.querySelectorAll('.qld-hud-card, .qld-hud-player-card');
    animate(cards, 
      { opacity: [0, 1], y: [16, 0] }, 
      { delay: stagger(0.025), duration: 0.35, easing: [0.22, 1, 0.36, 1] }
    );

    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 100);
  }

  function closeHUD() {
    if (!isOpen) return;
    isOpen = false;

    fab.classList.remove('is-active');
    fab.setAttribute('aria-expanded', 'false');

    // Morph FAB SVG back to hamburger
    fabSvg.innerHTML = `
      <path d="M3 6h18M3 12h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
    `;

    // Motion.js Spring Exit
    try {
      animate(dialog, 
        { opacity: [1, 0], scale: [1, 0.94], y: [0, 16] }, 
        { duration: 0.2, easing: 'ease-in' }
      );
      animate(backdrop, 
        { opacity: [1, 0] }, 
        { duration: 0.2, easing: 'ease-in' }
      );
    } catch (err) {
      console.warn('Motion close error:', err);
    }

    setTimeout(() => {
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
      dialog.style.opacity = '';
      dialog.style.transform = '';
      backdrop.style.opacity = '';
      if (searchInput) {
        searchInput.value = '';
        filterHUD('');
      }
    }, 200);
  }

  function toggleHUD() {
    if (isOpen) {
      closeHUD();
    } else {
      openHUD();
    }
  }

  // Trigger click
  fab.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleHUD();
  });

  // Close button in HUD Header: click, pointerdown, touchstart
  ['click', 'pointerdown'].forEach(evt => {
    closeBtn.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeHUD();
    });
  });

  // Close on backdrop click outside dialog
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target.classList.contains('qld-hud-backdrop')) {
      e.preventDefault();
      e.stopPropagation();
      closeHUD();
    }
  });

  // Auto-close on selecting any menu destination
  backdrop.querySelectorAll('.qld-hud-card, .qld-hud-player-card').forEach(link => {
    link.addEventListener('click', () => {
      closeHUD();
    });
  });

  // Keyboard Navigation: M to toggle, Escape to close
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);

    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeHUD();
    } else if ((e.key === 'm' || e.key === 'M') && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      toggleHUD();
    }
  });

  // Search Filter in HUD
  function filterHUD(query) {
    const q = query.trim().toLowerCase();
    const items = backdrop.querySelectorAll('[data-hud-name]');
    items.forEach(el => {
      const match = !q || el.getAttribute('data-hud-name').includes(q);
      el.style.display = match ? '' : 'none';
      if (match && q) {
        animate(el, { opacity: [0.3, 1], scale: [0.97, 1] }, { duration: 0.2 });
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterHUD(e.target.value));
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        filterHUD('');
      }
    });
  }

  // 3D Perspective Tilt on HUD Cards with Motion.js
  backdrop.querySelectorAll('.qld-hud-card, .qld-hud-player-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      animate(card, {
        rotateX: -dy * 6,
        rotateY: dx * 6,
        transformPerspective: 800
      }, { duration: 0.1, easing: 'ease-out' });
    });

    card.addEventListener('mouseleave', () => {
      animate(card, {
        rotateX: 0,
        rotateY: 0,
        transformPerspective: 800
      }, { duration: 0.4, easing: [0.34, 1.56, 0.64, 1] });
    });
  });

  // HUD Utilities Buttons
  // 1. Theme Toggle
  const themeBtn = backdrop.querySelector('#qldHudThemeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const globalThemeBtn = document.querySelector('.theme-toggle');
      if (globalThemeBtn) {
        globalThemeBtn.click();
      } else {
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('qld_theme', next);
        if (next === 'light') document.documentElement.classList.add('theme-light');
        else document.documentElement.classList.remove('theme-light');
      }
      animate(themeBtn, { scale: [0.9, 1] }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
    });
  }

  // 2. Music Toggle
  const bgmBtn = backdrop.querySelector('#qldHudBgmBtn');
  if (bgmBtn) {
    bgmBtn.addEventListener('click', () => {
      const bgmToggle = document.querySelector('.bgm-toggle-btn');
      if (bgmToggle) {
        bgmToggle.click();
      }
      animate(bgmBtn, { scale: [0.9, 1] }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
    });
  }

  // 3. Scroll to Top
  const topBtn = backdrop.querySelector('#qldHudTopBtn');
  if (topBtn) {
    topBtn.addEventListener('click', () => {
      closeHUD();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 4. Copy Discord Link
  const discordBtn = backdrop.querySelector('#qldHudDiscordBtn');
  if (discordBtn) {
    discordBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('https://discord.gg/MTVRBAybwM').then(() => {
        const origText = discordBtn.innerHTML;
        discordBtn.innerHTML = '<span>✅</span> Copied!';
        animate(discordBtn, { scale: [0.9, 1.05, 1] }, { duration: 0.35 });
        setTimeout(() => {
          discordBtn.innerHTML = origText;
        }, 2200);
      });
    });
  }
}

// ----------------------------------------------------
// Core Motion.js Effects Initialization
// ----------------------------------------------------
function init() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setupFloatingMenu();
    return;
  }

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

  // 2. Universal Floating Menu HUD (Motion-Powered)
  setupFloatingMenu();

  // 3. Zero-G Continuous Oscillation
  document.querySelectorAll('.zero-g-badge, .badge, .tag, [class*="eyebrow"], .tree-origin-core-icon').forEach((el, i) => {
    const yVal = 8 + (i % 3) * 3;
    const dur = 3.8 + (i % 4) * 0.5;
    animate(el,
      { y: [-yVal, yVal, -yVal], rotate: [-(i % 2), i % 2, -(i % 2)] },
      { duration: dur, repeat: Infinity, easing: 'ease-in-out', delay: i * 0.3 }
    );
  });

  // 4. Dynamic Animated Counters
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

  // 5. 3D Mouse Perspective Tilt on Cards & 3D Books
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

  // 6. Kinetic Spring Buttons
  document.querySelectorAll('.btn-spring, .button, [class*="btn-"], a[class*="button"]').forEach(btn => {
    btn.addEventListener('mousedown', () => animate(btn, { scale: 0.93 }, { duration: 0.1 }));
    btn.addEventListener('mouseup',   () => animate(btn, { scale: 1 }, { duration: 0.4, easing: [0.34, 1.56, 0.64, 1] }));
    btn.addEventListener('mouseleave',() => animate(btn, { scale: 1 }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] }));
  });

  // 7. Section Scroll Stagger Reveals
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

  // 8. Sponsor Stagger Float
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
