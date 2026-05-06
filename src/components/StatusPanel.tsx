import { useState } from 'react';
import type { UserProgress } from '../lib/types';
import { levelForXp, xpToNextLevel, progressToNextLevel, xpForLevel } from '../lib/xp';

interface Props {
  progress: UserProgress;
  onUpdate: (updates: Partial<UserProgress>) => Promise<void>;
}

export default function StatusPanel({ progress, onUpdate }: Props) {
  const [editingXp, setEditingXp] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [xpInput, setXpInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const currentLevel = levelForXp(progress.current_xp);
  const toNext = xpToNextLevel(progress.current_xp);
  const progressPct = progressToNextLevel(progress.current_xp);

  function startEditXp() {
    setXpInput(String(Math.floor(progress.current_xp)));
    setEditingXp(true);
  }

  function startEditGoal() {
    setGoalInput(String(progress.goal_level));
    setEditingGoal(true);
  }

  async function saveXp() {
    const val = parseInt(xpInput);
    if (!isNaN(val) && val >= 0) {
      await onUpdate({ current_xp: val });
    }
    setEditingXp(false);
  }

  async function saveGoal() {
    const val = parseInt(goalInput);
    if (!isNaN(val) && val >= 1 && val <= 99) {
      await onUpdate({ goal_level: val });
    }
    setEditingGoal(false);
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p className="label">Current Level</p>
          <p style={{ fontSize: 36, fontFamily: 'Syne', fontWeight: 800 }} className="gold">
            {currentLevel}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="label">Goal Level</p>
          {editingGoal ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                min={1}
                max={99}
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveGoal()}
                style={{ width: 60 }}
                autoFocus
              />
              <button className="primary" onClick={saveGoal}>Save</button>
            </div>
          ) : (
            <p
              style={{ fontSize: 36, fontFamily: 'Syne', fontWeight: 800, cursor: 'pointer' }}
              className="gold"
              onClick={startEditGoal}
              title="Click to edit"
            >
              {progress.goal_level}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="label">Prayer XP</span>
          <span className="label">To Level {currentLevel + 1}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {editingXp ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                min={0}
                value={xpInput}
                onChange={e => setXpInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveXp()}
                style={{ width: 120 }}
                autoFocus
              />
              <button className="primary" onClick={saveXp}>Save</button>
            </div>
          ) : (
            <span
              className="xp-number"
              style={{ fontSize: 18, cursor: 'pointer' }}
              onClick={startEditXp}
              title="Click to edit"
            >
              {Math.floor(progress.current_xp).toLocaleString()} XP
            </span>
          )}
          <span className="xp-number" style={{ fontSize: 18 }}>
            {toNext > 0 ? `${toNext.toLocaleString()} XP` : 'MAX'}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="label" style={{ marginTop: 6, textAlign: 'right' }}>
          {xpForLevel(progress.goal_level).toLocaleString()} XP needed for goal
        </p>
      </div>
    </div>
  );
}
