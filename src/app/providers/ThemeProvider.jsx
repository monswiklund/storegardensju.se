import PropTypes from "prop-types";

function ThemeProvider({ children }) {
  return children;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
