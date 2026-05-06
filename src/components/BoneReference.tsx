import type { Bone, Modifier } from '../lib/types';

interface Props {
  bones: Bone[];
  activeModifier: Modifier | null;
}

export default function BoneReference({ bones, activeModifier }: Props) {
  const mult = activeModifier?.multiplier || 1;

  return (
    <div className="panel" style={{ maxHeight: 500, overflowY: 'auto' }}>
      <h3 style={{ fontSize: 14, marginBottom: 12 }}>Bone Reference</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px' }} className="label">Bone</th>
            <th style={{ textAlign: 'right', padding: '6px 8px' }} className="label">Base</th>
            <th style={{ textAlign: 'right', padding: '6px 8px' }} className="label">Effective</th>
          </tr>
        </thead>
        <tbody>
          {bones.map(bone => (
            <tr key={bone.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '6px 8px' }}>{bone.name}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }} className="mono">
                {bone.base_xp}
              </td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }} className="xp-number">
                {(bone.base_xp * mult).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
