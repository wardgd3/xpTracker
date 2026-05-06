import { useState } from 'react';
import type { Bone, BankedBone, Modifier } from '../lib/types';

interface Props {
  bones: Bone[];
  bankedBones: BankedBone[];
  activeModifier: Modifier | null;
  onAdd: (boneId: number, quantity: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, quantity: number) => Promise<void>;
  onBurnAll: () => Promise<void>;
  bankedXp: number;
}

export default function BankedBones({ bones, bankedBones, activeModifier, onAdd, onDelete, onUpdate, onBurnAll, bankedXp }: Props) {
  const [selectedBone, setSelectedBone] = useState<number>(bones[0]?.id || 0);
  const [quantity, setQuantity] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');
  const [confirmBurn, setConfirmBurn] = useState(false);

  const mult = activeModifier?.multiplier || 1;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (!selectedBone || !qty || qty <= 0) return;
    await onAdd(selectedBone, qty);
    setQuantity('');
  }

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

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select
          value={selectedBone}
          onChange={e => setSelectedBone(Number(e.target.value))}
          style={{ flex: 1, minWidth: 140 }}
        >
          {bones.map(b => (
            <option key={b.id} value={b.id}>{b.name} ({(b.base_xp * mult).toFixed(1)} xp)</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          placeholder="Qty"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          style={{ width: 70 }}
        />
        <button type="submit" className="primary">Add</button>
      </form>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 280 }}>
        {bankedBones.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20 }} className="mono">
            No bones banked
          </p>
        ) : (
          bankedBones.map(b => (
            <div
              key={b.id}
              className="panel-inner"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
            >
              <div>
                <span style={{ fontSize: 13 }}>{b.prayer_bones?.name}</span>
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
                    <button className="primary" onClick={() => handleSaveEdit(b.id)}>✓</button>
                  </div>
                ) : (
                  <p className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    ×{b.quantity} = <span className="gold">{Math.floor((b.prayer_bones?.base_xp || 0) * mult * b.quantity).toLocaleString()} xp</span>
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
                  ×
                </button>
              </div>
            </div>
          ))
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
