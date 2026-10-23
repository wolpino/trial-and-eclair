import { expect, test, type Cookie, type Locator, type Page } from "@playwright/test";

// Focused views open over a faded kitchen, with one "back to kitchen" (decision 004, issue #85).

test.use({ viewport: { width: 1280, height: 800 } });

// Login is throttled (20 an hour per address), so the tests share one session.
let session: Cookie[] | null = null;

async function logIn(page: Page) {
  if (!session) {
    await page.goto("/login");
    await page.getByLabel("Username").fill("dev");
    await page.getByLabel("Password").fill("devpass123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).not.toHaveURL(/\/login/);
    session = await page.context().cookies();
  } else {
    await page.context().addCookies(session);
  }
}

function backdrop(page: Page): Locator {
  return page.locator(".kitchen-backdrop");
}

function backToKitchen(page: Page): Locator {
  return page.getByRole("link", { name: "Back to kitchen" });
}

async function expectFocusedView(page: Page) {
  // The kitchen is behind the view, faded and out of reach.
  await expect(backdrop(page)).toBeVisible();
  await expect(backdrop(page)).toHaveAttribute("aria-hidden", "true");
  const opacity = await backdrop(page).evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(opacity).toBeGreaterThan(0);
  expect(opacity).toBeLessThan(1);
  await expect(page.getByRole("main", { name: "Kitchen" })).toHaveCount(0);

  // One way back, and no Back/Forward arrows.
  await expect(backToKitchen(page)).toHaveCount(1);
  await expect(backToKitchen(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Forward", exact: true })).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Page history" })).toHaveCount(0);
}

const views: [string, string][] = [
  ["/developer", "Cork board"],
  ["/developer/lab", "Lab"],
  ["/developer/cookbooks", "Cookbooks"],
  ["/references", "Reference shelf"],
  ["/recipe-box", "Recipe box"],
];

test("each focused view sits over the faded kitchen and goes back to the kitchen", async ({
  page,
}) => {
  await logIn(page);
  for (const [path, heading] of views) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expectFocusedView(page);

    await backToKitchen(page).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("main", { name: "Kitchen" })).toBeVisible();
    await expect(backdrop(page)).toHaveCount(0);
  }
});

test("a deep link loads straight into its view and the browser's back button works", async ({
  page,
}) => {
  await logIn(page);
  const response = await page.request.get("/api/v1/recipes/");
  expect(response.ok()).toBe(true);
  const recipes = (await response.json()) as { id: number | string }[];
  expect(recipes.length).toBeGreaterThan(0);
  const deepLink = `/developer/lab/${recipes[0].id}`;

  await page.goto("/");
  await expect(page.getByRole("main", { name: "Kitchen" })).toBeVisible();
  await page.goto(deepLink);
  await expect(page).toHaveURL(new RegExp(`${deepLink}$`));
  await expectFocusedView(page);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("main", { name: "Kitchen" })).toBeVisible();

  // In-app: open the notebook from the kitchen, then the browser's back returns home.
  await page.getByRole("link", { name: "Lab notebook" }).click();
  await expect(page).toHaveURL(/\/developer\/lab$/);
  await expectFocusedView(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("main", { name: "Kitchen" })).toBeVisible();
});

async function viewAnimation(page: Page) {
  return page.locator(".kitchen-view").evaluate((el) => {
    const style = getComputedStyle(el);
    return { name: style.animationName, duration: parseFloat(style.animationDuration) };
  });
}

test("the view zooms in, and with reduced motion it only fades briefly or switches", async ({
  page,
}) => {
  await logIn(page);
  await page.goto("/references");
  await expectFocusedView(page);
  const normal = await viewAnimation(page);
  expect(normal.name).toBe("kitchen-view-zoom");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/references");
  await expectFocusedView(page);
  const reduced = await viewAnimation(page);
  expect(reduced.name).not.toBe("kitchen-view-zoom");
  if (reduced.name !== "none") {
    expect(reduced.name).toBe("kitchen-view-fade");
    expect(reduced.duration).toBeLessThanOrEqual(0.2);
  }
});
