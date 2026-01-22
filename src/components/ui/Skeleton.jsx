import "./Skeleton.css";

function Skeleton({ className = "", width, height, style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
