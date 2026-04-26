import React from 'react';

interface ModalityBadgeProps {
  modality: string;
  size?: 'sm' | 'md';
}

export const ModalityBadge: React.FC<ModalityBadgeProps> = ({ modality, size = 'sm' }) => {
  const mod = modality?.toUpperCase() || 'OT';
  const validMods = ['CT', 'MR', 'US', 'DX', 'XR', 'NM'];
  const cls = validMods.includes(mod) ? mod : 'OT';

  return (
    <span
      className={`badge-modality badge-${cls}`}
      style={size === 'md' ? { fontSize: '0.7rem', padding: '0.15rem 0.55rem' } : undefined}
    >
      {mod}
    </span>
  );
};
