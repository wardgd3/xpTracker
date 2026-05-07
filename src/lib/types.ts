export interface Bone {
  id: number;
  name: string;
  base_xp: number;
}

export interface CustomBone {
  id: number;
  user_id: string;
  name: string;
  base_xp: number;
  created_at: string;
}

/** Unified bone item — either a built-in prayer_bone or a user custom_bone */
export interface UnifiedBone {
  id: number;
  name: string;
  base_xp: number;
  source: 'builtin' | 'custom';
}

export interface Modifier {
  id: number;
  name: string;
  multiplier: number;
  description: string | null;
}

export interface BankedBone {
  id: number;
  bone_id: number | null;
  custom_bone_id: number | null;
  quantity: number;
  created_at: string;
  user_id: string;
  prayer_bones?: Bone | null;
  custom_bones?: CustomBone | null;
}

export interface HistoryEntry {
  id: number;
  bone_id: number | null;
  custom_bone_id: number | null;
  quantity: number;
  modifier_id: number | null;
  action: 'banked' | 'gained';
  total_xp: number;
  note: string | null;
  created_at: string;
  user_id: string;
  prayer_bones?: Bone | null;
  custom_bones?: CustomBone | null;
  prayer_modifiers?: Modifier | null;
}

export interface UserProgress {
  id: number;
  current_xp: number;
  current_level: number;
  goal_level: number;
  track_from_level1: boolean;
  updated_at: string;
  user_id: string;
}
