// Static require map — bundler needs literal require() calls, no dynamic paths.
export type AlarmSoundId = "alarm" | "yo-tu-i-wish" | "yo-tu-stars";

export interface AlarmSound {
  id: AlarmSoundId;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any;
}

export const ALARM_SOUNDS: AlarmSound[] = [
  {
    id: "yo-tu-stars",
    label: "Stars",
    source: require("../../assets/audio/yo-tu-stars-looping-tune.mp3"),
  },
  {
    id: "alarm",
    label: "Ring",
    source: require("../../assets/audio/alarm.mp3"),
  },
  {
    id: "yo-tu-i-wish",
    label: "I Wish",
    source: require("../../assets/audio/yo-tu-i-wish-looping-tune.mp3"),
  },
];

export const DEFAULT_SOUND_ID: AlarmSoundId = "alarm";

export function getSoundById(id: AlarmSoundId): AlarmSound {
  return ALARM_SOUNDS.find((s) => s.id === id) ?? ALARM_SOUNDS[0];
}
