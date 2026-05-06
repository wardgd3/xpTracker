const XP_TABLE: number[] = [0];

for (let level = 1; level < 99; level++) {
  let xp = 0;
  for (let l = 1; l < level + 1; l++) {
    xp += Math.floor(l + 300 * Math.pow(2, l / 7));
  }
  XP_TABLE.push(Math.floor(xp / 4));
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > 99) return XP_TABLE[98];
  return XP_TABLE[level - 1];
}

export function levelForXp(xp: number): number {
  for (let i = 98; i >= 0; i--) {
    if (xp >= XP_TABLE[i]) return i + 1;
  }
  return 1;
}

export function xpToNextLevel(currentXp: number): number {
  const currentLevel = levelForXp(currentXp);
  if (currentLevel >= 99) return 0;
  return xpForLevel(currentLevel + 1) - currentXp;
}

export function progressToNextLevel(currentXp: number): number {
  const currentLevel = levelForXp(currentXp);
  if (currentLevel >= 99) return 100;
  const levelStart = xpForLevel(currentLevel);
  const levelEnd = xpForLevel(currentLevel + 1);
  return ((currentXp - levelStart) / (levelEnd - levelStart)) * 100;
}
