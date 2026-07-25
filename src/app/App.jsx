import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import {
  Navbar,
  CartDrawer,
  ScrollToTopButton,
  ScrollToTop,
  Footer,
  SectionDivider,
} from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import EventSubnav from "../components/layout/Navbar/EventSubnav.jsx";
import PageTransition from "../components/layout/PageTransition/PageTransition.jsx";
import HomeInstagramSection from "../features/home/InstagramFeed/HomeInstagramSection.jsx";
import { ToastProvider } from "../contexts/ToastContext";
import { appRoutes } from "../config/routes.js";

// Pages — HomePage eager (initial route/LCP), rest lazy per route
import HomePage from "../pages/HomePage.jsx";
const EventPage = lazy(() => import("../pages/EventPage/EventPage.jsx"));
const MohippaPage = lazy(() => import("../pages/MohippaPage.jsx"));
const ArtPage = lazy(() => import("../pages/ArtPage.jsx"));
const GalleriPage = lazy(() => import("../pages/GalleriPage.jsx"));
const TeamPage = lazy(() => import("../pages/TeamPage.jsx"));
const MansPortfolioPage = lazy(() => import("../pages/MansPortfolioPage.jsx"));
const KurserPage = lazy(() => import("../pages/KurserPage.jsx"));
const AdminPage = lazy(() => import("../pages/AdminPage/AdminPage.jsx"));
// BUTIK
const ButikPage = lazy(() => import("../pages/ButikPage.jsx"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage.jsx"));
const CartPage = lazy(() => import("../pages/CartPage.jsx"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage/CheckoutPage.jsx"));
const SuccessPage = lazy(() => import("../pages/SuccessPage.jsx"));
const CancelPage = lazy(() => import("../pages/CancelPage.jsx"));
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

  // Initialize Lenis smooth scroll globally when motion is allowed.
  // Lenis/GSAP loaded dynamically to keep them out of the initial bundle.
  useEffect(() => {
    let cancelled = false;
    let cleanup;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      if (prefersReducedMotion) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        return;
      }

      const { default: Lenis } = await import("lenis");
      if (cancelled) return;

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
      });

      window.storegardenLenis = lenis;

      // Connect Lenis with GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      const tickerCallback = (time) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        if (window.storegardenLenis === lenis) {
          window.storegardenLenis = null;
        }
        lenis.destroy();
        gsap.ticker.remove(tickerCallback);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
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
  const isTeamPage = location.pathname.startsWith("/om-oss");
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
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <EventSubnav isActive={isEventSection} />}
      {!isAdminRoute && <CartDrawer />}
      <Suspense fallback={null}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event" element={<EventPage />} />
            <Route path="/gruppdagar" element={<MohippaPage />} />
            <Route path="/mohippa" element={<MohippaPage />} />
            <Route path="/konst" element={<ArtPage />} />
            <Route path="/kurser" element={<KurserPage />} />
            <Route path="/galleri" element={<GalleriPage />} />
            {/* BUTIK */}
            <Route path="/butik" element={<ButikPage />} />
            <Route path="/butik/:productId" element={<ProductDetailPage />} />
            <Route path="/varukorg" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<CancelPage />} />
            <Route path="/om-oss" element={<TeamPage />} />
            <Route path="/om-oss/portfolj/mans" element={<MansPortfolioPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </PageTransition>
      </Suspense>
      {!isAdminRoute && !isTeamPage && (
        <FadeInSection rootMargin="0px 0px 20% 0px" threshold={0.1}>
          <ContactSection />
        </FadeInSection>
      )}
      {!isAdminRoute && !isTeamPage && (
        <SectionDivider above="alt" below="green" variant="wave" />
      )}
      {!isAdminRoute && !isTeamPage && (
        <FadeInSection rootMargin="0px 0px 20% 0px" threshold={0.1}>
          <HomeInstagramSection />
        </FadeInSection>
      )}
      {!isAdminRoute && !isTeamPage && (
        <SectionDivider above="green" below="alt" variant="hill" />
      )}
      {!isAdminRoute && <Footer />}
    </div>
  );
}
