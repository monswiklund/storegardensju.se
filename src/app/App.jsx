import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Navbar,
  ScrollToTopButton,
  ScrollToTop,
  BuildInfo,
} from "../components";

gsap.registerPlugin(ScrollTrigger);

// Pages
import HomePage from "../pages/HomePage.jsx";
import EventPage from "../pages/EventPage/EventPage.jsx";
import ArtPage from "../pages/ArtPage.jsx";
import GalleriPage from "../pages/GalleriPage.jsx";
import TeamPage from "../pages/TeamPage.jsx";
// BUTIK
import ButikPage from "../pages/ButikPage.jsx";
import ProductDetailPage from "../pages/ProductDetailPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage.jsx";
import SuccessPage from "../pages/SuccessPage.jsx";
import CancelPage from "../pages/CancelPage.jsx";
import { ContactSection } from "../features/contact";

function App() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) {
      setPrefersReducedMotion(false);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event) => setPrefersReducedMotion(event.matches);

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Initialize Lenis smooth scroll globally when motion is allowed
  useEffect(() => {
    if (prefersReducedMotion) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Connect Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerCallback);
    };
  }, [prefersReducedMotion]);

  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/konst" element={<ArtPage />} />
        <Route path="/galleri" element={<GalleriPage />} />
        {/* BUTIK */}
        <Route path="/butik" element={<ButikPage />} />
        <Route path="/butik/:productId" element={<ProductDetailPage />} />
        <Route path="/varukorg" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/om-oss" element={<TeamPage />} />
      </Routes>
      <ContactSection />
      <footer role="contentinfo" className="site-footer">
        <BuildInfo />
      </footer>

      <ScrollToTopButton />
    </Router>
  );
}

export default App;
