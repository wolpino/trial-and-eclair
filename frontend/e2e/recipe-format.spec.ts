import { expect, test, type Page } from "@playwright/test";

import { formatQuantity, ingredientText, quantityWords } from "../src/lib/recipeFormat";

// Decision 003, Ingredient text: one formatter for every screen.
const LINES = [
  { name: "Flour", quantity: "0.75", unit: "cup" },
  { name: "sugar", quantity: "1.5", unit: "cup" },
  { name: "Eggs", quantity: "2", unit: "whole" },
  { name: "butter", quantity: "1", unit: "tablespoon" },
  { name: "milk", quantity: "0.333", unit: "cup" },
  { name: "Dijon mustard", quantity: "1", unit: "teaspoon" },
];

const EXPECTED = [
  "¾ cup flour",
  "1½ cups sugar",
  "2 eggs",
  "1 tbsp butter",
  "⅓ cup milk",
  "1 tsp Dijon mustard",
];

const RAW_LINE = "1 cup butter, softened";

function line(name: string, quantity: string | null, unit = "", custom_unit = "") {
  return { ingredient_name: name, quantity, unit, custom_unit };
}

test.describe("recipeFormat", () => {
  test("prints common cooking fractions, never decimals", () => {
    expect(formatQuantity("0.750")).toBe("¾");
    expect(formatQuantity("1.500")).toBe("1½");
    expect(formatQuantity("0.333")).toBe("⅓");
    expect(formatQuantity("0.667")).toBe("⅔");
    expect(formatQuantity("0.25")).toBe("¼");
    expect(formatQuantity("0.125")).toBe("⅛");
    expect(formatQuantity("2.000")).toBe("2");
    expect(formatQuantity("0.3")).toBe("⅓");
    expect(formatQuantity("0.05")).toBe("⅛");
    expect(formatQuantity("1.97")).toBe("2");
    expect(formatQuantity(null)).toBe("");
  });

  test("says fractions in words", () => {
    expect(quantityWords("0.75")).toBe("three quarters");
    expect(quantityWords("1.5")).toBe("one and a half");
    expect(quantityWords("2.333")).toBe("two and a third");
    expect(quantityWords("2")).toBeNull();
  });

  test("plural units above one, short units unchanged, no whole", () => {
    expect(ingredientText(line("Flour", "2", "cup"))).toBe("2 cups flour");
    expect(ingredientText(line("flour", "1", "cup"))).toBe("1 cup flour");
    expect(ingredientText(line("salt", "0.75", "teaspoon"))).toBe("¾ tsp salt");
    expect(ingredientText(line("oil", "3", "tablespoon"))).toBe("3 tbsp oil");
    expect(ingredientText(line("Eggs", "2", "whole"))).toBe("2 eggs");
    expect(ingredientText(line("cream", "1", "fluid_ounce"))).toBe("1 fl oz cream");
    expect(ingredientText(line("garlic", "2", "", "cloves"))).toBe("2 cloves garlic");
    expect(ingredientText(line("salt", null))).toBe("salt");
  });

  test("lowercases names but keeps deliberate capitals", () => {
    expect(ingredientText(line("Dijon mustard", "1", "teaspoon"))).toBe("1 tsp Dijon mustard");
    expect(ingredientText(line("All-purpose flour", "1", "cup"))).toBe("1 cup all-purpose flour");
    expect(ingredientText(line("Brown Sugar", "1", "cup"))).toBe("1 cup brown sugar");
    expect(ingredientText(line("BBQ sauce", "1", "cup"))).toBe("1 cup BBQ sauce");
  });
});

async function csrfHeader(page: Page): Promise<Record<string, string>> {
  const cookies = await page.context().cookies();
  const token = cookies.find((cookie) => cookie.name === "csrftoken")?.value ?? "";
  return { "X-CSRFToken": token };
}

async function signIn(page: Page) {
  const response = await page.request.post("/api/v1/auth/login/", {
    data: { username: "dev", password: "devpass123" },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
}

async function post<T>(page: Page, url: string, data: unknown): Promise<T> {
  const response = await page.request.post(url, { data, headers: await csrfHeader(page) });
  expect(response.ok(), `${url}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
}

type Seeded = { boxId: string; labId: string; slug: string };

async function seedRecipes(page: Page): Promise<Seeded> {
  const stamp = Date.now();
  const ingredientIds: string[] = [];
  for (const item of LINES) {
    const ingredient = await post<{ id: string }>(page, "/api/v1/ingredients/", {
      name: item.name,
    });
    ingredientIds.push(ingredient.id);
  }
  const butter = await post<{ id: string }>(page, "/api/v1/ingredients/", { name: "butter" });

  const box = await post<{ id: string }>(page, "/api/v1/recipe-box/", {
    title: `Format check box ${stamp}`,
  });
  for (const [index, item] of LINES.entries()) {
    await post(page, `/api/v1/recipe-box/${box.id}/ingredient-lines/`, {
      ingredient: ingredientIds[index],
      quantity: item.quantity,
      unit: item.unit,
      sort_order: index,
    });
  }
  await post(page, `/api/v1/recipe-box/${box.id}/ingredient-lines/`, {
    ingredient: butter.id,
    quantity: "1",
    unit: "cup",
    raw_text: RAW_LINE,
    sort_order: LINES.length,
  });

  const lab = await post<{ id: string; current_version: { id: string } }>(
    page,
    "/api/v1/recipes/",
    { title: `Format check ${stamp}` },
  );
  for (const [index, item] of LINES.entries()) {
    await post(page, `/api/v1/versions/${lab.current_version.id}/ingredient-lines/`, {
      ingredient: ingredientIds[index],
      quantity: item.quantity,
      unit: item.unit,
      sort_order: index,
    });
  }
  const slug = `format-check-${stamp}`;
  await post(page, `/api/v1/recipes/${lab.id}/publish/`, { slug });
  return { boxId: box.id, labId: lab.id, slug };
}

test.describe("ingredient lines on every screen", () => {
  test.describe.configure({ mode: "serial" });
  test.use({ viewport: { width: 1280, height: 900 } });

  let seeded: Seeded;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ baseURL: "http://127.0.0.1:8010" });
    const page = await context.newPage();
    await signIn(page);
    seeded = await seedRecipes(page);
    await context.close();
  });

  test("the wide box card reads like a recipe and keeps raw_text", async ({ page }) => {
    await signIn(page);
    await page.goto(`/recipe-box/${seeded.boxId}`);
    const list = page.locator(".recipe-box-card__ingredients");
    for (const text of EXPECTED) {
      await expect(list.getByText(text, { exact: true })).toBeVisible();
    }
    await expect(list.getByText(RAW_LINE, { exact: true })).toBeVisible();
    await expect(list).not.toContainText("whole");
    await expect(list).not.toContainText(/\d\.\d/);
  });

  test("the notebook recipe view reads like a recipe", async ({ page }) => {
    await signIn(page);
    await page.goto(`/developer/lab/${seeded.labId}`);
    // The list only: the add form's unit picker rightly offers "whole".
    const list = page.getByRole("region", { name: "Ingredients" }).getByRole("list");
    for (const text of EXPECTED) {
      await expect(list.getByText(text, { exact: true })).toBeVisible();
    }
    await expect(list).not.toContainText("whole");
    await expect(list).not.toContainText(/\d\.\d/);
  });

  test("the public recipe page reads like a recipe, fractions in words", async ({ page }) => {
    await page.goto(`/r/${seeded.slug}`);
    const list = page.locator(".ingredient-list");
    for (const text of EXPECTED) {
      await expect(list.getByText(text, { exact: true })).toBeVisible();
    }
    await expect(list).not.toContainText("whole");
    await expect(list).not.toContainText(/\d\.\d/);
    await expect(list.getByRole("img", { name: "three quarters" })).toHaveText("¾");
    await expect(list.getByRole("img", { name: "one and a half" })).toHaveText("1½");
  });

  test("editing a box line saves raw_text", async ({ page }) => {
    await signIn(page);
    await page.goto(`/recipe-box/${seeded.boxId}`);
    const list = page.locator(".recipe-box-card__ingredients");
    await list
      .getByRole("listitem")
      .filter({ hasText: RAW_LINE })
      .getByRole("button", { name: "Edit" })
      .click();
    const input = list.getByRole("textbox", { name: "Ingredient line" });
    await expect(input).toHaveValue(RAW_LINE);
    await input.fill("2 cups butter");
    await list.getByRole("button", { name: "Save line" }).click();
    await expect(list.getByText("2 cups butter", { exact: true })).toBeVisible();

    await page.reload();
    await expect(
      page.locator(".recipe-box-card__ingredients").getByText("2 cups butter", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".recipe-box-card__ingredients")).not.toContainText(RAW_LINE);
  });
});
