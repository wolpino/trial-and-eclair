# 0a: Scaffold

Goal: Create the monorepo so every later task can run, test and preview.
Requirements: Enables all; R22 (installable shell).
Owned paths: repo root, .github/, package.json, pnpm-workspace.yaml, apps/web (empty shell), AGENTS.md, CLAUDE.md
Read-only inputs: docs/spec.md sections 2, 8, 9
Depends on: Nothing.
Tests to write first: A Playwright smoke test that opens the app shell and checks the page title; a CI workflow test run on a throwaway PR.
Out of scope: Any feature code, contracts, database schema.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. pnpm install, dev, typecheck, lint, test, e2e, storybook and verify all work and match the Commands list in AGENTS.md; CI runs verify and posts a preview URL on every PR; Sentry is wired as a stub; the web manifest and service worker exist as a minimal installable shell.
