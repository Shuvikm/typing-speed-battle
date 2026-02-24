import { useRef, useCallback } from 'react';

const MUTE_KEY = 'tsb_mute';

const isMuted = () => {
    try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return false; }
};

/**
 * useSounds — Web Audio API typing sound effects.
 * Uses lazy AudioContext initialisation so it obeys browser autoplay policies.
 *
 * Returns:
 *   playTick()      — soft blip on correct keypress
 *   playError()     — low thud on wrong keypress
 *   playCombo(n)    — short ascending arpeggio on combo milestone (n = combo level)
 */
const useSounds = () => {
    const ctxRef = useRef(null);

    const getCtx = useCallback(() => {
        if (!ctxRef.current) {
            try {
                ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch {
                return null;
            }
        }
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume();
        }
        return ctxRef.current;
    }, []);

    const beep = useCallback((freq, type, duration, gainVal, delay = 0) => {
        if (isMuted()) return;
        const ctx = getCtx();
        if (!ctx) return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration + 0.01);
        } catch { /* fail silently */ }
    }, [getCtx]);

    const playTick = useCallback(() => {
        beep(880, 'sine', 0.04, 0.06);
    }, [beep]);

    const playError = useCallback(() => {
        beep(140, 'sawtooth', 0.12, 0.09);
    }, [beep]);

    const playCombo = useCallback((level = 1) => {
        // Ascending arpeggio — higher combo = higher starting pitch
        const base = 440 + level * 60;
        const notes = [base, base * 1.25, base * 1.5];
        notes.forEach((freq, i) => {
            beep(freq, 'triangle', 0.12, 0.08, i * 0.07);
        });
    }, [beep]);

    return { playTick, playError, playCombo };
};

export default useSounds;
