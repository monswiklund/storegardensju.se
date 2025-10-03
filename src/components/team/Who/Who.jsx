import TeamMemberProfile from "../TeamMemberProfile.jsx";

function Who() {
    return (
        <div className="who-container">
            <h2 id="about-heading">Om Oss</h2>
            <TeamMemberProfile profileId="ann" />
            <TeamMemberProfile profileId="carl" />
            <TeamMemberProfile profileId="lina" />
            <TeamMemberProfile profileId="mans" />
        </div>
    );
}

export default Who;
