// Modal.js
import React from 'react';
import '../Modal.css';

const Modal = ({ isOpen, onClose, title, message, onConfirm, confirmText = 'Evet', cancelText = 'Hayır' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm}>{confirmText}</button>
          <button onClick={onClose} className="cancel-button">{cancelText}</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;