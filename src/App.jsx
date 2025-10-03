import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/layout/Navbar/Navbar.jsx";
import Kontakt from "./components/kontakt/kontakt.jsx";
import FadeInSection from "./components/ui/FadeInSection.jsx";
import ScrollToTopButton from "./components/layout/ScrollToTopButton.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import BuildInfo from "./components/ui/BuildInfo.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import EventPage from "./pages/EventPage.jsx";
import KonstPage from "./pages/KonstPage.jsx";
import GalleriPage from "./pages/GalleriPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/event" element={<EventPage />} />
                <Route path="/konst" element={<KonstPage />} />
                <Route path="/galleri" element={<GalleriPage />} />
                <Route path="/team" element={<TeamPage />} />
            </Routes>

            {/* Contact - Shared footer across all pages */}
            <section aria-labelledby="contact-heading" style={{background: 'linear-gradient(135deg, var(--background-warm) 0%, var(--background-alt) 100%)', padding: '100px 20px'}}>
                <FadeInSection>
                    <Kontakt/>
                </FadeInSection>
            </section>

            <footer role="contentinfo" className="site-footer">
                <BuildInfo />
            </footer>

            <ScrollToTopButton/>
        </Router>
    );
}

export default App;