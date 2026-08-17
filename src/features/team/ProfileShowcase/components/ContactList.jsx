import PropTypes from "prop-types";
import {
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Github,
  Instagram,
  Globe,
} from "lucide-react";

import { useSiteCopy } from "../../../../hooks/usePageCopy";

const buildExternalLink = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

function ContactList({ contact = null }) {
  const siteCopy = useSiteCopy();
  if (!contact || Object.keys(contact).length === 0) {
    return null;
  }

  const contactConfig = [
    {
      key: "phone",
      icon: Phone,
      getContent: (value) => value,
      getHref: (value) => `tel:${value}`,
    },
    {
      key: "email",
      icon: Mail,
      getContent: (value) => value,
      getHref: (value) => `mailto:${value}`,
    },
    {
      key: "address",
      icon: MapPin,
      getContent: (value) => value,
    },
    {
      key: "github",
      icon: Github,
      getContent: () => "GitHub",
      getHref: (value) => buildExternalLink(value),
      external: true,
    },
    {
      key: "linkedin",
      icon: Linkedin,
      getContent: () => "LinkedIn",
      getHref: (value) => buildExternalLink(value),
      external: true,
    },
    {
      key: "instagram",
      icon: Instagram,
      getContent: () => "Instagram",
      getHref: (value) => buildExternalLink(value),
      external: true,
    },
    {
      key: "webpage",
      icon: Globe,
      getContent: () => siteCopy("team.website") || "Hemsida",
      getHref: (value) => buildExternalLink(value),
      external: true,
    },
  ];

  return (
    <div className="profile-contact">
      <h4>{siteCopy("team.contact-heading")}</h4>
      <ul className="showcase-contact-list">
        {contactConfig.map(({ key, icon: Icon, getContent, getHref, external }) => {
          const value = contact[key];
          if (!value) return null;

          const content = getContent ? getContent(value) : value;
          const href = getHref ? getHref(value) : null;
          const linkProps = external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};

          return (
            <li key={key} className="showcase-contact-item">
              <Icon size={16} />
              {href ? (
                <a href={href} {...linkProps}>
                  {content}
                </a>
              ) : (
                <span>{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

ContactList.propTypes = {
  contact: PropTypes.shape({
    phone: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    github: PropTypes.string,
    linkedin: PropTypes.string,
    instagram: PropTypes.string,
    webpage: PropTypes.string,
  }),
};

export default ContactList;
