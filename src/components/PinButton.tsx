import { useEffect, useState } from 'preact/hooks';
import { getPins, onChange, togglePin } from '../store';

export default function PinButton({ id }: { id: string }) {
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const sync = () => setPinned(getPins().includes(id));
    sync();
    return onChange(sync);
  }, [id]);
  return (
    <button class={`pinbtn${pinned ? ' on' : ''}`} aria-pressed={pinned} onClick={() => togglePin(id)} title={pinned ? 'Unpin this sheet' : 'Pin this sheet'}>
      {pinned ? '★ Pinned' : '☆ Pin'}
    </button>
  );
}
