// Exempel på hur man använder profilerna i Profile.jsx:
import { memo } from 'react';
import PropTypes from 'prop-types';
import Card from './Card/Card.jsx';
import { profiles } from '../../data/profileData';

const TeamMemberProfile = memo(({ profileId }) => {
    return <Card {...profiles[profileId]} id={`${profileId}-card`} />;
});

TeamMemberProfile.displayName = 'TeamMemberProfile';

TeamMemberProfile.propTypes = {
  profileId: PropTypes.string.isRequired
};

export default TeamMemberProfile;