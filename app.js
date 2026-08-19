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
  setText('#hero-title', siteData.teamName);

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
    } catch (e) {}
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

    // Update all theme toggle buttons across the page
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      const isLight = theme === 'light';
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      btn.setAttribute('aria-label', isLight ? 'Switch to Dark Theme' : 'Switch to Bright Theme');
      btn.setAttribute('title', isLight ? 'Switch to Dark Theme' : 'Switch to Bright Theme');

      const icon = btn.querySelector('.theme-toggle-icon');
      const text = btn.querySelector('.theme-toggle-text');

      if (icon) {
        icon.innerHTML = isLight ? '☀️' : '🌙';
      }
      if (text) {
        text.textContent = isLight ? 'Bright' : 'Dark';
      }
    });

    if (playAudio && window.AudioController && typeof window.AudioController.play === 'function') {
      window.AudioController.play('click');
    }
  };

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
  const values = document.querySelectorAll('.stat-value[data-count]');
  if (!values.length) return;
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  values.forEach((el) => observer.observe(el));
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

/* ---------- Global Background Video Controller ---------- */

const initGlobalBackgroundVideo = () => {
  try {
    const pathname = (window.location.pathname || '').toLowerCase();
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

    // List of excluded pages where background video must NEVER render or play
    const excludedPages = [
      'profile',
      'profile.html',
      'nishad.html',
      'roman.html',
      'santo.html',
      'shahriar.html'
    ];

    const isExcluded = excludedPages.some(page => 
      filename === page || 
      pathname.includes('/' + page) || 
      pathname.endsWith(page)
    );

    const existingVideoBg = document.querySelector('.global-video-bg');

    if (isExcluded) {
      if (existingVideoBg) {
        existingVideoBg.remove();
      }
      document.body.classList.remove('has-global-video');
      return;
    }

    if (existingVideoBg) {
      document.body.classList.add('has-global-video');
      const video = existingVideoBg.querySelector('video');
      if (video) {
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('muted', '');

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            const resumeOnInteraction = () => {
              video.play().catch(() => {});
              window.removeEventListener('click', resumeOnInteraction);
              window.removeEventListener('touchstart', resumeOnInteraction);
              window.removeEventListener('scroll', resumeOnInteraction);
            };
            window.addEventListener('click', resumeOnInteraction, { once: true, passive: true });
            window.addEventListener('touchstart', resumeOnInteraction, { once: true, passive: true });
            window.addEventListener('scroll', resumeOnInteraction, { once: true, passive: true });
          });
        }

        // Performance: Pause video when page is hidden
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            video.pause();
          } else {
            video.play().catch(() => {});
          }
        });
      }
    }
  } catch (err) {
    console.warn('Global background video init notice:', err);
  }
};

/* ---------- Boot ---------- */

// Run theme setup immediately for fast response
if (document.readyState !== 'loading') {
  initThemeToggle();
  initGlobalBackgroundVideo();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initGlobalBackgroundVideo();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initGlobalBackgroundVideo();
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


