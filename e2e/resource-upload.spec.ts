import { test, expect } from "@playwright/test";

async function loginAsUser(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.locator('input[placeholder*="student ID or email"]').fill("testuser@example.com");
  await page.locator('input[type="password"]').fill("password123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/", { timeout: 15000 });
}

test.describe("Resource Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("upload page is accessible via TopNav Resources link", async ({ page }) => {
    await page.goto("/resources");

    const sidebar = page.locator('a[href="/resources/upload"]');
    await expect(sidebar).toBeVisible();
  });

  test("navigating to the upload page shows the form", async ({ page }) => {
    await page.goto("/resources/upload");

    await expect(page.locator("text=Upload Resource")).toBeVisible();
    await expect(page.locator("text=Drag & drop your file here")).toBeVisible();
    await expect(page.locator("#title")).toBeVisible();
    await expect(page.locator("#description")).toBeVisible();
    await expect(page.locator("#course")).toBeVisible();
    await expect(page.locator("#category")).toBeVisible();
  });

  test("back to resources link is present on upload page", async ({ page }) => {
    await page.goto("/resources/upload");

    const backLink = page.locator('a[href="/resources"]');
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText("Back to Resources");
  });

  test("filling upload form and selecting a file enables submit", async ({ page }) => {
    await page.goto("/resources/upload");

    await page.locator("#title").fill("Test Resource Notes");
    await page.locator("#description").fill("A description for the test resource.");

    await page.locator("#course").selectOption({ index: 1 });
    await page.locator("#category").selectOption({ index: 1 });

    const tagInput = page.locator('input[placeholder="Type a tag and press Enter"]');
    await tagInput.fill("notes");
    await tagInput.press("Enter");
    await expect(page.locator("text=notes")).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    const buffer = Buffer.from("fake file content");
    await fileInput.setInputFiles({
      name: "test-notes.pdf",
      mimeType: "application/pdf",
      buffer,
    });

    const submitButton = page.locator("button", { hasText: "Upload Resource" });
    await expect(submitButton).toBeEnabled();
  });

  test("submit button is disabled when required fields are missing", async ({ page }) => {
    await page.goto("/resources/upload");

    const submitButton = page.locator("button", { hasText: "Upload Resource" });
    await expect(submitButton).toBeDisabled();
  });

  test("tag input allows adding and removing tags", async ({ page }) => {
    await page.goto("/resources/upload");

    const tagInput = page.locator('input[placeholder="Type a tag and press Enter"]');
    await tagInput.fill("algorithms");
    await tagInput.press("Enter");
    await expect(page.locator("text=algorithms")).toBeVisible();

    await tagInput.fill("data-structures");
    await tagInput.press("Enter");
    await expect(page.locator("text=data-structures")).toBeVisible();

    const removeButtons = page.locator("text=algorithms >> .. >> button");
    if (await removeButtons.count() > 0) {
      await removeButtons.first().click();
    }
  });

  test("reset button clears the form", async ({ page }) => {
    await page.goto("/resources/upload");

    await page.locator("#title").fill("Some Title");
    await expect(page.locator("#title")).toHaveValue("Some Title");

    await page.locator("button", { hasText: "Reset" }).click();
    await expect(page.locator("#title")).toHaveValue("");
  });
});
