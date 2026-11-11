# 07: Topics, questions and findings in the sync

Step 2, first package. Needs nothing.

## Goal

The generated index knows, for each benchmark, its topic, the question it asks, its
one-line finding and the CPU it ran on, so the pages in packages 09–10b can show and
filter by them. This package changes the build-time sync and the types only. No page
looks different after it, except that a writeup which opens with "The Question" and
"The Answer" no longer contains those two sections (package 10b shows them above the tabs).

## Files

- `scripts/lib/readme-sections.mjs` (new): pure functions, no I/O
- `scripts/lib/readme-meta.mjs`: add `cpu`
- `scripts/sync-content.mjs`
- `src/content.ts`
- `scripts/check/pages/data.cjs` (new): checks on the generated data; opens no page
- `README.md`: the sync and manifest sections

`content/manifest.json` belongs to package 08. Do not edit it in your commit.

## Manifest (read by this package, filled in by 08)

```jsonc
{
  "topics": [                              // optional; display order
    { "id": "inserters", "label": "Inserters & clocking" }
  ],
  "benchmarks": [
    { "slug": "…", "topic": "inserters" }  // optional per benchmark
  ]
}
```

- A benchmark's `topic` must be the `id` of an entry in `topics`. Anything else fails the sync with a message naming the benchmark and the id.
- A benchmark with no `topic` is allowed (warn once with the count). An empty or missing `topics` list is allowed.
- Duplicate topic ids fail the sync.

## README sections

`scripts/lib/readme-sections.mjs`:

```js
/**
 * Find a section by heading text.
 * @param {string} markdown
 * @param {string[]} names  Heading texts to match, compared case-insensitively after
 *                          trimming whitespace and a trailing colon.
 * @returns {{ start: number, end: number, body: string } | null}
 *          Line indexes of the heading line and of the first line after the section;
 *          `body` is the section without its heading line, trimmed.
 */
export function findSection(markdown, names)

/** The markdown with that section (heading and body) removed, one blank line left in its place. */
export function removeSection(markdown, section)

/**
 * First paragraph of a section body as plain text, or '' when the body does not start
 * with prose.
 * @param {string} body
 * @param {number} [maxLength=280]
 */
export function plainFirstParagraph(body, maxLength)
```

Rules:

- A heading is an ATX heading of level 1–4. Headings inside fenced code blocks are not headings.
- A section runs from its heading to the next heading of the **same or a higher** level (fewer or equal `#`), or the end of the file. Deeper headings belong to it.
- `plainFirstParagraph(body, { maxLength = 280, allowList = false })`: take the lines up to the first blank line. If that block is a table, an image, an HTML block, a heading or a fenced code block, return `''`. Otherwise:
  - a block that is a list gives its first item when `allowList` is set, and `''` when it is not (a list item is a fragment, not a statement);
  - a prose block followed directly by list items, with no blank line, keeps only the lines before the first list item;
  - strip list markers, emphasis markers (`*`, `_` used as emphasis, `**`), inline code backticks, inline images and HTML tags; replace `[text](url)` with `text`;
  - collapse whitespace to single spaces; upper-case the first letter;
  - a result that ends with a colon is a lead-in to a list: return `''`;
  - a result shorter than 30 characters is joined with the next block when that block is prose by the same rules;
  - if longer than `maxLength`, cut at the last space before it and append `…`.

## What the sync produces

For each benchmark, from the source README (after `stripOwnToc`, before link rewriting):

| Field in `index.json` | Source |
|---|---|
| `topic` | manifest `topic` |
| `question` | `plainFirstParagraph` (lists allowed) of the section named "The Question" or "Question"; when it contains a `?`, cut after the last one |
| `finding` | `plainFirstParagraph` (no lists) of "The Answer" / "Answer"; if there is none, of "Conclusion" / "Conclusions". Kept only when it is at least 12 characters |
| `cpu` | the `**CPU:**` header line, parsed like `**Platform:**` in `readme-meta.mjs` |

Omit a field when it has no value. Top level of `index.json` gains

```ts
topics: Array<{ id: string; label: string; count: number }>   // manifest order; count = benchmarks with that topic
```

(an empty array when the manifest has none).

Lifted sections, written next to the generated README:

- `src/generated/benchmarks/<slug>/question.md`: the body of the question section (no heading), written only when `question` is non-empty.
- `src/generated/benchmarks/<slug>/answer.md`: the body of "The Answer" / "Answer", written only when `question.md` is written and that section exists. A "Conclusion" is never lifted.
- The generated `README.md` has every lifted section removed. Asset and link rewriting applies to all three files the same way.

`resetOutputDirs` already clears the folder these live in.

Types in `src/content.ts`: add `topic?`, `question?`, `finding?`, `cpu?` to `BenchmarkEntry` and
`topics: TopicSummary[]` to `ContentIndex`, with a one-line doc comment each.

Coverage line: after the benchmarks loop, log one line such as
`✓ topics 0/43 · questions 14/43 · findings 21/43 · cpu 6/43`.

## Checks (`scripts/check/pages/data.cjs`)

This module opens no page; it reads `ctx.data` and the generated folder.

- Every `question` and `finding` is 1–281 characters, starts with an upper-case letter or a digit, and contains none of: a backtick, `**`, `](`, a newline, a leading `- `.
- A benchmark has `question.md` exactly when it has `question`. Where `answer.md` exists, `question.md` exists. No `finding` ends with a colon or is shorter than 12 characters.
- No generated `README.md` still contains a heading that was lifted (for a benchmark with `question.md`, no "The Question" / "Question" heading; with `answer.md`, no "The Answer" / "Answer" heading).
- `topics` counts add up to the number of benchmarks that have a `topic`, and every `topic` is a listed id.

## Acceptance

- Save a copy of `src/generated` before you start. After your change, `diff -r` shows only: the new fields in `index.json`, the new `question.md` / `answer.md` files, and README files that differ **only** by the removed sections. `saves.json`, `blueprints.json`, `blueprints.md` and every `timeseries.json` are byte-identical.
- Report a table of every benchmark with its `question`, `finding` and `cpu` (truncate to 90 characters), and say for each `finding` whether it came from an Answer or a Conclusion. The coordinator reads this before the page packages start.
- Unit-test the three functions by hand on at least: a normal section; a section that ends at end of file; a section containing a deeper heading; a body starting with a list; a body starting with a table (must give `''`); a heading inside a code fence (must be ignored); text longer than 280 characters. Report inputs and outputs briefly.
- Temporarily (not committed) add a `topics` list and a few `topic` fields to the manifest and confirm: counts are right, an unknown id fails the sync, a duplicate id fails the sync. Restore the manifest.
- The benchmark pages still render: the full `npm run check` passes. Its `benchmark-detail` module may need one adjustment if it looked for text that now lives in `question.md`; say exactly what you changed and why (that file is otherwise package 10b's).
- `npx tsc -b --noEmit`, `npm run build`, `npm run check` pass with no `KNOWN` lines.
