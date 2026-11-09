import { expect, test as setup } from "@playwright/test";

import { authFile, SEED_USERS } from "./auth";

for (const user of SEED_USERS) {
  setup(`log in as ${user}`, async ({ request }) => {
    const response = await request.post("/api/v1/auth/login/", {
      data: { username: user, password: `${user}pass123` },
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    await request.storageState({ path: authFile(user) });
  });
}
