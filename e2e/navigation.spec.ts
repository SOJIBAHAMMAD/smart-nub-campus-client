import { test, expect } from "@playwright/test";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Resources", href: "/resources" },
  { label: "Teams", href: "/teams" },
  { label: "Discussions", href: "/discussions" },
  { label: "Q&A", href: "/qa" },
  { label: "AI Assistant", href: "/ai" },
  { label: "Connections", href: "/connections" },
  { label: "Messages", href: "/messages" },
];

test.describe("TopNav Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the TopNav on the home page", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("logo is visible and links back to home", async ({ page }) => {
    const logo = page.locator('header a[aria-label="Smart NUB Campus — Go to home page"]');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("all desktop navigation links are visible", async ({ page }) => {
    const nav = page.locator('header nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();

    for (const item of NAV_ITEMS) {
      const link = nav.locator(`a[href="${item.href}"]`);
      await expect(link).toBeVisible();
    }
  });

  test("clicking a nav link navigates to the correct page", async ({ page }) => {
    for (const item of NAV_ITEMS) {
      await page.goto("/");
      const nav = page.locator('header nav[aria-label="Main navigation"]');
      const link = nav.locator(`a[href="${item.href}"]`);
      await link.click();
      await page.waitForURL(`**${item.href}`);
      expect(page.url()).toContain(item.href);
    }
  });

  test("active nav link is highlighted with primary styling", async ({ page }) => {
    await page.goto("/resources");
    const nav = page.locator('header nav[aria-label="Main navigation"]');
    const resourcesLink = nav.locator('a[href="/resources"]');
    await expect(resourcesLink).toHaveClass(/bg-primary\/10/);
  });

  test("search input is functional on desktop", async ({ page }) => {
    const searchInput = page.locator('header input[type="search"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test query");
    await expect(searchInput).toHaveValue("test query");
  });

  test("mobile hamburger menu opens and shows nav links", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('header button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const mobileNav = page.locator('header nav[aria-label="Mobile navigation"]');
    await expect(mobileNav).toBeVisible();

    for (const item of NAV_ITEMS) {
      const link = mobileNav.locator(`a[href="${item.href}"]`);
      await expect(link).toBeVisible();
    }
  });

  test("mobile menu closes when a nav link is clicked", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('header button[aria-label="Open menu"]');
    await menuButton.click();

    const mobileNav = page.locator('header nav[aria-label="Mobile navigation"]');
    await expect(mobileNav).toBeVisible();

    await mobileNav.locator('a[href="/resources"]').click();
    await page.waitForURL("**/resources");

    await expect(mobileNav).not.toBeVisible();
  });

  test("theme toggle button is visible and clickable", async ({ page }) => {
    const themeButton = page.locator('header button[aria-label*="Switch to"]');
    await expect(themeButton).toBeVisible();
    await themeButton.click();
    await themeButton.click();
  });

  test("notification bell links to notifications page", async ({ page }) => {
    const bellLink = page.locator('header a[aria-label*="Notifications"]');
    await expect(bellLink).toBeVisible();
    await expect(bellLink).toHaveAttribute("href", "/notifications");
  });
});
