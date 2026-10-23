import { expect, test, type Page } from "@playwright/test";

// Uses the seeded cook and baker accounts from the local e2e database.

async function logIn(page: Page, username: string, password: string) {
  await page.goto("/");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/?$/);
}

function spine(page: Page, title: string) {
  return page
    .getByRole("list", { name: "Reference shelf" })
    .locator(".reference-spine", { hasText: title });
}

test("defaults show as spines and can be taken off one shelf", async ({ browser }) => {
  const cook = await browser.newPage();
  await logIn(cook, "cook", "cookpass123");
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

  const baker = await browser.newPage();
  await logIn(baker, "baker", "bakerpass123");
  await baker.goto("/references");
  await expect(spine(baker, "King Arthur Baking recipes")).toBeVisible();
});

test("a personal reference can still be deleted", async ({ page }) => {
  await logIn(page, "cook", "cookpass123");
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
