# 09: Filters on the Benchmarks page

Needs: 07, 08.

## Goal

A visitor can narrow 43 benchmarks to the few they care about by typing, by topic, by
Factorio version, or by "has interactive metrics" / "has save files", and every row shows
the question the benchmark answers. Any filtered view can be linked.

The question text is the thing this page is for. Keep the controls quiet: no decoration,
no labels that only name the obvious, plain sentence-case wording.

## Files

- `src/benchmarkFilters.ts` (new): pure logic, no React
- `src/pages/BenchmarksIndex.tsx`
- `scripts/check/pages/benchmarks.cjs`

## `src/benchmarkFilters.ts`

```ts
export interface BenchmarkFilters {
  /** Free text. Whitespace-separated terms; all must match. */
  q: string;
  /** Topic id, or '' for all. */
  topic: string;
  /** Factorio major.minor such as '2.1', or '' for all. */
  version: string;
  /** Only benchmarks with interactive metrics. */
  charts: boolean;
  /** Only benchmarks with save files. */
  saves: boolean;
}

export const NO_FILTERS: BenchmarkFilters;

/** Read filters from a query string. Unknown topic ids and versions become ''. */
export function readFilters(params: URLSearchParams, index: ContentIndex): BenchmarkFilters;

/** Write filters back, omitting defaults, and leaving unrelated params alone. */
export function writeFilters(params: URLSearchParams, filters: BenchmarkFilters): URLSearchParams;

export function isFiltered(filters: BenchmarkFilters): boolean;

/** Versions present in the data as 'major.minor', newest first. */
export function versionOptions(benchmarks: BenchmarkEntry[]): string[];

export function matches(b: BenchmarkEntry, filters: BenchmarkFilters, topicLabel: (id: string) => string): boolean;
```

- Query parameters: `q`, `topic`, `v`, `charts=1`, `saves=1`.
- Text matches against, lower-cased: title, `question ?? summary`, the topic label, `factorioVersion`, `platform`.
- `version` matches when `factorioVersion` is that `major.minor` or starts with it followed by a dot. A benchmark with no version never matches a version filter.

## Page

Order, top to bottom, in the page `Stack` (spacing 2):

1. `PageHeader`, unchanged.

2. Controls, one flex row that wraps (`gap: 1`, `alignItems: 'center'`):
   - Text input: `OutlinedInput`, `flex: '1 1 260px'`, `height: { xs: 44, md: 36 }`, `backgroundColor: 'background.paper'`, `fontSize: 14`, search icon at the start, a clear button at the end when it has text. Placeholder "Filter by title, question or topic". Accessible name "Filter benchmarks".
   - Version buttons: "All versions", then one per `versionOptions`. Same look as the sort buttons on the Saves page (`Button variant="outlined"`, the active one in `primary.main`), each with `aria-pressed`.
   - Two toggle buttons, same look, with `aria-pressed`: `BarChartIcon` + "Interactive metrics", and `DownloadIcon` + "Save files". Each label is followed by the number of benchmarks it would keep out of all of them, in `text.secondary`.
   - All buttons are `{ xs: 44, md: 36 }` tall.

3. Topic chips, one flex row that wraps (`gap: 0.75`), only when `topics` is not empty: "All" then one chip per topic in `index.topics` order, each showing its label and its count in `text.secondary`. `Chip size="small" variant="outlined" clickable`; the selected one uses `color="primary"` and `aria-pressed="true"`. Choosing the selected topic again returns to "All". On `xs` the chips are 32 px tall.

4. When any filter is active, one line: "`{n}` of `{total}` benchmarks" (`body2`, `text.secondary`) followed by a text button "Clear filters".

5. The table (`DenseTable`). Columns from `md`:

   | Column | Content |
   |---|---|
   | Date | as today |
   | Benchmark | title link, then `question ?? summary` on the same line: `body2`, `text.secondary`, one line with an ellipsis. This is the existing summary slot; it now prefers `question`. |
   | Topic | the topic label as a small outlined clickable `Chip` that selects that topic. Empty when the benchmark has none. |
   | Factorio | as today |
   | (markers) | as today |

   The Platform column goes away (platform is on the benchmark page and still matches the text filter). Between `sm` and `md` show Date, Benchmark, Factorio and markers.

   On `xs`: Date and Benchmark columns. Under the title, the question on one line with an ellipsis (`fontSize: 12.5`, `text.secondary`), then the existing chip line with the version chip and markers (no platform chip). Rows stay at least 44 px tall.

6. When nothing matches: in place of the table body, a `background.paper` block (`p: 3`) with "No benchmarks match these filters." and a "Clear filters" button.

Behaviour:

- Filters live in the URL and are read on load. Every change replaces the current history entry (`{ replace: true }`).
- Sort order is unchanged: newest first.
- Typing must not lose focus or caret position.

## Checks (`benchmarks.cjs`)

Compute the expected rows in the check itself from `data.index` (do not import the TypeScript). For each case, the rows on the page must be exactly the expected benchmarks, in order:

- no parameters: all benchmarks;
- `?topic=<id>` for the first topic: also, that chip is `aria-pressed="true"` and the count line reads "`n` of `total` benchmarks";
- `?v=<newest version option>`;
- `?charts=1`, `?saves=1`, and `?topic=<id>&saves=1` together;
- `?q=` with two terms taken from one benchmark's question;
- `?topic=nonsense&v=9.9`: treated as no filter;
- `?q=zzzzqqqq`: the empty state, and "Clear filters" brings every row back and leaves a URL with no parameters.

Interaction, on desktop:

- typing into the input filters the rows and puts `q` in the URL; the input keeps focus;
- clicking a topic chip in a row selects that topic;
- clicking the selected topic chip again clears it.

Layout:

- desktop, no filters: at least 16 body rows above the fold; body rows at most 36 px tall;
- for a benchmark that has a `question`, its row shows text starting with the first 30 characters of it;
- phone: no sideways scroll with every control visible; rows at least 44 px; the text input and buttons at least 44 px tall.

Keep the existing marker and row-count assertions; the Platform assertions go.

## Acceptance

All checks pass. With no filters the page lists the same benchmarks in the same order as before. `npx tsc -b --noEmit`, `npm run build`, `npm run check` pass. Screenshots at desktop and phone, with and without a filter, reviewed.
