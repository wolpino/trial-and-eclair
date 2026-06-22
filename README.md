# Trial and Eclair

Recipe development and collection app — not a blog.

- **Home Cook (free):** alphabetical recipe box, import, fork published recipes
- **Developer (paid):** versioning, cookbooks, cork board ideas, publish + story/photo
- **Viewer:** public published recipes and cookbooks

## Stack

- Django REST + Postgres (SQLite for local dev)
- Session auth (cookie-based, CORS-enabled for local PWA dev)
- React/TypeScript PWA (Phase 2+ frontend)
- Object storage for media (Phase 2+ production; local `media/` in dev)

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

Admin: http://127.0.0.1:8000/admin/

### Postgres (optional)

```bash
docker compose up -d db
# Set in .env:
# DATABASE_URL=postgres://trial_eclair:trial_eclair@localhost:5432/trial_eclair
python manage.py migrate
```

## Phase 0 — seed data

Export content from `recipes/` and Google Sheets into structured JSON:

```bash
python manage.py export_recipe_seed
```

Output: `seed/data/` (`ideas_seed.json`, `references_seed.json`, workbook exports, etc.)

## Phase 1 — Developer API

Base path: `/api/v1/`. All endpoints require an authenticated session unless noted.

**Auth:** session cookies (`SessionAuthentication`). Register/login set the session; send cookies on subsequent requests. CORS credentials are enabled for `http://localhost:5173` by default.

### Auth (`/api/v1/auth/`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `register/` | POST | Public | Create account (defaults to `home_cook`), auto-login |
| `login/` | POST | Public | Session login |
| `logout/` | POST | Required | Clear session |
| `me/` | GET | Required | Current user profile |

`me` returns `role`, `subscription_status`, `trial_ends_at`, `measurement_preference`, and `show_forks`.

Developer endpoints require `role=developer`. Promote a user in Django admin (`Accounts → Users → role`).

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

Ingredient lines reference `catalog.Ingredient` by UUID (`quantity`, `unit` or `custom_unit`, `prep_note`, etc.).

**Version workflow:** edit the current version in place → `POST .../save-new-version/` when ready to snapshot → repeat.

### Run tests

```bash
source .venv/bin/activate
python manage.py test accounts development
```

### Quick API smoke test

```bash
# Register + create an idea (requires developer role — set in admin first, or register then promote)
curl -c cookies.txt -X POST http://127.0.0.1:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"dev1","password":"strong-pass-1","password_confirm":"strong-pass-1"}'

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
seed/data/    Exported seed JSON (generated)
recipes/      Original notes, sheets links, docx recipes
```

## MVP roadmap

| Phase | Scope |
|-------|--------|
| **0** | Schema + seed |
| **1** | Developer core API: auth, ideas, recipes, versions, ingredient lines |
| **2** | Publish + public viewer + PWA shell |
| **3** | Version diff, cookbooks, home cook tier, reference library UI |
| **4** | URL/scan import pipelines |
| **5** | AI, polish |

## Merging Phase 1

Branch: `phase-1-developer-core` → `main`

**Pre-merge checklist**

- [ ] `python manage.py test accounts development` passes
- [ ] Three commits on branch: auth, ideas, recipes/versions
- [ ] Promote a test user to `developer` in admin before exercising ideas/recipes
- [ ] No `media/`, `.env`, or local IDE files in the PR

**Suggested PR title:** Phase 1 — Developer core API

**After merge**

- React PWA can wire to `/api/v1/` with session cookies
- Phase 2: publish flow, public viewer, R2 media storage
