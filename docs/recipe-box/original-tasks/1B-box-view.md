# 1B: Box View

Goal: Build Box View: lid card, divider tabs, fan, gestures with keyboard and button equivalents, and Simple List mode.
Requirements: R1, R4 (UI), R6.
Owned paths: apps/web/src/features/box/
Read-only inputs: packages/contracts, packages/ui tokens and mocks
Depends on: 0b, 0c merged.
Tests to write first: Component tests for tab lift and fan, empty state, keyboard operation and role queries; un-skip the e2e specs for journeys 1 to 3 and 10 once data is wired.
Out of scope: Card View, editing, data fetching beyond the mock layer, perspective Fan.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. R1-AC1 to AC4 and R6-AC1 to AC4 pass; tab to fan under 100 ms; Reduce Motion handled.
