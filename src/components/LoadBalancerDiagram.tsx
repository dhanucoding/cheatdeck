import { useEffect, useRef, useState } from 'preact/hooks';

type Algo = 'round-robin' | 'least-conn' | 'ip-hash';
type Packet = { id: number; to: number | null; ip: string };

const SY = [40, 100, 160];
const ALGOS: { key: Algo; label: string; note: string }[] = [
  { key: 'round-robin', label: 'Round robin', note: 'Takes servers in turn. Simple, but blind to how busy each one is.' },
  { key: 'least-conn', label: 'Least connections', note: 'Picks the server with the fewest open requests. Good when request cost varies.' },
  { key: 'ip-hash', label: 'IP hash', note: 'Same client IP lands on the same server. Sticky without sessions, but uneven if a few IPs are heavy.' },
];
const RED = '#e03131';

export default function LoadBalancerDiagram() {
  const [algo, setAlgo] = useState<Algo>('round-robin');
  const [up, setUp] = useState([true, true, true]);
  const [conns, setConns] = useState([0, 0, 0]);
  const [served, setServed] = useState([0, 0, 0]);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [log, setLog] = useState('Watching requests flow. Click a server to take it down.');
  const [running, setRunning] = useState(() => typeof window === 'undefined' || !matchMedia('(prefers-reduced-motion: reduce)').matches);

  const live = useRef({ algo, up });
  live.current = { algo, up };
  const open = useRef([0, 0, 0]);
  const bump = (i: number, d: number) => {
    open.current = open.current.map((v, j) => (j === i ? Math.max(0, v + d) : v));
    setConns(open.current);
  };
  const rr = useRef(0);
  const seq = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  const send = () => {
    const { algo, up } = live.current;
    const conns = open.current;
    const alive = up.map((u, i) => (u ? i : -1)).filter((i) => i >= 0);
    const n = Math.floor(Math.random() * 6) + 1;
    const ip = `10.0.0.${n}`;
    const id = ++seq.current;
    if (!alive.length) {
      setPackets((p) => [...p, { id, to: null, ip }]);
      setLog(`${ip} → 503, no healthy servers`);
      later(() => setPackets((p) => p.filter((x) => x.id !== id)), 900);
      return;
    }
    let to: number;
    if (algo === 'round-robin') to = alive[rr.current++ % alive.length];
    else if (algo === 'least-conn') {
      const min = Math.min(...alive.map((i) => conns[i]));
      const ties = alive.filter((i) => conns[i] === min);
      to = ties[Math.floor(Math.random() * ties.length)];
    } else to = alive[n % alive.length];

    setPackets((p) => [...p, { id, to, ip }]);
    setLog(`${ip} → Server ${to + 1}`);
    later(() => setPackets((p) => p.filter((x) => x.id !== id)), 1300);
    bump(to, 1);
    setServed((s) => s.map((v, i) => (i === to ? v + 1 : v)));
    later(() => bump(to, -1), 1100 + 1500 + Math.random() * 2500);
  };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(send, 900);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toggle = (i: number) => {
    setUp((u) => u.map((v, j) => (j === i ? !v : v)));
    setLog(up[i] ? `Health check failed: Server ${i + 1} removed from rotation` : `Server ${i + 1} passed health check: back in rotation`);
  };
  const reset = () => { setServed([0, 0, 0]); open.current = [0, 0, 0]; setConns(open.current); rr.current = 0; };
  const current = ALGOS.find((a) => a.key === algo)!;

  return (
    <div class="demo">
      <h3>Load balancer in motion</h3>
      <small>{current.note}</small>
      <svg viewBox="0 0 480 200" style="width:100%;max-width:620px;display:block;margin:8px auto 0" role="group" aria-label="Diagram: a client sends requests to a load balancer, which distributes them across three servers">
        {SY.map((y, i) => (
          <line x1="230" y1="100" x2="370" y2={y} stroke={up[i] ? 'var(--muted)' : RED} stroke-width="1.5" stroke-dasharray={up[i] ? '0' : '4 4'} opacity={up[i] ? 0.6 : 0.5} />
        ))}
        <line x1="70" y1="100" x2="170" y2="100" stroke="var(--muted)" stroke-width="1.5" opacity="0.6" />

        <rect x="10" y="80" width="60" height="40" rx="8" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5" />
        <text x="40" y="104" text-anchor="middle" font-size="12" fill="var(--ink)">Client</text>

        <rect x="170" y="76" width="60" height="48" rx="10" fill="var(--accent)" />
        <text x="200" y="97" text-anchor="middle" font-size="11" font-weight="700" fill="var(--accent-ink)">Load</text>
        <text x="200" y="111" text-anchor="middle" font-size="11" font-weight="700" fill="var(--accent-ink)">balancer</text>

        {SY.map((y, i) => (
          <g tabIndex={0} role="button" aria-pressed={!up[i]} aria-label={`Server ${i + 1}${up[i] ? '' : ' · DOWN'} ${conns[i]} open, ${up[i] ? 'healthy' : 'down'}. Activate to toggle.`} style="cursor:pointer;outline:none" onClick={() => toggle(i)} onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } }}>
            <rect x="370" y={y - 20} width="100" height="40" rx="8" fill="var(--surface)" stroke={up[i] ? 'var(--line)' : RED} stroke-width="1.5" stroke-dasharray={up[i] ? '0' : '4 3'} />
            <rect x="378" y={y + 8} width="84" height="5" rx="2.5" fill="var(--code-bg)" />
            <rect x="378" y={y + 8} width={Math.min(84, conns[i] * 21)} height="5" rx="2.5" fill="var(--accent)" opacity={up[i] ? 1 : 0.2} />
            <text x="378" y={y - 6} font-size="12" font-weight="600" fill={up[i] ? 'var(--ink)' : RED}>Server {i + 1}{up[i] ? '' : ' · DOWN'}</text>{' '}
            <text x="378" y={y + 4} font-size="9" fill="var(--muted)">{conns[i]} open</text>
          </g>
        ))}

        {packets.map((p) => (
          <circle key={p.id} r="5" fill={p.to === null ? RED : 'var(--accent)'}>
            <animateMotion dur={p.to === null ? '0.6s' : '1.1s'} fill="freeze" path={p.to === null ? 'M70,100 L190,100' : `M70,100 L200,100 L370,${SY[p.to]}`} />
          </circle>
        ))}
      </svg>
      <div class="row">
        {ALGOS.map((a) => (
          <button class={a.key === algo ? '' : 'alt'} aria-pressed={a.key === algo} onClick={() => setAlgo(a.key)}>{a.label}</button>
        ))}
      </div>
      <div class="row">
        <button class="alt" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Play'}</button>
        <button class="alt" onClick={send}>Send one</button>
        <button class="alt" onClick={reset}>Reset counts</button>
        <span style="font-size:13px;color:var(--muted)">Served: {served.map((s, i) => `S${i + 1} ${s}`).join(' · ')}</span>
      </div>
      <div class="log">{log}</div>
    </div>
  );
}
