import "./TidigareEvenemangStyles.css";

function TidigareEvenemang() {
  const pastEvents = [
    {
      title: "Västra Kållands Kulturrunda",
      date: "29 Maj 2024",
      time: "10:00 - 17:00",
      description: "Kom och häng på Storegården 7, ta en kaffe i solen, gå in i Ann's ateljé med konst över hela väggarna, fynda på loppisen och ta ett djupt andetag på denna drömmiga plats!",
        location: "Storegården 7, Rackeby"
    },
    {
      title: "Helgkurs Keramik",
      date: "22-23 November 2024",
      time: "17:00 - 21:00\n10:00 - 16:00",
      description: "Både för nybörjare och dig som provat tidigare. Tillkommer ett glaseringstillfälle.",
      location: "Skaparverkstaden, Rörstrand, Lidköping"
    },
    {
      title: "Helgkurs Keramik",
      date: "7-8 November 2024",
      time: "17:00-21:00\n10:00-16:00",
      description: "Både för nybörjare och dig som provat tidigare. Tillkommer ett glaseringstillfälle.",
      location: "Skaparverkstaden, Rörstrand, Lidköping"
    }
  ];

  return (
    <section id="tidigare-evenemang-section" className="tidigare-evenemang-section" aria-labelledby="tidigare-evenemang-heading">
      <div className="tidigare-evenemang-container">
        <h2 id="tidigare-evenemang-heading">Tidigare evenemang</h2>
        <p className="tidigare-evenemang-intro">
          Ett urval av våra tidigare workshops, kurser och evenemang.
        </p>

        <div className="past-events-grid">
          {pastEvents.map((event, index) => (
            <div key={index} className="past-event-card">
              <h3 className="past-event-title">{event.title}</h3>
              <div className="past-event-meta">
                <span className="past-event-date">{event.date}</span>
                <span className="past-event-time">{event.time}</span>
              </div>
              <p className="past-event-description">{event.description}</p>
              {event.location && (
                <p className="past-event-location">{event.location}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TidigareEvenemang;
