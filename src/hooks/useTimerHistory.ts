import { useState, useCallback, useEffect } from 'react';
import { kvStore } from '../utils/kvStore';

const STORAGE_KEY = 'timer_history';

export interface TimerHistoryEntry {
  id: string;
  durationSeconds: number;
}

export interface TimerHistoryActions {
  add: (durationSeconds: number) => void;
  remove: (id: string) => void;
}

export function useTimerHistory(): [TimerHistoryEntry[], TimerHistoryActions] {
  const [entries, setEntries] = useState<TimerHistoryEntry[]>([]);

  // Load from storage on mount
  useEffect(() => {
    const raw = kvStore.get(STORAGE_KEY);
    if (raw) {
      try { setEntries(JSON.parse(raw)); } catch {}
    }
  }, []);

  // Persist whenever entries change
  const persist = useCallback((next: TimerHistoryEntry[]) => {
    setEntries(next);
    kvStore.set(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback(
    (durationSeconds: number) => {
      if (durationSeconds <= 0) return;
      // Don't add duplicates
      const exists = entries.some((e) => e.durationSeconds === durationSeconds);
      if (exists) return;

      const entry: TimerHistoryEntry = {
        id: `${Date.now()}_${durationSeconds}`,
        durationSeconds,
      };
      // Insert sorted by duration ascending
      const next = [...entries, entry].sort(
        (a, b) => a.durationSeconds - b.durationSeconds
      );
      persist(next);
    },
    [entries, persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist]
  );

  return [entries, { add, remove }];
}
