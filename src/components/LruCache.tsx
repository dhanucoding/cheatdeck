import { useState } from 'preact/hooks';

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function LruCache({ capacity = 4 }: { capacity?: number }) {
  // index 0 = most recently used, last = least recently used
  const [order, setOrder] = useState<string[]>(['A', 'B', 'C']);
  const [stats, setStats] = useState({ hits: 0, misses: 0 });
  const [log, setLog] = useState('Request a key. A hit moves it to the front; a miss loads it and may evict.');
  const [evicted, setEvicted] = useState<string | null>(null);

  const request = (k: string) => {
    if (order.includes(k)) {
      setOrder([k, ...order.filter((x) => x !== k)]);
      setStats((s) => ({ ...s, hits: s.hits + 1 }));
      setEvicted(null);
      setLog(`✓ Hit on ${k}: moved to the front (most recent).`);
    } else {
      const next = [k, ...order];
      let out: string | null = null;
      if (next.length > capacity) out = next.pop() as string;
      setOrder(next);
      setStats((s) => ({ ...s, misses: s.misses + 1 }));
      setEvicted(out);
      setLog(out ? `✗ Miss on ${k}: loaded from the DB. Cache full, so ${out} (least recent) was evicted.` : `✗ Miss on ${k}: loaded from the DB and added.`);
    }
  };
  const reset = () => {
    setOrder([]); setStats({ hits: 0, misses: 0 }); setEvicted(null);
    setLog('Cache cleared. Every first request is a miss.');
  };

  const total = stats.hits + stats.misses;
  const rate = total ? Math.round((stats.hits / total) * 100) : 0;

  return (
    <div class="demo">
      <h3>LRU cache simulator</h3>
      <small>Capacity {capacity} · least recently used is evicted first</small>
      <div class="lru" role="list" aria-label="Cache contents, most recent first">
        {Array.from({ length: capacity }, (_, i) => {
          const k = order[i];
          return (
            <div role="listitem" class={`lru-slot${k ? ' full' : ''}${i === 0 && k ? ' mru' : ''}${i === order.length - 1 && k && order.length === capacity ? ' lru-next' : ''}`} key={i}>
              {k ?? '–'}
              {k && i === 0 && <small>newest</small>}
              {k && i === order.length - 1 && order.length === capacity && <small>next out</small>}
            </div>
          );
        })}
        {evicted && <div class="lru-slot gone" aria-hidden="true">{evicted}<small>evicted</small></div>}
      </div>
      <div class="row">
        {KEYS.map((k) => <button key={k} onClick={() => request(k)} aria-label={`Request key ${k}`}>{k}</button>)}
        <button class="alt" onClick={reset}>Reset</button>
        <span>{stats.hits} hits · {stats.misses} misses{total ? ` · ${rate}% hit rate` : ''}</span>
      </div>
      <div class="log" aria-live="polite">{log}</div>
    </div>
  );
}
