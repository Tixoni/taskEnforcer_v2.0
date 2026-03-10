import React, { useEffect, useState } from 'react';

function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Запускаем анимацию появления после монтирования
    setVisible(true);
  }, []);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-md mx-0 rounded-t-3xl bg-zinc-900 text-white p-6 shadow-2xl transform transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-full'
        } h-[25vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        

        <div className="h-full overflow-y-auto px-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;