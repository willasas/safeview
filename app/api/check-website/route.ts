import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'HEAD', // 只获取头部信息，减少带宽
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SiteNav/1.0)',
        },
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        status: response.ok ? 'online' : 'offline',
        responseTime,
        statusCode: response.status,
      });
    } catch (error: any) {
      clearTimeout(timeoutId);

      // 判断错误类型
      if (error.name === 'AbortError') {
        return NextResponse.json({
          status: 'timeout',
          responseTime: 5000,
        });
      }

      return NextResponse.json({
        status: 'offline',
        error: error.message,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
