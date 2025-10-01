import Profile from "./Profile";

function Vilka() {
    return (
        <div className="vilka-container">
            <h2 id="about-heading">Om Oss</h2>
            <Profile profileId="ann" />
            <Profile profileId="carl" />
            <Profile profileId="lina" />
            <Profile profileId="mans" />
        </div>
    );
}

export default Vilka;