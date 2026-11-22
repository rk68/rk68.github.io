(() => {
  // Loaded in <head> without defer, so the mode is set before the first paint and the page never flashes.
  const root = document.documentElement;
  function setMode(mode) {
    root.dataset.mode = mode;
    root.style.colorScheme = mode;
  }
  let mode = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  try { mode = localStorage.getItem('mode') || mode; } catch {}
  setMode(mode === 'dark' ? 'dark' : 'light');

  // Hand-drawn line icons. The paths wobble on purpose, to match the painted artwork.
  const contacts = [
    ['https://x.com/rish0x', 'X', '<path d="M5.2 4.6C9 10 13.8 16.2 18.8 19.6M18.4 4.3C14.8 8.4 9.6 14.2 5.4 19.3"/>'],
    ['https://www.linkedin.com/in/-rishi-kalra/', 'LinkedIn', '<path d="M4.6 4.2C9 3.8 15 3.9 19.6 4.4 20 9 20.1 15 19.7 19.6 15 20.1 9 20 4.4 19.7 3.9 15 4 9 4.6 4.2ZM8.3 10.6 8.2 16.6M11.6 16.6 11.7 10.7M11.7 12.8C12.4 11.2 13.6 10.6 14.6 10.7 15.8 10.8 16.2 11.8 16.2 13.2L16.1 16.6"/><circle cx="8.3" cy="7.9" r=".5"/>'],
    ['https://github.com/rk68', 'GitHub', '<path d="M9.1 19.4c-4.2 1.3-4.3-2.3-6-2.8M15.1 21.2v-3.4c0-1 .1-1.5-.5-2.1 2.8-.3 5.6-1.3 5.6-6.1a4.8 4.8 0 0 0-1.3-3.3 4.4 4.4 0 0 0-.1-3.3s-1.1-.3-3.5 1.3a12 12 0 0 0-6.3 0C6.6 2.7 5.5 3 5.5 3a4.4 4.4 0 0 0-.1 3.3 4.8 4.8 0 0 0-1.3 3.3c0 4.7 2.8 5.8 5.6 6.1-.6.6-.6 1.2-.5 2.1v3.4"/>'],
    ['https://scholar.google.com/citations?user=2zi5lWYAAAAJ&hl=en', 'Google Scholar', '<path d="M2.8 9.4 12 5.2l9.2 4.3-9.2 4.1ZM6.6 11.6l.1 4C9.6 18.2 14.4 18.2 17.3 15.6l.1-4M21 9.6l.1 4.8"/>'],
    ['mailto:rishi.k3838@gmail.com', 'Email', '<path d="M3.8 6.4C9 6 15 6.1 20.2 6.5L20 17.6C15 17.9 9 17.9 4 17.5ZM4.1 6.7C7 9.6 9.8 11.8 12 12.9 14.4 11.8 17.2 9.6 19.9 6.8"/>'],
  ];
  // Light mode shows the moon (switch to night) and dark mode shows the sun. CSS turns the hidden one away.
  const modeIcons =
    '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4 7 7M17 17l1.6 1.6M5.4 18.6 7 17M17 7l1.6-1.6"/></svg>' +
    '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 14.6A8 8 0 0 1 9.4 4.4 8 8 0 1 0 19.6 14.6Z"/></svg>';

  document.addEventListener('DOMContentLoaded', () => {
    for (const slot of document.querySelectorAll('[data-contacts]')) {
      slot.className = 'contacts';
      for (const [href, label, paths] of contacts) {
        const a = document.createElement('a');
        a.href = href;
        a.title = label;
        a.setAttribute('aria-label', label);
        a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + paths + '</svg>';
        slot.append(a);
      }
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mode-toggle';
    toggle.innerHTML = modeIcons;
    function label() {
      const text = root.dataset.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      toggle.setAttribute('aria-label', text);
      toggle.title = text;
    }
    toggle.addEventListener('click', () => {
      setMode(root.dataset.mode === 'dark' ? 'light' : 'dark');
      try { localStorage.setItem('mode', root.dataset.mode); } catch {}
      label();
    });
    label();
    document.querySelector('header nav').append(toggle);
  });
})();
