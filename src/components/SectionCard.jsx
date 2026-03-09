import React from 'react';
import { THEME_COLORS } from '../theme';

function SectionCard({ title, count, isOpen, onToggle, items, emptyText, renderItem }) {
  // Если в секции нет элементов, она не отображается
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className={`${THEME_COLORS.sectionBackground} rounded-2xl`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <span className="text-sm font-semibold tracking-wide uppercase">
          {title}
        </span>
        <span className="flex items-center space-x-2 text-zinc-400 text-sm">
          <span>{count}</span>
          <span className="text-lg leading-none">
            {isOpen ? '˅' : '>'}
          </span>
        </span>
      </button>

      <div
        className={`mt-0 overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[800px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="space-y-2">
          {items.map((item) => renderItem(item))}
        </ul>
      </div>
    </section>
  );
}

export default SectionCard;


