import React, { useState } from 'react';
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

function TaskItem({ task, onToggle, onOpenDetails }) {
  const createdLabel = formatDateRuShort(task.createdAt);

  // Локальное состояние для плавного исчезновения при выполнении
  const [isRemoving, setIsRemoving] = useState(false);

  const handleToggle = () => {
    // Если задача ещё не выполнена (находится в секции "Задачи"),
    // сначала анимируем исчезновение, затем меняем состояние
    if (!task.completed) {
      setIsRemoving(true);
      setTimeout(() => {
        onToggle(task.id);
      }, 200);
    } else {
      onToggle(task.id);
    }
  };

  const truncate = (text) => {
    if (!text) return '';
    return text.length > 42 ? `${text.slice(0, 42)}...` : text;
  };

  return (
    <li
      className={`${THEME_COLORS.sectionItemBackground} rounded-xl px-3 flex items-center justify-between transition-opacity duration-200 ${
        isRemoving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center space-x-3 flex-1">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className={`w-4 h-4 rounded focus:ring-orange-400 ${THEME_COLORS.accentCheckbox}`}
        />
        <button
          type="button"
          onClick={() => onOpenDetails?.(task)}
          className={`${THEME_COLORS.sectionItemBackground} flex-1 text-left text-sm px-0 ${
            task.completed ? 'line-through text-zinc-500' : 'text-zinc-50'
          }`}
        >
          {truncate(task.title)}
        </button>
      </div>
      {createdLabel && (
        <span className={`ml-3 text-xs ${THEME_COLORS.dateTextPrimary}`}>
          {createdLabel}
        </span>
      )}
    </li>
  );
}

export default TaskItem;



