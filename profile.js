const nameToggle = document.querySelector('.name-toggle');
if (nameToggle) {
  nameToggle.addEventListener('click', () => {
    const showChinese = nameToggle.getAttribute('aria-pressed') !== 'true';
    nameToggle.setAttribute('aria-pressed', String(showChinese));
    nameToggle.setAttribute('aria-label', showChinese ? '刘 涵冰 — Show English name' : 'Hanbing Liu — Show Chinese name');
    nameToggle.querySelector('.name-english').setAttribute('aria-hidden', String(showChinese));
    nameToggle.querySelector('.name-chinese').setAttribute('aria-hidden', String(!showChinese));
  });
}
