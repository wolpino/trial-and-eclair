import { expect, test, type Cookie, type Locator, type Page } from "@playwright/test";

// Home cooks open a read-only sample board and notebook from the kitchen (issue #86).
// Sample content comes from seed/data/sample_kitchen.json (load_sample_kitchen).

test.use({ viewport: { width: 1280, height: 800 } });

// Login is throttled (20 an hour per address), so tests share one session.
let cookSession: Cookie[] | null = null;

async function openKitchenAsCook(page: Page) {
  if (!cookSession) {
    await page.goto("/login");
    await page.getByLabel("Username").fill("cook");
    await page.getByLabel("Password").fill("cookpass123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).not.toHaveURL(/\/login/);
    cookSession = await page.context().cookies();
  } else {
    await page.context().addCookies(cookSession);
  }
  await page.goto("/");
  await expect(kitchen(page)).toBeVisible();
}

function kitchen(page: Page): Locator {
  return page.getByRole("main", { name: "Kitchen" });
}

/** Nothing in the page can create, edit, pin or delete (filters may stay). */
async function expectNoEditControls(main: Locator) {
  await expect(main.locator("input:enabled, textarea:enabled")).toHaveCount(0);
  await expect(
    main.getByRole("button", {
      name: /^(pin|delete|save|publish|log entry|open notebook|remove|import|add)/i,
    }),
  ).toHaveCount(0);
}

test("a home cook opens the sample cork board from the kitchen", async ({ page }) => {
  await openKitchenAsCook(page);
  const board = kitchen(page).getByRole("link", { name: "Cork board" });
  await expect(kitchen(page).getByRole("button", { name: /locked/ })).toHaveCount(0);

  await board.click();

  await expect(page).toHaveURL(/\/sample\/board$/);
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Cork board" })).toBeVisible();
  await expect(main.getByText(/sample board/i)).toBeVisible();
  await expect(main.getByText("Miso caramel sauce")).toBeVisible();
  await expect(main.getByText("Lemon olive oil cake")).toBeVisible();
  await expectNoEditControls(main);
  // Notes are not buttons: clicking one opens no edit drawer.
  await main.getByText("Miso caramel sauce").click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a home cook opens the sample notebook and reads a recipe", async ({ page }) => {
  await openKitchenAsCook(page);

  await kitchen(page).getByRole("link", { name: "Lab notebook" }).click();

  await expect(page).toHaveURL(/\/sample\/lab$/);
  const shelf = page.getByRole("main");
  await expect(shelf.getByText(/sample notebook/i)).toBeVisible();
  await expect(shelf.getByRole("link", { name: /Lemon Olive Oil Cake/ })).toBeVisible();
  await expectNoEditControls(shelf);

  await shelf.getByRole("link", { name: /Brown Butter Cornbread/ }).click();

  await expect(page).toHaveURL(/\/sample\/lab\/[^/]+$/);
  const notebook = page.getByRole("main");
  await expect(notebook.getByRole("textbox", { name: /title/i }).first()).toHaveValue(
    "Brown Butter Cornbread",
  );
  await expect(notebook.getByRole("region", { name: "Ingredients" }).getByText(/honey/i)).toBeVisible();
  await expect(notebook.getByText(/Brown the butter in the skillet/)).toBeVisible();
  await expect(notebook.getByText("Much nuttier. Edges crisp, middle moist.")).toBeVisible();
  await expectNoEditControls(notebook);

  await notebook.getByRole("link", { name: /Lab shelf/ }).click();
  await expect(page).toHaveURL(/\/sample\/lab$/);
});

test("a home cook reaches the sample board with the keyboard", async ({ page }) => {
  await openKitchenAsCook(page);
  const board = kitchen(page).getByRole("link", { name: "Cork board" });

  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("Tab");
    if (await board.evaluate((el) => el === document.activeElement)) {
      break;
    }
  }
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/sample\/board$/);
});
