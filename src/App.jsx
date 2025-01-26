// Komplett App-struktur med alla komponenter

// App.jsx
import React from "react";
import Vilka from "./components/vilka.jsx";
import VälkomstText from "./components/VälkomstText.jsx";
import Card from "./components/Card.jsx";
import VälkomstBild from "./components/VälkomstBild.jsx";
import ImageSlider from "./components/ImageSlider.jsx";
import Kontakt from "./components/kontakt.jsx";
import { profiles } from './data/profileData.js';

function App() {
    return (
        <>
            <VälkomstBild/>
            <ImageSlider/>
            <VälkomstText/>
            <Kontakt/>
            <Vilka/>
        </>
    );
}

export default App;