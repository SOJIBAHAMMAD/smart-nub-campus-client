import { test, expect } from "@playwright/test";

async function loginAsUser(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page
    .locator('input[placeholder*="student ID or email"]')
    .fill("testuser@example.com");
  await page.locator('input[type="password"]').fill("password123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/", { timeout: 15000 });
}

const DIALOG_INPUT = "Search resources, people, teams...";

test.describe("Global Search", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("Ctrl+K opens the global search dialog", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByPlaceholder("Search resources, people, teams..."),
    ).toBeVisible();
  });

  test("'/' opens the dialog from the home page", async ({ page }) => {
    await page.keyboard.press("/");
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("Esc closes the dialog", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("typeahead shows grouped results or the no-results state", async ({
    page,
  }) => {
    await page.keyboard.press("Control+k");
    const input = page.getByPlaceholder("Search resources, people, teams...");
    await input.fill("database");
    await expect(input).toHaveValue("database");

    // Data-agnostic: either grouped results (with the View-all footer) or a
    // no-results message must appear once the (debounced) request settles.
    const noResults = page.locator("text=/No results for/");
    const viewAll = page.locator(
      "text=/View all \\d+ results on the search page/",
    );
    await expect(noResults.or(viewAll)).toBeVisible({ timeout: 15000 });
  });

  test("SERP renders tabs and preserves the query in the URL", async ({
    page,
  }) => {
    await page.goto("/search?q=database");
    const tablist = page.locator('[role="tablist"][aria-label="Search results by category"]');
    await expect(tablist).toBeVisible();
    await expect(page.getByRole("tab", { name: "All" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.locator("text=/results for/").first()).toBeVisible();
    expect(page.url()).toContain("q=database");
  });

  test("clicking a scoped tab updates the URL entity", async ({ page }) => {
    await page.goto("/search?q=database");
    await page.getByRole("tab", { name: /^Resources/ }).click();
    await page.waitForURL("**/search?q=database&entity=resources");
  });

  test("mobile facet tray filters by department", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/search?q=database");

    await page.getByRole("button", { name: "Filters" }).click();
    const chip = page.getByRole("button", { name: "CSE" }).first();
    await expect(chip).toBeVisible();
    await chip.click();

    await page.waitForURL("**/search?q=database&department=CSE");
  });
});
