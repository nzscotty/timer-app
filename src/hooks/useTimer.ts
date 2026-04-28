import { useState, useRef, useCallback, useEffect } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  /** Total duration set by the user (seconds) */
  durationSeconds: number;
  /** Seconds remaining in the countdown */
  remainingSeconds: number;
  /** Current status */
  status: TimerStatus;
  /** The Date.now() timestamp when the timer will finish (null if not running) */
  endTimestamp: number | null;
}

export interface TimerActions {
  /** Set the duration (only when idle or paused). Resets remaining to match. */
  setDuration: (seconds: number) => void;
  /** Adjust duration by a delta (works in all states). */
  adjustDuration: (deltaSeconds: number) => void;
  /** Start or resume the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset to idle with the current duration */
  reset: () => void;
  /** Cancel and clear everything */
  cancel: () => void;
}

export function useTimer(): [TimerState, TimerActions] {
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const remaining = Math.max(0, Math.round((endRef.current - now) / 1000));
    setRemainingSeconds(remaining);

    if (remaining <= 0) {
      clearTimer();
      setStatus('idle');
      setEndTimestamp(null);
    }
  }, [clearTimer]);

  const setDuration = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.round(seconds));
      setDurationSeconds(clamped);
      if (status === 'idle') {
        setRemainingSeconds(clamped);
      }
    },
    [status]
  );

  const adjustDuration = useCallback(
    (deltaSeconds: number) => {
      setDurationSeconds((prev) => {
        const newDur = Math.max(0, prev + deltaSeconds);
        return newDur;
      });
      if (status === 'idle') {
        setRemainingSeconds((prev) => Math.max(0, prev + deltaSeconds));
      } else if (status === 'paused') {
        setRemainingSeconds((prev) => Math.max(0, prev + deltaSeconds));
      } else if (status === 'running') {
        // Shift the end timestamp
        const delta = deltaSeconds * 1000;
        endRef.current = Math.max(Date.now(), endRef.current + delta);
        setEndTimestamp(endRef.current);
        setRemainingSeconds((prev) => Math.max(0, prev + deltaSeconds));
      }
    },
    [status]
  );

  const start = useCallback(() => {
    const secsToUse =
      status === 'paused' ? remainingSeconds : durationSeconds;
    if (secsToUse <= 0) return;

    clearTimer();

    const end = Date.now() + secsToUse * 1000;
    endRef.current = end;
    setEndTimestamp(end);
    setRemainingSeconds(secsToUse);
    setStatus('running');

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.round((endRef.current - now) / 1000)
      );
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearTimer();
        setStatus('idle');
        setEndTimestamp(null);
      }
    }, 200);
  }, [status, remainingSeconds, durationSeconds, clearTimer]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    clearTimer();
    setStatus('paused');
    setEndTimestamp(null);
  }, [status, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setRemainingSeconds(durationSeconds);
    setStatus('idle');
    setEndTimestamp(null);
  }, [durationSeconds, clearTimer]);

  const cancel = useCallback(() => {
    clearTimer();
    setDurationSeconds(0);
    setRemainingSeconds(0);
    setStatus('idle');
    setEndTimestamp(null);
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  return [
    { durationSeconds, remainingSeconds, status, endTimestamp },
    { setDuration, adjustDuration, start, pause, reset, cancel },
  ];
}
