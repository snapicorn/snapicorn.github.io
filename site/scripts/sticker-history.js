// The sole sticker owner: committed snapshots/cursor and an uncommitted gesture.
const StickerHistory = (() => {
  const snapshot = stickers => Object.freeze(stickers.map(sticker => Object.freeze({ ...sticker })));
  const create = () => ({ entries: [snapshot([])], index: 0, gesture: null });
  const current = state => state.entries[state.index];
  const visible = state => state.gesture?.draft || current(state);

  function commit(state, stickers) {
    if (StickerGeometry.equal(current(state), stickers)) return { ...state, gesture: null };
    const entries = [...state.entries.slice(0, state.index + 1), snapshot(stickers)];
    return { entries, index: entries.length - 1, gesture: null };
  }

  function reduce(state, action, output) {
    const stickers = current(state);
    switch (action.type) {
      case 'add': return commit(state, [...stickers, StickerGeometry.constrain(action.sticker, output)]);
      case 'change': return commit(state, stickers.map(sticker => sticker.id === action.id
        ? StickerGeometry.constrain({ ...sticker, ...action.patch }, output) : sticker));
      case 'remove': return commit(state, stickers.filter(sticker => sticker.id !== action.id));
      case 'undo': return { ...state, index: Math.max(0, state.index - 1), gesture: null };
      case 'redo': return { ...state, index: Math.min(state.entries.length - 1, state.index + 1), gesture: null };
      case 'begin': {
        const original = stickers.find(sticker => sticker.id === action.id);
        if (!original || state.gesture) return state;
        return { ...state, gesture: { ...action.gesture, id: action.id, original,
          token: action.token, draft: stickers } };
      }
      case 'move': {
        if (!state.gesture || state.gesture.token !== action.token) return state;
        const replacement = StickerGeometry.constrain({ ...state.gesture.original, ...action.patch }, output);
        const draft = snapshot(stickers.map(sticker => sticker.id === replacement.id ? replacement : sticker));
        return { ...state, gesture: { ...state.gesture, draft } };
      }
      case 'end': return state.gesture?.token === action.token ? commit(state, state.gesture.draft) : state;
      case 'cancel': return !action.token || state.gesture?.token === action.token ? { ...state, gesture: null } : state;
      default: return state;
    }
  }
  return { create, current, visible, reduce };
})();
