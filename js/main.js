(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = !reduceMotion;

  /* ================= INTRO VIDEO (reference behaviour: video -> Skip Intro -> fade into hero) ================= */
  const introScreen = document.getElementById('intro-screen');
  const introVideo = document.getElementById('intro-video');
  const skipIntroBtn = document.getElementById('skip-intro');
  const site = document.getElementById('site');
  document.body.style.overflow = 'hidden';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  setTimeout(() => skipIntroBtn.classList.add('show'), 800);

  /* golden light: the lamp-lit film dissolves into warm gold, which then lifts to reveal the hero */
  const wash = document.getElementById('gold-wash');
  let washAt = 0, ending = false;
  function washIn(d) {
    if (washAt || !animate) return;
    washAt = performance.now();
    gsap.to(wash, { opacity: 1, duration: d, ease: 'power1.in' });
  }
  introVideo.addEventListener('timeupdate', () => {            /* begin the glow just before the last frame */
    if (introVideo.duration && introVideo.duration - introVideo.currentTime < 0.85) washIn(0.8);
  });
  function endIntro() {
    if (ending) return; ending = true;
    startMusic();
    washIn(0.75);
    const wait = animate ? Math.max(0, 0.8 - (performance.now() - washAt) / 1000) : 0;
    gsap.delayedCall(wait, () => {
      introScreen.remove();
      gsap.set(site, { opacity: 1 });
      document.body.style.overflow = '';
      initScrollAnimations();
      if (animate) gsap.to(wash, { opacity: 0, duration: 2, delay: 0.1, ease: 'power2.out', onComplete: () => wash.remove() });
      else wash.remove();
    });
  }
  introVideo.addEventListener('ended', endIntro);
  introVideo.addEventListener('error', endIntro);
  const introSrc = introVideo.querySelector('source');
  if (introSrc) introSrc.addEventListener('error', endIntro);
  skipIntroBtn.addEventListener('click', endIntro);
  /* the film does not start by itself: the poster (first frame) waits until the visitor taps */
  const playBtn = document.getElementById('intro-play');
  let started = false;
  function startIntro() {
    if (started) return; started = true;
    playBtn.classList.add('hide');
    startMusic();
    introVideo.play().catch(endIntro);
    setTimeout(() => { if (!introScreen.classList.contains('fade-out') && introVideo.currentTime < 0.05) endIntro(); }, 4500); /* never started */
    setTimeout(endIntro, 14000);                                                                                              /* hard safety */
  }
  playBtn.addEventListener('click', startIntro);

/* ================= LENIS SMOOTH SCROLL ================= */
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.15, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    function backToTop() { lenis.scrollTo(0, { duration: 1.6 }); }

    /* ================= CURSOR GLOW + PARALLAX (mouse devices only) ================= */
    const glow = document.getElementById('cursor-glow');
    const parallaxLayers = document.querySelectorAll('.bg-layer');
    const hasFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (hasFinePointer) {
      let rafPending = false;
      let mouseX = 0, mouseY = 0;
      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          gsap.to(glow, { x: mouseX, y: mouseY, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
          const dx = (mouseX / window.innerWidth - 0.5) * 20;
          const dy = (mouseY / window.innerHeight - 0.5) * 20;
          parallaxLayers.forEach(l => gsap.to(l, { x: dx, y: dy, duration: 1.4, ease: 'power2.out', overwrite: 'auto' }));
        });
      }, { passive: true });
    }

    /* ================= PETALS + PARTICLES ================= */
    const isMobile = window.innerWidth < 640 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const petalField = document.getElementById('petal-field');
    const petalChars = ['🌸', '🌺', '❀', '✿'];
    const petalCount = isMobile ? 3 : 6;
    for (let i = 0; i < petalCount; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];
      p.style.left = Math.random() * 100 + 'vw';
      p.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
      p.style.animationDuration = (20 + Math.random() * 14) + 's';
      p.style.animationDelay = (Math.random() * 20) + 's';
      p.style.fontSize = (10 + Math.random() * 7) + 'px';
      petalField.appendChild(p);
    }
    const particleField = document.getElementById('particles');
    const sparkCount = isMobile ? 5 : 10;
    for (let i = 0; i < sparkCount; i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = Math.random() * 100 + 'vw';
      s.style.top = Math.random() * 100 + 'vh';
      s.style.animationDelay = (Math.random() * 4) + 's';
      particleField.appendChild(s);
    }
    /* lanterns in footer */
    const lanternField = document.getElementById('lantern-field');
    const lanternIcons = ['🏮', '✨'];
    const lanternCount = isMobile ? 5 : 8;
    for (let i = 0; i < lanternCount; i++) {
      const l = document.createElement('div');
      l.className = 'lantern'; l.textContent = lanternIcons[i % 2];
      l.style.left = (8 + Math.random() * 84) + '%';
      l.style.top = (10 + Math.random() * 70) + '%';
      l.style.animationDelay = (Math.random() * 6) + 's';
      l.style.animationDuration = (7 + Math.random() * 4) + 's';
      lanternField.appendChild(l);
    }

    /* ================= HERO NAME REVEAL ================= */
    function splitHeroNames() {
      document.querySelectorAll('#hero-names .name-part').forEach(part => {
        const text = part.textContent;
        part.innerHTML = text.split('').map(ch => `<span class="char">${ch}</span>`).join('');
      });
    }
    splitHeroNames();

    /* ================= SCROLL ANIMATIONS (init after intro) ================= */
    function initScrollAnimations() {
      gsap.to('#hero .char', {
        opacity: 1, y: 0, rotate: 0, duration: 1, ease: 'back.out(1.7)',
        stagger: 0.045, delay: 0.2
      });
      gsap.from('.monogram, .hero-sub', {
        opacity: 0, y: 20, duration: 1, stagger: 0.15, delay: 0.1
      });

      gsap.utils.toArray('.section').forEach((sec) => {
        if (sec.id === 'hero') return;
        gsap.from(sec.querySelectorAll('.eyebrow, h2, .divider, .couple-copy, .section-sub'), {
          opacity: 0, y: 60, duration: 1, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 75%' }
        });
      });

      /* event illustrations float up gently; details fade in after them */
      gsap.utils.toArray('.event').forEach((ev) => {
        const art = $('.event-art', ev), body = $('.event-body', ev);
        gsap.from(art, { opacity: 0, y: 30, scale: 0.97, duration: 0.9, ease: 'power3.out', clearProps: 'transform',
          scrollTrigger: { trigger: ev, start: 'top 82%', once: true } });
        gsap.from(body, { opacity: 0, y: 24, duration: 0.8, delay: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: ev, start: 'top 78%', once: true } });
      });

      /* groom & bride portraits */
      gsap.from('.portrait', { opacity: 0, y: 46, duration: 1, stagger: 0.25, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: { trigger: '.portrait-row', start: 'top 82%', once: true } });
      gsap.from('.portrait-amp', { opacity: 0, scale: 0.6, duration: 0.9, delay: 0.2, ease: 'power2.out',
        scrollTrigger: { trigger: '.portrait-row', start: 'top 80%', once: true } });

      initStory();
      initDecorParallax();

      gsap.from('.venue-row', {
        opacity: 0, y: 30, duration: 0.9, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: '.location-card', start: 'top 82%' }
      });

      gsap.to('#hero .bg-content, #hero .scroll-cue', { opacity: 0.15, filter: 'blur(4px)', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });

      buildJourney();
      ScrollTrigger.refresh();
    }

    /* ================= GALLERY — "Our Moments": staggered reveal + touch feedback ================= */
    function initGalleryWall() {
      const grid = document.getElementById('gallery-grid');
      if (!grid) return;
      const tiles = Array.from(grid.querySelectorAll('.g-item'));
      if (!tiles.length) return;

      /* stagger by position within the visible row, not by overall index */
      grid.querySelectorAll('.g-row').forEach((row) => {
        Array.from(row.querySelectorAll('.g-item')).forEach((t, i) => t.style.setProperty('--r', i));
      });

      const reveal = (t) => t.classList.add('is-in');
      if (!animate || !('IntersectionObserver' in window)) { tiles.forEach(reveal); }
      else {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            reveal(en.target);
            io.unobserve(en.target);
            /* once settled, drop the stagger delay so hover stays instant */
            setTimeout(() => { en.target.style.transitionDelay = '0s'; }, 1800);
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        tiles.forEach((t) => io.observe(t));
      }

      tiles.forEach((t) => {
        t.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'mouse') return;
          t.classList.add('is-touched');
          setTimeout(() => t.classList.remove('is-touched'), 500);
        }, { passive: true });
      });
    }
    initGalleryWall();

    /* ================= GOLDEN DUST (hero, date reveal, closing) ================= */
    function makeDust(host, n) {
      if (!host || !animate) return;
      const box = document.createElement('div');
      box.className = 'gold-dust'; box.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < n; i++) {
        const d = document.createElement('span'), s = rnd(2, 4.6);
        d.className = 'dust';
        d.style.cssText = `left:${rnd(2, 98).toFixed(1)}%;width:${s.toFixed(1)}px;height:${s.toFixed(1)}px;--dx:${rnd(-40, 40).toFixed(0)}px;animation-duration:${rnd(16, 28).toFixed(1)}s;animation-delay:-${rnd(0, 26).toFixed(1)}s`;
        box.appendChild(d);
      }
      host.insertBefore(box, host.querySelector('.bg-content'));
      if ('IntersectionObserver' in window) new IntersectionObserver((es) => box.classList.toggle('is-paused', !es[0].isIntersecting)).observe(host);
    }
    makeDust(document.getElementById('hero'), isMobile ? 5 : 9);

    /* ================= GOLDEN INVITATION UNFOLD (date reveal) ================= */
    (function initInvite() {
      const stage = document.getElementById('invite-stage');
      if (!stage) return;
      const card = document.getElementById('invite-card'), btn = document.getElementById('invite-open'), inner = document.getElementById('invite-date');
      const colours = ['#ffffff', '#f8dcdf', '#f3c9cf', '#f1d68f', '#fbe9b7'];
      let opened = false;

      function petals() {
        const n = isMobile ? 9 : 16;
        for (let i = 0; i < n; i++) {
          const p = document.createElement('span');
          p.className = 'inv-petal'; p.style.setProperty('--c', colours[i % colours.length]);
          stage.appendChild(p);
          const dur = rnd(3.6, 5.6), delay = 0.55 + rnd(0, 1.1), dx = rnd(-170, 170);
          gsap.fromTo(p, { x: dx * 0.25, y: -10, rotation: rnd(0, 360), scale: rnd(0.7, 1.15) },
            { x: dx, y: rnd(200, 380), rotation: '+=' + rnd(160, 420), duration: dur, delay, ease: 'sine.inOut' });
          gsap.timeline({ delay, onComplete: () => p.remove() })
            .to(p, { opacity: 0.95, duration: 0.5 })
            .to(p, { opacity: 0, duration: 1.2 }, dur - 1.2);
        }
      }
      function openInvite() {
        if (opened) return; opened = true;
        card.classList.add('is-open'); stage.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (animate) {
          gsap.from(inner.querySelectorAll('.cover-orn, .inv-kicker, .rdate, .inv-line, .rday'),
            { opacity: 0, y: 14, duration: 0.9, ease: 'power2.out', stagger: 0.12, delay: 0.75 });
          petals();
        }
        setTimeout(() => {      /* hand focus to the revealed date so keyboard & screen-reader users land on it */
          try { inner.focus({ preventScroll: true }); } catch (e) { }
          btn.tabIndex = -1; btn.setAttribute('aria-hidden', 'true');
        }, animate ? 1700 : 120);
      }
      btn.addEventListener('click', openInvite);   /* a native <button>: Enter and Space work too */
    })();

    /* ================= LOVE STORY TIMELINE ================= */
    function initStory() {
      if (!animate) {
        const h = document.getElementById('story-head'); if (h) h.style.display = 'none';
        $$('.chapter').forEach((ch) => ch.classList.add('is-lit'));
        return;
      }
      const wrap = document.getElementById('story-wrap'), fill = document.getElementById('story-fill'), head = document.getElementById('story-head');
      if (!wrap || !fill) return;
      const lineH = () => fill.offsetHeight;
      gsap.fromTo(fill, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top 62%', end: 'bottom 58%', scrub: true, onUpdate: (self) => { head.style.transform = `translate3d(0, ${(self.progress * lineH()).toFixed(1)}px, 0)`; } }
      });
      const wide = window.innerWidth >= 768;
      $$('.chapter').forEach((ch, i) => {
        const text = $('.ch-text', ch), media = $('.ch-media', ch), dir = i % 2 === 0 ? -1 : 1;
        /* text arrives line by line: chapter label, title, quote, paragraph */
        gsap.from(text.children, { opacity: 0, x: wide ? dir * 26 : 0, y: wide ? 10 : 22, duration: 1.05, stagger: 0.14, ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: ch, start: 'top 80%', once: true } });
        gsap.from(media, { opacity: 0, x: wide ? -dir * 40 : 0, y: wide ? 20 : 28, scale: 0.97, duration: 1.25, delay: 0.25, ease: 'power3.out', clearProps: 'transform',
          scrollTrigger: { trigger: ch, start: 'top 78%', once: true } });
        ScrollTrigger.create({ trigger: ch, start: 'top 62%', onEnter: () => ch.classList.add('is-lit'), onLeaveBack: () => ch.classList.remove('is-lit') });
      });

      /* 2024: the dotted Kerala – Chennai line is drawn as the chapter comes into view */
      const route = $('.route');
      if (route) {
        const line = $('.route-line', route), dots = $$('.route-dot', route), cities = $$('.route-city', route), cap = $('.route-cap', route);
        const tl = gsap.timeline({ scrollTrigger: { trigger: route, start: 'top 82%', once: true } });
        tl.from(dots[0], { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)' })
          .fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, '-=0.1')
          .from(dots[1], { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)' }, '-=0.35')
          .from(cities, { opacity: 0, y: 6, duration: 0.7, stagger: 0.15, ease: 'power2.out' }, '-=1.4')
          .from(cap, { opacity: 0, y: 8, duration: 0.8, ease: 'power2.out' }, '-=0.5');
      }
    }
    /* lamps, garlands and florals drift very slowly against the scroll */
    function initDecorParallax() {
      if (!animate || !hasFinePointer) return;     /* phones & tablets: static decor keeps scrolling smooth */
      $$('.deco-lamp[data-depth]').forEach((el) => {
        const d = parseFloat(el.dataset.depth) || 0.3;
        gsap.fromTo(el, { y: -d * 30 }, { y: d * 30, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }

    /* ================= COUNTDOWN ================= */
    const weddingDate = new Date('2027-01-31T10:15:00+05:30').getTime();
    function updateCountdown() {
      const now = Date.now();
      const diff = Math.max(0, weddingDate - now);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
      document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
      document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
      document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* ================= LOCATION: COPY / SHARE ================= */
    const toast = document.getElementById('copy-toast');
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    }
    function copyAddress(text) {
      navigator.clipboard?.writeText(text).then(() => showToast('Address copied'))
        .catch(() => showToast('Could not copy — please select manually'));
    }
    window.copyAddress = copyAddress;

    /* ================= BACKGROUND MUSIC (same track as the Jishnu & Vibha site) ================= */
    const player = document.getElementById('player');
    const music = document.getElementById('bg-music');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    let playing = false, resumeAfterHide = false;
    function setPlaying(on) {
      playing = on;
      player.classList.toggle('playing', on);
      player.setAttribute('aria-pressed', on ? 'true' : 'false');
      player.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
      iconPlay.style.display = on ? 'none' : 'block'; iconPause.style.display = on ? 'block' : 'none';
    }
    function startMusic() {
      if (playing || !music) return;
      music.play().then(() => setPlaying(true)).catch(() => { });   /* blocked without a tap: the player button stays available */
    }
    player.addEventListener('click', () => {
      if (!playing) music.play().then(() => setPlaying(true)).catch(() => showToast('Could not play the music'));
      else { music.pause(); setPlaying(false); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && playing) { music.pause(); resumeAfterHide = true; }
      else if (!document.hidden && resumeAfterHide) { resumeAfterHide = false; music.play().catch(() => setPlaying(false)); }
    });


    /* ================= LIGHTBOX (couple photographs) — swipe, keyboard, counter ================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxCount = document.getElementById('lightbox-count');
    let lbList = [], lightboxIndex = 0, lbReturnFocus = null;
    function preloadAround() {
      [1, -1].forEach((d) => { const it = lbList[(lightboxIndex + d + lbList.length) % lbList.length]; if (it) { const p = new Image(); p.src = it.src; } });
    }
    function updateLightboxImage(dir) {
      const item = lbList[lightboxIndex];
      lightboxCount.textContent = (lightboxIndex + 1) + ' / ' + lbList.length;
      lightbox.style.setProperty('--dir', dir || 1);
      const reveal = () => { lightboxImg.classList.remove('is-swap'); };
      lightboxImg.classList.add('is-swap');
      lightboxImg.onload = reveal; lightboxImg.onerror = reveal;
      lightboxImg.alt = item.alt;
      lightboxImg.src = item.src;
      if (lightboxImg.complete) requestAnimationFrame(reveal);
      preloadAround();
    }
    function openLightbox(list, i) {
      lbList = list; lightboxIndex = i;
      lbReturnFocus = document.activeElement;
      lightbox.classList.toggle('single', list.length < 2);
      lightbox.classList.remove('dragging');
      updateLightboxImage(1);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lenis.stop();
      lightboxClose.focus();
    }
    function closeLightbox() {
      if (!lightbox.classList.contains('open')) return;
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lenis.start();
      if (lbReturnFocus && lbReturnFocus.focus) lbReturnFocus.focus();
    }
    function lightboxNext() { if (lbList.length < 2) return; lightboxIndex = (lightboxIndex + 1) % lbList.length; updateLightboxImage(1); }
    function lightboxPrev() { if (lbList.length < 2) return; lightboxIndex = (lightboxIndex - 1 + lbList.length) % lbList.length; updateLightboxImage(-1); }
    lightboxClose.addEventListener('click', closeLightbox);
    document.getElementById('lightbox-next').addEventListener('click', lightboxNext);
    document.getElementById('lightbox-prev').addEventListener('click', lightboxPrev);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightboxNext();
      if (e.key === 'ArrowLeft') lightboxPrev();
    });
    /* swipe: the photograph follows the finger; release past 50px to change, drag down to close */
    let sx = null, sy = null, axis = null;
    lightbox.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { sx = null; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; axis = null;
    }, { passive: true });
    lightbox.addEventListener('touchmove', (e) => {
      if (sx === null) return;
      const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (!axis) return;
      lightbox.classList.add('dragging');
      if (axis === 'x' && lbList.length > 1) lightboxImg.style.transform = `translateX(${(dx * 0.6).toFixed(0)}px)`;
      else if (axis === 'y' && dy > 0) { lightboxImg.style.transform = `translateY(${(dy * 0.6).toFixed(0)}px)`; lightboxImg.style.opacity = String(Math.max(0.35, 1 - dy / 420)); }
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      const a = axis; sx = sy = axis = null;
      lightbox.classList.remove('dragging');
      lightboxImg.style.transform = ''; lightboxImg.style.opacity = '';
      if (a === 'x' && Math.abs(dx) > 50) (dx < 0 ? lightboxNext : lightboxPrev)();
      else if (a === 'y' && dy > 90) closeLightbox();
    });
    lightbox.addEventListener('touchcancel', () => { sx = sy = axis = null; lightbox.classList.remove('dragging'); lightboxImg.style.transform = ''; lightboxImg.style.opacity = ''; });

    const onActivate = (el, fn) => {
      el.addEventListener('click', fn);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
    };
    /* each group opens its own set: the gallery swipes only through the gallery's photographs */
    const groups = {};
    $$('[data-lb]').forEach((el) => {
      const key = el.dataset.lb || 'story', im = $('img', el), src = im.dataset.full || im.currentSrc || im.src;
      const g = groups[key] || (groups[key] = { list: [], seen: new Map() });
      if (!g.seen.has(src)) { g.seen.set(src, g.list.length); g.list.push({ src, alt: im.alt }); }
      onActivate(el, () => openLightbox(g.list, g.seen.get(src)));
    });

    const topBtn = document.getElementById('back-to-top');
    if (topBtn) topBtn.addEventListener('click', backToTop);

    /* ================= EVENTS: ANIMATED GOLD DOTTED JOURNEY LINE (SVG + GSAP ScrollTrigger) ================= */
    const SVGNS = 'http://www.w3.org/2000/svg';
    const J = document.getElementById('event-grid');
    const jsvg = document.getElementById('journey-svg');
    let journeyTween = null, rebuildTimer;
    const rel = (el, container) => { let x = 0, y = 0, n = el; while (n && n !== container) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight, cx: x + el.offsetWidth / 2 }; };
    const mkEl = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
    const f1 = (n) => n.toFixed(1);
    /* smooth S-curve through points that all share a vertical tangent */
    const curveThrough = (pts) => {
      let d = `M${f1(pts[0].x)} ${f1(pts[0].y)}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], k = Math.max(b.y - a.y, 10) * 0.55;
        d += ` C${f1(a.x)} ${f1(a.y + k)} ${f1(b.x)} ${f1(b.y - k)} ${f1(b.x)} ${f1(b.y)}`;
      }
      return d;
    };
    /* gentle wave down a side margin: returns points between y0 and y1 at x ± amp */
    const wave = (x, y0, y1, amp, step) => {
      const pts = [{ x, y: y0 }]; let s = 1;
      for (let y = y0 + step; y < y1 - step * 0.5; y += step) { pts.push({ x: x + amp * s, y }); s = -s; }
      pts.push({ x, y: y1 }); return pts;
    };

    function buildJourney() {
      if (journeyTween) { journeyTween.scrollTrigger && journeyTween.scrollTrigger.kill(); journeyTween.kill(); journeyTween = null; }
      jsvg.innerHTML = '';
      const W = J.offsetWidth, H = J.offsetHeight;
      if (!W || !H) return;
      jsvg.setAttribute('viewBox', `0 0 ${W} ${H}`);

      const evs = $$('.event', J);
      const arts = evs.map((e) => rel($('.event-art', e), J));
      const bodies = evs.map((e) => rel($('.event-body', e), J));
      const stacked = window.innerWidth < 768;
      const parts = [];   /* each part = one SVG subpath; gaps = hidden stretches behind an illustration */
      let end;

      if (stacked) {
        /* phone: one continuous line that snakes down alternating side margins, crossing in the gaps between events */
        const xL = Math.min(24, Math.max(14, W * 0.045)), xR = W - xL, amp = Math.min(5, xL * 0.35);
        const side = (i) => (i % 2 === 0 ? xL : xR);
        let pts = [];
        evs.forEach((_, i) => {
          const x = side(i), a = arts[i], b = bodies[i];
          const y0 = i === 0 ? a.y + a.h * 0.22 : a.y - 6;
          const y1 = b.y + b.h + 4;
          const seg = wave(x, y0, y1, amp, 120);
          pts = pts.concat(seg);
        });
        end = { x: W / 2, y: bodies[2].y + bodies[2].h + 84 };
        pts.push(end);
        parts.push({ d: curveThrough(pts), gap: 0 });
      } else {
        /* desktop: S-curves swing from each illustration's base to the next illustration's crown */
        const base = (a) => ({ x: a.cx, y: a.y + a.h * 0.9 }), crown = (a) => ({ x: a.cx, y: a.y + a.h * 0.07 });
        for (let i = 0; i < evs.length - 1; i++) {
          const p0 = base(arts[i]), p1 = crown(arts[i + 1]);
          parts.push({ d: curveThrough([p0, p1]), gap: arts[i + 1].h * 0.83 });
        }
        const last = base(arts[evs.length - 1]);
        end = { x: W / 2, y: arts[evs.length - 1].y + arts[evs.length - 1].h + 96 };
        parts.push({ d: curveThrough([last, end]), gap: 0 });
      }

      const defs = mkEl('defs', {}, jsvg);
      const grad = mkEl('radialGradient', { id: 'glowG' }, defs);
      mkEl('stop', { offset: '0', 'stop-color': '#FFF4D6' }, grad);
      mkEl('stop', { offset: '.4', 'stop-color': '#E8C77F', 'stop-opacity': '.85' }, grad);
      mkEl('stop', { offset: '1', 'stop-color': '#B89558', 'stop-opacity': '0' }, grad);
      const sym = mkEl('symbol', { id: 'jas', viewBox: '0 0 40 40' }, defs);
      const petals = mkEl('g', { fill: '#FFFBF3', stroke: '#B89558', 'stroke-width': '.9' }, sym);
      [0, 60, 120, 180, 240, 300].forEach((r) => mkEl('ellipse', { cx: 20, cy: 10.5, rx: 4.4, ry: 9, transform: `rotate(${r} 20 20)` }, petals));
      mkEl('circle', { cx: 20, cy: 20, r: 2.8, fill: '#B89558' }, sym);
      const mask = mkEl('mask', { id: 'journeyMask', maskUnits: 'userSpaceOnUse', x: -60, y: -60, width: W + 120, height: H + 120 }, defs);
      const gTrack = mkEl('g', {}, jsvg);
      const gDots = mkEl('g', { mask: 'url(#journeyMask)' }, jsvg);

      let total = 0;
      const segs = parts.map((p) => {
        mkEl('path', { d: p.d, class: 'track' }, gTrack);
        mkEl('path', { d: p.d, class: 'dots' }, gDots);
        const mp = mkEl('path', { d: p.d, class: 'mask-path' }, mask);
        const len = mp.getTotalLength();
        mp.style.strokeDasharray = len; mp.style.strokeDashoffset = len;
        const s = { mp, len, from: total, gap: p.gap };
        total += len + p.gap;
        return s;
      });
      const orn = mkEl('use', { href: '#jas', x: end.x - 19, y: end.y - 19, width: 38, height: 38 }, jsvg);
      orn.style.opacity = 0; orn.style.transformOrigin = `${end.x}px ${end.y}px`;
      const glow = mkEl('circle', { r: 9, fill: 'url(#glowG)', opacity: 0 }, jsvg);
      const core = mkEl('circle', { r: 2.4, fill: '#FFF4D6', opacity: 0 }, jsvg);

      let ornOn = false;
      const showOrn = (on) => {
        if (ornOn === on) return; ornOn = on;
        if (animate) gsap.to(orn, { opacity: on ? 1 : 0, scale: on ? 1 : 0.6, duration: 0.8, ease: 'power2.out', overwrite: true });
        else orn.style.opacity = on ? 1 : 0;
      };
      const state = { p: 0 };
      const apply = () => {
        const pos = state.p * total;
        let lead = null;
        segs.forEach((s) => {
          const local = Math.min(1, Math.max(0, (pos - s.from) / s.len));
          s.mp.style.strokeDashoffset = s.len * (1 - local);
          if (local > 0 && local < 1) lead = { s, local };
        });
        showOrn(state.p > 0.985);
        if (!animate) return;
        if (lead) {
          const pt = lead.s.mp.getPointAtLength(lead.s.len * lead.local);
          glow.setAttribute('cx', pt.x); glow.setAttribute('cy', pt.y); core.setAttribute('cx', pt.x); core.setAttribute('cy', pt.y);
        }
        glow.setAttribute('opacity', lead ? 1 : 0); core.setAttribute('opacity', lead ? 1 : 0);
      };
      if (!animate) { state.p = 1; apply(); return; }

      const jTop = () => J.getBoundingClientRect().top + window.scrollY;
      const startY = segs.length ? (parts[0].d.match(/^M([\d.\-]+) ([\d.\-]+)/) || [0, 0, 0])[2] : 0;
      journeyTween = gsap.to(state, {
        p: 1, ease: 'none', onUpdate: apply,
        scrollTrigger: {
          trigger: J, scrub: 0.6, invalidateOnRefresh: true,
          start: () => jTop() + parseFloat(startY) - innerHeight * 0.72,
          end: () => jTop() + end.y - innerHeight * 0.55,
          onRefresh: apply
        }
      });
      apply();
    }
    function rebuildJourneySoon() {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(() => { buildJourney(); ScrollTrigger.refresh(); }, 160);
    }
    if (window.ResizeObserver) {
      let lw = J.offsetWidth, lh = J.offsetHeight;
      new ResizeObserver(() => {
        if (J.offsetWidth === lw && J.offsetHeight === lh) return;
        lw = J.offsetWidth; lh = J.offsetHeight; rebuildJourneySoon();
      }).observe(J);
    } else window.addEventListener('resize', rebuildJourneySoon);
    window.addEventListener('orientationchange', rebuildJourneySoon);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuildJourneySoon);
    window.addEventListener('load', rebuildJourneySoon);
    $$('.event-art img', J).forEach((im) => { if (!im.complete) im.addEventListener('load', rebuildJourneySoon, { once: true }); });
    buildJourney();

    if (reduceMotion) endIntro();   /* reduced-motion visitors go straight to the invitation */
})();
