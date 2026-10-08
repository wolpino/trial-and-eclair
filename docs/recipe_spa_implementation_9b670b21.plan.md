---
name: Recipe SPA Implementation
overview: Build apps/recipe-viewer in 5 small PRs (~4–16 files each), each with focused commits. Deploy on Vercel only. Checkpoint review before merging any PR that would exceed 20 files.
todos:
  - id: pr1-scaffold
    content: "PR1: Scaffold + schema + recipes.json + recipes.ts + tests + vercel.json (~14 files)"
    status: pending
  - id: pr2-cli
    content: "PR2: Interactive recipe:add + recipe:validate CLI + tests + README (~5 files)"
    status: pending
  - id: pr3-index
    content: "PR3: Router + IndexPage desktop A-Z/search + mobile flat list (~10 files)"
    status: pending
  - id: pr4-recipe
    content: "PR4: RecipePage two-column card + nav + pop-out + rotate gate (~9 files)"
    status: pending
  - id: pr5-deploy
    content: "PR5: Themes + text size + build pipeline + Vercel README (~8 files)"
    status: pending
isProject: false
---

# Recipe Viewer SPA — Implementation Plan

Derived from [recipe_spa_v1_spec_16a0edf0.plan.md](/Users/ari/.cursor/plans/recipe_spa_v1_spec_16a0edf0.plan.md). **Deploy: Vercel only.**

## PR strategy

| Rule | Detail |
|------|--------|
| **PR size** | Target **≤15 files** changed; hard cap **20 files** |
| **>20 files** | Stop mid-PR; open a **checkpoint PR** for review before continuing on the same branch |
| **Commits** | One logical unit per commit; message format `type(scope): summary` |
| **Branch** | One branch per PR: `recipe-spa/01-scaffold`, `recipe-spa/02-cli`, etc. |
| **Merge order** | Linear — each PR builds on the previous |

Estimated total new files: **~35** (including lockfile). Split across **5 PRs** so none exceed 20.

---

## PR 1 — Scaffold + schema + data lib

**Branch:** `recipe-spa/01-scaffold`  
**Est. files:** ~14 (under cap)

### Commits

1. **`chore(recipe-viewer): scaffold vite react typescript app`**
   - `apps/recipe-viewer/package.json`, `package-lock.json`
   - `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
   - `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
   - Minimal placeholder render (“Recipe Viewer”)
   - **Checkpoint:** run `npm install && npm run dev` — app boots

2. **`feat(recipe-viewer): add recipe schema and validation`**
   - `src/lib/schema.ts` — `Recipe` type, `validateRecipe`, `validateRecipesFile`
   - `tests/schema.test.ts`

3. **`feat(recipe-viewer): add seed recipes and query helpers`**
   - `src/data/recipes.json` — 4 recipes trimmed from [`seed/data/recipes_seed.json`](seed/data/recipes_seed.json)
   - `src/lib/recipes.ts` — sort, groupByLetter, search, getById, getNeighbors
   - `tests/recipes.test.ts`
   - `vitest.config.ts` + `npm test` script

4. **`chore(recipe-viewer): add vercel spa config`**
   - `vercel.json` — build output `dist`, rewrite to `index.html`

### PR description checklist

- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] No UI beyond placeholder

---

## PR 2 — Recipe CLI

**Branch:** `recipe-spa/02-cli`  
**Est. files:** ~5

### Commits

1. **`feat(recipe-viewer): add interactive recipe:add wizard`**
   - `scripts/recipe-cli.ts` — prompts, id generation, merge, A–Z sort
   - `package.json` scripts: `recipe:add`, `recipe:validate`
   - devDependency: `tsx`

2. **`test(recipe-viewer): add cli validation and merge tests`**
   - `tests/recipe-cli.test.ts` — uses temp file; no interactive I/O in tests

3. **`docs(recipe-viewer): document cli in readme`**
   - `apps/recipe-viewer/README.md` — add/validate usage

### PR description checklist

- [ ] `npm run recipe:validate` passes on seed data
- [ ] Manual smoke: `npm run recipe:add` (cancel or add test recipe then revert)

---

## PR 3 — Router + index screen

**Branch:** `recipe-spa/03-index`  
**Est. files:** ~10

### Commits

1. **`feat(recipe-viewer): wire react router and app shell`**
   - `react-router-dom` dependency
   - `App.tsx` routes: `/`, `/recipe/:id`
   - `src/styles/global.css` — base reset, fonts

2. **`feat(recipe-viewer): add desktop index with a-z groups and search`**
   - `src/pages/IndexPage.tsx`
   - `src/components/SearchBar.tsx` (desktop only via CSS)
   - `src/styles/index.css` — letter headers, list rows
   - Search state in URL query `?q=` or location state for Back preservation

3. **`feat(recipe-viewer): add mobile portrait flat index`**
   - Responsive rules in `index.css` — `@media (max-width: 767px)` flat list, hide search + headers

### PR description checklist

- [ ] Desktop: A–Z groups, search filters titles
- [ ] Mobile: flat scroll list, no search
- [ ] Click title navigates to `/recipe/:id`

---

## PR 4 — Recipe card + navigation

**Branch:** `recipe-spa/04-recipe`  
**Est. files:** ~9

### Commits

1. **`feat(recipe-viewer): add two-column recipe card layout`**
   - `src/pages/RecipePage.tsx`
   - `src/components/RecipeCardLayout.tsx`
   - `src/styles/recipe-card.css` — ingredients left, steps right

2. **`feat(recipe-viewer): add back next prev and pop-out`**
   - Back → index with search query preserved
   - Next/Prev via `getNeighbors` — disabled at ends
   - Pop out: `window.open('/recipe/:id', '_blank', 'noopener')`

3. **`feat(recipe-viewer): add mobile landscape-first rotate gate`**
   - Portrait prompt + “view anyway” fallback
   - Landscape uses full two-column layout

### PR description checklist

- [ ] Fullscreen readable card on desktop
- [ ] Rotate prompt on mobile portrait; landscape layout works
- [ ] Prev/Next stops at first/last recipe globally

---

## PR 5 — Themes, text size, deploy polish

**Branch:** `recipe-spa/05-themes-deploy`  
**Est. files:** ~8

### Commits

1. **`feat(recipe-viewer): add light and dark themes`**
   - `src/styles/themes.css` — `[data-theme="light|dark"]` tokens
   - `src/lib/preferences.ts` — read/write `localStorage`
   - Theme toggle in app chrome (index + recipe)

2. **`feat(recipe-viewer): add text size control`**
   - Small / medium / large via `--text-scale`
   - Persist with theme in `localStorage`

3. **`chore(recipe-viewer): wire validate into build and finalize readme`**
   - `package.json`: `"build": "npm run recipe:validate && npm test && tsc -b && vite build"`
   - README: Vercel deploy steps, manual QA checklist
   - Confirm `vercel.json` root directory note for monorepo

### PR description checklist

- [ ] Theme + text size persist across reload
- [ ] Full `npm run build` pipeline passes
- [ ] Vercel preview deploy succeeds

---

## Vercel setup (after PR 5 merge)

1. New Vercel project → import repo
2. **Root Directory:** `apps/recipe-viewer`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. No env vars for v1

---

## Checkpoint protocol (>20 files)

If a PR grows past 20 files (e.g. lockfile churn + scaffold):

1. Push branch at current commit
2. Open **draft PR** labeled `checkpoint`
3. Reviewer confirms direction before remaining commits
4. Continue on same branch or split into follow-up PR

**PR 1 is the only risk** — if scaffold + vitest + lockfile exceeds 20, split:

- **PR 1a:** scaffold only (~10 files)
- **PR 1b:** schema + data + tests + vercel (~8 files)

---

## Manual QA script (final PR)

Run on desktop and phone (portrait + landscape):

1. Index loads 4 recipes A–Z
2. Search “muffin” → filtered list, no headers
3. Open recipe → two columns readable
4. Next/Prev through all recipes; last Next disabled
5. Back restores search query
6. Pop out opens new tab
7. Mobile index: flat list
8. Mobile recipe portrait: rotate prompt; landscape: two columns
9. Toggle dark theme + large text → persists on reload

---

## Out of scope (do not add during implementation)

PWA, stdin CLI, E2E, API layer, third theme, mobile search, slug routes — per spec v1.1.
