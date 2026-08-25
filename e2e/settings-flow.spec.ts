import { test, expect } from "@playwright/test";

async function loginAsUser(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.locator('input[placeholder*="student ID or email"]').fill("testuser@example.com");
  await page.locator('input[type="password"]').fill("password123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/", { timeout: 15000 });
}

test.describe("Settings Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("user dropdown in TopNav contains Settings link", async ({ page }) => {
    const dropdownTrigger = page.locator(
      'header button[class*="rounded-full"], header div[class*="hidden md:block"] button',
    ).first();
    await expect(dropdownTrigger).toBeVisible();
    await dropdownTrigger.click();

    const settingsLink = page.locator('a[href="/settings"]');
    await expect(settingsLink).toBeVisible();
    await expect(settingsLink).toContainText("Settings");
  });

  test("clicking Settings in dropdown navigates to /settings", async ({ page }) => {
    const dropdownTrigger = page.locator(
      'header button[class*="rounded-full"], header div[class*="hidden md:block"] button',
    ).first();
    await dropdownTrigger.click();

    const settingsLink = page.locator('a[href="/settings"]');
    await settingsLink.click();

    await page.waitForURL("**/settings", { timeout: 10000 });
    expect(page.url()).toContain("/settings");
  });

  test("user dropdown contains logout option", async ({ page }) => {
    const dropdownTrigger = page.locator(
      'header button[class*="rounded-full"], header div[class*="hidden md:block"] button',
    ).first();
    await dropdownTrigger.click();

    const logoutButton = page.locator("button", { hasText: "Log out" }).first();
    await expect(logoutButton).toBeVisible();
  });

  test("user dropdown shows user name label", async ({ page }) => {
    const dropdownTrigger = page.locator(
      'header button[class*="rounded-full"], header div[class*="hidden md:block"] button',
    ).first();
    await dropdownTrigger.click();

    const viewProfile = page.locator("text=View profile");
    await expect(viewProfile).toBeVisible();
  });

  test("mobile settings link is accessible in mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('header button[aria-label="Open menu"]');
    await menuButton.click();

    const settingsLink = page.locator('a[href="/settings"]');
    await expect(settingsLink.first()).toBeVisible();
  });

  test("theme toggle works from the TopNav", async ({ page }) => {
    const themeButton = page.locator('header button[aria-label*="Switch to"]').first();
    await expect(themeButton).toBeVisible();

    const htmlBefore = await page.locator("html").getAttribute("class");
    await themeButton.click();
    await page.waitForTimeout(500);
    const htmlAfter = await page.locator("html").getAttribute("class");

    expect(htmlBefore).not.toBe(htmlAfter);
  });
});
