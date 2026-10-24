import { expect, test, type Browser, type Cookie, type Locator, type Page } from "@playwright/test";

// Kitchen sunlight that follows the device clock (issue #88, decision 004).

const VIEW = { viewport: { width: 1280, height: 800 }, timezoneId: "UTC" };
test.use(VIEW);

// Login is throttled (20 an hour per address), so every test reuses one session.
let session: Cookie[] | null = null;

async function signIn(page: Page) {
  if (session) {
    await page.context().addCookies(session);
    return;
  }
  await page.goto("/login");
  await page.getByLabel("Username").fill("dev");
  await page.getByLabel("Password").fill("devpass123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).not.toHaveURL(/\/login/);
  session = await page.context().cookies();
}

/** Records any use of the geolocation API so a test can assert there was none. */
async function spyOnGeolocation(page: Page) {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { __geoCalls: string[] }).__geoCalls = calls;
    const geo = navigator.geolocation;
    if (!geo) return;
    for (const name of ["getCurrentPosition", "watchPosition"] as const) {
      Object.defineProperty(geo, name, {
        configurable: true,
        value: () => {
          calls.push(name);
          return 0;
        },
      });
    }
  });
}

async function openKitchenAt(page: Page, time: string): Promise<Locator> {
  await page.clock.install({ time: new Date(time) });
  await signIn(page);
  await page.goto("/");
  await expect(page.getByRole("main", { name: "Kitchen" })).toBeVisible();
  const light = page.getByTestId("kitchen-light");
  await expect(light).toHaveAttribute("data-light", /.+/);
  return light;
}

type LightState = { phase: string; x: string; y: string };

async function readLight(light: Locator): Promise<LightState> {
  return light.evaluate((el) => {
    const style = (el as HTMLElement).style;
    return {
      phase: el.getAttribute("data-light") ?? "",
      x: style.getPropertyValue("--sun-x"),
      y: style.getPropertyValue("--sun-y"),
    };
  });
}

async function lightAt(browser: Browser, time: string): Promise<LightState> {
  const context = await browser.newContext({ ...VIEW, baseURL: "http://127.0.0.1:8010" });
  const page = await context.newPage();
  try {
    return await readLight(await openKitchenAt(page, time));
  } finally {
    await context.close();
  }
}

test("morning, midday and evening each light the kitchen differently and the glow moves", async ({
  browser,
}) => {
  const morning = await lightAt(browser, "2026-10-23T08:00:00Z");
  const midday = await lightAt(browser, "2026-10-23T13:00:00Z");
  const evening = await lightAt(browser, "2026-10-23T18:00:00Z");

  const phases = [morning.phase, midday.phase, evening.phase];
  expect(new Set(phases).size).toBe(3);
  expect(phases).not.toContain("night");

  const positions = [morning, midday, evening].map((s) => `${s.x} ${s.y}`);
  expect(new Set(positions).size).toBe(3);
});

test("at 23:00 the kitchen is moonlit, not dark", async ({ page }) => {
  const light = await openKitchenAt(page, "2026-10-23T23:00:00Z");
  await expect(light).toHaveAttribute("data-light", "night");
  await expect(light).toBeAttached();
  // The moon glow is drawn: the layer is not switched off.
  const glow = light.locator(".kitchen-light__glow");
  const opacity = await glow.evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(opacity).toBeGreaterThan(0);
});

test("advancing the clock five minutes updates the light without asking for location", async ({
  page,
}) => {
  await spyOnGeolocation(page);
  const geoRequests: string[] = [];
  page.on("request", (request) => {
    if (/geo|location|ipinfo|ipapi/i.test(new URL(request.url()).hostname)) {
      geoRequests.push(request.url());
    }
  });

  const light = await openKitchenAt(page, "2026-10-23T10:00:00Z");
  const before = await readLight(light);

  await page.clock.runFor(5 * 60_000);
  await expect.poll(async () => (await readLight(light)).x).not.toBe(before.x);

  const geoCalls = await page.evaluate(
    () => (window as unknown as { __geoCalls: string[] }).__geoCalls,
  );
  expect(geoCalls).toEqual([]);
  expect(geoRequests).toEqual([]);
});

test("with reduced motion the light still follows the clock", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const light = await openKitchenAt(page, "2026-10-23T18:55:00Z");
  await expect(light).toHaveAttribute("data-light", "evening");
  const before = await readLight(light);

  await page.clock.runFor(5 * 60_000);
  await expect(light).toHaveAttribute("data-light", "night");
  expect((await readLight(light)).x).not.toBe(before.x);
});
