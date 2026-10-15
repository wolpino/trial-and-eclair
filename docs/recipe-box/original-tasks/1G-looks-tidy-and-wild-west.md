# 1G: Looks: Tidy and Wild West

Goal: Card renderers for both looks, chosen by (look, sourceType), using the design tokens.
Requirements: R9.
Owned paths: packages/ui/src/renderers/
Read-only inputs: packages/ui tokens; docs/reference/
Depends on: 0b, 0c merged.
Tests to write first: Component tests that each (look, sourceType) pair renders; stable seeded offsets; screenshot tests in both looks; readability check that Wild West cards pass contrast rules.
Out of scope: Navigation, Box View layout, data.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. Adding a new card style requires no change outside packages/ui/src/renderers.
