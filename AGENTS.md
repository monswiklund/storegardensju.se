# Repository Guidelines

## Project Structure & Module Organization
The app lives in `src/`: `components/` holds feature-specific UI, `pages/` expose router screens, `data/` stores curated content, `hooks/` bundles shared logic, and `assets/` keeps local media. `src/index.css` provides global styles, while everything under `public/` is served as-is. Build outputs such as `src/build.json` and the production bundle in `dist/` are generated—never hand-edit them. Reference docs and gallery notes live in `docs/`, helper Node scripts in `scripts/`, and Playwright automation in `tests/`, with run artifacts landing in `playwright-report/` and `test-results/`.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Use `npm run dev` to start Vite with hot module reload on http://localhost:5173. `npm run build` first regenerates gallery metadata and version info, then emits production assets. Reach for `npm run build:gallery` after adding or reordering images, and `npm run build:version` when you only need to restamp build details. `npm run preview` serves the built bundle, `npm run lint` checks style, and `npm run deploy` publishes `dist/` to GitHub Pages.

## Coding Style & Naming Conventions
ESLint (`eslint.config.js`) enforces modern JavaScript, React, hooks safety, and React Refresh rules. Format code with four-space indentation, prefer double quotes in JSX props, and keep accessibility landmarks (`role`, `aria-label`) accurate. Name React components and files in PascalCase, hooks with a `use` prefix, utilities in camelCase, and static assets or screenshots in kebab-case. Encapsulate side effects inside `useEffect`, and keep visual structure within semantic HTML elements.

## Testing Guidelines
We rely on `@playwright/test` for end-to-end coverage. Place new specs under `tests/` using the `.spec.js` suffix and group related flows with `test.describe`. Run the suite via `npx playwright test`; artifacts appear in `test-results/` and HTML reports in `playwright-report/`. Capture tricky regressions with `npx playwright test --trace on` and attach the trace when opening issues or reviews. Focus on navigation, gallery interactions, and contact touchpoints whenever UI changes ripple across shared components.

## Commit & Pull Request Guidelines
Recent history favors descriptive sentence-style subjects that summarize scope and intent; follow that tone and keep each commit focused. Before raising a PR, ensure `npm run lint`, `npm run build`, and the Playwright suite succeed locally. Provide a concise summary, link any tracking issues, and include before/after screenshots for visual changes. Call out skipped checks, new environment variables, or manual follow-up so reviewers can validate quickly.
