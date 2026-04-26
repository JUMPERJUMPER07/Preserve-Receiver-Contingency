import { useCallback, useRef } from 'react';

type SoundType = 'receive' | 'link' | 'error';

export function useSound(enabled: boolean = true) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback((type: SoundType = 'receive') => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'receive') {
        // Two ascending notes: soft beep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.setValueAtTime(1100, now + 0.08);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
      } else if (type === 'link') {
        // Short success chime
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, now);
        oscillator.frequency.setValueAtTime(880, now + 0.08);
        oscillator.frequency.setValueAtTime(1100, now + 0.16);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      } else if (type === 'error') {
        // Low warning tone
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
      }
    } catch {
      // Audio not available
    }
  }, [enabled, getCtx]);

  return { play };
}
