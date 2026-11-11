# 11: Site search

Step 3. Needs steps 1 and 2 on `main`.

## Goal

One search box that finds benchmarks, blueprints, tools, blog posts and save files, reachable
from every page. It takes the menu slot that About left, and Home gets a prominent way in.

The results are the content. Keep the dialog quiet: the site's own colours and square
corners, sentence-case wording, no decoration, no animation beyond what MUI's dialog does.

## Files

- `src/search.ts` (new): pure logic, no React
- `src/components/SearchDialog.tsx` (new): the dialog, a `SearchProvider` and a `useSearch()` hook
- `src/components/AppShell.tsx`: the trigger in the top bar, the provider, the keyboard shortcuts
- `src/pages/Home.tsx`: a search box under the identity strip
- `scripts/check/pages/search.cjs` (new)
- `README.md`: one line in the page list

## `src/search.ts`

```ts
export type SearchKind = 'benchmark' | 'blueprint' | 'tool' | 'post' | 'save';

export interface SearchEntry {
  kind: SearchKind;
  title: string;
  /** Muted second line. */
  detail?: string;
  /** A site route, or an absolute URL when `external` is set. */
  to: string;
  external?: boolean;
  /** Lower-cased text the query is matched against. */
  haystack: string;
}

/** Group order and the heading each group is shown under. */
export const SEARCH_GROUPS: Array<{ kind: SearchKind; label: string }>;

/** Everything except save files, built once from data already in the main bundle. */
export function staticEntries(): SearchEntry[];

/** Save files matching the query, from the lazily loaded save tree. */
export function saveEntries(tree: SaveTree, query: string): SearchEntry[];

/** Entries matching every whitespace-separated term, best first. */
export function search(entries: SearchEntry[], query: string): SearchEntry[];
```

| Kind | Group label | `title` | `detail` | `to` | Matched against |
|---|---|---|---|---|---|
| benchmark | Benchmarks | title | `question ?? finding ?? summary` | `/benchmarks/<slug>` | title, question, finding, summary, topic label, Factorio version, platform, cpu |
| blueprint | Blueprints | the entry's description | category name | its factoriobin URL (`external`), or `/blueprints` when it has none | description, category, parent, author. Deprecated entries are left out |
| tool | Tools | name, or a tutorial's label | description | `/tools` | name, description, author |
| post | Blog posts | title | description | `/blog/<slug>` | title, description, tags |
| save | Save files | file name | folder path | `saveFolderRoute(folder)` | as `searchSaves` in `src/saves.ts` already does |

Ranking in `search`: entries whose title starts with the first term, then entries whose title contains every term, then the rest; inside each rank the input order is kept (benchmarks are passed newest first).

`src/search.ts` must not import `saves.json` or anything that loads it. The dialog loads the tree with `loadSaveTree()`.

## The dialog

Opening:
- the trigger in the top bar;
- the search box on Home;
- `/` when focus is not in a text field, textarea, select or editable element;
- Ctrl+K and Cmd+K, anywhere.

Inside:
- A text input, focused on open. Placeholder: "Search benchmarks, blueprints, tools, posts and save files".
- Empty query: one muted line, "Start typing to search the whole site."
- With a query: groups in `SEARCH_GROUPS` order, each with its label and up to 6 rows. A row shows `title` and, when present, `detail` on a second muted line; both truncate with an ellipsis. External rows show an open-in-new icon.
- When the Benchmarks group has more than 6 matches, its last row is "All `{n}` benchmarks matching" linking to `/benchmarks?q=<query>`. Likewise "All `{n}` save files matching" to `/saves?q=<query>`. Other groups show their first 6.
- Save files load the first time the query is non-empty. While loading, the Save files group shows "Searching save files…"; if loading fails it shows "Save files could not be loaded."
- Nothing matches anywhere (and saves have finished loading): "Nothing matches “`{query}`”."

Keyboard and focus:
- Arrow Down / Up move the active row through all groups, wrapping at the ends; Enter opens the active row; Escape closes. Pointer hover makes a row active.
- Opening a row closes the dialog. External rows open in a new tab (`rel="noopener noreferrer"`).
- Closing returns focus to whatever opened it. A route change closes it.

Accessibility: the input is a combobox (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`); the results are a `role="listbox"`; each group is a `role="group"` labelled by its heading; each row is a `role="option"` with `aria-selected`.

Layout:
- From `sm`: `Dialog` `maxWidth="sm"`, `fullWidth`, aligned to the top of the window (about 10% down), `background.paper`, no rounded corners. The result list scrolls inside the dialog; the input stays put.
- On `xs`: full screen, with a 44 px close button beside the input. Rows are at least 44 px tall.

## The trigger in the top bar

- From `md`: a button that looks like a small field, after the menu items: search icon, the word "Search", and a `/` key hint. 32 px tall, 1 px `divider` border.
- Below `md`: an icon button with the search icon, 44 × 44 px on `xs`, before the menu button.
- Accessible name "Search the site" in both forms.
- The bar must not overflow or wrap at any width from 360 to 1280 px.

## Home

Under the identity strip, a full-width button that looks like a field, 44 px tall, `background.paper`: search icon and "Search `{n}` benchmarks, `{m}` blueprints and `{k}` save files" (counts from the data: benchmarks, non-deprecated blueprints, `saveStats.count`). It opens the dialog through `useSearch()`.

## Checks (`scripts/check/pages/search.cjs`)

Take every expected value from `data.index`, `data.blueprints` and `data.saves`.

Desktop:
- The trigger is in the header. Clicking it opens the dialog with the input focused.
- Typing the full title of the newest benchmark puts it first in the Benchmarks group; Enter goes to its page and the dialog is gone.
- `/` on a page with nothing focused opens the dialog. `/` typed into the filter input on `/benchmarks` does not. Ctrl+K opens it from inside that input.
- Escape closes it and focus is back on the trigger.
- Arrow Down changes `aria-activedescendant` to the first row, and again to the second; Arrow Up from the first row goes to the last.
- A word from a non-deprecated blueprint's description shows that blueprint in the Blueprints group, as a link with `target="_blank"` when it has a factoriobin URL.
- A term matching more than 6 benchmarks (derive one from the data, for example a topic label) shows the "All `{n}` benchmarks matching" row with the right count and target.
- `wagon` (or another term with save-file matches, derived from `data.saves`) shows the Save files group with rows linking under `/saves/`, and the "All … save files matching" row when there are more than 6.
- The save index chunk (`/assets/saves-`) is not requested when the dialog opens with an empty query, and is requested after typing.
- A nonsense query shows the nothing-matches line.
- The header does not scroll or wrap at 360, 600, 768, 900, 1024 and 1280 px wide (resize the page; compare the header's `scrollWidth` and `clientWidth`, and its height stays 48).
- On Home the search box shows the three counts and opens the dialog.

Phone:
- The trigger is at least 44 × 44 px and opens a full-screen dialog; the close button closes it.
- Rows are at least 44 px tall; no sideways scroll with the dialog open or closed.

## Acceptance

All checks pass, and every existing module still passes. `npx tsc -b --noEmit`, `npm run build`, `npm run check` pass with no `KNOWN` lines. Report main-bundle size before and after. Screenshots reviewed: the dialog empty, with results in several groups, and with no results, at desktop and phone width; the header at 768 px; Home.
