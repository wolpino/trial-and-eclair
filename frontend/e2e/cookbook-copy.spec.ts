import { expect, test } from "@playwright/test";

// A cookbook entry is a copy: the public page shows the recipe as it was added,
// even after the Lab recipe changes.
test("a published cookbook shows each recipe's copy, unchanged by later Lab edits", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("dev");
  await page.getByLabel("Password").fill("devpass123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).not.toHaveURL(/\/login/);

  const cookies = await page.context().cookies();
  const csrf = cookies.find((cookie) => cookie.name === "csrftoken")?.value ?? "";
  const api = page.request;
  const stamp = Date.now();

  async function send(method: "post" | "patch", url: string, data: Record<string, unknown>) {
    const response = await api[method](url, { data, headers: { "X-CSRFToken": csrf } });
    expect(response.ok(), `${method} ${url}`).toBe(true);
    return response.json();
  }

  const title = `Copy muffin ${stamp}`;
  const recipe = await send("post", "/api/v1/recipes/", { title });
  const versionId: string = recipe.current_version.id;
  const ingredient = await send("post", "/api/v1/ingredients/", { name: `Copy cornmeal ${stamp}` });
  const line = await send("post", `/api/v1/versions/${versionId}/ingredient-lines/`, {
    ingredient: ingredient.id,
    quantity: "1.5",
    unit: "cup",
  });
  const step = await send("post", `/api/v1/versions/${versionId}/steps/`, {
    order: 1,
    body: "Whisk the dry things together.",
  });

  const cookbook = await send("post", "/api/v1/cookbooks/", { title: `Copy book ${stamp}` });
  await send("post", `/api/v1/cookbooks/${cookbook.id}/entries/`, { recipe: recipe.id });
  const slug = `copy-book-${stamp}`;
  await send("post", `/api/v1/cookbooks/${cookbook.id}/publish/`, { slug });

  const entry = page.locator(".public-cookbook-entry");

  async function expectOriginalCopy() {
    await expect(entry).toHaveCount(1);
    await expect(entry.getByRole("heading", { level: 2 })).toHaveText(title);
    await expect(entry.getByRole("listitem").filter({ hasText: `Copy cornmeal ${stamp}` })).toContainText(
      "1½ cups",
    );
    await expect(entry).toContainText("Whisk the dry things together.");
    await expect(entry).not.toContainText("Changed in the Lab");
  }

  await page.goto(`/c/${slug}`);
  await expectOriginalCopy();

  await send("patch", `/api/v1/recipes/${recipe.id}/versions/${versionId}/`, {
    title: "Changed in the Lab",
  });
  await send("patch", `/api/v1/versions/${versionId}/ingredient-lines/${line.id}/`, {
    quantity: "4",
  });
  await send("patch", `/api/v1/versions/${versionId}/steps/${step.id}/`, {
    body: "Changed in the Lab: new step.",
  });

  await page.reload();
  await expectOriginalCopy();
  await expect(entry).not.toContainText("4 cups");
});

// When the Lab recipe is deleted, the entry keeps its copy (the API sends
// "recipe": null) and the developer's cookbook page shows it without a link.
test("a cookbook entry whose Lab recipe was deleted still shows its copy, with no Lab link", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("dev");
  await page.getByLabel("Password").fill("devpass123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).not.toHaveURL(/\/login/);

  const cookies = await page.context().cookies();
  const csrf = cookies.find((cookie) => cookie.name === "csrftoken")?.value ?? "";
  const headers = { "X-CSRFToken": csrf };
  const api = page.request;
  const stamp = Date.now();

  async function post(url: string, data: Record<string, unknown>) {
    const response = await api.post(url, { data, headers });
    expect(response.ok(), `post ${url}`).toBe(true);
    return response.json();
  }

  const title = `Orphan scone ${stamp}`;
  const recipe = await post("/api/v1/recipes/", { title });
  await post(`/api/v1/recipes/${recipe.id}/publish/`, { slug: `orphan-scone-${stamp}` });
  const cookbook = await post("/api/v1/cookbooks/", { title: `Orphan book ${stamp}` });
  const entryRow = await post(`/api/v1/cookbooks/${cookbook.id}/entries/`, { recipe: recipe.id });
  expect(entryRow.recipe).toBe(recipe.id);

  const card = page.locator(".cookbook-entry-card");

  // Collect errors from the cookbook page only (the logged-out login page
  // has an expected 403 from /auth/me/).
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(`/developer/cookbooks/${cookbook.id}`);
  await expect(card).toHaveCount(1);
  await expect(card.getByRole("link", { name: "Public recipe" })).toBeVisible();

  const deleted = await api.delete(`/api/v1/recipes/${recipe.id}/`, { headers });
  expect(deleted.status()).toBe(204);

  const reread = await api.get(`/api/v1/cookbooks/${cookbook.id}/`);
  expect((await reread.json()).entries[0].recipe).toBeNull();

  await page.reload();
  await expect(card).toHaveCount(1);
  await expect(card.getByRole("heading", { level: 3 })).toHaveText(title);
  await expect(card.getByRole("link")).toHaveCount(0);
  await expect(card).toContainText("Not on public web");
  expect(consoleErrors).toEqual([]);
});
