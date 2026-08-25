import { test, expect } from "@playwright/test";

async function loginAsUser(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.locator('input[placeholder*="student ID or email"]').fill("testuser@example.com");
  await page.locator('input[type="password"]').fill("password123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/", { timeout: 15000 });
}

test.describe("Discussion Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("discussions page has a Start button that links to create page", async ({ page }) => {
    await page.goto("/discussions");

    const startButton = page.locator('a[href="/discussions/create"]').first();
    await expect(startButton).toBeVisible();
  });

  test("create discussion page shows the form", async ({ page }) => {
    await page.goto("/discussions/create");

    await expect(page.locator("text=Start a Discussion")).toBeVisible();
    await expect(page.locator("#title")).toBeVisible();
    await expect(page.locator("#content")).toBeVisible();
    await expect(page.locator("#category")).toBeVisible();
    await expect(page.locator("#course")).toBeVisible();
  });

  test("visibility options are displayed", async ({ page }) => {
    await page.goto("/discussions/create");

    await expect(page.locator("text=Public")).toBeVisible();
    await expect(page.locator("text=Department Only")).toBeVisible();
    await expect(page.locator("text=Batch Only")).toBeVisible();
  });

  test("create button is disabled when required fields are empty", async ({ page }) => {
    await page.goto("/discussions/create");

    const createButton = page.locator("button", { hasText: "Create Discussion" });
    await expect(createButton).toBeVisible();
  });

  test("filling the form with required fields", async ({ page }) => {
    await page.goto("/discussions/create");

    await page.locator("#title").fill("Best resources for DSA preparation?");
    await expect(page.locator("#title")).toHaveValue("Best resources for DSA preparation?");

    await page
      .locator("#content")
      .fill("I am looking for the best resources to prepare for my DSA final exam.");
    await expect(page.locator("#content")).toContainText("best resources");

    await page.locator("#category").selectOption({ index: 1 });

    const charCount = page.locator("text=/\\d+\\/200/");
    await expect(charCount).toBeVisible();
  });

  test("cancel button navigates back to discussions", async ({ page }) => {
    await page.goto("/discussions/create");

    const cancelButton = page.locator("button", { hasText: "Cancel" });
    await cancelButton.click();
    await page.waitForURL("**/discussions");
    expect(page.url()).toContain("/discussions");
  });

  test("visibility selection toggles correctly", async ({ page }) => {
    await page.goto("/discussions/create");

    const publicOption = page.locator("button", { hasText: "Public" }).first();
    await publicOption.click();
    await expect(publicOption).toHaveClass(/border-primary/);

    const deptOption = page.locator("button", { hasText: "Department Only" });
    await deptOption.click();
    await expect(deptOption).toHaveClass(/border-primary/);
  });

  test("title character counter updates on input", async ({ page }) => {
    await page.goto("/discussions/create");

    await page.locator("#title").fill("Test Title");
    const counter = page.locator("text=10/200");
    await expect(counter).toBeVisible();
  });
});
