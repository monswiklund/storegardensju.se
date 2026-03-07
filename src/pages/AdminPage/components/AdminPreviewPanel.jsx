export default function AdminPreviewPanel({ message, onLogin }) {
  return (
    <div className="admin-panel">
      <div className="admin-empty">
        <p>{message}</p>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={onLogin}
        >
          Logga in
        </button>
      </div>
    </div>
  );
}
