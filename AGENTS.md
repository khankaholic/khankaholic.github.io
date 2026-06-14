# Repository Guidelines

## Project Structure & Module Organization

This is a personal website built with Vite, plain HTML, CSS, and TypeScript. Top-level HTML files (`index.html`, `writing.html`, `books.html`, `projects.html`, `cv.html`) define page structure. Long-form content lives in `posts/` and `reviews/`. Shared TypeScript is in `src/`: `main.ts` handles browser behavior, `content.ts` stores writing/project/CV data, `site.ts` stores site metadata, and `styles.css` contains global styling. Static assets belong in `public/`, with profile images in `public/images/profile/`, placeholders in `public/images/placeholders/`, and icons/manifest files in `public/icons/` and `public/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite dev server, usually at `http://localhost:5173`.
- `npm run build`: run TypeScript checks with `tsc`, then build the production site into `dist/`.
- `npm run preview`: serve the built site locally for a production-like check.

Run commands from the repository root.

## Coding Style & Naming Conventions

Use strict TypeScript and keep code browser-native unless a dependency is already justified. The project uses ES modules, two-space indentation in JSON, and TypeScript files with explicit types for exported content models. Prefer `const` by default, small functions, and descriptive data names such as `writingEntries` or `projectEntries`. Keep page filenames lowercase and URL-oriented, for example `posts/quiet-systems.html`. Store reusable content in `src/content.ts` rather than duplicating card markup across pages.

## Testing Guidelines

There is no dedicated test framework configured. Treat `npm run build` as the required validation step because it enforces the strict `tsconfig.json` rules and verifies the Vite build. For UI/content changes, also run `npm run dev` and manually check the affected pages in a browser. If adding a test framework later, document its command here and keep tests close to the behavior they cover.

## Commit & Pull Request Guidelines

Recent history uses short conventional-style prefixes such as `chore:`, `feat:`, and `ci:`. Follow that pattern with an imperative, specific subject, for example `feat: add books page filters` or `chore: update profile image`. Pull requests should include a brief summary, affected pages or files, validation performed (`npm run build`, browser checks), and screenshots for visible UI changes. Link related issues when available.

## Deployment Notes

GitHub Pages deployment is handled by `.github/workflows/deploy.yml`. Push changes to `main` and keep the Pages source configured as GitHub Actions. No custom Vite `base` setting is needed for this user-site repository.
