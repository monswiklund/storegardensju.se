import PropTypes from "prop-types";

function ActionButtons({ actions }) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="profile-actions">
      {actions.map((action) => (
        <a
          key={action.label}
          href={action.href}
          className={`profile-action-btn ${action.primary ? "primary" : "secondary"}`}
          target={action.external ? "_blank" : undefined}
          rel={action.external ? "noopener noreferrer" : undefined}
        >
          {action.label}
        </a>
      ))}
    </div>
  );
}

ActionButtons.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      primary: PropTypes.bool,
      external: PropTypes.bool,
    }),
  ),
};

ActionButtons.defaultProps = {
  actions: null,
};

export default ActionButtons;
