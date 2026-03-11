import { test, expect } from "@playwright/test";

test.describe("Create Todo", () => {
  test("should create a todo with text and Enter key", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[aria-label=\"New todo\"]");
    await input.fill("Buy milk");
    await input.press("Enter");
    // Get the first todo item under the ul
    await page.waitForTimeout(300);
    const todoList = page.locator("ul");
    await expect(todoList.locator("li").first()).toContainText("Buy milk");
  });

  test("should clear input after submission", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[aria-label=\"New todo\"]");
    await input.fill("Test todo");
    await input.press("Enter");
    await expect(input).toHaveValue("");
  });

  test("should refocus input after submission", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[aria-label=\"New todo\"]");
    await input.fill("Test");
    await input.press("Enter");
    await expect(input).toBeFocused();
  });

  test("should ignore empty input on Enter", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[aria-label=\"New todo\"]");
    
    // Get count of todos before pressing Enter on empty input
    const todosBefore = await page.locator("ul li").count();
    
    // Press Enter without typing anything
    await input.press("Enter");
    await page.waitForTimeout(300);
    
    // Verify no new todo was created
    const todosAfter = await page.locator("ul li").count();
    expect(todosAfter).toBe(todosBefore);
  });
});
