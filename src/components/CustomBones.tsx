import { useState } from 'react';
import type { CustomBone } from '../lib/types';

interface Props {
  customBones: CustomBone[];
  onAdd: (name: string, baseXp: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number, name: string, baseXp: number) => Promise<void>;
}

export default function CustomBones({ customBones, onAdd, onDelete, onEdit }: Props) {
  const [name, setName] = useState('');
  const [xp, setXp] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editXp, setEditXp] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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

  return (
    <div className="panel">
      <h3 style={{ fontSize: 14, marginBottom: 12 }}>Custom Items</h3>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Name"
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
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 8, fontSize: 12 }} className="mono">
          No custom items yet
        </p>
      ) : (
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {customBones.map(bone => (
            <div
              key={bone.id}
              className="panel-inner"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}
            >
              {editingId === bone.id ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
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
                  <div>
                    <span style={{ fontSize: 13 }}>{bone.name}</span>
                    <span className="xp-number" style={{ fontSize: 11, marginLeft: 8 }}>
                      {bone.base_xp} xp
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="ghost" onClick={() => startEdit(bone)} style={{ padding: '4px 8px', fontSize: 10 }}>
                      Edit
                    </button>
                    {confirmDeleteId === bone.id ? (
                      <>
                        <button
                          className="destructive"
                          onClick={() => { onDelete(bone.id); setConfirmDeleteId(null); }}
                          style={{ padding: '4px 8px', fontSize: 10 }}
                        >
                          Yes
                        </button>
                        <button
                          className="ghost"
                          onClick={() => setConfirmDeleteId(null)}
                          style={{ padding: '4px 8px', fontSize: 10 }}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        className="destructive"
                        onClick={() => setConfirmDeleteId(bone.id)}
                        style={{ padding: '4px 8px', fontSize: 10 }}
                      >
                        Del
                      </button>
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
