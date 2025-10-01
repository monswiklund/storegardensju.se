import "./SkapandeStyles.css";

function Skapande() {
  return (
    <section id="skapande-section" className="skapande-section" aria-labelledby="skapande-heading">
      <div className="skapande-container">
        <h2 id="skapande-heading">Skapande - Målning & Lera</h2>

        <div className="skapande-content">
          <div className="skapande-text">
            <h3>Kreativa workshops i inspirerande miljö</h3>
            <p>
              Upptäck din kreativa sida med våra workshops i målning och lera.
              I vår ljusa och välkomnande lokal får du möjlighet att skapa konst
              under professionell guidning.
            </p>
            <p>
              Våra kurser passar både nybörjare och mer erfarna konstnärer.
              Vi erbjuder både enskilda tillfällen och
              längre kursomgångar.
            </p>
          </div>

          <div className="skapande-info">
            <h4>Vad vi erbjuder:</h4>
            <ul>
              <li>Målningskurser i olika tekniker</li>
              <li>Keramik och lerarbete</li>
              <li>Workshops för alla nivåer</li>
              <li>Privata kurser och teambuilding</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Skapande;
