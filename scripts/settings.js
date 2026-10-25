// This owner holds only the preference; it never reads or changes photo data.
const Settings = (() => {
  const storageKey = 'snapicorn-motion-preference';
  let preference = 'system';
  let storageFailed = false;
  let deviceMotion;

  function render() {
    const reduced = preference === 'reduce' || Boolean(deviceMotion?.matches);
    document.documentElement.setAttribute('data-motion', reduced ? 'reduce' : 'no-preference');
    document.querySelectorAll('input[name="motion"]').forEach(radio => {
      radio.checked = radio.value === preference;
    });
    document.getElementById('motion-storage-status').textContent = storageFailed
      ? 'Your choice works for this visit, but couldn’t be remembered in this browser.' : '';
  }

  function choose(value) {
    if (!['system', 'reduce'].includes(value)) return;
    preference = value;
    try {
      window.localStorage.setItem(storageKey, preference);
      storageFailed = false;
    } catch {
      storageFailed = true;
    }
    render();
  }

  function initialize() {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (['system', 'reduce'].includes(saved)) preference = saved;
    } catch {
      storageFailed = true;
    }
    deviceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (deviceMotion?.addEventListener) deviceMotion.addEventListener('change', render);
    else deviceMotion?.addListener?.(render);
    document.querySelectorAll('input[name="motion"]').forEach(radio => {
      radio.addEventListener('change', () => { if (radio.checked) choose(radio.value); });
    });
    document.getElementById('settings-gallery').addEventListener('click', event => {
      event.preventDefault();
      navigateTo('gallery');
    });
    render();
  }

  return { initialize };
})();
