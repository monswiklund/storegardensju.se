import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import welcomeImage from "../../../assets/logoTransp_cropped.png";
import { heroContent } from "../../../data/homeContent.js";
import "./Hero.css";
import HomeHeroLogo from "./HomeHeroLogo.jsx";
import HomeHeroContent from "./HomeHeroContent.jsx";

function HomeHeroSection() {
    const navigate = useNavigate();
    const { title, subtitle, paragraphs, primaryCta, secondaryCtas } = heroContent;

    const logoRef = useRef(null);
    const contentRef = useRef(null);
    const indicatorTimeoutRef = useRef(null);
    const hideTimeoutRef = useRef(null);
    const [isScrollIndicatorVisible, setIsScrollIndicatorVisible] = useState(false);
    const [isIndicatorDismissed, setIsIndicatorDismissed] = useState(false);
    const [isIndicatorRemoved, setIsIndicatorRemoved] = useState(false);

    const handlePrimaryCta = () => {
        document
            .querySelector(".contact-container")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const handleSecondaryRoute = to => navigate(to);
    const dismissIndicator = useCallback(() => {
        if (isIndicatorDismissed) return;
        setIsScrollIndicatorVisible(false);
        setIsIndicatorDismissed(true);
    }, [isIndicatorDismissed]);
    const handleScrollIndicatorClick = () => {
        if (typeof window === "undefined") return;
        const target = contentRef.current;
        if (!target) return;

        dismissIndicator();

        const navbarHeight = document.querySelector(".navbar")?.getBoundingClientRect()?.height ?? 0;

        const scroll = () => {
            const targetRect = target.getBoundingClientRect();
            const targetCenter = window.scrollY + targetRect.top + targetRect.height / 2;
            const desiredCenter = (window.innerHeight + navbarHeight) / 2;
            const scrollTarget = targetCenter - desiredCenter;

            window.scrollTo({
                top: Math.max(scrollTarget, 0),
                behavior: "smooth",
            });
        };

        if ("requestAnimationFrame" in window) {
            window.requestAnimationFrame(scroll);
        } else {
            scroll();
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return undefined;
        const contentElement = contentRef.current;
        if (!contentElement) return undefined;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (prefersReducedMotion.matches) {
            contentElement.classList.add("is-visible");
            return () => {};
        }

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.35 },
        );

        observer.observe(contentElement);

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const logoElement = logoRef.current?.querySelector("img");
        if (!logoElement) return undefined;

        const revealWithDelay = () => {
            if (indicatorTimeoutRef.current !== null) return;
            indicatorTimeoutRef.current = window.setTimeout(() => {
                setIsScrollIndicatorVisible(true);
                indicatorTimeoutRef.current = null;
            }, 2600);
        };

        const clearPendingTimeout = () => {
            if (indicatorTimeoutRef.current !== null) {
                clearTimeout(indicatorTimeoutRef.current);
                indicatorTimeoutRef.current = null;
            }
        };

        if (logoElement.complete) {
            revealWithDelay();
            return () => {
                clearPendingTimeout();
            };
        }

        logoElement.addEventListener("load", revealWithDelay);
        return () => {
            logoElement.removeEventListener("load", revealWithDelay);
            clearPendingTimeout();
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;
        if (isIndicatorDismissed) return undefined;
        const target = contentRef.current;
        if (!target) return undefined;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    dismissIndicator();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.3,
        });

        observer.observe(target);
        return () => observer.disconnect();
    }, [dismissIndicator, isIndicatorDismissed]);

    useEffect(() => {
        if (!isIndicatorDismissed || isIndicatorRemoved) return undefined;
        if (typeof window === "undefined") {
            setIsIndicatorRemoved(true);
            return undefined;
        }

        hideTimeoutRef.current = window.setTimeout(() => {
            setIsIndicatorRemoved(true);
            hideTimeoutRef.current = null;
        }, 360);

        return () => {
            if (hideTimeoutRef.current !== null) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
        };
    }, [isIndicatorDismissed, isIndicatorRemoved]);

    return (
        <div className="hero-wrapper">
            <div className="hero-container">
                <HomeHeroLogo
                    ref={logoRef}
                    imageSrc={welcomeImage}
                    alt="Storegården 7 logotyp"
                />
                {!isIndicatorRemoved && (
                    <button
                        type="button"
                        className={`hero-scroll-indicator${isScrollIndicatorVisible && !isIndicatorDismissed ? " is-visible" : ""}${isIndicatorDismissed ? " is-fading-out" : ""}`}
                        onClick={handleScrollIndicatorClick}
                        aria-label="Skrolla ned för att upptäcka mer innehåll"
                    >
                        <span className="hero-scroll-indicator-label">Skrolla för att upptäcka mer</span>
                        <svg
                            className="hero-scroll-indicator-icon"
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M12 5v14m0 0-6-6m6 6 6-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}
            </div>
            <HomeHeroContent
                ref={contentRef}
                title={title}
                subtitle={subtitle}
                paragraphs={paragraphs}
                primaryCta={primaryCta}
                secondaryCtas={secondaryCtas}
                onPrimaryClick={handlePrimaryCta}
                onRouteClick={handleSecondaryRoute}
            />
        </div>
    );
}

export default HomeHeroSection;
