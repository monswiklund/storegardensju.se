import PropTypes from 'prop-types';
import { useSiteCopy } from '../../hooks/usePageCopy';
import './LoadingSpinner.css';

function LoadingSpinner({ size = "medium", text }) {
  const siteCopy = useSiteCopy();
  const loadingText = text !== undefined ? text : siteCopy("ui.loading");

  const sizeClasses = {
    small: "loading-spinner--small",
    medium: "loading-spinner--medium", 
    large: "loading-spinner--large"
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]}`} role="status" aria-label={loadingText || undefined}>
      <div className="spinner-circle"></div>
      {loadingText && <span className="loading-text">{loadingText}</span>}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
};

export default LoadingSpinner;