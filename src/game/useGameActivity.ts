import { useEffect,useRef,useState } from 'react';

export function useGameActivity(enabled: boolean, onPause: () => void) {
  const [visible, setVisible] = useState(!document.hidden);
  const [manualPause, setManualPause] = useState(false);
  const active = enabled && visible && !manualPause;
  const activeRef = useRef(active);
  activeRef.current = active;
  const pauseRef = useRef(onPause);
  pauseRef.current = onPause;

  useEffect(() => {
    const updateVisibility = () => setVisible(!document.hidden);
    const blur = () => { setManualPause(true); pauseRef.current(); };
    document.addEventListener('visibilitychange', updateVisibility);
    window.addEventListener('blur', blur);
    return () => {
      document.removeEventListener('visibilitychange', updateVisibility);
      window.removeEventListener('blur', blur);
    };
  }, []);
  useEffect(() => { if (!active) pauseRef.current(); }, [active]);
  return { active, activeRef, manualPause, setManualPause };
}
