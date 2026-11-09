import { expect, test } from "@playwright/test";

test("a developer puts a cookbook on the shelf and it sticks", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("dev");
  await page.getByLabel("Password").fill("devpass123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).not.toHaveURL(/\/login/);

  await page.goto("/developer/cookbooks");
  const onShelf = page.getByRole("checkbox", { name: "On shelf: Summer tests" });
  await expect(onShelf).toBeVisible();
  const before = await onShelf.isChecked();

  await onShelf.setChecked(!before);
  await expect(onShelf).toBeEnabled();
  await page.reload();
  await expect(onShelf).toBeChecked({ checked: !before });

  // Put it back so reruns against the same server start the same way.
  await onShelf.setChecked(before);
  await expect(onShelf).toBeEnabled();
  await page.reload();
  await expect(onShelf).toBeChecked({ checked: before });
});

test("a developer with no Lab recipes sees what to do first", async ({ page }) => {
  const username = `shelf${Date.now()}`;
  await page.goto("/register");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password", { exact: true }).fill("shelfpass123");
  await page.getByLabel("Confirm password").fill("shelfpass123");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).not.toHaveURL(/\/register/);

  await page.goto("/developer/cookbooks");
  await page.getByRole("button", { name: "Start 14-day developer trial" }).click();
  await expect(page.getByRole("heading", { name: "Cookbooks" })).toBeVisible();

  const empty = page.locator(".cookbooks-empty");
  await expect(empty).toContainText(/add a few Lab recipes first/i);
  await expect(empty).toContainText(/bind them into a cookbook/i);
  await expect(empty.getByRole("link", { name: "Lab" })).toHaveAttribute("href", "/developer/lab");
  await expect(page.locator(".cookbooks-page")).not.toContainText(/\d+\s+(cards?|recipes?)/i);
});
