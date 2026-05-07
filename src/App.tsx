import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './lib/AuthContext';
import { levelForXp } from './lib/xp';
import { getBoneXp } from './lib/bones';
import type { CustomBone, Modifier, BankedBone, HistoryEntry, UserProgress } from './lib/types';
import Login from './components/Login';
import StatusPanel from './components/StatusPanel';
import BoneTable from './components/BoneTable';
import BankedBones from './components/BankedBones';
import GoalProgress from './components/GoalProgress';
import History from './components/History';
import './App.css';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [customBones, setCustomBones] = useState<CustomBone[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [activeModifier, setActiveModifier] = useState<Modifier | null>(null);
  const [bankedBones, setBankedBones] = useState<BankedBone[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    id: 1, current_xp: 0, current_level: 1, goal_level: 99, track_from_level1: false, updated_at: '', user_id: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  async function loadAll() {
    if (!user) return;

    const [customRes, modsRes, bankedRes, histRes, progRes] = await Promise.all([
      supabase.from('custom_bones').select('*').eq('user_id', user.id).order('base_xp'),
      supabase.from('prayer_modifiers').select('*').order('multiplier'),
      supabase.from('banked_bones').select('*, prayer_bones(*), custom_bones(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('xp_history').select('*, prayer_bones(*), custom_bones(*), prayer_modifiers(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    if (customRes.data) setCustomBones(customRes.data);
    if (modsRes.data) {
      setModifiers(modsRes.data);
      setActiveModifier(modsRes.data[0] || null);
    }
    if (bankedRes.data) setBankedBones(bankedRes.data);
    if (histRes.data) setHistory(histRes.data);

    if (progRes.data) {
      setProgress(progRes.data);
    } else {
      const { data } = await supabase
        .from('user_progress')
        .insert({ user_id: user.id, current_xp: 0, current_level: 1, goal_level: 99, track_from_level1: false })
        .select()
        .single();
      if (data) setProgress(data);
    }

    setLoading(false);
  }

  async function updateProgress(updates: Partial<UserProgress>) {
    if (!user) return;
    const { data } = await supabase
      .from('user_progress')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();
    if (data) setProgress(data);
  }

  async function addCustomBone(name: string, baseXp: number) {
    if (!user) return;
    const { data } = await supabase
      .from('custom_bones')
      .insert({ user_id: user.id, name, base_xp: baseXp })
      .select()
      .single();
    if (data) setCustomBones(prev => [...prev, data]);
  }

  async function deleteCustomBone(id: number) {
    await supabase.from('custom_bones').delete().eq('id', id);
    setCustomBones(prev => prev.filter(b => b.id !== id));
  }

  async function editCustomBone(id: number, name: string, baseXp: number) {
    const { data } = await supabase
      .from('custom_bones')
      .update({ name, base_xp: baseXp })
      .eq('id', id)
      .select()
      .single();
    if (data) setCustomBones(prev => prev.map(b => b.id === id ? data : b));
  }

  async function addBankedFromTable(customBoneId: number, quantity: number) {
    if (!user) return;
    const bone = customBones.find(b => b.id === customBoneId);
    if (!bone) return;

    const { data } = await supabase
      .from('banked_bones')
      .insert({ custom_bone_id: customBoneId, quantity, user_id: user.id })
      .select('*, prayer_bones(*), custom_bones(*)')
      .single();

    if (data) {
      setBankedBones(prev => [data, ...prev]);
      if (activeModifier) {
        const totalXp = quantity * bone.base_xp * activeModifier.multiplier;
        await addHistory(customBoneId, quantity, 'banked', totalXp);
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
      .select('*, prayer_bones(*), custom_bones(*)')
      .single();
    if (data) {
      setBankedBones(prev => prev.map(b => b.id === id ? data : b));
    }
  }

  async function burnAllBones() {
    if (!user || bankedBones.length === 0) return;
    const totalXp = bankedBones.reduce((sum, b) => {
      const xp = getBoneXp(b) * (activeModifier?.multiplier || 1) * b.quantity;
      return sum + xp;
    }, 0);

    for (const b of bankedBones) {
      const xp = getBoneXp(b) * (activeModifier?.multiplier || 1) * b.quantity;
      const boneId = b.custom_bone_id || b.bone_id || 0;
      await addHistory(boneId, b.quantity, 'gained', xp);
    }

    await supabase.from('banked_bones').delete().eq('user_id', user.id);
    setBankedBones([]);
    const newXp = progress.current_xp + totalXp;
    await updateProgress({ current_xp: newXp, current_level: levelForXp(newXp) });
  }

  async function addHistory(customBoneId: number, quantity: number, action: 'banked' | 'gained', totalXp: number) {
    if (!user) return;
    const { data } = await supabase
      .from('xp_history')
      .insert({
        custom_bone_id: customBoneId,
        quantity,
        modifier_id: activeModifier?.id || null,
        action,
        total_xp: totalXp,
        user_id: user.id,
      })
      .select('*, prayer_bones(*), custom_bones(*), prayer_modifiers(*)')
      .single();
    if (data) setHistory(prev => [data, ...prev]);
  }

  async function deleteHistory(id: number) {
    await supabase.from('xp_history').delete().eq('id', id);
    setHistory(prev => prev.filter(h => h.id !== id));
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p className="mono" style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <Login />;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p className="mono" style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    );
  }

  const bankedXp = bankedBones.reduce((sum, b) => {
    return sum + getBoneXp(b) * (activeModifier?.multiplier || 1) * b.quantity;
  }, 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <header style={{ marginBottom: 32, textAlign: 'center', position: 'relative' }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>
          <span className="gold">Prayer</span> XP Tracker
        </h1>
        <p className="label">OSRS Skill Calculator</p>
        <button
          className="ghost"
          onClick={signOut}
          style={{ position: 'absolute', top: 0, right: 0, fontSize: 10, padding: '6px 12px' }}
        >
          Sign Out
        </button>
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
          <BoneTable
            customBones={customBones}
            activeModifier={activeModifier}
            onAdd={addCustomBone}
            onDelete={deleteCustomBone}
            onEdit={editCustomBone}
            onAddToBank={addBankedFromTable}
          />
          <BankedBones
            bankedBones={bankedBones}
            activeModifier={activeModifier}
            onDelete={deleteBankedBone}
            onUpdate={updateBankedBone}
            onBurnAll={burnAllBones}
            bankedXp={bankedXp}
          />
        </div>

        <History entries={history} onDelete={deleteHistory} />
      </div>
    </div>
  );
}

export default App;
