(() => {
  const carousel = document.querySelector('.publications');
  if (!carousel) return;
  const cards = [...carousel.querySelectorAll('.publication-card')];
  const counter = carousel.querySelector('.publication-counter');
  const controls = carousel.querySelector('.publication-controls');
  const dots = cards.map((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show publication ${index + 1}: ${card.querySelector('.papertitle').textContent.trim()}`);
    button.addEventListener('click', () => show(index));
    controls.append(button);
    return button;
  });
  let current = 0;

  function show(index) {
    current = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      const offset = (i - current + cards.length) % cards.length;
      card.classList.toggle('is-active', offset === 0);
      card.classList.toggle('is-next', offset === 1);
      card.classList.toggle('is-prev', offset === cards.length - 1);
      card.inert = offset !== 0;
      card.setAttribute('aria-hidden', String(offset !== 0));
      card.setAttribute('aria-label', `${i + 1} of ${cards.length}`);
      card.setAttribute('aria-roledescription', 'slide');
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    counter.textContent = `${current + 1} / ${cards.length}`;
  }

  function followHash(hash = location.hash) {
    const index = cards.findIndex(card =>
      [...card.querySelectorAll('[id]')].some(el => `#${el.id}` === hash));
    if (index >= 0) show(index);
  }

  carousel.classList.add('is-enhanced');
  carousel.querySelector('.publication-controls').hidden = false;
  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    // Keep focus outside a slide before that slide becomes inert.
    if (event.target.closest('.publication-card')) carousel.focus({ preventScroll: true });
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });

  let touchStart = null;
  carousel.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  carousel.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      show(current + (dx < 0 ? 1 : -1));
    }
    touchStart = null;
  }, { passive: true });
  carousel.addEventListener('touchcancel', () => { touchStart = null; });
  window.addEventListener('hashchange', () => followHash());
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link) followHash(link.getAttribute('href'));
  });
  show(0);
  followHash();
})();
