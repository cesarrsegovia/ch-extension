/** Shared utility functions. */

export function formatMatchTime(dateStr?: string | Date, locale: string = 'en'): string {
  if (!dateStr) return '0.0';
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '0.0';
  }
}

/** Returns the localized date label for grouping matches (Today, Tomorrow, or full date). */
export function getDateLabel(
  dateStr: string,
  todayLabel: string,
  tomorrowLabel: string,
  unknownLabel: string,
): string {
  if (!dateStr) return unknownLabel;

  const matchDate = new Date(dateStr).toLocaleDateString([], {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const today = new Date().toLocaleDateString([], {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const tomorrow = new Date(Date.now() + 86_400_000).toLocaleDateString([], {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  if (matchDate === today) return todayLabel;
  if (matchDate === tomorrow) return tomorrowLabel;
  return matchDate;
}
