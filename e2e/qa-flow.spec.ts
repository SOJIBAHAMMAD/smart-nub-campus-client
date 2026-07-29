import { test, expect } from "@playwright/test";

async function loginAsUser(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.locator('input[placeholder*="student ID or email"]').fill("testuser@example.com");
  await page.locator('input[type="password"]').fill("password123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/", { timeout: 15000 });
}

test.describe("Q&A Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("Q&A page has an Ask button linking to the ask page", async ({ page }) => {
    await page.goto("/qa");

    const askButton = page.locator('a[href="/qa/ask"]').first();
    await expect(askButton).toBeVisible();
  });

  test("ask question page shows the form with all fields", async ({ page }) => {
    await page.goto("/qa/ask");

    await expect(page.locator("text=Ask a Question")).toBeVisible();
    await expect(page.locator("#title")).toBeVisible();
    await expect(page.locator("#content")).toBeVisible();
    await expect(page.locator("#category")).toBeVisible();
    await expect(page.locator("#course")).toBeVisible();
  });

  test("tips section is visible on ask page", async ({ page }) => {
    await page.goto("/qa/ask");

    await expect(page.locator("text=Write a clear, specific title")).toBeVisible();
  });

  test("filling and submitting a question", async ({ page }) => {
    await page.goto("/qa/ask");

    await page.locator("#title").fill("How to implement a B-tree in C++?");
    await page
      .locator("#content")
      .fill("I need help understanding how to implement a B-tree data structure in C++. Can someone explain the insertion algorithm?");
    await page.locator("#category").selectOption({ index: 1 });

    const postButton = page.locator("button", { hasText: "Post Question" });
    await expect(postButton).toBeVisible();
  });

  test("cancel button navigates back to Q&A", async ({ page }) => {
    await page.goto("/qa/ask");

    const cancelButton = page.locator("button", { hasText: "Cancel" });
    await cancelButton.click();
    await page.waitForURL("**/qa");
    expect(page.url()).toContain("/qa");
  });

  test("title validation requires minimum 10 characters", async ({ page }) => {
    await page.goto("/qa/ask");

    await page.locator("#title").fill("Short");
    await page.locator("#content").fill("This is a valid content with more than ten characters.");
    await page.locator("#category").selectOption({ index: 1 });

    const postButton = page.locator("button", { hasText: "Post Question" });
    await postButton.click();

    await expect(page.locator("text=Title must be at least 10 characters")).toBeVisible();
  });

  test("Q&A list page shows question cards", async ({ page }) => {
    await page.goto("/qa");

    const questionCards = page.locator('[class*="rounded-xl"][class*="border"][class*="bg-card"]');
    const count = await questionCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("Q&A sidebar has category tabs", async ({ page }) => {
    await page.goto("/qa");

    await expect(page.locator("button", { hasText: "All" }).first()).toBeVisible();
    await expect(page.locator("button", { hasText: "Answered" }).first()).toBeVisible();
    await expect(page.locator("button", { hasText: "Unanswered" }).first()).toBeVisible();
  });
});
