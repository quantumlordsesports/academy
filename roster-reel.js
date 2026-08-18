/**
 * QuantumLords Esports — Auto-Sequencing Roster Reel (JS)
 * Features:
 * - 3.5s auto-advance cadence with synchronized progress bars
 * - High-velocity Cyber Whip-Pan slide transitions
 * - Interactive thumbnail navigation & telemetry updates
 * - Pause on hover / touch & seamless auto-resume
 * - Full accessibility with keyboard & swipe gestures
 */

(function () {
  'use strict';

  function initRosterReel() {
    const wrapper = document.querySelector('.roster-reel-wrapper');
    if (!wrapper) return;

    const slides = wrapper.querySelectorAll('.reel-slide');
    const segments = wrapper.querySelectorAll('.reel-prog-seg');
    const thumbs = wrapper.querySelectorAll('.reel-thumb-card');
    const prevBtn = wrapper.querySelector('#reelPrevBtn');
    const nextBtn = wrapper.querySelector('#reelNextBtn');
    const playPauseBtn = wrapper.querySelector('#reelPlayPauseBtn');
    const counterText = wrapper.querySelector('#reelCounterText');

    if (!slides.length) return;

    const TOTAL_SLIDES = slides.length;
    const CADENCE_MS = 3500;
    let currentIndex = 0;
    let timerId = null;
    let isPaused = false;
    let isTransitioning = false;

    // Format index helper (e.g. 01 / 04)
    function updateCounter(index) {
      if (!counterText) return;
      const cur = String(index + 1).padStart(2, '0');
      const tot = String(TOTAL_SLIDES).padStart(2, '0');
      counterText.textContent = `${cur} / ${tot}`;
    }

    // Update Progress Segment Bars
    function updateProgressBars(index) {
      segments.forEach((seg, i) => {
        seg.classList.remove('active', 'completed');
        const fill = seg.querySelector('.reel-prog-fill');
        if (fill) {
          fill.style.animation = 'none';
          void fill.offsetHeight; // trigger reflow
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

    // Whip-Pan Slide Transition
    function goToSlide(newIndex, direction = 'next') {
      if (newIndex === currentIndex || isTransitioning) return;
      isTransitioning = true;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[newIndex];

      // Remove previous transition helper classes
      slides.forEach((s) => {
        s.classList.remove('is-exiting-left', 'is-exiting-right');
      });

      // Set exit animation on current slide
      if (direction === 'next') {
        currentSlide.classList.remove('is-active');
        currentSlide.classList.add('is-exiting-left');
      } else {
        currentSlide.classList.remove('is-active');
        currentSlide.classList.add('is-exiting-right');
      }

      // Prepare and activate next slide
      nextSlide.classList.remove('is-exiting-left', 'is-exiting-right');
      nextSlide.classList.add('is-active');

      currentIndex = newIndex;
      updateCounter(currentIndex);
      updateProgressBars(currentIndex);
      updateThumbnails(currentIndex);

      setTimeout(() => {
        slides.forEach((s, idx) => {
          if (idx !== currentIndex) {
            s.classList.remove('is-active', 'is-exiting-left', 'is-exiting-right');
          }
        });
        isTransitioning = false;
      }, 650);

      resetTimer();
    }

    function nextSlide() {
      const nextIdx = (currentIndex + 1) % TOTAL_SLIDES;
      goToSlide(nextIdx, 'next');
    }

    function prevSlide() {
      const prevIdx = (currentIndex - 1 + TOTAL_SLIDES) % TOTAL_SLIDES;
      goToSlide(prevIdx, 'prev');
    }

    // Timer Lifecycle
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
    if (nextBtn) nextBtn.addEventListener('click', () => nextSlide());
    if (prevBtn) prevBtn.addEventListener('click', () => prevSlide());
    if (playPauseBtn) playPauseBtn.addEventListener('click', () => togglePause());

    // Thumbnail Clicks
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        const dir = i > currentIndex ? 'next' : 'prev';
        goToSlide(i, dir);
      });
    });

    // Progress Bar Segment Clicks
    segments.forEach((seg, i) => {
      seg.addEventListener('click', () => {
        const dir = i > currentIndex ? 'next' : 'prev';
        goToSlide(i, dir);
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
      if (Math.abs(diff) > 45) {
        if (diff < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    // Keyboard Arrow Navigation
    window.addEventListener('keydown', (e) => {
      // Only react if roster section is in viewport
      const rect = wrapper.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    });

    // Initial state setup
    updateCounter(0);
    updateProgressBars(0);
    updateThumbnails(0);
    startTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRosterReel);
  } else {
    initRosterReel();
  }
})();
