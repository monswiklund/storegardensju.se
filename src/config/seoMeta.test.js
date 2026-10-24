import { describe, expect, it, vi } from "vitest";
import {
  WEDDING_FAQ,
  WEDDING_PATH,
  activeJsonLd,
  canonicalUrl,
  seoMeta,
} from "./seoMeta.js";
import {
  COURSE_PASSES,
  MALERI_TRACK_ID,
  YOGA_TRACK_ID,
  coursePassToPass,
  formatPassDate,
  formatPassTime,
  hubFaq,
  nextPass,
  ownedUpcomingPasses,
  passAnchor,
  trackById,
  upcomingPasses,
} from "../data/courseEvents.js";
import { projectCoursePass } from "../data/cmsProjection.js";
import { SNAPSHOT } from "../test/cmsScheduleFixture.js";

// The build's export, synthetic: the prerender defaults (passes, FAQ lists) read it.
vi.mock("../data/cmsContent.generated.js", async () => ({
  default: (await import("../test/cmsScheduleFixture.js")).SNAPSHOT,
}));

const BEFORE_JULY_30 = new Date("2026-07-25T12:00:00+02:00");
const AFTER_ALL_PASSES = new Date("2027-01-01T00:00:00+01:00");

const byType = (jsonLd, type) =>
  jsonLd.filter((entry) => entry["@type"] === type);

// The two course hubs run the same machinery over different data, so the
// structural guarantees are asserted for both.
const HUBS = [
  { key: "kurserYoga", trackId: YOGA_TRACK_ID, path: "/kurser/yoga" },
  { key: "kurserKonst", trackId: MALERI_TRACK_ID, path: "/kurser/konst" },
];

describe.each(HUBS)("$key hub JSON-LD", ({ key, trackId, path }) => {
  it("emits one Event per upcoming pass it owns", () => {
    const jsonLd = activeJsonLd(seoMeta[key], BEFORE_JULY_30);
    const events = byType(jsonLd, "Event");
    const owned = ownedUpcomingPasses(trackId, BEFORE_JULY_30);

    expect(events).toHaveLength(owned.length);
    expect(events.map((event) => event.startDate)).toEqual(
      owned.map((pass) => pass.startAt)
    );
  });

  it("points each Event at its anchor on the hub URL", () => {
    const events = byType(activeJsonLd(seoMeta[key], BEFORE_JULY_30), "Event");
    const owned = ownedUpcomingPasses(trackId, BEFORE_JULY_30);

    expect(events.map((event) => event.url)).toEqual(
      owned.map((pass) => `${canonicalUrl(path)}#${passAnchor(pass)}`)
    );
  });

  it("drops Event objects once passes have ended but keeps the evergreen types", () => {
    const jsonLd = activeJsonLd(seoMeta[key], AFTER_ALL_PASSES);

    // The old implementation gated everything behind one hardcoded date, so an
    // expired cutoff silently removed all structured data from the page.
    expect(byType(jsonLd, "Event")).toHaveLength(0);
    expect(byType(jsonLd, "Course")).toHaveLength(1);
    expect(byType(jsonLd, "FAQPage")).toHaveLength(1);
  });

  it("omits hasCourseInstance rather than emitting an empty array", () => {
    const [course] = byType(
      activeJsonLd(seoMeta[key], AFTER_ALL_PASSES),
      "Course"
    );

    expect(course.hasCourseInstance).toBeUndefined();
  });

  it("lists every upcoming pass shown on the hub as a CourseInstance", () => {
    const [course] = byType(
      activeJsonLd(seoMeta[key], BEFORE_JULY_30),
      "Course"
    );
    const upcoming = upcomingPasses(trackId, BEFORE_JULY_30);

    expect(course.hasCourseInstance ?? []).toHaveLength(upcoming.length);
  });

  it("keeps FAQPage markup identical to the answers rendered on the page", () => {
    // Both hubs render hubFaq (the page's CMS list, else the track's answers);
    // mismatched FAQ markup violates Google's structured data policy.
    const [faqPage] = byType(
      activeJsonLd(seoMeta[key], BEFORE_JULY_30),
      "FAQPage"
    );
    const cmsList = SNAPSHOT.pages[trackById(trackId).pageSlug]?.lists?.faq ?? null;
    const rendered = hubFaq(trackId, BEFORE_JULY_30, COURSE_PASSES, cmsList);

    expect(faqPage.mainEntity).toHaveLength(rendered.length);
    expect(
      faqPage.mainEntity.map((entry) => [
        entry.name,
        entry.acceptedAnswer.text,
      ])
    ).toEqual(rendered.map((item) => [item.question, item.answer]));
  });

  it("describes the next pass in the meta description, or says there is none", () => {
    // The getters read the real clock, so the expectation is derived the same
    // way rather than hardcoding a date that would fail once it passes.
    const pass = nextPass(trackId);

    if (pass) {
      expect(seoMeta[key].description).toContain(formatPassDate(pass));
      expect(seoMeta[key].description).toContain(formatPassTime(pass.startAt));
    } else {
      expect(seoMeta[key].description.length).toBeGreaterThan(80);
    }
  });

  it("prerenders crawlable copy plus the FAQ for the hub", () => {
    const { h1, paragraphs, faq } = seoMeta[key].staticContent;

    expect(h1).toBeTruthy();
    expect(paragraphs.join(" ")).toContain("Lidköping");
    expect(paragraphs.join(" ").length).toBeGreaterThan(200);
    expect(faq.length).toBeGreaterThan(0);
  });
});

describe("hub identity", () => {
  it("keeps the yoga title and puts the hub under the kurser index", () => {
    expect(seoMeta.kurserYoga.title).toBe(
      "Yoga på loftet i Lidköping | Storegården 7"
    );
    expect(seoMeta.kurserYoga.path).toBe("/kurser/yoga");
    expect(seoMeta.kurserYoga.staticContent.h1).toBe("Yoga på loftet");
  });

  it("targets the maleri searches on /kurser/konst, not on the yoga hub", () => {
    expect(seoMeta.kurserKonst.path).toBe("/kurser/konst");
    expect(seoMeta.kurserKonst.title).toContain("Målarkurs");
    expect(seoMeta.kurserKonst.title).not.toContain("keramikkurs");
    // The two hubs must not compete for the same query.
    expect(seoMeta.kurserYoga.title.toLowerCase()).not.toContain("målarkurs");
    expect(seoMeta.kurserKonst.title.toLowerCase()).not.toContain("yoga");
  });

  it("gives the hubs distinct Course entries", () => {
    const [yogaCourse] = byType(
      activeJsonLd(seoMeta.kurserYoga, BEFORE_JULY_30),
      "Course"
    );
    const [maleriCourse] = byType(
      activeJsonLd(seoMeta.kurserKonst, BEFORE_JULY_30),
      "Course"
    );

    expect(yogaCourse.url).toBe(canonicalUrl("/kurser/yoga"));
    expect(maleriCourse.url).toBe(canonicalUrl("/kurser/konst"));
    expect(yogaCourse.name).not.toBe(maleriCourse.name);
  });
});

describe("kurser index", () => {
  it("carries the generic kurser query without claiming either hub's subject", () => {
    // The index must not duplicate a hub's title, or the three pages compete.
    expect(seoMeta.kurser.path).toBe("/kurser");
    expect(seoMeta.kurser.title).toContain("Kurser i Lidköping");
    expect(seoMeta.kurser.title).not.toBe(seoMeta.kurserYoga.title);
    expect(seoMeta.kurser.title).not.toBe(seoMeta.kurserKonst.title);
  });

  it("mentions both subjects so the copy matches what it links to", () => {
    const copy = seoMeta.kurser.staticContent.paragraphs.join(" ");

    expect(copy).toContain("yoga");
    expect(copy).not.toContain("keramik");
    expect(copy).toContain("måleri");
  });

  it("leaves Course and FAQPage to the hubs that own the subject", () => {
    expect(activeJsonLd(seoMeta.kurser, BEFORE_JULY_30)).toEqual([]);
  });
});

describe("contact page", () => {
  it("publishes the address and canonical contact URL as LocalBusiness data", () => {
    const [business] = byType(
      activeJsonLd(seoMeta.kontakt, BEFORE_JULY_30),
      "LocalBusiness"
    );

    expect(business.name).toBe("Storegården 7");
    expect(business.url).toBe(canonicalUrl("/kontakt"));
    expect(business.email).toBe("storegardensju@gmail.com");
    expect(business.address.streetAddress).toBe("Storegården 7");
    expect(business.address.addressLocality).toBe("Rackeby");
  });

  it("keeps crawlable contact copy aligned with the visible location details", () => {
    const copy = seoMeta.kontakt.staticContent.paragraphs.join(" ");

    expect(seoMeta.kontakt.path).toBe("/kontakt");
    expect(copy).toContain("531 96 Rackeby");
    expect(copy).toContain("15 minuter");
  });
});

describe("event hubs", () => {
  it("keeps generic event intent on the hub and wedding intent on its child", () => {
    expect(seoMeta.event.path).toBe("/event");
    expect(seoMeta.event.title).toBe("Eventlokal i Lidköping | Storegården 7");
    expect(seoMeta.eventWedding.path).toBe(WEDDING_PATH);
    expect(seoMeta.eventWedding.title).toContain("Bröllopslokal");
    expect(seoMeta.eventWedding.title).not.toBe(seoMeta.event.title);
    expect(seoMeta.eventWedding.staticContent.h1).toBe(
      "Bröllop på Storegården 7"
    );
  });

  it("points the wedding Service at the canonical child route", () => {
    const [service] = byType(
      activeJsonLd(seoMeta.eventWedding, BEFORE_JULY_30),
      "Service"
    );

    expect(service.url).toBe(canonicalUrl(WEDDING_PATH));
    expect(service.serviceType).toBe("Bröllopslokal");
  });

  it("keeps wedding FAQPage markup identical to the visible FAQ data", () => {
    const [faqPage] = byType(
      activeJsonLd(seoMeta.eventWedding, BEFORE_JULY_30),
      "FAQPage"
    );

    expect(
      faqPage.mainEntity.map((entry) => [
        entry.name,
        entry.acceptedAnswer.text,
      ])
    ).toEqual(WEDDING_FAQ.map(({ question, answer }) => [question, answer]));
    expect(seoMeta.eventWedding.staticContent.faq).toBe(WEDDING_FAQ);
  });
});

describe("route meta", () => {
  it("gives every route a title, description and static content", () => {
    for (const [key, meta] of Object.entries(seoMeta)) {
      expect(meta.title, key).toBeTruthy();
      expect(meta.description, key).toBeTruthy();
      expect(meta.staticContent?.h1, key).toBeTruthy();
      expect(meta.staticContent?.paragraphs?.length, key).toBeGreaterThan(0);
    }
  });

  it("builds canonical URLs with the trailing slash GitHub Pages redirects to", () => {
    expect(canonicalUrl("/")).toBe("https://storegardensju.se/");
    expect(canonicalUrl("/kurser/yoga")).toBe(
      "https://storegardensju.se/kurser/yoga/"
    );
  });
});

describe("hub JSON-LD follows the schedule the page shows", () => {
  const pass = (doc) =>
    coursePassToPass(projectCoursePass({ id: 1, title: "Akvarell", track: "konst", instructor: "ann", price: 600, startAt: "2026-09-05T08:00:00.000Z", ...doc }));
  const eventFor = (passes) => byType(activeJsonLd(seoMeta.kurserKonst, BEFORE_JULY_30, { passes, faq: [] }), "Event");

  it("marks a cancelled pass as cancelled and sells nothing for it", () => {
    const [event] = eventFor([pass({ status: "cancelled" })]);

    expect(event.eventStatus).toBe("https://schema.org/EventCancelled");
    expect(event.offers).toBeUndefined();
  });

  it("states availability for full and nearly full passes", () => {
    expect(eventFor([pass({ status: "fully_booked" })])[0].offers.availability).toBe("https://schema.org/SoldOut");
    expect(eventFor([pass({ status: "few_left" })])[0].offers.availability).toBe("https://schema.org/LimitedAvailability");
  });

  it("names the pass's own instructor and no one for a guest", () => {
    expect(eventFor([pass({ instructor: "ann" })])[0].performer.name).toBe("Ann Wiklund");
    expect(eventFor([pass({ instructor: "guest" })])[0].performer).toBeUndefined();
  });

  it("declares no Event when the live schedule is empty, and no FAQPage for an emptied list", () => {
    const jsonLd = activeJsonLd(seoMeta.kurserYoga, BEFORE_JULY_30, { passes: [], faq: [] });

    expect(byType(jsonLd, "Event")).toEqual([]);
    expect(byType(jsonLd, "FAQPage")).toEqual([]);
    expect(byType(jsonLd, "Course")).toHaveLength(1);
  });

  it("uses the editors' FAQ list from the export in the prerendered markup", () => {
    const [faqPage] = byType(activeJsonLd(seoMeta.kurserKonst, BEFORE_JULY_30), "FAQPage");

    expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual(["Finns det material?"]);
  });
});
