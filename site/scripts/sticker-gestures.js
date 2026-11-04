const StickerGestures = (() => {
  function begin(event, sticker, kind, bounds) {
    if (event.button !== 0 || !bounds.width || !bounds.height) return null;
    const center = { x: bounds.left + sticker.x * bounds.width, y: bounds.top + sticker.y * bounds.height };
    return { kind, pointerId: event.pointerId, startedAt: event.timeStamp,
      startX: event.clientX, startY: event.clientY, bounds, center,
      distance: Math.hypot(event.clientX - center.x, event.clientY - center.y) };
  }

  function accepts(gesture, event) {
    return gesture && event.pointerId === gesture.pointerId && event.timeStamp >= gesture.startedAt;
  }

  function patch(gesture, event) {
    if (!accepts(gesture, event)) return null;
    const original = gesture.original;
    if (gesture.kind === 'resize') {
      const distance = Math.hypot(event.clientX - gesture.center.x, event.clientY - gesture.center.y);
      return { size: original.size * distance / Math.max(1, gesture.distance) };
    }
    return { x: original.x + (event.clientX - gesture.startX) / gesture.bounds.width,
      y: original.y + (event.clientY - gesture.startY) / gesture.bounds.height };
  }
  return { begin, accepts, patch };
})();
