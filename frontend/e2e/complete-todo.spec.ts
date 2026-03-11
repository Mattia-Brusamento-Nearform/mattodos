import { test, expect } from "@playwright/test";

test.describe("Complete Todo", () => {
  test("should mark todo as complete when checkbox is clicked", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[aria-label=\"New todo\"]");
    await input.fill("Task 1");
    await input.press("Enter");
    await page.waitForTimeout(200);
    const checkbox = page.locator("li").first().locator("[role=\"checkbox\"]");
    await checkbox.click();
    await page.waitForTimeout(200);
    const todoText = page.locator("li").first().locator(":text-is('Task 1')");
    await expect(todoText).toHaveClass(/line-through/);
  });

  test("should toggle back to incomplete when checkbox clicked again", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[aria-label=\"New todo\"]");
    await input.fill("Task 2");
    await input.press("Enter");
    await page.waitForTimeout(200);
    const checkbox = page.locator("li").first().locator("[role=\"checkbox\"]");
    await checkbox.click();
    await page.waitForTimeout(200);
    await checkbox.click();
    await page.waitForTimeout(200);
    const todoText = page.locator("li").first().locator(":text-is('Task 2')");
    await expect(todoText).not.toHaveClass(/line-through/);
  });
});
