import { expect, test, type Cookie, type Page } from "@playwright/test";

// Card View on a phone (decision 003, Card View; issue #64).

// Login is throttled (20 an hour per address), so tests share one session.
let sessionCookies: Cookie[] | null = null;

async function logIn(page: Page) {
  if (!sessionCookies) {
    await page.goto("/");
    await page.getByLabel("Username").fill("cook");
    await page.getByLabel("Password").fill("cookpass123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/recipe-box\/?$/);
    sessionCookies = await page.context().cookies();
    return;
  }
  await page.context().addCookies(sessionCookies);
  await page.goto("/recipe-box");
  await expect(page).toHaveURL(/\/recipe-box\/?$/);
}

type SeedStep = { id: string; order: number; body: string };
type SeedRecipe = {
  id: string;
  title: string;
  hero_image: string | null;
  steps: SeedStep[];
};

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

const TWENTY_STEPS: SeedStep[] = Array.from({ length: 20 }, (_, i) => ({
  id: `step-${i + 1}`,
  order: i + 1,
  body: `Long step number ${i + 1}: stir, wait, and stir again until it looks right.`,
}));

// 1×1 transparent PNG for the injected scan.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

/** Gives Almond Biscotti 20 steps and an original scan. */
async function useLongBiscotti(page: Page) {
  await page.route("**/media/test-card-scan.png", (route) =>
    route.fulfill({ contentType: "image/png", body: PNG }),
  );
  await editBoxList(page, (recipes) =>
    recipes.map((r) =>
      r.title === "Almond Biscotti"
        ? { ...r, steps: TWENTY_STEPS, hero_image: "/media/test-card-scan.png" }
        : r,
    ),
  );
}

/** Records wake lock calls on window.__wakeLog. */
async function stubWakeLock(page: Page) {
  await page.addInitScript(() => {
    const log: string[] = [];
    (window as unknown as { __wakeLog: string[] }).__wakeLog = log;
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: {
        request: async (type: string) => {
          log.push(`request:${type}`);
          let released = false;
          return {
            type,
            get released() {
              return released;
            },
            release: async () => {
              released = true;
              log.push("release");
            },
            addEventListener() {},
            removeEventListener() {},
          };
        },
      },
    });
  });
}

function wakeLog(page: Page) {
  return page.evaluate(() => (window as unknown as { __wakeLog: string[] }).__wakeLog);
}

async function openCardView(page: Page, title = "Almond Biscotti") {
  await page.locator(".phone-box-lid__card").click();
  const cardView = page.getByRole("dialog", { name: title });
  await expect(cardView).toBeVisible();
  // The face turns in on open; measure it once it has come to rest.
  await cardView
    .locator(".phone-cv__face")
    .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  return cardView;
}

function band(cardView: ReturnType<Page["getByRole"]>) {
  return cardView.getByRole("region", { name: "Ingredients" });
}

function stepsRegion(cardView: ReturnType<Page["getByRole"]>) {
  return cardView.getByRole("region", { name: "Steps" });
}

test.describe("sideways", () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test("ingredients and steps sit side by side, ingredients on the left", async ({ page }) => {
    await logIn(page);
    const cardView = await openCardView(page);
    const left = (await band(cardView).boundingBox())!;
    const right = (await stepsRegion(cardView).boundingBox())!;
    expect(left.x + left.width).toBeLessThanOrEqual(right.x + 1);
    // Same row: they overlap vertically.
    expect(left.y).toBeLessThan(right.y + right.height);
    expect(right.y).toBeLessThan(left.y + left.height);
    await expect(stepsRegion(cardView)).toContainText("Shape two logs.");
  });
});

test.describe("portrait", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the ingredient band is pinned above scrolling steps and collapses to one line", async ({
    page,
  }) => {
    await useLongBiscotti(page);
    await logIn(page);
    const cardView = await openCardView(page);

    const top = (await band(cardView).boundingBox())!;
    const below = (await stepsRegion(cardView).boundingBox())!;
    expect(top.y + top.height).toBeLessThanOrEqual(below.y + 1);

    // Steps scroll on their own; the band stays in view.
    const lastStep = cardView.getByRole("button", { name: /^Long step number 20:/ });
    await expect(lastStep).not.toBeInViewport();
    await stepsRegion(cardView).evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(lastStep).toBeInViewport();
    await expect(band(cardView)).toBeInViewport();
    await expect(band(cardView).getByRole("checkbox").first()).toBeInViewport();

    const toggle = band(cardView).getByRole("button", { name: "Ingredients (4)" });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(band(cardView).getByRole("checkbox")).toHaveCount(0);
    await expect(band(cardView)).toHaveText(/^\s*Ingredients \(4\)\s*▾?\s*$/);
    expect((await band(cardView).boundingBox())!.height).toBeLessThan(56);

    await toggle.click();
    await expect(band(cardView).getByRole("checkbox")).toHaveCount(4);
  });

  test("a long recipe scrolls; Turn over shows notes, source and the scan", async ({ page }) => {
    await useLongBiscotti(page);
    await logIn(page);
    const cardView = await openCardView(page);

    const steps = stepsRegion(cardView);
    expect(await steps.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    await expect(cardView.getByRole("button", { name: /^Long step number \d+:/ })).toHaveCount(20);
    await expect(cardView.getByRole("button", { name: /next page|previous page/i })).toHaveCount(0);

    await cardView.getByRole("button", { name: "Turn over" }).click();
    await expect(cardView.getByRole("heading", { name: "Notes" })).toBeVisible();
    await expect(cardView).toContainText("Twice-baked, for dunking.");
    await expect(cardView.getByRole("heading", { name: "Source" })).toBeVisible();
    await expect(cardView.getByRole("img", { name: "Original photo or scan" })).toBeVisible();
    await expect(band(cardView)).toHaveCount(0);

    await cardView.getByRole("button", { name: "Turn over" }).click();
    await expect(band(cardView)).toBeVisible();
    await expect(cardView.getByRole("heading", { name: "Notes" })).toHaveCount(0);
  });

  test("tapping a step marks it, tapping an ingredient ticks it; reopening clears both", async ({
    page,
  }) => {
    await logIn(page);
    let cardView = await openCardView(page);
    const first = cardView.getByRole("button", { name: /^Shape two logs/ });
    const second = cardView.getByRole("button", { name: /^Slice, bake/ });

    await second.click();
    await expect(second).toHaveAttribute("aria-current", "step");
    await expect(first).not.toHaveAttribute("aria-current", "step");
    await first.click();
    await expect(first).toHaveAttribute("aria-current", "step");
    await expect(second).not.toHaveAttribute("aria-current", "step");

    const tick = band(cardView).getByRole("checkbox").nth(1);
    await tick.click();
    await expect(tick).toBeChecked();

    await cardView.getByRole("button", { name: "Close" }).click();
    await expect(cardView).toBeHidden();
    cardView = await openCardView(page);
    await expect(cardView.locator('[aria-current="step"]')).toHaveCount(0);
    for (const box of await band(cardView).getByRole("checkbox").all()) {
      await expect(box).not.toBeChecked();
    }
  });

  test("the screen stays awake while the card is open; ☀ turns it off", async ({ page }) => {
    await stubWakeLock(page);
    await logIn(page);
    const cardView = await openCardView(page);
    await expect.poll(() => wakeLog(page)).toEqual(["request:screen"]);

    const sun = cardView.getByRole("button", { name: "Keep screen on" });
    await expect(sun).toHaveAttribute("aria-pressed", "true");
    await sun.click();
    await expect(sun).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => wakeLog(page)).toEqual(["request:screen", "release"]);

    await sun.click();
    await expect(sun).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(() => wakeLog(page))
      .toEqual(["request:screen", "release", "request:screen"]);

    await cardView.getByRole("button", { name: "Close" }).click();
    await expect
      .poll(() => wakeLog(page))
      .toEqual(["request:screen", "release", "request:screen", "release"]);
  });

  test("without the Wake Lock API the card still opens and shows no ☀", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "wakeLock", { configurable: true, value: undefined });
    });
    await logIn(page);
    const cardView = await openCardView(page);
    await expect(cardView.getByRole("button", { name: "Keep screen on" })).toHaveCount(0);
  });

  test("no servings scaler or unit toggle", async ({ page }) => {
    await logIn(page);
    const cardView = await openCardView(page);
    for (const role of ["button", "combobox", "slider", "spinbutton", "switch"] as const) {
      await expect(
        cardView.getByRole(role, { name: /servings|scale|metric|imperial|units?\b/i }),
      ).toHaveCount(0);
    }
  });

  test("Edit turns the card into fields in the same layout; Cancel discards, Done saves", async ({
    page,
  }) => {
    await logIn(page);
    const csrf = (await page.context().cookies()).find((c) => c.name === "csrftoken")?.value ?? "";
    const headers = { "X-CSRFToken": csrf };
    const title = `Zest Card Edit Check ${Date.now()}`;
    const created = await page.request.post("/api/v1/recipe-box/", { data: { title }, headers });
    expect(created.ok(), await created.text()).toBeTruthy();
    const { id } = (await created.json()) as { id: string };

    try {
      for (const [path, data] of [
        ["ingredient-lines/", { raw_text: "1 lemon, zested", sort_order: 0 }],
        ["steps/", { order: 1, body: "Zest the lemon." }],
      ] as const) {
        const response = await page.request.post(`/api/v1/recipe-box/${id}/${path}`, {
          data,
          headers,
        });
        expect(response.ok(), await response.text()).toBeTruthy();
      }

      await page.reload();
      await page.getByRole("button", { name: /^Z, \d+ cards?/ }).click();
      await page
        .getByRole("list", { name: "Cards under Z" })
        .getByRole("button", { name: title })
        .click();
      let cardView = await openCardView(page, title);

      async function startEditing() {
        await cardView.getByRole("button", { name: "Card menu" }).click();
        await cardView.getByRole("menuitem", { name: "Edit card" }).click();
        await expect(cardView.getByRole("textbox", { name: "Title" })).toHaveValue(title);
      }

      await startEditing();
      // Same layout: the band and the steps are still there, now as fields.
      await expect(band(cardView).getByRole("textbox", { name: "Ingredient 1" })).toHaveValue(
        "1 lemon, zested",
      );
      await expect(stepsRegion(cardView).getByRole("textbox", { name: "Step 1" })).toHaveValue(
        "Zest the lemon.",
      );
      await cardView.getByRole("textbox", { name: "Title" }).fill(`${title} (changed)`);
      await stepsRegion(cardView).getByRole("textbox", { name: "Step 1" }).fill("Throw it out.");
      await cardView.getByRole("button", { name: "Cancel" }).click();

      await expect(cardView.getByRole("textbox")).toHaveCount(0);
      await expect(cardView.getByRole("heading", { name: title, exact: true })).toBeVisible();
      await expect(cardView.getByRole("button", { name: "Zest the lemon." })).toBeVisible();

      await startEditing();
      await expect(stepsRegion(cardView).getByRole("textbox", { name: "Step 1" })).toHaveValue(
        "Zest the lemon.",
      );
      const newTitle = `${title} edited`;
      await cardView.getByRole("textbox", { name: "Title" }).fill(newTitle);
      await band(cardView)
        .getByRole("textbox", { name: "Ingredient 1" })
        .fill("2 lemons, zested");
      await stepsRegion(cardView)
        .getByRole("textbox", { name: "Step 1" })
        .fill("Zest both lemons.");
      await cardView.getByRole("button", { name: "Done" }).click();

      cardView = page.getByRole("dialog", { name: newTitle });
      await expect(cardView.getByRole("textbox")).toHaveCount(0);
      await expect(cardView.getByRole("button", { name: "Zest both lemons." })).toBeVisible();
      await expect(band(cardView)).toContainText("2 lemons, zested");

      await cardView.getByRole("button", { name: "Close" }).click();
      await expect(page.locator(".phone-box-lid__card")).toContainText(newTitle);

      const saved = (await (await page.request.get(`/api/v1/recipe-box/${id}/`)).json()) as {
        title: string;
        steps: { body: string }[];
        ingredient_lines: { raw_text: string }[];
      };
      expect(saved.title).toBe(newTitle);
      expect(saved.steps.map((s) => s.body)).toEqual(["Zest both lemons."]);
      expect(saved.ingredient_lines.map((l) => l.raw_text)).toEqual(["2 lemons, zested"]);
    } finally {
      await page.request.delete(`/api/v1/recipe-box/${id}/`, { headers });
    }
  });

  test("Full editor in the card menu opens the whole card editor", async ({ page }) => {
    await logIn(page);
    const cardView = await openCardView(page);
    await cardView.getByRole("button", { name: "Card menu" }).click();
    await cardView.getByRole("menuitem", { name: "Full editor" }).click();
    await expect(page).toHaveURL(/\/recipe-box\/.+/);
    await expect(page.locator(".recipe-box-card__title-input")).toHaveValue("Almond Biscotti");
  });
});
