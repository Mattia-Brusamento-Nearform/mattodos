import { test, expect } from "@playwright/test";

test.describe("Error State", () => {
  test("should display error when API is unreachable", async ({ page }) => {
    // Intercept API calls and fail them BEFORE navigating
    await page.route("**/api/todos", (route) => route.abort());
    await page.goto("/");
    await page.waitForTimeout(800);
    await expect(page.locator("main")).toContainText("Unable to load your todos");
    await expect(page.locator("button")).toContainText("Retry");
  });

  test("should retry loading after error", async ({ page }) => {
    // First, set up to intercept and fail the initial request
    await page.route("**/api/todos", (route) => route.abort());
    
    await page.goto("/");
    await page.waitForTimeout(1000);
    
    // Verify error is displayed
    await expect(page.locator("main")).toContainText("Unable to load your todos");
    
    // Unroute the previous handler to allow requests to pass
    await page.unroute("**/api/todos");
    
    // Now click retry - requests will go through normally
    const retryBtn = page.locator("button:has-text('Retry')");
    await retryBtn.click();
    
    // Wait for the retry request and response to complete
    await page.waitForTimeout(1500);
    
    // Should now show empty state (or todos if any exist)
    const mainContent = page.locator("main");
    const hasError = await mainContent.locator(":text-is('Unable to load your todos')").isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
