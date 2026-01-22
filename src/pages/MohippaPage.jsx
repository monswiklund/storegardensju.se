import { useEffect } from "react";
import { PageSection } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { 
  Heart, 
  Clock, 
  MapPin, 
  Coffee, 
  Music, 
  Utensils, 
  Sparkles, 
  PartyPopper,
  CheckCircle2,
  Calendar
} from "lucide-react";
import "./MohippaPage.css";

const ACTIVITIES = [
  {
    title: "Yoga",
    duration: "1 h",
    description:
      "Ett guidat yogapass anpassat för gruppen. Mattor finns på plats. Tips: Köp gärna med eget bubbel för en extra festlig stämning.",
    price: "200 kr/person",
    image: "/images/event/hero/yoga-placeholder.jpg",
  },
  {
    title: "Skapande med färg",
    description:
      "Måla din egen tavla. En kreativ målarkurs där ni får testa olika tekniker. Tavla, färg och utrustning ingår.",
    price: "300 kr/person",
    image: "/images/event/konstafton-2025.jpg",
  },
  {
    title: "Skapa ditt eget collage",
    description:
      "Bläddra igenom tidningar, böcker och klipp. Klistra och skapa din egen vision eller moodboard. Vi bidrar med inspiration och idéer.",
    price: "100 kr/person",
    image: "/images/evenemang/slide10.jpg",
  },
  {
    title: "Cocktailkurs",
    description:
      "Lär er konsten att blanda goda drinkar. Vi går igenom hur ni skapar två valfria drinkar. Ni köper själva in alkohol, vi står för utrustning, juicer, mixers och garnityr.",
    price: "300 kr/person",
    image: "/images/evenemang/slide2.jpg",
  },
  {
    title: "Måla din egen keramikskål",
    description:
      "Alla får varsin handgjord keramikskål. Pennor för porslin ingår för att dekorera era verk. Ni bränner sedan fast motivet hemma i ugnen (160 grader i 1,5 h).",
    price: "400 kr/person",
    image: "/images/konst-keramik/slide16.jpg",
  },
];

const BASE_FEATURES = [
  {
    title: "Konsultation",
    text: "Möte på Storegården 7 där vi planerar och styr upp eran dag.",
    icon: <Calendar size={20} />
  },
  {
    title: "Välkomstskål",
    text: "Vi förbereder den dryck ni själva köpt in och lämnat dagen innan för kylning.",
    icon: <Heart size={20} />
  },
  {
    title: "Miljö",
    text: "Uppdukat och dekorat inomhus.",
    icon: <Sparkles size={20} />
  },
  {
    title: "Musik",
    text: "Vi sköter ljud och musik (skicka gärna egen spellista).",
    icon: <Music size={20} />
  },
  {
    title: "Mat",
    text: "Ni köper maten själva, så hanterar vi och lägger upp den (möjlighet att lämna maten dagen innan finns).",
    icon: <Utensils size={20} />
  }
];

function MohippaPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mohippa-page">
      <main>
        {/* Base Package */}
        <PageSection background="white" spacing="default" id="mohippa-paket">
          <FadeInSection>
            <div className="mohippa-base-package">
              <div className="mohippa-base-info">
                <div className="package-header">
                  <h3>Baspaketet</h3>
                </div>
                <p className="package-intro-text">
                  Ni får tillgång till vår lokal, både ladan och loftet samt tillhörande uteplatser. 
                  Ni har tillgång 10:00 – 22:00.
                </p>
                <div className="mohippa-base-grid">
                  {BASE_FEATURES.map((feature, idx) => (
                    <div key={idx} className="base-feature-item">
                      <div className="feature-icon-wrapper">
                        {feature.icon}
                      </div>
                      <div className="feature-text">
                        <strong>{feature.title}:</strong> {feature.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="package-price-box">
                  <span className="price-label">Pris:</span>
                  <span className="price-value">500 kr / person</span>
                </div>
              </div>
              <div className="mohippa-base-details">
                <div className="details-refined">
                  <h4>Bra att veta</h4>
                  <ul className="details-list">
                    <li>Möjlighet att lämna mat och dryck för kylning dagen innan.</li>
                    <li>Vi finns på plats under dagen för att hjälpa till med allt det praktiska.</li>
                    <li>Vi tar hand om disk och städning så att ni kan fokusera helt på bruden.</li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeInSection>
        </PageSection>

        {/* Activities */}
        <PageSection
          background="alt"
          spacing="default"
          className="mohippa-activities-section"
        >
          <FadeInSection>
            <div className="activities-intro">
              <h2 id="mohippa-aktiviteter">Tillval & aktiviteter</h2>
              <p>Gör dagen ännu mer minnesvärd med våra kreativa workshops</p>
            </div>
            
            <div className="mohippa-activities-list">
              {ACTIVITIES.map((activity, index) => (
                <div key={index} className="activity-list-item">
                  <div className="activity-list-content">
                    <div className="activity-list-header">
                      <h3>{activity.title}</h3>
                      {activity.duration && (
                        <span className="activity-duration-badge">
                          <Clock size={12} />
                          {activity.duration}
                        </span>
                      )}
                    </div>
                    <p>{activity.description}</p>
                    {activity.tip && (
                      <div className="activity-list-tip">
                        <strong>Tips:</strong> {activity.tip}
                      </div>
                    )}
                  </div>
                  <div className="activity-list-price">
                    <span className="price-amount">{activity.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </PageSection>

        {/* CTA */}
        <PageSection background="white" spacing="default">
          <FadeInSection>
            <div className="mohippa-cta-refined">
              <span className="cta-tag">Planera er dag</span>
              <h2>Vill ni boka eller veta mer?</h2>
              <p>
                Vi hjälper er gärna att skräddarsy en oförglömlig dag för blivande bruden. 
                Hör av er med era önskemål så återkommer vi med förslag.
              </p>
              <div className="cta-action-group">
                <a href="mailto:bylinawiklund@gmail.com" className="btn-cta-new">
                  Skicka en förfrågan
                </a>
                <span className="cta-email-display">Kontakt: bylinawiklund@gmail.com</span>
              </div>
            </div>
          </FadeInSection>
        </PageSection>
      </main>
    </div>
  );
}

export default MohippaPage;
