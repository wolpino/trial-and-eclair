# 1A: Domain library

Goal: Pure logic: parse ingredient lines, fractions and units, scaling, filing rules, revision diff and apply, and the voice confirmation state machine.
Requirements: R2-AC3, R3-AC2, R3-AC3, R4-AC1, R10 (state machine), R14, R21-AC1 (parsing part).
Owned paths: packages/domain/
Read-only inputs: packages/contracts; e2e/fixtures/ingredients.json
Depends on: 0b merged.
Tests to write first: parseIngredient.test.ts (fractions 1 1/2 and 1½, ranges, parentheticals, a pinch, unknown lines return low confidence and never throw); scale.test.ts; filing.test.ts; revisions.test.ts; voiceMachine.test.ts (every transition, timeout cancels, never applies unconfirmed).
Out of scope: UI, network, browser APIs, autocomplete ranking, speech providers.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. Domain package coverage is 95% or higher; the voice machine and fraction/unit utilities are 100%.
