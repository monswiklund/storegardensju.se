function ImageSkeleton({ count = 6, className = "" }) {
  return (
    <div className={`gallery-grid ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="gallery-thumbnail skeleton-item">
          <div className="skeleton-image"></div>
        </div>
      ))}
    </div>
  );
}

export default ImageSkeleton;