import "./TidigareEvenemangStyles.css";

function TidigareEvenemang() {
  const pastEvents = [
    {
      title: "Julmarknad 2024",
      date: "15 December 2024",
      time: "12:00 - 18:00",
      description: "Lokal julmarknad med hantverk, konst och julstämning"
    },
    {
      title: "Akrylmålning - Nybörjarkurs",
      date: "8 November 2024",
      time: "10:00 - 15:00",
      description: "Heldag med akrylmålning för nybörjare"
    },
    {
      title: "Höstvernissage",
      date: "20 Oktober 2024",
      time: "17:00 - 20:00",
      description: "Utställning av lokala konstnärer med mingel"
    },
    {
      title: "Keramikworkshop",
      date: "5 Oktober 2024",
      time: "13:00 - 16:00",
      description: "Workshop i keramik och lerformning"
    },
    {
      title: "Sommargalleri 2024",
      date: "15 Juni 2024",
      time: "14:00 - 19:00",
      description: "Utställning av sommarkonst och skulpturer"
    },
    {
      title: "Vårmålning",
      date: "25 April 2024",
      time: "10:00 - 14:00",
      description: "Målarkurs med våren som tema"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TidigareEvenemang;
