/**
 * Shorten a UUID for display purposes
 * Takes a full UUID and returns a shortened version with first 8 and last 8 characters
 * @param id - The full UUID string to shorten
 * @returns Shortened ID in format "first8...last8"
 * @example shortenId("550e8400-e29b-41d4-a716-446655440000") => "550e8400...55440000"
 */
export function shortenId(id: string): string {
  if (!id || id.length < 16) {
    return id || '';
  }

  const first = id.slice(0, 8);
  const last = id.slice(-8);

  return `${first}...${last}`;
}
