import { useState, useEffect, useCallback } from 'react';
import { kvStore } from '../utils/kvStore';

const STORAGE_KEY = 'vibrate_enabled';

export function useVibrateEnabled(): [boolean, (enabled: boolean) => void] {
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  useEffect(() => {
    const stored = kvStore.get(STORAGE_KEY);
    if (stored !== null) setVibrateEnabled(stored === 'true');
  }, []);

  const setVibrate = useCallback((enabled: boolean) => {
    setVibrateEnabled(enabled);
    kvStore.set(STORAGE_KEY, String(enabled));
  }, []);

  return [vibrateEnabled, setVibrate];
}
