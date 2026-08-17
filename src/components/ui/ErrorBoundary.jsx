import { Component } from 'react';
import PropTypes from 'prop-types';
import { getPageCopySync } from '../../services/cmsService';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const siteCopy = getPageCopySync('site') || {};
      const title = siteCopy['ui.error-boundary-title'];
      const message = siteCopy['ui.error-boundary-message'];
      const retry = siteCopy['ui.error-boundary-retry'];

      return (
        <div className="error-boundary">
          <div className="error-content">
            {title && <h3>{title}</h3>}
            {message && <p>{message}</p>}
            <button 
              onClick={() => window.location.reload()} 
              className="error-reload-button"
            >
              {retry}
            </button>
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