const StickerEditor = (() => {
  const assets = ['star', 'rainbow', 'unicorn', 'heart'].map(key => ({ key,
    label: key[0].toUpperCase() + key.slice(1), src: `assets/stickers/sticker-pixel-${key}.png` }));
  let nextId = 0;
  const output = () => StickerGeometry.dimensions(session.geometry);
  const current = () => StickerHistory.current(session.stickerHistory);
  const selected = () => StickerHistory.visible(session.stickerHistory).find(sticker => sticker.id === ui.selectedSticker);

  function dispatch(action) {
    const before = current();
    session.stickerHistory = StickerHistory.reduce(session.stickerHistory, action, output());
    render();
    if (before !== current()) {
      session.revision++;
      requestComposition();
    }
  }

  function add(key) {
    if (!session.geometry || ui.phase !== 'customize' || !assets.some(asset => asset.key === key)) return;
    cancel();
    const slot = current().length;
    const sticker = { id: `sticker-${++nextId}`, key, x: slot % 2 ? 0.78 : 0.22,
      y: 0.96 - (Math.floor(slot / 2) % 4) * 0.23, size: 0.22, rotation: 0 };
    ui.selectedSticker = sticker.id;
    dispatch({ type: 'add', sticker });
  }

  function change(patch) {
    if (!selected()) return;
    cancel();
    dispatch({ type: 'change', id: ui.selectedSticker, patch });
  }

  function remove() {
    if (!selected()) return;
    cancel();
    dispatch({ type: 'remove', id: ui.selectedSticker });
    ui.selectedSticker = null;
    render();
    document.getElementById('add-star').focus();
  }

  function history(type) {
    cancel();
    dispatch({ type });
  }

  function cancel(recompose = true) {
    const gesture = session.stickerHistory.gesture;
    if (!gesture) return;
    session.stickerHistory = StickerHistory.reduce(session.stickerHistory, { type: 'cancel' }, output());
    gesture.cleanup?.();
    render();
    if (recompose) requestComposition();
  }

  function begin(event, id, kind, target) {
    if (session.stickerHistory.gesture || ui.destination !== 'booth' || ui.phase !== 'customize') return;
    const sticker = current().find(item => item.id === id);
    if (!sticker) return;
    const gesture = StickerGestures.begin(event, sticker, kind, document.getElementById('strip-stage').getBoundingClientRect());
    if (!gesture) return;
    event.preventDefault();
    event.stopPropagation();
    ui.selectedSticker = id;
    const token = {};
    const move = event => {
      const active = session.stickerHistory.gesture;
      if (active?.token !== token) return;
      const patch = StickerGestures.patch(active, event);
      if (!patch) return;
      const before = StickerHistory.visible(session.stickerHistory);
      session.stickerHistory = StickerHistory.reduce(session.stickerHistory, { type: 'move', token, patch }, output());
      if (StickerGeometry.equal(before, StickerHistory.visible(session.stickerHistory))) return;
      render();
      requestComposition();
    };
    const finish = event => {
      const active = session.stickerHistory.gesture;
      if (active?.token !== token || !StickerGestures.accepts(active, event)) return;
      if (event.type === 'pointerup') {
        move(event);
        const changed = !StickerGeometry.equal(current(), session.stickerHistory.gesture.draft);
        dispatch({ type: 'end', token });
        cleanup();
        // A moved-back draft must be rebuilt; a selection-only gesture already has valid pixels.
        if (!changed) {
          if (session.output.gestureToken || operations.compositionStatus !== 'ready') requestComposition();
          else renderSession();
        }
      } else cancel();
    };
    function cleanup() {
      target.removeEventListener('pointermove', move);
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) target.removeEventListener(type, finish);
      if (target.hasPointerCapture?.(event.pointerId)) target.releasePointerCapture(event.pointerId);
    }
    gesture.cleanup = cleanup;
    session.stickerHistory = StickerHistory.reduce(session.stickerHistory, { type: 'begin', id, token, gesture }, output());
    target.addEventListener('pointermove', move);
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) target.addEventListener(type, finish);
    try { target.setPointerCapture(event.pointerId); }
    catch { cancel(); return; }
    target.focus();
    render();
    setExportEnabled(false);
  }

  function keydown(event, id) {
    ui.selectedSticker = id;
    const sticker = selected();
    if (!sticker) return;
    const movement = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (movement) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      const dimensions = output();
      change({ x: sticker.x + movement[0] * step / dimensions.width,
        y: sticker.y + movement[1] * step / dimensions.height });
    } else if (['Delete', 'Backspace'].includes(event.key)) {
      event.preventDefault(); remove();
    } else if (event.key === 'Escape') { event.preventDefault(); cancel(); }
  }

  function render() {
    const state = session.stickerHistory;
    const stickers = StickerHistory.visible(state);
    const layer = document.getElementById('sticker-layer');
    const ids = new Set(stickers.map(sticker => sticker.id));
    for (const node of [...layer.children]) if (!ids.has(node.getAttribute('data-sticker-id'))) node.remove();
    for (const sticker of stickers) {
      let node = [...layer.children].find(node => node.getAttribute('data-sticker-id') === sticker.id);
      const asset = assets.find(asset => asset.key === sticker.key);
      if (!node) {
        node = document.createElement('button');
        node.type = 'button'; node.className = 'sticker-target';
        node.setAttribute('data-sticker-id', sticker.id);
        node.setAttribute('aria-label', `${asset.label} sticker. Arrow keys move; Delete removes.`);
        node.addEventListener('focus', () => { ui.selectedSticker = sticker.id; render(); });
        node.addEventListener('click', () => { ui.selectedSticker = sticker.id; render(); });
        node.addEventListener('keydown', event => keydown(event, sticker.id));
        node.addEventListener('pointerdown', event => begin(event, sticker.id, 'drag', node));
        for (const corner of ['nw', 'ne', 'sw', 'se']) {
          const handle = document.createElement('span');
          handle.className = `selection-corner ${corner}`;
          handle.setAttribute('aria-hidden', 'true');
          handle.addEventListener('pointerdown', event => begin(event, sticker.id, 'resize', node));
          node.appendChild(handle);
        }
        layer.appendChild(node);
      }
      node.setAttribute('aria-pressed', String(ui.selectedSticker === sticker.id));
      Object.assign(node.style, { left: `${sticker.x * 100}%`, top: `${sticker.y * 100}%`,
        width: `${sticker.size * 100}%`, transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)` });
    }
    const sticker = selected();
    document.getElementById('sticker-controls').hidden = !sticker;
    document.getElementById('sticker-empty').hidden = !!sticker;
    if (sticker) {
      document.getElementById('selected-sticker-name').textContent = assets.find(asset => asset.key === sticker.key).label;
      document.getElementById('sticker-size').value = sticker.size * 100;
      document.getElementById('sticker-size-value').textContent = `${Math.round(sticker.size * 100)}%`;
      document.getElementById('sticker-rotation').value = sticker.rotation;
      document.getElementById('sticker-rotation-value').textContent = `${Math.round(sticker.rotation)}°`;
    }
    document.getElementById('undo-sticker').disabled = state.index === 0;
    document.getElementById('redo-sticker').disabled = state.index === state.entries.length - 1;
    for (const asset of assets) document.getElementById(`add-${asset.key}`).setAttribute('data-selected', String(sticker?.key === asset.key));
  }

  function tool(name, focus = false) {
    ui.tool = name;
    for (const key of ['frame', 'stickers']) {
      const tab = document.getElementById(`tool-${key}`);
      tab.setAttribute('aria-selected', String(key === name));
      tab.tabIndex = key === name ? 0 : -1;
      document.getElementById(`${key}-panel`).hidden = key !== name;
    }
    if (focus) document.getElementById(`tool-${name}`).focus();
  }

  function zoom(value) {
    ui.zoom = StickerGeometry.clamp(value, 80, 140);
    document.getElementById('preview-zoom').value = ui.zoom;
    document.getElementById('preview-zoom-value').textContent = `${ui.zoom}%`;
    document.getElementById('strip-stage').style.setProperty('--zoom', ui.zoom / 100);
  }

  function initialize() {
    for (const asset of assets) document.getElementById(`add-${asset.key}`).addEventListener('click', () => add(asset.key));
    for (const name of ['frame', 'stickers']) {
      const tab = document.getElementById(`tool-${name}`);
      tab.addEventListener('click', () => tool(name));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        tool(event.key === 'Home' ? 'frame' : event.key === 'End' ? 'stickers' : name === 'frame' ? 'stickers' : 'frame', true);
      });
    }
    document.getElementById('sticker-size').addEventListener('input', event => change({ size: Number(event.target.value) / 100 }));
    document.getElementById('sticker-rotation').addEventListener('input', event => change({ rotation: Number(event.target.value) }));
    document.getElementById('preview-zoom').addEventListener('input', event => zoom(Number(event.target.value)));
    document.getElementById('remove-sticker').addEventListener('click', remove);
    document.getElementById('undo-sticker').addEventListener('click', () => history('undo'));
    document.getElementById('redo-sticker').addEventListener('click', () => history('redo'));
    document.getElementById('retry-composition').addEventListener('click', () => requestComposition());
    tool('frame'); render();
  }
  return { assets, initialize, render, add, change, remove, history, cancel, tool, zoom };
})();
