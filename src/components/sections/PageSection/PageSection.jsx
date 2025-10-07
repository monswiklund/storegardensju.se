import PropTypes from 'prop-types';
import './PageSectionStyles.css';

function PageSection({ children, background, spacing, ariaLabel }) {
  const sectionClasses = `page-section ${background ? `bg-${background}` : ''} ${spacing ? `spacing-${spacing}` : ''}`;

  return (
    <section className={sectionClasses} aria-labelledby={ariaLabel}>
      <div className="page-section-content">
        {children}
      </div>
    </section>
  );
}

PageSection.propTypes = {
  children: PropTypes.node,
  background: PropTypes.string,
  spacing: PropTypes.string,
  ariaLabel: PropTypes.string,
};

PageSection.defaultProps = {
  background: 'white',
  spacing: 'default',
  ariaLabel: '',
};

export default PageSection;