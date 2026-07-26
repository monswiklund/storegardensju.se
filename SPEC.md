# SPEC

## §G Goal
Run Storegården 7 through one fast, coherent, responsive, accessible admin workbench; preserve public-site behavior and completed Instagram integration.

## §C Constraints
- Backend: Go 1.25, stdlib `net/http` mux, repo `../storegardensju-backend`.
- Frontend: React 19.2 + Vite, this repo. Reuse existing fetch + gallery patterns.
- IG Basic Display API dead (dec 2024) → use Instagram API (Graph, `graph.instagram.com`).
- Requires IG Business/Creator account + Meta app + long-lived token (60d expiry). Manual one-time setup by owner.
- No new deps either repo.
- Follow existing backend patterns: `wrap(publicLimiter, ...)`, `writeAPIError`, TTL cache per `product_cache.go`.
- Admin audience: small owner-operated team; optimize frequent tasks, clarity, and safe batch work over decorative presentation.
- Admin visual system: workbench palette, functional sans UI, restrained brand serif, compact density, one contextual action rail.
- Preserve existing API behavior unless a documented workflow needs a better contract; no speculative backend rewrite.
- Reuse React 18, CSS, lucide-react; no new UI dependency.
- Desktop-first work surface; complete mobile/tablet behavior, keyboard access, visible focus, reduced motion.

## §I Interfaces
- api: GET /api/instagram → 200 {items:[{id,caption,media_type,media_url,thumbnail_url,permalink,timestamp}]}
- api upstream: GET https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp
- env: INSTAGRAM_ACCESS_TOKEN ! set (backend .env; seed token, short- or long-lived; empty & no persisted token → /api/instagram returns 503 {error})
- env: INSTAGRAM_APP_SECRET ? set (enables server-side ig_exchange_token; server-side only per Meta docs)
- env: INSTAGRAM_CACHE_TTL ? default 15m
- env: INSTAGRAM_TOKEN_PATH ? default data/instagram_token.json (persisted {access_token,expires_at})
- api upstream: GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=..&access_token=<short> → {access_token,expires_in}
- api upstream: GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<long> → {access_token,expires_in}
- admin route: `/admin?view=overview|orders|customers|products|events|gallery|coupons|stats`
- admin API: existing `/admin/orders*`, `/admin/products*`, `/admin/events*`, `/admin/gallery*`, `/admin/coupons*`, `/admin/stats`
- public event routes: `/event` hub; `/event/brollop` wedding landing page; `/gruppdagar` remains separate
- admin design tokens: `src/pages/AdminPage/AdminPage.design.css`
- admin primitives: `src/pages/AdminPage/components/ui/*`
- I.admin-sidebar-behavior: 72px desktop rail expands to 252px on pointer hover or keyboard focus without reflow; mobile remains an off-canvas drawer

## §V Invariants
V1: INSTAGRAM_ACCESS_TOKEN ∉ any HTTP response, log line, or frontend bundle.
V2: upstream IG failure → cached data if present, else 503; never 500 with upstream body leaked.
V3: /api/instagram GET-only, wrapped in publicLimiter like /api/gallery.
V4: frontend: fetch failure | empty items → section hidden, no error UI, no console spam.
V5: frontend never loads full-size IG media; backend serves downscaled (≤800px WebP) thumbs from in-memory cache, keyed by media id; only URLs from current feed cache fetched upstream (no SSRF).
V6: INSTAGRAM_APP_SECRET ∉ any HTTP response or log line (exchange URL contains it → redact).
V7: persisted token preferred over env seed while unexpired; refresh when ≤ 10d left; refresh failure → keep current token, no crash.
V8: Every admin mutation that requires idempotency sends a non-empty `Idempotency-Key`, including Cloudflare Access session requests.
V9: Every gallery category is deduplicated by stable image identity; `Alla bilder` is computed from every non-aggregate category and stored `alla` membership is never authoritative.
V10: Admin views fetch only the data needed by the active view; opening gallery must not fetch orders or stats.
V11: Gallery and event uploads use their supported scoped upload endpoints directly; normal success must not probe an unavailable generic endpoint first.
V12: Production CSP permits Simple Analytics script diagnostics without weakening unrelated directives.
V13: Access-protected admin traffic supports ≥120 requests/minute with burst ≥30; development limits are never lower.
V14: Every admin view uses one shared shell, navigation hierarchy, page header, action hierarchy, spacing scale, focus treatment, and responsive breakpoint model.
V15: One visible primary action per work context; duplicate refresh/navigation actions are absent; destructive actions are visually distinct and confirmed.
V16: Every async admin collection has loading, actionable error, empty, and populated states without layout collapse.
V17: Desktop ≥1180px, tablet 760–1179px, mobile <760px remain operable without horizontal page overflow; interactive targets ≥44px on touch layouts.
V18: Keyboard navigation reaches all controls; drawers/dialogs close with Escape, focus is visible, and reduced-motion disables nonessential transitions.
V19: Orders/customers use scan-first lists and contextual detail; batch actions appear only with selection; unsaved order edits remain explicit.
V20: Products/events/coupons share list/editor/status patterns and plain Swedish action copy; archive/delete stays outside normal save flow.
V21: Gallery uses a compact media grid, computed non-editable `Alla bilder`, category-scoped upload, contextual batch actions, and on-demand category settings.
V22: Overview prioritizes actionable work; stats loads only in overview/stats and presents range, KPI, trend, and breakdown with truthful empty states.
V23: Existing admin API/auth/idempotency behavior and all completed V8–V13 fixes remain covered while UI is replaced.
V24: Admin navigation is a collapsed icon rail at ≥1100px that expands transiently on pointer hover or keyboard focus without moving workspace content, and an Escape-dismissable off-canvas drawer below 1100px; labels remain available to assistive technology and reduced-motion removes sidebar transitions.
V25: Admin borders and dividers are neutral; selection, status, hover, validation, and focus never use a colored border, inset edge, or ring.
V26: Deployment verification succeeds when the exact generated build marker is live, regardless of delayed GitHub Pages API state.
V27: `/event` owns generic event intent and links onward; `/event/brollop` owns wedding intent with distinct visible copy, title, description, canonical, and crawlable shell.
V28: Every public event child route exists in React routing, section navigation, prerender link graph, and sitemap; trailing-slash production paths retain the correct section state.
V29: Wedding FAQPage JSON-LD is emitted only when every question and answer matches visible page copy; wedding Service JSON-LD points at `/event/brollop/`.
V30: React 19.2 upgrade preserves existing public/admin behavior, uses the modern JSX transform, and contains no removed React API or function-component `defaultProps` usage.
V31: While a gallery lightbox is open, browser/system Back closes it without changing route; later Back retains normal route history.
V32: React 19.2 effect events use current callback/state without listener re-registration; ref-as-prop preserves rendered behavior.
V33: Dev startup re-optimizes Vite dependencies after React upgrades; context providers retain cross-major `.Provider` syntax so stale runtimes cannot interpret provider children as consumers.
V34: While a public past-event or past-pass overlay is open, browser/system Back closes it without changing route; later Back retains normal route history.

## §T Tasks
id|status|task|cites
T1|x|backend: instagram_handlers.go — GET /api/instagram, fetch upstream, map fields|V1,V2,V5,I.api
T2|x|backend: TTL cache (copy productsCache shape), INSTAGRAM_CACHE_TTL default 15m|V2,I.env
T3|x|backend: register route in main.go + .env.example entry|V3,I.env
T4|x|backend: handler test — token missing → 503; upstream error + warm cache → 200 cached|V1,V2
T5|x|frontend: InstagramFeed section — fetch via getApiBaseUrl(), grid of permalinked thumbs, hide on fail|V4
T6|x|frontend: mount section (placement: home page, after services, before footer)|V4
T7|x|token refresh: manual for now — `ponytail:` marker in handler; upgrade to scheduled refresh when first 60d expiry bites|I.env
T8|x|backend: instagram_token.go — token store (load/save INSTAGRAM_TOKEN_PATH), exchange seed via ig_exchange_token when INSTAGRAM_APP_SECRET set|V6,V7,I.env
T9|x|backend: lazy refresh on feed fetch — ≤10d to expiry → ig_refresh_token, persist; failure → serve with current|V7
T10|x|backend: tests — exchange persists long-lived; refresh near expiry; secret never in logs|V6,V7
T11|x|backend: wire currentInstagramToken() into publicInstagram, drop `ponytail:` marker, .env.example entries|V7,I.env
T12|x|backend: long-lived seed (dashboard token) cannot exchange — fall back to ig_refresh_token on seed to establish persisted expiry & auto-refresh chain|V7
T13|x|backend: GET /api/instagram/image/{id} — downscale via galleryimg.ProcessToWebP, in-memory cache pruned to current feed ids, 302 to original on processing failure; frontend uses proxy URL|V5,B1
T14|x|frontend: central gallery normalization; computed deduplicated `alla` across gallery and homepage consumers|V9
T15|x|frontend: gate orders/stats requests by active admin view|V10
T16|x|frontend: scoped gallery/event multipart upload without generic 503 probe|V8,V11
T17|x|frontend: allow Simple Analytics script origin in `connect-src`|V12
T18|x|backend: calibrate authenticated admin limiter for normal batch operations|V13
T19|x|frontend: admin design tokens, shell, grouped navigation, page header, action rail, shared primitives|V14,V15,V17,V18,I.admin-route,I.admin-design-tokens,I.admin-primitives
T20|x|frontend: overview + stats actionable hierarchy and responsive analytics|V16,V17,V22,I.admin-api
T21|x|frontend: orders + order detail + customers scan-first workflows|V15,V16,V17,V19,V23,I.admin-api
T22|x|frontend: products shared list/editor/status workflow|V15,V16,V17,V20,V23,I.admin-api
T23|x|frontend: events + coupons shared list/editor/status workflow|V15,V16,V17,V20,V23,I.admin-api
T24|x|frontend: gallery media grid, batch rail, upload, category drawer|V15,V16,V17,V21,V23,I.admin-api
T25|x|backend: existing aggregate/batch/query contracts cover T20–T24; no new contract required; backend suite green|V13,V19,V20,V21,V22,V23,I.admin-api
T26|x|verification: all tests/build/lint + desktop/tablet/mobile visual and keyboard audit|V14,V15,V16,V17,V18,V19,V20,V21,V22,V23
T27|x|frontend: adaptive sidebar rail + off-canvas navigation with accessible motion|V14,V17,V18,V24,I.admin-route,I.admin-sidebar-behavior
T28|x|frontend: remove semantic-color edges and enforce neutral admin border policy|V14,V25,I.admin-design-tokens
T29|x|frontend: auto-hide desktop sidebar rail with hover/focus expansion and zero workspace reflow|V14,V17,V18,V24,I.admin-sidebar-behavior
T30|x|frontend: `/event` hub + `/event/brollop` wedding landing page, SEO, JSON-LD, routing, sitemap, responsive verification|V27,V28,V29,I.public-event-routes
T31|x|frontend: upgrade React/React DOM/types to 19.2, migrate removed defaults, verify tests/lint/build, audit applicable React 19 features|V4,V5,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28,V29,V30
T32|x|frontend: integrate gallery lightbox with browser history + hook regression test|V18,V31
T33|x|frontend: adopt React 19.2 effect events + ref-as-prop; update hooks lint; regression test listener stability|V10,V14,V16,V18,V24,V30,V32
T34|x|frontend: force Vite dependency re-optimization on dev start; restore cross-major context `.Provider`; regression test|V30,V33
T35|x|frontend: integrate home and course-recap overlays with browser history + regression tests|V18,V34

## §B Bugs
id|date|cause|fix
B1|2026-07-04|media_url = full-size originals (1.9–4.5MB × 8) → main-thread decode jank on scroll|V5 rev, T13
B2|2026-07-04|CSP img-src lacked http://localhost:4242 (connect-src had it) → thumbs blocked in dev, section showed alt text|index.html img-src += localhost:4242
B3|2026-07-24|session-auth header shortcut removed required idempotency key → all gallery uploads rejected|V8
B4|2026-07-24|persisted `alla` category shadowed newer category memberships → aggregate showed 26 of 57 images|V9
B5|2026-07-24|hidden admin sections fetched orders/stats and scoped uploads probed DB-only generic endpoint → noisy 429/503 responses|V10,V11
B6|2026-07-24|Simple Analytics sourcemap origin absent from `connect-src` → recurring CSP console warning|V12
B7|2026-07-24|admin limiter burst 10 exhausted by one normal gallery batch → repeated retryable 429 responses|V13
B8|2026-07-24|legacy duplicate image IDs leaked into category UI after a file-store update changed only one record|V9
B9|2026-07-25|active sidebar selection used a green inset edge that read as a clipped intermediate state|V25
B10|2026-07-25|new event and gallery component states reintroduced semantic-color borders and focus rings|V25
B11|2026-07-25|collapsed rail changed group and link insets before width animation completed → navigation icons jumped sideways|V24
B12|2026-07-25|collapsed rail removed label grid tracks before opacity transition completed → text shifted during close|V24
B13|2026-07-25|18px nav icons used a 24px left offset in a 72px rail and favicon artwork had asymmetric transparent space → rail content looked off-center|V24
B14|2026-07-25|verification invoked Vitest with Jest-only `--runInBand` → test runner rejected the command before collecting tests|invoke the declared `npm test` command without foreign-runner flags
B15|2026-07-25|gallery and about content retained viewport-triggered fade wrappers after route motion was centralized|remove page-local `FadeInSection` wrappers
B16|2026-07-25|stale prop declarations, function `defaultProps`, DOM prop casing, and a utility export produced React/Vite development warnings|align component contracts with their call sites and isolate the event mapper
B17|2026-07-25|deploy verifier gated live checks on Pages API `built` → an already-live build waited indefinitely while the API stayed queued|V26
B18|2026-07-25|gallery lightbox lived only in React state, so browser/system Back navigated the route instead of dismissing it|V31
B19|2026-07-26|Vite dev server kept React 18.3.1 optimized cache after React 19 install; React 19 context shorthand hot update rendered as React 18 consumers and crashed|V33
B20|2026-07-26|notification admin styling used green border values and violated the neutral edge policy|V25
B21|2026-07-26|notification tests combined promise-driven rendering with fake timers and timed out before async queries settled|use real timers for promise-driven component tests
B22|2026-07-27|home past-event query replaced the current entry and course recap overlays used local state only, so Back navigated away instead of dismissing the overlay|V34
