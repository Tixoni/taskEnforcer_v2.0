import React from 'react';
import { THEME_COLORS } from '../theme';

function NavButton({ icon, label, isActive, onClick }) {
  const baseClasses =
    'w-16 h-10 flex items-center justify-center rounded-2xl transition shadow-md';
  const activeClasses = 'bg-zinc-900';
  const inactiveClasses = 'bg-zinc-800 opacity-70';

  const className = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={label}
    >
      <img src={icon} alt={label} className="w-7 h-7 object-contain" />
    </button>
  );
}

export default NavButton;


