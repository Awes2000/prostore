/**
 * Format a date for display
 * @param date - Date object or timestamp to format
 * @returns Formatted date string (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).replace(',', ' at');
}

/**
 * Format a date for display (short format without time)
 * @param date - Date object or timestamp to format
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDateShort(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
