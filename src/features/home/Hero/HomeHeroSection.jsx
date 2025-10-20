import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import welcomeImage from "../../../assets/logoTransp_cropped.png";
import { heroContent } from "../../../data/homeContent.js";
import "./Hero.css";
import HomeHeroLogo from "./HomeHeroLogo.jsx";
import HomeHeroContent from "./HomeHeroContent.jsx";

function HomeHeroSection() {
    const navigate = useNavigate();
    const { title, subtitle, paragraphs, primaryCta, secondaryCtas } = heroContent;

    const heroRef = useRef(null);
    const logoRef = useRef(null);
    const contentRef = useRef(null);
    const indicatorTimeoutRef = useRef(null);
    const timelineRef = useRef(null);
    const [isScrollIndicatorVisible, setIsScrollIndicatorVisible] = useState(false);

    const handlePrimaryCta = () => {
        document
            .querySelector(".contact-container")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const handleSecondaryRoute = to => navigate(to);
    const handleScrollIndicatorClick = () => {
        if (typeof window === "undefined") return;
        const target = contentRef.current;
        if (!target) return;

        const navbarHeight = document.querySelector(".navbar")?.getBoundingClientRect()?.height ?? 0;
        const timeline = timelineRef.current;
        const computeAndScroll = () => {
            const targetRect = target.getBoundingClientRect();
            const scrollTarget = window.scrollY + targetRect.top - navbarHeight - 12;

            window.scrollTo({
                top: Math.max(scrollTarget, 0),
                behavior: "smooth",
            });
        };
        const prepareScroll = () => {
            if (timeline?.scrollTrigger && timeline.scrollTrigger.isActive) {
                const st = timeline.scrollTrigger;
                st.scroll(st.end - 1);
                window.requestAnimationFrame(computeAndScroll);
            } else {
                computeAndScroll();
            }
        };

        if ("requestAnimationFrame" in window) {
            window.requestAnimationFrame(prepareScroll);
        } else {
            prepareScroll();
        }
    };

    useLayoutEffect(() => {
        if (typeof window === "undefined") return;
        if (!heroRef.current || !logoRef.current || !contentRef.current) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (prefersReducedMotion.matches) return;

        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
                pin: true,
            },
            defaults: { ease: "power2.out", duration: 1.2 },
        });

        tl.to(logoRef.current, { yPercent: -30 })
            .fromTo(
                contentRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0 },
                "<"
            );
        timelineRef.current = tl;

        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
            timelineRef.current = null;
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

    return (
        <div className="hero-container" ref={heroRef}>
            <HomeHeroLogo
                ref={logoRef}
                imageSrc={welcomeImage}
                alt="Storegården 7 logotyp"
            />
            <button
                type="button"
                className={`hero-scroll-indicator${isScrollIndicatorVisible ? " is-visible" : ""}`}
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
