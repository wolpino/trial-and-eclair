import { expect, test, type Page } from "@playwright/test";

import { ApiError, toApiError } from "../src/api/client";

// Unit checks for the one place the app turns an API error into text.
function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

test.describe("toApiError", () => {
  test("uses detail and carries the code", async () => {
    const error = await toApiError(
      jsonResponse(403, {
        detail: "Guests can keep up to 5 cards. Sign up to save more.",
        code: "guest_card_limit",
      }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(403);
    expect(error.code).toBe("guest_card_limit");
    expect(error.message).toBe("Guests can keep up to 5 cards. Sign up to save more.");
  });

  test("has no code when the body has none", async () => {
    const error = await toApiError(jsonResponse(400, { title: ["This field is required."] }));

    expect(error.code).toBeUndefined();
  });

  test("reads field errors without raw keys", async () => {
    const error = await toApiError(
      jsonResponse(400, {
        title: ["This field is required."],
        password_confirm: ["Passwords do not match."],
        prep_minutes: ["Ensure this field is greater than or equal to 0."],
      }),
    );

    expect(error.message).toBe(
      "Title is required. Passwords do not match. Ensure prep minutes is greater than or equal to 0.",
    );
  });

  test("reads non_field_errors and the scan file message", async () => {
    const nonField = await toApiError(
      jsonResponse(400, { non_field_errors: ["Invalid username or password."] }),
    );
    const scan = await toApiError(
      jsonResponse(400, { file: ["Upload a JPEG, PNG, HEIC, PDF or plain text file."] }),
    );

    expect(nonField.message).toBe("Invalid username or password.");
    expect(scan.message).toBe("Upload a JPEG, PNG, HEIC, PDF or plain text file.");
  });

  test("turns 429 Retry-After into minutes", async () => {
    const error = await toApiError(
      jsonResponse(
        429,
        { detail: "Request was throttled. Expected available in 300 seconds.", code: "throttled" },
        { "Retry-After": "300" },
      ),
    );

    expect(error.code).toBe("throttled");
    expect(error.message).toBe("Too many tries. Try again in 5 minutes.");
  });

  test("turns a long Retry-After into hours", async () => {
    const error = await toApiError(jsonResponse(429, {}, { "Retry-After": "86400" }));

    expect(error.message).toBe("Too many tries. Try again in 24 hours.");
  });

  test("handles 429 without Retry-After", async () => {
    const error = await toApiError(jsonResponse(429, { detail: "Request was throttled." }));

    expect(error.message).toBe("Too many tries. Please try again later.");
  });

  test("gives a generic message for a non-JSON 500", async () => {
    const error = await toApiError(
      new Response("<h1>Server Error (500)</h1>", {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }),
    );

    expect(error.status).toBe(500);
    expect(error.code).toBeUndefined();
    expect(error.message).toBe("Something went wrong on our side. Please try again.");
  });
});

test.describe("scan upload errors", () => {
  async function openScanPicker(page: Page) {
    await page.goto("/");
    await page.getByLabel("Username").fill("cook");
    await page.getByLabel("Password").fill("cookpass123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/recipe-box\/?$/);
    await page.getByRole("button", { name: "Add recipe" }).click();
    return page.getByLabel("Photo or PDF");
  }

  const gif = { name: "card.gif", mimeType: "image/gif", buffer: Buffer.from("GIF89a\x01\x00\x01\x00", "binary") };

  test("the picker accepts only the types the API allows", async ({ page }) => {
    const picker = await openScanPicker(page);

    await expect(picker).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/heic,image/heif,.heic,.heif,application/pdf,.pdf,text/plain,.txt",
    );
  });

  test("a rejected type shows the API's message", async ({ page }) => {
    const picker = await openScanPicker(page);
    await picker.setInputFiles(gif);
    await page.getByRole("button", { name: "Upload scan" }).click();

    await expect(page.getByText("Upload a JPEG, PNG, HEIC, PDF or plain text file.")).toBeVisible();
  });

  test("a throttled upload says when to try again", async ({ page }) => {
    await page.route("**/api/v1/imports/scan/", (route) =>
      route.fulfill({
        status: 429,
        headers: { "Retry-After": "600" },
        json: { detail: "Request was throttled.", code: "throttled" },
      }),
    );
    const picker = await openScanPicker(page);
    await picker.setInputFiles(gif);
    await page.getByRole("button", { name: "Upload scan" }).click();

    await expect(page.getByText("Too many tries. Try again in 10 minutes.")).toBeVisible();
  });
});
