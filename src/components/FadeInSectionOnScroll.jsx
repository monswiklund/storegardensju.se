import React, { useRef, useState, useEffect } from "react";

const FadeInOnScrollSection = ({ children }) => {
  const domRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasScrolled) {
        setIsVisible(true);
        observer.unobserve(domRef.current);
      }
    });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [hasScrolled]);

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? "is-visible" : ""}`}
    >
      {children}
    </div>
  );
};

export default FadeInOnScrollSection;

/*	•	hasScrolled State: Vi introducerar en hasScrolled state för att spåra om användaren har börjat scrolla. När window.scrollY > 0, uppdaterar vi hasScrolled till true.
	•	Scroll Listener: Vi lägger till en scroll-lyssnare på fönstret för att uppdatera hasScrolled när användaren börjar scrolla.
	•	IntersectionObserver: Vi använder IntersectionObserver som tidigare, men vi lägger till en kontroll för hasScrolled för att bara utlösa synlighetsförändringen när sidan har börjat scrolla och elementet är i visningsfönstret.*/
