# 10: Findings and topics on Home

Needs: 07, 08.

## Goal

Each item in Home's Latest list says what was found, and Home links into every topic.

## Files

- `src/pages/Home.tsx`
- `scripts/check/pages/home.cjs`

## Changes

**Latest and Featured rows** (the `FeedRow` in `Home.tsx`)

- `subtitle`: for a benchmark, `finding ?? question ?? summary`; for a blog post, its `description`. Omit when there is none. `ListRow` truncates it to one line.
- `trailing`, from `md` only: for a benchmark with a `topic`, a small outlined `Chip` with the topic's label (look it up in `content.topics`); otherwise the Factorio version chip as today. Posts keep "Post".
- Nothing else about the rows changes: same 8 items, same order, same links.

**Topics section**, first in the right-hand column, above "Also here". Render it only when `content.topics` is not empty.

- `SectionHeader label="Topics"`.
- Below it a flex row that wraps (`gap: 0.75`, `pt: 1.25`): one `Chip` per entry of `content.topics`, in order. `size="small"`, `variant="outlined"`, `clickable`, `component={RouterLink}`, `to={`/benchmarks?topic=${id}`}`. The label is the topic label followed by its count in `text.secondary`.
- On `xs` the chips are 32 px tall.

## Checks (`home.cjs`)

- The first Latest row shows the title of the newest dated item, as today.
- For the newest benchmark that has a `finding`: its row's second line starts with the first 30 characters of that finding.
- One topic chip per `data.index.topics` entry, each linking to `/benchmarks?topic=<id>` and showing its count.
- Desktop: at least 6 links to benchmark pages are still above the fold, and the links to `/blueprints`, `/saves`, `/tools`, `/blog` and `/about` are still above the fold.
- Phone: the first Latest row still starts above the fold; no sideways scroll.

## Acceptance

All checks pass. `npx tsc -b --noEmit`, `npm run build`, `npm run check` pass. Screenshots of Home at desktop and phone width reviewed: no row is clipped, the finding line does not wrap, chips do not overlap.
