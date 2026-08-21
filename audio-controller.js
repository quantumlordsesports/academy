/**
 * QuantumLords Esports — Premium Background Music & Soundscape Controller
 * 
 * Features:
 * - 5 Official Free Fire Soundtracks & High-Res Artwork Thumbnails
 * - Compact Pill Mode + Ultra-Smooth Expandable Showcase Drawer
 * - Dynamic Playlist Selection with Auto-Collapse on selection
 * - Multi-depth Vinyl Artwork Rotation & Cyber Equalizer
 * - Timeline Progress Scrubbing & Duration Tracking
 * - Next/Prev Track Navigation & Auto-advance playlist
 * - State, Track Index & Volume Persistence in LocalStorage
 * - Cross-page compatibility across subfolders & root
 * - Complete Light & Dark mode adaptation
 */

(function () {
  'use strict';

  // Determine base path to root folder
  function resolveBasePath() {
    const scripts = document.querySelectorAll('script[src*="audio-controller.js"]');
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
      path.includes('/team-updates/') ||
      path.includes('/tactics/') ||
      path.includes('/rewards/')
    ) {
      return '../';
    }
    return '';
  }

  const BASE_PATH = resolveBasePath();
  const ICON_ON = `${BASE_PATH}assets/on.png`;
  const ICON_OFF = `${BASE_PATH}assets/off.png`;
  const CSS_SRC = `${BASE_PATH}audio-controller.css`;

  // Helper to encode URI components safely for file paths
  function safePath(relative) {
    return encodeURI(`${BASE_PATH}${relative}`);
  }

  // 5 Official Tracks with Audio files & Thumbnails
  const TRACKS = [
    {
      id: 'anthem',
      title: 'Free Fire Anthem',
      subtitle: 'Official Entrance Theme',
      artist: 'Garena Free Fire',
      tag: 'ENTRANCE THEME',
      audio: safePath('assets/songs/free_fire.mp3'),
      fallbacks: [safePath('folder/free_fire.mp3'), safePath('assets/free_fire.mp3')],
      thumbnail: safePath('assets/songs/Free Fire anthem.jpg')
    },
    {
      id: 'bulletproof',
      title: 'Beat Carnival (BULLETPROOF)',
      subtitle: 'Free Fire Official Theme Song',
      artist: 'Free Fire Official',
      tag: 'BEAT CARNIVAL',
      audio: safePath('assets/songs/Beat Carnival Theme Song BULLETPROOF  Free Fire Official.mp3'),
      fallbacks: [],
      thumbnail: safePath('assets/songs/Beat Carnival Theme Song Thumbnail BULLETPROOF  Free Fire Official.jpg')
    },
    {
      id: 'booyah_ole',
      title: 'Booyah Olé (Fire Kickoff)',
      subtitle: 'Official Championship Anthem',
      artist: 'Free Fire Official',
      tag: 'CHAMPIONSHIP',
      audio: safePath('assets/songs/Booyah Olé (Fire Kickoff)  Official Lyrics Video  Free Fire Official.mp3'),
      fallbacks: [],
      thumbnail: safePath('assets/songs/Booyah Olé (Fire Kickoff)  Official Lyrics thumbnail  Free Fire Official.jpg')
    },
    {
      id: 'vale_vale',
      title: 'Vale Vale — DJ Alok',
      subtitle: 'Official Collaboration Anthem',
      artist: 'DJ Alok x Free Fire',
      tag: 'ALOK COLLAB',
      audio: safePath('assets/songs/Free Fire x DJ Alok - Vale Vale  Music Video  Free Fire Official Collaboration.mp3'),
      fallbacks: [],
      thumbnail: safePath('assets/songs/Free Fire x DJ Alok - Vale Vale  Music thumnail  Free Fire Official Collaboration.jpg')
    },
    {
      id: 'reunion',
      title: 'Reunion (4th Anniversary)',
      subtitle: 'DVLM x ALOK x KSHMR Theme',
      artist: 'DVLM x ALOK x KSHMR',
      tag: '4TH ANNIVERSARY',
      audio: safePath('assets/songs/Reunion by DVLM x ALOK x KSHMR  Free Fire 4nniversary Theme Song  Free Fire Official Collaboration.mp3'),
      fallbacks: [],
      thumbnail: safePath('assets/songs/Reunion by DVLM x ALOK x KSHMR  Free Fire 4nniversary Theme Song thumbnail  Free Fire Official Collaboration.jpg')
    }
  ];

  // Inject CSS if not present
  function ensureStyles() {
    const existingLink = document.querySelector('link[href*="audio-controller.css"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CSS_SRC;
      document.head.appendChild(link);
    }
  }

  // Format seconds to mm:ss
  function formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Build the enhanced Audio Controller Widget DOM
  function createWidgetDOM(currentTrack, currentTrackIdx) {
    if (document.getElementById('qld-bgm-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'qld-bgm-widget';
    widget.className = 'bgm-widget';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'QuantumLords Background Music Controller');

    // Generate Playlist Items HTML
    const playlistHTML = TRACKS.map((track, idx) => `
      <button 
        type="button"
        class="bgm-playlist-item ${idx === currentTrackIdx ? 'is-active' : ''}" 
        data-track-idx="${idx}"
        title="Play ${track.title}"
        aria-label="Play ${track.title}"
      >
        <div class="bgm-pl-thumb-wrap">
          <img class="bgm-pl-thumb" src="${track.thumbnail}" alt="${track.title}" loading="lazy" />
          <div class="bgm-pl-play-overlay">
            <span class="bgm-pl-icon">${idx === currentTrackIdx ? '❚❚' : '▶'}</span>
          </div>
        </div>
        <div class="bgm-pl-meta">
          <div class="bgm-pl-title">${track.title}</div>
          <div class="bgm-pl-sub">${track.artist}</div>
        </div>
        <div class="bgm-pl-badge">${idx === currentTrackIdx ? 'PLAYING' : `#0${idx + 1}`}</div>
      </button>
    `).join('');

    widget.innerHTML = `
      <!-- Backdrop click shield for expanded mode -->
      <div class="bgm-expanded-backdrop" id="bgmBackdrop" aria-hidden="true"></div>

      <!-- ================= COMPACT BAR ================= -->
      <div class="bgm-compact-bar" id="bgmCompactBar">
        
        <!-- Rotating Mini Album Artwork -->
        <button type="button" class="bgm-thumb-toggle" id="bgmThumbToggle" title="Click to expand music player" aria-label="Expand player and select soundtrack">
          <div class="bgm-thumb-disc">
            <img class="bgm-thumb-img" id="bgmThumbMini" src="${currentTrack.thumbnail}" alt="${currentTrack.title}" />
          </div>
          <span class="bgm-thumb-badge" aria-hidden="true">🎵</span>
        </button>

        <!-- Play/Pause Button -->
        <button type="button" class="bgm-toggle-btn" id="bgmToggleBtn" title="Toggle Music (Play/Pause)" aria-label="Toggle Playback">
          <img class="bgm-icon-img" id="bgmIconImg" src="${ICON_OFF}" alt="Music State" />
        </button>

        <!-- Song Info (Click to Expand) -->
        <div class="bgm-info" id="bgmInfo" title="Click to expand playlist" aria-label="Track Information">
          <div class="bgm-tag">
            <span class="bgm-status-dot" id="bgmStatusDot"></span>
            <span id="bgmStatusText">${currentTrack.tag || 'NOW PLAYING'}</span>
          </div>
          <div class="bgm-title" id="bgmTitle">${currentTrack.title}</div>
        </div>

        <!-- Quick Skip Controls -->
        <div class="bgm-quick-nav">
          <button type="button" class="bgm-nav-btn" id="bgmPrevBtnMini" title="Previous Song" aria-label="Previous Song">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button type="button" class="bgm-nav-btn" id="bgmNextBtnMini" title="Next Song" aria-label="Next Song">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>

        <!-- Audio Equalizer Bars -->
        <div class="bgm-equalizer" id="bgmEqualizer" aria-hidden="true" title="Audio Visualizer">
          <span class="bgm-eq-bar"></span>
          <span class="bgm-eq-bar"></span>
          <span class="bgm-eq-bar"></span>
          <span class="bgm-eq-bar"></span>
        </div>

        <!-- Volume Slider Wrap -->
        <div class="bgm-volume-wrap">
          <button type="button" class="bgm-vol-mute-btn" id="bgmVolMuteBtn" title="Toggle Mute" aria-label="Toggle Mute">
            <span id="bgmVolIcon">🔊</span>
          </button>
          <input 
            type="range" 
            class="bgm-vol-slider" 
            id="bgmVolSlider" 
            min="0" 
            max="100" 
            value="45" 
            title="Music Volume Slider" 
            aria-label="Volume Slider"
          />
        </div>

        <!-- Expand / Playlist Drawer Button -->
        <button type="button" class="bgm-expand-btn" id="bgmExpandBtn" title="Expand Soundtracks & Player" aria-label="Expand Soundtracks Drawer" aria-expanded="false">
          <svg class="bgm-expand-arrow" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
          </svg>
        </button>
      </div>

      <!-- ================= EXPANDED DRAWER PANEL ================= -->
      <div class="bgm-expanded-panel" id="bgmExpandedPanel" aria-hidden="true">
        
        <!-- Expanded Panel Header -->
        <div class="bgm-expanded-header">
          <div class="bgm-exp-tag">
            <span class="bgm-pulse-gem"></span>
            <span>QUANTUM SOUNDSCAPE // PRO PLAYER</span>
          </div>
          <button type="button" class="bgm-close-btn" id="bgmCloseBtn" title="Collapse Player" aria-label="Collapse Music Player">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- Big Artwork & Showcase Area -->
        <div class="bgm-showcase">
          <div class="bgm-showcase-art-wrap">
            <div class="bgm-showcase-art">
              <img id="bgmShowcaseImg" class="bgm-showcase-img" src="${currentTrack.thumbnail}" alt="${currentTrack.title}" />
              <div class="bgm-art-glass"></div>
              <div class="bgm-art-glow"></div>
            </div>
          </div>

          <div class="bgm-showcase-meta">
            <div class="bgm-track-number" id="bgmTrackNumber">TRACK 0${currentTrackIdx + 1} OF 0${TRACKS.length}</div>
            <h3 class="bgm-showcase-title" id="bgmShowcaseTitle">${currentTrack.title}</h3>
            <p class="bgm-showcase-artist" id="bgmShowcaseArtist">${currentTrack.artist} · ${currentTrack.subtitle}</p>

            <!-- Progress Bar / Timeline -->
            <div class="bgm-timeline" id="bgmTimeline" title="Click to seek">
              <div class="bgm-timeline-rail">
                <div class="bgm-timeline-fill" id="bgmTimelineFill" style="width: 0%;"></div>
                <div class="bgm-timeline-thumb" id="bgmTimelineThumb" style="left: 0%;"></div>
              </div>
            </div>
            <div class="bgm-timeline-numbers">
              <span id="bgmCurrentTime">0:00</span>
              <span id="bgmTotalTime">--:--</span>
            </div>
          </div>
        </div>

        <!-- Main Playback Transport Controls -->
        <div class="bgm-transport-row">
          <button type="button" class="bgm-ctrl-btn" id="bgmPrevBtnExp" title="Previous Track" aria-label="Previous Track">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>

          <button type="button" class="bgm-play-big-btn" id="bgmPlayBigBtn" title="Play or Pause" aria-label="Play or Pause">
            <span id="bgmPlayBigIcon">▶</span>
          </button>

          <button type="button" class="bgm-ctrl-btn" id="bgmNextBtnExp" title="Next Track" aria-label="Next Track">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>

        <!-- Soundtracks Selector List -->
        <div class="bgm-playlist-section">
          <div class="bgm-playlist-header">
            <span>OFFICIAL SOUNDTRACKS (${TRACKS.length})</span>
            <span class="bgm-hint">CLICK ANY TRACK TO PLAY</span>
          </div>
          <div class="bgm-playlist-list" id="bgmPlaylistList">
            ${playlistHTML}
          </div>
        </div>

      </div>

      <!-- Autoplay Gesture Tooltip -->
      <div class="bgm-entrance-tooltip" id="bgmTooltip">
        ⚡ Click to enable entrance music & switch tracks
      </div>

      <!-- Audio Element -->
      <audio id="qld-bg-audio" preload="auto">
        <source id="qld-audio-source" src="${currentTrack.audio}" type="audio/mpeg" />
      </audio>
    `;

    document.body.appendChild(widget);
  }

  // Controller Core Logic
  function initAudioController() {
    ensureStyles();

    // 1. Restore persistent track index or default to 0 (Free Fire Anthem)
    let currentTrackIdx = 0;
    const savedIdx = localStorage.getItem('qld_bgm_track_idx');
    if (savedIdx !== null && !isNaN(parseInt(savedIdx, 10))) {
      currentTrackIdx = Math.max(0, Math.min(TRACKS.length - 1, parseInt(savedIdx, 10)));
    }
    const currentTrack = TRACKS[currentTrackIdx];

    // Build DOM
    createWidgetDOM(currentTrack, currentTrackIdx);

    // Grab elements
    const audio = document.getElementById('qld-bg-audio');
    const audioSource = document.getElementById('qld-audio-source');
    const widget = document.getElementById('qld-bgm-widget');
    const compactBar = document.getElementById('bgmCompactBar');
    const expandedPanel = document.getElementById('bgmExpandedPanel');
    const backdrop = document.getElementById('bgmBackdrop');

    const toggleBtn = document.getElementById('bgmToggleBtn');
    const iconImg = document.getElementById('bgmIconImg');
    const statusText = document.getElementById('bgmStatusText');
    const titleEl = document.getElementById('bgmTitle');
    const thumbMini = document.getElementById('bgmThumbMini');

    const thumbToggle = document.getElementById('bgmThumbToggle');
    const infoEl = document.getElementById('bgmInfo');
    const expandBtn = document.getElementById('bgmExpandBtn');
    const closeBtn = document.getElementById('bgmCloseBtn');

    const prevBtnMini = document.getElementById('bgmPrevBtnMini');
    const nextBtnMini = document.getElementById('bgmNextBtnMini');
    const prevBtnExp = document.getElementById('bgmPrevBtnExp');
    const nextBtnExp = document.getElementById('bgmNextBtnExp');
    const playBigBtn = document.getElementById('bgmPlayBigBtn');
    const playBigIcon = document.getElementById('bgmPlayBigIcon');

    const showcaseImg = document.getElementById('bgmShowcaseImg');
    const showcaseTitle = document.getElementById('bgmShowcaseTitle');
    const showcaseArtist = document.getElementById('bgmShowcaseArtist');
    const trackNumber = document.getElementById('bgmTrackNumber');

    const timeline = document.getElementById('bgmTimeline');
    const timelineFill = document.getElementById('bgmTimelineFill');
    const timelineThumb = document.getElementById('bgmTimelineThumb');
    const currentTimeEl = document.getElementById('bgmCurrentTime');
    const totalTimeEl = document.getElementById('bgmTotalTime');

    const volSlider = document.getElementById('bgmVolSlider');
    const volMuteBtn = document.getElementById('bgmVolMuteBtn');
    const volIcon = document.getElementById('bgmVolIcon');
    const tooltip = document.getElementById('bgmTooltip');
    const playlistList = document.getElementById('bgmPlaylistList');

    if (!audio || !widget) return;

    // Load saved volume
    const savedVol = localStorage.getItem('qld_bgm_volume');
    const initialVolume = savedVol !== null ? parseFloat(savedVol) : 0.45;
    audio.volume = Math.max(0, Math.min(1, initialVolume));
    if (volSlider) {
      volSlider.value = Math.round(audio.volume * 100);
    }
    updateVolumeIcon(audio.volume);

    // Saved state
    const savedState = localStorage.getItem('qld_bgm_state');
    let isExplicitlyPaused = savedState === 'paused';
    let isExpanded = false;
    let autoCollapseTimer = null;
    let isSeeking = false;

    // Update Volume Icon
    function updateVolumeIcon(vol) {
      if (!volIcon) return;
      if (vol <= 0.01) {
        volIcon.textContent = '🔇';
      } else if (vol < 0.5) {
        volIcon.textContent = '🔉';
      } else {
        volIcon.textContent = '🔊';
      }
    }

    // Toggle Expand / Collapse Drawer
    function setExpanded(expand) {
      isExpanded = !!expand;
      if (isExpanded) {
        widget.classList.add('is-expanded');
        expandedPanel.setAttribute('aria-hidden', 'false');
        expandBtn.setAttribute('aria-expanded', 'true');
        expandBtn.classList.add('is-open');
        // Scroll active item into view inside playlist
        const activeItem = playlistList.querySelector('.bgm-playlist-item.is-active');
        if (activeItem) {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        widget.classList.remove('is-expanded');
        expandedPanel.setAttribute('aria-hidden', 'true');
        expandBtn.setAttribute('aria-expanded', 'false');
        expandBtn.classList.remove('is-open');
        if (autoCollapseTimer) {
          clearTimeout(autoCollapseTimer);
          autoCollapseTimer = null;
        }
      }
    }

    // Update Player UI when playing / paused
    function updateUI(isPlaying) {
      if (isPlaying) {
        widget.classList.add('is-playing');
        iconImg.src = ICON_ON;
        iconImg.alt = 'Music Playing';
        if (statusText) statusText.textContent = TRACKS[currentTrackIdx].tag || 'NOW PLAYING';
        if (playBigIcon) playBigIcon.textContent = '❚❚';
        toggleBtn.setAttribute('title', 'Pause Music');
        toggleBtn.setAttribute('aria-label', 'Pause Music');
        if (tooltip) tooltip.classList.remove('is-visible');
      } else {
        widget.classList.remove('is-playing');
        iconImg.src = ICON_OFF;
        iconImg.alt = 'Music Paused';
        if (statusText) statusText.textContent = 'MUSIC PAUSED';
        if (playBigIcon) playBigIcon.textContent = '▶';
        toggleBtn.setAttribute('title', 'Play Music');
        toggleBtn.setAttribute('aria-label', 'Play Music');
      }

      // Update active playlist item icon
      const items = playlistList.querySelectorAll('.bgm-playlist-item');
      items.forEach((item, idx) => {
        const icon = item.querySelector('.bgm-pl-icon');
        const badge = item.querySelector('.bgm-pl-badge');
        if (idx === currentTrackIdx) {
          item.classList.add('is-active');
          if (icon) icon.textContent = isPlaying ? '❚❚' : '▶';
          if (badge) badge.textContent = isPlaying ? 'PLAYING' : 'SELECTED';
        } else {
          item.classList.remove('is-active');
          if (icon) icon.textContent = '▶';
          if (badge) badge.textContent = `#0${idx + 1}`;
        }
      });
    }

    // Switch Track
    function loadTrack(idx, autoPlay = true, collapseAfter = false) {
      currentTrackIdx = (idx + TRACKS.length) % TRACKS.length;
      localStorage.setItem('qld_bgm_track_idx', currentTrackIdx.toString());
      const track = TRACKS[currentTrackIdx];

      // Update Audio Source
      audio.pause();
      audioSource.src = track.audio;
      audio.load();

      // Update Compact View
      titleEl.textContent = track.title;
      thumbMini.src = track.thumbnail;
      thumbMini.alt = track.title;
      statusText.textContent = track.tag || 'NOW PLAYING';

      // Update Expanded View
      showcaseImg.src = track.thumbnail;
      showcaseImg.alt = track.title;
      showcaseTitle.textContent = track.title;
      showcaseArtist.textContent = `${track.artist} · ${track.subtitle}`;
      trackNumber.textContent = `TRACK 0${currentTrackIdx + 1} OF 0${TRACKS.length}`;
      timelineFill.style.width = '0%';
      timelineThumb.style.left = '0%';
      currentTimeEl.textContent = '0:00';
      totalTimeEl.textContent = '--:--';

      if (autoPlay) {
        startMusic();
      } else {
        updateUI(false);
      }

      // If user selected from playlist, smoothly collapse back after short preview delay
      if (collapseAfter) {
        if (autoCollapseTimer) clearTimeout(autoCollapseTimer);
        autoCollapseTimer = setTimeout(() => {
          setExpanded(false);
        }, 550);
      }
    }

    // Play with graceful handling
    function startMusic() {
      isExplicitlyPaused = false;
      localStorage.setItem('qld_bgm_state', 'playing');
      const targetVol = parseFloat(volSlider.value) / 100 || 0.45;
      audio.volume = targetVol;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            updateUI(true);
          })
          .catch((err) => {
            console.log('Autoplay blocked by browser policy:', err);
            updateUI(false);
            showEntrancePrompt();
          });
      }
    }

    // Pause music
    function pauseMusic() {
      isExplicitlyPaused = true;
      localStorage.setItem('qld_bgm_state', 'paused');
      audio.pause();
      updateUI(false);
    }

    // Toggle Play / Pause
    function togglePlayback() {
      if (audio.paused) {
        startMusic();
      } else {
        pauseMusic();
      }
    }

    // Show prompt tooltip if autoplay was prevented
    function showEntrancePrompt() {
      if (isExplicitlyPaused || !audio.paused) return;
      if (tooltip) {
        tooltip.classList.add('is-visible');
        setTimeout(() => {
          if (tooltip) tooltip.classList.remove('is-visible');
        }, 6000);
      }
    }

    // Setup first interaction unlock
    function setupFirstInteractionUnlock() {
      const unlockEvents = ['pointerdown', 'click', 'keydown', 'touchstart', 'scroll'];
      const onFirstInteraction = () => {
        unlockEvents.forEach((evt) => window.removeEventListener(evt, onFirstInteraction));
        if (!isExplicitlyPaused && audio.paused) {
          audio.play()
            .then(() => {
              updateUI(true);
            })
            .catch(() => {});
        }
      };

      unlockEvents.forEach((evt) => {
        window.addEventListener(evt, onFirstInteraction, { once: true, passive: true });
      });
    }

    // ================= EVENT LISTENERS =================

    // Compact Bar Toggles
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayback();
    });

    playBigBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayback();
    });

    // Expand Trigger on Mini Thumbnail, Info, or Expand Arrow Button
    thumbToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setExpanded(!isExpanded);
    });

    infoEl.addEventListener('click', (e) => {
      e.stopPropagation();
      setExpanded(true);
    });

    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setExpanded(!isExpanded);
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setExpanded(false);
    });

    backdrop.addEventListener('click', () => {
      setExpanded(false);
    });

    // Previous & Next Navigation (Compact & Expanded)
    function goPrev(collapse = false) {
      loadTrack(currentTrackIdx - 1, !audio.paused || !isExplicitlyPaused, collapse);
    }
    function goNext(collapse = false) {
      loadTrack(currentTrackIdx + 1, !audio.paused || !isExplicitlyPaused, collapse);
    }

    prevBtnMini.addEventListener('click', (e) => {
      e.stopPropagation();
      goPrev(false);
    });
    nextBtnMini.addEventListener('click', (e) => {
      e.stopPropagation();
      goNext(false);
    });
    prevBtnExp.addEventListener('click', (e) => {
      e.stopPropagation();
      goPrev(false);
    });
    nextBtnExp.addEventListener('click', (e) => {
      e.stopPropagation();
      goNext(false);
    });

    // Playlist Item Click
    playlistList.addEventListener('click', (e) => {
      const item = e.target.closest('.bgm-playlist-item');
      if (!item) return;
      e.stopPropagation();
      const idx = parseInt(item.getAttribute('data-track-idx'), 10);
      if (idx === currentTrackIdx) {
        togglePlayback();
      } else {
        loadTrack(idx, true, true); // Changes song and smoothly auto-collapses
      }
    });

    // Audio Timeline & Scrubbing
    audio.addEventListener('timeupdate', () => {
      if (isSeeking) return;
      const cur = audio.currentTime || 0;
      const dur = audio.duration || 0;
      currentTimeEl.textContent = formatTime(cur);
      if (dur > 0) {
        totalTimeEl.textContent = formatTime(dur);
        const percent = Math.min(100, Math.max(0, (cur / dur) * 100));
        timelineFill.style.width = `${percent}%`;
        timelineThumb.style.left = `${percent}%`;
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration) {
        totalTimeEl.textContent = formatTime(audio.duration);
      }
    });

    // Timeline Click Seeking
    timeline.addEventListener('click', (e) => {
      const rect = timeline.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      if (audio.duration) {
        audio.currentTime = percent * audio.duration;
        timelineFill.style.width = `${percent * 100}%`;
        timelineThumb.style.left = `${percent * 100}%`;
      }
    });

    // Auto-advance to Next Song when Track Ends
    audio.addEventListener('ended', () => {
      goNext(false);
    });

    // Volume Slider
    volSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      audio.volume = val;
      localStorage.setItem('qld_bgm_volume', val.toString());
      updateVolumeIcon(val);

      if (val === 0) {
        iconImg.src = ICON_OFF;
      } else if (!audio.paused) {
        iconImg.src = ICON_ON;
      }
    });

    // Volume Mute Button
    let preMuteVolume = 0.45;
    volMuteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (audio.volume > 0.01) {
        preMuteVolume = audio.volume;
        audio.volume = 0;
        volSlider.value = 0;
      } else {
        audio.volume = preMuteVolume || 0.45;
        volSlider.value = Math.round(audio.volume * 100);
      }
      localStorage.setItem('qld_bgm_volume', audio.volume.toString());
      updateVolumeIcon(audio.volume);
    });

    // Keyboard Hotkeys
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'Escape' && isExpanded) {
        setExpanded(false);
      }
    });

    // Autoplay Entrance Attempt
    if (!isExplicitlyPaused) {
      audio.play()
        .then(() => {
          updateUI(true);
        })
        .catch(() => {
          updateUI(false);
          setupFirstInteractionUnlock();
          showEntrancePrompt();
        });
    } else {
      updateUI(false);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudioController);
  } else {
    initAudioController();
  }
})();
