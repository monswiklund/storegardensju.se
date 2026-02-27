import { PageSection } from "../../../components";
import PropTypes from "prop-types";

const IS_DEV = import.meta.env.DEV;

function AdminLogin({ error, onRetry, onOpenAccess, onPreview }) {
  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="admin-container">
          <div className="admin-login-card">
            <div className="admin-login-badge">Skyddad admininloggning</div>
            <h1>Logga in till Admin</h1>
            <p className="admin-login-lead">
              Sessionen saknas eller har löpt ut. Adminpanelen använder
              Cloudflare Access med tillåtna användare.
            </p>
            <ol className="admin-login-steps">
              <li>Klicka på “Logga in via Access”.</li>
              <li>Verifiera med din tilldelade e-post.</li>
              <li>Gå tillbaka hit och klicka “Jag är inloggad”.</li>
            </ol>
            {error && <p className="admin-error">{error}</p>}
            <div className="admin-login-form">
              <button
                type="button"
                className="admin-btn-primary"
                onClick={onOpenAccess}
              >
                Logga in via Access
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={onRetry}
              >
                Jag är inloggad
              </button>
            </div>
            <p className="admin-login-help">
              Fungerar det inte? Kontrollera att popup-fönster tillåts för sidan.
            </p>
            {IS_DEV && (
              <div className="admin-login-preview">
                <p className="admin-muted">Eller testa layouten direkt.</p>
                <button
                  type="button"
                  className="admin-btn-tertiary"
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

AdminLogin.propTypes = {
  error: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
  onOpenAccess: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
};
