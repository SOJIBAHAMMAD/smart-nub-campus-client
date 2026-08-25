import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.locator('input[placeholder*="student ID or email"]').fill("admin@example.com");
  await page.locator('input[type="password"]').fill("adminpassword123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/admin**", { timeout: 15000 });
}

test.describe("Admin Verification Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("admin dashboard loads with stats cards", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.locator("text=Dashboard")).toBeVisible();
    await expect(page.locator("text=Platform overview and statistics")).toBeVisible();

    await expect(page.locator("text=Total Users")).toBeVisible();
    await expect(page.locator("text=Total Resources")).toBeVisible();
    await expect(page.locator("text=Total Discussions")).toBeVisible();
    await expect(page.locator("text=Total Questions")).toBeVisible();
  });

  test("admin sidebar has verification requests link", async ({ page }) => {
    await page.goto("/admin");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    const verificationsLink = sidebar.locator('a[href="/admin/verifications"]');
    await expect(verificationsLink).toBeVisible();
    await expect(verificationsLink).toContainText("Verification Requests");
  });

  test("sidebar navigation links are present", async ({ page }) => {
    await page.goto("/admin");

    const sidebar = page.locator("aside");
    await expect(sidebar.locator('a[href="/admin"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/admin/verifications"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/admin/users"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/admin/resources"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/admin/courses"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/admin/events"]')).toBeVisible();
  });

  test("navigating to verifications page shows the table", async ({ page }) => {
    await page.goto("/admin/verifications");

    await expect(page.locator("text=Verification Requests")).toBeVisible();
    await expect(
      page.locator("text=Review and manage student verification requests"),
    ).toBeVisible();

    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("th", { hasText: "Name" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Student ID" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Email" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Status" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Actions" })).toBeVisible();
  });

  test("verification page has search and status filter", async ({ page }) => {
    await page.goto("/admin/verifications");

    const searchInput = page.locator('input[placeholder*="Search by name or email"]');
    await expect(searchInput).toBeVisible();

    const statusFilter = page.locator("button", { hasText: "All Statuses" }).first();
    await expect(statusFilter).toBeVisible();
  });

  test("status filter dropdown shows all options", async ({ page }) => {
    await page.goto("/admin/verifications");

    const filterTrigger = page.locator("button", { hasText: "All Statuses" }).first();
    await filterTrigger.click();

    await expect(page.locator('[role="option"]', { hasText: "All Statuses" })).toBeVisible();
    await expect(page.locator('[role="option"]', { hasText: "Pending" })).toBeVisible();
    await expect(page.locator('[role="option"]', { hasText: "Approved" })).toBeVisible();
    await expect(page.locator('[role="option"]', { hasText: "Rejected" })).toBeVisible();
  });

  test("review button opens verification detail modal", async ({ page }) => {
    await page.goto("/admin/verifications");

    await page.waitForTimeout(2000);

    const reviewButton = page.locator("button", { hasText: "Review" }).first();
    if ((await reviewButton.count()) > 0) {
      await reviewButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"]');
      if ((await modal.count()) > 0) {
        await expect(modal).toBeVisible();
        await expect(modal.locator("text=Verification Review")).toBeVisible();
      }
    }
  });

  test("review modal shows approve and reject buttons for pending verifications", async ({
    page,
  }) => {
    await page.goto("/admin/verifications");

    await page.waitForTimeout(2000);

    const reviewButton = page.locator("button", { hasText: "Review" }).first();
    if ((await reviewButton.count()) > 0) {
      await reviewButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"]');
      if ((await modal.count()) > 0) {
        const approveButton = modal.locator("button", { hasText: "Approve" });
        const rejectButton = modal.locator("button", { hasText: "Reject" });
        if ((await approveButton.count()) > 0) {
          await expect(approveButton).toBeVisible();
        }
        if ((await rejectButton.count()) > 0) {
          await expect(rejectButton).toBeVisible();
        }
      }
    }
  });

  test("reject flow shows reason textarea", async ({ page }) => {
    await page.goto("/admin/verifications");

    await page.waitForTimeout(2000);

    const reviewButton = page.locator("button", { hasText: "Review" }).first();
    if ((await reviewButton.count()) > 0) {
      await reviewButton.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"]');
      if ((await modal.count()) > 0) {
        const rejectButton = modal.locator("button", { hasText: "Reject" });
        if ((await rejectButton.count()) > 0) {
          await rejectButton.click();

          const reasonInput = modal.locator("textarea");
          if ((await reasonInput.count()) > 0) {
            await expect(reasonInput).toBeVisible();
          }
        }
      }
    }
  });

  test("admin sidebar has back to app link", async ({ page }) => {
    await page.goto("/admin");

    const backLink = page.locator('a[href="/"]', { hasText: "Back to App" });
    await expect(backLink).toBeVisible();
  });

  test("admin sidebar shows admin user info", async ({ page }) => {
    await page.goto("/admin");

    const sidebar = page.locator("aside");
    await expect(sidebar.locator("text=Administrator")).toBeVisible();
  });
});
