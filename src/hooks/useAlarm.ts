import { useRef, useCallback, useEffect, useState } from 'react';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'alarm';
const CATEGORY_ID = 'alarm';
const DISMISS_ACTION = 'dismiss';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // audio handled by expo-av
    shouldSetBadge: false,
  }),
});

export function useAlarm() {
  const soundRef = useRef<AudioPlayer | null>(null);
  const notifIdRef = useRef<string | null>(null);
  const [isAlarming, setIsAlarming] = useState(false);

  // Set up Android alarm channel and notification category with Dismiss action
  useEffect(() => {
    Notifications.requestPermissionsAsync();

    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Alarm',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 500, 500, 500],
      bypassDnd: true,
    });

    Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
      {
        identifier: DISMISS_ACTION,
        buttonTitle: 'Dismiss',
        options: {
          isDestructive: true,
          opensAppToForeground: false,
        },
      },
    ]);
  }, []);

  const dismissAlarm = useCallback(async () => {
    setIsAlarming(false);
    if (soundRef.current) {
      try {
        soundRef.current.pause();
        soundRef.current.remove();
      } catch (_) {}
      soundRef.current = null;
    }
    if (notifIdRef.current) {
      try {
        await Notifications.dismissNotificationAsync(notifIdRef.current);
      } catch (_) {}
      notifIdRef.current = null;
    }
  }, []);

  const triggerAlarm = useCallback(async () => {
    setIsAlarming(true);
    // Play alarm sound on loop
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });
      const player = createAudioPlayer(require('../../assets/audio/alarm.mp3'));
      player.loop = true;
      player.play();
      soundRef.current = player;
    } catch (e) {
      console.warn('useAlarm: failed to play sound', e);
    }

    // Show persistent notification with Dismiss button
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Timer finished!',
          body: 'Tap Dismiss to stop the alarm.',
          categoryIdentifier: CATEGORY_ID,
          autoDismiss: false,
          sticky: true,
        },
        trigger: { channelId: CHANNEL_ID },
      });
      notifIdRef.current = id;
    } catch (e) {
      console.warn('useAlarm: failed to schedule notification', e);
    }
  }, []);

  // Stop alarm when user taps Dismiss action or the notification itself
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { actionIdentifier } = response;
        if (
          actionIdentifier === DISMISS_ACTION ||
          actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
        ) {
          dismissAlarm();
        }
      }
    );
    return () => sub.remove();
  }, [dismissAlarm]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      try { soundRef.current?.pause(); soundRef.current?.remove(); } catch (_) {}
    };
  }, []);

  return { triggerAlarm, dismissAlarm, isAlarming };
}
