# Recipe Box: Building with agents

## 1. Principles for agent-built software

Agents are fast; the bottlenecks are merge conflicts, unclear requirements and review. These rules keep many agents productive at once.

1. **This document is the source of truth.** Each requirement (R1, R2…) becomes tasks with acceptance criteria, the tests that prove them, and the directories the agent may touch.
2. **Contracts before code.** Zod schemas, the database schema, API shapes, design tokens and component props land first and change only through small “contract PRs” that merge before dependent work.
3. **Tests first, reviewed by someone else.** The author agent writes failing tests from the acceptance criteria; a separate reviewer agent checks the PR against the spec, the accessibility rules and the budgets.
4. **Small tasks.** Aim for under about 400 changed lines, one branch and one git worktree per agent, so agents never share a working directory.
5. **One owner per directory.** An agent edits only its lane (see the repository layout); cross-lane changes go through the owner or a contract PR.
6. **CI is the gatekeeper, humans own the gates.** Agents merge when everything is green; you approve the look and feel, the accessibility pass, the security and row-level-security review, and each release.
7. **A preview URL per PR** so you can try the work on your phone before it lands.
8. **Pinned dependencies.** One lane owns the lockfile; agents don’t upgrade packages on their own.
9. **Budgets for agents.** A cap on time and spend per task, and a hard stop that asks for help instead of looping.

## 2. Work breakdown: what runs in parallel and what must go first

Wave 0 is sequential and short; everything after it splits into lanes that can run at the same time, each owning its own directories and coding against the contracts.

| Wave | Workstream | Parallel? | Owns | Needs first |
| --- | --- | --- | --- | --- |
| −1 | Look prototype: front-on Box View in Tidy and Wild West, tried on a real phone (throwaway, see section 3) | Yes, runs before or alongside 0a | docs/reference/prototype/ only | Nothing |
| 0a | Scaffold: monorepo, lint, typecheck, CI, preview deploys, Sentry stub, Playwright smoke, AGENTS.md and CLAUDE.md (Part 4) | **No, goes first** | repo root, CI config | Nothing |
| 0b | Contracts: Zod schemas, database schema v1, RLS skeleton, design tokens, seed data | **No, after 0a** | packages/contracts, supabase/migrations, ui tokens | 0a |
| 0c | Mocks and Storybook scaffolding generated from the contracts | Yes, with 0d | packages/ui, e2e fixtures | 0b |
| 0d | Test harness: the critical journeys written as pending Playwright specs, axe and visual setup | Yes, with 0c | e2e/ | 0b |
| 1A | Domain library: ingredient parser, fractions and units, scaling, filing, revision diff, voice state machine | **Yes, fully independent** (pure functions) | packages/domain | Contracts |
| 1B | Box View: lid, tabs, fan, gestures, Simple List mode | Yes, against seed data in Storybook | apps/web/features/box | Contracts, tokens |
| 1C | Card View, editor and autocomplete | Yes; calls the domain library through its interface, stubbed until 1A lands | apps/web/features/card | Contracts, tokens |
| 1D | Data layer: repositories, query hooks, offline cache and queue | Yes | packages/data | Contracts |
| 1E | Backend: migrations, RLS policies and tests, auth, edge function skeletons | Yes; schema changes only via contract PRs | supabase/ | Contracts |
| 1F | Importers: URL parser with fixture corpus, OCR pipeline | Yes (parsers are pure; the screen waits for 1C) | domain/import, supabase/functions/import | Contracts, fixtures |
| 1G | Looks: Tidy and Wild West card renderers | Yes | packages/ui/renderers | Tokens |
| 1H | Accessibility and performance harness: axe rules, Lighthouse budgets | Yes, continuous | e2e/, CI config | 0d |
| Gate | **Integration:** wire lanes into the app shell, run the full e2e suite, look-and-feel review | **No, sequential** | apps/web shell | All of wave 1 |
| 2A | Voice UI and speech providers | Yes | features/voice | 1A, 1C |
| 2B | Audio notes, cook mode, scaling UI | Yes | features/notes, features/cook | 1C, 1D |
| 2C | Sharing: links, save to my box, provenance, upstream updates | Yes | features/share, functions/share | 1D, 1E |
| 2D | Review screen, paste and share-target import | Yes | features/import | 1F, 1C |
| 2E | Perspective Fan, behind a feature flag | Yes, independent experiment | features/box/fan | 1B |
| 2F | Observability and release tooling | Yes | CI and monitoring config | 0a |
| 3A | Feeds, reporting, moderation (backend and UI as two lanes) | Yes within itself | features/feeds, supabase | 2C |
| Gate | **Release:** security review of RLS, accessibility audit on real phones, store-less launch checklist | **No, sequential** | n/a | Everything |

**Collision hotspots and how to avoid them**

- **Shared types and database schema:** only the contracts owner changes them. Migrations are timestamped and go through the merge queue one at a time.
- **App shell and routes:** each feature registers its own route and menu entry in a registry file it owns; only the integration agent edits the shell.
- **Design tokens and global CSS:** changed only by the tokens owner.
- **package.json and lockfile:** the dependency owner; adding a dependency is its own small PR.
- **Snapshots, fixtures and test helpers:** add-only; an agent never regenerates another lane’s snapshots.
- **How many at once:** start with 3 to 5 parallel agents. Review capacity and CI time cap the useful number well before agent count does.

## 3. Wave −1: prototype the look

Before production code, build a throwaway prototype of the front-on Box View and try it on a real phone. Version 5 is live: [Box View prototype](https://claude.ai/artifact/UDqqk86ZP8ETNaVbNFKykq). It has the lid card, tabs that lift and fan their cards, Categories and A–Z tab sets, and Tidy and Wild West looks.

**Questions it must answer**

1. Does the front-on box feel like the reference photos? What proportion of lid to tabs works on a 360 px-wide phone?
2. Do tab lift, fan and card pick feel right under a thumb?
3. How should 27 A–Z tabs fit? (Version 5 spreads the letters edge to edge with each letter centered on its tab. With many letters they stagger into two overlapping rows so each tab is about twice as wide; drag a finger along the tabs to scrub. Use the all-letters test to judge the worst case, and decide whether the tab size is acceptable against the 48 px rule in R1-AC4.)
4. Which source styles (typed, handwritten card, recipe-card scan, cookbook scan, blog) read well and stay distinct without being busy?
5. Which depth cues (soft shadow, wood grain, box edges, the stack of cards behind the tabs) and which animations (card sliding into the lid, springy tab lift, recipe chips popping up) feel engaging without slowing anything down? Tabs are never angled.

**Exit criteria** (all true, then the wave is done)

- The owner has tried it on a real phone and the answers to the five questions are recorded in the decision log.
- Colors, type scale, spacing and tab heights are extracted into `docs/reference/prototype/tokens.md`, ready for the Wave 0b design tokens.
- Screenshots of both looks and both tab sets are saved in `docs/reference/prototype/`.
- No prototype code is copied into `apps/`; production is built from the tokens and the spec.
- Time box: two or three rounds of changes, then stop.

## 4. Options for how to build it

Recommendation: prototype the look fast, then build in a real repository with Claude Code agents in parallel lanes, and move to issue-driven automation once the foundation is in.

| Option | How it works | Strengths | Weaknesses | Best for |
| --- | --- | --- | --- | --- |
| 1. Claude Code, parallel sessions | Several Claude Code sessions, each on its own git worktree and task card; you or an orchestrating session hands out work | Full control, real repo, tests and CI enforced, easy to steer and watch | You coordinate and review; spend is usage-based | Waves 0 to 2 |
| 2. Claude Code driven from GitHub | Issues become agent branches and PRs; CI and a reviewer agent gate each one | Hands-off steady iteration, good for fixes and small features | Needs crisp task cards; weaker on large, unfamiliar changes | Ongoing work after the integration gate |
| 3. Custom orchestrator | A planner, worker and reviewer pipeline you build on the Claude API and Agent SDK | Maximum automation, custom budgets and routing | A project in itself | Later, if 1 and 2 hit limits |
| 4. Hosted AI app builders (for example Lovable, Bolt, Replit, v0) | Describe the app, the tool generates and hosts it | Very fast first screens; good for visual exploration | Hard to enforce tests, row-level security and parallel lanes; lock-in; pricing varies | Prototyping the Box View look only |
| 5. Hybrid (recommended) | Prototype the look, then options 1 and 2 in a real repo | Fast feedback on the feel, real engineering discipline after | Two phases to manage | This project |

**Recommended path**

1. **Settle the look first.** Prototype the front-on Box View in both looks as a throwaway or design artifact, and agree on it before any production code.
2. **Wave 0 with one agent** in the real repo. Your review of the contracts is the highest-value review of the whole build.
3. **Wave 1 in parallel,** 3 to 5 lanes, a reviewer agent on every PR, preview URLs for you to test on your phone.
4. **Integration gate,** then wave 2 lanes.
5. **Switch to GitHub-driven iteration** for fixes and small features; keep option 1 for larger ones.
6. **Guardrails:** spend and time cap per task, tests first, no unreviewed changes to contracts, row-level security or CI, and a weekly cost check.

Capabilities of these tools change quickly; check the current [Claude Code docs](https://docs.claude.com/en/docs/claude-code/overview) for parallel-session, subagent and GitHub features, and verify pricing for any hosted builder before relying on it.

## 5. Decisions to confirm

1. **Web app first, installable,** with a native wrapper only if store presence becomes important (recommended).
2. **Vite + React single-page app** with edge-rendered share pages (recommended), or Next.js for server rendering everywhere.
3. **Accounts from day one** via anonymous sign-in, so recipes are safe on the server and sharing works (recommended).
4. **Sharing scope:** share by link and save-to-my-box first; feeds only after moderation tools exist. Full social features, or lighter shared collections?
5. **Cloud fallbacks (LLM, cloud OCR, server transcription)** in the first public release, or wait until usage shows they are needed.
6. **Build approach:** the hybrid in section 4 above, and how many parallel agents you want to supervise at first.
7. **Monetization,** which decides whether sync, backup and sharing stay free.
