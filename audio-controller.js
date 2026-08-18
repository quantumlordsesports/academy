/**
 * QuantumLords Esports — Viewer Entrance Background Music Controller
 * Features:
 * - Autoplays background music (free_fire.mp3 from folder/) on entrance
 * - Graceful fallback & unlock on first user gesture for strict autoplay browser policies
 * - Sleek Cyberpunk/Obsidian floating player widget
 * - Dynamic ON / OFF icon swapping using folder/on.png & folder/off.png
 * - Animated multi-bar audio equalizer
 * - Smooth volume control slider & persistence across page navigation
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
      path.includes('/portal/')
    ) {
      return '../';
    }
    return '';
  }

  const BASE_PATH = resolveBasePath();
  const AUDIO_SRC = `${BASE_PATH}folder/free_fire.mp3`;
  const ICON_ON = `${BASE_PATH}folder/on.png`;
  const ICON_OFF = `${BASE_PATH}folder/off.png`;
  const CSS_SRC = `${BASE_PATH}audio-controller.css`;

  // Inject CSS if not already present
  function ensureStyles() {
    const existingLink = document.querySelector('link[href*="audio-controller.css"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CSS_SRC;
      document.head.appendChild(link);
    }
  }

  // Build the floating Audio Widget DOM
  function createWidgetDOM() {
    if (document.getElementById('qld-bgm-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'qld-bgm-widget';
    widget.className = 'bgm-widget';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'Background Music Controller');

    widget.innerHTML = `
      <button class="bgm-toggle-btn" id="bgmToggleBtn" title="Toggle Background Music (Play/Pause)" aria-label="Toggle Background Music">
        <img class="bgm-icon-img" id="bgmIconImg" src="${ICON_OFF}" alt="Music Stopped" />
      </button>

      <div class="bgm-info" id="bgmInfo" title="Click to toggle music">
        <div class="bgm-tag">
          <span class="bgm-status-dot" id="bgmStatusDot"></span>
          <span id="bgmStatusText">ENTRANCE THEME</span>
        </div>
        <div class="bgm-title">Free Fire Anthem</div>
      </div>

      <div class="bgm-equalizer" aria-hidden="true" title="Audio Visualizer">
        <span class="bgm-eq-bar"></span>
        <span class="bgm-eq-bar"></span>
        <span class="bgm-eq-bar"></span>
        <span class="bgm-eq-bar"></span>
      </div>

      <div class="bgm-volume-wrap">
        <input 
          type="range" 
          class="bgm-vol-slider" 
          id="bgmVolSlider" 
          min="0" 
          max="100" 
          value="45" 
          title="Adjust Music Volume" 
          aria-label="Volume Slider"
        />
      </div>

      <div class="bgm-entrance-tooltip" id="bgmTooltip">
        ⚡ Click to enable entrance music
      </div>

      <audio id="qld-bg-audio" loop preload="auto">
        <source src="${AUDIO_SRC}" type="audio/mpeg" />
        <source src="${BASE_PATH}assets/free_fire.mp3" type="audio/mpeg" />
      </audio>
    `;

    document.body.appendChild(widget);
  }

  // Controller Logic
  function initAudioController() {
    ensureStyles();
    createWidgetDOM();

    const audio = document.getElementById('qld-bg-audio');
    const widget = document.getElementById('qld-bgm-widget');
    const toggleBtn = document.getElementById('bgmToggleBtn');
    const iconImg = document.getElementById('bgmIconImg');
    const statusText = document.getElementById('bgmStatusText');
    const volSlider = document.getElementById('bgmVolSlider');
    const tooltip = document.getElementById('bgmTooltip');
    const info = document.getElementById('bgmInfo');

    if (!audio || !toggleBtn || !iconImg) return;

    // Load saved volume or default to 45%
    const savedVol = localStorage.getItem('qld_bgm_volume');
    const initialVolume = savedVol !== null ? parseFloat(savedVol) : 0.45;
    audio.volume = Math.max(0, Math.min(1, initialVolume));
    if (volSlider) {
      volSlider.value = Math.round(audio.volume * 100);
    }

    // Check user preference
    const savedState = localStorage.getItem('qld_bgm_state'); // 'playing' | 'paused'
    let isExplicitlyPaused = savedState === 'paused';

    // Update UI elements based on state
    function updateUI(isPlaying) {
      if (isPlaying) {
        widget.classList.add('is-playing');
        iconImg.src = ICON_ON;
        iconImg.alt = 'Music Playing';
        if (statusText) statusText.textContent = 'NOW PLAYING';
        toggleBtn.setAttribute('title', 'Pause Entrance Music');
        toggleBtn.setAttribute('aria-label', 'Pause Entrance Music');
        if (tooltip) tooltip.classList.remove('is-visible');
      } else {
        widget.classList.remove('is-playing');
        iconImg.src = ICON_OFF;
        iconImg.alt = 'Music Paused';
        if (statusText) statusText.textContent = 'MUSIC PAUSED';
        toggleBtn.setAttribute('title', 'Play Entrance Music');
        toggleBtn.setAttribute('aria-label', 'Play Entrance Music');
      }
    }

    // Play with graceful fade
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
            console.log('Autoplay deferred until user interaction:', err);
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

    // Show entrance tooltip prompt if autoplay was blocked
    function showEntrancePrompt() {
      if (isExplicitlyPaused || !audio.paused) return;
      if (tooltip) {
        tooltip.classList.add('is-visible');
        setTimeout(() => {
          if (tooltip) tooltip.classList.remove('is-visible');
        }, 5000);
      }
    }

    // Handle First User Interaction to unlock autoplay if blocked
    function setupFirstInteractionUnlock() {
      const unlockEvents = ['pointerdown', 'click', 'keydown', 'touchstart', 'scroll'];
      const onFirstInteraction = () => {
        unlockEvents.forEach((evt) => window.removeEventListener(evt, onFirstInteraction));
        // If user hasn't explicitly paused it, play now!
        if (!isExplicitlyPaused && audio.paused) {
          audio.play()
            .then(() => {
              updateUI(true);
            })
            .catch(() => {
              // Ignore any residual policy errors
            });
        }
      };

      unlockEvents.forEach((evt) => {
        window.addEventListener(evt, onFirstInteraction, { once: true, passive: true });
      });
    }

    // Event Listeners
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayback();
    });

    if (info) {
      info.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlayback();
      });
    }

    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        audio.volume = val;
        localStorage.setItem('qld_bgm_volume', val.toString());

        if (val === 0) {
          iconImg.src = ICON_OFF;
        } else if (!audio.paused) {
          iconImg.src = ICON_ON;
        }
      });
    }

    // Autoplay attempt on entrance
    if (!isExplicitlyPaused) {
      audio.play()
        .then(() => {
          updateUI(true);
        })
        .catch(() => {
          // Autoplay policy prevented immediate playback: wait for first interaction
          updateUI(false);
          setupFirstInteractionUnlock();
          showEntrancePrompt();
        });
    } else {
      updateUI(false);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudioController);
  } else {
    initAudioController();
  }
})();
