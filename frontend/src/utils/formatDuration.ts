export function formatDuration(seconds: number | undefined | null): string {
  if (seconds == null || seconds <= 0 || !Number.isFinite(seconds)) {
    return '';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
