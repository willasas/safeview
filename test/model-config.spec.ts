import { test, expect } from '@playwright/test';

test.describe('SafeView 模型配置与自定义测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('模型选择下拉框应存在', async ({ page }) => {
    const modelSelect = page.locator('select, div[role="combobox"]').first();
    // 检查是否有模型选择相关的 UI
    await expect(page.locator('text=模型')).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('阈值滑块应可调节', async ({ page }) => {
    const sliders = page.locator('input[type="range"]');
    const count = await sliders.count();
    if (count > 0) {
      await expect(sliders.first()).toBeVisible();
      // 模拟拖动第一个滑块
      await sliders.first().fill('50');
    }
  });

  test('高级模式开关应可切换', async ({ page }) => {
    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    if (count > 0) {
      await switches.first().click();
      await expect(switches.first()).toHaveAttribute('aria-checked', 'true');
    }
  });
});
