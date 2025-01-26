// Exempel på hur man använder profilerna i Profile.jsx:
import React from 'react';
import Card from './Card';
import { profiles } from '../data/profileData';

const Profile = ({ profileId }) => {
    return <Card {...profiles[profileId]} />;
};

export default Profile;