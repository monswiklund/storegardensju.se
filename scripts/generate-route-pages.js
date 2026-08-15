// Generates dist/<route>/index.html per route so GitHub Pages serves
// HTTP 200 with correct title/description/canonical instead of the
// 404.html SPA redirect (404 status blocks Google indexing entirely).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { seoMeta, canonicalUrl, activeJsonLd } from "../src/config/seoMeta.js";

const html = readFileSync("dist/index.html", "utf8");
const cmsUrl = (process.env.VITE_CMS_URL || "https://cms.storegardensju.se").replace(/\/$/, "");
const PAGE_SLUG_BY_PATH = {
  "/": "home",
  "/event": "event",
  "/event/brollop": "wedding",
  "/gruppdagar": "group-days",
  "/kurser": "courses",
  "/kurser/yoga": "yoga",
  "/kurser/konst": "art",
  "/galleri": "gallery",
  "/butik": "shop",
  "/om-oss": "about",
  "/kontakt": "contact",
};

const absoluteMediaUrl = (media) => {
  const value = media?.sizes?.hero?.url || media?.url || media?.externalUrl;
  if (!value) return null;
  if (value.startsWith("http")) return value;
  if (value.startsWith("/images/")) return `https://storegardensju.se${value}`;
  return `${cmsUrl}${value.startsWith("/") ? "" : "/"}${value}`;
};

const fetchSocialImages = async () => {
  try {
    const query = new URLSearchParams({ limit: "100", depth: "1" });
    const response = await fetch(`${cmsUrl}/api/pages?${query}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const data = await response.json();
    return new Map((data.docs || []).map((page) => [page.slug, absoluteMediaUrl(page.socialImage)]));
  } catch (error) {
    console.warn(`CMS-delningbilder kunde inte hämtas; använder kodens fallback (${error.message}).`);
    return new Map();
  }
};

const socialImages = await fetchSocialImages();
const withCmsImage = (meta) => ({
  ...meta,
  image: socialImages.get(PAGE_SLUG_BY_PATH[meta.path]) || meta.image,
});

const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Crawlable link graph. Googlebot discovers routes from these anchors; a
// sitemap alone leaves pages stuck in "Discovered - currently not indexed"
// because the SPA shell contains no links until JS has run.
const NAV_ROUTES = [
  { path: "/", label: "Start" },
  { path: "/event", label: "Eventlokal i Lidköping" },
  { path: "/event/brollop", label: "Bröllopslokal i Lidköping" },
  { path: "/gruppdagar", label: "Gruppdagar" },
  // Anchor text is a ranking signal, so each hub is linked by what it targets.
  { path: "/kurser", label: "Kurser i Lidköping" },
  { path: "/kurser/yoga", label: "Yoga på loftet" },
  { path: "/kurser/konst", label: "Målarkurs & keramikkurs" },
  { path: "/galleri", label: "Bildgalleri" },
  { path: "/butik", label: "Butik" },
  { path: "/om-oss", label: "Om oss" },
  { path: "/kontakt", label: "Kontakt och hitta hit" },
];

const ROOT_PLACEHOLDER = '<div id="root"></div>';

// How long the shell stays invisible before fading in. Long enough that a
// normal mount (~200-400ms on the built bundle) never paints it, short enough
// that a slow connection still gets content instead of a blank page.
const SHELL_REVEAL_DELAY = "600ms";

// Rendered into #root, which createRoot() replaces on mount - so this is
// pre-hydration content, not hidden text. Copy must match what the React
// page actually renders.
const buildShell = (meta) => {
  const content = meta.staticContent;
  const heading = content?.h1 || meta.title;
  const paragraphs = (content?.paragraphs || [meta.description])
    .map((text) => `<p>${escapeHtml(text)}</p>`)
    .join("");
  const links = NAV_ROUTES.filter((route) => route.path !== meta.path)
    .map((route) => {
      const href = route.path === "/" ? "/" : `${route.path}/`;
      return `<li><a href="${href}">${escapeHtml(route.label)}</a></li>`;
    })
    .join("");

  // Optional Q&A block. On the course hubs this mirrors the FAQ the React page renders
  // and the FAQPage JSON-LD declares, so all three agree even for a crawler
  // that never executes the bundle.
  const faq = Array.isArray(content?.faq) ? content.faq : [];
  const faqBlock =
    faq.length > 0
      ? [
          "<section><h2>Vanliga frågor</h2><dl>",
          faq
            .map(
              ({ question, answer }) =>
                `<dt>${escapeHtml(question)}</dt><dd>${escapeHtml(answer)}</dd>`
            )
            .join(""),
          "</dl></section>",
        ].join("")
      : "";

  return [
    // Inline so the block is styled without waiting for the stylesheet.
    // opacity starts at 0 and only fades in after SHELL_REVEAL_DELAY, so a
    // normal-speed mount replaces it before anything is painted - no flash of
    // bare text. animation-fill-mode: forwards ends at opacity 1, so the text
    // is fully visible to Googlebot's renderer and is not hidden content.
    "<style>" +
      "@keyframes prerenderShellIn{from{opacity:0}to{opacity:1}}" +
      ".prerender-shell{max-width:40rem;margin:0 auto;padding:18vh 1.5rem 3rem;" +
      "font-family:'Lato',Helvetica,Arial,sans-serif;line-height:1.65;color:#333;" +
      "text-align:center;opacity:0;" +
      `animation:prerenderShellIn .4s ease ${SHELL_REVEAL_DELAY} forwards}` +
      ".prerender-shell h1{font-family:'Playfair Display',Georgia,serif;color:#000;" +
      "font-weight:600;font-size:clamp(1.6rem,4vw,2.4rem);margin-bottom:1rem}" +
      ".prerender-shell p{margin-bottom:1rem}" +
      ".prerender-shell h2{font-family:'Playfair Display',Georgia,serif;color:#000;" +
      "font-weight:600;font-size:1.2rem;margin:2rem 0 1rem}" +
      ".prerender-shell dt{font-weight:700;margin-top:1rem}" +
      ".prerender-shell dd{margin:.25rem 0 0}" +
      ".prerender-shell nav ul{list-style:none;padding:0;margin-top:2rem;display:flex;" +
      "flex-wrap:wrap;gap:.5rem 1.25rem;justify-content:center}" +
      ".prerender-shell nav a{color:hsl(160,35%,42%);text-decoration:none}" +
      "</style>",
    '<div class="prerender-shell">',
    `<h1>${escapeHtml(heading)}</h1>`,
    paragraphs,
    faqBlock,
    '<nav aria-label="Sidor på Storegården 7"><ul>',
    links,
    "</ul></nav>",
    "</div>",
  ].join("");
};

const injectShell = (source, meta) => {
  if (!source.includes(ROOT_PLACEHOLDER)) {
    throw new Error(
      `Missing ${ROOT_PLACEHOLDER} in dist/index.html - cannot inject crawlable content`
    );
  }

  return source.replace(
    ROOT_PLACEHOLDER,
    `<div id="root">${buildShell(meta)}</div>`
  );
};

const replaceMeta = (source, selector, content) =>
  source.replace(
    new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*(")`),
    `$1${escapeAttr(content)}$2`
  );

for (const sourceMeta of Object.values(seoMeta)) {
  const meta = withCmsImage(sourceMeta);
  if (meta.path === "/") continue;

  let routeHtml = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${escapeAttr(meta.description)}$2`
    )
    .replace(
      /(<link rel="canonical" href=")[^"]*(")/,
      `$1${canonicalUrl(meta.path)}$2`
    )
    .replace(
      /(<meta property="og:url" content=")[^"]*(")/,
      `$1${canonicalUrl(meta.path)}$2`
    );

  routeHtml = replaceMeta(
    routeHtml,
    'property="og:title"',
    meta.ogTitle || meta.title
  );
  routeHtml = replaceMeta(
    routeHtml,
    'property="og:description"',
    meta.ogDescription || meta.description
  );
  routeHtml = replaceMeta(
    routeHtml,
    'name="twitter:title"',
    meta.ogTitle || meta.title
  );
  routeHtml = replaceMeta(
    routeHtml,
    'name="twitter:description"',
    meta.ogDescription || meta.description
  );

  if (meta.image) {
    routeHtml = replaceMeta(routeHtml, 'property="og:image"', meta.image);
    routeHtml = replaceMeta(routeHtml, 'name="twitter:image"', meta.image);
  }

  const jsonLd = activeJsonLd(meta);
  if (jsonLd.length > 0) {
    routeHtml = routeHtml.replace(
      "</head>",
      `    <script type="application/ld+json" data-seo-jsonld="route">${JSON.stringify(jsonLd)}</script>\n  </head>`
    );
  }

  if (routeHtml === html) {
    throw new Error(`No meta replaced for ${meta.path} - check regexes`);
  }

  routeHtml = injectShell(routeHtml, meta);

  mkdirSync(`dist${meta.path}`, { recursive: true });
  writeFileSync(`dist${meta.path}/index.html`, routeHtml);
  console.log(`generated dist${meta.path}/index.html`);
}

// The operational admin is a real React route too, but it has no public SEO
// metadata. Give GitHub Pages a static entry point without adding it to the
// crawlable site graph or injecting the public prerender shell.
const adminHtml = html
  .replace(/<title>[\s\S]*?<\/title>/, "<title>Administration – Storegården 7</title>")
  .replace(
    "</head>",
    '    <meta name="robots" content="noindex, nofollow" />\n  </head>'
  );

mkdirSync("dist/admin", { recursive: true });
writeFileSync("dist/admin/index.html", adminHtml);
console.log("generated dist/admin/index.html");

// Legacy URLs that moved. GitHub Pages serves static files only - it cannot
// 301 - so the old path keeps returning 200 with a redirect page: canonical and
// og:url point at the new URL, a meta refresh moves real visitors, and the body
// carries a plain link for anyone (or anything) that ignores the refresh.
// Deliberately not noindex: Google treats meta-refresh + canonical as a soft
// redirect and consolidates the old URL's signals into the new one, which
// noindex would block.
const LEGACY_REDIRECTS = [
  { from: "/konst", to: "/kurser/konst" },
  { from: "/mohippa", to: "/gruppdagar" },
];

for (const { from, to } of LEGACY_REDIRECTS) {
  const target = canonicalUrl(to);
  const redirectHtml = [
    "<!doctype html>",
    '<html lang="sv">',
    "  <head>",
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `    <meta http-equiv="refresh" content="0; url=${target}" />`,
    `    <link rel="canonical" href="${target}" />`,
    `    <title>Sidan har flyttat till ${escapeHtml(to)}/</title>`,
    "  </head>",
    "  <body>",
    `    <p>Sidan har flyttat. <a href="${target}">Fortsätt till ${escapeHtml(to)}/</a></p>`,
    `    <script>window.location.replace(${JSON.stringify(`${to}/`)});</script>`,
    "  </body>",
    "</html>",
    "",
  ].join("\n");

  mkdirSync(`dist${from}`, { recursive: true });
  writeFileSync(`dist${from}/index.html`, redirectHtml);
  console.log(`generated dist${from}/index.html (redirect -> ${to}/)`);
}

// The home page keeps dist/index.html's own meta but needs the same crawlable
// shell - it is the entry point Google reaches first.
const homeMeta = withCmsImage(seoMeta.home);
let homeHtml = html;
if (homeMeta.image) {
  homeHtml = replaceMeta(homeHtml, 'property="og:image"', homeMeta.image);
  homeHtml = replaceMeta(homeHtml, 'name="twitter:image"', homeMeta.image);
}
writeFileSync("dist/index.html", injectShell(homeHtml, homeMeta));
console.log("injected crawlable shell into dist/index.html");
