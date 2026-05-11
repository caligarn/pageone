(function () {
  const deck = document.getElementById('deck');
  const slides = Array.from(deck.querySelectorAll('.slide'));
  const slideNumEl = document.getElementById('slideNum');
  const slideTotalEl = document.getElementById('slideTotal');
  const progressBar = document.getElementById('progressBar');
  const helpPanel = document.getElementById('help');
  const helpBtn = document.getElementById('helpBtn');
  const helpClose = document.getElementById('helpClose');

  // ── Creator data ────────────────────────────────────────────────────────
  const creators = [
    { name: 'Heidi',          project: 'Feature Film — Earth to Mars',                 medium: 'Feature Film' },
    { name: 'Eileen',         project: 'Short-Form Vertical Series',                   medium: 'Episodic Vertical' },
    { name: 'Valerie',        project: 'Open / Looking to Collaborate',                medium: 'TBD' },
    { name: 'Senait',         project: 'Vertical Series or TV Pilot',                  medium: 'Episodic / TV Pilot' },
    { name: 'Adam Mutchler',  project: 'Choice Cascades — Rapid Vertical Series',      medium: 'Vertical Episodic' },
    { name: 'Caitlyn Croft',  project: 'Transmedia — Immersive Story Concerts',        medium: 'Transmedia / Interactive' },
    { name: 'Daniel Jacobs',  project: 'AI Improv Show & Multiplayer Creative Game',   medium: 'Interactive / Episodic' },
    { name: 'David Ronan',    project: 'Afterlife Drama — Mother-Son Connection',      medium: 'Feature / Series' },
    { name: 'Vinay',          project: 'To Be Confirmed',                              medium: 'TBD' },
    { name: 'Mark Day',       project: 'Superhero Battle Engine — Interactive AI',     medium: 'Interactive / Visual Narrative' },
    { name: 'Fiona Bai Yu',   project: 'Sci-Fi Epic — Novel-to-Film IP',               medium: 'Episodic / Interactive' },
    { name: 'Tracy Swedlow',  project: 'TV: The Musical',                              medium: 'Musical Series' },
    { name: 'Mable Huang',    project: 'Episodic Micro-Drama (Rom-Com / Supernatural)', medium: 'Episodic Micro-Drama' },
    { name: 'Wenjie',         project: 'AI-Native Social Platform & Gaming',           medium: 'Interactive / Game' },
    { name: 'Paul',           project: 'Katsumi — AI Anime Series',                    medium: 'Anime Episodic' },
    { name: 'Nina',           project: 'Social Drama-Comedy set in Mumbai',            medium: 'Episodic Series' },
    { name: 'Vesica',         project: 'Arcane-Punk Sci-Fi & Historical Narratives',   medium: 'Visual Narrative' }
  ];

  // Distribute creators across 4 cohort slides (5–8 in DOM order)
  const cohortSlides = slides.filter((s) => s.querySelector('.creators-grid'));
  const batches = [
    creators.slice(0, 4),
    creators.slice(4, 8),
    creators.slice(8, 12),
    creators.slice(12, 17)
  ];
  cohortSlides.forEach((slide, i) => {
    const grid = slide.querySelector('.creators-grid');
    const batch = batches[i] || [];
    const startIdx = batches.slice(0, i).reduce((acc, b) => acc + b.length, 0);
    batch.forEach((c, j) => {
      const idx = startIdx + j + 1;
      const card = document.createElement('div');
      card.className = 'creator';
      card.innerHTML = `
        <div class="creator__num">${String(idx).padStart(2, '0')}</div>
        <h3>${c.name}</h3>
        <div class="creator__project">${c.project}</div>
        <span class="creator__medium">${c.medium}</span>
      `;
      grid.appendChild(card);
    });
  });

  // ── Navigation ──────────────────────────────────────────────────────────
  let current = 0;
  const total = slides.length;
  slideTotalEl.textContent = total;

  function go(n) {
    n = Math.max(0, Math.min(total - 1, n));
    if (n === current) {
      slides[n].classList.add('is-active');
      return;
    }
    slides[current].classList.remove('is-active');
    slides[n].classList.add('is-active');
    slides[n].scrollTop = 0;
    current = n;
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

  // ── Keyboard ────────────────────────────────────────────────────────────
  // Forward: ArrowRight, ArrowDown, PageDown, Space, Enter
  // Back:    ArrowLeft,  ArrowUp,   PageUp,   Backspace
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
      if (e.target.closest('a, button, input, textarea, .creator, .card, .topic, .pill')) return;
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
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
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
