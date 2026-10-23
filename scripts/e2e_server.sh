#!/usr/bin/env bash
# Local Playwright server only. Binds 127.0.0.1 and a throwaway sqlite file.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -n "${RENDER_EXTERNAL_HOSTNAME:-}" ]]; then
  echo "Refusing to start the walkthrough server on a public host." >&2
  exit 1
fi

if [[ ! -f frontend/dist/index.html ]]; then
  npm --prefix frontend run build
fi

DB="$ROOT/e2e.sqlite3"
rm -f "$DB"
export DATABASE_URL="sqlite:///${DB}"
# Local runserver over plain http; DEBUG defaults to False otherwise.
export DEBUG=True
export E2E_LOGIN_THROTTLE_RATE="${E2E_LOGIN_THROTTLE_RATE:-1000/hour}"
if [[ -x "$ROOT/.venv/bin/python" ]]; then
  PY="$ROOT/.venv/bin/python"
else
  PY="$(command -v python3)"
fi
"$PY" manage.py migrate --noinput
"$PY" manage.py load_recipe_seed --force
"$PY" manage.py load_starter_recipes
"$PY" manage.py load_default_references
exec "$PY" manage.py runserver 127.0.0.1:8010 --noreload
