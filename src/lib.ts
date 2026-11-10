import { getCollection } from 'astro:content';

export const CATEGORIES: Record<string, { label: string; blurb: string; icon: string }> = {
  'system-design': { label: 'System Design', blurb: 'Scaling, storage, and distributed building blocks.', icon: '◈' },
  python: { label: 'Python', blurb: 'Idioms and snippets you keep googling.', icon: '◆' },
};

export const url = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

export async function allSheets() {
  const sheets = await getCollection('sheets');
  return sheets.sort((a, b) => a.data.title.localeCompare(b.data.title));
}
