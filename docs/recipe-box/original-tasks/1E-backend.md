# 1E: Backend

Goal: Supabase migrations as built in 0b, row-level security policies with tests, auth settings, and edge function skeletons (import, share, LLM proxy).
Requirements: R17-AC3, R7-AC3; enables R23 to R26.
Owned paths: supabase/ (functions, tests, config)
Read-only inputs: packages/contracts
Depends on: 0b merged.
Tests to write first: SQL policy tests for every table (owner, other user, anonymous, link token, public); edge function tests for SSRF rejection (private addresses, non-http schemes, oversize responses) and rate limits.
Out of scope: App code; schema changes outside a contract PR.
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. Every table has policy tests; secrets are read only from function environment; no service key reachable from the client.
