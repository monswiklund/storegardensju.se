import { PageSection } from "../../../components";

const IS_DEV = import.meta.env.DEV;
const ADMIN_USER_OPTIONS = (import.meta.env.VITE_ADMIN_USERS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function AdminLogin({
  keyInput,
  setKeyInput,
  onLogin,
  error,
  onPreview,
  keyError,
  selectedUser,
  setSelectedUser,
}) {
  const userOptions =
    ADMIN_USER_OPTIONS.length > 0
      ? ADMIN_USER_OPTIONS
      : ["Ann", "Carl", "Lina", "Måns"];

  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="admin-container">
          <div className="admin-login-card">
            <h1>Admin</h1>
            <p>Logga in med din admin-nyckel.</p>
            <form className="admin-login-form" onSubmit={onLogin}>
              <label className="admin-label" htmlFor="admin-user">
                Välj användare
              </label>
              <select
                id="admin-user"
                className="admin-input"
                value={selectedUser}
                onChange={(event) => setSelectedUser(event.target.value)}
              >
                <option value="">Välj...</option>
                {userOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <label className="admin-label" htmlFor="admin-key">
                Admin-nyckel
              </label>
              <input
                id="admin-key"
                type="password"
                className="admin-input"
                value={keyInput}
                onChange={(event) => setKeyInput(event.target.value)}
                placeholder="Klistra in nyckeln"
                autoComplete="current-password"
              />
              {(error || keyError) && (
                <p className="admin-error">{error || keyError}</p>
              )}
              <button type="submit" className="admin-btn-primary">
                Logga in
              </button>
            </form>
            {IS_DEV && (
              <div className="admin-login-preview">
                <p className="admin-muted">Eller testa layouten direkt.</p>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={onPreview}
                >
                  Förhandsgranska (dev)
                </button>
              </div>
            )}
          </div>
        </div>
      </PageSection>
    </main>
  );
}

export default AdminLogin;
