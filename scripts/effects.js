/* ==========================================================================
   ARUVI COLLECTIONS - EFFECTS & ANIMATION ENGINE
   Implementation of:
   1. Hover Effects Engine
   2. 3D Card Tilt & Specular Glare
   3. Loading Animations & Preloader
   4. Entrance Animations (IntersectionObserver)
   5. Microinteractions (Heart burst, Fly-to-cart, Counter bounces)
   6. Background Animations (Canvas Golden Zari & Ambient Particles)
   7. Mouse Animations (Magnetic Luxury Cursor & Spotlight)
   ========================================================================== */

(function () {
  'use strict';

  // State object
  const EffectsEngine = {
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 },
    isTouch: window.matchMedia('(pointer: coarse)').matches,
    canvas: null,
    ctx: null,
    particles: [],
    cursorDot: null,
    cursorAura: null,
  };

  /* ==========================================================================
     3. LOADING ANIMATION (Preloader)
     ========================================================================== */
  function initPreloader() {
    const preloader = document.getElementById('preloader-screen');
    const progressBar = document.getElementById('preloader-progress-bar');
    const counterText = document.getElementById('preloader-counter');

    if (!preloader) return;

    let progress = 0;
    const interval = setInterval(() => {
      // Smooth organic increment
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        if (progressBar) progressBar.style.width = '100%';
        if (counterText) counterText.textContent = '100%';

        setTimeout(() => {
          preloader.classList.add('hidden');
          // Trigger initial hero entrance
          revealHeroEntrance();
        }, 400);
      } else {
        if (progressBar) progressBar.style.width = progress + '%';
        if (counterText) counterText.textContent = progress + '%';
      }
    }, 45);
  }

  function revealHeroEntrance() {
    const heroElements = document.querySelectorAll('.hero-section [data-animate]');
    heroElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('is-revealed');
      }, index * 120);
    });
  }

  /* ==========================================================================
     4. ENTRANCE ANIMATIONS (Scroll Observer)
     ========================================================================== */
  function initScrollEntrance() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              const delay = el.getAttribute('data-delay') || 0;
              setTimeout(() => {
                el.classList.add('is-revealed');
              }, parseInt(delay, 10) || 0);
              obs.unobserve(el);
            }
          });
        },
        {
          root: null,
          rootMargin: '100px 0px 50px 0px',
          threshold: 0.02,
        }
      );

      animatedElements.forEach((el) => {
        // Don't auto-observe hero elements if handled by preloader
        if (!el.closest('.hero-section')) {
          observer.observe(el);
        }
      });
    } else {
      // Fallback for older browsers
      animatedElements.forEach((el) => el.classList.add('is-revealed'));
    }

    // Header scroll background morph
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }, { passive: true });
    }
  }

  /* ==========================================================================
     7. MOUSE ANIMATIONS (Custom Luxury Cursor & Magnetic Snap)
     ========================================================================== */
  function initLuxuryCursor() {
    // Mouse animation disabled
    return;
  }

  /* ==========================================================================
     2. 3D EFFECTS (Interactive 3D Card Tilt with Specular Glare)
     ========================================================================== */
  function init3DCardTilt() {
    if (EffectsEngine.isTouch) return;

    // Attach to product cards, promo cards, and hero frame
    const tiltCards = document.querySelectorAll('.card-3d, .product-card, .promo-banner-card, .hero-image-card');

    tiltCards.forEach((card) => {
      // Ensure glare element exists
      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        // Max 3D tilt angle
        const maxAngle = card.classList.contains('hero-image-card') ? 7 : 12;
        const rotateX = -deltaY * maxAngle;
        const rotateY = deltaX * maxAngle;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;

        // Specular Glare position
        const glarePercentX = (x / rect.width) * 100;
        const glarePercentY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glarePercentX}% ${glarePercentY}%, rgba(255,255,255,0.35) 0%, rgba(200,157,56,0.1) 40%, transparent 75%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    });

    // Parallax mouse move on hero section
    const heroSection = document.querySelector('.hero-section');
    const heroBadges = document.querySelectorAll('.floating-hero-card');

    if (heroSection && heroBadges.length > 0) {
      heroSection.addEventListener('mousemove', (e) => {
        const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
        const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;

        heroBadges.forEach((badge, i) => {
          const depth = (i + 1) * 15;
          badge.style.transform = `translate3d(${(-xPercent * depth).toFixed(1)}px, ${(-yPercent * depth).toFixed(1)}px, 20px)`;
        });
      });

      heroSection.addEventListener('mouseleave', () => {
        heroBadges.forEach((badge) => {
          badge.style.transform = 'translate3d(0, 0, 0)';
        });
      });
    }
  }

  /* ==========================================================================
     6. BACKGROUND ANIMATIONS (Golden Zari & Silk Particles Canvas)
     ========================================================================== */
  function initBackgroundParticles() {
    const canvas = document.getElementById('particles-bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    EffectsEngine.canvas = canvas;
    EffectsEngine.ctx = ctx;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Create Golden Zari Particle Pool
    const particleCount = window.innerWidth < 768 ? 25 : 55;
    EffectsEngine.particles = [];

    for (let i = 0; i < particleCount; i++) {
      EffectsEngine.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.8 + 1,
        speedX: (Math.random() - 0.5) * 0.45,
        speedY: -Math.random() * 0.6 - 0.15, // Floating gently upward like zari dust
        opacity: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        isGolden: Math.random() > 0.3, // 70% gold, 30% soft mint
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      EffectsEngine.particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Pulse opacity
        p.opacity += Math.sin(Date.now() * p.pulseSpeed) * 0.005;
        if (p.opacity < 0.15) p.opacity = 0.15;
        if (p.opacity > 0.75) p.opacity = 0.75;

        // Subtle mouse interaction (particles float away slightly from cursor)
        const dx = EffectsEngine.mouse.targetX - p.x;
        const dy = EffectsEngine.mouse.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.x -= (dx / dist) * 0.8;
          p.y -= (dy / dist) * 0.8;
        }

        // Wrap around edges
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        // Render Particle with radiant glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.isGolden) {
          ctx.fillStyle = `rgba(216, 172, 68, ${p.opacity})`;
          ctx.shadowColor = 'rgba(216, 172, 68, 0.4)';
          ctx.shadowBlur = p.size * 3;
        } else {
          ctx.fillStyle = `rgba(169, 205, 189, ${p.opacity * 0.8})`;
          ctx.shadowColor = 'rgba(169, 205, 189, 0.3)';
          ctx.shadowBlur = p.size * 2;
        }

        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animateParticles);
    }
    requestAnimationFrame(animateParticles);
  }

  /* ==========================================================================
     5. MICROINTERACTIONS (Heart Burst, Fly-to-Cart, Badge Bounce)
     ========================================================================== */
  
  // Heart Wishlist Burst with Golden Sparkles
  window.triggerHeartBurst = function (heartBtn) {
    heartBtn.classList.add('burst');
    setTimeout(() => heartBtn.classList.remove('burst'), 500);

    const rect = heartBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Emit 8 golden particles radiating in a circle
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'sparkle-particle';
      const angle = (i / 8) * (Math.PI * 2);
      const distance = Math.random() * 32 + 22;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
    }
  };

  // Fly to Cart Animation
  window.triggerFlyToCart = function (startElement, imageUrl) {
    const cartBtn = document.getElementById('header-cart-btn');
    if (!cartBtn) return;

    const startRect = startElement.getBoundingClientRect();
    const endRect = cartBtn.getBoundingClientRect();

    const flyer = document.createElement('img');
    flyer.src = imageUrl || '';
    flyer.className = 'flying-cart-item';
    flyer.style.left = `${startRect.left + startRect.width / 2 - 24}px`;
    flyer.style.top = `${startRect.top + startRect.height / 2 - 24}px`;

    document.body.appendChild(flyer);

    // Compute curved trajectory
    requestAnimationFrame(() => {
      flyer.style.transform = `scale(0.3) rotate(360deg)`;
      flyer.style.left = `${endRect.left + endRect.width / 2 - 12}px`;
      flyer.style.top = `${endRect.top + endRect.height / 2 - 12}px`;
      flyer.style.opacity = '0.3';
    });

    setTimeout(() => {
      flyer.remove();
      // Cart badge bounce animation
      const badge = cartBtn.querySelector('.action-badge');
      if (badge) {
        badge.classList.remove('badge-bounce');
        void badge.offsetWidth; // trigger reflow
        badge.classList.add('badge-bounce');
      }
    }, 750);
  };

  // Bounce any badge element
  window.triggerBadgeBounce = function (badgeElement) {
    if (!badgeElement) return;
    badgeElement.classList.remove('badge-bounce');
    void badgeElement.offsetWidth;
    badgeElement.classList.add('badge-bounce');
  };

  /* ==========================================================================
     INIT ENGINE ON DOM READY
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initScrollEntrance();
    initLuxuryCursor();
    init3DCardTilt();
    initBackgroundParticles();
  });

  // Re-run 3D card tilt binding when dynamic products render
  window.rebind3DCardTilt = init3DCardTilt;

})();
