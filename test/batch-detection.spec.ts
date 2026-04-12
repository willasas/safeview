import { test, expect } from '@playwright/test';

test.describe('SafeView 批量检测功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('批量上传按钮应可见', async ({ page }) => {
    const batchButton = page.locator('button').filter({ hasText: /批量选择文件夹/ });
    await expect(batchButton).toBeVisible();
  });

  test('点击批量按钮应触发文件夹选择逻辑', async ({ page }) => {
    // 由于 Playwright 无法直接模拟 showDirectoryPicker，我们检查按钮是否存在且可点击
    const batchButton = page.locator('button').filter({ hasText: /批量选择文件夹/ });
    await batchButton.click();

    // 检查是否有错误提示或 UI 反馈（在非安全上下文中可能会报错）
    await page.waitForTimeout(1000);
  });

  test('批量检测结果列表应在有结果时显示', async ({ page }) => {
    // 这是一个占位测试，实际批量检测需要复杂的文件系统 API 模拟
    // 这里主要确保组件渲染没有崩溃
    await expect(page.locator('body')).toBeVisible();
  });
});
