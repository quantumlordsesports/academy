const setText = (selector, text) => {
  const element = document.querySelector(selector);
  if (element && text) element.textContent = text;
};

/* ---------- Site data builders (guarded for multi-page safety) ---------- */

const applySiteData = () => {
  if (typeof siteData === 'undefined') return;
  document.documentElement.style.setProperty('--accent', siteData.accentColor || '#e8c56a');
  document.documentElement.style.setProperty('--accent-soft', `${siteData.accentColor || '#e8c56a'}20`);
  document.documentElement.style.setProperty('--accent-glow', `${siteData.accentColor || '#e8c56a'}59`);
  const heroTitle = document.querySelector('#hero-title');
  if (heroTitle) {
    const grad = heroTitle.querySelector('.hero-gradient-text');
    if (grad) grad.textContent = siteData.teamName;
    else heroTitle.textContent = siteData.teamName;
  }

  const emailContainer = document.getElementById('contact-emails');
  if (emailContainer) {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteData.contactEmail || 'quantumlordsesports@gmail.com')}`;
    emailContainer.innerHTML = `
      <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" class="email-card">
        <span class="social-icon" aria-hidden="true"><img class="social-logo" src="assets/social/gmail.webp" alt="Gmail" onerror="this.src='../assets/social/gmail.webp'" /></span>
        <span>${siteData.contactEmail}</span>
      </a>`;
  }
};

/* ---------- Social links ---------- */

const buildSocialLinks = () => {
  const socialList = document.getElementById('social-links');
  if (!socialList || typeof siteData === 'undefined' || !siteData.socials) return;
  const icons = {
    twitter: 'X',
    instagram: '<img class="social-logo" src="assets/social/instagram 02.png" alt="Instagram" />',
    youtube: '<img class="social-logo" src="assets/social/youtube 02.webp" alt="YouTube" />',
    discord: '<img class="social-logo" src="assets/social/discord Logo.png" alt="Discord" onerror="this.src=\'assets/social/discord.png\'" />',
    tiktok: 'TT',
    facebook: '<img class="social-logo" src="assets/social/facebook.png" alt="Facebook" />'
  };

  Object.entries(siteData.socials).forEach(([key, href]) => {
    if (!href) return;
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer noopener';
    const iconMarkup = icons[key] || key.slice(0, 2).toUpperCase();
    anchor.innerHTML = `<span class="social-icon">${iconMarkup}</span><span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>`;
    li.appendChild(anchor);
    socialList.appendChild(li);
  });
};

/* ---------- Image helpers ---------- */

const createImageWithFallback = (src, alt, fallbackText) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'player-card__photo skeleton-wrap';

  const skeleton = document.createElement('div');
  skeleton.className = 'skeleton-box';

  const image = document.createElement('img');
  image.dataset.src = src; // lazy loader picks this up
  image.alt = alt;
  image.className = 'lazy-img';

  const fallback = document.createElement('div');
  fallback.className = 'photo-fallback';
  fallback.textContent = fallbackText;
  fallback.style.display = 'none';

  wrapper.appendChild(skeleton);
  wrapper.appendChild(image);
  wrapper.appendChild(fallback);
  return wrapper;
};

/* ---------- Roster ---------- */

const buildRoster = () => {
  const rosterGrid = document.getElementById('roster-grid');
  if (!rosterGrid || typeof siteData === 'undefined' || !siteData.roster) return;
  siteData.roster.forEach((player) => {
    const card = document.createElement('article');
    card.className = 'card player-card tilt-card';

    const imageSection = createImageWithFallback(player.photo, `${player.handle} profile photo`, player.handle);
    card.appendChild(imageSection);

    const body = document.createElement('div');
    body.className = 'card-body';
    const displayName = player.ign || player.handle || player.realName;
    body.innerHTML = `
      <div class="roster-meta-top">
        <p class="card-subtitle">${player.role}</p>
      </div>
      <h3 class="card-title">${displayName}</h3>
      <div class="roster-info-box">
        <p class="card-text roster-name"><strong>${player.realName}</strong></p>
        <p class="card-text roster-location">📍 ${player.location}</p>
        <p class="card-text roster-tag">⚡ ${player.tag}</p>
      </div>
    `;
    card.appendChild(body);
    rosterGrid.appendChild(card);
  });
};

/* ---------- Achievements ---------- */

const buildAchievements = () => {
  const achievementsGrid = document.getElementById('achievements-grid');
  if (!achievementsGrid || typeof siteData === 'undefined' || !siteData.achievements) return;
  siteData.achievements.forEach((achievement, index) => {
    const card = document.createElement('article');
    card.className = 'achievement-card';
    const rank = String(index + 1).padStart(2, '0');
    card.setAttribute('data-rank', rank);
    card.innerHTML = `
      <h3>${achievement.event}</h3>
      <p class="achievement-meta">${achievement.placement} · ${achievement.date}</p>
      <p class="card-text">${achievement.prize || ''}</p>
    `;
    achievementsGrid.appendChild(card);
  });
};

/* ---------- News ---------- */

const buildNews = () => {
  const newsGrid = document.getElementById('news-grid');
  if (!newsGrid || typeof siteData === 'undefined' || !siteData.news) return;
  siteData.news.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card highlight-card';

    const link = document.createElement('a');
    link.className = 'highlight-link';
    link.href = item.url || '#';

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'highlight-thumb skeleton-wrap';

    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-box';

    const image = document.createElement('img');
    image.className = 'lazy-img';
    image.dataset.src = item.thumbnail;
    image.alt = item.title;

    const overlay = document.createElement('div');
    overlay.className = 'highlight-overlay';
    overlay.innerHTML = `<div class="overlay-content"><span class="play-btn">▶</span><h4>VIEW MATCH STATS</h4></div>`;

    thumbWrap.appendChild(skeleton);
    thumbWrap.appendChild(image);
    thumbWrap.appendChild(overlay);
    link.appendChild(thumbWrap);

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `
      <p class="achievement-meta">${item.date}</p>
      <h3>${item.title}</h3>
      <p class="card-text">${item.blurb}</p>
    `;

    card.appendChild(link);
    card.appendChild(body);
    newsGrid.appendChild(card);
  });
};

/* ---------- Sponsors ---------- */

const buildSponsors = () => {
  const sponsorGrid = document.getElementById('sponsor-grid');
  const sponsorText = document.getElementById('sponsor-text');
  if (!sponsorGrid || !sponsorText || typeof siteData === 'undefined') return;

  if (!siteData.sponsors || !siteData.sponsors.length) {
    sponsorText.textContent = siteData.sponsorText || '';
    sponsorGrid.style.display = 'none';
    return;
  }

  sponsorText.textContent = '';
  sponsorGrid.style.display = 'grid';

  siteData.sponsors.forEach((sponsor) => {
    const link = document.createElement('a');
    link.className = 'sponsor-card';
    link.href = sponsor.url || '#';
    link.target = '_blank';
    link.rel = 'noreferrer noopener';

    const image = document.createElement('img');
    image.src = sponsor.logo;
    image.alt = sponsor.name;
    image.loading = 'lazy';
    image.onerror = () => {
      image.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.textContent = sponsor.name;
      fallback.style.color = 'var(--muted)';
      fallback.style.fontWeight = '700';
      link.appendChild(fallback);
    };

    link.appendChild(image);
    sponsorGrid.appendChild(link);
  });
};

/* ---------- Hero logo fallback ---------- */

const updateHeroLogoFallback = () => {
  const logo = document.querySelector('.hero-logo');
  const fallback = document.querySelector('.logo-fallback');
  if (!logo || !fallback) return;
  logo.onerror = () => {
    logo.style.display = 'none';
    fallback.style.display = 'grid';
  };
};

/* ---------- Mobile nav & Universal Menu Handling ---------- */

const setupNavToggle = () => {
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('primary-navigation');
  if (!toggle || !navList) return;

  const toggleLabel = toggle.querySelector('.nav-toggle-label') || toggle.querySelector('span:not(.nav-toggle-bar)');

  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-open');
    navList.classList.add('open');
    if (toggleLabel) toggleLabel.textContent = 'Close';
    if (window.AudioController && typeof window.AudioController.play === 'function') {
      window.AudioController.play('click');
    }
  };

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('is-open');
    navList.classList.remove('open');
    if (toggleLabel) toggleLabel.textContent = 'Menu';
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking any nav link
  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close when clicking outside the navigation
  document.addEventListener('click', (e) => {
    if (navList.classList.contains('open')) {
      const isInsideNav = toggle.contains(e.target) || navList.contains(e.target);
      if (!isInsideNav) {
        closeMenu();
      }
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navList.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // Auto-close on viewport resize past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 860 && navList.classList.contains('open')) {
      closeMenu();
    }
  });

  // Automatically ensure the active link is highlighted if not manually set
  const currentPath = window.location.pathname.replace(/\\/g, '/');
  const hasManualActive = navList.querySelector('a.active');
  if (!hasManualActive) {
    navList.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href) {
        const cleanHref = href.split('#')[0].split('?')[0];
        if (cleanHref && (currentPath.endsWith(cleanHref) || (cleanHref === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))))) {
          a.classList.add('active');
        }
      }
    });
  }
};

/* ---------- Theme Toast Notification ---------- */

(function injectThemeToastCSS() {
  if (document.getElementById('qld-theme-toast-style')) return;
  const style = document.createElement('style');
  style.id = 'qld-theme-toast-style';
  style.textContent = `
    #qld-theme-toast {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(120px);
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 22px 14px 18px;
      border-radius: 18px;
      min-width: 300px;
      max-width: 480px;
      backdrop-filter: blur(22px) saturate(180%);
      -webkit-backdrop-filter: blur(22px) saturate(180%);
      border: 1.5px solid;
      box-shadow: 0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06);
      font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.45;
      cursor: default;
      user-select: none;
      opacity: 0;
      transition: transform 0.52s cubic-bezier(0.22, 1, 0.36, 1),
                  opacity 0.42s ease;
      overflow: hidden;
    }
    #qld-theme-toast.toast-dark {
      background: rgba(10, 13, 23, 0.88);
      border-color: rgba(232, 197, 106, 0.45);
      color: #f0ecd8;
    }
    #qld-theme-toast.toast-light {
      background: rgba(255, 252, 240, 0.90);
      border-color: rgba(220, 160, 0, 0.45);
      color: #1a1600;
    }
    #qld-theme-toast.toast-show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    .qld-toast-icon {
      font-size: 28px;
      line-height: 1;
      flex-shrink: 0;
      filter: drop-shadow(0 0 8px rgba(255,200,50,0.5));
      animation: toastIconBounce 0.7s cubic-bezier(0.36,1.4,0.64,1) 0.1s both;
    }
    @keyframes toastIconBounce {
      0%   { transform: scale(0.5) rotate(-15deg); opacity: 0; }
      60%  { transform: scale(1.2) rotate(6deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .qld-toast-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
    }
    .qld-toast-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      opacity: 0.6;
    }
    .qld-toast-msg {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .qld-toast-dark .qld-toast-title  { color: #e8c56a; }
    .qld-toast-dark .qld-toast-msg    { color: #f5f0de; }
    .qld-toast-light .qld-toast-title { color: #b37a00; }
    .qld-toast-light .qld-toast-msg   { color: #1a1600; }
    .qld-toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      border-radius: 0 0 18px 18px;
      width: 100%;
      transform-origin: left;
    }
    .toast-dark  .qld-toast-progress { background: linear-gradient(90deg, #e8c56a, #f6df9c, #00f0ff); }
    .toast-light .qld-toast-progress { background: linear-gradient(90deg, #f5c400, #ffdf60, #ff8c00); }
    .qld-toast-progress.running {
      animation: toastProgressDrain 3.6s linear forwards;
    }
    @keyframes toastProgressDrain {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }
  `;
  document.head.appendChild(style);
})();

const showThemeToast = (() => {
  let toastEl = null;
  let hideTimer = null;

  return function(theme) {
    // Create toast element once
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'qld-theme-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      toastEl.innerHTML = `
        <span class="qld-toast-icon"></span>
        <div class="qld-toast-body">
          <span class="qld-toast-title"></span>
          <span class="qld-toast-msg"></span>
        </div>
        <span class="qld-toast-progress"></span>
      `;
      document.body.appendChild(toastEl);
    }

    // Clear any running hide timer
    if (hideTimer) clearTimeout(hideTimer);

    const isDark = theme === 'dark';
    const icon    = isDark ? '🌙' : '☀️';
    const title   = isDark ? 'Dark Mode Activated' : 'Bright Mode Activated';
    const msg     = isDark
      ? 'Programmers Prefer Dark Mode. Because Light attracts Bugs 🐛'
      : 'Good Morning! Welcome to the bright side ☀️';

    // Swap classes
    toastEl.classList.remove('toast-dark', 'toast-light', 'toast-show');
    void toastEl.offsetWidth; // reflow to restart animations
    toastEl.classList.add(isDark ? 'toast-dark' : 'toast-light');

    toastEl.querySelector('.qld-toast-icon').textContent  = icon;
    toastEl.querySelector('.qld-toast-title').textContent = title;
    toastEl.querySelector('.qld-toast-msg').textContent   = msg;

    // Reset progress bar
    const prog = toastEl.querySelector('.qld-toast-progress');
    prog.classList.remove('running');
    void prog.offsetWidth;
    prog.classList.add('running');

    // Slide in
    requestAnimationFrame(() => {
      toastEl.classList.add('toast-show');
    });

    // Auto-dismiss after 3.6 s
    hideTimer = setTimeout(() => {
      toastEl.classList.remove('toast-show');
    }, 3600);
  };
})();

/* ---------- Dual-Theme Switcher (Dark / Bright) ---------- */

const initThemeToggle = () => {
  const getStoredTheme = () => {
    try {
      return localStorage.getItem('qld_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  };

  const setStoredTheme = (theme) => {
    try {
      localStorage.setItem('qld_theme', theme);
    } catch (e) { }
  };

  const applyTheme = (theme, playAudio = false) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      if (document.body) document.body.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
      if (document.body) document.body.classList.remove('theme-light');
    }

    if (typeof window.updateAtmosphereTheme === 'function') {
      window.updateAtmosphereTheme();
    }

    // Update all theme toggle buttons across the page
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      const isLight = theme === 'light';
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      btn.setAttribute('aria-label', isLight ? 'Switch to Dark Theme' : 'Switch to Bright Theme');
      btn.setAttribute('title', isLight ? 'Switch to Dark Theme' : 'Switch to Bright Theme');

      const icon = btn.querySelector('.theme-toggle-icon');
      const text = btn.querySelector('.theme-toggle-text');

      // Logic: If in Bright Mode -> button shows 'Dark' (🌙) to switch to dark.
      //        If in Dark Mode   -> button shows 'Bright' (☀️) to switch to bright.
      if (icon) {
        icon.innerHTML = isLight ? '🌙' : '☀️';
      }
      if (text) {
        text.textContent = isLight ? 'Dark' : 'Bright';
      }

      // Bengali Teaser Badge ("ব্রাইট মুডে আরো মজা পাবেন ") - Visible only in Dark mode
      let badge = btn.querySelector('.theme-toggle-teaser-badge');
      if (!isLight) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'theme-toggle-teaser-badge';
          badge.textContent = 'ব্রাইট মুডে আরো মজা পাবেন ';
          btn.appendChild(badge);
        }
        badge.style.display = 'inline-flex';
      } else if (badge) {
        badge.style.display = 'none';
      }
    });

    if (playAudio && window.AudioController && typeof window.AudioController.play === 'function') {
      window.AudioController.play('click');
    }
  };

  // Auto-inject theme-atmosphere.js if not already present
  if (!document.querySelector('script[src*="theme-atmosphere.js"]')) {
    const atmoScript = document.createElement('script');
    // Detect relative path depth
    const isSubdir = window.location.pathname.includes('/roster/') || 
                     window.location.pathname.includes('/team-updates/') || 
                     window.location.pathname.includes('/tactics/') || 
                     window.location.pathname.includes('/recruit/') || 
                     window.location.pathname.includes('/contact/') || 
                     window.location.pathname.includes('/portal/') || 
                     window.location.pathname.includes('/rewards/');
    atmoScript.src = isSubdir ? '../theme-atmosphere.js' : 'theme-atmosphere.js';
    atmoScript.defer = true;
    document.head.appendChild(atmoScript);
  }

  // Initial apply
  const currentTheme = getStoredTheme();
  applyTheme(currentTheme, false);

  // Bind click listeners on all theme toggles
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    // Avoid double listeners
    if (btn.dataset.themeBound) return;
    btn.dataset.themeBound = 'true';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setStoredTheme(next);
      applyTheme(next, true);
      showThemeToast(next);
    });
  });
};

/* ---------- Preloader ---------- */

const initPreloader = () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  const hide = () => preloader.classList.add('done');
  if (document.readyState === 'complete') {
    setTimeout(hide, 600);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 600));
  }
  // Safety: never trap the user behind the preloader
  setTimeout(hide, 3500);
};

/* ---------- Scroll progress + header state ---------- */

const initScrollFx = () => {
  const progress = document.querySelector('.scroll-progress i');
  const header = document.querySelector('.site-header');
  if (!progress && !header) return;
  const onScroll = () => {
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && max > 0) {
      progress.style.width = `${(scrollTop / max) * 100}%`;
    }
    if (header) header.classList.toggle('scrolled', scrollTop > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

/* ---------- Mouse glow ---------- */

const initMouseGlow = () => {
  const glow = document.querySelector('.mouse-glow');
  if (!glow) return;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover) {
    glow.style.display = 'none';
    return;
  }
  let raf = null;
  window.addEventListener('mousemove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      raf = null;
    });
  }, { passive: true });
};

/* ---------- Stats counters ---------- */

const initCounters = () => {
  const elements = document.querySelectorAll('.stat-value[data-count], .stat-num[data-counter], [data-counter]');
  if (!elements.length) return;

  const animateNumber = (el) => {
    const rawVal = el.dataset.counter || el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const displayVal = el.dataset.display || '';

    if (displayVal || rawVal === 'unlimited' || isNaN(parseInt(rawVal, 10))) {
      const finalStr = displayVal || rawVal || 'Unlimited';
      let iter = 0;
      const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&';
      const interval = setInterval(() => {
        el.textContent = finalStr.split('').map((char, index) => {
          if (index < iter) return char;
          return letters[Math.floor(Math.random() * letters.length)];
        }).join('') + suffix;

        if (iter >= finalStr.length) {
          clearInterval(interval);
          el.textContent = finalStr + suffix;
        }
        iter += 1 / 2;
      }, 35);
      return;
    }

    const target = parseInt(rawVal, 10);
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elements.forEach((el) => observer.observe(el));
};

/* ---------- Scroll reveal (lightweight, no dependency) ---------- */

const initReveal = () => {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach((el) => observer.observe(el));
};

/* ---------- ScrollReveal (external lib, optional) ---------- */

const initScrollReveal = () => {
  if (typeof ScrollReveal === 'undefined') return;
  ScrollReveal().reveal('.hero-branding, .section-header, .card, .highlight-card, .recruit-copy, .recruit-image, .contact-card, .sponsor-card', {
    distance: '36px',
    origin: 'bottom',
    opacity: 0,
    duration: 900,
    interval: 110,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    viewFactor: 0.18,
  });
};

/* ---------- Boot ---------- */

// Run theme setup immediately for fast response
if (document.readyState !== 'loading') {
  initThemeToggle();
} else {
  document.addEventListener('DOMContentLoaded', initThemeToggle);
}

window.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  applySiteData();
  buildSocialLinks();
  buildRoster();
  buildAchievements();
  buildNews();
  buildSponsors();
  updateHeroLogoFallback();
  setupNavToggle();
  initPreloader();
  initScrollFx();
  initMouseGlow();
  initCounters();
  initReveal();
  initScrollReveal();

  if (window.UIEffects) {
    try {
      window.UIEffects.initTilt('.tilt-card');
      window.UIEffects.initImageSkeleton();
      window.UIEffects.seedHeroParticles(8);
    } catch (e) {
      console.warn('UIEffects init error', e);
    }
  }
});

