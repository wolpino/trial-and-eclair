import { expect, test, type Cookie, type Page } from "@playwright/test";

import type { CollectionRecipe, IngredientLine } from "../src/api/collection";
import { matchesSearch } from "../src/lib/boxSearch";

// Recipe box search by title or ingredient (Design Bash B1; issue #90).

function line(changes: Partial<IngredientLine>): IngredientLine {
  return {
    id: "line",
    ingredient: null,
    ingredient_name: null,
    raw_text: "",
    quantity: null,
    unit: "",
    custom_unit: "",
    prep_note: "",
    substitution_note: "",
    sort_order: 0,
    ...changes,
  };
}

function recipe(title: string, lines: IngredientLine[]): CollectionRecipe {
  return { title, ingredient_lines: lines } as CollectionRecipe;
}

const SHORTBREAD = recipe("Rosemary Shortbread", [
  line({ ingredient: "i1", ingredient_name: "Unsalted butter", quantity: "1", unit: "cup" }),
  line({ ingredient: "i2", ingredient_name: "All-purpose flour", quantity: "2", unit: "cup" }),
]);
const BRULEE = recipe("Crème Brûlée", [line({ raw_text: "2 cups heavy cream" })]);
const SOUP = recipe("Tomato Soup", [
  line({ raw_text: "2 tbsp butter" }),
  line({ raw_text: "1/2 cup Jalapeño, diced" }),
]);

test.describe("matchesSearch", () => {
  test("matches the title", () => {
    expect(matchesSearch(SHORTBREAD, "shortbread")).toBe(true);
    expect(matchesSearch(SHORTBREAD, "biscotti")).toBe(false);
  });

  test("matches an ingredient name, typed or catalogued", () => {
    expect(matchesSearch(SHORTBREAD, "butter")).toBe(true);
    expect(matchesSearch(SOUP, "butter")).toBe(true);
    expect(matchesSearch(BRULEE, "cream")).toBe(true);
    expect(matchesSearch(BRULEE, "butter")).toBe(false);
  });

  test("ignores case and accents", () => {
    expect(matchesSearch(BRULEE, "CREME BRULEE")).toBe(true);
    expect(matchesSearch(SHORTBREAD, "ROSEMARY")).toBe(true);
    expect(matchesSearch(SOUP, "jalapeno")).toBe(true);
    expect(matchesSearch(recipe("Creme Brulee", []), "crème")).toBe(true);
  });

  test("quantities and units match nothing", () => {
    for (const card of [SHORTBREAD, BRULEE, SOUP]) {
      expect(matchesSearch(card, "2 cups")).toBe(false);
      expect(matchesSearch(card, "tbsp")).toBe(false);
    }
  });
});

// Login is throttled (20 an hour per address), so tests share one session.
let sessionCookies: Cookie[] | null = null;

async function logIn(page: Page) {
  if (!sessionCookies) {
    await page.goto("/");
    await page.getByLabel("Username").fill("cook");
    await page.getByLabel("Password").fill("cookpass123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/recipe-box\/?$/);
    sessionCookies = await page.context().cookies();
    return;
  }
  await page.context().addCookies(sessionCookies);
  await page.goto("/recipe-box");
  await expect(page).toHaveURL(/\/recipe-box\/?$/);
}

function tabs(page: Page) {
  return page.getByRole("group", { name: "Divider tabs" });
}

function results(page: Page) {
  return page.getByRole("list", { name: "Search results" }).getByRole("button");
}

async function openSearch(page: Page) {
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("dialog", { name: "Menu" }).getByRole("button", { name: "Search" }).click();
  const field = page.getByRole("searchbox", { name: "Search recipes" });
  await expect(field).toBeFocused();
  return field;
}

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("search by ingredient, open a result, and clear back to the tabs", async ({ page }) => {
    await page.route("**/api/v1/starter-recipes/", (route) => route.fulfill({ json: [] }));
    await logIn(page);

    const field = await openSearch(page);
    await field.fill("butter");
    // Seed: one title, two ingredient lists, and buttermilk in the soda bread.
    // Yogurt Cake only says "butter" in its description, so it stays out.
    await expect(results(page)).toHaveText([
      "Brown Butter Blondies",
      "Lemon Bars",
      "Rosemary Shortbread",
      "Weekday Soda Bread",
    ]);
    await expect(tabs(page)).toHaveCount(0);

    await field.fill("LEMON");
    await expect(results(page)).toHaveText(["Lemon Bars"]);

    await field.fill("2 cups");
    await expect(results(page)).toHaveCount(0);
    await expect(page.getByText("No cards match.")).toBeVisible();

    await field.fill("butter");
    await results(page).filter({ hasText: "Rosemary Shortbread" }).click();
    const card = page.getByRole("dialog", { name: "Rosemary Shortbread" });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Close" }).click();
    await expect(card).toHaveCount(0);

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(field).toHaveCount(0);
    await expect(tabs(page).getByRole("button", { name: /^A,/ })).toBeVisible();
  });

  test("starter cards show in results the same way they show in the box", async ({ page }) => {
    // A visitor's box is just the starter cards.
    await page.goto("/recipe-box");
    const field = await openSearch(page);
    await field.fill("butter");
    const soup = results(page).filter({ hasText: "Tomato Soup" });
    await expect(soup).toContainText("Starter");
    await expect(results(page).filter({ hasText: "Banana Bread" })).toContainText("Starter");
    await expect(results(page).filter({ hasText: "Lemon Garlic Chicken Thighs" })).toHaveCount(0);

    await soup.click();
    await expect(page.getByRole("dialog", { name: "Tomato Soup" })).toBeVisible();
  });
});

test.describe("wide screen", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the same search filters the box", async ({ page }) => {
    await logIn(page);
    const index = page.getByRole("tablist", { name: "A–Z index" });
    await expect(index.getByRole("tab", { name: "A" })).toBeVisible();

    await page.getByRole("searchbox", { name: "Search recipes" }).fill("Butter");
    await expect(index.getByRole("tab")).toHaveText(["B", "L", "R", "W"]);
    await index.getByRole("tab", { name: "L" }).click();
    await expect(page.getByRole("button", { name: /^Lemon Bars/ })).toBeVisible();
    await index.getByRole("tab", { name: "R" }).click();
    await expect(page.getByRole("button", { name: /^Rosemary Shortbread/ })).toBeVisible();

    await page.getByRole("searchbox", { name: "Search recipes" }).fill("2 cups");
    await expect(page.getByText("No cards match.")).toBeVisible();

    await page.getByRole("searchbox", { name: "Search recipes" }).fill("");
    await expect(index.getByRole("tab", { name: "A" })).toBeVisible();
  });
});
