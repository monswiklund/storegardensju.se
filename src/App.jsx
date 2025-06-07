// Komplett App-struktur med alla komponenter

// App.jsx
import Vilka from "./components/Vilka.jsx";
import VälkomstText from "./components/VälkomstText.jsx";
import VälkomstBild from "./components/VälkomstBild.jsx";
import Kontakt from "./components/Kontakt.jsx";
import FadeInSection from "./components/FadeInSection.jsx";
import ExpandableImageGallery from "./components/ExpandableImageGallery.jsx";
import ScrollToTopButton from "./components/ScrollToTopButton.jsx";

function App() {
    return (
        <>
            <FadeInSection>
            <VälkomstBild/>
                <ExpandableImageGallery/>
            <VälkomstText/>
            <Kontakt/>
            <Vilka/>
            </FadeInSection>
            <ScrollToTopButton/>
        </>
    );
}

export default App;