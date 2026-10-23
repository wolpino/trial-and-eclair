import { expect, test, type Cookie, type Locator, type Page } from "@playwright/test";

// The kitchen scene home on wide screens (decision 004, issue #84).

test.use({ viewport: { width: 1280, height: 800 }, timezoneId: "UTC" });

// Login is throttled (20 an hour per address), so tests share one session per user.
const sessions: Record<string, Cookie[]> = {};

async function openKitchen(page: Page, username: "dev" | "cook") {
  if (!sessions[username]) {
    await page.goto("/login");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(`${username}pass123`);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).not.toHaveURL(/\/login/);
    sessions[username] = await page.context().cookies();
  } else {
    await page.context().addCookies(sessions[username]);
  }
  await page.goto("/");
  await expect(kitchen(page)).toBeVisible();
}

function kitchen(page: Page): Locator {
  return page.getByRole("main", { name: "Kitchen" });
}

function shelf(page: Page): Locator {
  return kitchen(page).getByRole("list", { name: "Shelf" });
}

async function setOnShelf(page: Page, title: string, onShelf: boolean) {
  await page.goto("/developer/cookbooks");
  const box = page.getByRole("checkbox", { name: `On shelf: ${title}` });
  await box.setChecked(onShelf);
  await expect(box).toBeEnabled();
  await expect(box).toBeChecked({ checked: onShelf });
}

/** Presses Tab until the focused element has this accessible name. */
async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((el) => el === document.activeElement)) {
      return;
    }
  }
  throw new Error("Could not reach the object with Tab");
}

test("a developer sees the shelf, board, notebook, box and clock, and each opens its route", async ({
  page,
}) => {
  await openKitchen(page, "dev");
  const k = kitchen(page);

  const objects: [Locator, RegExp][] = [
    [shelf(page).getByRole("link", { name: "References" }), /\/references$/],
    [k.getByRole("link", { name: "Cork board" }), /\/developer$/],
    [k.getByRole("link", { name: "Lab notebook" }), /\/developer\/lab$/],
    [k.getByRole("link", { name: "Recipe box" }), /\/recipe-box$/],
  ];
  await expect(shelf(page)).toBeVisible();
  await expect(k.getByRole("img", { name: /^Clock/ })).toBeVisible();

  for (const [link, url] of objects) {
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(url);
    await page.goto("/");
    await expect(k).toBeVisible();
  }
});

test("the shelf shows only cookbooks set on_shelf", async ({ page }) => {
  await openKitchen(page, "dev");
  const book = shelf(page).getByRole("link", { name: "Cookbook: Summer tests" });

  await setOnShelf(page, "Summer tests", false);
  await page.goto("/");
  await expect(shelf(page).getByRole("link", { name: "References" })).toBeVisible();
  await expect(book).toHaveCount(0);

  await setOnShelf(page, "Summer tests", true);
  await page.goto("/");
  await expect(book).toBeVisible();
  await book.click();
  await expect(page).toHaveURL(/\/developer\/cookbooks\/[^/]+$/);

  // Put it back so reruns against the same server start the same way.
  await setOnShelf(page, "Summer tests", false);
});

test("the clock shows the current hour and minute", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-23T15:07:00Z") });
  await openKitchen(page, "dev");
  const clock = kitchen(page).getByRole("img", { name: /^Clock/ });
  await expect(clock).toHaveAccessibleName("Clock, 3:07 PM");

  await page.clock.runFor(60_000);
  await expect(clock).toHaveAccessibleName("Clock, 3:08 PM");
});

test("the account menu is top-right and the old top nav is gone on /", async ({ page }) => {
  await openKitchen(page, "dev");
  await expect(page.getByRole("navigation", { name: "Places" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);

  const account = page.getByText("Account", { exact: true });
  await expect(account).toBeVisible();
  const box = (await account.boundingBox())!;
  expect(box.x + box.width).toBeGreaterThan(1280 - 120);
  expect(box.y).toBeLessThan(80);

  await account.click();
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
});

test("every object can be reached and opened with the keyboard", async ({ page }) => {
  await openKitchen(page, "dev");
  const k = kitchen(page);

  const objects: [Locator, RegExp][] = [
    [shelf(page).getByRole("link", { name: "References" }), /\/references$/],
    [k.getByRole("link", { name: "Cork board" }), /\/developer$/],
    [k.getByRole("link", { name: "Lab notebook" }), /\/developer\/lab$/],
    [k.getByRole("link", { name: "Recipe box" }), /\/recipe-box$/],
  ];
  for (const [link, url] of objects) {
    await page.goto("/");
    await expect(link).toBeVisible();
    await tabTo(page, link);
    // A visible focus ring.
    const outline = await link.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(url);
  }
});
