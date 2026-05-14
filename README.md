# Timer App

A clean, intuitive timer application built with React Native and Expo. Set a timer the way that feels most natural to you — type a duration, slide to select, or pick a target time.

## Features

### Three Ways to Set a Timer

**1. Duration Input (Keyboard)**
Type a duration using natural shorthand:
- `30` → 30 minutes
- `1:30` → 1 hour 30 minutes
- `1h30m` → 1 hour 30 minutes
- `45m` → 45 minutes
- `2h` → 2 hours

**2. Slider with Adaptive Steps**
A slider from 1 minute to 2 hours with smart step buttons that adapt to where you are on the scale:
| Range | Button Step |
|-------|------------|
| 1–5 min | ±1 min |
| 5–15 min | ±5 min |
| 15–60 min | ±15 min |
| 60–120 min | ±30 min |

This gives you fine-grained control for short timers and fast jumps for longer ones.

**3. Target Time (Clock)**
Pick an absolute time (e.g. 2:30 PM) using hour/minute selectors with AM/PM toggle. The app calculates how long from now and sets the timer automatically. If you pick a time that's already passed today, it targets tomorrow.

### Always-On Display
- The timer display is **always visible** at the top of the screen
- Shows the countdown time and a progress ring
- Previews the duration **before** you start — interact with any input and the display updates instantly
- Shows **when the timer will ring** (e.g. "Will ring at 3:45 PM")
- During countdown: remaining time, ring progress, and ring time all update live

### Quick Pick Chips
Horizontal scrollable row of common durations: 1m, 5m, 10m, 15m, 25m (pomodoro), 30m, 45m, 1h, 90m, 2h.

### Timer Controls
- **Play** — start the timer
- **Pause / Resume** — pause and resume without losing progress
- **Reset** — reset to the configured duration
- **Stop** — cancel and clear

## Tech Stack

- **React Native** with **Expo SDK 55**
- **TypeScript**
- **React Native Paper** — Material Design 3 components
- **twrnc** — Tailwind CSS utility styles for React Native
- **react-native-svg** — circular progress ring
- **@react-native-community/slider** — native slider component
- Dark mode support (follows system preference)

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npx expo`)
- Android Studio (for Android emulator) or Expo Go app on a physical device

### Install & Run

```bash
# Install dependencies
npm install

# Start the Expo dev server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```

## Building & Releasing (Android)

Builds are handled by [EAS Build](https://docs.expo.dev/build/introduction/). You'll need an Expo account and the EAS CLI:

```bash
npm install -g eas-cli
eas login
```

### Preview APK (side-loadable, for testing)

```bash
npm run build:preview
```

Produces a `.apk` you can install directly on any Android device. The download link is printed at the end of the build.

### Production AAB (Play Store)

```bash
npm run build:production
```

Produces an `.aab` (Android App Bundle) ready for submission to the Play Store.

> **Keystore:** EAS generates and securely stores your signing keystore on the first production build. Do not lose access to your Expo account.

### Submit to Play Store

```bash
npm run submit:android
```

Requires a Google Play API service account key saved as `google-play-key.json` in the project root (already in `.gitignore`). Submits to the **internal testing** track by default — promote it to production from the Play Console.

### Incrementing the version

Before each new release, bump `version` (user-visible) and `android.versionCode` (must be a strictly increasing integer) in `app.json`:

```json
"version": "1.0.1",
"android": {
  "versionCode": 2
}
```

### Project Structure

```
timer-app/
├── App.tsx                          # Root component — wires everything together
├── src/
│   ├── components/
│   │   ├── TimerDisplay.tsx         # Always-visible countdown + progress ring
│   │   ├── ModeSelector.tsx         # Segmented button: Duration | Slider | Time
│   │   ├── DurationInput.tsx        # Mode 1: text-based duration entry
│   │   ├── SliderStepper.tsx        # Mode 2: slider + adaptive step buttons
│   │   ├── TimePickerMode.tsx       # Mode 3: target time picker (HH:MM AM/PM)
│   │   └── QuickPickChips.tsx       # Preset duration chips
│   ├── hooks/
│   │   └── useTimer.ts             # Timer state machine (idle/running/paused)
│   ├── utils/
│   │   └── parseDuration.ts        # Duration parsing, formatting, end-time calc
│   └── theme.ts                    # Material Design 3 light/dark color tokens
├── app.json                        # Expo configuration
└── package.json
```

## Platform Support

| Platform | Status |
|----------|--------|
| Android  | ✅ Primary target |
| iOS      | ✅ Supported |
| Web      | ⚠️ Basic (Expo web) |

## License

MIT
