import { useState } from 'react';
import type { UserProgress } from '../lib/types';
import { levelForXp, xpToNextLevel, xpForLevel } from '../lib/xp';

interface Props {
  progress: UserProgress;
  onUpdate: (updates: Partial<UserProgress>) => Promise<void>;
}

export default function StatusPanel({ progress, onUpdate }: Props) {
  const [editingXp, setEditingXp] = useState(false);
  const [editingLevel, setEditingLevel] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [xpInput, setXpInput] = useState('');
  const [levelInput, setLevelInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const currentLevel = levelForXp(progress.current_xp);
  const toNext = xpToNextLevel(progress.current_xp);

  // Progress bar: show progress from start→goal
  const startXp = progress.track_from_level1 ? 0 : xpForLevel(currentLevel);
  const goalXp = xpForLevel(progress.goal_level);
  const range = goalXp - startXp;
  const progressPct = range > 0 ? Math.min(100, Math.max(0, ((progress.current_xp - startXp) / range) * 100)) : 100;

  function startEditXp() {
    setXpInput(String(Math.floor(progress.current_xp)));
    setEditingXp(true);
  }

  function startEditLevel() {
    setLevelInput(String(currentLevel));
    setEditingLevel(true);
  }

  function startEditGoal() {
    setGoalInput(String(progress.goal_level));
    setEditingGoal(true);
  }

  async function saveXp() {
    const val = parseInt(xpInput);
    if (!isNaN(val) && val >= 0) {
      await onUpdate({ current_xp: val, current_level: levelForXp(val) });
    }
    setEditingXp(false);
  }

  async function saveLevel() {
    const val = parseInt(levelInput);
    if (!isNaN(val) && val >= 1 && val <= 99) {
      const newXp = xpForLevel(val);
      await onUpdate({ current_level: val, current_xp: newXp });
    }
    setEditingLevel(false);
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
          {editingLevel ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <input
                type="number"
                min={1}
                max={99}
                value={levelInput}
                onChange={e => setLevelInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveLevel()}
                style={{ width: 60 }}
                autoFocus
              />
              <button className="primary" onClick={saveLevel}>Save</button>
              <button className="ghost" onClick={() => setEditingLevel(false)}>Cancel</button>
            </div>
          ) : (
            <p
              style={{ fontSize: 36, fontFamily: 'Syne', fontWeight: 800, cursor: 'pointer' }}
              className="gold"
              onClick={startEditLevel}
              title="Click to edit level"
            >
              {currentLevel}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="label">Goal Level</p>
          {editingGoal ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
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
              <button className="ghost" onClick={() => setEditingGoal(false)}>Cancel</button>
            </div>
          ) : (
            <p
              style={{ fontSize: 36, fontFamily: 'Syne', fontWeight: 800, cursor: 'pointer' }}
              className="gold"
              onClick={startEditGoal}
              title="Click to edit goal"
            >
              {progress.goal_level}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="label">Prayer XP</span>
          <span className="label">To Level {currentLevel < 99 ? currentLevel + 1 : 99}</span>
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
              <button className="ghost" onClick={() => setEditingXp(false)}>Cancel</button>
            </div>
          ) : (
            <span
              className="xp-number"
              style={{ fontSize: 18, cursor: 'pointer' }}
              onClick={startEditXp}
              title="Click to edit XP"
            >
              {Math.floor(progress.current_xp).toLocaleString()} XP
            </span>
          )}
          <span className="xp-number" style={{ fontSize: 18 }}>
            {toNext > 0 ? `${toNext.toLocaleString()} XP` : 'MAX'}
          </span>
        </div>

        {/* Progress bar toward goal */}
        <div className="progress-bar" style={{ height: 10, borderRadius: 5, marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: `${progressPct}%`, borderRadius: 5 }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="ghost"
            style={{ fontSize: 10, padding: '4px 10px' }}
            onClick={() => onUpdate({ track_from_level1: !progress.track_from_level1 })}
          >
            {progress.track_from_level1 ? 'Tracking: 1' : 'Tracking: ' + currentLevel} → {progress.goal_level}
          </button>
          <span className="label">
            {goalXp.toLocaleString()} XP for goal &middot; {progressPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
