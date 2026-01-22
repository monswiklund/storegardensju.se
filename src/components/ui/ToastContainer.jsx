import "./Toast.css";

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} fade-in-toast`}
          role="alert"
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-content">{toast.message}</div>
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
