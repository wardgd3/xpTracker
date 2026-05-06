import type { UserProgress } from '../lib/types';
import { xpForLevel } from '../lib/xp';

interface Props {
  progress: UserProgress;
  bankedXp: number;
}

export default function GoalProgress({ progress, bankedXp }: Props) {
  const goalXp = xpForLevel(progress.goal_level);
  const currentXp = progress.current_xp;
  const projectedXp = currentXp + bankedXp;

  const xpNeeded = Math.max(0, goalXp - currentXp);
  const xpGap = Math.max(0, goalXp - projectedXp);
  const pctReached = goalXp > 0 ? Math.min(100, (projectedXp / goalXp) * 100) : 100;

  const currentPct = goalXp > 0 ? Math.min(100, (currentXp / goalXp) * 100) : 100;
  const bankedPct = goalXp > 0 ? Math.min(100 - currentPct, (bankedXp / goalXp) * 100) : 0;

  return (
    <div className="panel">
      <h3 style={{ fontSize: 14, marginBottom: 12 }}>Goal Progress → Level {progress.goal_level}</h3>

      <div style={{ position: 'relative', width: '100%', height: 20, background: 'var(--surface3)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${currentPct}%`,
            background: 'var(--gold)',
            borderRadius: '10px 0 0 10px',
            transition: 'width 0.3s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${currentPct}%`,
            top: 0,
            height: '100%',
            width: `${bankedPct}%`,
            background: 'var(--gold-dim)',
            opacity: 0.6,
            transition: 'width 0.3s, left 0.3s',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="label">XP Needed</p>
          <p className="xp-number">{Math.floor(xpNeeded).toLocaleString()}</p>
        </div>
        <div>
          <p className="label">Gap After Bank</p>
          <p className="xp-number" style={{ color: xpGap === 0 ? 'var(--green)' : undefined }}>
            {xpGap === 0 ? 'Goal reached!' : Math.floor(xpGap).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="label">% If Burned</p>
          <p className="xp-number">{pctReached.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
