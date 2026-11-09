import { expect, test, type Cookie, type Locator, type Page } from "@playwright/test";

// Focused views have a places menu top-left and the account menu top-right,
// and no top nav strip (decision 004, issue #136).

test.use({ viewport: { width: 1280, height: 800 } });

// Login is throttled (20 an hour per address), so tests share one session per user.
const sessions: Record<string, Cookie[]> = {};

async function logIn(page: Page, username: "dev" | "cook") {
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
}

function kitchenLink(page: Page): Locator {
  return page.getByRole("link", { name: "Back to kitchen" });
}

function placesButton(page: Page): Locator {
  return page.getByRole("button", { name: "Places" });
}

function placesList(page: Page): Locator {
  return page.getByRole("list", { name: "Places" });
}

function isFocused(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => el === document.activeElement);
}

const views: [string, string][] = [
  ["/developer", "Cork board"],
  ["/developer/lab", "Lab"],
  ["/developer/cookbooks", "Cookbooks"],
  ["/references", "Reference shelf"],
  ["/recipe-box", "Recipe box"],
];

test("no focused view has the top nav strip; Kitchen goes home", async ({ page }) => {
  await logIn(page, "dev");
  for (const [path, heading] of views) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.locator(".frame-nav")).toHaveCount(0);
    // The strip's place links are not on the page until the places menu opens.
    for (const name of ["Box", "Lab", "Board", "Cookbooks", "Shelf", "More"]) {
      await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
    }
    await expect(placesButton(page)).toHaveAttribute("aria-expanded", "false");
    await expect(kitchenLink(page)).toHaveText("← Kitchen");

    await kitchenLink(page).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("main", { name: "Kitchen" })).toBeVisible();
  }
});

test("from the Lab, the places menu goes straight to the cork board", async ({ page }) => {
  await logIn(page, "dev");
  await page.goto("/developer/lab");
  await expect(page.getByRole("heading", { level: 1, name: "Lab" })).toBeVisible();

  const visited: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      visited.push(new URL(frame.url()).pathname);
    }
  });

  await placesButton(page).click();
  await expect(placesButton(page)).toHaveAttribute("aria-expanded", "true");
  await expect(placesList(page).getByRole("link")).toHaveText([
    "Box",
    "Lab",
    "Board",
    "Cookbooks",
    "Shelf",
  ]);
  await expect(placesList(page).getByRole("link", { name: "Lab" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await placesList(page).getByRole("link", { name: "Board" }).click();
  await expect(page).toHaveURL(/\/developer$/);
  await expect(page.getByRole("heading", { level: 1, name: "Cork board" })).toBeVisible();
  await expect(placesButton(page)).toHaveAttribute("aria-expanded", "false");
  expect(visited).not.toContain("/");

  await placesButton(page).click();
  await expect(placesList(page).getByRole("link", { name: "Board" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(placesList(page).getByRole("link", { name: "Lab" })).not.toHaveAttribute(
    "aria-current",
  );
});

test("the places menu works by keyboard and closes on Escape and outside clicks", async ({
  page,
}) => {
  await logIn(page, "dev");
  await page.goto("/references");
  const button = placesButton(page);

  // Open with Enter, move with Tab, choose with Enter.
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  expect(await isFocused(placesList(page).getByRole("link", { name: "Box" }))).toBe(true);
  await page.keyboard.press("Tab");
  expect(await isFocused(placesList(page).getByRole("link", { name: "Lab" }))).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/developer\/lab$/);
  await expect(button).toHaveAttribute("aria-expanded", "false");

  // Space opens it; Escape closes it and focus goes back to the button.
  await button.focus();
  await page.keyboard.press(" ");
  await expect(placesList(page)).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(placesList(page)).toHaveCount(0);
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toBeFocused();

  // An outside click only closes it, and focus goes back to the button.
  await button.click();
  await expect(placesList(page)).toBeVisible();
  await page.getByRole("heading", { level: 1, name: "Lab" }).click();
  await expect(placesList(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/developer\/lab$/);
  // PlacesMenu gives focus back in a setTimeout, so wait for it.
  await expect(button).toBeFocused();
});

test("a home cook sees no developer places, and the account menu top-right logs out", async ({
  page,
}) => {
  await logIn(page, "cook");
  await page.goto("/recipe-box");
  await expect(page.getByRole("heading", { level: 1, name: "Recipe box" })).toBeVisible();

  await placesButton(page).click();
  await expect(placesList(page).getByRole("link")).toHaveText(["Box", "Shelf"]);
  await expect(placesList(page).getByRole("link", { name: "Box" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.keyboard.press("Escape");

  const account = page.getByText("Account", { exact: true });
  await expect(account).toBeVisible();
  const box = (await account.boundingBox())!;
  expect(box.x + box.width).toBeGreaterThan(1280 - 120);
  expect(box.y).toBeLessThan(80);

  await account.click();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel("Username")).toBeVisible();
});
