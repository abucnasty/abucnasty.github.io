# 06c: Existing bugs found during step 1

Needs: 06, 06b.

Bugs that were already on `main` and turned up while reviewing step 1. They ship in the
same PR instead of being left for later.

## Files

- `scripts/sync-content.mjs`
- `src/content.ts` (one comment)
- `src/pages/Blueprints.tsx`
- `README.md`
- `scripts/check/pages/blueprints.cjs`
- `scripts/check/pages/benchmark-detail.cjs`

## 1. Writeup links to folders are dead

The sync rewrites every relative link in a benchmark README to
`raw.githubusercontent.com/<owner>/<repo>/<branch>/<source>/<path>`. Raw GitHub cannot
serve a folder, so links such as `[results](./edge_removal_results/)` are 404s. Three
links are affected today (two in `2026-09-11-disabled-collectors`, one in
`2025-09-13-wire-extenders`).

When a relative link's target is a directory in the source tree, rewrite it to
`https://github.com/<owner>/<repo>/tree/<branch>/<source>/<path>` (no trailing slash).

## 2. Writeup links to LFS files download a pointer, not the file

A relative link to a file tracked by git-lfs (`.csv`, `.csv.zst`, `.zip`) gets a raw GitHub
URL, which returns the three-line LFS pointer. One link is affected today
(`uncommon-chemical-science-v2`, "csv file").

When the link's target is an LFS pointer at `HEAD`, rewrite it to the same download URL
the save files use: `<lfsWorkerUrl>/objects/<oid>/<encodeURIComponent(file name)>`.
Decide "is an LFS pointer" from the git object (`git show HEAD:<path>`), the way the
existing save code does, so it does not depend on whether the working tree holds the real
file or the pointer. Share that logic with the save code rather than copying it.

Links to anything else (`.md`, `.txt`, images already handled elsewhere) keep their
current rewriting. Do not change how they behave.

## 3. Dead fallback and stale comments in the sync

- In `syncBenchmark`, the `else` branch that builds a `github.com/.../raw/refs/heads/master`
  URL for a save can no longer run (the sync fails earlier when `lfsWorkerUrl` is unset)
  and the URL it builds is wrong. Remove it and the condition around it.
- The file header still says "`.zip` files are NOT copied; raw GitHub URLs are emitted in
  the index instead." Say what happens now.
- `src/content.ts`: the doc comment on `BenchmarkSave.url` says "github.com raw with
  ?download=". Say what it is now.

## 4. Blueprints counts a category that has nothing in it

The header reads "25 active blueprints across 9 categories", but one of the nine holds
only deprecated entries. Count the categories that have at least one active (non-deprecated)
blueprint.

## 5. README

- "Pushed to `master`": the site's default branch is `main`. (References to the *source*
  repo's `master` branch are correct; leave them.)
- The page list and repo layout predate this step. Bring them in line with the code as it
  is on this branch: what Home shows now, `src/layout.ts`, the shared components
  (`PageHeader`, `SectionHeader`, `ListRow`, `DenseTable`), `src/data/tools.ts`,
  `scripts/check/`, `docs/specs/`. Keep it as brief as the rest of the README.

## Checks

`benchmark-detail.cjs`, reading the generated READMEs:
- no `raw.githubusercontent.com` link ends in `/` or has a last path segment without a file extension;
- no `raw.githubusercontent.com` link ends in `.zip`, `.csv` or `.zst`.

`blueprints.cjs`:
- the category count in the header equals the number of categories in `data.blueprints`
  with at least one non-deprecated entry.

## Acceptance

- Save a copy of `src/generated` before changing the sync; after, `diff -r` shows exactly
  the four rewritten links and nothing else. `index.json` and `saves.json` are byte-identical.
- The rewritten CSV link answers a `HEAD` request with status 200 and a `Content-Length`
  equal to the size in its LFS pointer.
- `npx tsc -b --noEmit`, `npm run build` and the full `npm run check` pass with no `KNOWN` lines.
