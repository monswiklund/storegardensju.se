import { useLayoutEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import welcomeImage from "../../../assets/logoTransp_cropped.png"
import { heroContent } from "../../../data/homeContent.js"
import "./Hero.css"
import HomeHeroLogo from "./HomeHeroLogo.jsx"
import HomeHeroContent from "./HomeHeroContent.jsx"

function HomeHeroSection() {
    const navigate = useNavigate()
    const { title, subtitle, paragraphs, primaryCta, secondaryCtas } = heroContent

    const heroRef = useRef(null)
    const logoRef = useRef(null)
    const contentRef = useRef(null)

    const handlePrimaryCta = () => {
        document.querySelector(".contact-container")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        })
    }

    const handleSecondaryRoute = to => navigate(to)

    useLayoutEffect(() => {
        if (typeof window === "undefined") return
        if (!heroRef.current || !logoRef.current || !contentRef.current) return

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
        if (prefersReducedMotion.matches) return // skip animation

        gsap.registerPlugin(ScrollTrigger)

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
                pin: true,
            },
            defaults: { ease: "power2.out", duration: 1 },
        })

        tl.to(logoRef.current, { yPercent: -30 })
            .from(contentRef.current, { autoAlpha: 0, y: 40 }, "<")

        return () => tl.scrollTrigger?.kill()
    }, [])

    return (
        <div className="hero-container" ref={heroRef}>
            <HomeHeroLogo
                ref={logoRef}
                imageSrc={welcomeImage}
                alt="Storegården 7 logotyp"
            />
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
    )
}

export default HomeHeroSection