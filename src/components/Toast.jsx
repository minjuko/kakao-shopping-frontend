import React from "react";
import "../styles/Toast.css";

const Toast = ({ message, onClose }) => {
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">✓</span>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button
          className="toast-close"
          type="button"
          aria-label="알림 닫기"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;
