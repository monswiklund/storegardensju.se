import PropTypes from "prop-types";
import ContactList from "./ContactList";
import ActionButtons from "./ActionButtons";

function ProfileCard({ profile }) {
  return (
    <div className="profile-cell">
      {profile.imageSrc && (
        <img
          className="profile-image"
          src={profile.imageSrc}
          alt={profile.imageAlt || "Profilbild"}
        />
      )}

      {profile.title && (
        <h3 className="profile-title">{profile.title}</h3>
      )}

      {profile.about && (
        <p className="profile-about">{profile.about}</p>
      )}

      {profile.listItems && profile.listItems.length > 0 && (
        <div className="profile-skills">
          <ul>
            {profile.listItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <ContactList contact={profile.contact} />
      <ActionButtons actions={profile.actions} />
    </div>
  );
}

ProfileCard.propTypes = {
  profile: PropTypes.shape({
    title: PropTypes.string,
    about: PropTypes.string,
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
      webpage: PropTypes.string,
    }),
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        href: PropTypes.string.isRequired,
        primary: PropTypes.bool,
        external: PropTypes.bool,
      }),
    ),
  }).isRequired,
};

export default ProfileCard;
