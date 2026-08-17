import { describe, expect, it } from "vitest";
import { isAllowedCmsOrigin, previewFieldId } from "./livePreviewBridge.js";
import { collectPreviewFields } from "../components/cms/LivePreviewEditorBridge.jsx";

describe("live preview bridge", () => {
  it("accepts only the production CMS and local development origins", () => {
    expect(isAllowedCmsOrigin("https://cms.storegardensju.se")).toBe(true);
    expect(isAllowedCmsOrigin("http://localhost:3002")).toBe(true);
    expect(isAllowedCmsOrigin("https://storegardensju.se")).toBe(false);
    expect(isAllowedCmsOrigin("https://cms.storegardensju.se.attacker.example")).toBe(false);
  });

  it("uses stable field identifiers for copy and nested rows after reorder", () => {
    const first = collectPreviewFields("wedding", {
      copy: [{ key: "hero.title", value: "Bröllop" }],
      contentLists: [{
        key: "faq",
        items: [
          { id: "row-a", title: "Fråga A", body: "Svar A" },
          { id: "row-b", title: "Fråga B", body: "Svar B" },
        ],
      }],
    });
    const reordered = collectPreviewFields("wedding", {
      contentLists: [{
        key: "faq",
        items: [
          { id: "row-b", title: "Fråga B", body: "Svar B" },
          { id: "row-a", title: "Fråga A", body: "Svar A" },
        ],
      }],
    });

    expect(first).toContainEqual({ id: previewFieldId("wedding", "hero.title"), value: "Bröllop" });
    expect(reordered.map((field) => field.id)).toContain(previewFieldId("wedding", "faq.row-a.title"));
    expect(reordered.map((field) => field.id)).toContain(previewFieldId("wedding", "faq.row-b.body"));
  });
});

