import "./Services.css";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { services as servicesData } from "../../../data/homeContent.js";
import { useState, useRef, useEffect } from "react";

const HomeServicesSection = ({ excludeId, title = "Vad vi erbjuder", eyebrow = "VAD VI HAR" }) => {
  const [activeDomIndex, setActiveDomIndex] = useState(0);
  const containerRef = useRef(null);
  const initializedRef = useRef(false);
  const idleTimerRef = useRef(null);

  const filteredServices = excludeId
    ? servicesData.filter((service) => service.id !== excludeId)
    : servicesData;

  const L = filteredServices.length;

  // Tripled services for infinite scrolling
  const tripledServices = [...filteredServices, ...filteredServices, ...filteredServices];

  // Helper to get step size (card width + gap). offsetWidth, not clientWidth:
  // the cards have a 1px border, and clientWidth excludes it, which drifts
  // every jump/snap calculation by 2px per card.
  const getStepSize = (container) => {
    if (!container || container.children.length === 0) return 0;
    const cardWidth = container.children[0].offsetWidth;
    const gap = parseInt(window.getComputedStyle(container).gap) || 0;
    return cardWidth + gap;
  };

  // Instant (non-animated) scroll jump. The container has scroll-behavior:
  // smooth in CSS, which would otherwise animate the teleport across the
  // whole list and break the infinite-loop illusion. Card transitions are
  // also suppressed briefly: the element under the cursor changes at the
  // jump, and its :hover styles would otherwise animate in visibly.
  const teleport = (container, scrollLeft) => {
    container.classList.add("services-grid--no-anim");
    // scrollTo with behavior overrides CSS scroll-behavior per spec; toggling
    // style.scrollBehavior is not reliably synchronous in Safari
    container.scrollTo({ left: scrollLeft, behavior: "instant" });
    setTimeout(() => container.classList.remove("services-grid--no-anim"), 100);
  };

  // Center on middle copy initially and on page change (excludeId changes)
  useEffect(() => {
    const container = containerRef.current;
    if (container && L > 0) {
      const timer = setTimeout(() => {
        const step = getStepSize(container);
        if (step > 0) {
          teleport(container, L * step);
          initializedRef.current = true;
          setActiveDomIndex(L);
        }
      }, 50); // Tiny delay to ensure styles and layouts are resolved
      return () => {
        clearTimeout(timer);
        clearTimeout(idleTimerRef.current);
      };
    }
  }, [excludeId, L]);

  // Pointer devices: one wheel/trackpad gesture moves exactly one card.
  // Native listener with passive: false - React/Chrome wheel listeners are
  // passive by default and cannot preventDefault the free scroll.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.matchMedia("(hover: hover)").matches) return undefined;

    let cooldownUntil = 0;
    const handleWheel = (e) => {
      const dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      if (Math.abs(dx) <= Math.abs(e.deltaY) && !e.shiftKey) return; // vertical -> page scroll
      e.preventDefault();
      const now = performance.now();
      // ponytail: 30px threshold + 450ms cooldown absorbs trackpad momentum
      // tails; tune if double-steps or missed gestures show up on hardware
      if (now < cooldownUntil || Math.abs(dx) < 30) return;
      const step = getStepSize(container);
      if (step === 0) return;
      cooldownUntil = now + 450;
      const target = (Math.round(container.scrollLeft / step) + Math.sign(dx)) * step;
      container.scrollTo({ left: target, behavior: "smooth" });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [L]);

  // Handle browser window resize to keep the active card centered
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (container && L > 0) {
        const step = getStepSize(container);
        if (step > 0) {
          const currentActiveMappedIndex = activeDomIndex % L;
          const newDomIndex = L + currentActiveMappedIndex;
          teleport(container, newDomIndex * step);
          setActiveDomIndex(newDomIndex);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeDomIndex, L]);

  // If the view has drifted into an outer copy, snap back (invisibly) to the
  // middle copy and remap the active index. Returns the index shift applied
  // (-L, 0, or +L) so callers can adjust element indices they hold.
  const normalizeToMiddle = (container) => {
    const step = getStepSize(container);
    if (step === 0) return 0;
    let jump = 0;
    if (container.scrollLeft < (L - 0.5) * step) {
      jump = L;
    } else if (container.scrollLeft > (2 * L - 0.5) * step) {
      jump = -L;
    }
    if (jump !== 0) {
      teleport(container, container.scrollLeft + jump * step);
      setActiveDomIndex((prev) => prev + jump);
    }
    return jump;
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || L === 0 || !initializedRef.current) return;

    const step = getStepSize(container);
    if (step === 0) return;

    // Boundary check for infinite scroll looping, deferred until scrolling
    // has settled. Teleporting mid-gesture is ignored on iOS momentum
    // scrolling and gets fought by mandatory scroll snapping.
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      normalizeToMiddle(container);
      // JS snap-to-card for pointer devices, where CSS snap is disabled
      // (mandatory/proximity snap fights discrete wheel clicks). No-op when
      // CSS snap already aligned the position (touch devices).
      const idleStep = getStepSize(container);
      if (idleStep > 0) {
        const target = Math.round(container.scrollLeft / idleStep) * idleStep;
        if (Math.abs(target - container.scrollLeft) > 1) {
          container.scrollTo({ left: target, behavior: "smooth" });
        }
      }
    }, 120);

    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, index) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeDomIndex) {
      setActiveDomIndex(closestIndex);
    }
  };

  // Cancel a pending boundary teleport while the pointer is down, so the
  // card is not yanked out from under an in-flight click. The next scroll
  // event re-arms the teleport.
  const handlePointerDown = () => {
    clearTimeout(idleTimerRef.current);
  };

  const handleDotClick = (serviceIndex) => {
    const container = containerRef.current;
    if (!container) return;
    normalizeToMiddle(container);
    // Scroll to the closest clone of the service to keep travel short.
    // Explicit scrollTo, not scrollIntoView: the cards are scaled by CSS
    // transforms mid-transition, which skews scrollIntoView's target and
    // makes the idle snap visibly correct a few px at the end.
    const candidates = [serviceIndex, L + serviceIndex, 2 * L + serviceIndex];
    const step = getStepSize(container);
    if (step === 0) return;
    const closest = candidates.reduce((a, b) =>
      Math.abs(a * step - container.scrollLeft) <= Math.abs(b * step - container.scrollLeft) ? a : b
    );
    container.scrollTo({ left: closest * step, behavior: "smooth" });
  };

  const handleCardClick = (e, index) => {
    // Compare per service (mod L): a clone of the active card counts as
    // active, so clicking it navigates instead of re-centering
    if (index % L !== activeDomIndex % L) {
      e.preventDefault();
      const container = containerRef.current;
      if (container) {
        // Clamp the TARGET into the middle copy, not just the current
        // position: during fast click-walking the scroll position lags
        // mid-animation below the normalize threshold while the clicked
        // index keeps climbing, and the walk runs off the end of the
        // tripled list. If the target lands in an outer copy, teleport
        // the view one copy over (invisible) and aim at the equivalent
        // middle-copy card.
        let targetIndex = index + normalizeToMiddle(container);
        const step = getStepSize(container);
        if (step > 0) {
          if (targetIndex >= 2 * L) {
            teleport(container, container.scrollLeft - L * step);
            setActiveDomIndex((prev) => prev - L);
            targetIndex -= L;
          } else if (targetIndex < L) {
            teleport(container, container.scrollLeft + L * step);
            setActiveDomIndex((prev) => prev + L);
            targetIndex += L;
          }
          container.scrollTo({ left: targetIndex * step, behavior: "smooth" });
        }
      }
    }
  };

  return (
    <section className="services-section" aria-labelledby="services-heading">
      <div className="services-container">
        <div className="services-header">
          <span className="section-eyebrow">{eyebrow}</span>
          <div className="section-ornament" aria-hidden="true">
            <span className="section-ornament-line"></span>
            <Sparkles size={20} />
            <span className="section-ornament-line"></span>
          </div>
          <h2 id="services-heading">{title}</h2>
          <p className="services-intro">
          </p>
        </div>

        <div 
          className="services-grid"
          ref={containerRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
        >
          {tripledServices.map((service, index) => {
            // First and third copies are visual clones; hide them from
            // keyboard tab order and screen readers to avoid duplicates
            const isClone = index < L || index >= 2 * L;
            return (
            <Link
              key={`${service.id}-${index}`}
              to={service.route}
              onClick={(e) => handleCardClick(e, index)}
              className={`service-card ${activeDomIndex % L === index % L ? "service-card--active" : ""}`}
              aria-label={`${service.ctaLabel}: ${service.title}`}
              aria-hidden={isClone || undefined}
              tabIndex={isClone ? -1 : undefined}
              data-side={
                index < activeDomIndex ? "left" : index > activeDomIndex ? "right" : undefined
              }
            >
              <div className="service-card__image-wrap">
                <img
                  src={service.image}
                  alt=""
                  className="service-card__image"
                />
              </div>

              <div className="service-card__content">
                <div className="service-card__topline">
                  <span className="service-card__kicker">{service.kicker}</span>
                </div>

                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__description">
                  {service.description}
                </p>
                <div className="service-card__bottom">
                  <span className="service-card__meta">{service.meta}</span>
                  <span className="service-card__cta">
                    {service.ctaLabel}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="service-card__arrow"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>

        <div className="services-dots">
          {filteredServices.map((service, i) => (
            <button
              key={service.id}
              type="button"
              className={`services-dot ${activeDomIndex % L === i ? "services-dot--active" : ""}`}
              aria-label={`Visa ${service.title}`}
              aria-current={activeDomIndex % L === i || undefined}
              onClick={() => handleDotClick(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeServicesSection;
