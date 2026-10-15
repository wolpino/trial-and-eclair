import { expect, test } from "@playwright/test";

test("signs in on the recipe card and opens a recipe", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await page.getByLabel("Username").fill("cook");
  await page.getByLabel("Password").fill("cookpass123");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/recipe-box\/?$/);
  await expect(page.getByRole("heading", { name: "Recipe box" })).toBeVisible();
  await page.locator(".recipe-box-index__row-title", { hasText: "Almond Biscotti" }).click();

  await expect(page).toHaveURL(/\/recipe-box\/.+/);
  await expect(page.getByRole("link", { name: "Back to list" })).toBeVisible();
  await expect(page.locator(".recipe-box-card__title-input")).toHaveValue("Almond Biscotti");
});

test("reads a public recipe", async ({ page }) => {
  await page.goto("/r/raisin-bran-muffins");
  await expect(page.getByRole("heading", { name: "Raisin Bran Muffins" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ingredients" })).toBeVisible();
  await expect(page.getByText("Raisin bran cereal", { exact: true })).toBeVisible();
});
