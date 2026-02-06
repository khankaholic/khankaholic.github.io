# khankaholic.github.io

Personal website built with plain HTML, CSS, and TypeScript (via Vite).

## Sections

- Home
- Writing
- Books
- Projects
- CV

## Local development

Requirements:
- Node.js 20+

Commands:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repo includes `.github/workflows/deploy.yml`.

1. Push to `main`.
2. In GitHub: `Settings -> Pages`.
3. Set **Source** to **GitHub Actions**.
4. The workflow builds and deploys `dist/` automatically.

## Editing content

- Writing cards and project cards: `src/content.ts`
- Global styles and theme: `src/styles.css`
- Page behavior and animations: `src/main.ts`
- Page structure:
  - `index.html`
  - `writing.html`
  - `books.html`
  - `projects.html`
  - `cv.html`
- Home intro text: `index.html`
- Home avatar image: `public/images/profile/me-00.jpeg` (update file or path in `index.html` if you change it)

## Asset Organization

Use this structure for static assets:

- `public/images/profile/` for your personal photos (`me-00.jpeg`, future headshots)
- `public/images/placeholders/` for fallback/demo images
- `public/icons/` for browser/app icons (`favicon.ico`, png sizes, apple touch icon)
- `public/favicon.svg` as svg fallback icon

## Notes

- For a user site (`https://<username>.github.io`), no extra `base` config is needed.
- Replace placeholder links/email in `cv.html` and `src/content.ts` with your real data.
