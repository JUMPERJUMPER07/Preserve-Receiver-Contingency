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
      const now = ctx.currentTime;

      if (type === 'receive') {
        // Two ascending notes: soft beep
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1100, now + 0.08);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
        gain.gain.linearRampToValueAtTime(0, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.25);

      } else if (type === 'error') {
        // Low warning buzz
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.08);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);

      } else if (type === 'link') {
        // ── Rich 3-note ascending success chime: C5 → E5 → G5 ──
        // Each note = fundamental sine + shimmer octave above
        const notes = [
          { freq: 523.25, delay: 0 },
          { freq: 659.25, delay: 0.13 },
          { freq: 783.99, delay: 0.26 },
        ];

        notes.forEach(({ freq, delay }) => {
          const t = now + delay;

          // Fundamental
          const osc1  = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(freq, t);
          gain1.gain.setValueAtTime(0, t);
          gain1.gain.linearRampToValueAtTime(0.14, t + 0.015);
          gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(t);
          osc1.stop(t + 0.7);

          // Shimmer (octave up, softer)
          const osc2  = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq * 2, t);
          gain2.gain.setValueAtTime(0, t);
          gain2.gain.linearRampToValueAtTime(0.045, t + 0.015);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t);
          osc2.stop(t + 0.5);
        });
      }
    } catch {
      // Audio API not available
    }
  }, [enabled, getCtx]);

  return { play };
}
