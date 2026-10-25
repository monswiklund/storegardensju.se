import { describe, expect, it } from "vitest";
import { commonHours, dayRange, multiDayTime, remainingSessions, sessionsOf, weekGrid, weekdaysOf } from "./eventSeries.js";

const pad = (n) => String(n).padStart(2, "0");
const at = (day, hour = 16) => ({ startAt: `${day}T${pad(hour)}:00:00.000Z`, endAt: `${day}T${pad(hour + 1)}:00:00.000Z` });

describe("eventSeries", () => {
  it("treats two or more sessions as a series, sorted, and one or none as an ordinary event", () => {
    expect(sessionsOf({ sessions: [at("2026-08-13"), at("2026-08-11")] }).map((s) => s.startAt)).toEqual([
      "2026-08-11T16:00:00.000Z",
      "2026-08-13T16:00:00.000Z",
    ]);
    expect(sessionsOf({ sessions: [at("2026-08-11")] })).toEqual([]);
    expect(sessionsOf({})).toEqual([]);
  });

  it("names the weekdays in week order and the hours only when every session keeps them", () => {
    const sessions = [at("2026-08-13"), at("2026-08-10"), at("2026-08-11")];
    expect(weekdaysOf(sessions)).toBe("mån, tis, tors");
    expect(commonHours(sessions)).toBe("18:00 - 19:00");
    expect(commonHours([...sessions, at("2026-08-14", 8)])).toBe("");
  });

  it("lays sessions out by week and weekday, leaving a cancelled day empty", () => {
    // Tue 11, Thu 13 and Tue 18 Aug; Thu 20 cancelled. 22:30Z on Sunday 16 Aug is Monday 17 in Stockholm.
    const sessions = [at("2026-08-11"), at("2026-08-13"), at("2026-08-18"), at("2026-08-16", 22)];
    const { days, weeks } = weekGrid(sessions);
    expect(days).toEqual(["mån", "tis", "tors"]);
    expect(weeks.map((week) => week.cells.map((cell) => cell.length))).toEqual([
      [0, 1, 1],
      [1, 1, 0],
    ]);
  });

  it("writes date ranges within and across months", () => {
    expect(dayRange("2026-08-11T16:00:00.000Z", "2026-08-20T16:00:00.000Z")).toBe("11–20 aug");
    expect(dayRange("2026-07-30T16:00:00.000Z", "2026-08-20T16:00:00.000Z")).toBe("30 juli – 20 aug");
  });

  it("counts a session as left until it has ended", () => {
    const sessions = [at("2026-08-11"), at("2026-08-12")];
    expect(remainingSessions(sessions, new Date("2026-08-11T16:30:00Z"))).toHaveLength(2);
    expect(remainingSessions(sessions, new Date("2026-08-11T17:30:00Z"))).toHaveLength(1);
  });

  it("gives both dates for an event over several days and nothing for one day", () => {
    expect(multiDayTime("2024-11-22T16:00:00.000Z", "2024-11-23T15:00:00.000Z")).toBe("22 nov 17:00 – 23 nov 16:00");
    expect(multiDayTime("2026-07-13T08:00:00.000Z", "2026-07-13T15:30:00.000Z")).toBe("");
  });
});
