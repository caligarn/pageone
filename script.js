(function () {
  const deck = document.getElementById('deck');
  const slides = Array.from(deck.querySelectorAll('.slide'));
  const slideNumEl = document.getElementById('slideNum');
  const slideTotalEl = document.getElementById('slideTotal');
  const progressBar = document.getElementById('progressBar');
  const helpPanel = document.getElementById('help');
  const helpBtn = document.getElementById('helpBtn');
  const helpClose = document.getElementById('helpClose');

  // ── Cohort ──────────────────────────────────────────────────────────────
  const creators = [
    'Adam Mutchler',
    'Tracy',
    'Vesica',
    'Daniel Jacobs',
    'David Ronan',
    'Blair Adams',
    'Eileen / Mark / Roshni',
    'Anand / Ian',
    'Paul Byrd'
  ];

  const grid = deck.querySelector('.creators-grid');
  if (grid) {
    creators.forEach((name, i) => {
      const card = document.createElement('div');
      card.className = 'creator';
      card.innerHTML = `
        <div class="creator__num">${String(i + 1).padStart(2, '0')}</div>
        <h3>${name}</h3>
      `;
      grid.appendChild(card);
    });
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  let current = 0;
  const total = slides.length;
  slideTotalEl.textContent = total;

  function go(n) {
    n = Math.max(0, Math.min(total - 1, n));
    current = n;
    deck.style.transform = `translateX(-${n * 100}vw)`;
    slideNumEl.textContent = n + 1;
    progressBar.style.width = ((n + 1) / total * 100) + '%';
    if (history.replaceState) {
      history.replaceState(null, '', '#' + (n + 1));
    }
  }
  const next = () => go(current + 1);
  const prev = () => go(current - 1);

  // ── Init from hash ──────────────────────────────────────────────────────
  function initFromHash() {
    const m = (location.hash || '').match(/^#(\d+)$/);
    const idx = m ? Math.max(1, parseInt(m[1], 10)) - 1 : 0;
    go(idx);
  }
  initFromHash();
  window.addEventListener('hashchange', initFromHash);

  // ── Keep slide position correct on resize ───────────────────────────────
  window.addEventListener('resize', () => {
    deck.style.transition = 'none';
    deck.style.transform = `translateX(-${current * 100}vw)`;
    void deck.offsetWidth;
    deck.style.transition = '';
  });

  // ── Keyboard ────────────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') {
      e.preventDefault(); next();
    } else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') {
      e.preventDefault(); prev();
    } else if (k === 'Home') {
      e.preventDefault(); go(0);
    } else if (k === 'End') {
      e.preventDefault(); go(total - 1);
    } else if (/^[1-9]$/.test(k)) {
      e.preventDefault(); go(parseInt(k, 10) - 1);
    } else if (k === 'f' || k === 'F' || k === 'F5') {
      e.preventDefault(); toggleFullscreen();
    } else if (k === '?' || k === '/') {
      e.preventDefault(); toggleHelp();
    } else if (k === 'Escape') {
      if (!helpPanel.hidden) toggleHelp();
    }
  });

  // ── Click navigation (left/right halves) on non-touch ───────────────────
  const isTouch = matchMedia('(hover: none)').matches;
  if (!isTouch) {
    deck.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input, textarea, .creator, .brick, .topic, .pill, .ticker__tag, .reminders')) return;
      const x = e.clientX / window.innerWidth;
      if (x > 0.55) next();
      else if (x < 0.45) prev();
    });
  }

  // ── Touch swipe ─────────────────────────────────────────────────────────
  let touchStart = null;
  deck.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) next(); else prev();
    }
    touchStart = null;
  }, { passive: true });

  // ── Fullscreen ──────────────────────────────────────────────────────────
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // ── Help panel ──────────────────────────────────────────────────────────
  function toggleHelp() {
    helpPanel.hidden = !helpPanel.hidden;
  }
  helpBtn.addEventListener('click', toggleHelp);
  helpClose.addEventListener('click', toggleHelp);
  helpPanel.addEventListener('click', (e) => {
    if (e.target === helpPanel) toggleHelp();
  });
})();
