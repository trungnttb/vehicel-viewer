export const displayModeKey = 'little-garage:display-mode';

export function readDisplayMode(storage) {
  try { return storage.getItem(displayModeKey) === 'child' ? 'child' : 'standard'; }
  catch { return 'standard'; }
}

export function saveDisplayMode(storage, mode) {
  try { storage.setItem(displayModeKey, mode === 'child' ? 'child' : 'standard'); return true; }
  catch { return false; }
}
