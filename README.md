# My Dev Toolbox

This repository now includes a GitHub Pages-ready React version of Smart Formatter.

## Smart Formatter

- Source app: `smart-formatter-react/`
- GitHub Pages output: `docs/`
- Production base path: `/my-dev-toolbox/`

Smart Formatter supports:

- JSON pretty-printing with syntax highlighting
- Markdown rendering
- KaTeX math in `$...$` and `$$...$$`
- Plain text passthrough

## Local Development

From `smart-formatter-react/`:

```bash
npm install
npm run dev
```

## Production Build

From `smart-formatter-react/`:

```bash
npm run build
```

This writes the production site into `docs/`.

## GitHub Pages Publishing

Use the `docs` publishing model on the main branch:

1. Commit `smart-formatter-react/`, `docs/`, and `.gitignore`.
2. Push to GitHub.
3. In GitHub repository settings, open Pages.
4. Set Source to `Deploy from a branch`.
5. Select branch `main` and folder `/docs`.
6. Save.

The published URL will be:

```text
https://<your-user-name>.github.io/my-dev-toolbox/
```

## Notes

- `smart-formatter-react/public/.nojekyll` ensures the build keeps `.nojekyll` in `docs/`.
- KaTeX font assets are emitted automatically into `docs/assets/` during build.
