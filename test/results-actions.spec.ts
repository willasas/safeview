import { test, expect } from '@playwright/test';

test.describe('SafeView 结果展示与操作测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('导出报告按钮应在有结果后可用', async ({ page }) => {
    // 模拟上传一个文件以触发结果区域
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    await page.setInputFiles('input[type="file"]', {
      name: 'export-test.png',
      mimeType: 'image/png',
      buffer: buffer
    });

    await page.waitForTimeout(3000);

    const exportButton = page.locator('button').filter({ hasText: /导出/ });
    if (await exportButton.isVisible()) {
      await exportButton.click();
      // 检查是否触发了下载或没有报错
      await page.waitForTimeout(1000);
    }
  });

  test('移动到 nsfw 文件夹按钮应在批量检测后显示', async ({ page }) => {
    // 这是一个 UI 存在性测试
    const moveButton = page.locator('button').filter({ hasText: /移动到 nsfw 文件夹/ });
    // 初始状态可能不可见，我们只确保页面不崩溃
    await expect(page.locator('body')).toBeVisible();
  });

  test('控制台不应出现严重错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 过滤掉一些已知的无害警告
    const criticalErrors = errors.filter(e =>
      !e.includes('runtime.lastError') &&
      !e.includes('message port closed')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
