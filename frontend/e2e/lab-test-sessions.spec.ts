import { expect, test, type Cookie, type Page } from "@playwright/test";

// The Lab is a wide-screen view.
test.use({ viewport: { width: 1280, height: 900 } });

// Login is throttled (20 an hour per address), so tests share one session.
let sessionCookies: Cookie[] | null = null;

async function logIn(page: Page) {
  if (sessionCookies) {
    await page.context().addCookies(sessionCookies);
    return;
  }
  await page.goto("/login");
  await page.getByLabel("Username").fill("dev");
  await page.getByLabel("Password").fill("devpass123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).not.toHaveURL(/\/login/);
  sessionCookies = await page.context().cookies();
}

/** Makes a fresh Lab recipe through the API and opens it. */
async function openNewLabRecipe(page: Page, title: string) {
  const cookies = await page.context().cookies();
  const csrf = cookies.find((cookie) => cookie.name === "csrftoken")?.value ?? "";
  const response = await page.request.post("/api/v1/recipes/", {
    data: { title },
    headers: { "X-CSRFToken": csrf },
  });
  expect(response.status()).toBe(201);
  const recipe = (await response.json()) as { id: string };
  await page.goto(`/developer/lab/${recipe.id}`);
  return page.getByRole("region", { name: "Bake sessions" });
}

test("a developer logs oven temperature, bake time and rating, and they stay after a reload", async ({
  page,
}) => {
  await logIn(page);
  const sessions = await openNewLabRecipe(page, `Bake fields ${Date.now()}`);
  await expect(sessions.getByText("No bake sessions logged yet.")).toBeVisible();

  await sessions.getByLabel("Session notes").fill("Golden edges");
  await sessions.getByLabel("Oven temperature").fill("350");
  await sessions.getByLabel("Temperature unit").selectOption("F");
  await sessions.getByLabel("Bake time (minutes)").fill("25");
  await sessions.getByRole("radio", { name: "4 stars" }).check();
  await sessions.getByRole("button", { name: "Log bake session" }).click();

  const entry = sessions.locator(".lab-log-entry").first();
  await expect(entry).toContainText("Golden edges");
  await expect(entry).toContainText("350 °F");
  await expect(entry).toContainText("25 min");
  await expect(entry.getByRole("img", { name: "Rated 4 of 5" })).toBeVisible();

  await page.reload();
  const reloaded = page.getByRole("region", { name: "Bake sessions" }).locator(".lab-log-entry").first();
  await expect(reloaded).toContainText("Golden edges");
  await expect(reloaded).toContainText("350 °F");
  await expect(reloaded).toContainText("25 min");
  await expect(reloaded.getByRole("img", { name: "Rated 4 of 5" })).toBeVisible();
});

test("a bake session with no temperature, time or rating still saves", async ({ page }) => {
  await logIn(page);
  const sessions = await openNewLabRecipe(page, `Bare session ${Date.now()}`);
  await expect(sessions.getByText("No bake sessions logged yet.")).toBeVisible();

  await sessions.getByLabel("Session notes").fill("Just notes this time");
  await sessions.getByRole("button", { name: "Log bake session" }).click();

  const entry = sessions.locator(".lab-log-entry").first();
  await expect(entry).toContainText("Just notes this time");
  await expect(entry).not.toContainText("°");
  await expect(entry).not.toContainText("min");
  await expect(entry.getByRole("img", { name: /^Rated/ })).toHaveCount(0);

  await page.reload();
  await expect(
    page.getByRole("region", { name: "Bake sessions" }).locator(".lab-log-entry").first(),
  ).toContainText("Just notes this time");
});
