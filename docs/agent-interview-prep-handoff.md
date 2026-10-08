# Trial and Eclair — Agent Handoff for Practice & Interview Prep

**Purpose:** Give an agent (or you) in a **separate repo** enough context to rebuild slices of this product in small iterations — for learning, portfolio practice, and interview storytelling.

**Source repo:** `trial-and-eclair` (Django + React PWA). Phases 0–3 and Phase UI are **shipped on `main`**. UI polish is in progress. Phase 4 backend is next in the PRD.

---

## 1. Elevator pitch

**Trial and Eclair** is a recipe **development and collection** app — not a blog.

- **Developers (paid):** Pin ideas on a cork board, iterate recipes in a versioned “lab notebook,” log test bakes, publish with story/hero photo, bundle into shareable cookbooks.
- **Home cooks (free):** Personal recipe box (A–Z index cards), reference shelf, fork public recipes (Phase 4 UI).
- **Viewers (no account):** Read published recipes and cookbooks at public URLs.

Core tension the architecture solves: **two editing metaphors** (developer versioning vs home-cook single-version box) on **one ingredient catalog**, with **optional** link from idea → recipe (promote is never required).

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| API | Django 5 + Django REST Framework |
| DB | PostgreSQL (prod); SQLite (local dev) |
| Auth | Session cookies + CSRF; `credentials: "include"` from SPA |
| Frontend | Vite, React 18, TypeScript, React Router |
| Styling | CSS custom properties (semantic tokens); no Tailwind |
| Media | Local `media/` in dev; S3/R2 planned for prod |
| Tests | ~66 Django tests; `npm run build` for TS |

**Local dev:** API `:8000`, PWA `:5173` (Vite proxies `/api` and `/media`).

---

## 3. Backend layout (Django apps)

```
accounts/       User (role, subscription, trial, preferences)
catalog/        Ingredient + aliases; search + get-or-create
development/    Ideas, dev recipes, versions, steps, journal, test sessions, cookbooks, forks
collection/     Home-cook recipe box (CollectionRecipe, A–Z)
library/        References, reference links, URL imports, source documents (Phase 4)
config/         Settings, URLs
frontend/       React PWA
seed/           JSON seed from legacy spreadsheets/notes
```

**Authorization patterns (repeat everywhere):**

- **Owner scoping:** `queryset.filter(user=request.user)`
- **Role gates:** `IsDeveloper` permission on dev endpoints
- **Subscription gate:** `User.has_developer_access()` (trial/active/none vs expired)
- **Current-version writes:** ingredient lines, steps — only on `recipe.current_version`

---

## 4. Domain model (interview-friendly)

```
User
  ├── ideas[]                    (cork board; optional promote → DevelopmentRecipe)
  ├── development_recipes[]
  │     ├── versions[]           (immutable history after save-new-version)
  │     │     ├── ingredient_lines[]
  │     │     ├── steps[]
  │     │     └── test_sessions[] (+ photos, max 5)
  │     ├── journal_entries[]
  │     └── cookbook_entries[]   (snapshot_version frozen at add time)
  ├── collection_recipes[]       (recipe box; single version via steps on collection_recipe)
  └── references[]               (shelf: cookbook/blog/chef/article/tool)

DevelopmentRecipe
  - current_version  → editable head
  - published_version → what public API serves
  - slug, status (draft | published | unpublished)

CollectionRecipe
  - No versioning; same ingredient/step shape as dev via shared RecipeStep model (version OR collection_recipe FK)
```

**Locked product rules worth rehearsing:**

- Ideas optional — `POST /recipes/` and `POST /recipe-box/` never require an idea.
- Cookbook entries snapshot a version; unpublishing recipe drops public link but keeps cookbook text.
- Fork lineage on public pages unless author sets `show_forks=false`.
- Measurements stored as entered; display preference only (no auto-conversion v1).

---

## 5. API map (practice targets)

Base: `/api/v1/`

| Area | Key endpoints | Auth |
|------|---------------|------|
| Auth | `register`, `login`, `logout`, `me` | Mixed |
| Ideas | CRUD + `POST …/promote/` | Developer |
| Recipes | CRUD, `save-new-version`, `publish`, `unpublish`, `compare-versions` | Developer |
| Versions | GET/PATCH (current only) | Developer |
| Ingredient lines | Nested under `versions/{id}/ingredient-lines/` | Developer |
| Steps | Nested under `versions/{id}/steps/` | Developer |
| Test sessions | Nested under versions + photo upload | Developer |
| Journal | CRUD, filter `?recipe=` | Developer |
| Cookbooks | CRUD, publish, entries (snapshot) | Developer |
| Public | `GET public/recipes/{slug}/`, `public/cookbooks/{slug}/` | None |
| Recipe box | CRUD, ingredient-lines, steps | Authenticated |
| Ingredients | `GET ?search=`, `POST` get-or-create | Authenticated |
| References | CRUD, links to idea/version | Authenticated |

---

## 6. Frontend surfaces (metaphor UI)

| Route | Metaphor | Notes |
|-------|----------|-------|
| `/developer` | Cork board | Grid, filters, pin FAB, edit drawer, promote-to-lab |
| `/developer/lab` | Recipe shelf | Spines → notebook |
| `/developer/lab/:id` | Composition notebook | Spread: ingredients left / steps right; margin tools |
| `/recipe-box` | Wooden box + A–Z | In-place index card edit |
| `/developer/cookbooks` | Binder spines | Open binder → entry cards |
| `/references` | Shelf spines | Type filter |
| `/r/:slug`, `/c/:slug` | Public reader | kraut-kopf layout; OG meta via client hook |

**Design system:** `ThemeProvider`, `data-theme` / `data-font` on `<html>`, tokens in `styles/themes/*`. Components must use `var(--token)` only.

**Two editing UIs — never merge:**

- **Index card** = recipe box only (small, in-place).
- **Notebook spread** = lab only (full page, versioned).

---

## 7. Status snapshot (June 2026)

| Phase | Status |
|-------|--------|
| 0 Schema + seed | ✅ |
| 1 Developer API | ✅ |
| 2 Publish + public viewer | ✅ |
| 3 Diff, cookbooks, box, references API | ✅ |
| Phase UI (C1–C2) | ✅ |
| UI polish | 🔄 In progress (user priority) |
| 4 URL/scan import, public fork buttons | 📋 PRD next |
| 5 Offline, AI, challenges | Planned |
| Freeform cork canvas | Deferred |

---

## 8. Suggested practice iterations

Use these in a **fresh repo** (or branches). Each iteration should be **demoable in ~2–8 hours** and produce one interview story. Build in order within a track, or pick by skill gap.

### Track A — Backend / API (Django REST)

| # | Iteration | Build | Skills / interview topics |
|---|-----------|-------|---------------------------|
| A1 | **Session auth** | Register, login, logout, `me`; role on User | Session vs JWT tradeoffs, CSRF, cookie flags |
| A2 | **Owner-scoped CRUD** | `Idea` ViewSet: list/create/update/delete own rows only | Queryset filtering, 404 vs 403 |
| A3 | **Multipart create** | Idea with optional image upload | `FormData`, `ImageField`, validation |
| A4 | **Aggregate root** | `POST /recipes/` creates recipe + v1 atomically | Transactions, service layer |
| A5 | **Nested writes (current only)** | Ingredient lines on version; reject edits on old versions | Nested routes, permission checks |
| A6 | **Save new version** | Copy scalar fields + lines + steps to new version; bump pointer | Immutability pattern, deep copy |
| A7 | **Publish** | Slug generation, attach story/hero, public GET by slug | Separate public serializer, unpublish semantics |
| A8 | **Version diff** | Compare two versions: field changes + ingredient added/removed/changed | Pure functions in services, testable diff |
| A9 | **Promotion action** | `POST ideas/{id}/promote/` → create recipe, set `promoted_recipe` | Custom `@action`, idempotency (promote once) |
| A10 | **Test sessions + photo cap** | CRUD sessions; max 5 photos; validate in ViewSet | File upload limits, related models |
| A11 | **Cookbook snapshot** | Add entry copies `snapshot_version`; public cookbook read | Frozen snapshot vs live recipe |
| A12 | **Subscription gate** | `has_developer_access()` on dev endpoints | Feature flags, trial expiry |
| A13 | **Ingredient catalog** | Search + get-or-create; PROTECT FK on lines | Normalization, dedup by name |

### Track B — Frontend (React + TS)

| # | Iteration | Build | Skills / interview topics |
|---|-----------|-------|---------------------------|
| B1 | **API client** | `apiFetch` with credentials, CSRF, typed errors | Fetch wrapper, error boundaries |
| B2 | **Auth context** | Login/register; protect routes by role | Context, route guards |
| B3 | **Public recipe page** | Fetch by slug; ingredients-left layout | Responsive grid, loading/error states |
| B4 | **Document meta hook** | `useDocumentMeta` for OG tags on public pages | `useEffect` + cleanup |
| B5 | **Design tokens** | `tokens.css`, one theme, `ThemeProvider` | CSS variables, no hex in components |
| B6 | **Ingredient autocomplete** | Debounced search + get-or-create on submit | Controlled input, dropdown a11y |
| B7 | **Lab spread (read-only)** | Load recipe + versions; display spread | Composition, derived state |
| B8 | **Lab spread (edit current)** | PATCH version; add/remove ingredient lines | Optimistic vs reload-after-save |
| B9 | **Steps editor** | Ordered list CRUD component reused in lab + box | Shared component, prop callbacks |
| B10 | **Version flip** | Switch active version; past = read-only | Local draft vs server state |
| B11 | **Overlay pattern** | Compare/publish as slide-over (not tabs) | Portal/dialog, focus trap |
| B12 | **Recipe box in-place** | A–Z grid; expand card; save without route change | URL deep-link to focused card |
| B13 | **Cork board grid** | Filters, rotation from id hash, click → drawer | Deterministic “random”, FAB |

### Track C — Full-stack slices (best for interviews)

| # | Iteration | End-to-end slice |
|---|-----------|------------------|
| C1 | **Pin → promote → edit** | Create idea → promote → land on lab v1 → add one ingredient line |
| C2 | **Version and publish** | Edit v1 → save v2 → publish with hero → view `/r/slug` |
| C3 | **Compare** | Two versions with ingredient change → compare overlay shows diff |
| C4 | **Cookbook** | Publish 2 recipes → cookbook with snapshots → public `/c/slug` |
| C5 | **Home cook box** | Register as home_cook → add box recipe + steps → no dev routes |
| C6 | **Test bake log** | Create session with 2 photos → list on version |
| C7 | **Reference shelf** | Add references → filter by type → delete |

### Track D — UI polish (current owner priority)

Smaller passes — good for CSS/architecture interviews:

| # | Focus | Scope |
|---|-------|-------|
| D1 | On-paper forms | Shared input/textarea look (ruled lines, no default browser chrome) |
| D2 | Index card polish | Recipe box: ruled lines, label caps, expand animation |
| D3 | Notebook spread | Dot-grid/lined paper, marbled margin, spread typography |
| D4 | Cork board | Texture, pin shadow, card hover, drawer styling |
| D5 | Ingredient line row | Qty + unit alignment; lab vs card density |
| D6 | Test log / steps | Replace generic textareas with metaphor-consistent blocks |
| D7 | Theme presets | Second color theme + font stack using token files only |

### Track E — Phase 4 prep (not built yet)

| # | Iteration | PRD scope |
|---|-----------|-----------|
| E1 | **Fork to box** | Public page button → `RecipeFork` → `CollectionRecipe` |
| E2 | **URL import** | Fetch URL, parse, draft collection recipe |
| E3 | **Reference links UI** | Wire `references/{id}/links/` to ideas/versions in shelf |

---

## 9. How to use this in a practice project

1. **Pick one track** (A for backend interviews, B for frontend, C for full-stack stories).
2. **One iteration = one PR** with tests and a 2–3 sentence README note.
3. **Write the interview story:** problem → constraint → approach → tradeoff.
4. **Do not clone the whole repo first** — reimplement the iteration from the table; compare to real code afterward.
5. **Reference decisions** from Section 4 when asked “why not X?”

**Example story (C2):**  
“We only allow PATCH on `current_version` so history stays immutable. Save-new-version deep-copies lines and steps in a transaction, then moves the pointer — same pattern as Git branches but user-facing as notebook pages.”

---

## 10. Test & quality bar (match production)

```bash
# Backend
python manage.py test accounts development collection library

# Frontend
cd frontend && npm run build
```

Practice iterations should include at least: happy path test, owner-isolation test, one permission failure (403/404).

---

## 11. Files to read in source repo (if comparing)

| Topic | Path |
|-------|------|
| PRD | `docs/PRD.md` |
| API README | `README.md` |
| Version copy | `development/services.py` (`save_new_version`, `publish_recipe`) |
| Permissions | `accounts/permissions.py`, `User.has_developer_access()` |
| Lab UI | `frontend/src/pages/DeveloperRecipePage.tsx`, `components/lab/*` |
| Recipe box | `frontend/src/pages/RecipeBoxPage.tsx`, `components/recipe-box/*` |
| Cork board | `frontend/src/pages/DeveloperHomePage.tsx`, `components/corkboard/*` |
| Tokens | `frontend/src/styles/tokens.css`, `styles/themes/default.css` |

---

## 12. Explicit non-goals (don’t practice these as MVP)

- Blog, comments, RSS, social graph
- Auto unit conversion
- Freeform drag-and-drop cork board (separate future plan)
- Stripe billing (gates exist; payments not integrated)
- Custom auth — use Django sessions

---

## 13. Agent prompt template (copy to other project)

```
You are helping me practice building slices of "Trial and Eclair" for interview prep.

Read: docs/agent-interview-prep-handoff.md (this file).

Current iteration: [e.g. A6 — Save new version]

Build only this iteration in a minimal Django+React (or Django-only / React-only) scaffold.
Include tests for: happy path, owner isolation, one failure case.
Explain tradeoffs in comments or a short IMPLEMENTATION.md.

Do not implement later iterations or Phase 4 features unless this iteration requires it.
```

---

*Generated from trial-and-eclair `main` after Phase UI complete. Owner next priority: UI polish (Track D).*
