# API error audit (issue #55)

Audited 2026-10-16. The API error shape is in [README.md → API errors](../README.md#api-errors).
The frontend turns every failed response into an `ApiError` in one place:
`toApiError` / `parseApiErrorMessage` in `frontend/src/api/client.ts`.

| Endpoint or source | Status | What the API returns | What the user sees | Fixed / left as is |
| --- | --- | --- | --- | --- |
| `POST /api/v1/auth/start-trial/` (`TrialUnavailable`) | 400 | `{"detail": "<fixed trial message>", "code": "invalid"}` | The trial message, e.g. "Your trial has ended. Paid billing is not available yet." | Fixed: was `str(exc)`, now `exc.user_message` |
| `POST /api/v1/imports/url/`, unsafe URL (`UnsafeURLError`) | 403 | `{"detail": "URL host is not allowed." (or another fixed SSRF message), "code": "permission_denied"}` | That message | Fixed: was `str(exc)` |
| `POST /api/v1/imports/url/`, robots.txt (`RobotsDisallowedError`) | 403 | `{"detail": "This URL is disallowed by robots.txt.", "code": "permission_denied"}` | That message | Fixed: was `str(exc)` |
| `POST /api/v1/imports/url/`, fetch failed (`FetchError`) | 502 | `{"detail": "Could not fetch URL." / "Fetch timed out." / "Fetch failed with HTTP <n>." / "Response too large.", "code": "fetch_failed"}` | That message | Fixed: was `str(exc)`; upstream and parser text never reaches the body |
| URL import parser or any other crash | 500 | `{"detail": "Something went wrong on our side. Please try again.", "code": "server_error"}` | Same | Fixed: generic handler (was Django's HTML 500) |
| `POST /api/v1/ideas/<id>/promote/` (`RecipeError`) | 400 | `{"detail": "Idea already promoted to a recipe.", "code": "invalid"}` | That message | Fixed: was `ValidationError(str(exc))` on any `ValueError` |
| `POST /api/v1/recipes/<id>/publish/` (`RecipeError`) | 400 | `{"detail": "<fixed version message>", "code": "invalid"}` | That message | Fixed: same |
| `GET /api/v1/recipes/<id>/compare-versions/` (`RecipeError`, missing params) | 400 | `{"detail": "...", "code": "invalid"}` | That message | Fixed: was `str(exc)`, and the bare-list body is now `detail` |
| `POST /api/v1/cookbooks/<id>/entries/` (`RecipeError`) | 400 | `{"detail": "Version not found for this recipe." etc., "code": "invalid"}` | That message | Fixed: was `str(exc)` |
| Lab test session photo limit, other `ValidationError("text")` | 400 | `{"detail": "...", "code": "invalid"}` | That message | Fixed: bare-list body is now `detail` |
| Any view, unhandled exception (DEBUG off) | 500 | `{"detail": "Something went wrong on our side. Please try again.", "code": "server_error"}`; traceback goes to the server log only | Same | Fixed: `config/exceptions.py` |
| Any view, malformed JSON body | 400 | `{"detail": "The request body could not be read.", "code": "parse_error"}` | Same | Fixed: DRF put the JSON parser's exception text in `detail` |
| `POST /api/v1/imports/scan/`, too large or wrong type (#51) | 400 | `{"file": ["Scans must be 10 MB or smaller."]}` / `{"file": ["Upload a JPEG, PNG, HEIC, PDF or plain text file."]}` | The message without a `file:` prefix; the picker only offers those types | API left as is; frontend fixed |
| URL and scan import throttles (#51), login/register/guest throttles | 429 | `{"detail": "Request was throttled. Expected available in N seconds.", "code": "throttled"}` and `Retry-After` | "Too many tries. Try again in N minutes." (hours past 90 minutes) | API left as is (code added); frontend fixed |
| Guest card limit (#42): box create, starter fork, URL/scan save to box | 403 | `{"detail": "Guests can keep up to 5 cards. Sign up to save more.", "code": "guest_card_limit"}` | That message; `ApiError.code === "guest_card_limit"` for callers (#56) | Left as is; frontend now carries `code` |
| `POST /api/v1/starter-recipes/<id>/hide/` as a guest (#50) | 403 | `{"detail": "Sign up to use this feature.", "code": "permission_denied"}` | That message | Left as is |
| Starter fork or hide, signed out (#50) | 403 | `{"detail": "Authentication credentials were not provided.", "code": "not_authenticated"}` | That message | Left as is |
| Rework or lab import without developer access | 403 | `{"detail": "Rework requires developer access." / "Lab import requires developer access.", "code": "permission_denied"}` | That message | Left as is |
| Developer-only endpoints, no trial or subscription | 403 | `{"detail": "Developer access requires an active trial or subscription.", "code": "permission_denied"}` | That message | Left as is |
| Missing object (`get_object_or_404`, `NotFound`) | 404 | `{"detail": "Not found." / "Recipe not found." / "Cookbook not found.", "code": "not_found"}` | That message (public pages show their own not-found view) | Left as is |
| Serializer field errors (register, login, recipe forms, etc.) | 400 | `{"<field>": ["<message>"], "non_field_errors": ["<message>"]}` | Messages only, no raw keys: "This field is required." on `title` reads "Title is required." | API left as is; frontend fixed (was `title: This field is required.`) |
| Proxy or server error with a non-JSON body | 5xx | HTML or text | "Something went wrong on our side. Please try again." | Frontend fixed (was the bare status text) |
| `config/settings.py` `DEBUG` default | n/a | `DEBUG` is `False` when the env var is unset, so a missing var never shows Django debug pages | n/a | Fixed: was `True`. Local dev sets `DEBUG=True` in `.env` (from `.env.example`); CI and `scripts/e2e_server.sh` set it explicitly |
