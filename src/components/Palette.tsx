import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getPins } from '../store';

type Item = { id: string; title: string; category: string; tags: string[]; href: string };
type Hit = { key: string; href: string; title: string; sub: string; excerpt?: string };

let pf: any; // undefined = not tried yet, null = unavailable (e.g. dev server has no index)
async function loadPagefind(base: string) {
  if (pf !== undefined) return pf;
  try {
    pf = await import(/* @vite-ignore */ `${base}/pagefind/pagefind.js`);
    await pf.options?.({ baseUrl: `${base}/` });
  } catch {
    pf = null;
  }
  return pf;
}

export default function Palette({ sheets, base }: { sheets: Item[]; base: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [pins, setPins] = useState<string[]>([]);
  const [deep, setDeep] = useState<Hit[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const local = useMemo<Hit[]>(() => {
    const needle = q.trim().toLowerCase();
    const toHit = (s: Item): Hit => ({ key: s.href, href: s.href, title: s.title, sub: s.category });
    if (!needle) {
      const pinned = pins.map((id) => sheets.find((s) => s.id === id)).filter(Boolean) as Item[];
      const rest = sheets.filter((s) => !pins.includes(s.id));
      return [...pinned.map((s) => ({ ...toHit(s), sub: `★ ${s.category}` })), ...rest.map(toHit)].slice(0, 8);
    }
    const score = (s: Item) => {
      const title = s.title.toLowerCase();
      const hay = `${title} ${s.tags.join(' ')} ${s.category}`;
      if (title.startsWith(needle)) return 3;
      if (title.includes(needle)) return 2;
      return needle.split(/\s+/).every((w) => hay.includes(w)) ? 1 : 0;
    };
    return sheets.map((s) => [s, score(s)] as const).filter(([, n]) => n).sort((a, b) => b[1] - a[1]).map(([s]) => toHit(s)).slice(0, 6);
  }, [q, sheets, pins]);

  // full-text results from Pagefind (only exists after `npm run build`)
  useEffect(() => {
    const needle = q.trim();
    if (!open || needle.length < 2) { setDeep([]); return; }
    let cancelled = false;
    (async () => {
      const engine = await loadPagefind(base);
      if (!engine) return;
      const res = await engine.debouncedSearch(needle, {}, 150);
      if (!res || cancelled) return;
      const hits: Hit[] = [];
      for (const r of res.results.slice(0, 6)) {
        const d = await r.data();
        const sub = d.sub_results?.[0];
        const raw: string = sub?.url ?? d.url;
        hits.push({ key: d.url, href: raw.startsWith(`${base}/`) ? raw : `${base}${raw}`, title: d.meta?.title ?? d.url, sub: 'in text', excerpt: sub?.excerpt ?? d.excerpt });
      }
      if (!cancelled) setDeep(hits);
    })();
    return () => { cancelled = true; };
  }, [q, open, base]);

  const results = useMemo(() => {
    const path = (h: string) => h.split('#')[0].replace(/\/$/, '');
    const seen = new Set(local.map((l) => path(l.href)));
    return [...local, ...deep.filter((d) => !seen.has(path(d.href)))];
  }, [local, deep]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '');
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === '/' && !typing) { e.preventDefault(); setOpen(true); }
      else if (e.key === 'Escape') setOpen(false);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (open) { wasOpen.current = true; setSel(0); setPins(getPins()); setTimeout(() => input.current?.focus(), 0); }
    else {
      setQ('');
      // give focus back to the trigger, but only after a real close (not on first page load)
      if (wasOpen.current) { wasOpen.current = false; if (document.activeElement === document.body) opener.current?.focus(); }
    }
  }, [open]);
  useEffect(() => setSel(0), [q]);

  const onInputKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[sel]) location.href = results[sel].href;
    if (e.key === 'Tab') e.preventDefault(); // keep focus in the dialog; arrows move the selection
  };

  return (
    <>
      <button ref={opener} class="ghost" onClick={() => setOpen(true)} aria-haspopup="dialog">Search<kbd aria-hidden="true">⌘K</kbd></button>
      {open && (
        <div class="pal-back" onClick={() => setOpen(false)}>
          <div class="pal" role="dialog" aria-modal="true" aria-label="Search sheets" onClick={(e) => e.stopPropagation()}>
            <input ref={input} value={q} aria-label="Search sheets" autocomplete="off" spellcheck={false} placeholder="Search titles and text…" onInput={(e) => setQ((e.target as HTMLInputElement).value)} onKeyDown={onInputKey} />
            {results.length ? (
              <ul>
                {results.map((r, i) => (
                  <li class={i === sel ? 'on' : ''} onMouseEnter={() => setSel(i)}>
                    <a href={r.href} class={r.excerpt ? 'fx' : ''}>
                      <span>{r.title}</span><small>{r.sub}</small>
                      {r.excerpt && <span class="ex" dangerouslySetInnerHTML={{ __html: r.excerpt }} />}
                    </a>
                  </li>
                ))}
              </ul>
            ) : <div class="empty">No sheets match “{q}”.</div>}
          </div>
        </div>
      )}
    </>
  );
}
