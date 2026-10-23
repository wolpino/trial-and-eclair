# Trial and Eclair

Recipe development and collection app — not a blog.

- **Home Cook (free):** alphabetical recipe box, import, fork published recipes
- **Developer (paid):** versioning, cookbooks, cork board ideas, publish + story/photo
- **Viewer:** public published recipes and cookbooks

**Documentation:** [Product Requirements (PRD)](docs/PRD.md)

## Current status

**Phases 0–4 complete** (backend + metaphor UI + polish). Walkthrough seed fills every screen. Scan import reads text and OCR (Tesseract on PATH). Staging deploy is Render (gunicorn + WhiteNoise, same-origin SPA). Stripe, R2, and freeform cork canvas are still later.

**Recipe Box** (in progress) is the phone view of the recipe box inside this app, not a separate project: see [`docs/recipe-box/README.md`](docs/recipe-box/README.md). Guest accounts with a 5-card limit, shared starter cards, rate limits and the `cleanup_guests` command are on the API, and the phone view is built to [decision 003](docs/decisions/003-phone-recipe-box-design.md): wooden box, staggered A–Z tabs, fan, ☰ menu (#63), and a cooking Card View with two columns sideways, a pinned ingredient band, step marks, a screen wake lock and in-place editing (#64). On a phone, visitors see the starter cards, their first save makes a guest, and guests get a sign-up card at 5 cards; signed-up people can fork or hide starters (#56).

At the end of each phase, update this README and [`docs/PRD.md`](docs/PRD.md) (status table, shipped scope, setup notes).

## Stack

- Django REST + Postgres (SQLite for local dev)
- Session auth (cookie-based, CORS-enabled for local PWA dev)
- React/TypeScript PWA (`frontend/`) — CSS semantic tokens, user theme/font presets (Phase UI)
- Object storage for media in production (R2/S3 — Phase 3+; local `media/` in dev)

## Local setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

`DEBUG` is off unless the environment sets it. The copied `.env` has `DEBUG=True` for local dev; without it, settings need a real `SECRET_KEY` and redirect to https.

Photo scan OCR (optional): install [Tesseract](https://github.com/tesseract-ocr/tesseract) so `tesseract` is on your `PATH` (`brew install tesseract` on macOS). Without it, scans still open a draft; typed `.txt` uploads are parsed either way. Digital PDFs use `pdftotext` if present.

Admin: http://127.0.0.1:8000/admin/

### Postgres (optional)

```bash
docker compose up -d db
# Set in .env:
# DATABASE_URL=postgres://trial_eclair:trial_eclair@localhost:5432/trial_eclair
python manage.py migrate
```

## Staging (Render)

Same origin: gunicorn serves the API, admin, media, and the Vite build. Do **not** put the PWA on Vercel against this API (session cookies would be third-party).

1. Push this repo to GitHub.
2. In Render: **New → Blueprint** and select the repo (`render.yaml`).
3. Render creates a free web service plus a Postgres instance. Free Postgres expires; upgrade or recreate if the blueprint fails on the DB plan.
4. After the first deploy, open `/healthz`, then `/` (the PWA), then `/admin/`.
5. Create a superuser from the Render shell: `python manage.py createsuperuser`.

Do **not** run `load_recipe_seed --force` on a URL you will share — `dev` / `cook` / `baker` passwords are in this README. The command refuses when `RENDER_EXTERNAL_HOSTNAME` is set or `ALLOWED_HOSTS` is not only localhost. Uploaded photos live on ephemeral disk and can vanish on restart.

`python manage.py load_starter_recipes` and `python manage.py load_default_references` are safe to run on a shared URL (recipe and shelf content only, no users).

### Demo accounts

`entrypoint.sh` runs `python manage.py load_demo_data` on every start. It creates two demo accounts filled from `seed/data` (a developer with ideas, Lab recipes, references and cookbooks; a home cook with box cards and references). Passwords live only in Render env vars:

| Env var | Default |
|---|---|
| `DEMO_DEVELOPER_USERNAME` | `demo-developer` |
| `DEMO_DEVELOPER_PASSWORD` | none (set in Render, `sync: false`) |
| `DEMO_COOK_USERNAME` | `demo-cook` |
| `DEMO_COOK_PASSWORD` | none (set in Render, `sync: false`) |

If either password is unset or fails Django's password validators, the command prints a notice and does nothing; the deploy still starts. It only fills an account that is missing or has no content, so testers' changes survive restarts. Nothing is published. Tester uploads still vanish on restart (ephemeral disk).

To reset a demo account: in `/admin/`, delete the demo developer's cookbooks first (cookbook entries protect recipe versions), then delete the demo user, then redeploy or restart.

Local production-shaped run (after `cd frontend && npm run build`):

```bash
source .venv/bin/activate
pip install -r requirements.txt
DEBUG=False SECRET_KEY=dev-only-not-for-render python manage.py collectstatic --noinput
DEBUG=False SECRET_KEY=dev-only-not-for-render SECURE_SSL_REDIRECT=False gunicorn config.wsgi:application
```

## Phase 0 — seed data

Export content from `recipes/` and Google Sheets into structured JSON:

```bash
python manage.py export_recipe_seed
```

Output: `seed/data/` (`ideas_seed.json`, `references_seed.json`, workbook exports, etc.)

Load into the database for local dev (creates a `dev` developer user if needed):

```bash
python manage.py load_recipe_seed --force
```

| User | Password | Role |
|------|----------|------|
| `dev` | `devpass123` | Developer (cork, lab, cookbooks) |
| `cook` | `cookpass123` | Home cook (recipe box) |
| `baker` | `bakerpass123` | Second developer (public fork source) |

Guest: `/r/raisin-bran-muffins`, `/r/brown-butter-blondies`, `/c/brunch-notes`.

`--force` replaces walkthrough records. Expired local `dev` trials are refreshed on load. The same load adds a cached URL import (olive oil cake, saved into the cook's box), a soda-bread scan draft, photos on the pistachio test session, and a shelf link from The Perfect Loaf to the raisin bran version. An expired trial, hidden forks, and an empty box are separate tests, not walkthrough users.

## Phase 1 — Developer API

Base path: `/api/v1/`. All endpoints require an authenticated session unless noted.

**Auth:** session cookies (`SessionAuthentication`). Register/login set the session; send cookies on subsequent requests. CORS credentials are enabled for `http://localhost:5173` by default.

### Auth (`/api/v1/auth/`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `guest/` | POST | Public | Create a passwordless guest (`is_guest=true`, `home_cook`) and log in; returns the current user if already signed in. Guests keep up to 5 box cards (403 `guest_card_limit` past that); no `start-trial/`, `rework`, or `PATCH me/` |
| `register/` | POST | Public | Create account (defaults to `home_cook`), auto-login. When signed in as a guest, upgrades that same user (sets username and password, clears `is_guest`, keeps cards, rotates the session) |
| `login/` | POST | Public | Session login |
| `logout/` | POST | Required | Clear session |
| `me/` | GET, PATCH | Required | Profile; PATCH `show_forks` |
| `start-trial/` | POST | Required | Home cook → 14-day developer trial (once) |

`me` returns `role`, `subscription_status`, `trial_ends_at`, `measurement_preference`, `show_forks`, and `is_guest`.

Developer endpoints require `role=developer` plus an active trial or subscription. Home cooks can `POST /api/v1/auth/start-trial/` once. Expired trials cannot restart until Stripe exists. Admin can still set `role` and `subscription_status` directly.

### Ideas — cork board (`/api/v1/ideas/`)

Developer-only CRUD. Scoped to the authenticated user.

- **POST** `{ "title": "...", "image": <file optional> }` — multipart for images
- Also writable: `notes`, `category_tag`, `status`, `is_pinned`
- Read-only: `promoted_recipe`, timestamps

### Development recipes (`/api/v1/recipes/`)

Developer-only. Creating a recipe auto-creates **version 1** as `current_version`.

| Endpoint | Methods | Notes |
|----------|---------|-------|
| `recipes/` | GET, POST | List / create (`{ "title": "..." }`) |
| `recipes/{id}/` | GET, PATCH, DELETE | Own recipes only |
| `recipes/{id}/save-new-version/` | POST | Snapshot current version + ingredient lines |
| `recipes/{id}/versions/` | GET | Version history |
| `recipes/{id}/versions/{id}/` | GET, PATCH | PATCH allowed on **current** version only |
| `versions/{id}/ingredient-lines/` | GET, POST | Ingredient lines for a version |
| `versions/{id}/ingredient-lines/{id}/` | GET, PATCH, DELETE | Writes on **current** version only |
| `versions/{id}/test-sessions/`, `.../{id}/` | GET, POST, PATCH, DELETE | Bake log: `notes`, `outcome`, read-only `tested_at` and `photos`. Optional (null when unset): `oven_temp` (≥ 0, needs `oven_temp_unit` `F` or `C`, stored as typed), `bake_minutes` (≥ 0), `rating` (1–5) |

Ingredient lines reference `catalog.Ingredient` by UUID (`quantity`, `unit` or `custom_unit`, `prep_note`, etc.).

**Version workflow:** edit the current version in place → `POST .../save-new-version/` when ready to snapshot → repeat.

## Phase 2 — Publish + public viewer

### Publish (`/api/v1/recipes/{id}/`)

| Endpoint | Method | Body (optional) |
|----------|--------|-----------------|
| `publish/` | POST | `version_id`, `slug`, `story`, `hero_image` |
| `unpublish/` | POST | — |

Publishes `current_version` by default. Unpublish hides the public page but keeps `published_version` for cookbook snapshots.

### Public API (no auth)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/public/recipes/{slug}/` | Published recipe: ingredients, steps, story, hero, fork lineage |

### Frontend PWA (`frontend/`)

Vite + React Router. Public recipe viewer at **`/r/:slug`**.

```bash
# Terminal 1 — API
source .venv/bin/activate
python manage.py runserver

# Terminal 2 — PWA (proxies /api and /media to :8000)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173/r/your-recipe-slug or `/c/your-cookbook-slug` after publishing.

### Authenticated UI

**Shipped:** auth shell, routes below, form/list editors (being replaced by Phase UI).

**Phase UI** (order: C1 → C3 → C4 → C6 → C5 → C2) — see [PRD Appendix A](docs/PRD.md#appendix-a-ui-surface-design):

| Surface | Target UX |
|---------|-----------|
| **Lab** | Composition notebook spread; ingredients left / steps right; version margin; journal, compare, publish as overlays. **New recipe** without an idea. |
| **Recipe box** | Wooden box + A–Z index cards; **in-place edit** on the card (no separate editor page). **Add card** without an idea. |
| **Cookbooks / references** | Binder + shelf metaphors |
| **Cork board** | Pinned notes grid (last); optional promote-to-lab |
| **Theming** | User-selectable color theme + font via CSS tokens |

| Route | Access | Purpose |
|-------|--------|---------|
| `/login`, `/register` | Visitor or guest | Session auth; a guest who registers keeps their cards |
| `/developer` | Developer | Cork board (ideas) |
| `/developer/lab`, `/developer/lab/:id` | Developer | Lab — recipe shelf + notebook editor |
| `/developer/cookbooks`, `/developer/cookbooks/:id` | Developer | Cookbook manager |
| `/recipe-box` | Authenticated; visitors too on a phone | Home cook recipe box (A–Z; `:id` deep-link → focused card). On a phone, visitors see the starter cards and their first save makes a guest |
| `/references` | Authenticated | Reference library |

Recipes can be created **without an idea** in both lab (`POST /recipes/`) and recipe box (`POST /recipe-box/`). Idea promote is optional (Phase UI C2/C6).

Session cookies use `credentials: "include"`. CSRF token is sent on mutating requests.

### Ingredients (`/api/v1/ingredients/`)

Authenticated search + get-or-create by name (for ingredient lines in lab and recipe box):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `ingredients/?search=` | GET | Search catalog |
| `ingredients/` | POST | `{ "name": "..." }` get or create |

## Phase 3 — Diff, cookbooks, home cook

### Version diff (`/api/v1/recipes/{id}/compare-versions/`)

Developer-only. Query params: `left`, `right` (version UUIDs).

Returns scalar field changes, version notes, and ingredient diff (`added`, `removed`, `changed`).

### Journal (`/api/v1/journal/`)

Developer-only private timeline. Scoped to the authenticated user.

| Endpoint | Methods | Notes |
|----------|---------|-------|
| `journal/` | GET, POST | Optional filter: `?recipe={uuid}` |
| `journal/{id}/` | GET, PATCH, DELETE | Own entries only |

POST body: `recipe` (required), `body` (required), optional `title`, `version_snapshot`.

### Cookbooks (`/api/v1/cookbooks/`)

Developer-only. Entries freeze a `snapshot_version` at add time; unpublishing a recipe keeps the entry but drops the public recipe link.

| Endpoint | Methods | Notes |
|----------|---------|-------|
| `cookbooks/` | GET, POST | Create/list cookbooks |
| `cookbooks/{id}/` | GET, PATCH, DELETE | Own cookbooks only. PATCH: `title`, `description`, `on_shelf` (bool, default false; shows the cookbook on the kitchen shelf) |
| `cookbooks/{id}/publish/` | POST | Optional `slug` |
| `cookbooks/{id}/unpublish/` | POST | Hides public page |
| `cookbooks/{id}/entries/` | GET, POST | POST: `recipe`, optional `version_id`, `sort_order` |
| `cookbooks/{id}/entries/{id}/` | GET, PATCH, DELETE | PATCH: `sort_order` only |
| `GET /api/v1/public/cookbooks/{slug}/` | GET | No auth; frozen recipe list |

Public PWA: **`/c/:slug`** (links to `/r/{slug}` when recipe still published).

### Home cook recipe box (`/api/v1/recipe-box/`)

Any authenticated user (home cook or developer). Single-version recipes, sorted A–Z by title. No publish or versioning.

| Endpoint | Methods | Notes |
|----------|---------|-------|
| `recipe-box/` | GET, POST | List (A–Z) / create |
| `recipe-box/{id}/` | GET, PATCH, DELETE | Own recipes only |
| `recipe-box/{id}/ingredient-lines/` | GET, POST | Ingredient lines |
| `recipe-box/{id}/ingredient-lines/{id}/` | GET, PATCH, DELETE | |

Card fields: `servings` (nullable positive integer) and `source_type` (`typed` default, `handwritten`, `recipe_card`, `cookbook`, `web`, `scan`). Ingredient lines take `raw_text` (the line as written); `ingredient` and `quantity` are nullable, but a line needs `raw_text` or an `ingredient`. URL and scan imports saved to the box set `source_type` to `web` / `scan`, store each line in `raw_text`, and do not create catalog ingredients.

### Starter cards (`/api/v1/starter-recipes/`)

One shared, read-only set of cards shown in every box (client merges them with `recipe-box/`). They don't count toward the guest 5-card limit.

| Endpoint | Methods | Notes |
|----------|---------|-------|
| `starter-recipes/` | GET | No session needed. Same card shape as `recipe-box/` plus `is_starter: true`. Hides the caller's hidden starters |
| `starter-recipes/{id}/` | GET | No PATCH/DELETE (405) |
| `starter-recipes/{id}/fork/` | POST | Signed in or guest. Copies into the caller's box as a normal card (201); counts toward the guest limit (`guest_card_limit` 403) |
| `starter-recipes/{id}/hide/` | POST | Signed-up only (guests 403). Hides it for that user (204, idempotent) |

Load or refresh them with `python manage.py load_starter_recipes` (reads `seed/data/starter_recipes.json`). It creates no users or passwords, so it is **safe on public URLs** such as Render, and `entrypoint.sh` runs it on every deploy. It is idempotent: it updates by title, and starters removed from the file are marked inactive.

Default references load the same way: `python manage.py load_default_references` reads `seed/data/default_references.json`, creates no users, runs from `entrypoint.sh` on every deploy, and is idempotent (updates by URL; defaults removed from the file leave every shelf).

To change the starters, edit the JSON and merge; the next deploy applies it. Renaming a title counts as a new starter: the old one is retired, and anyone who hid the old one sees the new one. Copies people already forked into their box don't change.

Register defaults to `home_cook`. Start a 14-day developer trial from the home page (`POST /api/v1/auth/start-trial/`), or set `role` in admin.

### Reference library (`/api/v1/references/`)

Any authenticated user (home cook or developer). Personal research shelf — cookbooks owned, blogs, chefs, tools. Each reference has `is_default`: `true` for the shared defaults on every shelf (King Arthur Baking recipes, Sally's Baking Addiction), `false` for ones the user added.

| Endpoint | Methods | Notes |
|----------|---------|-------|
| `references/` | GET, POST | Own references plus the defaults the caller hasn't hidden. Optional filter: `?ref_type=blog` |
| `references/{id}/` | GET, PATCH, DELETE | Own references; defaults are read-only (PATCH/DELETE 403 `permission_denied`) |
| `references/{id}/hide/` | POST | Defaults only (404 otherwise). Takes it off the caller's shelf (204, idempotent) |
| `references/{id}/links/` | GET, POST | Own references only. Link to `idea` or `recipe_version` (developer targets) |
| `references/{id}/links/{id}/` | GET, PATCH, DELETE | |

### Developer subscription gates

Developer endpoints (`ideas`, `recipes`, `journal`, `cookbooks`, etc.) require `User.has_developer_access()`:

| Status | Access |
|--------|--------|
| `active` | Allowed |
| `trial` (before `trial_ends_at`) | Allowed |
| `none` | Allowed (admin-promoted devs until Stripe) |
| `trial` (past `trial_ends_at`) | Blocked (403) |
| `expired`, `cancelled` | Blocked (403) |

Set `role`, `subscription_status`, and `trial_ends_at` in Django admin. Stripe integration is later.

## Phase 4 — Fork + import

| Endpoint | Method | Notes |
|----------|--------|-------|
| `POST /api/v1/public/recipes/{slug}/fork/` | Auth | `{ "fork_type": "save_to_box" \| "rework" }`. Home cooks: save to box only. |
| `POST /api/v1/imports/url/` | Auth | Fetch URL, parse JSON-LD Recipe, SSRF-safe. |
| `GET /api/v1/imports/url/{id}/` | Auth | Read-only cached import. |
| `POST /api/v1/imports/url/{id}/save/` | Auth | Copy into box or lab. Never publish directly. |
| `POST /api/v1/imports/scan/` | Auth | Multipart file → `SourceDocument` + draft. Fills `extracted_text` (text files, Tesseract OCR, or `pdftotext`) and parses Ingredients/Directions into lines. Max 10 MB (`SCAN_UPLOAD_MAX_BYTES`); JPEG, PNG, HEIC, PDF or plain text only (checked by content), else 400. |

Public UI: **Save to box** / **Rework** on `/r/:slug`. Box and lab have URL preview + scan upload.

### Rate limits

DRF scoped throttles; rates live in `REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]` in `config/settings.py`. Over the limit returns 429 with `Retry-After`.

| Scope | Endpoint | Rate | Keyed by |
|-------|----------|------|----------|
| `guest_create` | `POST /api/v1/auth/guest/` | 10/hour | IP |
| `register` | `POST /api/v1/auth/register/` | 10/hour | IP |
| `login` | `POST /api/v1/auth/login/` | 20/hour | IP |
| `url_import` / `url_import_guest` | `POST /api/v1/imports/url/` | 30/day (guest 10/day) | User |
| `scan_import` / `scan_import_guest` | `POST /api/v1/imports/scan/` | 20/day (guest 5/day) | User |

Counts live in Django's default cache (local memory), so each gunicorn worker keeps its own count and a restart resets them. A shared cache is not set up yet. Behind a proxy, set `THROTTLE_NUM_PROXIES` to the number of proxies in front of the app so the client IP is read from `X-Forwarded-For` correctly. On Render it is `3` (measured on staging, 2026-10-15); a wrong value either lets clients fake their IP or makes many users share one limit.

### API errors

Every error body is one of two forms (`config/exceptions.py`, DRF `EXCEPTION_HANDLER`):

- **Everything except field validation:** `{"detail": "<message for the user>", "code": "<machine code>"}`. Codes include `invalid`, `parse_error`, `not_authenticated`, `permission_denied`, `not_found`, `throttled` (with a `Retry-After` header), `guest_card_limit`, `fetch_failed` (502 from URL import) and `server_error`.
- **Field validation (400):** DRF's map, `{"<field>": ["<message>"], "non_field_errors": ["<message>"]}`.

Bodies never carry exception text. Domain errors subclass `config.exceptions.UserFacingError` and views return its fixed `user_message`; any other exception is logged and returns `500 {"detail": "Something went wrong on our side. Please try again.", "code": "server_error"}` (with `DEBUG` on, Django's debug page shows instead). The frontend reads errors only in `toApiError` (`frontend/src/api/client.ts`), which sets `ApiError.message` and `ApiError.code`. The audit of every error source is in [`docs/error-audit.md`](docs/error-audit.md).

### Guest cleanup

`cleanup_guests` deletes guest accounts with no card change, login or sign-up in the last N days, along with their cards and uploaded files (scans and card photos). Signed-up users are never touched. It is not scheduled; run it by hand (for example from the Render shell):

```bash
python manage.py cleanup_guests --days 30 --dry-run   # print counts only
python manage.py cleanup_guests --days 30
```

## Tests

```bash
source .venv/bin/activate
python manage.py test accounts development collection library catalog
cd frontend && npm run build                 # TypeScript + production bundle
cd frontend && npm run test:e2e              # phone Playwright pass; local seed only
```

### CI and automation

| What | When | File |
|------|------|------|
| Django check, migrations check, tests (Postgres 16) | Every PR; pushes to `main` and `staging-render` | `.github/workflows/ci.yml` |
| Frontend typecheck + build, then the Playwright pass | Same | `.github/workflows/ci.yml` |
| CodeQL (Python, TypeScript) | Same, plus weekly | `.github/workflows/codeql.yml` |
| Dependabot (pip, npm, Actions) into `staging-render` | Weekly | `.github/dependabot.yml` |
| `@claude` in an issue or PR comment hands it the task; its PRs target `staging-render`. Capped at 40 turns and 30 minutes, one run per issue or PR at a time | On mention, write access only | `.github/workflows/claude.yml` |

PRs go into `staging-render`, then `staging-render` into `main`. Write tasks with the **Task** issue template, which has a "Done when" section.

Claude Code sessions load the top of `.cursor/session_log.mdc` at start (`.claude/hooks/session-context.sh`) and share the session-log skill with Cursor (`.claude/skills/session-log` links to `.cursor/skills/session-log`).

### Quick API smoke test

```bash
# Register + start a developer trial, then create an idea
curl -c cookies.txt -X POST http://127.0.0.1:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"dev1","password":"strong-pass-1","password_confirm":"strong-pass-1"}'

curl -b cookies.txt -c cookies.txt -X POST http://127.0.0.1:8000/api/v1/auth/start-trial/

curl -b cookies.txt http://127.0.0.1:8000/api/v1/auth/me/
```

## Project layout

```
accounts/     User model (role, trial, subscription)
catalog/      Ingredient catalog + aliases
development/  Ideas, dev recipes, versions, journal, cookbooks, forks
collection/   Home cook recipe box
library/      References, URL imports, source documents
config/       Django settings
frontend/     React/TS PWA (public viewer + authenticated metaphor UI)
seed/data/    Exported seed JSON (generated)
recipes/      Original notes, sheets links, docx recipes
```

## Roadmap

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | Schema + seed | Complete |
| **1** | Developer core API: auth, ideas, recipes, versions, ingredient lines | Complete |
| **2** | Publish + public viewer + PWA shell | Complete |
| **3** | Version diff, cookbooks, home cook tier, reference library API | Complete |
| **UI** | Metaphor SPA: theming, lab notebook, recipe box, API UI gaps, cookbooks/references, cork board | Complete |
| **UI polish** | Sun & floral theme, on-paper forms, index cards, dot-grid lab, cork cabinet | Complete |
| **4** | URL/scan import, fork buttons | Complete |
| **2.0 frame** | Recipe-card login, in-frame navigation, phone list and one notebook page, local walkthrough fixtures, short Playwright pass | Milestones 1–3 on `staging-render` — [docs/milestone-1-2-technical-plan.md](docs/milestone-1-2-technical-plan.md) |
| **5** | PWA offline depth, AI tools, challenges/glossaries | Planned |
| **UI+** | Freeform cork-board canvas (drag layout) | Planned |

Full scope, UI design, and user stories: [docs/PRD.md](docs/PRD.md) (v1.5).
