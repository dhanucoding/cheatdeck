import { useMemo, useState } from 'preact/hooks';

const SPACE = 360;
const COLORS = ['#d9480f', '#1c7ed6', '#2f9e44', '#9c36b5', '#e8a200', '#0c8599', '#c2255c', '#5c7cfa'];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % SPACE;
}
const KEYS = Array.from({ length: 40 }, (_, i) => `key-${i}`);

function owners(nodes: number[], vnodes: number) {
  const points = nodes.flatMap((n) => Array.from({ length: vnodes }, (_, v) => ({ n, pos: hash(`node-${n}#${v}`) }))).sort((a, b) => a.pos - b.pos);
  const map: Record<string, number> = {};
  if (!points.length) return { points, map };
  for (const k of KEYS) {
    const p = hash(k);
    map[k] = (points.find((pt) => pt.pos >= p) ?? points[0]).n;
  }
  return { points, map };
}

export default function HashRing() {
  const [nodes, setNodes] = useState([1, 2, 3]);
  const [vnodes, setVnodes] = useState(1);
  const [moved, setMoved] = useState<number | null>(null);
  const [next, setNext] = useState(4);
  const { points, map } = useMemo(() => owners(nodes, vnodes), [nodes, vnodes]);

  const apply = (newNodes: number[]) => {
    const after = owners(newNodes, vnodes).map;
    setMoved(KEYS.filter((k) => map[k] !== after[k]).length);
    setNodes(newNodes);
  };
  const add = () => { if (nodes.length < 8) { apply([...nodes, next]); setNext(next + 1); } };
  const remove = () => { if (nodes.length > 1) apply(nodes.slice(0, -1)); };
  const xy = (deg: number, r: number) => [100 + r * Math.sin((deg * Math.PI) / 180), 100 - r * Math.cos((deg * Math.PI) / 180)];
  const counts = nodes.map((n) => KEYS.filter((k) => map[k] === n).length);

  return (
    <div class="demo">
      <h3>Consistent hashing ring</h3>
      <small>Each key belongs to the next node clockwise. Dots are keys, rings are nodes.</small>
      <svg viewBox="0 0 200 200" style="width:100%;max-width:320px;display:block;margin:8px auto" role="img" aria-label="Hash ring with nodes and keys">
        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--line)" stroke-width="2" />
        {KEYS.map((k) => { const [x, y] = xy(hash(k), 80); return <circle cx={x} cy={y} r="2.4" fill={COLORS[(map[k] - 1) % 8]} />; })}
        {points.map((p) => { const [x, y] = xy(p.pos, 80); return <circle cx={x} cy={y} r="6" fill="var(--surface)" stroke={COLORS[(p.n - 1) % 8]} stroke-width="3" />; })}
      </svg>
      <div class="row">
        <button onClick={add}>Add node</button>
        <button class="alt" onClick={remove}>Remove node</button>
        <label style="font-size:14px">
          Virtual nodes: <select value={vnodes} onChange={(e) => { setVnodes(+(e.target as HTMLSelectElement).value); setMoved(null); }}>
            {[1, 4, 16, 64].map((v) => <option value={v}>{v}</option>)}
          </select>
        </label>
      </div>
      <div class="log" aria-live="polite">
        {nodes.length} nodes · keys per node: {counts.join(' / ')}
        {moved !== null && ` · last change moved ${moved} of ${KEYS.length} keys`}
      </div>
    </div>
  );
}
