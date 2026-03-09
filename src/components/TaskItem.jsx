import React from 'react';
import { THEME_COLORS } from '../theme';

function formatDateRuShort(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  // Получаем строку вида "19 февр."
  const raw = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  const parts = raw.split(' ');
  if (parts.length < 2) return raw;

  const [day, month] = parts;
  return `${month} ${day}`;
}

function TaskItem({ task, onToggle }) {
  const createdLabel = formatDateRuShort(task.createdAt);

  return (
    <li className={`${THEME_COLORS.sectionItemBackground} rounded-xl p-3 flex items-center justify-between`}>
      <label className="flex items-center space-x-3 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className={`w-5 h-5 rounded focus:ring-orange-400 ${THEME_COLORS.accentCheckbox}`}
        />
        <span
          className={`flex-1 text-sm ${
            task.completed ? 'line-through text-zinc-500' : 'text-zinc-50'
          }`}
        >
          {task.title}
        </span>
      </label>
      {createdLabel && (
        <span className={`ml-3 text-xs ${THEME_COLORS.dateTextPrimary}`}>
          {createdLabel}
        </span>
      )}
    </li>
  );
}

export default TaskItem;



