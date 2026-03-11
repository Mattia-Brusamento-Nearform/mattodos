import { test, expect } from "@playwright/test";

test.describe("Delete Todo", () => {
  test("should show confirmation dialog when delete button clicked", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[aria-label=\"New todo\"]");
    await input.fill("To delete");
    await input.press("Enter");
    await page.waitForTimeout(200);
    // Click delete button - it should be the button with SVG/icon in the first todo
    const deleteBtn = page.locator("li").first().locator("button").last();
    await deleteBtn.click();
    await expect(page.locator("[role=\"dialog\"]")).toBeVisible({ timeout: 5000 });
  });

  test("should close dialog without deleting when Cancel clicked", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[aria-label=\"New todo\"]");
    await input.fill("Keep this");
    await input.press("Enter");
    await page.waitForTimeout(200);
    // Click delete button
    const deleteBtn = page.locator("li").first().locator("button").last();
    await deleteBtn.click();
    await page.waitForTimeout(100);
    // Click cancel
    const cancelBtn = page.locator("[role=\"dialog\"]").locator("button").filter({ hasText: "Cancel" });
    await cancelBtn.click();
    // Verify todo still exists
    await page.waitForTimeout(300);
    await expect(page.locator("ul").locator("li").first()).toContainText("Keep this");
  });

  test("should delete todo when Delete button confirmed", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[aria-label=\"New todo\"]");
    await input.fill("To be deleted");
    await input.press("Enter");
    await page.waitForTimeout(200);
    // Get the original todo count
    const listBefore = page.locator("ul li");
    const countBefore = await listBefore.count();
    // Click delete button
    const deleteBtn = page.locator("li").first().locator("button").last();
    await deleteBtn.click();
    await page.waitForTimeout(100);
    // Click confirm delete
    const confirmBtn = page.locator("[role=\"dialog\"]").locator("button").filter({ hasText: /^Delete$/ });
    await confirmBtn.click();
    // Wait for deletion to complete
    await page.waitForTimeout(500);
    // Verify todo was deleted
    const listAfter = page.locator("ul li");
    const countAfter = await listAfter.count();
    expect(countAfter).toBeLessThan(countBefore);
    // Verify the specific text is gone
    await expect(page.locator("ul")).not.toContainText("To be deleted");
  });
});
