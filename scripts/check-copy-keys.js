// Every copy, list and image key the site reads must exist on its CMS page. A missing key shows
// the code's fallback, which no editor can change. The build runs this right after the CMS
// export, so it checks what is published. Without an export (a local build) it has nothing
// authoritative to check against and steps aside.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const KIND_BY_HOOK = { usePageCopy: "copy", useSiteCopy: "copy", usePageLists: "lists", usePageMedia: "images" };
// Readers handed to child components as props keep these names; their page is the caller's.
const PROP_READERS = { copy: "copy", pageCopy: "copy", sharedCopy: "copy", homeCopy: "copy", siteCopy: "copy", list: "lists", media: "images", siteMedia: "images", sharedMedia: "images" };

// Read by the code but not in the CMS yet, each waiting for content (texts or an image) from the
// editors. Remove an entry once the CMS has it; nothing else may be added here silently.
const KNOWN_GAPS = new Set(["home lists venue-highlights", "art images instructor.image"]);

const sourceFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "test" ? [] : sourceFiles(path);
    return /\.jsx?$/.test(entry.name) && !/\.test\.jsx?$/.test(entry.name) ? [path] : [];
  });

/** The keys each source file asks for: { file, line, kind, slug (null = handed in), key }. */
export function readKeyUses(srcDir) {
  const uses = [];
  for (const file of sourceFiles(srcDir)) {
    const source = readFileSync(file, "utf8");
    const readers = {};
    for (const [name, kind] of Object.entries(PROP_READERS)) readers[name] = { kind, slug: name === "siteCopy" ? "site" : null };
    for (const [, name, hook, slug] of source.matchAll(/const\s+(\w+)\s*=\s*(usePageCopy|useSiteCopy|usePageLists|usePageMedia)\(\s*(?:"([\w-]+)")?/g)) {
      readers[name] = { kind: KIND_BY_HOOK[hook], slug: hook === "useSiteCopy" ? "site" : slug ?? null };
    }
    for (const [name, reader] of Object.entries(readers)) {
      // Only literal keys: a key built at runtime (`items.${id}.title`) cannot be checked here.
      for (const match of source.matchAll(new RegExp(`(?<![\\w.])${name}\\(\\s*"([^"\\\\]+)"`, "g"))) {
        const line = source.slice(0, match.index).split("\n").length;
        uses.push({ file: relative(process.cwd(), file), line, ...reader, key: match[1] });
      }
    }
  }
  return uses;
}

/** Uses whose key no page has (or, for a handed-in reader, no page at all). */
export function findMissingKeys(pages, uses, knownGaps = KNOWN_GAPS) {
  const has = (slug, kind, key) => Object.hasOwn(pages?.[slug]?.[kind] || {}, key);
  return uses.filter(({ slug, kind, key }) =>
    !knownGaps.has(`${slug} ${kind} ${key}`) &&
    (slug ? !has(slug, kind, key) : !Object.keys(pages || {}).some((page) => has(page, kind, key))));
}

const runAsScript = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (runAsScript) {
  const { default: snapshot } = await import("../src/data/cmsContent.generated.js");
  if (!snapshot?.pages) {
    console.log("Copy-nycklar kontrolleras inte: ingen CMS-export (CMS_EXPORT=required för att hämta).");
  } else {
    const missing = findMissingKeys(snapshot.pages, readKeyUses("src"));
    if (missing.length > 0) {
      console.error(`Nycklar som koden läser men CMS:et saknar (${missing.length}):`);
      for (const use of missing) console.error(`  ${use.slug || "?"} ${use.kind} "${use.key}"  ${use.file}:${use.line}`);
      console.error("Lägg till dem i CMS:et (migration och seedPages.ts) och driftsätt CMS:et före koden.");
      process.exit(1);
    }
    console.log("Copy-nycklar: alla som koden läser finns i CMS-exporten.");
  }
}
