import React from 'react';
import { THEME_COLORS } from '../theme';

function NavButton({ label, isActive, onClick }) {
  const baseClasses = 'py-3 px-5 rounded-full font-medium transition';
  const activeClasses = `${THEME_COLORS.accentBg} text-white shadow-md`;
  const inactiveClasses = 'text-gray-500 hover:bg-gray-100';

  const className = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}

export default NavButton;

