import { useEffect, useState } from 'preact/hooks';
import { getLast, getPins, onChange } from '../store';

type S = { id: string; title: string; summary: string; href: string; difficulty: string };

export default function YourStuff({ sheets }: { sheets: S[] }) {
  const [pins, setPins] = useState<string[]>([]);
  const [last, setLast] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => { setPins(getPins()); setLast(getLast()); };
    sync();
    return onChange(sync);
  }, []);
  const byId = (id: string) => sheets.find((s) => s.id === id);
  const pinned = pins.map(byId).filter(Boolean) as S[];
  const resume = last ? byId(last) : undefined;
  if (!pinned.length && !resume) return null;
  return (
    <section>
      {resume && <p class="resume">Continue reading → <a href={resume.href}>{resume.title}</a></p>}
      {pinned.length > 0 && (
        <>
          <h2 class="section">★ Pinned</h2>
          <div class="grid">
            {pinned.map((s) => (
              <a class="card" href={s.href}>
                <h3>{s.title}</h3>
                <p>{s.summary}</p>
                <span class="pill">{s.difficulty}</span>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
