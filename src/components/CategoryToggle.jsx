import { useState, useEffect, useRef } from "react";
import "./CategoryToggle.css";

function CategoryToggle({ categories, activeCategory, onCategoryChange }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef(null);
    const buttonRefs = useRef([]);

    // Update selected index when active category changes
    useEffect(() => {
        const index = categories.findIndex(cat => cat.id === activeCategory);
        if (index !== -1) {
            setSelectedIndex(index);
        }
    }, [activeCategory, categories]);

    // Scroll to active button on mobile
    useEffect(() => {
        if (buttonRefs.current[selectedIndex] && containerRef.current) {
            const button = buttonRefs.current[selectedIndex];
            const container = containerRef.current;

            // Check if we're on mobile (container is scrollable)
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

    const handleCategoryClick = (category, index) => {
        setSelectedIndex(index);
        onCategoryChange(category.id);
    };

    return (
        <div className="category-toggle">
            <div className="category-toggle-container" ref={containerRef}>
                {categories.map((category, index) => (
                    <button
                        key={category.id}
                        ref={el => buttonRefs.current[index] = el}
                        className={`category-button ${index === selectedIndex ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(category, index)}
                        aria-label={`Visa ${category.name} (${category.images.length} bilder)`}
                    >
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">({category.images.length})</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default CategoryToggle;