// Per-browser conveniences (pins, viewed, last read). Everything is wrapped in
// try/catch: storage can be blocked or throw in private windows.
const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  dispatchEvent(new Event('cd-store'));
};

export const getPins = () => read<string[]>('cd-pins', []);
export const getViewed = () => read<string[]>('cd-viewed', []);
export const getLast = () => read<string | null>('cd-last', null);

export function togglePin(id: string) {
  const pins = getPins();
  write('cd-pins', pins.includes(id) ? pins.filter((p) => p !== id) : [...pins, id]);
}

export function markViewed(id: string) {
  const seen = getViewed();
  if (!seen.includes(id)) write('cd-viewed', [...seen, id]);
  write('cd-last', id);
}

export function onChange(fn: () => void) {
  addEventListener('cd-store', fn);
  addEventListener('storage', fn);
  return () => { removeEventListener('cd-store', fn); removeEventListener('storage', fn); };
}
