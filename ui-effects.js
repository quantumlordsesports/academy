// UI effects: tilt, skeleton loader, and particle seeding
(function(){
  function initTilt(selector = '.tilt-card', options = {}) {
    const maxTilt = options.maxTilt || 14;
    const scale = options.scale || 1.03;
    const speed = options.speed || 300;
    document.querySelectorAll(selector).forEach((card)=>{
      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform';
      let rectFn = () => card.getBoundingClientRect();
      card.addEventListener('mousemove', (e)=>{
        const r = rectFn();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const tiltX = (py - 0.5) * (maxTilt * -1);
        const tiltY = (px - 0.5) * (maxTilt);
        card.style.transition = `transform ${speed}ms cubic-bezier(.2,.9,.2,1)`;
        card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
      });
      card.addEventListener('mouseleave', ()=>{
        card.style.transition = `transform ${speed}ms cubic-bezier(.2,.9,.2,1)`;
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
    });
  }

  function initImageSkeleton() {
    document.querySelectorAll('.skeleton-wrap').forEach((wrap)=>{
      const img = wrap.querySelector('.lazy-img');
      const skeleton = wrap.querySelector('.skeleton-box');
      if (!img) return;
      const loadSrc = ()=>{
        if (!img.dataset.src) return;
        img.src = img.dataset.src;
        img.onload = ()=>{ img.classList.add('loaded'); if (skeleton) skeleton.remove(); };
        img.onerror = ()=>{
          if (img.dataset.src && !img.dataset.retried) {
            img.dataset.retried = 'true';
            img.src = 'folder/' + img.dataset.src.split('/').pop();
          } else if (skeleton) {
            skeleton.style.background = 'linear-gradient(90deg,#111 0,#222 50%,#111 100%)';
          }
        };
      };
      if ('loading' in HTMLImageElement.prototype) {
        img.loading = 'lazy'; loadSrc();
      } else {
        if (window.requestIdleCallback) requestIdleCallback(loadSrc); else setTimeout(loadSrc,150);
      }
    });
  }

  function seedHeroParticles(count = 6) {
    const layer = document.querySelector('.hero-particles');
    if (!layer) return;
    for (let i=0;i<count;i++){
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = `${Math.random()*100}%`;
      s.style.top = `${Math.random()*100}%`;
      s.style.animationDuration = `${8 + Math.random()*12}s`;
      s.style.opacity = (0.06 + Math.random()*0.12).toString();
      s.style.background = `rgba(${200 + Math.random()*55}, ${160 + Math.random()*80}, ${70 + Math.random()*80}, ${0.6 + Math.random()*0.3})`;
      layer.appendChild(s);
    }
  }

  // Export to global for manual init if needed
  window.UIEffects = { initTilt, initImageSkeleton, seedHeroParticles };
  document.addEventListener('DOMContentLoaded', ()=>{
    initTilt('.tilt-card');
    initImageSkeleton();
    seedHeroParticles(8);
    // initialize announcement marquee
    initAnnouncementTicker();
  });
})();

// Announcement ticker initializer (Pro Max Clean)
function initAnnouncementTicker() {
  const banners = document.querySelectorAll('.announcement-banner');
  banners.forEach((banner) => {
    banner.style.opacity = '1';
  });
}
