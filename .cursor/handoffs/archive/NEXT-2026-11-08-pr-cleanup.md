# NEXT — 2026-11-08

## Goal
Clear every open PR and issue in order (8 phases), then pick the next feature.

## Done
| Phase | What |
|---|---|
| 1 | Closed PR #124, issues #103 and #137, each with a comment |
| 2 | #146 and #147 updated, 6/6 green, merged (`9f3bf5a`, `f8aff32`). Status issues #94 and #130 updated |
| 3 | Docs PRs #149, #122 and #159 (today's session log) merged, each 6/6 green. CI on `staging-render` is green |
| 4 | Dependabot #157, #155, #156, #153, #152, #151 merged, each 6/6 green. #151 conflicted, Dependabot rebased it (now Django ≥6.1.3). CI on `staging-render` `21d918e` is green |

## Next, in order
- **Owner, on Render staging:** the deploy of `21d918e` starts and `/admin/` loads (Django 6.1.3), and uploading a hero image works (Pillow 13)
- **Session log:** the 2026-11-08 entry still says "Resume with: Phase 4". Add Phase 4 at the next sign-off
5. **Local sync:** this checkout is a detached HEAD at `71d75a9`
   - compare the untracked `docs/agent-prompts/design-bash-director.md` with the one on `origin/staging-render`, then delete or rescue it
   - `git switch staging-render && git pull`, then `pip install -r requirements.txt`, `cd frontend && npm ci`
6. **#131** e2e storageState: ready to build in its own session
7. **Post-release dependencies:** #118 TS 7, #114 vite-plugin-pwa 2, #108 gunicorn 26. #154 + #158 (vite 8, plugin-react 6) fail the build: open one Task issue, then close both PRs
8. **Bookkeeping:** close #130 and #94, decide drafts #66–#69 and #89, write the session log

## Files to open first
- `.cursor/session_log.mdc` (top entry, after the docs PR merges)
- https://github.com/wolpino/trial-and-eclair/issues/94 (status table)
- https://github.com/wolpino/trial-and-eclair/issues/132 (post-release list)

## Don'ts
- Don't merge #154 or #158 on their own: the build is red
- Don't merge `staging-render` into `main` unless the owner asks
- Don't run `load_recipe_seed --force` against a shared URL
