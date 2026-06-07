import { SongItem } from '../types/Song';

/**
 * Parse a comma-separated userIds string from the URL into a deduplicated array.
 * e.g. "Alice,Bob,Bob" -> ["Alice", "Bob"]
 */
export function parseUserIds(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(',')
        .map(u => u.trim())
        .filter(Boolean)
    )
  );
}

/**
 * Build a URL-safe comma-separated string from a selected users array (deduped + sorted).
 * e.g. ["Bob", "Alice"] -> "Alice,Bob"
 */
export function buildUserIdsPath(selected: string[]): string {
  return Array.from(new Set(selected))
    .filter(Boolean)
    .sort()
    .join(',');
}

/**
 * Extract unique user names from a specific field (Singer or Player) across all songs.
 */
export function extractUsersFromSongs(
  songs: SongItem[],
  field: 'Singer' | 'Player' | 'User'
): string[] {
  const set = new Set<string>();
  songs.forEach(song => {
    const fields: ('Singer' | 'Player')[] = 
      field === 'User' ? ['Singer', 'Player'] : [field as 'Singer' | 'Player'];

    fields.forEach(f => {
      const raw = song[f]?.text?.trim();
      if (raw) {
        raw.split(/[,、]/).map(u => u.trim()).filter(Boolean).forEach(u => set.add(u));
      }
    });
  });
  return Array.from(set).sort();
}

/**
 * Toggle a user in/out of the selected set and return the new set.
 * Deduplicates automatically.
 */
export function toggleUser(current: string[], userId: string): string[] {
  const set = new Set(current);
  if (set.has(userId)) {
    set.delete(userId);
  } else {
    set.add(userId);
  }
  return Array.from(set);
}
