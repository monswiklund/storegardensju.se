import EventFest from "../components/EventFest.jsx";
import KommandeEvenemang from "../components/KommandeEvenemang.jsx";
import FadeInSection from "../components/FadeInSection.jsx";
import PageSection from "../components/PageSection.jsx";

function EventPage() {
    return (
        <main role="main" id="main-content">
            {/* Event & Fest */}
            <PageSection background="white" ariaLabel="event-fest-heading">
                <FadeInSection>
                    <EventFest/>
                </FadeInSection>
            </PageSection>

        </main>
    );
}

export default EventPage;
