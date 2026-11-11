# 10b: Question and answer at the top of a benchmark page

Needs: 07, 08.

## Goal

A benchmark page opens with the question it asked and the answer it found, then the
test conditions on one line, then the writeup. Package 07 lifts the "The Question" and
"The Answer" sections out of the README into `question.md` and `answer.md`; this package
shows them.

The question is the one large thing on the page. No label above it: a sentence that ends
in a question mark does not need the word "Question" over it, and the answer directly
under it does not need "Answer".

## Files

- `src/pages/BenchmarkDetail.tsx`
- `src/components/MarkdownRenderer.tsx`: only the optional `sx` prop described below
- `scripts/check/pages/benchmark-detail.cjs`

## Page header, top to bottom

1. **Trail**: one line above the title, `fontSize: 13`: a `RouterLink` "Benchmarks" to `/benchmarks`; when the benchmark has a `topic`, a `/` in `text.secondary` and a `RouterLink` with the topic label to `/benchmarks?topic=<id>`. Links in `primary.main`, underlined on hover. Wrap it in `<nav aria-label="Breadcrumb">`.
2. **Title**: `PageHeader` with `title` only. The date moves out of the overline.
3. **Conditions row** (the existing chip row): first the date as plain text (`fontSize: 13`, `text.secondary`; omit when there is none), then the chips in this order, each only when it applies: `Factorio {version}`, platform, **`cpu` (new)**, save files, Interactive metrics, tags.
4. **Lead**, only when the benchmark has a `question` (so `question.md` exists): a `<section aria-label="Question and answer">`, `backgroundColor: 'background.paper'`, `p: 2`, `mt: 2`, flex column with `gap: 1.5`:
   - the question: `question.md` rendered with `MarkdownRenderer`, `fontSize: { xs: 18, md: 20 }`, `lineHeight: 1.4`, `color: 'text.primary'`;
   - the answer, when `answer.md` exists: rendered with `MarkdownRenderer` at the normal body size.
   - Inside the lead, paragraphs and lists have no outer margin at the top of the first block and the bottom of the last; blocks are `1em` apart.
5. Tabs and everything below: unchanged.

The lead sits above the tabs, so it stays visible on the metrics and save-file tabs.

## Loading

- Find the files with `import.meta.glob`, the same way the README is found: `../generated/benchmarks/*/question.md` and `.../answer.md`, `?raw`, lazy. A missing key means there is no such file; do not use the index to decide whether `answer.md` exists.
- Load the README and the lead files together and render once all have arrived, so the page does not jump. The existing spinner and error state cover the wait.

## `MarkdownRenderer`

Add an optional `sx?: SxProps<Theme>` prop, merged after the component's own root styles so a caller can override font size and margins. No other change; every existing caller renders exactly as before.

## Checks (`benchmark-detail.cjs`)

Pick the benchmarks from `data.index`: the newest with a `question` and an `answer.md` file; one with a `question` and no `answer.md` (skip the case if none exists); one with no `question`; one with a `topic`; one with a `cpu`.

- With a question: the lead section exists above the tab bar and its text starts with the first 30 characters of `question`. With `answer.md`: the lead has more text after the question. The README body below contains no heading "The Question" or "The Answer".
- With no `answer.md`: the lead shows the question alone.
- With no question: there is no lead section, and the README body's first element starts above y = 370 on desktop.
- With a lead, on desktop: the lead starts above y = 240 and the question's font size is 20 px.
- The trail has a link to `/benchmarks`; with a topic, a second link to `/benchmarks?topic=<id>` showing the topic label.
- With a `cpu`: a chip shows it.
- The date shows in the conditions row and nowhere above the title.
- Phone: no sideways scroll on each page tested; the question's font size is 18 px.
- Existing assertions keep passing; update the one about the README body's start (was y = 330) as above.

## Acceptance

All checks pass. `npx tsc -b --noEmit`, `npm run build`, `npm run check` pass. Screenshots at desktop and phone width for one benchmark with a lead and one without, reviewed: the question reads as the opening of the page, nothing is clipped, and the tabs are still on the first desktop screen.
