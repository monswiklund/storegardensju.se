// Generates dist/<route>/index.html per route so GitHub Pages serves
// HTTP 200 with correct title/description/canonical instead of the
// 404.html SPA redirect (404 status blocks Google indexing entirely).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { seoMeta, canonicalUrl, activeJsonLd } from "../src/config/seoMeta.js";

const html = readFileSync("dist/index.html", "utf8");

const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

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

  mkdirSync(`dist${meta.path}`, { recursive: true });
  writeFileSync(`dist${meta.path}/index.html`, routeHtml);
  console.log(`generated dist${meta.path}/index.html`);
}
