import { useState } from 'react';
import type { HistoryEntry } from '../lib/types';

interface Props {
  entries: HistoryEntry[];
  onDelete: (id: number) => Promise<void>;
}

export default function History({ entries, onDelete }: Props) {
  const [confirmId, setConfirmId] = useState<number | null>(null);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="panel">
      <h3 style={{ fontSize: 14, marginBottom: 12 }}>History</h3>
      {entries.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20 }} className="mono">
          No entries yet
        </p>
      ) : (
        <div style={{ maxHeight: 350, overflowY: 'auto' }}>
          {entries.map(entry => (
            <div
              key={entry.id}
              className="panel-inner"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'DM Mono',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: entry.action === 'gained' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(201, 162, 39, 0.15)',
                      color: entry.action === 'gained' ? 'var(--green)' : 'var(--gold)',
                    }}
                  >
                    {entry.action}
                  </span>
                  <span style={{ fontSize: 13 }}>{entry.prayer_bones?.name}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    ×{entry.quantity}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                  <span className="xp-number">+{Math.floor(entry.total_xp).toLocaleString()} xp</span>
                  <span style={{ color: 'var(--text-dim)' }}>
                    {entry.prayer_modifiers?.name || 'Standard'}
                  </span>
                  <span style={{ color: 'var(--text-dim)' }}>{formatDate(entry.created_at)}</span>
                </div>
              </div>
              <div>
                {confirmId === entry.id ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="destructive"
                      onClick={() => { onDelete(entry.id); setConfirmId(null); }}
                      style={{ padding: '4px 8px', fontSize: 10 }}
                    >
                      Yes
                    </button>
                    <button
                      className="ghost"
                      onClick={() => setConfirmId(null)}
                      style={{ padding: '4px 8px', fontSize: 10 }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    className="ghost"
                    onClick={() => setConfirmId(entry.id)}
                    style={{ padding: '4px 8px', fontSize: 10 }}
                  >
                    Del
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
