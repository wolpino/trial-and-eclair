# 0c: Mocks and Storybook

Goal: Give UI lanes realistic mock data and a component workshop so they can work in isolation.
Requirements: Enables 1B, 1C, 1G.
Owned paths: packages/ui (storybook config, mocks), e2e/fixtures
Read-only inputs: packages/contracts, supabase/seed
Depends on: 0b merged.
Tests to write first: A test that every mock validates against its contract schema; a Storybook smoke test that all stories render.
Out of scope: Real components beyond examples that prove the setup.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. Mock API handlers (MSW) for every contract exist; stories build in CI.
