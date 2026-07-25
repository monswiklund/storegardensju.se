// Generates dist/<route>/index.html per route so GitHub Pages serves
// HTTP 200 with correct title/description/canonical instead of the
// 404.html SPA redirect (404 status blocks Google indexing entirely).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { seoMeta, canonicalUrl, activeJsonLd } from "../src/config/seoMeta.js";

const html = readFileSync("dist/index.html", "utf8");

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
  { path: "/event", label: "Bröllop, event & fest" },
  { path: "/gruppdagar", label: "Gruppdagar" },
  { path: "/konst", label: "Konst & keramik" },
  { path: "/kurser", label: "Yoga & kurser" },
  { path: "/galleri", label: "Bildgalleri" },
  { path: "/butik", label: "Butik" },
  { path: "/om-oss", label: "Om oss" },
];

const ROOT_PLACEHOLDER = '<div id="root"></div>';

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

  return [
    // Inline so the pre-hydration flash stays readable without blocking on
    // the stylesheet; React removes the whole block on mount.
    "<style>.prerender-shell{max-width:44rem;margin:0 auto;padding:3rem 1.25rem;" +
      "font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#2c2c2c}" +
      ".prerender-shell nav ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:.75rem}" +
      "</style>",
    '<div class="prerender-shell">',
    `<h1>${escapeHtml(heading)}</h1>`,
    paragraphs,
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

for (const meta of Object.values(seoMeta)) {
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

// The home page keeps dist/index.html's own meta but needs the same crawlable
// shell - it is the entry point Google reaches first.
writeFileSync("dist/index.html", injectShell(html, seoMeta.home));
console.log("injected crawlable shell into dist/index.html");
