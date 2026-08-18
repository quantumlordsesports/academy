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
        img.onerror = ()=>{ if (skeleton) skeleton.style.background = 'linear-gradient(90deg,#111 0,#222 50%,#111 100%)'; };
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

// Announcement ticker initializer
function initAnnouncementTicker() {
  const marqueeContainers = document.querySelectorAll('.announcement-marquee');
  marqueeContainers.forEach((container)=>{
    const track = container.querySelector('.marquee-track');
    if (!track) return;
    // duplicate content to allow seamless scroll
    const clone = track.cloneNode(true);
    container.appendChild(clone);
    // compute width to set duration: longer content -> longer duration
    requestIdleCallback ? requestIdleCallback(() => setMarqueeDuration(container)) : setTimeout(()=>setMarqueeDuration(container),50);
    // pause on hover (CSS also handles this)
    container.addEventListener('mouseenter', ()=> { track.style.animationPlayState = 'paused'; clone.style.animationPlayState = 'paused'; });
    container.addEventListener('mouseleave', ()=> { track.style.animationPlayState = ''; clone.style.animationPlayState = ''; });
  });

  function setMarqueeDuration(container){
    const track = container.querySelector('.marquee-track');
    const clone = container.querySelectorAll('.marquee-track')[1];
    if (!track || !clone) return;
    const totalWidth = track.getBoundingClientRect().width + clone.getBoundingClientRect().width;
    // base speed: 80 pixels per second
    const duration = Math.max(8, Math.round(totalWidth / 80));
    track.style.setProperty('--marquee-duration', duration + 's');
    clone.style.setProperty('--marquee-duration', duration + 's');
  }
}
