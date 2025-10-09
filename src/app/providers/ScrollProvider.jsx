import PropTypes from "prop-types";

function ScrollProvider({ children }) {
  return children;
}

ScrollProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ScrollProvider;
