import { expect, test, type Page } from "@playwright/test";

async function logIn(page: Page) {
  await page.goto("/");
  await page.getByLabel("Username").fill("cook");
  await page.getByLabel("Password").fill("cookpass123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/?$/);
}

function lid(page: Page) {
  return page.getByRole("region", { name: "Selected recipe" });
}

function tabs(page: Page) {
  return page.getByRole("group", { name: "Divider tabs" }).getByRole("button");
}

test.use({ viewport: { width: 390, height: 844 } });

test("the lid shows the first card and A–Z tabs sit below", async ({ page }) => {
  // The walkthrough seed has no servings, so add some to the first card here.
  await page.route("**/api/v1/recipe-box/", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    const response = await route.fetch();
    const recipes = (await response.json()) as { title: string; servings: number | null }[];
    for (const recipe of recipes) {
      if (recipe.title === "Almond Biscotti") {
        recipe.servings = 6;
      }
    }
    await route.fulfill({ response, json: recipes });
  });
  await logIn(page);

  const card = lid(page);
  await expect(card.getByRole("heading", { name: "Almond Biscotti" })).toBeVisible();
  await expect(card).toContainText("Serves 6");
  await expect(card).toContainText("Prep 25 min");
  await expect(card).toContainText("Cook 45 min");
  await expect(card).toContainText(/almonds/i);
  await expect(card).toContainText("Shape two logs.");

  await expect(tabs(page)).toHaveCount(27);
  await expect(tabs(page).first()).toHaveText("A");
  await expect(tabs(page).last()).toHaveText("#");
  const lidBox = await card.boundingBox();
  const tabBox = await tabs(page).first().boundingBox();
  expect(tabBox!.y).toBeGreaterThan(lidBox!.y + lidBox!.height - 1);
});

test("a tab opens its fan and a fan card goes into the lid", async ({ page }) => {
  await logIn(page);
  const tabL = page.getByRole("button", { name: /^L, 1 card/ });
  await tabL.click();
  await expect(tabL).toHaveAttribute("aria-expanded", "true");

  const fan = page.getByRole("list", { name: "Cards under L" });
  await expect(fan).toBeVisible();
  await fan.getByRole("button", { name: "Lemon Bars" }).click();

  await expect(lid(page).getByRole("heading", { name: "Lemon Bars" })).toBeVisible();
  await expect(fan).toBeHidden();
});

test("the lid opens Card View, which flips front to back", async ({ page }) => {
  await logIn(page);
  await lid(page).click();

  const cardView = page.getByRole("dialog", { name: "Almond Biscotti" });
  await expect(cardView).toBeVisible();
  await expect(cardView.getByRole("heading", { name: "Ingredients" })).toBeVisible();

  await cardView.getByRole("button", { name: "Flip card" }).click();
  await expect(cardView.getByRole("heading", { name: "Notes" })).toBeVisible();
  await expect(cardView).toContainText("Twice-baked, for dunking.");
  await expect(cardView.getByRole("heading", { name: "Source" })).toBeVisible();
  await expect(cardView.getByRole("heading", { name: "Ingredients" })).toBeHidden();

  await cardView.getByRole("button", { name: "Flip card" }).click();
  await expect(cardView.getByRole("heading", { name: "Ingredients" })).toBeVisible();

  await cardView.getByRole("button", { name: "Close" }).click();
  await expect(cardView).toBeHidden();
});

test("Reduce Motion turns the flip into a crossfade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await logIn(page);
  await lid(page).click();
  const face = page.locator(".phone-box-cardview__face");
  await expect(face).toBeVisible();
  const animation = await face.evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("phone-box-fade");
});

test("empty tabs are disabled and every tab is big enough to tap", async ({ page }) => {
  await logIn(page);
  await expect(page.getByRole("button", { name: /^X, 0 cards/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /^#, 0 cards/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /^A, 1 card/ })).toBeEnabled();

  const count = await tabs(page).count();
  for (let i = 0; i < count; i += 1) {
    const box = await tabs(page).nth(i).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(48);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
});

test("nothing scrolls sideways at 360×640", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await logIn(page);
  await expect(lid(page)).toBeVisible();
  const overflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(await overflow()).toBeLessThanOrEqual(0);

  await page.getByRole("button", { name: /^P, / }).click();
  await expect(page.getByRole("list", { name: "Cards under P" })).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
});

test("an empty box shows an Add your first recipe card in the lid", async ({ page }) => {
  await page.route("**/api/v1/recipe-box/", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: [] });
      return;
    }
    await route.fallback();
  });
  await logIn(page);

  const addFirst = lid(page).getByRole("button", { name: "Add your first recipe" });
  await expect(addFirst).toBeVisible();
  await addFirst.click();
  await expect(page.getByRole("button", { name: "Add card" })).toBeVisible();
  for (const tab of await tabs(page).all()) {
    await expect(tab).toBeDisabled();
  }
});

test("Simple List shows the title list and keeps open, add and edit working", async ({
  page,
}) => {
  await logIn(page);
  await page.getByRole("button", { name: "Simple list" }).click();
  await expect(lid(page)).toBeHidden();

  // Open
  await page.locator(".recipe-box-index__row-title", { hasText: "Almond Biscotti" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/.+/);
  await expect(page.locator(".recipe-box-card__title-input")).toHaveValue("Almond Biscotti");
  await page.getByRole("link", { name: "Back to list" }).click();
  await expect(page.getByRole("button", { name: "Simple list" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  // Add
  const title = `Zucchini Slaw ${Date.now()}`;
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Step").fill("Shred and salt the zucchini.");
  await page.getByRole("button", { name: "Add card" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/.+/);
  const titleInput = page.locator(".recipe-box-card__title-input");
  await expect(titleInput).toHaveValue(title);

  // Edit
  await titleInput.fill(`${title} edited`);
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("link", { name: "Back to list" }).click();
  await expect(
    page.locator(".recipe-box-index__row-title", { hasText: `${title} edited` }).first(),
  ).toBeAttached();
});
