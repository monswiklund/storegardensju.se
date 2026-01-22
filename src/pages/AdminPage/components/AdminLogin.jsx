import { PageSection } from "../../../components";

const IS_DEV = import.meta.env.DEV;

function AdminLogin({
  keyInput,
  setKeyInput,
  onLogin,
  error,
  onPreview,
  keyError,
}) {
  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="admin-container">
          <div className="admin-login-card">
            <h1>Admin</h1>
            <p>Logga in med din admin-nyckel.</p>
            <form className="admin-login-form" onSubmit={onLogin}>
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
