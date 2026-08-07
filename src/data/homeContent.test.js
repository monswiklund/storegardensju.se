import { describe, expect, it } from "vitest";
import { services } from "./homeContent.js";

describe("home service cards", () => {
  it("keeps one card for each public activity destination", () => {
    expect(services.map(({ id }) => id)).toEqual([
      "event",
      "brollop",
      "gruppdagar",
      "fest",
      "kurser-konst",
      "yoga",
    ]);
  });

  it("takes fest visitors to the event page's amenities section", () => {
    const fest = services.find(({ id }) => id === "fest");

    expect(fest.route).toBe("/event#event-amenities-section");
  });
});
