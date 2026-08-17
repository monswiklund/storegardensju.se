import { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import "./CategoryToggle.css";
import { useSiteCopy } from "../../../hooks/usePageCopy.js";

function CategoryToggle({ categories, activeCategory, onCategoryChange, className = "" }) {
    const siteCopy = useSiteCopy();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
    const buttonRefs = useRef([]);

    const sortedCategories = useMemo(() => {
        const next = [...categories];
        next.sort((a, b) => {
            const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
            const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
            if (orderA === orderB) {
                return (a.name || "").localeCompare(b.name || "", "sv");
            }
            return orderA - orderB;
        });

        // Position "alla" specifically
        const allaIndex = next.findIndex((cat) => cat.id === "alla");
        if (allaIndex > 0) {
            const [alla] = next.splice(allaIndex, 1);
            next.unshift(alla);
        }

        return next;
    }, [categories]);

    // Update selected index when active category changes
    useEffect(() => {
        const index = sortedCategories.findIndex(cat => cat.id === activeCategory);
        if (index !== -1) {
            setSelectedIndex(index);
        }
    }, [activeCategory, sortedCategories]);

    // Scroll to active button on mobile/desktop
    useEffect(() => {
        if (buttonRefs.current[selectedIndex] && containerRef.current) {
            const button = buttonRefs.current[selectedIndex];
            const container = containerRef.current;

            if (container.scrollWidth > container.clientWidth) {
                const buttonLeft = button.offsetLeft;
                const buttonWidth = button.offsetWidth;
                const containerWidth = container.clientWidth;
                const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedIndex]);

    // Click outside handler to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleCategoryClick = (category, index) => {
        setSelectedIndex(index);
        onCategoryChange(category.id);
        setIsOpen(false);
    };

    const handleKeyDown = (event, index) => {
        if (!sortedCategories.length) return;
        let nextIndex = index;
        if (event.key === "ArrowRight") {
            nextIndex = (index + 1) % sortedCategories.length;
        } else if (event.key === "ArrowLeft") {
            nextIndex = (index - 1 + sortedCategories.length) % sortedCategories.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = sortedCategories.length - 1;
        } else {
            return;
        }
        event.preventDefault();
        const nextCategory = sortedCategories[nextIndex];
        if (nextCategory) {
            setSelectedIndex(nextIndex);
            onCategoryChange(nextCategory.id);
            if (buttonRefs.current[nextIndex]) {
                buttonRefs.current[nextIndex].focus();
            }
        }
    };

    const activeCategoryData = sortedCategories[selectedIndex] || { name: "Kategori", images: [] };

    return (
        <div className={`category-toggle ${className}`.trim()}>
            {/* Desktop Segmented Control */}
            <div className="category-toggle-container desktop-only" ref={containerRef}>
                {sortedCategories.map((category, index) => (
                    <button
                        key={category.id}
                        ref={el => buttonRefs.current[index] = el}
                        className={`category-button ${index === selectedIndex ? 'active' : ''}`}
                        type="button"
                        onClick={() => handleCategoryClick(category, index)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        aria-pressed={index === selectedIndex}
                        aria-current={index === selectedIndex ? "true" : "false"}
                        aria-label={`Visa ${category.name} (${category.images.length} bilder)`}
                    >
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">({category.images.length})</span>
                    </button>
                ))}
            </div>

            {/* Custom Mobile Dropdown Control */}
            <div className="category-toggle-dropdown-container mobile-only" ref={dropdownRef}>
                <button
                    className={`category-select-trigger ${isOpen ? "is-open" : ""}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-label={siteCopy("gallery.choose-category")}
                    type="button"
                >
                    <span className="select-trigger-text">
                        {activeCategoryData.name} <span className="select-trigger-count">({activeCategoryData.images.length})</span>
                    </span>
                    <div className="category-select-arrow" aria-hidden="true">
                        ▼
                    </div>
                </button>

                {isOpen && (
                    <ul className="category-dropdown-options" role="listbox">
                        {sortedCategories.map((category, index) => {
                            const isActive = category.id === activeCategory;
                            return (
                                <li
                                    key={category.id}
                                    role="option"
                                    aria-selected={isActive}
                                    className={`category-dropdown-option ${isActive ? "active" : ""}`}
                                    onClick={() => handleCategoryClick(category, index)}
                                >
                                    <span className="option-name">{category.name}</span>
                                    <span className="option-count">({category.images.length})</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

CategoryToggle.propTypes = {
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            images: PropTypes.array.isRequired,
        })
    ).isRequired,
    activeCategory: PropTypes.string.isRequired,
    onCategoryChange: PropTypes.func.isRequired,
};

export default CategoryToggle;
