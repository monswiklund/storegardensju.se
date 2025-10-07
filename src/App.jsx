import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from "./components/layout/Navigation/Navbar.jsx";
import ScrollToTopButton from "./components/layout/ScrollToTop/ScrollToTopButton.jsx";
import ScrollToTop from "./components/layout/ScrollToTop/ScrollToTop.jsx";
import BuildInfo from "./components/ui/BuildInfo.jsx";

gsap.registerPlugin(ScrollTrigger);

// Pages
import HomePage from "./pages/HomePage.jsx";
import EventPage from "./pages/EventPage/EventPage.jsx";
import ArtPage from "./pages/ArtPage.jsx";
import GalleriPage from "./pages/GalleriPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";

function App() {
    // Initialize Lenis smooth scroll globally
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Connect Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(lenis.raf);
        };
    }, []);

    return (
        <Router>
            <ScrollToTop />
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/event" element={<EventPage />} />
                <Route path="/konst" element={<ArtPage />} />
                <Route path="/galleri" element={<GalleriPage />} />
                <Route path="/om-oss" element={<TeamPage />} />
            </Routes>

            <footer role="contentinfo" className="site-footer">
                <BuildInfo />
            </footer>

            <ScrollToTopButton/>
        </Router>
    );
}

export default App;