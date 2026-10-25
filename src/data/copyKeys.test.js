import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findMissingKeys, readKeyUses } from "../../scripts/check-copy-keys.js";

const source = (files) => {
  const dir = mkdtempSync(join(tmpdir(), "copy-keys-"));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), text);
  }
  return dir;
};

describe("copy key check", () => {
  const dir = source({
    "pages/Page.jsx": `
      const copy = usePageCopy("group-days");
      const siteCopy = useSiteCopy();
      const media = usePageMedia("group-days");
      copy("hero.title"); copy("nav.request", "Förfrågan"); siteCopy("ui.read-more");
      media("hero.image"); copy(\`items.\${id}.title\`);`,
    "components/Card.jsx": `function Card({ copy }) { return copy("card.cta"); }`,
    "pages/Page.test.jsx": `copy("only.in.tests")`,
  });
  const pages = {
    "group-days": { copy: { "hero.title": "Gruppdagar" }, images: { "hero.image": null } },
    site: { copy: { "ui.read-more": "Läs mer" } },
    home: { copy: { "card.cta": "Boka" } },
  };

  it("reads literal keys with their page, skipping tests and runtime-built keys", () => {
    const keys = readKeyUses(dir).map(({ slug, kind, key }) => `${slug} ${kind} ${key}`);
    expect(keys.sort()).toEqual([
      "group-days copy hero.title",
      "group-days copy nav.request",
      "group-days images hero.image",
      "null copy card.cta",
      "site copy ui.read-more",
    ]);
  });

  it("reports a key the CMS page lacks; a handed-in reader may find it on any page", () => {
    const missing = findMissingKeys(pages, readKeyUses(dir), new Set());
    expect(missing.map((use) => use.key)).toEqual(["nav.request"]);
    expect(missing[0]).toMatchObject({ slug: "group-days", line: 5 });
  });
});
