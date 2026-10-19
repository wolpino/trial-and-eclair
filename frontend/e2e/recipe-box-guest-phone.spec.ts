import { expect, test, type Page } from "@playwright/test";

// Guest creation and register are throttled (10 an hour per address), so these
// tests make two guests and two accounts in all.

const GUEST_NOTE = "Guest cards are deleted after 30 days without use.";

function lid(page: Page) {
  return page.getByRole("region", { name: "Selected recipe" });
}

function tab(page: Page, letter: string) {
  return page
    .getByRole("group", { name: "Divider tabs" })
    .getByRole("button", { name: new RegExp(`^${letter},`) });
}

function fan(page: Page, letter: string) {
  return page.getByRole("list", { name: `Cards under ${letter}` });
}

function plus(page: Page) {
  return page.getByRole("button", { name: "Add recipe", exact: true });
}

function signUpCard(page: Page) {
  return page.getByRole("region", { name: "Sign up to save more cards" });
}

async function openMenu(page: Page) {
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  return menu;
}

async function closeMenu(page: Page) {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCount(0);
}

/** Opens a tab's fan and picks the card whose name matches, starter or not. */
async function pick(page: Page, letter: string, name: RegExp) {
  await tab(page, letter).click();
  await fan(page, letter).getByRole("button", { name }).click();
}

async function addCardWithForm(page: Page, title: string) {
  await plus(page).click();
  const sheet = page.getByRole("dialog", { name: "Add recipe" });
  await sheet.getByLabel("Title").fill(title);
  await sheet.getByLabel("Step").fill("Mix and bake.");
  await sheet.getByRole("button", { name: "Add card" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/[0-9a-f-]+$/);
  await page.getByRole("link", { name: "Back to box" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/?$/);
}

/** Saves cards straight through the API, with the page's session. */
async function addCardsByApi(page: Page, titles: string[]) {
  const cookies = await page.context().cookies();
  const csrf = cookies.find((cookie) => cookie.name === "csrftoken")?.value ?? "";
  for (const title of titles) {
    const response = await page.request.post("/api/v1/recipe-box/", {
      data: { title },
      headers: { "X-CSRFToken": csrf },
    });
    expect(response.status()).toBe(201);
  }
}

async function register(page: Page, username: string) {
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password", { exact: true }).fill("guestpass123");
  await page.getByLabel("Confirm password").fill("guestpass123");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/recipe-box\/?$/);
}

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("a visitor sees the starter cards and no guest is made on load", async ({ page }) => {
    const guestPosts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST" && request.url().includes("/api/v1/auth/guest/")) {
        guestPosts.push(request.url());
      }
    });

    await page.goto("/recipe-box");
    await expect(page).toHaveURL(/\/recipe-box\/?$/);

    // Starters sort A–Z: Banana Bread comes first and fills the lid.
    await expect(lid(page).getByRole("heading", { name: "Banana Bread" })).toBeVisible();
    await expect(lid(page).getByText("Starter card", { exact: true })).toBeVisible();
    for (const letter of ["B", "C", "L", "S", "T", "W"]) {
      await expect(tab(page, letter)).toBeVisible();
    }

    await tab(page, "S").click();
    const pancakes = fan(page, "S").getByRole("button", { name: /Sunday Pancakes/ });
    await expect(pancakes).toContainText("Starter");

    await page.keyboard.press("Escape");
    const menu = await openMenu(page);
    await expect(menu.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Sign up to keep your cards" })).toHaveCount(0);
    await expect(menu.getByRole("button", { name: "Sign out" })).toHaveCount(0);
    await closeMenu(page);

    // A visitor can fork (that makes the guest) but never hide.
    await expect(lid(page).getByRole("button", { name: "Fork to my box" })).toBeVisible();
    await expect(lid(page).getByRole("button", { name: "Hide" })).toHaveCount(0);

    await plus(page).click();
    await expect(page.getByRole("dialog", { name: "Add recipe" }).getByText(GUEST_NOTE)).toBeVisible();

    expect(guestPosts).toEqual([]);
  });

  test("starter cards open in Card View with no Edit", async ({ page }) => {
    await page.goto("/recipe-box");
    await pick(page, "T", /Tomato Soup/);
    await lid(page).getByRole("heading", { name: "Tomato Soup" }).click();
    const card = page.getByRole("dialog", { name: "Tomato Soup" });
    await expect(card).toBeVisible();
    await expect(card.getByRole("region", { name: "Ingredients" }).getByRole("listitem").first()).toBeVisible();
    await expect(card.getByRole("region", { name: "Steps" }).getByRole("listitem").first()).toBeVisible();
    await expect(card.getByRole("button", { name: "Card menu" })).toHaveCount(0);
    await expect(card.getByRole("button", { name: /Edit/ })).toHaveCount(0);
    await card.getByRole("button", { name: "Turn over" }).click();
    await expect(card.getByText("Back", { exact: true })).toBeVisible();
  });

  test("adding a card as a visitor makes a guest and saves the card", async ({ page }) => {
    await page.goto("/recipe-box");
    const guestCreated = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/auth/guest/") && response.request().method() === "POST",
    );
    await addCardWithForm(page, "Apple Crumble");
    expect((await guestCreated).status()).toBe(201);

    await expect(lid(page).getByRole("heading", { name: "Apple Crumble" })).toBeVisible();
    await expect(lid(page).getByText("Starter card", { exact: true })).toHaveCount(0);
    await expect(tab(page, "A")).toBeVisible();

    const menu = await openMenu(page);
    await expect(menu.getByText("Guest · 1 of 5 cards")).toBeVisible();
    await expect(menu.getByRole("button", { name: "Sign up to keep your cards" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Sign out" })).toHaveCount(0);
  });

  test("a guest forks, reaches the limit, frees a slot and signs up", async ({ page }) => {
    await page.goto("/recipe-box");

    await test.step("fork a starter card while under the limit", async () => {
      await expect(lid(page).getByRole("heading", { name: "Banana Bread" })).toBeVisible();
      await lid(page).getByRole("button", { name: "Fork to my box" }).click();

      // The copy is selected, editable, and the starter stays beside it.
      await expect(lid(page).getByText("Starter card", { exact: true })).toHaveCount(0);
      await expect(lid(page).getByRole("heading", { name: "Banana Bread" })).toBeVisible();
      await tab(page, "B").click();
      const cards = fan(page, "B").getByRole("button", { name: /Banana Bread/ });
      await expect(cards).toHaveCount(2);
      await expect(cards.filter({ hasText: "Starter" })).toHaveCount(1);
      await page.keyboard.press("Escape");

      await lid(page).getByRole("heading", { name: "Banana Bread" }).click();
      const card = page.getByRole("dialog", { name: "Banana Bread" });
      await card.getByRole("button", { name: "Card menu" }).click();
      await expect(card.getByRole("menuitem", { name: "Edit card" })).toBeVisible();
      await card.getByRole("button", { name: "Close" }).click();
    });

    await test.step("a guest sees no Hide on a starter card", async () => {
      await pick(page, "C", /Chocolate Chip Cookies/);
      await expect(lid(page).getByText("Starter card", { exact: true })).toBeVisible();
      await expect(lid(page).getByRole("button", { name: "Hide" })).toHaveCount(0);
    });

    await test.step("at 5 cards, Add and Fork show the sign-up card", async () => {
      await addCardsByApi(page, ["Guest card 2", "Guest card 3", "Guest card 4", "Guest card 5"]);
      await page.reload();

      const menu = await openMenu(page);
      await expect(menu.getByText("Guest · 5 of 5 cards")).toBeVisible();
      await closeMenu(page);

      await plus(page).click();
      await expect(signUpCard(page)).toBeVisible();
      await expect(signUpCard(page).getByText(GUEST_NOTE)).toBeVisible();
      await expect(page.getByLabel("Title")).toHaveCount(0);
      await page.keyboard.press("Escape");

      await pick(page, "C", /Chocolate Chip Cookies/);
      await lid(page).getByRole("button", { name: "Fork to my box" }).click();
      await expect(signUpCard(page)).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(signUpCard(page)).toHaveCount(0);
    });

    await test.step("deleting a card makes Add work again", async () => {
      await pick(page, "G", /Guest card 5/);
      await lid(page).getByRole("heading", { name: "Guest card 5" }).click();
      const card = page.getByRole("dialog", { name: "Guest card 5" });
      await card.getByRole("button", { name: "Card menu" }).click();
      await card.getByRole("menuitem", { name: "Full editor" }).click();
      page.once("dialog", (dialog) => void dialog.accept());
      await page.getByRole("button", { name: "Delete card" }).click();
      await expect(page).toHaveURL(/\/recipe-box\/?$/);

      await plus(page).click();
      await expect(signUpCard(page)).toHaveCount(0);
      await expect(page.getByRole("dialog", { name: "Add recipe" }).getByLabel("Title")).toBeVisible();
      await page.keyboard.press("Escape");
    });

    await test.step("signing up from the sign-up card keeps the cards", async () => {
      await addCardWithForm(page, "Guest card 6");
      await plus(page).click();
      await signUpCard(page).getByRole("button", { name: "Sign up to keep your cards" }).click();
      await expect(page).toHaveURL(/\/register$/);
      await expect(page.getByText("Your 5 guest cards stay in your box.")).toBeVisible();

      const username = `guestup${Date.now()}`;
      await register(page, username);

      await expect(page.locator(".phone-box-front")).toContainText(`${username}'s Recipes`);
      await tab(page, "G").click();
      await expect(fan(page, "G").getByRole("button")).toHaveCount(4);
      await page.keyboard.press("Escape");
      await tab(page, "B").click();
      await expect(fan(page, "B").getByRole("button", { name: /Banana Bread/ })).toHaveCount(2);
      await page.keyboard.press("Escape");

      const menu = await openMenu(page);
      await expect(menu.getByText(username)).toBeVisible();
      await expect(menu.getByText(/Guest ·/)).toHaveCount(0);
      await expect(menu.getByRole("button", { name: "Sign out" })).toBeVisible();
    });
  });

  test("a signed-up cook can hide a starter card and it stays hidden", async ({ page }) => {
    await page.goto("/register");
    await register(page, `hider${Date.now()}`);

    await pick(page, "T", /Tomato Soup/);
    await expect(lid(page).getByText("Starter card", { exact: true })).toBeVisible();
    const hide = lid(page).getByRole("button", { name: "Hide" });
    const box = await hide.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
    await hide.click();

    await expect(tab(page, "T")).toHaveCount(0);
    await page.reload();
    await expect(tab(page, "B")).toBeVisible();
    await expect(tab(page, "T")).toHaveCount(0);
  });
});

test.describe("wide screen", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("a visitor opening /recipe-box still goes to /login", async ({ page }) => {
    await page.goto("/recipe-box");
    await expect(page).toHaveURL(/\/login$/);
  });
});
