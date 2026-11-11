# 03: Compact Benchmarks and Blog tables

Needs: 01.

## Goal

More rows on the first screen, and each benchmark row shows whether it has interactive
charts and save files. Today 12 of 43 benchmark rows fit on the first desktop screen at 43 px each.

## Files

- `src/pages/BenchmarksIndex.tsx`
- `src/pages/BlogIndex.tsx`
- `scripts/check/pages/benchmarks.cjs`
- `scripts/check/pages/blog.cjs`

## `BenchmarksIndex.tsx`

- Page `Stack` spacing 2.
- `PageHeader` with `title="Benchmarks"`; `meta` = the existing sentence, including the link to the repo: "`{n}` curated benchmarks from the factorio-benchmarks repo."
- Replace `TableContainer` + `Table` with `DenseTable` (`aria-label="Benchmarks"`). Sorting is unchanged (newest first).
- Columns from `sm` up: Date, Title, Factorio, Platform, and a last column with no header text (`aria-label="Charts and saves"` on the `th`).
- Title cell: a flex row, `alignItems: 'baseline'`, `gap: 1.5`, `minWidth: 0`:
  - the link, `fontWeight: 600`, `fontSize: 14`, `flexShrink: 0` from `md` (may wrap below `md`);
  - `summary`, when the entry has one, `body2`, `text.secondary`, single line with ellipsis, `flex: 1`, `minWidth: 0`, shown from `md` only. No entry has a summary today; step 2 fills it. Don't render an empty element.
- Chips (version, platform): `size="small"`, `variant="outlined"`, `height: 20`, `fontSize: 12`.
- Last column, right-aligned, `whiteSpace: 'nowrap'`, items `gap: 1.25`:
  - when `b.timeseries`: `BarChartIcon` (`fontSize: 16`, `color: 'primary.main'`) inside a `Tooltip title="Interactive charts"`, with `aria-label="Interactive charts"`;
  - when `b.saves.length > 0`: a `RouterLink` to `saveFolderRoute(b.source)` (from `src/saves.ts`) showing `DownloadIcon` (`fontSize: 16`) and the count, `text.secondary`, `fontSize: 13`, no underline, hover `primary.main`, `aria-label="{n} save files for {title}"`.
- Phone (`xs`): keep today's layout (date and title columns, chips under the title). Add the chart and save markers to that chip line. Rows are at least `layout.touchTarget` tall.

## `BlogIndex.tsx`

- Page `Stack` spacing 2.
- `PageHeader` with `title="Blog"`, `meta` = "`{n}` post(s)" as today.
- `DenseTable` (`aria-label="Blog posts"`).
- Title cell from `md`: link then description on one line, same pattern as the benchmark summary. Below `md`: description under the title, as today.
- Tag chips: `size="small"`, `height: 20`, `fontSize: 12`.

## Checks

`benchmarks.cjs`
- Desktop: body row height is at most 36 px.
- Desktop: at least 18 body rows are above the fold.
- Rows with `timeseries` show the chart marker; rows with saves link to `/saves/<source>` and show `saves.length`; rows with neither show nothing in the last column. Verify against `data.index` for every row.
- Phone: no row is shorter than 44 px.
- Keep the existing assertions (one row per benchmark, newest first, title links).

`blog.cjs`
- Desktop: body row height is at most 36 px.

## Acceptance

All checks pass. `/benchmarks` shows the same benchmarks in the same order as before.
