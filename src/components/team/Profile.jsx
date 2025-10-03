// Exempel på hur man använder profilerna i Profile.jsx:
import { memo } from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import { profiles } from '../data/profileData';

const Profile = memo(({ profileId }) => {
    return <Card {...profiles[profileId]} id={`${profileId}-card`} />;
});

Profile.displayName = 'Profile';

Profile.propTypes = {
  profileId: PropTypes.string.isRequired
};

export default Profile;