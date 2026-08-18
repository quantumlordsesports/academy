/**
 * QuantumLords Esports — Auto-Sequencing Roster Reel (JS)
 * Features:
 * - Silky-smooth continuous horizontal track translation (translateX)
 * - 3.5s auto-advance cadence with synchronized progress segments
 * - Enlarged interactive thumbnails & telemetry synchronization
 * - Touch swipe & keyboard support
 */

(function () {
  'use strict';

  function initRosterReel() {
    const wrapper = document.querySelector('.roster-reel-wrapper');
    if (!wrapper) return;

    const track = wrapper.querySelector('#reelTrack') || wrapper.querySelector('.reel-track');
    const slides = wrapper.querySelectorAll('.reel-slide');
    const segments = wrapper.querySelectorAll('.reel-prog-seg');
    const thumbs = wrapper.querySelectorAll('.reel-thumb-card');
    const prevBtns = wrapper.querySelectorAll('#reelPrevBtn, #reelStagePrevBtn, .reel-side-nav-btn.prev-btn');
    const nextBtns = wrapper.querySelectorAll('#reelNextBtn, #reelStageNextBtn, .reel-side-nav-btn.next-btn');
    const playPauseBtn = wrapper.querySelector('#reelPlayPauseBtn');
    const counterText = wrapper.querySelector('#reelCounterText');

    if (!slides.length || !track) return;

    const TOTAL_SLIDES = slides.length;
    const CADENCE_MS = 3500;
    let currentIndex = 0;
    let timerId = null;
    let isPaused = false;

    // Update Counter (e.g. 01 / 04)
    function updateCounter(index) {
      if (!counterText) return;
      const cur = String(index + 1).padStart(2, '0');
      const tot = String(TOTAL_SLIDES).padStart(2, '0');
      counterText.textContent = `${cur} / ${tot}`;
    }

    // Update 4 Progress Segment Bars
    function updateProgressBars(index) {
      segments.forEach((seg, i) => {
        seg.classList.remove('active', 'completed');
        const fill = seg.querySelector('.reel-prog-fill');
        if (fill) {
          fill.style.animation = 'none';
          void fill.offsetHeight; // force reflow
        }

        if (i < index) {
          seg.classList.add('completed');
        } else if (i === index) {
          seg.classList.add('active');
          if (fill) {
            fill.style.animation = `fillProgress ${CADENCE_MS}ms linear forwards`;
          }
        }
      });
    }

    // Update Thumbnail Active States
    function updateThumbnails(index) {
      thumbs.forEach((thumb, i) => {
        if (i === index) {
          thumb.classList.add('is-active');
        } else {
          thumb.classList.remove('is-active');
        }
      });
    }

    // Translate Track Smoothly to Target Slide
    function goToSlide(newIndex) {
      if (newIndex < 0) newIndex = TOTAL_SLIDES - 1;
      if (newIndex >= TOTAL_SLIDES) newIndex = 0;

      currentIndex = newIndex;

      // Translate the entire flex track horizontally
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update slide active classes
      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.add('is-active');
        } else {
          slide.classList.remove('is-active');
        }
      });

      updateCounter(currentIndex);
      updateProgressBars(currentIndex);
      updateThumbnails(currentIndex);

      resetTimer();
    }

    function nextSlide() {
      goToSlide((currentIndex + 1) % TOTAL_SLIDES);
    }

    function prevSlide() {
      goToSlide((currentIndex - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
    }

    // Timer controls
    function startTimer() {
      stopTimer();
      if (isPaused) return;
      timerId = setTimeout(() => {
        nextSlide();
      }, CADENCE_MS);
    }

    function stopTimer() {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    }

    function resetTimer() {
      stopTimer();
      if (!isPaused) {
        startTimer();
      }
    }

    function togglePause() {
      isPaused = !isPaused;
      wrapper.classList.toggle('is-paused', isPaused);
      if (playPauseBtn) {
        playPauseBtn.innerHTML = isPaused ? '▶' : '❚❚';
        playPauseBtn.setAttribute('title', isPaused ? 'Resume Auto-Reel' : 'Pause Auto-Reel');
      }
      if (isPaused) {
        stopTimer();
      } else {
        startTimer();
      }
    }

    // Event Bindings
    nextBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
      });
    });

    prevBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
      });
    });

    if (playPauseBtn) playPauseBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });

    // Thumbnail Clicks
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(i);
      });
    });

    // Progress Bar Segment Clicks
    segments.forEach((seg, i) => {
      seg.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(i);
      });
    });

    // Hover to Pause / Leave to Resume
    wrapper.addEventListener('mouseenter', () => {
      if (!isPaused) {
        wrapper.classList.add('is-paused');
        stopTimer();
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      if (!isPaused) {
        wrapper.classList.remove('is-paused');
        startTimer();
      }
    });

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    // Keyboard Arrow Navigation
    window.addEventListener('keydown', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    });

    // Initialize first slide
    goToSlide(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRosterReel);
  } else {
    initRosterReel();
  }
})();
