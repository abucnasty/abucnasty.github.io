# 05: Home as a front page

Needs: 01.

## Goal

The first screen of Home shows the newest work and a way into every section. Today a
421 px banner (713 px on a phone) fills it, the page links to 3 benchmarks, and the newest
benchmark is not among them.

## Files

- `src/pages/Home.tsx`
- `src/components/LatestVideo.tsx`
- `src/components/BenchmarkCard.tsx` (delete; Home is its only user)
- `scripts/check/pages/home.cjs`

## Layout

Page `Stack` spacing `layout.sectionGap`.

### 1. Identity strip

A single `background.paper` block, `p: 2`, flex, `alignItems: 'center'`, `gap: 2`, `flexWrap: 'wrap'`. Mark it `data-home-strip`. No coloured left border.

- `BrandAvatar` at 44 px.
- Text block (`flex: '1 1 280px'`, `minWidth: 0`):
  - `Typography component="h1"`, `fontSize: 20`, `fontWeight: 700`, `lineHeight: 1.25`: "Factorio benchmarks, blueprints, and tools."
  - `body2`, `text.secondary`: "UPS research and side-projects from abucnasty. Everything here is open source."
- `SocialLinks` at the right.

The two buttons ("Browse benchmarks", "Blueprints") go away; section 3 replaces them.

### 2. Two columns

Grid: one column on `xs`; from `md` `gridTemplateColumns: 'minmax(0, 1.75fr) minmax(0, 1fr)'`, `gap: 4`, `alignItems: 'start'`.

**Left column**

- `SectionHeader label="Latest" summary="benchmarks and posts, newest first"`.
- `RowGroup` with the 8 newest items from benchmarks (those with a `date`) and blog posts (`blogPosts` from `src/blog/registry.ts`), merged and sorted by date, newest first. Each is a `ListRow`:
  - `to`: `/benchmarks/<slug>` or `/blog/<slug>`
  - `lead`: the date, `fontSize: 13`, `text.secondary`, `fontVariantNumeric: 'tabular-nums'`, `width: 76`
  - `title`: the title
  - `trailing`, from `md` only: for a benchmark with a `factorioVersion`, a small outlined `Chip` with the version; for a post, a small outlined `Chip` "Post"
  - no `subtitle` (step 2 adds the finding)
- Under the group: a `RouterLink` "All `{n}` benchmarks" to `/benchmarks` (`body2`, `py: 1`, `px: 1.25`).
- If any `featured` benchmark is not already among those 8: `SectionHeader label="Featured"` and a `RowGroup` of the same kind of row for each of them, in manifest order.

**Right column**, sections `layout.sectionGap` apart

- `SectionHeader label="Also here"`, then a `RowGroup` of two-line `ListRow`s:

  | Title | Subtitle | Link |
  |---|---|---|
  | Blueprints | "`{n}` active blueprints" (non-deprecated entries in `blueprints.json`) | `to="/blueprints"` |
  | Save files | "`{saveStats.count}` saves, `{formatBytes(saveStats.bytes)}`" | `to="/saves"` |
  | Tools and mods | "Benchmarking tools, utilities and mods" | `to="/tools"` |
  | Blog | "`{n}` post(s)" | `to="/blog"` |
  | About | "Who runs this and how to get in touch" | `to="/about"` |

- `SectionHeader label="Latest video"`, then `<LatestVideo compact />`.

## `LatestVideo` compact variant

Add an optional `compact?: boolean` prop. Without it the component renders exactly as today.
With it:

- thumbnail `width: { xs: 140, sm: 160 }`, 16:9, play icon 32 px;
- title `body2`, `fontWeight: 600`, at most 2 lines;
- no description, no overline, no "Watch" button: the thumbnail and the title are the link;
- the loading and error states are one `body2` line each (keep their current wording);
- no outer card padding or background beyond `pt: 1.25`.

## Checks (`home.cjs`)

Desktop
- `[data-home-strip]` is at most 90 px tall.
- The first Latest row links to the newest dated item across `data.index.benchmarks` and the blog registry.
- At least 6 links to `/benchmarks/<slug>` are above the fold.
- Links to `/blueprints`, `/saves`, `/tools`, `/blog` and `/about` are all above the fold inside `main`.
- The Save files row shows `data.index.saveStats.count`.

Phone
- `[data-home-strip]` is at most 200 px tall.
- The first Latest row starts above the fold.

## Acceptance

All checks pass. `BenchmarkCard` is gone and nothing imports it. The tagline, avatar, social links and latest video are all still on the page.
