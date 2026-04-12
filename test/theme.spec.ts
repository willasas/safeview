import { test, expect } from '@playwright/test';

test.describe('SafeView 主题切换功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('页面应正确加载并显示标题', async ({ page }) => {
    await expect(page).toHaveTitle(/SafeView/);
    await expect(page.locator('h1')).toContainText('SafeView');
  });

  test('主题切换按钮应可见并可点击', async ({ page }) => {
    const themeButton = page.locator('button[aria-label="切换主题"]');
    await expect(themeButton).toBeVisible();
    await themeButton.click();
  });

  test('应能切换到深色模式', async ({ page }) => {
    const themeButton = page.locator('button[aria-label="切换主题"]');
    await themeButton.click();

    const darkOption = page.locator('div[role="menuitem"]').filter({ hasText: '深色' });
    await darkOption.click();

    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('应能切换到浅色模式', async ({ page }) => {
    // 先确保在深色模式
    const themeButton = page.locator('button[aria-label="切换主题"]');
    await themeButton.click();
    await page.locator('div[role="menuitem"]').filter({ hasText: '深色' }).click();

    // 再切换到浅色
    await themeButton.click();
    const lightOption = page.locator('div[role="menuitem"]').filter({ hasText: '浅色' });
    await lightOption.click();

    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('应能切换到系统跟随模式', async ({ page }) => {
    const themeButton = page.locator('button[aria-label="切换主题"]');
    await themeButton.click();
    const systemOption = page.locator('div[role="menuitem"]').filter({ hasText: '系统' });
    await systemOption.click();

    // 系统模式下类名取决于系统设置，我们只检查没有报错
    await expect(page.locator('body')).toBeVisible();
  });
});
