# 1D: Data layer

Goal: Repositories and query hooks over Supabase, with the persisted cache and offline mutation queue.
Requirements: R5, R17 (client side).
Owned paths: packages/data/
Read-only inputs: packages/contracts, supabase/migrations
Depends on: 0b merged.
Tests to write first: Integration tests: offline edit queues and replays in order; two sessions editing one field keep the newer and store the older as a Revision; anonymous sign-in on first launch; queue survives reload.
Out of scope: Any UI; schema changes (use a contract PR).
Budget: one session; stop and report what is left if tests still fail after three fix attempts or the time or spend cap is hit.
Done when: the Definition of done in docs/prd.md is met. R5-AC1 to AC3 and R17-AC1, AC2 pass against local Supabase.
