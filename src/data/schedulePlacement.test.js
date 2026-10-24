import { describe, expect, it } from "vitest";
import { isUpcoming, knownEndTimeOf } from "./schedulePlacement.js";

// Stockholm moves to summer time at 02:00 on 29 March 2026 and back at 03:00 on 25 October 2026.
const at = (iso) => new Date(iso);

describe("isUpcoming", () => {
  it("files a pass across the spring change by its real instants", () => {
    // 01:30-03:30 local wall clock on 29 March is 00:30Z-01:30Z: one hour of real time.
    const pass = { startAt: "2026-03-29T00:30:00.000Z", endAt: "2026-03-29T01:30:00.000Z" };

    expect(isUpcoming(pass, at("2026-03-29T01:00:00.000Z"))).toBe(true);
    expect(isUpcoming(pass, at("2026-03-29T01:30:00.000Z"))).toBe(false);
  });

  it("files a pass across the autumn change by its real instants", () => {
    // 02:30 local happens twice on 25 October; the instants in UTC decide.
    const pass = { startAt: "2026-10-25T00:30:00.000Z", endAt: "2026-10-25T02:30:00.000Z" };

    expect(isUpcoming(pass, at("2026-10-25T01:45:00.000Z"))).toBe(true);
    expect(isUpcoming(pass, at("2026-10-25T02:30:00.000Z"))).toBe(false);
  });

  it("keeps a running pass upcoming until its end", () => {
    const pass = { startAt: "2026-07-30T16:00:00.000Z", endAt: "2026-07-30T17:30:00.000Z" };

    expect(isUpcoming(pass, at("2026-07-30T17:00:00.000Z"))).toBe(true);
  });

  it("uses start plus duration when no end is given", () => {
    const pass = { startAt: "2026-07-30T16:00:00.000Z", durationMinutes: 90 };

    expect(knownEndTimeOf(pass)).toBe(Date.parse("2026-07-30T17:30:00.000Z"));
    expect(isUpcoming(pass, at("2026-07-30T17:29:00.000Z"))).toBe(true);
    expect(isUpcoming(pass, at("2026-07-30T17:30:00.000Z"))).toBe(false);
  });

  it("without any end, is upcoming until it starts", () => {
    const pass = { startAt: "2026-07-30T16:00:00.000Z" };

    expect(isUpcoming(pass, at("2026-07-30T15:59:00.000Z"))).toBe(true);
    expect(isUpcoming(pass, at("2026-07-30T16:00:00.000Z"))).toBe(false);
  });

  it("never files an invalid or missing start as upcoming", () => {
    expect(isUpcoming({ startAt: "inte ett datum" }, at("2020-01-01T00:00:00Z"))).toBe(false);
    expect(isUpcoming({ startAt: "" , bucketOverride: "upcoming" }, at("2020-01-01T00:00:00Z"))).toBe(false);
    expect(isUpcoming({}, at("2020-01-01T00:00:00Z"))).toBe(false);
  });

  it("ignores an end before the start", () => {
    const pass = { startAt: "2026-07-30T16:00:00.000Z", endAt: "2026-07-30T15:00:00.000Z" };

    expect(knownEndTimeOf(pass)).toBeNull();
  });

  it("lets 'Kommande' not revive a pass whose end has passed", () => {
    const pass = { startAt: "2026-07-30T16:00:00.000Z", endAt: "2026-07-30T17:00:00.000Z", bucketOverride: "upcoming" };

    expect(isUpcoming(pass, at("2026-08-01T00:00:00Z"))).toBe(false);
  });

  it("lets 'Kommande' keep an open-ended item listed after its start", () => {
    const exhibition = { startAt: "2026-07-01T08:00:00.000Z", bucketOverride: "upcoming" };

    expect(isUpcoming(exhibition, at("2026-08-01T00:00:00Z"))).toBe(true);
  });

  it("lets 'Tidigare' file a future item as past", () => {
    expect(isUpcoming({ startAt: "2027-01-01T00:00:00Z", bucketOverride: "past" }, at("2026-01-01T00:00:00Z"))).toBe(false);
  });

  it("files everything as past after the last pass", () => {
    const passes = [
      { startAt: "2026-08-20T16:00:00.000Z", endAt: "2026-08-20T17:00:00.000Z" },
      { startAt: "2026-09-05T08:00:00.000Z", durationMinutes: 240 },
    ];

    expect(passes.filter((pass) => isUpcoming(pass, at("2027-01-01T00:00:00Z")))).toEqual([]);
  });
});
