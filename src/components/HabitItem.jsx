import React from 'react';
import { THEME_COLORS } from '../theme';

function HabitItem({ habit, onToggle }) {
  const daysCount = Number.isFinite(Number(habit.countDay))
    ? Number(habit.countDay)
    : 0;

  return (
    <li className={`${THEME_COLORS.sectionItemBackground} rounded-xl p-3 flex justify-between items-center`}>
      <label className="flex items-center space-x-3 cursor-pointer flex-1">
        <input
          className="w-5 h-5 text-green-500 rounded focus:ring-green-400"
          type="checkbox"
          checked={Boolean(habit.completed)}
          onChange={() => onToggle(habit.id)}
        />
        <span
          className={`text-sm ${
            habit.completed ? 'line-through text-zinc-500' : 'text-zinc-50'
          }`}
        >
          {habit.title}
        </span>
      </label>
      <span className="text-xs bg-zinc-700 px-2 py-1 rounded-full text-zinc-200">
        {daysCount} дн
      </span>
    </li>
  );
}

export default HabitItem;

 
