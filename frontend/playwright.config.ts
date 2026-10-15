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
  webServer: {
    command: "bash ../scripts/e2e_server.sh",
    url: "http://127.0.0.1:8010/healthz",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
