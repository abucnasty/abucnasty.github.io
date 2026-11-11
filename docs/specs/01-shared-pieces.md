# 01: Shared pieces and compact shell

## Goal

Create the small set of components every other step-1 package builds on, and make the
site shell (top bar, page padding, footer) compact. After this package no page looks
different except for the shell; the pages are converted by packages 02–06.

## Files

- `src/layout.ts` (new)
- `src/components/PageHeader.tsx` (new)
- `src/components/SectionHeader.tsx` (new)
- `src/components/ListRow.tsx` (new)
- `src/components/DenseTable.tsx` (new)
- `src/components/AppShell.tsx`
- `src/content.ts`, `scripts/sync-content.mjs`: only the `saveStats` addition below
- `scripts/check/pages/shell.cjs`

Do not edit any file under `src/pages/`.

## `src/layout.ts`

```ts
/** Shared sizes. Row heights apply from `md` up; phones use `touchTarget`. */
export const layout = {
  topBarHeight: 48,
  pageTitleSize: 28,
  rowHeight: 34,
  rowHeightTwoLine: 52,
  touchTarget: 44,
  /** Theme spacing units between page sections (21 px). */
  sectionGap: 3,
} as const;
```

## `PageHeader`

```ts
interface PageHeaderProps {
  title: string;
  /** Muted text on the title's baseline: a count or a one-line description. */
  meta?: ReactNode;
  /** Small orange line above the title, e.g. a date. */
  overline?: ReactNode;
  /** Controls pushed to the right on wide screens. */
  actions?: ReactNode;
}
```

- Root: `<Box component="header">`, flex, `flexWrap: 'wrap'`, `alignItems: 'baseline'`, `columnGap: 2`, `rowGap: 0.5`.
- `overline`: full-width line above; `Typography variant="overline"`, `color: 'primary.main'`, `letterSpacing: 2`, `lineHeight: 1.6`.
- `title`: `Typography component="h1"`, `fontSize: layout.pageTitleSize`, `fontWeight: 400`, `lineHeight: 1.2`.
- `meta`: `Typography variant="body2"`, `color: 'text.secondary'`, `minWidth: 0`.
- `actions`: `ml: 'auto'`.

## `SectionHeader`

```ts
interface SectionHeaderProps {
  label: string;
  /** Muted text at the right: counts, totals. */
  summary?: ReactNode;
  /** Heading level. Default 'h2'. */
  component?: 'h2' | 'h3';
}
```

The orange overline with an orange rule under it that Blueprints, Tools and Saves each
build by hand today. Copy the look of the section headers on the Saves landing page:
flex row, `alignItems: 'baseline'`, `justifyContent: 'space-between'`, `flexWrap: 'wrap'`,
`borderBottom: '1px solid'`, `borderColor: 'primary.main'`; label as
`Typography variant="overline"` with `color: 'primary.main'`, `letterSpacing: 1`, `fontSize: 12`;
summary as `body2`, `fontSize: 13`, `color: 'text.secondary'`. No outer margins: callers space it.

## `ListRow` and `RowGroup`

```ts
interface ListRowProps {
  /** Fixed slot at the left: an icon, a thumbnail or a date. */
  lead?: ReactNode;
  title: ReactNode;
  /** Muted second line. Its presence makes this a two-line row. */
  subtitle?: ReactNode;
  /** Right-hand slot: chips, numbers, action buttons. Never shrinks. */
  trailing?: ReactNode;
  /** Whole row is a router link. Don't put other links or buttons in `trailing` when set. */
  to?: string;
  /** Whole row is an external link, opened in a new tab. */
  href?: string;
  /** Let title and subtitle wrap instead of truncating with an ellipsis. */
  wrap?: boolean;
  /** Render at 55% opacity (deprecated entries). */
  dimmed?: boolean;
  sx?: SxProps<Theme>;
}
```

- Root: `Box` (a `RouterLink` when `to`, an `<a target="_blank" rel="noopener noreferrer">` when `href`), flex, `alignItems: 'center'`, `gap: 1.5`, `px: 1.25`, `py: 0.5`, `borderBottom: 1`, `borderColor: 'divider'`, `fontSize: 14`, `color: 'text.primary'`, `textDecoration: 'none'`, hover `backgroundColor: 'action.hover'` with a 120 ms transition.
- `minHeight`: `{ xs: layout.touchTarget, md: subtitle ? layout.rowHeightTwoLine : layout.rowHeight }`.
- `lead`: `flexShrink: 0`, flex-centred.
- Text block: `flex: 1`, `minWidth: 0`. Title `fontWeight: 600`. Subtitle `fontSize: 12.5`, `color: 'text.secondary'`. Unless `wrap`, each line is single-line with `textOverflow: 'ellipsis'`.
- `trailing`: `flexShrink: 0`, flex, `alignItems: 'center'`, `gap: 1`.
- Set `data-row` on the root so checks can count rows.

`RowGroup` (same file): `({ children }: { children: ReactNode })` rendering
`<Box sx={{ backgroundColor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>`.

## `DenseTable`

```ts
interface DenseTableProps { children: ReactNode; 'aria-label'?: string }
```

`TableContainer` (`border: 1`, `borderColor: 'divider'`) wrapping `Table size="small"` with:
`'& th': { fontWeight: 700 }`; every cell `px: { xs: 1, sm: 1.25 }`, `py: { xs: 0.75, md: 0.25 }`,
`verticalAlign: 'middle'`; body rows `height: { md: layout.rowHeight }`. Callers pass
`TableHead` / `TableBody`.

## `AppShell`

- `Toolbar`: `variant="dense"`, `minHeight: layout.topBarHeight` at every width, `gap: 2` unchanged.
- Avatar in the bar: 28 px (was 36).
- Menu items, in this order: Benchmarks, Blueprints, Saves, Tools, Blog. **About leaves the menu** (desktop nav and phone drawer). The `/about` route stays.
- Footer: add an "About" text link (`RouterLink` to `/about`, `body2`, `color: 'text.secondary'`, hover `primary.main`) next to the copyright line.
- Main container: `py: 3` (was 4).
- The phone menu button keeps a 44 px target.

## `saveStats`

Home (package 05) needs the total number of saves without loading the 110 kB save index.

- `scripts/sync-content.mjs`, in `main()`: add `saveStats: { count, bytes }` to the object written to `index.json`, computed from the `saveIndex` already built there (`files.length`, sum of `file[1]`).
- `src/content.ts`: add `saveStats: { count: number; bytes: number }` to `ContentIndex`.

Nothing else in the sync changes.

## Checks to add in `scripts/check/pages/shell.cjs`

- Header height is 48 px on desktop and phone.
- Desktop menu labels are exactly `Benchmarks, Blueprints, Saves, Tools, Blog`, in that order.
- The footer has a link to `/about`, and `/about` renders.
- `data.index.saveStats.count === data.saves.files.length`.
- The new components compile and are exported (`tsc`); they are not used by any page yet.

## Acceptance

- All checks pass, including every existing page module (update the old nav-order assertion in `saves.cjs` only if it fails because of the new order; that one line is the single exception to the file list).
- Desktop: every page's first heading sits 23 px higher than before (16 px bar + 7 px padding). No other visual change on any page.
- Phone: drawer lists the five items; no sideways scroll on any page.
