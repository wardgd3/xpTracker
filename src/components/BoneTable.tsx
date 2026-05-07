import { useState } from 'react';
import type { CustomBone, Modifier } from '../lib/types';

interface Props {
  customBones: CustomBone[];
  activeModifier: Modifier | null;
  onAdd: (name: string, baseXp: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number, name: string, baseXp: number) => Promise<void>;
  onAddToBank: (boneId: number, quantity: number) => Promise<void>;
}

export default function BoneTable({ customBones, activeModifier, onAdd, onDelete, onEdit, onAddToBank }: Props) {
  const [name, setName] = useState('');
  const [xp, setXp] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editXp, setEditXp] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [bankQty, setBankQty] = useState<Record<number, string>>({});

  const mult = activeModifier?.multiplier || 1;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const xpVal = parseFloat(xp);
    if (!name.trim() || isNaN(xpVal) || xpVal <= 0) return;
    await onAdd(name.trim(), xpVal);
    setName('');
    setXp('');
  }

  function startEdit(bone: CustomBone) {
    setEditingId(bone.id);
    setEditName(bone.name);
    setEditXp(String(bone.base_xp));
  }

  async function saveEdit(id: number) {
    const xpVal = parseFloat(editXp);
    if (!editName.trim() || isNaN(xpVal) || xpVal <= 0) return;
    await onEdit(id, editName.trim(), xpVal);
    setEditingId(null);
  }

  async function handleAddToBank(boneId: number) {
    const qty = parseInt(bankQty[boneId] || '');
    if (isNaN(qty) || qty <= 0) return;
    await onAddToBank(boneId, qty);
    setBankQty(prev => ({ ...prev, [boneId]: '' }));
  }

  return (
    <div className="panel">
      <h3 style={{ fontSize: 14, marginBottom: 12 }}>Bone Table</h3>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Bone name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ flex: 1, minWidth: 100 }}
        />
        <input
          type="number"
          placeholder="XP"
          value={xp}
          onChange={e => setXp(e.target.value)}
          step="0.1"
          min="0"
          style={{ width: 70 }}
        />
        <button type="submit" className="primary">Add</button>
      </form>

      {customBones.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 16, fontSize: 12 }} className="mono">
          Add bone types above to get started
        </p>
      ) : (
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {customBones.map(bone => (
            <div
              key={bone.id}
              className="panel-inner"
              style={{ marginBottom: 6, padding: 12 }}
            >
              {editingId === bone.id ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{ flex: 1, minWidth: 80 }}
                    autoFocus
                  />
                  <input
                    type="number"
                    value={editXp}
                    onChange={e => setEditXp(e.target.value)}
                    step="0.1"
                    style={{ width: 60 }}
                  />
                  <button className="primary" onClick={() => saveEdit(bone.id)} style={{ padding: '4px 8px' }}>
                    Save
                  </button>
                  <button className="ghost" onClick={() => setEditingId(null)} style={{ padding: '4px 8px' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  {/* Top row: name, xp, edit/delete */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{bone.name}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>
                        {bone.base_xp} base
                      </span>
                      <span className="xp-number" style={{ fontSize: 11, marginLeft: 6 }}>
                        {(bone.base_xp * mult).toFixed(1)} eff
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="ghost" onClick={() => startEdit(bone)} style={{ padding: '3px 6px', fontSize: 10 }}>
                        Edit
                      </button>
                      {confirmDeleteId === bone.id ? (
                        <>
                          <button
                            className="destructive"
                            onClick={() => { onDelete(bone.id); setConfirmDeleteId(null); }}
                            style={{ padding: '3px 6px', fontSize: 10 }}
                          >
                            Yes
                          </button>
                          <button
                            className="ghost"
                            onClick={() => setConfirmDeleteId(null)}
                            style={{ padding: '3px 6px', fontSize: 10 }}
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <button
                          className="destructive"
                          onClick={() => setConfirmDeleteId(bone.id)}
                          style={{ padding: '3px 6px', fontSize: 10 }}
                        >
                          Del
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom row: add to bank */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={bankQty[bone.id] || ''}
                      onChange={e => setBankQty(prev => ({ ...prev, [bone.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddToBank(bone.id)}
                      style={{ width: 60, padding: '4px 8px', fontSize: 11 }}
                    />
                    <button
                      className="primary"
                      onClick={() => handleAddToBank(bone.id)}
                      style={{ padding: '4px 10px', fontSize: 10 }}
                    >
                      + Bank
                    </button>
                    {bankQty[bone.id] && parseInt(bankQty[bone.id]) > 0 && (
                      <span className="xp-number" style={{ fontSize: 10 }}>
                        +{Math.floor(bone.base_xp * mult * parseInt(bankQty[bone.id])).toLocaleString()} xp
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
