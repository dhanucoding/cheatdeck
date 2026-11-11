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

## Share preview and icons
`public/og.png` (1200×630) and `public/apple-touch-icon.png` are rendered from
`scripts/og.html` and `scripts/icon.html`. To regenerate after a design change:
```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot=public/og.png file://$PWD/scripts/og.html
"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=180,180 --screenshot=public/apple-touch-icon.png file://$PWD/scripts/icon.html
```
