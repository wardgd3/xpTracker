import { useState } from 'react';
import type { BankedBone, Modifier } from '../lib/types';
import { getBoneName, getBoneXp } from '../lib/bones';

interface Props {
  bankedBones: BankedBone[];
  activeModifier: Modifier | null;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, quantity: number) => Promise<void>;
  onBurnAll: () => Promise<void>;
  bankedXp: number;
}

export default function BankedBones({ bankedBones, activeModifier, onDelete, onUpdate, onBurnAll, bankedXp }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');
  const [confirmBurn, setConfirmBurn] = useState(false);

  const mult = activeModifier?.multiplier || 1;

  async function handleSaveEdit(id: number) {
    const qty = parseInt(editQty);
    if (!isNaN(qty) && qty > 0) {
      await onUpdate(id, qty);
    }
    setEditingId(null);
  }

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 14 }}>Banked Bones</h3>
        <span className="xp-number" style={{ fontSize: 16 }}>
          {Math.floor(bankedXp).toLocaleString()} XP
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 350 }}>
        {bankedBones.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20 }} className="mono">
            Add bones from the bone table
          </p>
        ) : (
          bankedBones.map(b => {
            const name = getBoneName(b);
            const baseXp = getBoneXp(b);
            return (
              <div
                key={b.id}
                className="panel-inner"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
              >
                <div>
                  <span style={{ fontSize: 13 }}>{name}</span>
                  {editingId === b.id ? (
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <input
                        type="number"
                        min={1}
                        value={editQty}
                        onChange={e => setEditQty(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit(b.id)}
                        style={{ width: 60 }}
                        autoFocus
                      />
                      <button className="primary" onClick={() => handleSaveEdit(b.id)}>&#10003;</button>
                    </div>
                  ) : (
                    <p className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      &times;{b.quantity} = <span className="gold">{Math.floor(baseXp * mult * b.quantity).toLocaleString()} xp</span>
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="ghost"
                    onClick={() => { setEditingId(b.id); setEditQty(String(b.quantity)); }}
                    style={{ padding: '4px 8px' }}
                  >
                    Edit
                  </button>
                  <button
                    className="destructive"
                    onClick={() => onDelete(b.id)}
                    style={{ padding: '4px 8px' }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {bankedBones.length > 0 && (
        <div>
          {confirmBurn ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Burn all and add XP?</span>
              <button className="primary" onClick={() => { onBurnAll(); setConfirmBurn(false); }}>
                Confirm
              </button>
              <button className="ghost" onClick={() => setConfirmBurn(false)}>Cancel</button>
            </div>
          ) : (
            <button className="primary" onClick={() => setConfirmBurn(true)} style={{ width: '100%' }}>
              Burn All Bones (+{Math.floor(bankedXp).toLocaleString()} XP)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
