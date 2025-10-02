import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar.jsx";
import Kontakt from "./components/Kontakt.jsx";
import FadeInSection from "./components/FadeInSection.jsx";
import ScrollToTopButton from "./components/ScrollToTopButton.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import BuildInfo from "./components/BuildInfo.jsx";

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
            <a href="#main-content" className="skip-link">Hoppa till huvudinnehåll</a>

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