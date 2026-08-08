// GitHub Pages serves routes as directories and redirects /konst -> /konst/, so
// the live pathname carries a trailing slash these paths do not. Comparing raw
// pathnames silently dropped the active state and the section subnav in
// production while working fine under the dev server.
export function normalizePath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

/**
 * Build the public URL GitHub Pages serves for an internal route.
 *
 * The router intentionally keeps slashless paths as its route keys, while
 * GitHub Pages serves the corresponding directory URL with a trailing slash.
 * Keeping that distinction in one helper prevents internal links from
 * repeatedly sending crawlers through a redirect.
 */
export function canonicalPath(path) {
  if (!path || path === "/" || !path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  const match = path.match(/^([^?#]*)([?#].*)?$/);
  const pathname = match?.[1] ?? path;
  const suffix = match?.[2] ?? "";

  return pathname === "/" || pathname.endsWith("/")
    ? path
    : `${pathname}/${suffix}`;
}

export const appRoutes = [
  { path: "/", label: "Hem" },
  {
    path: "/event",
    label: "Event",
    children: [
      { path: "/event/brollop", label: "Bröllop" },
      { path: "/gruppdagar", label: "Gruppdagar" },
    ],
  },
  {
    // /kurser is an index over the two course hubs, one per subject. The maleri
    // hub used to sit at /konst under Event, which buried it one hover away from
    // where anyone looking for a kurs would start; both hubs now live under the
    // section they belong to.
    path: "/kurser",
    label: "Kurser",
    children: [
      { path: "/kurser/yoga", label: "Yoga" },
      { path: "/kurser/konst", label: "Måleri & keramik" },
    ],
  },
  { path: "/galleri", label: "Galleri" },
  { path: "/butik", label: "Butik" },
  {
    path: "/om-oss",
    label: "Om Oss",
    children: [{ path: "/kontakt", label: "Kontakt" }],
  },
];
