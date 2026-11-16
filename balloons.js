(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#f48ca7', '#80bfff', '#b49aeb', '#ffca70', '#80d5bd'];
  const protectedElements = 'a, button, input, textarea, select, label, img, svg, video, iframe, [contenteditable], [role="button"], .publications';
  let pointerStart = null;
  let layer;

  function isBlank(event) {
    if (!(event.target instanceof Element) || event.target.closest(protectedElements)) return false;
    // Check actual text lines, so padding around paragraphs still counts as blank.
    return !Array.from(event.target.childNodes).some(node => {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return false;
      const range = document.createRange();
      range.selectNodeContents(node);
      return Array.from(range.getClientRects()).some(rect =>
        event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom);
    });
  }

  function releaseBalloons(x, y) {
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'balloon-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.append(layer);
    }
    // Bound the amount of decoration even during rapid repeated clicks.
    while (layer.childElementCount >= 5) layer.firstElementChild.remove();
    const bunch = document.createElement('div');
    bunch.className = 'balloon-bunch';
    bunch.style.left = `${x}px`;
    bunch.style.top = `${y}px`;
    const count = 5 + Math.floor(Math.random() * 6);
    const phase = Math.random() * Math.PI * 2;
    // Fill an oval in two dimensions instead of placing balloons along a row.
    const balloons = Array.from({ length: count }, (_, i) => {
      const angle = phase + i * 2.399963;
      const radius = Math.sqrt((i + .5) / count);
      return {
        x: Math.cos(angle) * radius * 51,
        y: -105 + Math.sin(angle) * radius * 44,
        scale: .85 + Math.random() * .25,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }).sort((a, b) => a.y - b.y);
    let lifetime = 0;
    // Start with gathered strings, then let each balloon drift away independently.
    balloons.forEach(b => {
      const balloon = document.createElement('span');
      balloon.className = 'balloon';
      const knotY = b.y + 29 * b.scale;
      // Every string passes through (0, -15), then continues as a loose tail.
      const tailX = -b.x * .25 + Math.random() * 8 - 4;
      balloon.style.setProperty('--spread', `${b.x * .8 + Math.random() * 30 - 15}px`);
      balloon.style.setProperty('--rise', `${-(y + 180 + Math.random() * 100)}px`);
      balloon.style.setProperty('--tilt', `${b.x * .2 + Math.random() * 8 - 4}deg`);
      const duration = 4000 + Math.random() * 1000;
      const delay = 360 + Math.random() * 100;
      balloon.style.setProperty('--duration', `${duration}ms`);
      balloon.style.setProperty('--delay', `${delay}ms`);
      lifetime = Math.max(lifetime, duration + delay);
      balloon.innerHTML = `<svg viewBox="-100 -190 200 200" width="200" height="200"><path d="M${b.x} ${knotY} Q${b.x * .45} ${knotY * .5} 0 -15 Q${-b.x * .12} -3 ${tailX} 8" fill="none" stroke="#99a3ae" stroke-width="1" opacity=".75"/><g transform="translate(${b.x} ${b.y}) scale(${b.scale})" fill="${b.color}"><ellipse rx="20" ry="25"/><path d="M0 23 L-4 30 L4 30 Z"/><ellipse cx="-8" cy="-9" rx="5" ry="9" fill="white" opacity=".38" transform="rotate(25 -8 -9)"/></g></svg>`;
      bunch.append(balloon);
    });
    layer.append(bunch);
    window.setTimeout(() => bunch.remove(), lifetime + 100);
  }

  document.addEventListener('pointerdown', event => {
    pointerStart = event.isPrimary && event.button === 0
      ? { x: event.clientX, y: event.clientY, scrollY: window.scrollY }
      : null;
  }, { passive: true });
  document.addEventListener('pointercancel', () => { pointerStart = null; });
  document.addEventListener('click', event => {
    const start = pointerStart;
    pointerStart = null;
    if (!start || event.defaultPrevented || event.button !== 0 || event.detail !== 1 ||
        event.ctrlKey || event.metaKey || event.altKey || event.shiftKey ||
        reducedMotion.matches || window.getSelection()?.toString() ||
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8 ||
        Math.abs(window.scrollY - start.scrollY) > 8 || !isBlank(event)) return;
    releaseBalloons(event.clientX, event.clientY);
  });
})();
