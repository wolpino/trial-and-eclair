import { expect, test, type Page } from "@playwright/test";

import { bakersPercentages, gramsOf, scaledQuantity } from "../src/lib/bakersPercent";

function line(name: string, quantity: string | null, unit = "", custom_unit = "") {
  return { ingredient_name: name, quantity, unit, custom_unit };
}

test.describe("bakersPercent", () => {
  test("500 g flour and 350 g water give 100% and 70%", () => {
    const result = bakersPercentages([
      line("Bread flour", "500", "gram"),
      line("water", "350", "gram"),
    ]);
    expect(result.flourGrams).toBe(500);
    expect(result.rows.map((row) => row.percent)).toEqual([100, 70]);
  });

  test("two flour lines add up", () => {
    const result = bakersPercentages([
      line("Bread flour", "400", "gram"),
      line("Whole wheat flour", "100", "gram"),
      line("salt", "10", "gram"),
    ]);
    expect(result.flourGrams).toBe(500);
    expect(result.rows.map((row) => row.percent)).toEqual([80, 20, 2]);
  });

  test("oz, lb and kg convert to grams for the maths", () => {
    expect(gramsOf(line("butter", "1", "ounce"))).toBeCloseTo(28.35, 2);
    expect(gramsOf(line("flour", "1", "pound"))).toBeCloseTo(453.59, 2);
    expect(gramsOf(line("flour", "1", "kilogram"))).toBe(1000);
    const result = bakersPercentages([line("flour", "1", "pound"), line("butter", "4", "ounce")]);
    expect(result.rows[1].percent).toBeCloseTo(25, 5);
  });

  test("a cups line or a line with no unit is flagged, not scaled", () => {
    const result = bakersPercentages([
      line("flour", "500", "gram"),
      line("milk", "2", "cup"),
      line("eggs", "2"),
      line("garlic", "2", "", "cloves"),
    ]);
    expect(result.rows.map((row) => row.flagged)).toEqual([false, true, true, true]);
    expect(result.rows[1].percent).toBeNull();
    expect(scaledQuantity(line("milk", "2", "cup"), 2)).toBeNull();
    expect(scaledQuantity(line("eggs", "2"), 2)).toBeNull();
    expect(scaledQuantity(line("flour", "500", "gram"), 2)).toBe("1000");
  });

  test("with no flour line there are no percentages", () => {
    const result = bakersPercentages([line("water", "350", "gram")]);
    expect(result.flourGrams).toBe(0);
    expect(result.rows[0].percent).toBeNull();
  });

  test("the developer can choose which lines count as flour", () => {
    const lines = [line("Bread flour", "500", "gram"), line("rye meal", "500", "gram")];
    const result = bakersPercentages(lines, [true, true]);
    expect(result.flourGrams).toBe(1000);
    expect(result.rows.map((row) => row.percent)).toEqual([50, 50]);
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

async function seedLabRecipe(
  page: Page,
  title: string,
  lines: { name: string; quantity: string; unit: string }[],
): Promise<string> {
  const lab = await post<{ id: string; current_version: { id: string } }>(
    page,
    "/api/v1/recipes/",
    { title },
  );
  for (const [index, item] of lines.entries()) {
    const ingredient = await post<{ id: string }>(page, "/api/v1/ingredients/", {
      name: item.name,
    });
    await post(page, `/api/v1/versions/${lab.current_version.id}/ingredient-lines/`, {
      ingredient: ingredient.id,
      quantity: item.quantity,
      unit: item.unit,
      sort_order: index,
    });
  }
  return lab.id;
}

test.describe("Baker's % in the Lab", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("shows percentages and scales weight lines to a new flour weight", async ({ page }) => {
    await signIn(page);
    const id = await seedLabRecipe(page, `Bakers loaf ${Date.now()}`, [
      { name: "bread flour", quantity: "500", unit: "gram" },
      { name: "water", quantity: "350", unit: "gram" },
      { name: "salt", quantity: "10", unit: "gram" },
      { name: "honey", quantity: "2", unit: "tablespoon" },
    ]);

    await page.goto(`/developer/lab/${id}`);
    await page.getByRole("button", { name: "Baker's %" }).click();
    const panel = page
      .getByRole("dialog")
      .filter({ has: page.getByRole("heading", { name: "Baker's %" }) });
    await expect(panel).toBeVisible();

    const row = (name: string) => panel.getByRole("row").filter({ hasText: name });
    await expect(row("bread flour")).toContainText("100%");
    await expect(row("water")).toContainText("70%");
    await expect(row("salt")).toContainText("2%");
    await expect(row("honey")).toContainText("Not by weight");

    await panel.getByLabel("Flour weight (g)").fill("1000");
    await expect(row("bread flour")).toContainText("1000 g");
    await expect(row("water")).toContainText("700 g");
    await expect(row("salt")).toContainText("20 g");
    await expect(row("honey")).toContainText("2 tbsp");
    await expect(row("honey")).not.toContainText("4 tbsp");
  });

  test("says so when there is no flour line", async ({ page }) => {
    await signIn(page);
    const id = await seedLabRecipe(page, `No flour ${Date.now()}`, [
      { name: "cream", quantity: "200", unit: "gram" },
    ]);

    await page.goto(`/developer/lab/${id}`);
    await page.getByRole("button", { name: "Baker's %" }).click();
    const panel = page
      .getByRole("dialog")
      .filter({ has: page.getByRole("heading", { name: "Baker's %" }) });
    await expect(panel.getByText(/No flour by weight/)).toBeVisible();
    await expect(panel).not.toContainText("NaN");
    await expect(panel).not.toContainText("Infinity");
  });
});
