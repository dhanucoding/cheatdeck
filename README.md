# CheatDeck

Fast, keyboard-first cheat sheets. Starts with system design.

## Develop
```sh
npm install
npm run dev      # http://localhost:4321/cheatdeck/
npm run build    # astro build + pagefind index
```

## Add a sheet
Create `src/content/sheets/<category>/<slug>.mdx` with frontmatter
(`title, category, summary, tags, difficulty, updated, related`). New categories
need an entry in `src/lib.ts`.

## Deploy
Pushes to `main` deploy via `.github/workflows/deploy.yml`.
In the repo: Settings → Pages → Source: **GitHub Actions**.
Live at https://dhanucoding.github.io/cheatdeck/
