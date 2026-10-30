(() => {
  const currentYear = document.getElementById('currentYear');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.dataset.theme === 'dark';
    document.body.dataset.theme = isDark ? 'light' : 'dark';
    themeToggle.setAttribute('aria-pressed', String(!isDark));
    themeToggle.setAttribute(
      'aria-label',
      `Switch to ${isDark ? 'dark' : 'light'} theme`
    );
  });
})();
