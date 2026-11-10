import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

type Item = { id: string; title: string; category: string; tags: string[]; href: string };

export default function Palette({ sheets }: { sheets: Item[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sheets.slice(0, 8);
    const score = (s: Item) => {
      const hay = `${s.title} ${s.tags.join(' ')} ${s.category}`.toLowerCase();
      if (s.title.toLowerCase().startsWith(needle)) return 3;
      if (s.title.toLowerCase().includes(needle)) return 2;
      return needle.split(/\s+/).every((w) => hay.includes(w)) ? 1 : 0;
    };
    return sheets.map((s) => [s, score(s)] as const).filter(([, n]) => n).sort((a, b) => b[1] - a[1]).map(([s]) => s).slice(0, 8);
  }, [q, sheets]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === 'Escape') setOpen(false);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => input.current?.focus(), 0); } }, [open]);
  useEffect(() => setSel(0), [q]);

  const onInputKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[sel]) location.href = results[sel].href;
  };

  return (
    <>
      <button class="ghost" onClick={() => setOpen(true)}>Search<kbd>⌘K</kbd></button>
      {open && (
        <div class="pal-back" onClick={() => setOpen(false)}>
          <div class="pal" role="dialog" aria-label="Search sheets" onClick={(e) => e.stopPropagation()}>
            <input ref={input} value={q} placeholder="Jump to a sheet…" onInput={(e) => setQ((e.target as HTMLInputElement).value)} onKeyDown={onInputKey} />
            {results.length ? (
              <ul>
                {results.map((r, i) => (
                  <li class={i === sel ? 'on' : ''}><a href={r.href}><span>{r.title}</span><small>{r.category}</small></a></li>
                ))}
              </ul>
            ) : <div class="empty">No sheets match “{q}”.</div>}
          </div>
        </div>
      )}
    </>
  );
}
