# 12: Related links

Step 3. Needs steps 1 and 2 on `main`.

## Goal

A benchmark page points onward: to its save files, to blueprints on the same subject, to
other benchmarks on the same topic, and to the benchmark before and after it. The
Blueprints page points back to the benchmarks on each category's topic.

Only links that are certain are shown. Saves, topic and date order come from data that
already exists. Blueprints are tied to benchmarks through a short, hand-kept mapping from
topic to blueprint category, not by guessing from titles.

## Files

- `content/manifest.json`: the mapping below
- `scripts/sync-content.mjs`: pass the mapping through, validate it
- `src/content.ts`: one field
- `src/pages/BenchmarkDetail.tsx`
- `src/components/TableOfContents.tsx`: only an optional `maxHeight` prop
- `src/pages/Blueprints.tsx`
- `scripts/check/pages/benchmark-detail.cjs`, `blueprints.cjs`, `data.cjs`
- `README.md`: the manifest section

## Mapping (draft, to be corrected by the site owner)

Each entry of `topics` in the manifest may list blueprint category ids (the `id` values in
`src/generated/blueprints.json`):

```json
{ "id": "science",  "label": "Science builds",    "blueprintCategories": ["megabasing-uncommon-science", "megabasing-common-quality-science"] },
{ "id": "space",    "label": "Space platforms",   "blueprintCategories": ["megabasing-space-science"] },
{ "id": "vehicles", "label": "Vehicles & chests", "blueprintCategories": ["general-cars-tanks"] }
```

The other three topics get no `blueprintCategories`. Add exactly these three lists; change nothing else in the manifest.

Sync:
- `index.json` `topics[]` entries gain `blueprintCategories: string[]` (empty array when the manifest has none).
- An id that is not a category in the parsed blueprints fails the sync, naming the topic and the id.

`src/content.ts`: add `blueprintCategories: string[]` to `TopicSummary`.

## Benchmark page

### Sidebar

Below the existing "View on GitHub" button and contents list, two blocks in the same visual style as the contents list's own heading (small `primary.main` heading, then links at `fontSize: 13`, `text.secondary`, hover `primary.main`, each on its own line, at least 24 px tall):

1. **Goes with this.** Shown when it has at least one link.
   - "`{n}` save files", to `saveFolderRoute(benchmark.source)`, when the benchmark has saves.
   - For each id in the benchmark's topic's `blueprintCategories`: "`{category name}` blueprints", to `/blueprints#<id>`.

2. **More in `{topic label}`.** Shown when the benchmark has a topic and at least one other benchmark shares it.
   - Up to 5 other benchmarks with the same topic: dated ones newest first, then undated ones in manifest order; never the current one. Each is its title, linking to its page.
   - When more than 5 others exist: a last link "All `{count}`" to `/benchmarks?topic=<id>`, where `count` is the topic's total.

These blocks show on every tab (the contents list still only on the README tab).

The sidebar is sticky on `md` and up, so it must never be taller than the window: give `TableOfContents` an optional `maxHeight` prop (default: today's 360) and pass a value that shrinks on short windows so the whole sidebar fits, with a floor of 160 px. Below `md` the sidebar is not sticky and sits after the writeup; nothing special is needed there.

### Older and newer

At the end of the main column, below the tab content, on every tab: one row with two links, separated to the left and right edges, `fontSize: 14`:

- left: "Older: `{title}`"; right: "Newer: `{title}`".
- Order: benchmarks that have a date, sorted by date, ties in manifest order. The newest has no "Newer", the oldest no "Older"; a benchmark with no date shows neither and the row is not rendered.
- On `xs` the two links stack, each at least 44 px tall.

## Blueprints page

- Each category block gets `id={cat.id}` and enough `scrollMarginTop` to clear the top bar.
- Opening `/blueprints#<id>`, or clicking a link to it from another page, scrolls that category into view. (The page renders after the browser's own hash scroll, so do it in an effect on mount and when the hash changes. If the id is not on the page, do nothing.)
- In a category's header line, at the right, for each topic whose `blueprintCategories` include this category: a link "`{topic label}` benchmarks" to `/benchmarks?topic=<id>` (`fontSize: 13`, `primary.main`).

## Checks

`data.cjs`
- Every id in every `topics[].blueprintCategories` is a category id in `data.blueprints`.

`benchmark-detail.cjs`, choosing benchmarks from `data.index`:
- One with saves: "Goes with this" has a link to `/saves/<source>` reading "`n` save files".
- One whose topic has `blueprintCategories`: one link per id, to `/blueprints#<id>`, with the category's name.
- One whose topic has more than 6 benchmarks: "More in" lists exactly 5 titles, none of them the current benchmark, in the order defined above, followed by "All `{count}`" to `/benchmarks?topic=<id>`.
- One whose topic has between 2 and 6 benchmarks: every other benchmark of the topic is listed and there is no "All" link.
- Older / Newer: for a benchmark in the middle of the date order both links point at the right neighbours; the newest has only "Older", the oldest dated one only "Newer"; an undated benchmark has no such row.
- Desktop, at 1280 × 800 and at 1280 × 600: scrolled half-way down a long writeup, the sidebar's bottom edge is inside the window.
- Phone: no sideways scroll; the Older and Newer links are each at least 44 px tall.

`blueprints.cjs`
- Loading `/blueprints#<a mapped category id>` leaves that category's heading inside the window and below the top bar.
- A mapped category shows its topic link, to the right target; an unmapped category shows none.
- From a benchmark page, clicking a "… blueprints" link lands on `/blueprints` with that category in view.

## Acceptance

- Temporarily (not committed) put an unknown id in a `blueprintCategories` list and confirm the sync fails with a clear message. Restore.
- `index.json` differs from before only by the new field; nothing else in `src/generated` changes.
- `npx tsc -b --noEmit`, `npm run build`, `npm run check` pass with no `KNOWN` lines.
- Screenshots reviewed: a benchmark page's sidebar on desktop at both window heights, the bottom of a benchmark page on desktop and phone, and `/blueprints#<id>` on desktop.
