import { useState, useEffect, useCallback } from 'react';
import { kvStore } from '../utils/kvStore';
import { AlarmSoundId, DEFAULT_SOUND_ID } from '../utils/alarmSounds';

const STORAGE_KEY = 'alarm_sound_id';

export function useAlarmSound(): [AlarmSoundId, (id: AlarmSoundId) => Promise<void>] {
  const [soundId, setSoundId] = useState<AlarmSoundId>(DEFAULT_SOUND_ID);

  useEffect(() => {
    const stored = kvStore.get(STORAGE_KEY);
    if (stored) setSoundId(stored as AlarmSoundId);
  }, []);

  const setSound = useCallback(async (id: AlarmSoundId) => {
    setSoundId(id);
    kvStore.set(STORAGE_KEY, id);
  }, []);

  return [soundId, setSound];
}
