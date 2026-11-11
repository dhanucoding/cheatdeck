import { getCollection, type CollectionEntry } from 'astro:content';

type Sheet = CollectionEntry<'sheets'>;

export const CATEGORIES: Record<string, { label: string; blurb: string; icon: string; topics: string[] }> = {
  'system-design': {
    label: 'System Design',
    blurb: 'Scaling, storage, and distributed building blocks.',
    icon: '◈',
    topics: ['Scaling & traffic', 'Data & storage', 'Distributed theory', 'Messaging & APIs', 'Reference'],
  },
  python: { label: 'Python', blurb: 'Idioms and snippets you keep googling.', icon: '◆', topics: ['Basics'] },
};

export const url = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

const byOrder = (a: Sheet, b: Sheet) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

export async function allSheets() {
  const sheets = await getCollection('sheets');
  return sheets.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

/** Categories → topics → sheets, in reading order. Topics not listed in CATEGORIES go last. */
export async function catalog() {
  const sheets = await getCollection('sheets');
  return Object.entries(CATEGORIES)
    .map(([key, c]) => {
      const items = sheets.filter((s) => s.data.category === key);
      const extra = [...new Set(items.map((s) => s.data.topic))].filter((t) => !c.topics.includes(t));
      const topics = [...c.topics, ...extra]
        .map((name) => ({ name, items: items.filter((s) => s.data.topic === name).sort(byOrder) }))
        .filter((t) => t.items.length);
      return { key, ...c, topics, flat: topics.flatMap((t) => t.items) };
    })
    .filter((c) => c.flat.length);
}
