import { expect, test, type Cookie, type Locator, type Page } from "@playwright/test";

// The simpler kitchen on a phone, upright and sideways (decision 004, issue #87).

// Login is throttled, so every test in this file shares one session.
let session: Cookie[] | null = null;

async function openKitchen(page: Page) {
  if (!session) {
    await page.goto("/login");
    await page.getByLabel("Username").fill("cook");
    await page.getByLabel("Password").fill("cookpass123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).not.toHaveURL(/\/login/);
    session = await page.context().cookies();
  } else {
    await page.context().addCookies(session);
  }
  await page.goto("/");
  await expect(kitchen(page)).toBeVisible();
}

function kitchen(page: Page): Locator {
  return page.getByRole("main", { name: "Kitchen" });
}

function objects(page: Page) {
  const k = kitchen(page);
  return {
    shelf: k.getByRole("list", { name: "Shelf" }),
    board: k.getByRole("link", { name: /^Cork board/ }),
    counter: k.locator(".kitchen-counter"),
    box: k.getByRole("link", { name: "Recipe box" }),
    notebook: k.getByRole("link", { name: /^Lab notebook/ }),
  };
}

async function rect(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

async function expectObjectsPresent(page: Page) {
  for (const object of Object.values(objects(page))) {
    await expect(object).toBeVisible();
  }
}

async function expectBigTapTargets(page: Page) {
  const targets = await kitchen(page).locator("a, button").all();
  expect(targets.length).toBeGreaterThanOrEqual(4);
  const box = await rect(objects(page).box);
  for (const target of targets) {
    const r = await rect(target);
    const name = await target.evaluate((el) => el.getAttribute("aria-label") ?? el.textContent);
    expect(r.width, `${name} width`).toBeGreaterThanOrEqual(48);
    expect(r.height, `${name} height`).toBeGreaterThanOrEqual(48);
    if (name !== "Recipe box") {
      expect(r.width * r.height, `${name} is smaller than the box`).toBeLessThan(
        box.width * box.height,
      );
    }
  }
}

async function expectBoxOpens(page: Page) {
  await objects(page).box.click();
  await expect(page).toHaveURL(/\/recipe-box\/?$/);
  await expect(page.getByRole("region", { name: "Selected recipe" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Divider tabs" })).toBeVisible();
}

async function expectNoRotatePromptOrSideScroll(page: Page) {
  await expect(page.getByText(/rotate/i)).toHaveCount(0);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("upright, 390×844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shelf, board, counter, box and notebook, top to bottom", async ({ page }) => {
    await openKitchen(page);
    await expectObjectsPresent(page);
    const o = objects(page);
    const [shelf, board, counter, box, notebook] = await Promise.all([
      rect(o.shelf),
      rect(o.board),
      rect(o.counter),
      rect(o.box),
      rect(o.notebook),
    ]);
    expect(shelf.y + shelf.height).toBeLessThanOrEqual(board.y);
    expect(board.y + board.height).toBeLessThanOrEqual(counter.y);
    // The box and notebook stand on the counter, below the board.
    for (const onCounter of [box, notebook]) {
      expect(onCounter.y).toBeGreaterThanOrEqual(board.y + board.height);
      expect(onCounter.y + onCounter.height).toBeGreaterThan(counter.y);
    }
    expect(box.y).toBeLessThan(notebook.y);
  });

  test("every tap target is at least 48px and the box's is the largest", async ({ page }) => {
    await openKitchen(page);
    await expectBigTapTargets(page);
  });

  test("each object opens its view, and the box opens the phone Recipe Box", async ({
    page,
  }) => {
    await openKitchen(page);
    const o = objects(page);
    const routes: [Locator, RegExp][] = [
      [o.shelf.getByRole("link", { name: "References" }), /\/references$/],
      [o.board, /\/sample\/board$/],
      [o.notebook, /\/sample\/lab$/],
    ];
    for (const [link, url] of routes) {
      await link.click();
      await expect(page).toHaveURL(url);
      await page.goto("/");
    }
    await expectBoxOpens(page);
  });
});

test.describe("sideways, 844×390", () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test("all objects are present with big tap targets, and the box opens", async ({ page }) => {
    await openKitchen(page);
    await expectObjectsPresent(page);
    await expectBigTapTargets(page);
    await expectNoRotatePromptOrSideScroll(page);
    await expectBoxOpens(page);
  });
});

test.describe("small phone, 360×640", () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test("no rotate prompt and nothing scrolls sideways", async ({ page }) => {
    await openKitchen(page);
    await expectObjectsPresent(page);
    await expectBigTapTargets(page);
    await expectNoRotatePromptOrSideScroll(page);
  });
});
