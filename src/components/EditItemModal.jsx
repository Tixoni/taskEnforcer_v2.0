import React, { useEffect, useState } from 'react';
import { THEME_COLORS } from '../theme';

function EditItemModal({ isOpen, item, type, onClose, onSave, onDelete }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (item) {
      setText(item.title || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(item.id, trimmed, type);
  };

  const handleDelete = () => {
    onDelete(item.id, type);
  };

  const titleLabel = type === 'habit' ? 'Привычка' : 'Задача';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md mx-0 rounded-t-3xl bg-zinc-900 text-white p-6 shadow-2xl transform transition-transform duration-300 translate-y-0 h-[40vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold truncate">
            {titleLabel}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <form className="flex flex-col h-full" onSubmit={handleSubmit}>
          <label className="text-xs text-zinc-400 mb-1">
            Текст
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="max-h-36 flex-1 w-full rounded-xl bg-zinc-800 text-sm text-white p-3 resize-none outline-none border border-zinc-900 focus:border-orange-500"
            autoFocus
          />

          <div className="mt-4 space-y-2">
            <button
              type="submit"
              className={`w-full rounded-xl py-2.5 text-sm font-medium text-white ${THEME_COLORS.accentBg} ${THEME_COLORS.accentBgHover}`}
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full rounded-xl py-2.5 text-sm font-medium text-red-400 border border-red-500/50 hover:bg-red-500/10"
            >
              Удалить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditItemModal;

