# Recipe Box

Mobile-first, installable web app: a digital recipe box. Box View shows the selected card in the lid with divider tabs in front; Card View is the full recipe card.
Read docs/agents.md and the Agent brief in docs/prd.md first. Requirements have IDs (R1, R2...); acceptance criteria are in docs/prd.md section 12.1.

## Commands (Wave 0a keeps these true)
- Install: pnpm install
- Dev server: pnpm dev
- Typecheck: pnpm typecheck
- Lint: pnpm lint
- Unit and component tests: pnpm test
- End-to-end tests: pnpm e2e (Playwright, Chromium and WebKit mobile profiles)
- Component workshop: pnpm storybook
- Everything CI runs: pnpm verify
Run pnpm verify before opening a PR.

## Layout and ownership
- apps/web: React app, one folder per feature under src/features
- packages/contracts: Zod schemas and generated types (single source of truth)
- packages/domain: pure logic (parsing, units, scaling, filing, revisions, voice state machine)
- packages/data: repositories, query hooks, offline cache and queue
- packages/ui: design tokens, shared components, Storybook
- supabase/: migrations, RLS policies and tests, edge functions
- e2e/: Playwright journeys, fixtures, accessibility checks
Edit only the paths named in your task card. Contracts, migrations, design tokens, the lockfile and CI config change only in their own dedicated PRs.

## Rules
- TypeScript strict. No any without a comment explaining why.
- Validate at every boundary with the Zod schemas from packages/contracts.
- Domain logic is pure: no browser APIs, no network, no randomness or clock.
- Device features (speech, OCR, storage, share) go through provider interfaces.
- Write failing tests first, from the task's acceptance criteria.
- Accessibility is a requirement: real buttons, lists and headings; labels; keyboard use; Reduce Motion; 48 px targets. Every gesture has a non-gesture equivalent.
- Never lose the original: raw ingredient text and Original records are never overwritten.
- Voice edits: propose, read back, confirm, then apply. Never apply unconfirmed.
- Never log or send recipe text, transcripts or audio to analytics or error reports.
- Secrets only in edge functions, never in the client.
- Small PRs: one task, under about 400 changed lines.

## Boundaries
- Always: run pnpm verify, name the R-IDs covered, list assumptions in the PR.
- Ask first: contract or schema changes, new dependencies, CI changes, anything touching RLS.
- Never: edit another lane's files, regenerate someone else's snapshots, commit secrets, skip or disable tests, force-push main.

## When blocked
A decision marked Open in the decision log (docs/decisions.md) has a default: use it, record the assumption in the PR, keep going. Anything else not covered: take the smallest reasonable choice and note it. Stop and ask only for contract, security or RLS questions.
