import "./ContactStyles.css";

function Contact() {
    return (
        <div className="contact-container">
            <h2 id="contact-heading">Kontakta oss</h2>
            <p className="contact-subtitle">
                Har du frågor eller vill boka in ditt nästa evenemang? Tveka inte att höra av dig!
            </p>

            <div className="contact-cards">
                <a
                    href="mailto:storegardensju@gmail.com"
                    className="contact-card"
                    aria-label="Skicka e-post till storegardensju@gmail.com"
                >
                    <div className="contact-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <path d="m2 7 10 7 10-7"/>
                        </svg>
                    </div>
                    <h3>E-post</h3>
                    <p className="contact-info">storegardensju@gmail.com</p>
                </a>

                <a
                    href="https://www.instagram.com/storegarden7/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-card"
                    aria-label="Besök oss på Instagram @storegarden7"
                >
                    <div className="contact-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                    </div>
                    <h3>Instagram</h3>
                    <p className="contact-info">@storegarden7</p>
                </a>
            </div>

            <div className="services">

            <h3>Samarbeta med oss</h3>
            <p>
                Vi samarbetar gärna med andra som har idéer eller vill ställa ut konst, arrangera evenemang eller skapa något kreativt.
                Hör av dig så diskuterar vi möjligheterna!
            </p>
            </div>
        </div>
    );
}

export default Contact;