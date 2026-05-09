# abucnasty.github.io

Static showcase site for [abucnasty/factorio-benchmarks](https://github.com/abucnasty/factorio-benchmarks). Vite + React + TypeScript + MUI, deployed to GitHub Pages.

## What this is

A read-only frontend over a curated subset of the benchmarks repo:

- **Benchmarks** — a sortable table of every benchmark in the manifest, with detail pages that render each `README.md`, link to original save files on GitHub, and surface metadata (date, Factorio version, platform).
- **Blueprints** — a dense list view of `docs/blueprints/README.md`, grouped by parent → category, with hover-popover previews scraped from factoriobin.
- **Home** — featured benchmarks plus links.

The site itself contains **no benchmark content in source control** beyond the curation manifest. A sync script at build time reads the local `factorio-benchmarks` clone (or a path set via `$FACTORIO_BENCHMARKS_PATH` in CI), copies / rewrites assets into `public/` and `src/generated/`, and produces a typed JSON index the React app imports directly.

## Repo layout

```
content/manifest.json         # ← curation list — edit this to add/remove benchmarks
scripts/
  sync-content.mjs            # build-time sync: copies assets, rewrites markdown, writes index
  parse-blueprints.mjs        # parses docs/blueprints/README.md into structured JSON
src/
  components/                 # MarkdownRenderer, BlueprintRow, BenchmarkCard, AppShell, …
  pages/                      # Home, BenchmarksIndex, BenchmarkDetail, Blueprints, About
  generated/                  # ← gitignored; produced by sync-content.mjs
    index.json
    blueprints.json
    blueprints.md
    benchmarks/<slug>/README.md
  content.ts                  # types for everything in src/generated
  theme.ts                    # MUI dark theme (orange/green on black)
public/
  benchmarks/<slug>/...       # ← gitignored; non-zip assets copied by sync
  404.html                    # SPA fallback for GitHub Pages
.cache/
  factoriobin-previews.json   # ← gitignored; cached preview-image lookups
```

## Local development

Prerequisite: clone `factorio-benchmarks` next to this repo (`../factorio/factorio-benchmarks`) **or** set `FACTORIO_BENCHMARKS_PATH` to point at it.

```sh
npm install
npm run dev      # runs sync, then vite dev server
npm run build    # runs sync, type-checks, builds to dist/
npm run sync     # just refresh src/generated and public/benchmarks
```

> Note: sync is invoked explicitly via `&&` chaining in `dev` / `build`, not via `predev` / `prebuild` lifecycle hooks — this means it works even with `npm config ignore-scripts=true`.

## Adding a new benchmark

1. Make sure the benchmark folder exists in the local `factorio-benchmarks` clone with a `README.md` (and any images, csvs, save zips).
2. Add an entry to [`content/manifest.json`](content/manifest.json):

   ```jsonc
   {
     "slug": "my-new-benchmark",                          // URL slug → /benchmarks/my-new-benchmark
     "source": "benchmarks/2026-05-09-my-new-benchmark",  // path within the source repo
     "title": "My New Benchmark",
     "date": "2026-05-09",                                // optional; used for sorting
     "summary": "One-line teaser.",                       // optional; shown in table + cards
     "tags": ["circuits", "ups"],                         // optional
     "featured": true                                     // optional; shows on home page
   }
   ```

3. `npm run build` (or `npm run sync` for a quick refresh).

What sync does for each entry:

- Copies every non-`.zip` file (preserving sub-paths) → `public/benchmarks/<slug>/`
- Rewrites `README.md` image refs (`./image.png`, `<img src="…">`) → `/benchmarks/<slug>/…` and writes the result to `src/generated/benchmarks/<slug>/README.md`
- Skips `.zip` files in the copy; their entries in the index point at raw GitHub URLs (`raw.githubusercontent.com/…/master/…`) so saves remain downloadable without bundling them
- Extracts `**Factorio Version:**` and `**Platform:**` from the README header and stores them on the index entry

## Removing / hiding a benchmark

Just delete its entry from `content/manifest.json` and rebuild. The benchmark's source folder in the upstream repo is untouched.

## Blueprints page

Rendered from a single source file: `docs/blueprints/README.md` in the benchmarks repo (path configurable via `manifest.json#blueprintsSource`). Edit the markdown there — the parser ([scripts/parse-blueprints.mjs](scripts/parse-blueprints.mjs)) understands:

- `## Parent` → top-level section divider
- `### Category` → list block (optionally preceded/followed by an icon image)
- A markdown table with columns like `Description | Version | Author | Links` (links cell can contain factoriobin and youtube URLs)
- A `Deprecated:` heading or inline `(deprecated)` text marks entries as deprecated; they're hidden by default and revealed by the toggle on the page.

On sync, each `factoriobin.com/post/<id>` link is fetched once to extract its preview image URL; results are cached in `.cache/factoriobin-previews.json` so reruns don't re-hit the site. Delete the cache file to force a re-fetch.

## Deployment

GitHub Pages via Actions (Phase 4 — TBD). CI will clone `factorio-benchmarks` (sparse-checkout, manifest-driven), run `npm ci && npm run build`, and publish `dist/`. The `public/404.html` shim restores the deep-link path for client-side routing.

## Stack

- Vite 5 + React 18 + TypeScript 5 (strict)
- MUI v7 + Emotion (dark theme, pure black background to match chart renders)
- React Router v6 (`BrowserRouter`)
- react-markdown 9 + remark-gfm + rehype-raw + rehype-slug + rehype-autolink-headings
- Sync pipeline is plain Node ESM — no extra dependencies