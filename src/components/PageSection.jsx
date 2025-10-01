import "./PageSectionStyles.css";

function PageSection({ children, background = "white", padding = "80px 20px", ariaLabel }) {
    return (
        <section
            className="page-section"
            style={{ background, padding }}
            aria-labelledby={ariaLabel}
        >
            {children}
        </section>
    );
}

export default PageSection;
