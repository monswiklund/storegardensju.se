import { useEffect, useLayoutEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Navbar,
  CartDrawer,
  ScrollToTopButton,
  ScrollToTop,
  BuildInfo,
  Footer,
} from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import EventSubnav from "../components/layout/Navbar/EventSubnav.jsx";
import { ToastProvider } from "../contexts/ToastContext";
import { appRoutes } from "../config/routes.js";

gsap.registerPlugin(ScrollTrigger);

// Pages
import HomePage from "../pages/HomePage.jsx";
import EventPage from "../pages/EventPage/EventPage.jsx";
import MohippaPage from "../pages/MohippaPage.jsx";
import ArtPage from "../pages/ArtPage.jsx";
import GalleriPage from "../pages/GalleriPage.jsx";
import TeamPage from "../pages/TeamPage.jsx";
import AdminPage from "../pages/AdminPage/AdminPage.jsx";
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
      <ToastProvider>
        <ScrollToTop />
        <AppContent />
        <ScrollToTopButton />
      </ToastProvider>
    </Router>
  );
}

export default App;

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isHomePage = location.pathname === "/";
  const eventRoute = appRoutes.find((route) => route.path === "/event");
  const eventPaths = eventRoute
    ? [
        eventRoute.path,
        ...(eventRoute.children ?? []).map((child) => child.path),
      ]
    : [];
  const isEventSection = eventPaths.includes(location.pathname);

  useLayoutEffect(() => {
    if (isEventSection && !isAdminRoute) {
      document.body.classList.add("event-subnav-active");
    } else {
      document.body.classList.remove("event-subnav-active");
    }
  }, [isEventSection, isAdminRoute]);

  return (
    <div
      className={isAdminRoute ? "admin-app" : isHomePage ? "home-app" : "page-app"}
    >
      <Navbar />
      {!isAdminRoute && <EventSubnav isActive={isEventSection} />}
      <CartDrawer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/mohippa" element={<MohippaPage />} />
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
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      {!isAdminRoute && (
        <FadeInSection rootMargin="0px 0px 20% 0px" threshold={0.1}>
          <ContactSection />
        </FadeInSection>
      )}
      {!isAdminRoute && <Footer />}
    </div>
  );
}
