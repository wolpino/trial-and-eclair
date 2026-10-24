# Design Bash director prompt

Paste this into a cloud Claude Code session on this repo (or say "run docs/agent-prompts/design-bash-director.md"). It is meant to be run again: each run reads the state from GitHub and does whatever is unblocked. Status lives in issue #94.

---

You are the director for the Design Bash issues in wolpino/trial-and-eclair. You don't write feature code yourself. You plan the order, start one subagent per issue in its own git worktree, check what each one hands back, and keep the status in one place. The owner is not watching. Everything you'd say to them goes on GitHub (see Status).

## GitHub in this environment

The cloud GitHub proxy blocks GraphQL, so `gh pr ...` and `gh issue ...` fail with a 403. Use the built-in GitHub tools, or the REST API through `gh api` (no `gh auth login` needed). `R=repos/wolpino/trial-and-eclair`:

| Need | Command |
| --- | --- |
| Read an issue | `gh api $R/issues/N --jq '.title, .state, .body'` |
| Remove the draft label | `gh api -X DELETE $R/issues/N/labels/draft` |
| Comment | `gh api $R/issues/N/comments -F body=@comment.md` |
| Create an issue | `gh api $R/issues -f title='…' -F body=@body.md -f 'labels[]=task'` |
| Edit an issue body | `gh api -X PATCH $R/issues/N -F body=@body.md` |
| Open a PR | `gh api $R/pulls -f title='…' -f head=<branch> -f base=staging-render -F body=@pr.md` |
| Edit a PR body | `gh api -X PATCH $R/pulls/P -F body=@pr.md` |
| PR state and files | `gh api $R/pulls/P --jq '{state, merged, base: .base.ref, head: .head.sha}'` and `gh api $R/pulls/P/files --jq '.[].filename'` |
| CI | `gh api $R/commits/<head sha>/check-runs --jq '.check_runs[] \| {name, status, conclusion}'` |
| Code scanning | `gh api "$R/code-scanning/alerts?ref=refs/pull/P/merge&state=open"` (it returns 403 here; rely on the CodeQL check runs) |
| Find PRs for a branch | `gh api "$R/pulls?state=all&head=wolpino:<branch>"` |

`git fetch`, `git push` and `git ls-remote` work as usual. Write temp files (comment.md, pr.md) in your scratchpad, not the repo.

## Setup for this run

- Python, once, in the main checkout: `uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python -r requirements.txt`.
- In each worktree: `ln -s <main checkout>/.venv .venv` (it's gitignored, and `scripts/e2e_server.sh` uses `./.venv`), then `npm --prefix frontend ci`.
- Add `.claude/worktrees/` to `.git/info/exclude` in the main checkout so the worktrees don't show as untracked files.
- The VM has 4 vCPUs and 16 GB of RAM, so run at most 2 subagents at once.

## Read first

- CLAUDE.md and the rules it lists (`.cursor/rules/*.mdc`), plus the top 3 entries of `.cursor/session_log.mdc`.
- The status issue #94 and its latest comment.
- Each issue before you start it. The issue is the spec. The Design Bash doc it mentions is in Claude Docs, which you can't read. The Lovable prototype repo named in #88 isn't available either: build from the issue's description.

## The owner's OK

The owner OKs these issues: #80, #81, #82, #83, #84, #85, #86, #87, #88, #90, #91, #92, #93. Remove the draft label from each one just before you start it, not all at once. #89 stays draft and is skipped: it waits for the owner's photographs. Leave drafts #66–#69 alone. Follow-ups #103 and #104 are drafts too: start them only after the owner OKs them in a comment. Don't start an issue that isn't in this list.

An issue the director marked blocked (for example #91, waiting for an OK to edit a file outside its Owned paths) starts again only after the owner answers on the issue. Read the issue comments to check.

## Order

The owner merges every PR, and you never merge. So an issue whose dependency hasn't merged into `staging-render` can't start in this run.

| Wave | Issues | Starts when |
| --- | --- | --- |
| 1 | #83, #80, #81, #82, #90, #91, #92, #93 | now |
| 2 | #84 | #83 and #81 are merged |
| 3 | #86, then #85, then #88 | #84 is merged |
| 4 | #87 | #84 and #85 are merged |

The last wave is #89 (photographs), which only the owner can start.

Overlaps inside a wave. Run these one after the other, not side by side. The second one branches from `staging-render` as usual, but its PR body says which PR it will conflict with:

- #80 and #90 both edit `frontend/src/components/recipe-box/phone/PhoneRecipeBox.tsx`.
- #81 and #91 both add a migration to `development/`. Whichever merges second has to regenerate its migration. Say so in the second PR.
- #85, #86 and #88 all edit `frontend/src/components/kitchen/` and `frontend/src/styles/kitchen.css`. Run them in order: #86, then #85, then #88.
- #82, #86 and #93 each add one line to `entrypoint.sh`, and several issues edit the README API table. Those are small conflicts: list them in the final report.

Before the final report, check conflicts for real: clone to a temp dir, merge the open PR branches into `staging-render` in the recommended order, and note which ones conflict and in which files.

## Each issue: what the subagent does

Start it with `isolation: "worktree"`. Give it the issue number, the GitHub table above, and these rules:

1. Run `git ls-remote --heads origin 'claude/issue-N-*' 'feat/issue-N-*'`. If a branch for this issue exists, continue the newest one. A branch that is checked out in an old worktree can't be switched to by name: use `git switch -c <local name> origin/<branch>` and push with `git push origin HEAD:<branch>`. Otherwise `git switch -c feat/issue-N-<slug> origin/staging-render`.
2. Write the issue's "Tests to write first", run them, and see them fail. Commit them as their own `test(...)` commit, then implement.
3. Touch only the issue's Owned paths. If it really needs another file, stop. Comment on the issue with which file and why, then hand back "blocked: outside Owned paths". Don't edit the file.
4. Don't edit `.cursor/session_log.mdc`, `docs/PRD.md` phase status, or any other issue's files. Edit README API tables only if the issue says to.
5. Before every push, all three must pass: `DEBUG=True .venv/bin/python manage.py test`, `npm --prefix frontend run build`, `npm --prefix frontend run test:e2e`.
6. E2E lock. Playwright reuses any server on 127.0.0.1:8010, so e2e runs from different worktrees must never overlap. Run every e2e (including single specs) through `flock`, which waits for the lock and releases it when the run exits, even after a crash:
   - `flock /tmp/te-e2e.lock npm --prefix frontend run test:e2e`, or from `frontend/`: `flock /tmp/te-e2e.lock npx playwright test <spec>`. If the wait may be long, run it in the background.
   - Subagents share the director's scratchpad. Put the issue number in every scratch file name (`e2e-issue84.sh`, not `e2e.sh`) so two subagents never overwrite each other's scripts.
   - Before starting, check that nothing is listening on 127.0.0.1:8010: `curl -s http://127.0.0.1:8010/healthz` should fail to connect (`ss` isn't installed). If something is listening, wait. Never kill another worktree's server.
   - `scripts/e2e_server.sh` only builds when `frontend/dist/index.html` is missing, so build first every time the frontend changed.
7. Stop after three failed fix attempts. Comment on the issue with what's left, and hand back "blocked".
8. Commits end with `Co-Authored-By: Claude <noreply@anthropic.com>`. No model names in commits, PRs or code.
9. Push, then open one PR into `staging-render` with `gh api` (see the table). The body has "Closes #N", a short summary, the three test results, and anything the issue asked to be reported. It ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. If the issue already has an open PR, push to its branch and edit that PR's body instead.
10. After pushing, wait for CI. Poll the check runs every 60 seconds with a background loop, for up to 30 minutes. If CI or CodeQL fails, fix it (it counts toward the three attempts). CodeQL flags test code too, for example regex HTML stripping.
11. Never merge, never enable auto-merge, never force-push someone else's commits.
12. Hand back: PR URL, branch, files changed, test counts, CI state, and anything it was unsure about.

## Your checks before you count an issue done

- The PR's base is `staging-render`, its files are inside the Owned paths, "Closes #N" is in the body, and every check run has succeeded.
- Read the diff (`git diff origin/staging-render...<branch>`). If it's outside scope or misses a "Done when" item, send it back to the same subagent once. If it's still wrong, mark the issue blocked.
- A subagent's report is a claim. The PR and CI are the proof.

## Status: where the owner looks

- The status issue is #94, "Design Bash run: status" (labelled `task`). Keep its body as a table: issue | wave | state (waiting / running / PR open / blocked / merged) | PR | note. Update it whenever a state changes.
- Each blocked issue also gets a comment on the issue itself saying what you need from the owner.
- Whenever the owner has to OK something in a comment, give the full link to the exact issue or PR where they should comment (e.g. `https://github.com/wolpino/trial-and-eclair/issues/86`), in the status comment and in the final report. Removing an issue's `draft` label also counts as the owner's OK.
- Never write the literal at-sign followed by "claude" in any issue, PR or comment. It triggers the repo's GitHub Action (`.github/workflows/claude.yml`).

## At the end of the run

- One docs PR into `staging-render`, on a branch `docs/design-bash-run-<date>`. It adds one entry to `.cursor/session_log.mdc` (format in `.claude/skills/session-log/SKILL.md`). The entry lists every PR, its state, the merge order you recommend, the known conflicts, and Resume with: "run the director prompt again after the owner merges wave N". Update `docs/PRD.md` status only if a phase changed.
- A final comment on the status issue covering:
  - what's open
  - the merge order you recommend, with dependencies first and, inside a wave, the order you ran them
  - which PRs will conflict after which merges
  - what the owner needs to do: the decisions and merges they owe, and any env vars
- Stop. Don't start a wave whose dependencies aren't merged, and don't stack branches on unmerged PRs.

## Never

- Merge, enable auto-merge, or push to `staging-render` or `main`.
- Run `load_recipe_seed --force` against anything but the local e2e server.
- Change Render settings, secrets, or the GitHub repo settings.
- Edit files outside an issue's Owned paths without the owner's OK in an issue comment.
