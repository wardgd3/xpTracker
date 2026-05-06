import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Bone, Modifier, BankedBone, HistoryEntry, UserProgress } from './lib/types';
import StatusPanel from './components/StatusPanel';
import BoneReference from './components/BoneReference';
import BankedBones from './components/BankedBones';
import GoalProgress from './components/GoalProgress';
import History from './components/History';
import './App.css';

function App() {
  const [bones, setBones] = useState<Bone[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [activeModifier, setActiveModifier] = useState<Modifier | null>(null);
  const [bankedBones, setBankedBones] = useState<BankedBone[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [progress, setProgress] = useState<UserProgress>({ id: 1, current_xp: 0, goal_level: 99, updated_at: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [bonesRes, modsRes, bankedRes, histRes, progRes] = await Promise.all([
      supabase.from('prayer_bones').select('*').order('base_xp'),
      supabase.from('prayer_modifiers').select('*').order('multiplier'),
      supabase.from('banked_bones').select('*, prayer_bones(*)').order('created_at', { ascending: false }),
      supabase.from('xp_history').select('*, prayer_bones(*), prayer_modifiers(*)').order('created_at', { ascending: false }).limit(50),
      supabase.from('user_progress').select('*').single(),
    ]);

    if (bonesRes.data) setBones(bonesRes.data);
    if (modsRes.data) {
      setModifiers(modsRes.data);
      setActiveModifier(modsRes.data[0] || null);
    }
    if (bankedRes.data) setBankedBones(bankedRes.data);
    if (histRes.data) setHistory(histRes.data);
    if (progRes.data) setProgress(progRes.data);
    setLoading(false);
  }

  async function updateProgress(updates: Partial<UserProgress>) {
    const { data } = await supabase
      .from('user_progress')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .single();
    if (data) setProgress(data);
  }

  async function addBankedBone(boneId: number, quantity: number) {
    const { data } = await supabase
      .from('banked_bones')
      .insert({ bone_id: boneId, quantity })
      .select('*, prayer_bones(*)')
      .single();
    if (data) {
      setBankedBones(prev => [data, ...prev]);
      const bone = bones.find(b => b.id === boneId);
      if (bone && activeModifier) {
        const totalXp = quantity * bone.base_xp * activeModifier.multiplier;
        await addHistory(boneId, quantity, 'banked', totalXp);
      }
    }
  }

  async function deleteBankedBone(id: number) {
    await supabase.from('banked_bones').delete().eq('id', id);
    setBankedBones(prev => prev.filter(b => b.id !== id));
  }

  async function updateBankedBone(id: number, quantity: number) {
    const { data } = await supabase
      .from('banked_bones')
      .update({ quantity })
      .eq('id', id)
      .select('*, prayer_bones(*)')
      .single();
    if (data) {
      setBankedBones(prev => prev.map(b => b.id === id ? data : b));
    }
  }

  async function burnAllBones() {
    if (bankedBones.length === 0) return;
    const totalXp = bankedBones.reduce((sum, b) => {
      const xp = (b.prayer_bones?.base_xp || 0) * (activeModifier?.multiplier || 1) * b.quantity;
      return sum + xp;
    }, 0);

    for (const b of bankedBones) {
      const xp = (b.prayer_bones?.base_xp || 0) * (activeModifier?.multiplier || 1) * b.quantity;
      await addHistory(b.bone_id, b.quantity, 'gained', xp);
    }

    await supabase.from('banked_bones').delete().neq('id', 0);
    setBankedBones([]);
    await updateProgress({ current_xp: progress.current_xp + totalXp });
  }

  async function addHistory(boneId: number, quantity: number, action: 'banked' | 'gained', totalXp: number) {
    const { data } = await supabase
      .from('xp_history')
      .insert({
        bone_id: boneId,
        quantity,
        modifier_id: activeModifier?.id || null,
        action,
        total_xp: totalXp,
      })
      .select('*, prayer_bones(*), prayer_modifiers(*)')
      .single();
    if (data) setHistory(prev => [data, ...prev]);
  }

  async function deleteHistory(id: number) {
    await supabase.from('xp_history').delete().eq('id', id);
    setHistory(prev => prev.filter(h => h.id !== id));
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p className="mono" style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    );
  }

  const bankedXp = bankedBones.reduce((sum, b) => {
    return sum + (b.prayer_bones?.base_xp || 0) * (activeModifier?.multiplier || 1) * b.quantity;
  }, 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <header style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>
          <span className="gold">Prayer</span> XP Tracker
        </h1>
        <p className="label">OSRS Skill Calculator</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StatusPanel progress={progress} onUpdate={updateProgress} />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="label">Active Method:</span>
          {modifiers.map(m => (
            <button
              key={m.id}
              className={activeModifier?.id === m.id ? 'primary' : 'ghost'}
              onClick={() => setActiveModifier(m)}
              title={m.description || ''}
            >
              {m.name} ({m.multiplier}x)
            </button>
          ))}
        </div>

        <GoalProgress progress={progress} bankedXp={bankedXp} />

        <div className="grid-2">
          <BankedBones
            bones={bones}
            bankedBones={bankedBones}
            activeModifier={activeModifier}
            onAdd={addBankedBone}
            onDelete={deleteBankedBone}
            onUpdate={updateBankedBone}
            onBurnAll={burnAllBones}
            bankedXp={bankedXp}
          />
          <BoneReference bones={bones} activeModifier={activeModifier} />
        </div>

        <History entries={history} onDelete={deleteHistory} />
      </div>
    </div>
  );
}

export default App;
