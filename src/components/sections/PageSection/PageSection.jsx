import "./PageSectionStyles.css";

function PageSection({
    children,
    background = "white",
    spacing = "default",
    ariaLabel
}) {
    const spacingClass = `page-section-${spacing}`;

    return (
        <section
            className={`page-section ${spacingClass}`}
            style={{ background }}
            aria-labelledby={ariaLabel}
        >
            {children}
        </section>
    );
}

export default PageSection;
