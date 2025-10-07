import { contactMethods, collaborationCopy } from "../../data/contact.js";
import "./ContactStyles.css";

const iconMap = {
    mail: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m2 7 10 7 10-7"/>
        </svg>
    ),
    instagram: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
    )
};

function Contact() {
    return (
        <div className="contact-container">
            <h2 id="contact-heading">Kontakta oss</h2>
            <p className="contact-subtitle">
                Har du frågor eller vill boka in ditt nästa evenemang? Tveka inte att höra av dig!
            </p>

            <div className="contact-cards">
                {contactMethods.map((method) => {
                    const icon = iconMap[method.icon];
                    const externalProps = method.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {};

                    return (
                        <a
                            key={method.id}
                            href={method.href}
                            className="contact-card"
                            aria-label={method.ariaLabel}
                            {...externalProps}
                        >
                            <div className="contact-icon">
                                {icon}
                            </div>
                            <h3>{method.label}</h3>
                            <p className="contact-info">{method.display}</p>
                        </a>
                    );
                })}
            </div>

            <div className="services">

            <h3>{collaborationCopy.title}</h3>
            <p>
                {collaborationCopy.body}
            </p>
            </div>
        </div>
    );
}


export default Contact;
