import "./ValueProposition.css";

function HomeValuePropositionSection() {
  const values = [
    {
      title: "Lantligt läge",
      description: "15 minuter från Lidköpings centrum, omgivet av natur och lugn",
      link: "https://www.google.com/maps/place/Storeg%C3%A5rden+7/@58.5741102,13.0274976,1253m/data=!3m2!1e3!4b1!4m6!3m5!1s0x465b29cb4b35b863:0xd0f867a1fbdcc24f!8m2!3d58.5741102!4d13.0300779!16s%2Fg%2F11vx72yztc?entry=ttu&g_ep=EgoyMDI1MDkyOC4wIKXMDSoASAFQAw%3D%3D",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      )
    },
    {
      title: "Flexibel kapacitet",
      description: "Plats för 10-140 gäster beroende på arrangemang",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      title: "Mångsidig lokal",
      description: "Perfekt för kurser, evenemang, utställningar och fester",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      )
    }
  ];

  return (
    <section className="value-proposition-section" aria-labelledby="value-props-heading">
      <div className="value-proposition-container">
        <h2 id="value-props-heading" className="sr-only">Våra fördelar</h2>
        <div className="value-props-grid">
          {values.map((value, index) => {
            const CardContent = (
              <>
                <div className="value-icon">
                  {value.icon}
                </div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </>
            );

            return value.link ? (
              <a
                key={index}
                href={value.link}
                target="_blank"
                rel="noopener noreferrer"
                className="value-prop-card value-prop-link"
              >
                {CardContent}
              </a>
            ) : (
              <div key={index} className="value-prop-card">
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HomeValuePropositionSection;
