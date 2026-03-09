import React from 'react';
import { THEME_COLORS } from '../theme';

function HabitItem({ habit, onToggle, onOpenDetails }) {
  const daysCount = Number.isFinite(Number(habit.countDay))
    ? Number(habit.countDay)
    : 0;

  return (
    <li className={`${THEME_COLORS.sectionItemBackground} rounded-xl px-3 flex justify-between items-center`}>
      <div className="flex items-center space-x-3 flex-1 ">
        <input
          className="habit-checkbox"
          type="checkbox"
          checked={Boolean(habit.completed)}
          onChange={() => onToggle(habit.id)}
        />
        <button
          type="button"
          onClick={() => onOpenDetails?.(habit)}
          className={`${THEME_COLORS.sectionItemBackground}  flex-1 text-left text-sm px-0 ${
            habit.completed ? 'line-through text-zinc-500' : 'text-zinc-50'
          }`}
        >
          {habit.title && habit.title.length > 42
            ? `${habit.title.slice(0, 42)}...`
            : habit.title}
        </button>
      </div>
      <span className="text-xs bg-zinc-700 px-2 py-1 rounded-full text-zinc-200">
        {daysCount} 
      </span>
    </li>
  );
}

export default HabitItem;

 
