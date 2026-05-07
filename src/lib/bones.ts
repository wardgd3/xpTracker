import type { BankedBone, HistoryEntry } from './types';

/** Get the display name from a banked bone or history entry */
export function getBoneName(entry: BankedBone | HistoryEntry): string {
  return entry.prayer_bones?.name || entry.custom_bones?.name || 'Unknown';
}

/** Get the base XP from a banked bone or history entry */
export function getBoneXp(entry: BankedBone | HistoryEntry): number {
  return entry.prayer_bones?.base_xp || entry.custom_bones?.base_xp || 0;
}
