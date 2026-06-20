# Trial and Eclair

Recipe development and collection app — not a blog.

- **Home Cook (free):** alphabetical recipe box, import, fork published recipes
- **Developer (paid):** versioning, cookbooks, cork board ideas, publish + story/photo
- **Viewer:** public published recipes and cookbooks

## Stack (Phase 0)

- Django REST + Postgres (SQLite for local dev)
- React/TypeScript PWA (Phase 1+)
- Object storage for media (Phase 2+)

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
| **0** | Schema + seed (this repo state) |
| **1** | Developer core: cork board, ideas, versions, ingredients |
| **2** | Publish + public viewer |
| **3** | Version diff, cookbooks, home cook tier, reference library UI |
| **4** | URL/scan import pipelines |
| **5** | PWA, AI, polish |

See [PRD plan](.cursor/plans/) for full product requirements.
