import { useEffect, useState } from 'preact/hooks';

export default function TokenBucket({ capacity = 5, refillPerSec = 1 }: { capacity?: number; refillPerSec?: number }) {
  const [tokens, setTokens] = useState(capacity);
  const [log, setLog] = useState('Fire a request to spend a token.');

  useEffect(() => {
    const t = setInterval(() => setTokens((n) => Math.min(capacity, n + refillPerSec / 5)), 200);
    return () => clearInterval(t);
  }, [capacity, refillPerSec]);

  const send = () => {
    if (tokens >= 1) { setTokens(tokens - 1); setLog('✓ 200 OK, token spent'); }
    else setLog('✗ 429 Too Many Requests, bucket empty');
  };
  const burst = () => {
    let n = tokens, ok = 0;
    for (let i = 0; i < 10; i++) if (n >= 1) { n--; ok++; }
    setTokens(n); setLog(`Burst of 10: ${ok} allowed, ${10 - ok} rejected`);
  };

  return (
    <div class="demo">
      <h4>Token bucket simulator</h4>
      <small>Capacity {capacity} · refills {refillPerSec}/sec</small>
      <div class="bucket"><i style={{ width: `${(tokens / capacity) * 100}%` }} /></div>
      <div class="row">
        <button onClick={send}>Send request</button>
        <button class="alt" onClick={burst}>Burst ×10</button>
        <span>{tokens.toFixed(1)} tokens</span>
      </div>
      <div class="log" aria-live="polite">{log}</div>
    </div>
  );
}
