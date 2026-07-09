/* ==========================================================
   XeroAI — Dashboard Module JavaScript
   Used by: dashboard.html and onboarding-step*.html pages.
   Every feature below guards for missing elements so this one
   file can be safely shared across all dashboard-module pages.
   ========================================================== */

(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ ANIMATED NETWORK BACKGROUND ============ */
  (function(){
    const canvas = document.getElementById('dashNetworkCanvas');
    if(!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cw = 0, ch = 0, particles = [], rafId = null;

    function resize(){
      cw = window.innerWidth;
      ch = window.innerHeight;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles(){
      const density = 18000;
      const count = Math.max(24, Math.min(80, Math.floor((cw * ch) / density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * cw,
        y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26
      }));
    }

    function drawFrame(){
      ctx.clearRect(0, 0, cw, ch);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if(p.x <= 0 || p.x >= cw) p.vx *= -1;
        if(p.y <= 0 || p.y >= ch) p.vy *= -1;
      });

      for(let i = 0; i < particles.length; i++){
        for(let j = i + 1; j < particles.length; j++){
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if(dist < 130){
            ctx.strokeStyle = 'rgba(94,142,255,' + (0.14 * (1 - dist / 130)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(138,180,255,0.65)';
        ctx.fill();
      });
    }

    function loop(){
      drawFrame();
      rafId = requestAnimationFrame(loop);
    }

    function start(){
      resize();
      createParticles();
      if(reduceMotion){
        drawFrame();
      }else{
        if(rafId) cancelAnimationFrame(rafId);
        loop();
      }
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 150);
    });

    start();
  })();

  /* ============ SHARED LOADING -> SUCCESS BUTTON HELPER ============ */
  function simulateStepSubmit(btn, onComplete){
    btn.classList.add('is-loading');
    btn.setAttribute('aria-busy', 'true');
    const loadingDelay = reduceMotion ? 150 : 900;
    setTimeout(() => {
      btn.classList.remove('is-loading');
      btn.removeAttribute('aria-busy');
      onComplete();
    }, loadingDelay);
  }

  /* ============ ONBOARDING STEP PROGRESS BAR ============ */
  (function(){
    const fill = document.getElementById('stepProgressFill');
    if(!fill) return;
    const target = fill.dataset.target ? fill.dataset.target + '%' : fill.style.width;
    requestAnimationFrame(() => {
      setTimeout(() => { fill.style.width = target; }, 150);
    });
  })();

  /* ============ ONBOARDING STEP 1: MARKET SELECTION (single-select) ============ */
  (function(){
    const grid = document.querySelector('.step-market-grid');
    if(!grid) return;

    const cards = Array.from(grid.querySelectorAll('.step-market-card'));
    const continueBtn = document.getElementById('step1Continue');
    const hintEl = document.getElementById('step1Hint');

    function selectCard(card){
      cards.forEach(c => {
        const isThis = c === card;
        c.classList.toggle('selected', isThis);
        c.setAttribute('aria-checked', String(isThis));
        c.tabIndex = isThis ? 0 : -1;
      });

      if(continueBtn){
        continueBtn.disabled = false;
        continueBtn.setAttribute('aria-disabled', 'false');
      }
      if(hintEl){
        hintEl.textContent = 'You can add more markets later from your dashboard.';
      }
    }

    cards.forEach((card, index) => {
      card.addEventListener('click', () => selectCard(card));

      card.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if(e.key === 'ArrowRight' || e.key === 'ArrowDown'){
          targetIndex = (index + 1) % cards.length;
        }else if(e.key === 'ArrowLeft' || e.key === 'ArrowUp'){
          targetIndex = (index - 1 + cards.length) % cards.length;
        }else if(e.key === ' ' || e.key === 'Enter'){
          e.preventDefault();
          selectCard(card);
          return;
        }
        if(targetIndex !== null){
          e.preventDefault();
          cards[targetIndex].focus();
        }
      });
    });

    if(continueBtn){
      continueBtn.addEventListener('click', () => {
        if(continueBtn.disabled || continueBtn.classList.contains('is-loading')) return;
        const nextPage = continueBtn.dataset.next || 'onboarding-step2.html';
        simulateStepSubmit(continueBtn, () => {
          window.location.href = nextPage;
        });
      });
    }
  })();

  /* ============ ON-LOAD REVEAL ============ */
  (function(){
    const targets = document.querySelectorAll('.reveal-step');
    if(!targets.length) return;

    if(reduceMotion){
      targets.forEach(el => el.classList.add('in-view'));
    }else{
      targets.forEach((el, i) => {
        setTimeout(() => el.classList.add('in-view'), 120 + i * 130);
      });
    }
  })();

  /* ============ APPLICATION SHELL (dashboard framework) ============ */
  (function(){
    const appShell = document.getElementById('appShell');
    if(!appShell) return;

    const reduceMotionApp = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- desktop sidebar collapse ---- */
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    if(collapseBtn){
      collapseBtn.addEventListener('click', () => {
        const collapsed = appShell.classList.toggle('sidebar-collapsed');
        collapseBtn.setAttribute('aria-pressed', String(collapsed));
        collapseBtn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      });
    }

    /* ---- mobile drawer ---- */
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');

    function openDrawer(){
      if(!sidebar || !overlay) return;
      sidebar.classList.add('open');
      overlay.classList.add('show');
    }
    function closeDrawer(){
      if(!sidebar || !overlay) return;
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    }

    if(menuBtn) menuBtn.addEventListener('click', openDrawer);
    if(overlay) overlay.addEventListener('click', closeDrawer);

    // Close the drawer automatically if the viewport grows back to desktop size
    window.addEventListener('resize', () => {
      if(window.innerWidth > 900) closeDrawer();
    });

    /* ---- placeholder nav links: prevent jump-to-top, no route yet ---- */
    document.querySelectorAll('.sidebar-link[data-placeholder="true"]').forEach(link => {
      link.addEventListener('click', (e) => e.preventDefault());
    });

    /* ---- live date/time in topbar ---- */
    const datetimeEl = document.getElementById('topbarDatetime');
    if(datetimeEl){
      function updateClock(){
        const now = new Date();
        const formatted = now.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
        datetimeEl.textContent = formatted;
      }
      updateClock();
      setInterval(updateClock, 30000);
    }

    /* ---- reveal dashboard sections on load ---- */
    const revealTargets = document.querySelectorAll('.reveal-dash');
    if(reduceMotionApp){
      revealTargets.forEach(el => el.classList.add('in-view'));
    }else{
      revealTargets.forEach((el, i) => {
        setTimeout(() => el.classList.add('in-view'), 100 + i * 90);
      });
    }
  })();

})();
