import { describe, expect, it, vi } from "vitest";
import {
  allUpcomingPasses,
  coursePassToPass,
  eventToPass,
  eventTracks,
  COURSE_PASSES,
  formatPassDate,
  formatPassTime,
  MALERI_TRACK_ID,
  hubFaq,
  INSTRUCTORS,
  isBookablePass,
  nextPass,
  ownedUpcomingPasses,
  passAnchor,
  passHref,
  passInstructor,
  pastPasses,
  resolvedFaq,
  schedulePasses,
  trackById,
  TRACKS,
  upcomingPasses,
  YOGA_TRACK_ID,
} from "./courseEvents.js";
import { contactEmail } from "../features/contact/contact.js";
import { projectCoursePass, projectEvent } from "./cmsProjection.js";

// The build's export, synthetic: COURSE_PASSES and every default below read it.
vi.mock("./cmsContent.generated.js", async () => ({
  default: (await import("../test/cmsScheduleFixture.js")).SNAPSHOT,
}));

// Fixed clock: these assertions must not start failing as real time passes.
const BEFORE_JULY_30 = new Date("2026-07-25T12:00:00+02:00");
const AFTER_ALL_PASSES = new Date("2027-01-01T00:00:00+01:00");
const DURING_JULY_30_PASS = new Date("2026-07-30T18:45:00+02:00");

const SHARED_PASS_ID = "course:heldag-yoga-maleri-2026-07-13";

const onTrack = (trackId) =>
  COURSE_PASSES.filter((pass) => pass.tracks.includes(trackId));

describe("pass date split", () => {
  it("puts a pass that has not finished in upcoming, most imminent first", () => {
    const upcoming = upcomingPasses(YOGA_TRACK_ID, BEFORE_JULY_30);

    expect(upcoming.map((pass) => pass.id)).toEqual([
      "course:yoga-pa-loftet-2026-07-30",
      "events:7",
      "course:yoga-2026-08-12",
      "course:yoga-2026-08-13",
      "course:yoga-2026-08-18",
      "course:yoga-2026-08-19",
      "course:yoga-2026-08-20",
    ]);
  });

  it("keeps a pass upcoming while it is still running", () => {
    // Split is on endAt, not startAt: a pass mid-session is still current, and
    // dropping its Event markup at 18:00 would remove it exactly when someone
    // searching for it needs it.
    const upcoming = upcomingPasses(YOGA_TRACK_ID, DURING_JULY_30_PASS);

    expect(upcoming.map((pass) => pass.id)).toContain(
      "course:yoga-pa-loftet-2026-07-30"
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
    expect(ids).toContain("course:yoga-pa-loftet-2026-07-30");
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

  it("reads CMS UTC timestamps on the farm's clock, summer and winter", () => {
    expect(formatPassTime("2026-08-20T16:00:00.000Z")).toBe("18:00");
    expect(formatPassTime("2026-11-20T17:00:00.000Z")).toBe("18:00");
    expect(formatPassTime(null)).toBe("");
  });

  it("dates a late-evening UTC timestamp by its Stockholm calendar day", () => {
    expect(formatPassDate({ startAt: "2026-07-31T22:30:00.000Z" })).toBe("Lördag 1 augusti");
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

  it("names the next maleri course from the course passes, and none once it is over", () => {
    const question = (now) =>
      resolvedFaq(MALERI_TRACK_ID, now).find((item) => item.question.startsWith("När är nästa kurs i måleri")).answer;

    expect(question(BEFORE_JULY_30)).toContain("Akvarell för nybörjare");
    expect(question(AFTER_ALL_PASSES)).toContain("ingen kurs med fast datum");
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


const event = (doc) => eventToPass(projectEvent({ id: 50, title: "Pass", startAt: "2026-09-01T16:00:00.000Z", ...doc }, "https://cms.example.test"));
const coursePass = (doc) => coursePassToPass(projectCoursePass({ id: 50, title: "Kurs", startAt: "2026-09-01T08:00:00.000Z", ...doc }));

describe("passes from CMS records", () => {
  it("files events by category, not by words in the title", () => {
    expect(event({ category: "konst", title: "Yoga och akvarell" }).tracks).toEqual([MALERI_TRACK_ID]);
    expect(event({ category: "ovrigt", title: "Yoga-loppis" }).tracks).toEqual([]);
    expect(eventTracks({ category: "keramik", title: "Måleri på keramik" })).toEqual([]);
    // The one documented transitional record keeps both hubs.
    expect(eventTracks({ legacyId: "course:heldag-yoga-maleri-2026-07-13", category: "yoga" }))
      .toEqual([YOGA_TRACK_ID, MALERI_TRACK_ID]);
  });

  it("keeps fields the editor emptied empty instead of filling them in", () => {
    const pass = event({ category: "yoga", price: null, description: "", spots: "", location: "", mediaMigrated: true });

    expect(pass.price).toBeNull();
    expect(pass.summary).toBe("");
    expect(pass.spots).toBeNull();
    expect(pass.location).toBeNull();
    // Media migrated and then removed: no track image is put back.
    expect(pass.images).toEqual([]);
  });

  it("namespaces ids so an event and a course pass with the same number stay apart", () => {
    const passes = schedulePasses({
      events: [projectEvent({ id: 7, category: "yoga", title: "A", startAt: "2026-09-01T16:00:00.000Z" })],
      coursePasses: [projectCoursePass({ id: 7, track: "yoga", title: "B", startAt: "2026-09-02T16:00:00.000Z" })],
    });

    expect(passes.map((pass) => pass.id)).toEqual(["events:7", "course-pass-7"]);
  });

  it("keeps a course pass's status, instructor and spots", () => {
    const pass = coursePass({ track: "konst", instructor: "ann", status: "fully_booked", spots: 0, bookingEmail: "kurs@example.test" });

    expect(pass.status).toBe("fully_booked");
    expect(passInstructor(pass).name).toBe("Ann Wiklund");
    expect(pass.spots).toBe(0);
    expect(isBookablePass(pass, new Date("2026-08-01T00:00:00Z"))).toBe(false);
  });

  it("names no one for a guest instructor", () => {
    const pass = coursePass({ track: "yoga", instructor: "guest" });

    expect(passInstructor(pass)).toBeNull();
  });

  it("reaches both instructors through the farm's one inbox", () => {
    expect(Object.values(INSTRUCTORS).map((instructor) => instructor.email)).toEqual([contactEmail, contactEmail]);
  });

  it("does not offer a cancelled pass as the next one", () => {
    const passes = schedulePasses({
      events: [],
      coursePasses: [
        projectCoursePass({ id: 1, track: "yoga", status: "cancelled", title: "Inställt", startAt: "2026-09-01T16:00:00.000Z" }),
        projectCoursePass({ id: 2, track: "yoga", title: "Nästa", startAt: "2026-09-08T16:00:00.000Z" }),
      ],
    });

    expect(nextPass(YOGA_TRACK_ID, new Date("2026-08-01T00:00:00Z"), passes).title).toBe("Nästa");
    expect(upcomingPasses(YOGA_TRACK_ID, new Date("2026-08-01T00:00:00Z"), passes)).toHaveLength(2);
  });

  it("shows nothing from an empty schedule: no static passes are mixed in", () => {
    expect(schedulePasses({ events: [], coursePasses: [] })).toEqual([]);
    expect(upcomingPasses(YOGA_TRACK_ID, BEFORE_JULY_30, [])).toEqual([]);
  });
});

describe("hubFaq", () => {
  it("uses the editors' list when the page has one, without half-filled rows", () => {
    const faq = hubFaq(MALERI_TRACK_ID, BEFORE_JULY_30, COURSE_PASSES, [
      { title: "Fråga", body: "Svar" },
      { title: "Utan svar", body: "" },
    ]);

    expect(faq).toEqual([{ question: "Fråga", answer: "Svar" }]);
  });

  it("keeps an emptied list empty and falls back to the track only without a list", () => {
    expect(hubFaq(YOGA_TRACK_ID, BEFORE_JULY_30, COURSE_PASSES, [])).toEqual([]);
    expect(hubFaq(YOGA_TRACK_ID, BEFORE_JULY_30, COURSE_PASSES, null)).toEqual(resolvedFaq(YOGA_TRACK_ID, BEFORE_JULY_30));
  });
});
