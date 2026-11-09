import { expect, test, type Browser, type Page } from "@playwright/test";

import { authFile, type SeedUser } from "./auth";

// Uses the seeded cook and baker sessions saved by auth.setup.ts.

test.use({ storageState: authFile("cook") });

async function pageAs(browser: Browser, user: SeedUser): Promise<Page> {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:8010",
    storageState: authFile(user),
  });
  return context.newPage();
}

function spine(page: Page, title: string) {
  return page
    .getByRole("list", { name: "Reference shelf" })
    .locator(".reference-spine", { hasText: title });
}

test("defaults show as spines and can be taken off one shelf", async ({ page: cook, browser }) => {
  await cook.goto("/references");

  await expect(spine(cook, "King Arthur Baking recipes")).toBeVisible();
  await expect(spine(cook, "Sally's Baking Addiction")).toBeVisible();

  await cook
    .getByRole("button", { name: "Remove King Arthur Baking recipes from shelf" })
    .click();
  await expect(spine(cook, "King Arthur Baking recipes")).toHaveCount(0);
  await cook.reload();
  await expect(spine(cook, "Sally's Baking Addiction")).toBeVisible();
  await expect(spine(cook, "King Arthur Baking recipes")).toHaveCount(0);

  const baker = await pageAs(browser, "baker");
  await baker.goto("/references");
  await expect(spine(baker, "King Arthur Baking recipes")).toBeVisible();
  await baker.context().close();
});

test("a personal reference can still be deleted", async ({ page }) => {
  await page.goto("/references");

  await page.getByLabel("Title").fill("My notebook blog");
  await page.getByRole("button", { name: "Add to shelf" }).click();
  await expect(spine(page, "My notebook blog")).toBeVisible();

  await page.getByRole("button", { name: "Delete My notebook blog" }).click();
  await expect(spine(page, "My notebook blog")).toHaveCount(0);
  await page.reload();
  await expect(spine(page, "Sally's Baking Addiction")).toBeVisible();
  await expect(spine(page, "My notebook blog")).toHaveCount(0);
});
