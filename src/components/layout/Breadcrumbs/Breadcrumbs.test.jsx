import { describe, expect, it } from "vitest";
import { breadcrumbTrail } from "./Breadcrumbs.jsx";

const labels = (trail) => trail && [...trail.links.map((link) => `${link.label}:${link.to}`), trail.current];

describe("breadcrumbTrail", () => {
  it.each([
    ["/kurser/yoga/", ["Hem:/", "Kurser:/kurser", "Yoga"]],
    ["/event/brollop", ["Hem:/", "Event:/event", "Bröllop"]],
    ["/gruppdagar", ["Hem:/", "Event:/event", "Gruppdagar"]],
    ["/ann/keramik", ["Hem:/", "Konst:/ann", "Keramik"]],
  ])("leads from Hem to %s", (path, trail) => {
    expect(labels(breadcrumbTrail(path))).toEqual(trail);
  });

  it("names a page the menu does not know from what the page passes", () => {
    expect(labels(breadcrumbTrail("/butik/12", undefined, { current: "Skål" }))).toEqual(["Hem:/", "Butik:/butik", "Skål"]);
    expect(labels(breadcrumbTrail("/evenemang/konstafton", undefined, { current: "Konstafton" }))).toEqual([
      "Hem:/",
      "Evenemang:/evenemang",
      "Konstafton",
    ]);
  });

  it("shows none on top-level pages, where the menu already marks the page", () => {
    expect(breadcrumbTrail("/galleri")).toBeNull();
    expect(breadcrumbTrail("/")).toBeNull();
  });
});
