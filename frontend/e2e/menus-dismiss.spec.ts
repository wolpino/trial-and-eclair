import { expect, test, type Cookie, type Page } from "@playwright/test";

// Login is throttled (20 an hour per address), so tests share one session.
let sessionCookies: Cookie[] | null = null;

async function logIn(page: Page, path: string) {
  if (!sessionCookies) {
    await page.goto("/");
    await page.getByLabel("Username").fill("dev");
    await page.getByLabel("Password").fill("devpass123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).not.toHaveURL(/\/(login)?$/);
    sessionCookies = await page.context().cookies();
  } else {
    await page.context().addCookies(sessionCookies);
  }
  await page.goto(path);
}

function details(page: Page, name: string) {
  return page.locator("details", { has: page.locator("summary", { hasText: name }) });
}

test.use({ viewport: { width: 390, height: 844 } });

// On /references, since the cork board's Pin note button sits over Account on a phone.
test.describe("header menus", () => {
  for (const name of ["Account", "More"]) {
    test(`${name} closes on an outside click and on Escape, not on a click inside`, async ({
      page,
    }) => {
      await logIn(page, "/references");
      const menu = details(page, name);
      const summary = menu.locator("summary");

      await summary.click();
      await expect(menu).toHaveAttribute("open", "");
      await menu.locator(".frame-nav__panel").click({ position: { x: 4, y: 4 } });
      await expect(menu).toHaveAttribute("open", "");

      await page.getByRole("heading", { name: "Reference shelf" }).click();
      await expect(menu).not.toHaveAttribute("open");

      await summary.click();
      await expect(menu).toHaveAttribute("open", "");
      await page.keyboard.press("Escape");
      await expect(menu).not.toHaveAttribute("open");
    });
  }

  test("opening one header menu closes the other", async ({ page }) => {
    await logIn(page, "/references");
    const account = details(page, "Account");
    const more = details(page, "More");

    await account.locator("summary").click();
    await expect(account).toHaveAttribute("open", "");
    await more.locator("summary").click();
    await expect(more).toHaveAttribute("open", "");
    await expect(account).not.toHaveAttribute("open");

    await account.locator("summary").click();
    await expect(account).toHaveAttribute("open", "");
    await expect(more).not.toHaveAttribute("open");
  });
});

test("the A–Z fan closes on an outside click and stays open on a click inside", async ({
  page,
}) => {
  await logIn(page, "/recipe-box");
  const tab = page.getByRole("group", { name: "Divider tabs" }).getByRole("button").first();
  const fan = page.locator("#phone-box-fan");

  await tab.click();
  await expect(fan).toBeVisible();
  await fan.click({ position: { x: 2, y: 2 } });
  await expect(fan).toBeVisible();

  await page.locator(".phone-box-front").click();
  await expect(fan).toBeHidden();
  await expect(tab).toHaveAttribute("aria-expanded", "false");
});

test.describe("cork board drawers", () => {
  test("the Pin idea drawer closes on Escape", async ({ page }) => {
    await logIn(page, "/developer");
    await page.getByRole("button", { name: "Pin new idea" }).click();
    const drawer = page.getByRole("dialog", { name: "Pin a new idea" });
    await expect(drawer).toBeVisible();
    await drawer.getByLabel("Title").click();
    await expect(drawer).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("the Edit idea drawer closes on Escape", async ({ page }) => {
    await logIn(page, "/developer");
    await page
      .getByRole("region", { name: "Pinned ideas" })
      .getByRole("button")
      .first()
      .click();
    const drawer = page.getByRole("dialog", { name: "Note" });
    await expect(drawer).toBeVisible();
    await drawer.getByLabel("Notes").click();
    await expect(drawer).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });
});

test("the Lab Tools panel on a phone ignores outside clicks and Escape", async ({ page }) => {
  await logIn(page, "/developer/lab");
  await page.locator('a[href^="/developer/lab/"]').first().click();
  const tools = page.locator("details.lab-phone-tools");
  await tools.locator("summary").click();
  await expect(tools).toHaveAttribute("open", "");

  await page.getByRole("button", { name: "Ingredients", exact: true }).click();
  await expect(tools).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(tools).toHaveAttribute("open", "");
});
