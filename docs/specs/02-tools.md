# 02: Tools as rows

Needs: 01.

## Goal

Every tool, utility, mod and tutorial link fits on the first desktop screen. Today the
page is 2.2 screens of padded cards in an 800 px column and shows 2 of 7 entries.

## Files

- `src/data/tools.ts` (new)
- `src/pages/Tools.tsx`
- `scripts/check/pages/tools.cjs`

## `src/data/tools.ts`

Move the four arrays out of `Tools.tsx` without changing any name, description or URL.
The file holds data only: no JSX, no icon imports.

```ts
export type ToolLinkKind = 'github' | 'app' | 'mod-portal' | 'source';

export interface ToolLink {
  kind: ToolLinkKind;
  label: string;   // 'GitHub' | 'Open app' | 'Mod portal' | 'Source'
  url: string;
}

export interface ToolEntry {
  name: string;
  description: string;
  author?: string;
  links: ToolLink[];
}

export interface ToolSection {
  title: string;   // 'Benchmarking tools' | 'Utilities' | 'Mods'
  entries: ToolEntry[];
}

export const toolSections: ToolSection[];

export interface Tutorial {
  kind: 'guide' | 'video';
  label: string;
  url: string;
}

export const tutorials: Tutorial[];
```

Mapping from today's fields: a tool's `url` becomes a `github` link labelled "GitHub";
`liveUrl` becomes an `app` link labelled "Open app" and goes first; a mod's `url` becomes
`mod-portal` "Mod portal" and its `sourceUrl` becomes `source` "Source".

## `Tools.tsx`

- `PageHeader` with `title="Tools"` and
  `meta="The open-source toolchain used for benchmarking and publishing results."`.
- Remove the `maxWidth: 800` and the `Divider`s.
- Body: a grid, one column on `xs`, `gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)'` from `md`, `gap: 4`, `alignItems: 'start'`.
  - Left column: one block per `toolSections` entry: `SectionHeader` (label = section title) then a `RowGroup` of `ListRow`s. Blocks are `layout.sectionGap` apart.
  - Right column: `SectionHeader` "Learn to benchmark", the existing sentence "New to Factorio benchmarking? Start here." (`body2`, `text.secondary`, `py: 1`), then a `RowGroup` with one `ListRow` per tutorial.
- Tool row: `title` = name, followed on the same line by `by <author>` in `caption` / `text.secondary` when there is an author; `subtitle` = description; `wrap`; `trailing` = one button per link.
- Link buttons: `Button component="a" target="_blank" rel="noopener noreferrer" variant="outlined" size="small"`, `startIcon` = `GitHubIcon` for `github` and `source`, `OpenInNewIcon` for `app` and `mod-portal`. On `xs` hide the text label and keep the icon, with `aria-label="<label>: <tool name>"` and `minWidth: 44`, `minHeight: 44`; from `sm` show the label.
- Tutorial row: `href` = url (whole row is the link), `lead` = `MenuBookIcon` for `guide`, `YouTubeIcon` for `video` (`fontSize="small"`, `color: 'primary.main'`), `title` = label.

## Checks (`tools.cjs`)

- The set of outbound link URLs on the page equals the set in `toolSections` + `tutorials`. Read them by parsing `src/data/tools.ts` for `url:` values; this replaces the hard-coded URL list the module has today.
- Desktop: every `[data-row]` is above the fold; the count equals entries + tutorials.
- Desktop: page height is at most one window (800 px).
- Phone: every link button is at least 44 px in both directions.

## Acceptance

All checks pass. No text on the page changed apart from the button label "View on GitHub" becoming "GitHub".
