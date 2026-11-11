# 06b: Review fixes for step 1

Needs: 02, 03, 06.

Small things found while reviewing packages 02–06. Each is independent.

## Files

- `scripts/lib/strip-toc.mjs`
- `src/components/TableOfContents.tsx`
- `src/pages/BenchmarkDetail.tsx`
- `src/pages/BenchmarksIndex.tsx`
- `src/pages/Tools.tsx`
- `scripts/check/pages/benchmark-detail.cjs`
- `scripts/check/pages/benchmarks.cjs`
- `scripts/check/pages/tools.cjs`

## 1. Contents section written as an HTML heading

`benchmarks/2026-04-05-purple-q1-vs-q2/README.md` starts its contents list with
`<h2>Table Of Contents</h2>` instead of a `##` heading, so `stripOwnToc` leaves it in.

Extend `stripOwnToc` so the opening heading may also be a single-line HTML heading:
`<h1>` to `<h4>`, optional attributes, text `Table of Contents` ignoring case and
surrounding whitespace, closing tag on the same line. Everything else about the function
stays as it is: the section still ends at the next ATX heading or end of file, a line
that is an HTML heading (`<h1>`–`<h6>`) also ends it, and it is only removed when every
line in between is blank or a list item.

Check: after a sync, `src/generated/benchmarks/purple-q1-vs-q2/README.md` (use the real
slug from `content/manifest.json`) no longer contains "Table Of Contents", and the six
READMEs that were already stripped are byte-identical to before. Extend the generated-file
assertion in `benchmark-detail.cjs` to also reject an HTML contents heading.

## 2. Sidebar links to headings that contain a slash

`TableOfContents.tsx` builds heading ids with its own `slugify`, which must match what
`rehype-slug` puts on the rendered headings. It collapses runs of whitespace into one
hyphen; `rehype-slug` (github-slugger) replaces each space separately. For
"Cars / Tanks" the sidebar links to `#cars-tanks` while the heading's id is `#cars--tanks`,
so the link does nothing.

Change `slugify` to match github-slugger for this case: after lower-casing and removing
characters other than word characters, whitespace and hyphens, replace **each** space
with a hyphen instead of each run of whitespace. Keep the existing duplicate-id numbering.

Check, in `benchmark-detail.cjs`: on the `chests` benchmark page (skip if absent), every
link in the "On this page" list points at an id that exists in the document. Remove the
existing skip for links whose target is missing.

## 3. One name for the charts

The tab is labelled "Interactive metrics". The chip added on the benchmark page and the
marker on the Benchmarks table say "Interactive charts". Use "Interactive metrics" for all
three: the chip label in `BenchmarkDetail.tsx`, and the tooltip and `aria-label` of the
marker in `BenchmarksIndex.tsx`. Update the assertions that look for the old text.

## 4. Tools: icon not centred in the phone buttons

On `xs` the link buttons show only an icon, but the icon keeps the right margin it has
next to a label, so it sits left of centre. On `xs` remove the start icon's margins
(`'& .MuiButton-startIcon': { mx: { xs: 0, sm: ... } }`, keeping MUI's default from `sm`).

Check, in `tools.cjs`, phone: for each link button, the icon's horizontal centre is within
1 px of the button's horizontal centre.

## 5. Save marker tap size on phones

In `BenchmarksIndex.tsx` the save-files link in a row is about 20 px tall on a phone. Give
it `minHeight: { xs: 24 }` and `minWidth: { xs: 24 }`; the row must not get taller than it
is today.

Check, in `benchmarks.cjs`, phone: every save link is at least 24 px tall.

## Acceptance

`npx tsc -b --noEmit`, `npm run build` and the full `npm run check` pass with no `KNOWN`
lines. No change to any page other than the ones described.
