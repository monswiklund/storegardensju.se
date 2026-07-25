import PropTypes from "prop-types";
import { useLocation, useNavigationType } from "react-router-dom";
import "./PageTransition.css";

function PageTransition({ children }) {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const shouldAnimate = navigationType !== "POP";

  return (
    <div
      key={pathname}
      className={shouldAnimate ? "page-transition" : undefined}
    >
      {children}
    </div>
  );
}

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageTransition;
