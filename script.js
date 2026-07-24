/* ================================================================
   Ha360solutions – JavaScript
   Modules: Preloader · Nav · Canvas BG · Counters · Accordion ·
            Form · Scroll Reveal · Back-to-top
   ================================================================ */
;(function () {
  'use strict';

  /* -------- CACHE DOM -------- */
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const preloader   = $('#preloader');
  const navbar      = $('#navbar');
  const menuToggle  = $('#menuToggle');
  const navMenu     = $('#navMenu');
  const navLinks    = $$('.nav-link');
  const topBtn      = $('#topBtn');
  const heroCanvas  = $('#heroCanvas');
  const contactForm = $('#contactForm');
  const formMsg     = $('#formMsg');

  /* ================================================================
     1. PRELOADER
     ================================================================ */
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hide'), 400);
  });

  /* ================================================================
     2. MOBILE NAVIGATION
     ================================================================ */
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open);
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // close on link click
  navLinks.forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
  });

  function closeMenu() {
    menuToggle.classList.remove('open');
    navMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  /* ================================================================
     3. SCROLL: Navbar + Active Link + Back-to-top
     ================================================================ */
  const sections = $$('section[id]');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  function onScroll() {
    const y = window.scrollY;

    /* navbar bg */
    navbar.classList.toggle('scrolled', y > 60);

    /* back-to-top */
    topBtn.classList.toggle('show', y > 500);

    /* active link */
    let current = '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.dataset.nav === current);
    });

    ticking = false;
  }
  onScroll();

  /* back-to-top click */
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ================================================================
     4. HERO CANVAS — particle network
     ================================================================ */
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let W, H, particles = [], mouse = { x: -999, y: -999 };
    const PARTICLE_COUNT = () => (window.innerWidth < 768 ? 35 : 70);
    const MAX_DIST = 130;

    function resizeCanvas() {
      W = heroCanvas.width = heroCanvas.parentElement.clientWidth;
      H = heroCanvas.height = heroCanvas.parentElement.clientHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - .5) * .35;
        this.vy = (Math.random() - .5) * .35;
        this.r = 1.2 + Math.random() * 1.5;
        this.alpha = .15 + Math.random() * .45;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,215,0,${this.alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = PARTICLE_COUNT();
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,215,0,${.08 * (1 - dist / MAX_DIST)})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
        /* mouse attract */
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 160) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255,215,0,${.15 * (1 - md / 160)})`;
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animate);
    }

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
    heroCanvas.parentElement.addEventListener('mousemove', e => {
      const rect = heroCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroCanvas.parentElement.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
  }

  /* ================================================================
     5. ANIMATED COUNTERS
     ================================================================ */
  let counted = false;
  const counterEls = $$('[data-count]');

  function runCounters() {
    if (counted) return;
    counted = true;
    counterEls.forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dec = el.hasAttribute('data-decimal');
      const dur = 2200;
      const start = performance.now();

      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const val = ease * target;
        el.textContent = (dec ? val.toFixed(1) : Math.floor(val)) + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = (dec ? target.toFixed(1) : target) + suffix;
      })(start);
    });
  }

  const heroSec = $('#hero');
  if (heroSec) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) runCounters(); }, { threshold: .35 }).observe(heroSec);
  }

  /* ================================================================
     6. SCROLL REVEAL
     ================================================================ */
  const revealItems = $$('.reveal-item');
  revealItems.forEach((el, i) => {
    // stagger within their parent group
    const parent = el.closest('.reveal-group');
    if (parent) {
      const siblings = $$('.reveal-item', parent);
      const idx = siblings.indexOf(el);
      el.style.transitionDelay = `${idx * .09}s`;
    }
  });

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach(el => revealObs.observe(el));

  /* ================================================================
     7. ACCORDION (Privacy Policy)
     ================================================================ */
  $$('.acc-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');

      // close all
      $$('.acc-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.acc-trigger').setAttribute('aria-expanded', 'false');
        const panel = i.querySelector('.acc-panel');
        panel.hidden = true;
      });

      // open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        item.querySelector('.acc-panel').hidden = false;
      }
    });
  });

  /* ================================================================
     8. CONTACT FORM
     ================================================================ */
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#fname').value.trim();
      const email = $('#femail').value.trim();
      const msg = $('#fmessage').value.trim();

      hide(formMsg);
      if (!name) return showMsg('Please enter your name.', 'err');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return showMsg('Please enter a valid email address.', 'err');
      if (!msg) return showMsg('Please enter your message.', 'err');

      const btn = $('#formSubmit');
      btn.disabled = true;
      btn.innerHTML = '<span>Sending…</span>';

      setTimeout(() => {
        showMsg('Thank you! Your message has been sent. We will get back to you soon.', 'ok');
        contactForm.reset();
        btn.disabled = false;
        btn.innerHTML = 'Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>';
      }, 1400);
    });
  }

  function showMsg(text, type) {
    formMsg.textContent = text;
    formMsg.className = `form-msg ${type}`;
    formMsg.style.display = 'block';
    if (type === 'ok') setTimeout(() => hide(formMsg), 6000);
  }
  function hide(el) { el.style.display = 'none'; el.className = 'form-msg'; }

  /* ================================================================
     9. SMOOTH ANCHOR SCROLL
     ================================================================ */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

})();
