function LoadingSpinner({ size = "medium", text = "Laddar..." }) {
  const sizeClasses = {
    small: "loading-spinner--small",
    medium: "loading-spinner--medium", 
    large: "loading-spinner--large"
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]}`} role="status" aria-label={text}>
      <div className="spinner-circle"></div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}

export default LoadingSpinner;