# 08: Assign a topic to every benchmark

Needs: 07.

## Goal

`content/manifest.json` lists the topics and gives every benchmark one, exactly as
`topics.md` says. Data entry only.

## Files

- `content/manifest.json`
- `scripts/check/pages/data.cjs`: two assertions

## Changes

1. Add a top-level `"topics"` array directly after `"blueprintsSource"`, in the order of the table at the top of `topics.md`:

   ```json
   "topics": [
     { "id": "inserters", "label": "Inserters & clocking" },
     { "id": "science", "label": "Science builds" },
     { "id": "mining", "label": "Mining" },
     { "id": "engine", "label": "Engine & method" },
     { "id": "vehicles", "label": "Vehicles & chests" },
     { "id": "space", "label": "Space platforms" }
   ],
   ```

2. Give each entry in `"benchmarks"` a `"topic"` line directly after its `"title"` line, with the id from the "Assignment" table in `topics.md`. Match rows to entries by title. Every benchmark gets exactly one.

Do not change anything else in the file: no reordering, no re-indenting (entries use mixed 2- and 4-space indentation; keep each entry's own), no other fields.

## Checks (`data.cjs`)

- Every benchmark in `data.index.benchmarks` has a `topic`.
- `data.index.topics` has six entries with these counts: inserters 12, science 12, mining 8, engine 6, vehicles 3, space 2. (These numbers come from `topics.md`; when the table changes, they change with it.)

## Acceptance

- `git diff --stat` shows only the two files; the manifest diff is additions only: the `topics` block and one `topic` line per benchmark (43), nothing removed.
- The manifest is still valid JSON and `npm run build` logs `topics 43/43`.
- A title in the table that matches no manifest entry, or a manifest entry with no row, is reported, not guessed.
- `npx tsc -b --noEmit`, `npm run build`, `npm run check` pass.
