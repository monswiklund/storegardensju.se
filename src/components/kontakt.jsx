import React from "react";

function Kontakt() {
    return (
        <div className="kontakt-container">
            <h2>Kontakta Oss</h2>
            <div className="kontakt-box">
                <p>Har du frågor? Tveka inte att höra av dig till oss!</p>
                <p><strong>E-post:</strong> <a href="mailto:info@storegardensju.se">info@storegardensju.se</a></p>
                <p>Eller skicka ett meddelande till våran Instagram:</p>
                <p><a href="https://www.instagram.com/storegarden7/" target="_blank" rel="noopener noreferrer">@storegarden7</a></p>
            </div>
        </div>
    );
}

export default Kontakt;