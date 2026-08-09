import {describe, expect, it} from "vitest";
import {
  allUpcomingPasses,
  apiEventToCoursePass,
  COURSE_PASSES,
  formatPassDate,
  formatPassTime,
  MALERI_TRACK_ID,
  mergeCoursePasses,
  nextPass,
  ownedUpcomingPasses,
  passAnchor,
  passHref,
  pastPasses,
  resolvedFaq,
  trackById,
  TRACKS,
  upcomingPasses,
  YOGA_TRACK_ID,
} from "./courseEvents.js";

// Fixed clock: these assertions must not start failing as real time passes.
const BEFORE_JULY_30 = new Date("2026-07-25T12:00:00+02:00");
const AFTER_ALL_PASSES = new Date("2027-01-01T00:00:00+01:00");
const DURING_JULY_30_PASS = new Date("2026-07-30T18:45:00+02:00");

const SHARED_PASS_ID = "heldag-yoga-maleri-2026-07-13";

const onTrack = (trackId) =>
  COURSE_PASSES.filter((pass) => pass.tracks.includes(trackId));

describe("pass date split", () => {
  it("puts a pass that has not finished in upcoming, most imminent first", () => {
    const upcoming = upcomingPasses(YOGA_TRACK_ID, BEFORE_JULY_30);

    expect(upcoming.map((pass) => pass.id)).toEqual([
      "yoga-pa-loftet-2026-07-30",
      "yoga-2026-08-11",
      "yoga-2026-08-12",
      "yoga-2026-08-13",
      "yoga-2026-08-18",
      "yoga-2026-08-19",
      "yoga-2026-08-20",
    ]);
  });

  it("keeps a pass upcoming while it is still running", () => {
    // Split is on endAt, not startAt: a pass mid-session is still current, and
    // dropping its Event markup at 18:00 would remove it exactly when someone
    // searching for it needs it.
    const upcoming = upcomingPasses(YOGA_TRACK_ID, DURING_JULY_30_PASS);

    expect(upcoming.map((pass) => pass.id)).toContain(
      "yoga-pa-loftet-2026-07-30"
    );
  });

  it("moves finished passes to past, most recent first", () => {
    const past = pastPasses(YOGA_TRACK_ID, BEFORE_JULY_30);

    expect(past.map((pass) => pass.id)).toEqual([SHARED_PASS_ID]);
  });

  it("returns no upcoming pass once every pass has ended", () => {
    expect(upcomingPasses(YOGA_TRACK_ID, AFTER_ALL_PASSES)).toEqual([]);
    expect(nextPass(YOGA_TRACK_ID, AFTER_ALL_PASSES)).toBeNull();
    expect(pastPasses(YOGA_TRACK_ID, AFTER_ALL_PASSES)).toHaveLength(
      onTrack(YOGA_TRACK_ID).length
    );
  });

  it("accounts for every pass on a track in exactly one bucket", () => {
    for (const trackId of Object.keys(TRACKS)) {
      const upcoming = upcomingPasses(trackId, BEFORE_JULY_30);
      const past = pastPasses(trackId, BEFORE_JULY_30);
      const total = onTrack(trackId).length;

      expect(upcoming.length + past.length, trackId).toBe(total);
      const ids = [...upcoming, ...past].map((pass) => pass.id);
      expect(new Set(ids).size, trackId).toBe(total);
    }
  });

  it("collects upcoming passes across both tracks without duplicates", () => {
    // The home page fallback reads this; a pass on two tracks must appear once.
    const ids = allUpcomingPasses(BEFORE_JULY_30).map((pass) => pass.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("yoga-pa-loftet-2026-07-30");
  });
});

describe("tracks", () => {
  it("shows a shared pass on both hubs", () => {
    const shared = COURSE_PASSES.find((pass) => pass.id === SHARED_PASS_ID);

    expect(shared.tracks).toEqual([YOGA_TRACK_ID, MALERI_TRACK_ID]);
    expect(
      pastPasses(MALERI_TRACK_ID, BEFORE_JULY_30).map((pass) => pass.id)
    ).toContain(SHARED_PASS_ID);
  });

  it("gives Event markup only to the hub that owns the pass", () => {
    // The same event marked up on two URLs would make those URLs compete for
    // one result.
    for (const trackId of Object.keys(TRACKS)) {
      const owned = ownedUpcomingPasses(trackId, BEFORE_JULY_30);

      expect(
        owned.every((pass) => pass.primaryTrack === trackId),
        trackId
      ).toBe(true);
    }
  });

  it("declares a primary track that is one of its tracks", () => {
    for (const pass of COURSE_PASSES) {
      expect(pass.tracks, pass.id).toContain(pass.primaryTrack);
      expect(() => trackById(pass.primaryTrack)).not.toThrow();
    }
  });

  it("rejects an unknown track instead of silently returning nothing", () => {
    expect(() => trackById("keramikkurs")).toThrow(/Unknown course track/);
  });

  it("keeps the two hubs on separate URLs under the kurser index", () => {
    expect(TRACKS[YOGA_TRACK_ID].hubPath).toBe("/kurser/yoga");
    expect(TRACKS[MALERI_TRACK_ID].hubPath).toBe("/kurser/konst");
  });
});

describe("pass formatting", () => {
  it("derives the anchor from the owning track and date so shared links survive copy edits", () => {
    const pass = nextPass(YOGA_TRACK_ID, BEFORE_JULY_30);

    expect(passAnchor(pass)).toBe("yoga-30-juli");
  });

  it("links within the hub with a bare fragment and across hubs with a path", () => {
    const shared = COURSE_PASSES.find((pass) => pass.id === SHARED_PASS_ID);

    expect(passHref(shared, YOGA_TRACK_ID)).toBe("#yoga-13-juli");
    // Trailing slash: GitHub Pages 301-redirects /kurser/yoga -> /kurser/yoga/.
    expect(passHref(shared, MALERI_TRACK_ID)).toBe("/kurser/yoga/#yoga-13-juli");
  });

  it("formats the Swedish weekday and month", () => {
    const pass = nextPass(YOGA_TRACK_ID, BEFORE_JULY_30);

    expect(formatPassDate(pass)).toBe("Torsdag 30 juli");
  });

  it("reads the time in the event's own offset, not the reader's timezone", () => {
    expect(formatPassTime("2026-07-30T18:00:00+02:00")).toBe("18:00");
    expect(formatPassTime("2026-07-30T17:30:00+02:00")).toBe("17:30");
  });

  it("gives every pass a unique anchor", () => {
    const anchors = COURSE_PASSES.map(passAnchor);

    expect(new Set(anchors).size).toBe(COURSE_PASSES.length);
  });
});

describe("FAQ answers", () => {
  it("names the next yoga pass while one is booked", () => {
    const faq = resolvedFaq(YOGA_TRACK_ID, BEFORE_JULY_30);
    const answer = faq.find((item) =>
      item.question.includes("När är nästa pass")
    ).answer;

    expect(answer).toContain("torsdag 30 juli");
    expect(answer).toContain("18:00");
  });

  it("falls back to a no-pass answer instead of a stale date", () => {
    const faq = resolvedFaq(YOGA_TRACK_ID, AFTER_ALL_PASSES);
    const answer = faq.find((item) =>
      item.question.includes("När är nästa pass")
    ).answer;

    expect(answer).not.toContain("30 juli");
    expect(answer).toContain("inget pass");
  });

  it("does not claim a booked maleri course when none exists", () => {
    // The maleri hub has no dated course yet; the FAQ must say so rather than
    // invent one, since this text is also emitted as FAQPage markup.
    const faq = resolvedFaq(MALERI_TRACK_ID, BEFORE_JULY_30);
    const answer = faq.find((item) =>
      item.question.startsWith("När är nästa målarkurs")
    ).answer;

    expect(nextPass(MALERI_TRACK_ID, BEFORE_JULY_30)).toBeNull();
    expect(answer).toContain("ingen kurs med fast datum");
  });

  it("resolves every answer on every track to a non-empty string", () => {
    for (const trackId of Object.keys(TRACKS)) {
      for (const { question, answer } of resolvedFaq(trackId, BEFORE_JULY_30)) {
        expect(typeof answer, question).toBe("string");
        expect(answer.length, question).toBeGreaterThan(20);
      }
    }
  });

  it("asks distinct questions within a track", () => {
    for (const trackId of Object.keys(TRACKS)) {
      const questions = resolvedFaq(trackId, BEFORE_JULY_30).map(
        (item) => item.question
      );

      expect(new Set(questions).size, trackId).toBe(questions.length);
    }
  });
});

describe("apiEventToCoursePass and mergeCoursePasses", () => {
  it("converts raw API event to course pass format", () => {
    const rawApiEvent = {
      id: "test-yoga-123",
      title: "Kvällsyoga på loftet",
      description: "Ett lugnt yogapass för alla.",
      category: "yoga",
      startAt: "2026-08-20T18:00:00+02:00",
      endAt: "2026-08-20T19:30:00+02:00",
      spots: "150 kr / person – Drop-in",
      images: [{ url: "/images/test.jpg", alt: "Test" }],
    };

    const pass = apiEventToCoursePass(rawApiEvent);

    expect(pass.id).toBe("test-yoga-123");
    expect(pass.title).toBe("Kvällsyoga på loftet");
    expect(pass.primaryTrack).toBe(YOGA_TRACK_ID);
    expect(pass.price).toBe(150);
    expect(pass.images[0].url).toBe("/images/test.jpg");
  });

  it("merges API events with static passes chronologically", () => {
    const staticPasses = [
      {
        id: "static-yoga-1",
        title: "Static Yoga",
        tracks: [YOGA_TRACK_ID],
        primaryTrack: YOGA_TRACK_ID,
        startAt: "2026-07-30T18:00:00+02:00",
        endAt: "2026-07-30T19:30:00+02:00",
      },
    ];

    const apiEvents = [
      {
        id: "api-yoga-new",
        title: "Nytt Yoga Event från Admin",
        category: "yoga",
        startAt: "2026-08-15T18:00:00+02:00",
        endAt: "2026-08-15T19:30:00+02:00",
      },
    ];

    const merged = mergeCoursePasses(
      staticPasses,
      apiEvents,
      YOGA_TRACK_ID,
      BEFORE_JULY_30
    );

    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe("static-yoga-1");
    expect(merged[1].id).toBe("api-yoga-new");
  });

    it("keeps one complete pass when an API duplicate has the same start time", () => {
        const staticPass = {
            id: "static-yoga-duplicate-slot",
            title: "Yoga på loftet (90 min)",
            tracks: [YOGA_TRACK_ID],
            primaryTrack: YOGA_TRACK_ID,
            startAt: "2026-08-11T18:00:00+02:00",
            endAt: "2026-08-11T19:30:00+02:00",
            durationMinutes: 90,
            price: 150,
            dropIn: false,
            summary: "Ett komplett yogapass.",
            practicalNote: "Mattor finns på plats.",
            images: [{url: "/images/yoga.jpg"}],
        };

        const apiEvents = [
            {
                id: "event-duplicate-slot",
                title: "90 minuter Yogapss",
                category: "yoga",
                startAt: "2026-08-11T18:00:00+02:00",
                endAt: "2026-08-11T18:00:00+02:00",
            },
        ];

        const merged = mergeCoursePasses(
            [staticPass],
            apiEvents,
            YOGA_TRACK_ID,
            BEFORE_JULY_30
        );

        expect(merged).toHaveLength(1);
        expect(merged[0].id).toBe(staticPass.id);
        expect(merged[0].durationMinutes).toBe(90);
        expect(merged[0].price).toBe(150);
    });

  it("converts and merges maleri / konst events correctly", () => {
    const rawMaleriEvent = {
      id: "api-maleri-1",
      title: "Helgkurs Akvarell",
      category: "maleri",
      startAt: "2026-09-10T10:00:00+02:00",
      endAt: "2026-09-10T16:00:00+02:00",
    };

    const pass = apiEventToCoursePass(rawMaleriEvent, MALERI_TRACK_ID);
    expect(pass.primaryTrack).toBe(MALERI_TRACK_ID);
    expect(pass.title).toBe("Helgkurs Akvarell");

    const merged = mergeCoursePasses(
      [],
      [rawMaleriEvent],
      MALERI_TRACK_ID,
      BEFORE_JULY_30
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("api-maleri-1");
  });
});

