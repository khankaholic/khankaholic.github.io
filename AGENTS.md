# Repository Guidelines

## Project Structure & Module Organization

This is a Vite site built with plain HTML, CSS, and TypeScript. Top-level HTML files (`index.html`, `writing.html`, `books.html`, `projects.html`, `cv.html`) define page structure. Long-form articles live in `posts/` and `reviews/` as `article.longform` pages. Shared TypeScript is in `src/`: `main.ts` bootstraps behavior, `content.ts` stores writing/project/CV data, `longform.ts` handles article TOC/navigation/comments, `longform-meta.ts` syncs article metadata, and `article-markdown*.ts` powers copy/open-Markdown actions. Global styling is in `src/styles.css`; static assets belong in `public/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite dev server, usually at `http://localhost:5173`.
- `npm run build`: run TypeScript checks with `tsc`, then build the production site into `dist/`.
- `npm run preview`: serve the built site locally for a production-like check.

Run commands from the repository root.

## Coding Style & Naming Conventions

Use strict TypeScript and keep code browser-native unless a dependency is justified. The project uses ES modules, two-space indentation in JSON, and typed exported content models. Prefer `const`, small functions, and descriptive data names such as `writingEntries`. Keep page filenames lowercase and URL-oriented, for example `posts/quiet-systems.html`. Store reusable content and reading times in `src/content.ts`; article pages should sync from that source.

## Testing Guidelines

There is no dedicated test framework configured. Treat `npm run build` as required validation because it enforces `tsconfig.json` and verifies the Vite build. For UI/content changes, also run `npm run dev` and check affected pages in a browser. For long-form changes, verify TOC links, previous/next links, comments loading, article reading time, and the copy/open-Markdown menu.

## Content & Configuration Notes

Article TOCs are generated from `h2`/`h3` headings, so use descriptive headings and avoid skipping levels. The home visitor globe is an external script in `index.html`; do not move it onto article pages unless requested. Favicon assets come from `public/favicon-source.jpg`; update generated icons, `favicon.svg`, and `site.webmanifest` together.

## Commit & Pull Request Guidelines

Recent history uses short prefixes such as `chore:`, `feat:`, and `ci:`. Follow that pattern with an imperative, specific subject, for example `feat: add books page filters`. Pull requests should include a summary, affected pages/files, validation performed (`npm run build`, browser checks), and screenshots for visible UI changes.

## Deployment Notes

GitHub Pages deployment is handled by `.github/workflows/deploy.yml`. Push changes to `main` and keep the Pages source configured as GitHub Actions. No custom Vite `base` setting is needed for this user-site repository.
