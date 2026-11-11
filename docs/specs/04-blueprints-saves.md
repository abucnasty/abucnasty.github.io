# 04: Blueprints and Saves on the shared pieces

Needs: 01.

## Goal

The two list pages use the shared page header, section header and row sizes, so all
list pages share one density. This is a sizing change. Do not restructure the rows, and
do not move `BlueprintRow` or the save rows onto `ListRow`.

## Files

- `src/pages/Blueprints.tsx`
- `src/components/BlueprintRow.tsx`
- `src/pages/Saves.tsx`
- `src/components/SaveRows.tsx`
- `scripts/check/pages/blueprints.cjs`
- `scripts/check/pages/saves.cjs`

## Blueprints

`Blueprints.tsx`
- Page `Stack` spacing 2 at every width.
- `PageHeader`: `title="Blueprints"`; `meta` = the existing "`{n}` active blueprints across `{m}` categories."; `actions` = the "Show deprecated (`{k}`)" switch and its label (`Switch size="small"`).
- Parent groups ("Megabasing", "General"): replace the hand-built overline with `SectionHeader label={parent}`.
- Each category's rows go inside `RowGroup` (replaces the `Box` with the paper background and top border).
- "Source on GitHub" button: `size="small"`.

`BlueprintRow.tsx`
- Row: `minHeight: { xs: layout.touchTarget, md: layout.rowHeight }`, `py: { xs: 0.5, md: 0.25 }`.
- Thumbnail box: `width: { xs: 44, md: 46 }`, `height: 26`.
- Nothing else changes: preview popover, chips, action buttons, deprecated opacity.

## Saves

`Saves.tsx`
- Page `Stack` spacing 2.
- `PageHeader`: `title="Save files"`; `meta` = the existing sentence with its counts and repo link, unchanged.
- Search input and sort buttons: `height: { xs: 44, md: 36 }`.
- Landing sections: replace the hand-built header with `SectionHeader label={...} summary={...}` (same label and summary text as today).
- Row containers: `RowGroup`.
- Benchmark header card in the folder view: `p: 2`.

`SaveRows.tsx`
- `SaveFolderRow`: `minHeight: { xs: 48, md: layout.rowHeight }`, `py: { xs: 0.75, md: 0.25 }`; titled label `fontSize: 14`.
- `SaveFileRow`: `minHeight: { xs: 52, md: 36 }`, `py: { xs: 0.5, md: 0 }`.
- Download button and `CopyButton`: `width` and `height` `{ xs: 44, md: 32 }`; icons `fontSize="small"`.

## Checks

`blueprints.cjs`
- Desktop: blueprint row height is at most 36 px; at least 13 rows above the fold.
- Phone: rows are at least 44 px tall.
- Existing assertions still pass (row count, deprecated switch).

`saves.cjs`
- Desktop landing: folder row height is at most 36 px; at least 15 folder rows above the fold.
- Desktop folder view: file row height is at most 38 px.
- Phone: the download button is at least 44 × 44 px.
- Every existing assertion still passes unchanged.

## Acceptance

All checks pass. No text, link, sort order or behaviour changed on either page.
