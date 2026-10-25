import { Component } from 'react';
import PropTypes from 'prop-types';
import { getPageCopySync } from '../../services/cmsService';
import { canonicalPath } from '../../config/routes.js';
import './ErrorBoundary.css';

const RELOAD_KEY = 'storegarden-chunk-reload';

// After a deploy, a tab opened earlier asks for page bundles that no longer exist.
export function isChunkLoadError(error) {
  const text = `${error?.name ?? ''} ${error?.message ?? ''}`;
  return /ChunkLoadError|dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(text);
}

// One automatic reload per tab session picks up the new build; a second failure shows the message.
function reloadOnceForNewBuild() {
  try {
    if (sessionStorage.getItem(RELOAD_KEY)) return false;
    sessionStorage.setItem(RELOAD_KEY, '1');
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (isChunkLoadError(error) && reloadOnceForNewBuild()) return;
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const copy = getPageCopySync('site');

      return (
        <div className="error-boundary" role="alert">
          <div className="error-content">
            <h3>{copy('ui.error-boundary-title')}</h3>
            <p>{copy('ui.error-boundary-message')}</p>
            <div className="error-actions">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn--primary"
              >
                {copy('ui.error-boundary-retry')}
              </button>
              <a href={canonicalPath('/')} className="btn btn--secondary">
                {copy('ui.error-boundary-home')}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

export default ErrorBoundary;
