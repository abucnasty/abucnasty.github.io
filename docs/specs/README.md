# UX restructure specs

Work packages for the site restructure: a front-page Home, topics and questions on
benchmarks, tighter layouts, search and cross-links. Each numbered file is one
package, small enough for one agent and one commit.

The work ships in three steps, each one PR against `main`:

| Step | Packages | What ships |
|---|---|---|
| 1. Layout only | 00–06 | Compact sizes, new Home, Tools as rows, cleaner benchmark page |
| 2. Topics and questions | 07–10 | Topic per benchmark, question/answer, filters |
| 3. Search and cross-links | 11–12 | Site search, related links |

Step 2 and 3 specs are written when their step starts. `topics.md` is the input for step 2.

## Rules for every package

1. **Touch only the files your spec lists under "Files".** If another file has to change, stop and report it; don't change it. Packages run in parallel and each file has one owner.
   - **Leave the files you touch better than you found them.** A small existing bug in a file on your list (a wrong label, a stale comment, a missing accessible name, dead code) gets fixed in your commit, with a check where one fits, and listed in your report. Don't rewrite or restyle code that works.
   - An existing bug in a file that is not on your list: report it with the file and line. The coordinator adds it to the same step so it ships in the same PR.
   - Anything larger than a side fix (behaviour users rely on, data format, a redesign): report it and leave it; it needs a decision.
2. **One commit**, message `<nn>: <short title>`. Don't push. Don't commit generated output (`src/generated`, `public/benchmarks`, `dist`, `check-output`).
3. **No new dependencies** unless the spec names one.
4. **Keep every URL and every existing behaviour** the spec doesn't mention.
5. **Write it the way the codebase already does**: MUI components with `sx`, theme tokens (`primary.main`, `text.secondary`, `divider`, `background.paper`), MUI breakpoints for responsive differences. No JS width checks, no hard-coded colours that exist as tokens.
6. **Accessibility**: links are links and buttons are buttons; icon-only controls get an `aria-label`. On phones (`xs`) a row's main link and standalone buttons are at least 44 px; small secondary controls inside a row (chips, markers, a switch) are at least 24 px.
7. **Verify before handing back**: `npx tsc -b --noEmit`, `npm run build`, `npm run check` must all pass. Add or update the checks your spec lists.

## Local setup

```sh
npm ci
export FACTORIO_BENCHMARKS_PATH=/path/to/factorio-benchmarks   # a git clone, chart CSVs pulled with git-lfs
npm run build        # sync + type-check + vite build
npm run check        # layout checks against the build (package 00)
```

## Sizes

Shared numbers live in `src/layout.ts` (package 01). Specs refer to them by name.

| Token | Value | Used for |
|---|---|---|
| `topBarHeight` | 48 px | Site header, every width |
| `pageTitleSize` | 28 px | Page `h1` |
| `rowHeight` | 34 px | One-line rows and table rows, `md` and up |
| `rowHeightTwoLine` | 52 px | Two-line rows, `md` and up |
| `touchTarget` | 44 px | Minimum row / control height on `xs` |
| `sectionGap` | 3 (21 px) | Space between page sections |

Measurements quoted in specs are taken in a 1280 × 800 window ("desktop") and a 390 × 844 window ("phone").

## Report back

Commit hash; files changed; result of each acceptance check; anything you did differently from the spec and why; anything you could not verify.
