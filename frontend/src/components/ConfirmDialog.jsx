// src/components/ConfirmDialog.jsx
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, danger = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { onConfirm(); onClose(); }}
            id="confirm-dialog-btn"
          >
            Confirm
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        {message || 'Are you sure you want to continue? This action cannot be undone.'}
      </p>
    </Modal>
  );
}
