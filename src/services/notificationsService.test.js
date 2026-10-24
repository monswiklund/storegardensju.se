import { describe, expect, it } from "vitest";
import { isNotificationLive } from "./notificationsService.js";

const now = new Date("2026-10-24T12:00:00+02:00");

describe("isNotificationLive", () => {
  it("shows a notice without a window", () => {
    expect(isNotificationLive({}, now)).toBe(true);
  });

  it("hides a notice before startsAt and from endsAt on", () => {
    expect(isNotificationLive({ startsAt: "2026-10-25T00:00:00.000Z" }, now)).toBe(false);
    expect(isNotificationLive({ endsAt: "2026-10-24T10:00:00.000Z" }, now)).toBe(false);
    expect(isNotificationLive({ startsAt: "2026-10-01T00:00:00.000Z", endsAt: "2026-10-31T00:00:00.000Z" }, now)).toBe(true);
  });
});
