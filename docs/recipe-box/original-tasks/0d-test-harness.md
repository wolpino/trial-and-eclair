# 0d: Test harness

Goal: Write the 12 critical e2e journeys from docs/spec.md section 8 as pending Playwright specs, and set up axe, visual and viewport checks.
Requirements: R1-AC4, R6-AC4 and the e2e rows of docs/prd.md section 12.1.
Owned paths: e2e/
Read-only inputs: docs/prd.md section 12.1; docs/spec.md section 8
Depends on: 0b merged.
Tests to write first: Each journey as a skipped spec with its steps written as comments tied to acceptance IDs; an axe helper and a viewport matrix (360x640, 390x844, 768x1024, 1280x800).
Out of scope: Feature code. Do not un-skip specs; the lane that builds the feature does that.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. Specs run (as skipped) in CI; the axe and viewport helpers are documented in e2e/README.md.
