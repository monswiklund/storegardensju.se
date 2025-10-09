# GEMINI.md

## Project Overview

This is the codebase for the website of Storegården 7, a multifaceted venue that appears to host events, showcase art and ceramics, and offer other services. The website is a modern, single-page application (SPA) built with **React** and **Vite**, designed to be responsive and visually appealing.

### Key Technologies:

*   **Frontend Framework:** [React](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **Styling:** A combination of custom CSS modules and potentially [Tailwind CSS](https://tailwindcss.com/) (inferred from configuration files).
*   **Linting:** [ESLint](https://eslint.org/) with plugins for React and accessibility.
*   **Deployment:** [GitHub Pages](https://pages.github.com/)

### Architecture:

The application follows a standard component-based architecture.

*   `src/pages`: Contains the top-level components for each page (e.g., `HomePage.jsx`, `GalleriPage.jsx`).
*   `src/components`: Contains reusable UI components organized by feature (e.g., `gallery`, `hero`, `events`).
*   `src/data`: Holds static data, including a `galleryCategories.json` file that is dynamically generated at build time.
*   `public/images`: Stores all image assets, which are organized into subdirectories by category (`lokal`, `evenemang`, `konst-keramik`).

A key feature is the automated gallery generation. A Node.js script (`scripts/generate-gallery-categories.js`) scans the `public/images` directory and creates a structured JSON file (`src/data/galleryCategories.json`). This file powers the different categories in the image gallery, making it easy to manage content by simply adding or removing image files.

## Building and Running

### Prerequisites:

*   [Node.js](https://nodejs.org/) (version 18 or higher recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation:

To set up the development environment, clone the repository and install the dependencies:

```bash
npm install
```

### Development:

To run the local development server with hot-reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production:

To build the static assets for production:

```bash
npm run build
```

This command performs the following steps:
1.  Runs the `scripts/generate-gallery-categories.js` script to update the gallery data.
2.  Creates a `src/build.json` file with the current version and build timestamp.
3.  Uses Vite to bundle the application into the `dist/` directory.

### Previewing the Production Build:

To serve the `dist/` directory locally for inspection:

```bash
npm run preview
```

### Deployment:

The project is configured for easy deployment to GitHub Pages.

```bash
npm run deploy
```

This command will first run the `build` script and then push the contents of the `dist` directory to the `gh-pages` branch of the GitHub repository.

## Development Conventions

### Code Style & Linting:

The project uses **ESLint** to enforce a consistent code style. The configuration (`eslint.config.js`) includes recommended rules for JavaScript, React, and React Hooks.

To check for linting errors, run:

```bash
npm run lint
```

### Image Gallery Management:

The image gallery is a central feature of the website. To add, remove, or re-categorize images, follow these steps:

1.  **Navigate** to the `public/images/` directory.
2.  **Add or remove** `.jpg` files within the category subdirectories (`lokal/`, `evenemang/`, `konst-keramik/`). The image file names should follow the pattern `slide<number>.jpg`.
3.  **Run the build script** (`npm run build`). The `generate-gallery-categories.js` script will automatically update the gallery data used by the application.

This workflow eliminates the need to manually edit any code or JSON files when managing gallery content.

### Component Structure:

*   **Pages** (`src/pages`) are responsible for the overall layout and data fetching for a specific URL.
*   **Components** (`src/components`) are reusable and should be as self-contained as possible. They are further organized by their functional area (e.g., `gallery`, `events`).
*   **UI Components** (`src/components/ui`) are generic, presentational components used throughout the application (e.g., `FadeInSection.jsx`, `BuildInfo.jsx`).
