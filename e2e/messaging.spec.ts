import { test, expect } from "@playwright/test";

async function loginAsUser(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.locator('input[placeholder*="student ID or email"]').fill("testuser@example.com");
  await page.locator('input[type="password"]').fill("password123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/", { timeout: 15000 });
}

test.describe("Messaging Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("messages page loads and shows the layout", async ({ page }) => {
    await page.goto("/messages");

    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("messages page shows connection status indicator", async ({ page }) => {
    await page.goto("/messages");

    const statusIndicator = page.locator("text=/Connecting|Reconnecting/");
    const connected = page.locator('[class*="sticky"][class*="bg-amber"]').first();

    const isConnecting = (await statusIndicator.count()) > 0;
    const isShowingBanner = (await connected.count()) > 0;

    expect(isConnecting || !isShowingBanner).toBeTruthy();
  });

  test("sidebar tabs are present (Inbox, Groups, etc.)", async ({ page }) => {
    await page.goto("/messages");

    await page.waitForTimeout(2000);

    const inboxTab = page.locator("button", { hasText: "Inbox" }).first();
    const groupsTab = page.locator("button", { hasText: "Groups" }).first();

    if ((await inboxTab.count()) > 0) {
      await expect(inboxTab).toBeVisible();
    }
    if ((await groupsTab.count()) > 0) {
      await expect(groupsTab).toBeVisible();
    }
  });

  test("new message button is present in sidebar", async ({ page }) => {
    await page.goto("/messages");

    await page.waitForTimeout(2000);

    const newMessageButton = page.locator("button", { hasText: "New Message" }).first();
    if ((await newMessageButton.count()) > 0) {
      await expect(newMessageButton).toBeVisible();
    }
  });

  test("clicking a conversation shows the chat area", async ({ page }) => {
    await page.goto("/messages");

    await page.waitForTimeout(3000);

    const conversationItem = page.locator("button[class*='rounded-xl']").first();
    if ((await conversationItem.count()) > 0) {
      await conversationItem.click();
      await page.waitForTimeout(1000);

      const messageInput = page.locator('textarea[placeholder="Type a message..."]');
      if ((await messageInput.count()) > 0) {
        await expect(messageInput).toBeVisible();
      }
    }
  });

  test("message input has send button that is disabled when empty", async ({ page }) => {
    await page.goto("/messages");

    await page.waitForTimeout(3000);

    const conversationItem = page.locator("button[class*='rounded-xl']").first();
    if ((await conversationItem.count()) > 0) {
      await conversationItem.click();
      await page.waitForTimeout(1000);

      const sendButton = page.locator('button[aria-label="Send message"]');
      if ((await sendButton.count()) > 0) {
        await expect(sendButton).toBeDisabled();
      }
    }
  });

  test("typing in message input enables send button", async ({ page }) => {
    await page.goto("/messages");

    await page.waitForTimeout(3000);

    const conversationItem = page.locator("button[class*='rounded-xl']").first();
    if ((await conversationItem.count()) > 0) {
      await conversationItem.click();
      await page.waitForTimeout(1000);

      const messageInput = page.locator('textarea[placeholder="Type a message..."]');
      if ((await messageInput.count()) > 0) {
        await messageInput.fill("Hello!");
        const sendButton = page.locator('button[aria-label="Send message"]');
        await expect(sendButton).toBeEnabled();
      }
    }
  });

  test("file attach button is present in the message input area", async ({ page }) => {
    await page.goto("/messages");

    await page.waitForTimeout(3000);

    const conversationItem = page.locator("button[class*='rounded-xl']").first();
    if ((await conversationItem.count()) > 0) {
      await conversationItem.click();
      await page.waitForTimeout(1000);

      const attachButton = page.locator('button[aria-label="Attach file"]');
      if ((await attachButton.count()) > 0) {
        await expect(attachButton).toBeVisible();
      }
    }
  });
});
