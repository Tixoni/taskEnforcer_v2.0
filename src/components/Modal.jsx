import React from 'react';

function Modal({ isOpen, title, onClose, children }) {
  // Если окно закрыто, вообще ничего не рендерим
  if (!isOpen) return null;

  return (
    <div style={{ border: '1px solid black', padding: '20px', marginTop: '20px' }}>
      <h3>{title}</h3>
      
      {/* Сюда будет подставляться наша форма */}
      {children} 
      
      <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>
        Отмена
      </button>
    </div>
  );
}

export default Modal;