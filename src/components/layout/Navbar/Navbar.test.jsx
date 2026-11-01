import { describe, expect, it } from "vitest";
import { getCurrentTitle } from "./Navbar.jsx";

describe("getCurrentTitle", () => {
  it.each([
    ["/", "Hem"],
    ["/kurser/konst", "Måleri"],
    ["/event/brollop", "Bröllop"],
    ["/ann", "Konst"],
    ["/ann/keramik", "Keramik"],
    ["/evenemang/konstafton-2026", "Evenemang"],
    ["/butik/12", "Butik"],
    // Without CMS copy the route's own label is used.
    ["/om-oss/portfolj/mans", "Om Oss"],
  ])("names %s as %s", (path, title) => {
    expect(getCurrentTitle(path)).toBe(title);
  });

  it("says nothing rather than a wrong name", () => {
    expect(getCurrentTitle("/finns-inte")).toBe("");
  });
});
