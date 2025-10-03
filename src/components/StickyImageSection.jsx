import './StickyImageSectionStyles.css';

function StickyImageSection({
  image,
  imageAlt = ''
}) {
  return (
    <section className="sticky-image-section">
      <div className="sticky-image-wrapper">
        <img
          src={image}
          alt={imageAlt}
          className="sticky-image"
          loading="lazy"
        />
      </div>
    </section>
  );
}

export default StickyImageSection;
