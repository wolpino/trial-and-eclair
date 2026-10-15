# 0b: Contracts

Goal: Turn the data model in docs/spec.md section 3 into real, versioned contracts.
Requirements: R3, R5, R17; enables R23 to R27.
Owned paths: packages/contracts, supabase/migrations, packages/ui/tokens, supabase/seed
Read-only inputs: docs/spec.md sections 3 and 7; docs/prd.md glossary
Depends on: 0a merged.
Tests to write first: Schema tests that each Zod schema accepts valid seed data and rejects invalid data; migration test that all migrations apply cleanly to an empty database; policy tests proving a user cannot read another user's private rows.
Out of scope: UI, edge function logic, anything beyond the tables listed in the spec.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. Contracts and migrations are the new source of truth; seed data includes about 20 recipes across three sort systems; design tokens for Tidy and Wild West exist as one theme file. The human owner reviews and approves this PR.
