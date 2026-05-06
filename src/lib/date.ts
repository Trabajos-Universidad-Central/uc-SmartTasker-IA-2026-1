export function isYYYYMMDD(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

export function parseLocalDate(date: Date | string | undefined | null): Date | null {
  if (!date) return null;

  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }

  const trimmed = date.trim();
  if (!trimmed) return null;

  const dateStr = isYYYYMMDD(trimmed) ? `${trimmed}T00:00:00` : trimmed;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateToYYYYMMDD(date: Date | string | undefined | null): string | null {
  const parsed = parseLocalDate(date);
  if (!parsed) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
