export interface Bone {
  id: number;
  name: string;
  base_xp: number;
}

export interface Modifier {
  id: number;
  name: string;
  multiplier: number;
  description: string | null;
}

export interface BankedBone {
  id: number;
  bone_id: number;
  quantity: number;
  created_at: string;
  prayer_bones?: Bone;
}

export interface HistoryEntry {
  id: number;
  bone_id: number;
  quantity: number;
  modifier_id: number | null;
  action: 'banked' | 'gained';
  total_xp: number;
  note: string | null;
  created_at: string;
  prayer_bones?: Bone;
  prayer_modifiers?: Modifier | null;
}

export interface UserProgress {
  id: number;
  current_xp: number;
  goal_level: number;
  updated_at: string;
}
