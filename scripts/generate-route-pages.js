// Generates dist/<route>/index.html per route so GitHub Pages serves
// HTTP 200 with correct title/description/canonical instead of the
// 404.html SPA redirect (404 status blocks Google indexing entirely).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { seoMeta, canonicalUrl } from "../src/config/seoMeta.js";

const html = readFileSync("dist/index.html", "utf8");

for (const meta of Object.values(seoMeta)) {
  if (meta.path === "/") continue;

  const routeHtml = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${meta.description}$2`
    )
    .replace(
      /(<link rel="canonical" href=")[^"]*(")/,
      `$1${canonicalUrl(meta.path)}$2`
    )
    .replace(
      /(<meta property="og:url" content=")[^"]*(")/,
      `$1${canonicalUrl(meta.path)}$2`
    );

  if (routeHtml === html) {
    throw new Error(`No meta replaced for ${meta.path} - check regexes`);
  }

  mkdirSync(`dist${meta.path}`, { recursive: true });
  writeFileSync(`dist${meta.path}/index.html`, routeHtml);
  console.log(`generated dist${meta.path}/index.html`);
}
