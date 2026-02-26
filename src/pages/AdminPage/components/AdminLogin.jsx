import { PageSection } from "../../../components";
import PropTypes from "prop-types";

const IS_DEV = import.meta.env.DEV;

function AdminLogin({ error, onRetry, onPreview }) {
  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="admin-container">
          <div className="admin-login-card">
            <h1>Admin</h1>
            <p>
              Adminpanelen skyddas av säker inloggning via Cloudflare Access.
              Logga in med din tilldelade användare och försök igen.
            </p>
            {error && <p className="admin-error">{error}</p>}
            <div className="admin-login-form">
              <button type="button" className="admin-btn-primary" onClick={onRetry}>
                Försök igen
              </button>
            </div>
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

AdminLogin.propTypes = {
  error: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
};
