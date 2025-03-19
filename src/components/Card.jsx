// components/Card.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Phone, Mail, MapPin, Linkedin, Github, Instagram, Globe } from 'lucide-react';

const Card = ({
                  title,
                  about,
                  texts = [],
                  listItems = [],
                  imageSrc,
                  imageAlt = "Profilbild",
                  contact = {}  // Ny prop för kontaktinformation
              }) => {
    return (
        <div className="card">
            {imageSrc && (
                <img
                    className="card-image"
                    src={imageSrc}
                    alt={imageAlt}
                />
            )}

            {title && <h2 className="card-name-title">{title}</h2>}
            {about && <h3 className="card-about">{about}</h3>}

            {texts.map((text, index) => (
                <p key={`text-${index}`} className={`card-text-${index + 1}`}>
                    {text}
                </p>
            ))}

            {listItems.length > 0 && (
                <ul className="card-list">
                    {listItems.map((item, index) => (
                        <li key={`list-${index}`}>{item}</li>
                    ))}
                </ul>
            )}

            {/* Ny kontaktsektion */}
            {Object.keys(contact).length > 0 && (
                <div className="contact-section">
                    <h3 className="contact-title">Kontakt</h3>
                    <ul className="contact-list">
                        {contact.phone && (
                            <li className="contact-item">
                                <Phone size={16} />
                                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                            </li>
                        )}
                        {contact.email && (
                            <li className="contact-item">
                                <Mail size={16} />
                                <a href={`mailto:${contact.email}`}>{contact.email}</a>
                            </li>
                        )}
                        {contact.address && (
                            <li className="contact-item">
                                <MapPin size={16} />
                                <span>{contact.address}</span>
                            </li>
                        )}
                        {contact.github && (
                            <li className="contact-item">
                                <Github size={16} />
                                <a href={`https://${contact.github}`} target="_blank" rel="noopener noreferrer">
                                    GitHub
                                </a>
                            </li>
                        )}
                        {contact.linkedin && (
                            <li className="contact-item">
                                <Linkedin size={16} />
                                <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer">
                                    LinkedIn
                                </a>
                            </li>
                        )}
                        {contact.instagram && (
                            <li className="contact-item">
                                <Instagram size={16} />
                                <a href={`https://${contact.instagram}`} target="_blank" rel="noopener noreferrer">
                                    Instagram
                                </a>
                            </li>
                        )}
                        {contact.webpage && (
                            <li className="contact-item">
                                <Globe size={16} />
                                <a href={`https://${contact.webpage}`} target="_blank" rel="noopener noreferrer">
                                    CW Konsulting & Event
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

Card.propTypes = {
    title: PropTypes.string,
    about: PropTypes.string,
    texts: PropTypes.arrayOf(PropTypes.string),
    listItems: PropTypes.arrayOf(PropTypes.string),
    imageSrc: PropTypes.string,
    imageAlt: PropTypes.string,
    contact: PropTypes.shape({
        phone: PropTypes.string,
        email: PropTypes.string,
        address: PropTypes.string,
        linkedin: PropTypes.string,
        github: PropTypes.string,
        instagram: PropTypes.string,
        webpage: PropTypes.string
    })
};

export default Card;