# 1H: Accessibility and performance harness

Goal: Make accessibility and performance budgets enforceable in CI.
Requirements: R6-AC4, R1-AC4; budgets in docs/spec.md section 6.
Owned paths: e2e/, Lighthouse CI config (config files only)
Read-only inputs: docs/spec.md sections 6 and 8
Depends on: 0d merged.
Tests to write first: A deliberately failing page that proves axe and Lighthouse budget checks fail CI, then removed.
Out of scope: Fixing violations in other lanes' code; report them to the owning lane instead.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. axe runs on every screen in the e2e suite; Lighthouse CI enforces the budgets; a manual VoiceOver and TalkBack script is added to docs/.
