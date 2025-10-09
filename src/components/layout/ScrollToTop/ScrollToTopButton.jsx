// ScrollToTopButton.jsx
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import './ScrollToTop.css';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Kontrollera scroll-positionen för att avgöra om knappen ska visas
    useEffect(() => {
        const toggleVisibility = () => {
            // Visa knappen när användaren har scrollat ner minst 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Lägg till scroll-event listener
        window.addEventListener('scroll', toggleVisibility);

        // Ta bort event listener vid cleanup
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // Funktion för att scrolla tillbaka till toppen av sidan
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Ger en mjuk scrollning-animation
        });
    };

    return (
        <button
            className={`scroll-to-top ${isVisible ? 'visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Scrolla till toppen"
            title="Tillbaka upp"
        >
            <ChevronUp size={20} />
            <span>Tillbaka upp</span>
        </button>
    );
};

export default ScrollToTopButton;