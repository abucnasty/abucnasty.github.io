# 00: Layout check script

## Goal

A repeatable command, `npm run check`, that opens the built site in a headless browser and
asserts facts about each page. Every later package adds its own assertions and runs this
before handing back, so it has to be easy to extend one page at a time.

## Files

- `scripts/check/run.cjs` (new): the runner
- `scripts/check/pages/*.cjs` (new): one file per page, listed below
- `package.json`, `package-lock.json`: add the `check` script and the `playwright` dev dependency
- `README.md`: a short "Checking layout" section

Nothing under `src/` changes.

## Dependency

Add `playwright` as a dev dependency at exactly `1.63.0`. Use CommonJS (`.cjs`) and
`require('playwright')`. Launch with `chromium.launch()` and no options; if the environment
variable `CHROMIUM_PATH` is set, pass it as `executablePath`. Do not run `playwright install`.

## Runner behaviour

`node scripts/check/run.cjs [--only <name>[,<name>]] [--shots]`

1. Fail with a clear message if `dist/index.html` does not exist ("run `npm run build` first").
2. Start `vite preview` on a free port, wait until it answers, and always stop it on exit, including on failure or Ctrl-C.
3. Load every `scripts/check/pages/*.cjs` (or only those named by `--only`), in file-name order, and call its `run(ctx)`.
4. Print one `PASS` / `FAIL` line per assertion, then a summary. Exit 1 if anything failed or a page module threw.

A page module looks like this:

```js
// scripts/check/pages/tools.cjs
module.exports = {
  name: 'tools',
  async run({ open, expect, data, aboveFold }) {
    const page = await open('/tools', 'desktop');
    expect('page has a title', (await page.locator('main h1, main h3').first().textContent()) === 'Tools');
  },
};
```

`ctx` provides:

| Member | Meaning |
|---|---|
| `open(path, viewport)` | Opens `path` and resolves to a Playwright `Page` once the network is idle. `viewport` is `'desktop'` (1280 × 800) or `'phone'` (390 × 844). Pages are closed by the runner. |
| `expect(label, ok, detail?)` | Records one assertion. `detail` is printed on failure. |
| `data` | `{ index, blueprints, saves }`: the parsed `src/generated/index.json`, `blueprints.json` and `saves.json`. Use these for counts; never hard-code content numbers. |
| `aboveFold(page, selector)` | Number of elements matching `selector` that lie fully inside the window without scrolling. |
| `box(page, selector)` | `{ x, y, width, height }` of the first match, rounded, or `null`. |
| `shot(page, name)` | With `--shots`, saves `check-output/<name>.png` at device scale 2. A no-op otherwise. |

Checks the runner applies to **every** page it opens, without the page module asking:

- no uncaught page errors and no console errors. Allow-list, by URL or message substring, only what is known and unrelated to layout: the YouTube Data API request made by the Home page's latest-video card (it fails without an API key). Print what was ignored.
- on the `phone` viewport, the page does not scroll sideways (`scrollWidth - clientWidth <= 0`).

## Page modules to create

These describe the site **as it is today** at a level that stays true through the restructure.
Later packages tighten them.

| File | Asserts |
|---|---|
| `shell.cjs` | Header and footer render on `/`; the header menu contains links to `/benchmarks`, `/saves`, `/blueprints`, `/tools`, `/blog`; an unknown URL shows the not-found page; a deep link through the `/?path=` shim (see `public/404.html`) lands on the right page |
| `home.cjs` | Renders on desktop and phone; has at least one link to a benchmark page |
| `benchmarks.cjs` | One row per `data.index.benchmarks`; first row is the newest by date; each title links to `/benchmarks/<slug>` |
| `benchmark-detail.cjs` | For the newest benchmark and for one with `timeseries: true`: title shown, README content rendered, tabs present when it has charts or saves |
| `blueprints.cjs` | Number of rows equals the number of non-deprecated entries; the deprecated switch reveals the rest |
| `tools.cjs` | Every tool, utility, mod and tutorial link currently on the page is present (count the outbound links) |
| `blog.cjs` | One row per post in `src/blog/registry.ts`; a post page renders |
| `saves.cjs` | Port of the existing save-browser checks: landing totals match `data.saves`, folder navigation, a collapsed-chain folder, deep link to a nested folder, search (`wagon`), sort, unknown path, "Read the writeup" link, link from a benchmark's Save files tab, download link shape `<lfsWorkerUrl>/objects/<64 hex>/<name>`, copy button |

`blog.cjs` may read the registry by parsing the file for `slug:` entries; do not import TypeScript.

## Acceptance

- `npm run build && npm run check` passes on the current `main` content with zero failures.
- `npm run check -- --only tools` runs only that module.
- `npm run check -- --shots` writes screenshots under `check-output/` (already git-ignored).
- Deliberately break one assertion locally, confirm the runner prints `FAIL` and exits 1, then restore it.
- The preview server is not left running after the command ends, in the pass and the fail case.
- `npx tsc -b --noEmit` still passes.
