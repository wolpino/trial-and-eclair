import { fileURLToPath } from "node:url";

// Login is throttled, so auth.setup.ts logs each seed user in once per run and
// specs reuse the saved session with test.use({ storageState: authFile(...) }).
// Never log out on a saved session: Django's logout deletes it on the server.
export const SEED_USERS = ["dev", "cook", "baker"] as const;
export type SeedUser = (typeof SEED_USERS)[number];

export function authFile(user: SeedUser): string {
  return fileURLToPath(new URL(`./.auth/${user}.json`, import.meta.url));
}

/** For tests that log in with the form (or log out) in a context of their own. */
export const signedOut = { cookies: [], origins: [] };
