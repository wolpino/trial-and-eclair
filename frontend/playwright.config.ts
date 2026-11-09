import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:8010",
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  },
  projects: [
    // Logs each seed user in once and saves the session to e2e/.auth/ (see e2e/auth.ts).
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    { name: "e2e", dependencies: ["setup"] },
  ],
  webServer: {
    command: "bash ../scripts/e2e_server.sh",
    url: "http://127.0.0.1:8010/healthz",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
