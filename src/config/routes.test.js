import { describe, expect, it } from "vitest";
import { appRoutes, canonicalPath, normalizePath } from "./routes.js";
import { sectionForPath } from "../components/layout/Navbar/SectionSubnav.jsx";

describe("normalizePath", () => {
  it("drops the trailing slash GitHub Pages redirects to", () => {
    // Without this the live site loses every active state and the section
    // subnav, while the dev server (no redirect) looks fine.
    expect(normalizePath("/kurser/yoga/")).toBe("/kurser/yoga");
    expect(normalizePath("/om-oss/portfolj/mans/")).toBe(
      "/om-oss/portfolj/mans"
    );
  });

  it("leaves the root and slashless paths alone", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/kurser/konst")).toBe("/kurser/konst");
  });
});

describe("canonicalPath", () => {
  it("adds the public trailing slash without losing a hash or query", () => {
    expect(canonicalPath("/kontakt")).toBe("/kontakt/");
    expect(canonicalPath("/event#event-amenities-section")).toBe(
      "/event/#event-amenities-section",
    );
    expect(canonicalPath("/kurser/yoga/?from=home")).toBe(
      "/kurser/yoga/?from=home",
    );
  });

  it("leaves the root, fragments, and external paths unchanged", () => {
    expect(canonicalPath("/")).toBe("/");
    expect(canonicalPath("#kontakt")).toBe("#kontakt");
    expect(canonicalPath("https://example.com/page")).toBe(
      "https://example.com/page",
    );
  });
});

describe("sectionForPath", () => {
  it("finds the section a child route belongs to, with or without the slash", () => {
    expect(sectionForPath("/kurser/konst").path).toBe("/kurser");
    expect(sectionForPath("/kurser/yoga/").path).toBe("/kurser");
    expect(sectionForPath("/gruppdagar/").path).toBe("/event");
  });

  it("finds the section for the parent route itself", () => {
    expect(sectionForPath("/kurser/").path).toBe("/kurser");
    expect(sectionForPath("/event").path).toBe("/event");
  });

  it("returns null for routes without a subnav", () => {
    expect(sectionForPath("/")).toBeNull();
    expect(sectionForPath("/galleri/")).toBeNull();
  });
});

describe("appRoutes", () => {
  it("keeps both course hubs in the Kurser section, not under Event", () => {
    // Someone looking for a kurs starts at Kurser; the maleri hub sat at /konst
    // under Event, and desktop hides the navbar dropdowns entirely.
    const kurser = appRoutes.find((route) => route.path === "/kurser");
    const event = appRoutes.find((route) => route.path === "/event");
    const eventChildren = (event.children ?? []).map((child) => child.path);

    expect(kurser.children.map((child) => child.path)).toEqual([
      "/kurser/yoga",
      "/kurser/konst",
    ]);
    expect(eventChildren).not.toContain("/kurser/konst");
    expect(eventChildren).not.toContain("/konst");
    expect(eventChildren).toContain("/gruppdagar");
  });

  it("gives every route a label and an absolute path", () => {
    const flat = appRoutes.flatMap((route) => [
      route,
      ...(route.children ?? []),
    ]);

    for (const route of flat) {
      expect(route.label, route.path).toBeTruthy();
      expect(route.path.startsWith("/"), route.path).toBe(true);
      expect(normalizePath(route.path), route.path).toBe(route.path);
    }
  });

  it("puts Bröllop and Kontakt in the top level of the menu", () => {
    const top = appRoutes.map((route) => route.path);
    expect(top).toContain("/event/brollop");
    expect(top).toContain("/kontakt");
    expect(sectionForPath("/event/brollop/")).toBeNull();
  });
});
