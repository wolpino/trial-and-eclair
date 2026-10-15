# Trial & Eclair — Claude Code context

Recipe development and collection app (not a blog). Django REST API + React/TypeScript PWA, served same-origin.

- **Notebook** (existing `frontend/`): developer tools for tablet/monitor — ideas, versioned recipes, test bakes, publish, cookbooks.
- **Recipe Box** (planned, mobile first): A–Z box, recipe cards, cook mode. Same Django API and database, same domain. See `docs/recipe-box/README.md`.

## Read first

- `README.md` — setup, staging on Render, seed users
- `docs/PRD.md` — product, data model, phase status
- `docs/recipe-box/README.md` — the mobile front end plan and which docs still apply
- `.cursor/session_log.mdc` — top 3 entries only; honor **Do not redo** and **Resume with**

`docs/recipe-box/agents.md` and `original-*.md` describe the old standalone Supabase plan. Reference only; they do not govern this repo.

## Rules (shared with Cursor)

These always apply:

@.cursor/rules/anti-overeng.mdc
@.cursor/rules/session-context.mdc
@.cursor/rules/sesc-dev-ssdld-appsec.mdc

Read these when the work touches them:

- Any Python: `.cursor/rules/python.mdc`, `.cursor/rules/django.mdc`
- Views, serializers, URLs: `.cursor/rules/api-design.mdc`
- Migrations: `.cursor/rules/migration-safety.mdc`

## Commands

```bash
source .venv/bin/activate
python manage.py runserver          # API on :8000
python manage.py test               # Django tests
cd frontend && npm run dev          # PWA on :5173 (proxies /api and /media)
cd frontend && npm run build        # typecheck + build
cd frontend && npm run test:e2e     # Playwright
```

## Working agreements

- One task per session. Done means tests pass and the task's "done when" is met.
- Plan before code on anything non-trivial; ask when unsure.
- Keep the PWA same-origin with the API (session cookies). No separate frontend host.
- Never run `load_recipe_seed --force` against a shared URL.
- At the end of a session, add an entry to `.cursor/session_log.mdc` and update `README.md` / `docs/PRD.md` status if a phase changed.
- Decisions go in `docs/decisions/NNN-short-name.md` (Context, Options, Decision, Consequences, Revisit when).
