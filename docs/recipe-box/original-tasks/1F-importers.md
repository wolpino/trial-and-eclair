# 1F: Importers

Goal: URL import (structured data, then readability extraction) and the OCR plus heuristic parser, with a fixture corpus.
Requirements: R7, R8 (parser side).
Owned paths: packages/domain/src/import/, supabase/functions/import/, e2e/fixtures/pages, e2e/fixtures/photos
Read-only inputs: packages/contracts; packages/domain parseIngredient interface
Depends on: 0b merged.
Tests to write first: Fixture tests: 50 saved recipe pages and 30 photo/OCR samples with expected outputs checked in; R7-AC1 and AC2 as tests.
Out of scope: The Review screen UI (lane 2D), cloud fallbacks (disabled by default, see decision D7).
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. Fixture pass rate is reported in the PR; failures are listed, not hidden.
