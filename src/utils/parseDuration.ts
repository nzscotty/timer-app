/**
 * Parse a human-friendly duration string into total seconds.
 *
 * Supported formats:
 *   "90"       → 90 minutes
 *   "1:30"     → 1 hour 30 minutes
 *   "1h30m"    → 1 hour 30 minutes
 *   "1h 30m"   → 1 hour 30 minutes
 *   "45m"      → 45 minutes
 *   "2h"       → 2 hours
 *   "30s"      → 30 seconds
 *   "1h30m15s" → 1 hour 30 minutes 15 seconds
 *
 * Returns null if the input cannot be parsed.
 */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Format: "H:MM" or "HH:MM" (colon or full stop as separator)
  const colonMatch = trimmed.match(/^(\d{1,2})[:.](\d{1,2})$/);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10);
    const minutes = parseInt(colonMatch[2], 10);
    if (minutes >= 60) return null;
    return (hours * 60 + minutes) * 60;
  }

  // Format: combination of Xh Xm Xs
  const hmsMatch = trimmed.match(
    /^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?$/i
  );
  if (hmsMatch && (hmsMatch[1] || hmsMatch[2] || hmsMatch[3])) {
    const hours = parseInt(hmsMatch[1] || '0', 10);
    const minutes = parseInt(hmsMatch[2] || '0', 10);
    const seconds = parseInt(hmsMatch[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Format: plain number → treat as minutes
  const numMatch = trimmed.match(/^(\d+)$/);
  if (numMatch) {
    const minutes = parseInt(numMatch[1], 10);
    if (minutes <= 0) return null;
    return minutes * 60;
  }

  return null;
}

/** Format total seconds into a human-friendly string like "1h 30m" */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0m';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '0m';
}

/** Format total seconds into MM:SS or HH:MM:SS countdown display */
export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

/** Get the clock time at which the timer will complete */
export function getEndTime(totalSeconds: number): string {
  const end = new Date(Date.now() + totalSeconds * 1000);
  return end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
