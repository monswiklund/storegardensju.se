// Exempel på hur man använder profilerna i Profile.jsx:
import PropTypes from 'prop-types';
import Card from './Card';
import { profiles } from '../data/profileData';

const Profile = ({ profileId }) => {
    return <Card {...profiles[profileId]} />;
};

Profile.propTypes = {
  profileId: PropTypes.string.isRequired
};

export default Profile;