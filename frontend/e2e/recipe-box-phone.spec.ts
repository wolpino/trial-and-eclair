import { expect, test, type Cookie, type Page } from "@playwright/test";

async function logInWithForm(page: Page) {
  await page.goto("/");
  await page.getByLabel("Username").fill("cook");
  await page.getByLabel("Password").fill("cookpass123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/?$/);
}

// Login is throttled (20 an hour per address), so tests share one session.
let sessionCookies: Cookie[] | null = null;

async function logIn(page: Page) {
  if (!sessionCookies) {
    await logInWithForm(page);
    sessionCookies = await page.context().cookies();
    return;
  }
  await page.context().addCookies(sessionCookies);
  await page.goto("/recipe-box");
  await expect(page).toHaveURL(/\/recipe-box\/?$/);
}

type SeedRecipe = { id: string; title: string; servings: number | null };

/** Rewrites the GET of the box list before the page sees it. */
async function editBoxList(page: Page, edit: (recipes: SeedRecipe[]) => SeedRecipe[]) {
  await page.route("**/api/v1/recipe-box/", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    const response = await route.fetch();
    const recipes = (await response.json()) as SeedRecipe[];
    await route.fulfill({ response, json: edit(recipes) });
  });
}

/** Rewrites the signed-in user returned by the login and /auth/me/ calls. */
async function editSignedInUser(page: Page, changes: Record<string, string>) {
  for (const path of ["**/api/v1/auth/login/", "**/api/v1/auth/me/"]) {
    await page.route(path, async (route) => {
      const response = await route.fetch();
      if (!response.ok()) {
        await route.fulfill({ response });
        return;
      }
      const user = (await response.json()) as Record<string, unknown>;
      await route.fulfill({ response, json: { ...user, ...changes } });
    });
  }
}

function lid(page: Page) {
  return page.getByRole("region", { name: "Selected recipe" });
}

function tabs(page: Page) {
  return page.getByRole("group", { name: "Divider tabs" }).getByRole("button");
}

function plus(page: Page) {
  return page.getByRole("button", { name: "Add recipe", exact: true });
}

async function openMenu(page: Page) {
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  return menu;
}

test.use({ viewport: { width: 390, height: 844 } });

test("the lid shows the first card and the tabs sit below it", async ({ page }) => {
  // The walkthrough seed has no servings, so add some to the first card here.
  await editBoxList(page, (recipes) =>
    recipes.map((r) => (r.title === "Almond Biscotti" ? { ...r, servings: 6 } : r)),
  );
  await logIn(page);

  const card = lid(page);
  await expect(card.getByRole("heading", { name: "Almond Biscotti" })).toBeVisible();
  await expect(card).toContainText("Serves 6");
  await expect(card).toContainText("Prep 25 min");
  await expect(card).toContainText("Cook 45 min");
  await expect(card).toContainText(/almonds/i);
  await expect(card).toContainText("Shape two logs.");

  const lidBox = await card.boundingBox();
  const tabBox = await tabs(page).first().boundingBox();
  expect(tabBox!.y).toBeGreaterThan(lidBox!.y + lidBox!.height - 1);
});

test("13 or more letters stagger the tabs in two rows, A, C, E… in front", async ({ page }) => {
  await logIn(page);
  // Seed: A B C F G L O P R T V W Y Z (14 letters, no titles outside A–Z).
  await expect(tabs(page)).toHaveText(["A", "B", "C", "F", "G", "L", "O", "P", "R", "T", "V", "W", "Y", "Z"]);

  const boxes = [];
  for (const tab of await tabs(page).all()) {
    boxes.push((await tab.boundingBox())!);
  }
  // Front row (1st, 3rd, …) sits lower than the back row and shares one line.
  expect(boxes[0]!.y).toBeGreaterThan(boxes[1]!.y);
  expect(boxes[2]!.y).toBeCloseTo(boxes[0]!.y, 0);
  expect(boxes[3]!.y).toBeCloseTo(boxes[1]!.y, 0);
  // Back-row tabs sit between their front-row neighbours.
  expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x);
  expect(boxes[1]!.x).toBeLessThan(boxes[2]!.x);
  // The front row covers the back row where they overlap.
  const frontZ = await tabs(page).nth(0).evaluate((el) => Number(getComputedStyle(el).zIndex));
  const backZ = await tabs(page).nth(1).evaluate((el) => Number(getComputedStyle(el).zIndex));
  expect(frontZ).toBeGreaterThan(backZ);
  // The last tab still fits on screen.
  const last = boxes[boxes.length - 1]!;
  expect(last.x + last.width).toBeLessThanOrEqual(390);
});

test("12 or fewer letters keep the tabs in one row, with # only when used", async ({ page }) => {
  await editBoxList(page, (recipes) => {
    const kept = recipes.filter((r) => !/^[BWYZ]/.test(r.title));
    const sample = kept[0]!;
    return [...kept, { ...sample, id: "00000000-0000-4000-8000-000000000777", title: "7-Layer Bars" }];
  });
  await logIn(page);

  await expect(tabs(page)).toHaveText(["A", "C", "F", "G", "L", "O", "P", "R", "T", "V", "#"]);
  const firstY = (await tabs(page).first().boundingBox())!.y;
  for (const tab of await tabs(page).all()) {
    expect((await tab.boundingBox())!.y).toBeCloseTo(firstY, 0);
  }
  await expect(page.getByRole("button", { name: /^#, 1 card/ })).toBeEnabled();
});

test("the phone box has no page header, Back/Forward or bottom bar", async ({ page }) => {
  await logIn(page);
  await expect(lid(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Forward", exact: true })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Places" })).toHaveCount(0);
  await expect(page.getByRole("banner")).toHaveCount(0);

  // The box fills the screen: lid at the top, box front at the bottom.
  const lidBox = (await lid(page).boundingBox())!;
  expect(lidBox.y).toBeLessThan(24);
  const front = (await page.locator(".phone-box-front").boundingBox())!;
  expect(front.y + front.height).toBeGreaterThan(844 - 24);
});

test("Back/Forward are hidden on other phone pages and shown on wide screens", async ({
  page,
}) => {
  await logIn(page);
  await page.goto("/references");
  await expect(page.getByRole("navigation", { name: "Places" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Forward", exact: true })).toHaveCount(0);

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByRole("button", { name: "Back", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Forward", exact: true })).toBeVisible();
  await page.goto("/recipe-box");
  await expect(page.getByRole("button", { name: "Back", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Places" })).toBeVisible();
});

test("a tab opens a fan of title-only cards that leaves the lid uncovered", async ({ page }) => {
  await logIn(page);
  const tabP = page.getByRole("button", { name: /^P, 2 cards/ });
  await tabP.click();
  await expect(tabP).toHaveAttribute("aria-expanded", "true");

  const fan = page.getByRole("list", { name: "Cards under P" });
  await expect(fan).toBeVisible();
  await expect(fan.getByRole("button")).toHaveText(["Pancakes", "Peach Crisp"]);
  await expect(page.getByText("P, 2 cards", { exact: true })).toBeAttached();

  // Nothing is laid over the lid card: no grey layer, and the card is what you hit.
  expect(await fan.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  const heading = lid(page).getByRole("heading", { name: "Almond Biscotti" });
  const hb = (await heading.boundingBox())!;
  const lb = (await lid(page).boundingBox())!;
  const covered = await page.evaluate(
    ([points]) =>
      points.some(([x, y]) => !document.elementFromPoint(x!, y!)?.closest(".phone-box-lid__card")),
    [
      [
        [hb.x + hb.width / 2, hb.y + hb.height / 2],
        [lb.x + lb.width / 2, lb.y + lb.height / 2],
      ],
    ],
  );
  expect(covered).toBe(false);

  await fan.getByRole("button", { name: "Pancakes" }).click();
  await expect(lid(page).getByRole("heading", { name: "Pancakes" })).toBeVisible();
  await expect(fan).toBeHidden();
  await expect(page.getByText("Pancakes selected", { exact: true })).toBeAttached();
});

test("tapping the open tab again or Escape closes the fan", async ({ page }) => {
  await logIn(page);
  const tabL = page.getByRole("button", { name: /^L, 1 card/ });
  const fan = page.getByRole("list", { name: "Cards under L" });

  await tabL.click();
  await expect(fan).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(fan).toBeHidden();
  await expect(tabL).toHaveAttribute("aria-expanded", "false");

  await tabL.click();
  await expect(fan).toBeVisible();
  await tabL.click();
  await expect(fan).toBeHidden();
});

test("tapping anywhere on the lid card opens Card View; no Open recipe button", async ({
  page,
}) => {
  await logIn(page);
  await expect(page.getByRole("button", { name: "Open recipe" })).toHaveCount(0);

  const card = page.locator(".phone-box-lid__card");
  // The card slides up into the lid; measure it once it has come to rest.
  await card.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const box = (await card.boundingBox())!;
  await page.mouse.click(box.x + box.width - 20, box.y + box.height - 20);
  const cardView = page.getByRole("dialog", { name: "Almond Biscotti" });
  await expect(cardView).toBeVisible();
  await expect(cardView.getByRole("heading", { name: "Ingredients" })).toBeVisible();

  await cardView.getByRole("button", { name: "Flip card" }).click();
  await expect(cardView.getByRole("heading", { name: "Notes" })).toBeVisible();
  await expect(cardView).toContainText("Twice-baked, for dunking.");
  await cardView.getByRole("button", { name: "Flip card" }).click();
  await expect(cardView.getByRole("heading", { name: "Ingredients" })).toBeVisible();

  await cardView.getByRole("button", { name: "Close" }).click();
  await expect(cardView).toBeHidden();

  // Keyboard: Enter on the lid card opens it too.
  await card.focus();
  await page.keyboard.press("Enter");
  await expect(cardView).toBeVisible();
});

test("Reduce Motion turns the flip into a crossfade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await logIn(page);
  await lid(page).click();
  const face = page.locator(".phone-box-cardview__face");
  await expect(face).toBeVisible();
  const animation = await face.evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("phone-box-fade");
});

test("the menu lists Account, Add recipe, View, then Sign out", async ({ page }) => {
  // Its own session: signing out ends it.
  await logInWithForm(page);
  const menu = await openMenu(page);

  await expect(menu.getByRole("heading")).toHaveText(["Account", "Add recipe", "View"]);
  await expect(menu).toContainText("cook");
  await expect(menu.getByRole("button", { name: "Simple list" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(menu).not.toContainText("Appearance");
  await expect(menu.getByRole("button").last()).toHaveText("Sign out");

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  await (await openMenu(page)).getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
});

test("the floating + shows only while browsing and opens Add", async ({ page }) => {
  await logIn(page);
  await expect(plus(page)).toBeVisible();

  await page.getByRole("button", { name: /^L, 1 card/ }).click();
  await expect(page.getByRole("list", { name: "Cards under L" })).toBeVisible();
  await expect(plus(page)).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(plus(page)).toBeVisible();

  await lid(page).click();
  const cardView = page.getByRole("dialog", { name: "Almond Biscotti" });
  await expect(cardView).toBeVisible();
  await expect(plus(page)).toBeHidden();
  await cardView.getByRole("button", { name: "Close" }).click();
  await expect(plus(page)).toBeVisible();

  await plus(page).click();
  const sheet = page.getByRole("dialog", { name: "Add recipe" });
  await expect(sheet.getByRole("button", { name: "Add card" })).toBeVisible();
  await expect(sheet.getByLabel("Photo or PDF")).toBeAttached();
});

test("Add recipe in the menu opens the same Add sheet", async ({ page }) => {
  await logIn(page);
  const menu = await openMenu(page);
  await menu.getByRole("button", { name: /type, link or scan/i }).click();
  await expect(menu).toBeHidden();
  await expect(
    page.getByRole("dialog", { name: "Add recipe" }).getByRole("button", { name: "Add card" }),
  ).toBeVisible();
});

test("the box front reads the first name and the year joined", async ({ page }) => {
  await editSignedInUser(page, { first_name: "Ari", date_joined: "2024-03-01T12:00:00Z" });
  await logIn(page);
  await expect(page.locator(".phone-box-front")).toHaveText("Ari's Recipes · est. 2024");
});

test("the box front falls back to the username", async ({ page }) => {
  await editSignedInUser(page, { first_name: "", date_joined: "2023-07-09T12:00:00Z" });
  await logIn(page);
  await expect(page.locator(".phone-box-front")).toHaveText("cook's Recipes · est. 2023");
});

test("dark mode darkens the wood and keeps the card cream", async ({ page }) => {
  const frontWood = () =>
    page.locator(".phone-box-front").evaluate((el) => getComputedStyle(el).backgroundImage);
  const cardPaper = () =>
    page.locator(".phone-box-lid__card").evaluate((el) => getComputedStyle(el).backgroundColor);

  await logIn(page);
  expect(await frontWood()).toContain("rgb(176, 129, 77)");

  await page.emulateMedia({ colorScheme: "dark" });
  expect(await frontWood()).toContain("rgb(123, 86, 48)");
  expect(await frontWood()).not.toContain("rgb(176, 129, 77)");
  expect(await cardPaper()).toBe("rgb(255, 250, 240)");
});

test("nothing scrolls sideways at 360×640", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await logIn(page);
  await expect(lid(page)).toBeVisible();
  const overflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(await overflow()).toBeLessThanOrEqual(0);

  await page.getByRole("button", { name: /^P, / }).click();
  await expect(page.getByRole("list", { name: "Cards under P" })).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
});

test("an empty box shows an Add your first recipe card in the lid", async ({ page }) => {
  await page.route("**/api/v1/recipe-box/", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: [] });
      return;
    }
    await route.fallback();
  });
  await logIn(page);

  await expect(tabs(page)).toHaveCount(0);
  const addFirst = lid(page).getByRole("button", { name: "Add your first recipe" });
  await expect(addFirst).toBeVisible();
  await addFirst.click();
  await expect(page.getByRole("button", { name: "Add card" })).toBeVisible();
});

test("Simple list from the menu keeps open, add and edit working", async ({ page }) => {
  await logIn(page);
  await (await openMenu(page)).getByRole("button", { name: "Simple list" }).click();
  await expect(lid(page)).toBeHidden();
  await expect(page.getByRole("group", { name: "Divider tabs" })).toHaveCount(0);

  // Open
  await page.locator(".recipe-box-index__row-title", { hasText: "Almond Biscotti" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/.+/);
  await expect(page.locator(".recipe-box-card__title-input")).toHaveValue("Almond Biscotti");
  await page.getByRole("link", { name: "Back to list" }).click();
  const menu = await openMenu(page);
  await expect(menu.getByRole("button", { name: "Simple list" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.press("Escape");

  // Add
  const title = `Zucchini Slaw ${Date.now()}`;
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Step").fill("Shred and salt the zucchini.");
  await page.getByRole("button", { name: "Add card" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/.+/);
  const titleInput = page.locator(".recipe-box-card__title-input");
  await expect(titleInput).toHaveValue(title);

  // Edit
  await titleInput.fill(`${title} edited`);
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("link", { name: "Back to list" }).click();
  await expect(
    page.locator(".recipe-box-index__row-title", { hasText: `${title} edited` }).first(),
  ).toBeAttached();

  // And back to the box.
  await (await openMenu(page)).getByRole("button", { name: "Simple list" }).click();
  await expect(lid(page)).toBeVisible();
});
