# 06: Benchmark page header and single contents list

Needs: 01.

## Goal

The first screen of a benchmark page shows what was tested and starts the writeup. Today
it can be a contents list shown twice (once from the README, once in the sidebar) with the
title repeated in the sidebar.

## Files

- `src/pages/BenchmarkDetail.tsx`
- `scripts/lib/strip-toc.mjs` (new)
- `scripts/sync-content.mjs`: only the one call described below
- `scripts/check/pages/benchmark-detail.cjs`
- `src/components/MarkdownRenderer.tsx`: only if the phone overflow fix below needs it

## Fix: benchmark pages scroll sideways on phones

The check script found that benchmark pages are wider than a phone screen today
(85 px on `2026-11-02-inserter-update-order`, 112 px on `2026-01-25-linux-vs-windows`).
`benchmark-detail.cjs` carries a `knownIssues` entry for it.

Find the cause and fix it so wide README content (tables, code blocks, images) scrolls
inside its own box and the page itself never scrolls sideways. A likely cause, to confirm
rather than assume: the page grid's single column on `xs` is `1fr`, which cannot shrink
below its content's minimum width, where `minmax(0, 1fr)` can.

Then delete the `knownIssues` entry so the sideways-scroll rule is enforced on these pages.

## Sync: drop the README's own contents list

`scripts/lib/strip-toc.mjs` exports a pure function:

```js
/**
 * Remove a "Table of Contents" section from a README: the heading and the list under it.
 * Returns the markdown unchanged when there is no such section, or when the section
 * holds anything other than list items and blank lines.
 *
 * @param {string} markdown
 * @returns {string}
 */
export function stripOwnToc(markdown)
```

- The heading is any level 1–4 ATX heading whose text, ignoring case and surrounding whitespace, is `Table of Contents`.
- The section runs to the next ATX heading or the end of the file.
- Strip only if every line in between is blank or a list item (`-`, `*`, `+` or `1.` after optional indentation). Otherwise leave the file alone.
- Leave exactly one blank line where the section was. Ignore headings inside fenced code blocks.

In `sync-content.mjs`, apply it to the README text in `syncBenchmark` before `rewriteMarkdownAssetPaths`. Nothing else in the sync changes.

Seven source READMEs have such a section today (for example `benchmarks/2026-01-25-linux-vs-windows` and `benchmarks/pollution-control`).

## `BenchmarkDetail.tsx`

Header (replaces the hand-built overline + `h3`):

- `PageHeader` with `overline` = the date, or "Benchmark" when there is none, and `title`.
- Under it a chip row: flex, `flexWrap: 'wrap'`, `gap: 1`, `mt: 1`. All chips `size="small"`, `variant="outlined"`. In this order, each only when it applies:
  - `Factorio {factorioVersion}`
  - `formatPlatform(platform)` (from `src/format.ts`)
  - `{n} save files`: a clickable chip, `component={RouterLink}`, `to={saveFolderRoute(benchmark.source)}`
  - `Interactive charts`: a clickable chip that switches to the charts tab
  - one chip per `tags` entry

Sidebar:

- Remove the repeated date, title and tags. Keep "View on GitHub" and, when the README tab is showing, the contents list ("On this page").
- `p: 2`; width 260 (grid `gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 260px' }`, `gap: 3`).
- Sticky offset: `top: { md: layout.topBarHeight + 24 }`.

Everything else stays: the tabs, the charts, the Save files tab with its link to the save browser, loading and error states, the not-found state.

## Checks (`benchmark-detail.cjs`)

- No file matching `src/generated/benchmarks/*/README.md` contains a `Table of Contents` heading (read the files).
- For each README that had one in the source, the generated file differs from what the previous sync produced only by that removed section. Verify this once by hand with a diff and say so in your report; the check itself only needs the first bullet.
- On a benchmark whose source README has a contents section: the text "Table of Contents" appears nowhere in `main`.
- The sidebar does not contain the benchmark title.
- The `h1` is 28 px.
- For a benchmark with a version: a chip reads `Factorio <version>`. For one with saves: the chip links to `/saves/<source>` and shows `saves.length`. For one with charts: clicking "Interactive charts" shows the charts tab.
- Desktop: the first element of the README body starts above y = 330.
- Phone: no sideways scroll on any tested benchmark page, with no `knownIssues` entry left in the module; chips wrap.

Pick the benchmarks to test from `data.index` (first with `timeseries`, first with saves, and the slug `2026-01-25-linux-vs-windows` when it exists).

## Acceptance

All checks pass. Unit-test `stripOwnToc` by hand on three inputs and include the results in your report: a README with a contents list, one without, and one whose "Table of Contents" section contains a paragraph (must be left unchanged).
