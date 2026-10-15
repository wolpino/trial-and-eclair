# 1C: Card View, editor and autocomplete

Goal: Build Card View (front, back, flip, scaling), the editor, and the ingredient/title/tag autocomplete combobox.
Requirements: R2, R3, R21.
Owned paths: apps/web/src/features/card/
Read-only inputs: packages/contracts, packages/ui, packages/domain interfaces (stub until 1A lands)
Depends on: 0b, 0c merged; 1A for the real parser.
Tests to write first: Component tests for flip, scaling display, Needs attention, combobox keyboard and announced result count; R21-AC1 to AC4 as tests.
Out of scope: Box View, data layer, import screens.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. R2-AC1 to AC3, R3-AC1, R3-AC4, R21-AC1 to AC4 pass.
