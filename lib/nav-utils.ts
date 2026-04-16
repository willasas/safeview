// 检测单个网站可用性
export async function checkWebsiteStatus(url: string): Promise<{
  status: 'online' | 'offline' | 'timeout' | 'unknown';
  responseTime?: number;
}> {
  try {
    const response = await fetch('/api/check-website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      // API 请求失败，但不记录详细错误到控制台
      return { status: 'unknown' };
    }

    const data = await response.json();
    return {
      status: data.status,
      responseTime: data.responseTime,
    };
  } catch (error) {
    // 静默失败，不污染控制台
    return { status: 'unknown' };
  }
}

// 批量检测网站可用性
export async function checkWebsitesBatch(
  urls: Array<{ id: string; url: string }>
): Promise<Map<string, { status: string; responseTime?: number }>> {
  const results = new Map();

  // 限制并发数量为 3，避免过多的并发请求
  const batchSize = 3;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(async ({ id, url }) => {
      const result = await checkWebsiteStatus(url);
      results.set(id, result);
    });

    await Promise.all(promises);
  }

  return results;
}

// 检查是否需要自动检测（超过 7 天）
export function shouldAutoCheck(lastCheckTime: string | null): boolean {
  if (!lastCheckTime) return true;

  const lastCheck = new Date(lastCheckTime).getTime();
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 天

  return now - lastCheck > sevenDays;
}

// 格式化响应时间
export function formatResponseTime(ms?: number): string {
  if (!ms) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// 生成唯一 ID
export function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// URL 验证
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
