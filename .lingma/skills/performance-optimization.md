# Performance Optimization Skill

## 适用场景

当你需要优化应用性能、解决性能瓶颈或提升用户体验时。

## 性能分析流程

### Step 1: 性能审计

使用工具识别问题：

```bash
# Lighthouse CLI
npx lighthouse http://localhost:3000 --view

# Web Vitals 监控
npm install web-vitals
```

### Step 2: 定位瓶颈

- **网络层面**: 检查 Network 面板，找出慢请求
- **渲染层面**: 使用 React DevTools Profiler
- **JavaScript**: Chrome Performance 面板录制
- **内存**: Memory 面板检测泄漏

### Step 3: 制定优化方案

根据瓶颈类型选择对应策略

## 前端性能优化

### 1. 代码分割

```typescript

// ✅ Good: 动态导入大型组件
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // 如果不需要 SSR
});

// ✅ Good: 路由级别代码分割（Next.js 自动处理）
// app/dashboard/page.tsx 会自动分割
```

### 2. 图片优化

```typescript

// ✅ Good: 使用 Next.js Image 组件
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false} // 首屏外图片设为 false
  placeholder="blur" // 模糊占位
  quality={75} // 压缩质量
/>

// ✅ Good: 使用现代格式
// WebP, AVIF 比 JPEG/PNG 小 25-35%
```

### 3. 字体优化

```css

/* ✅ Good: 字体加载策略 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* 避免 FOIT */
}

/* ✅ Good: 预加载关键字体 */
<link rel="preload" href="/fonts/heading.woff2" as="font" crossorigin />
```

### 4. 减少重渲染

```typescript

// ✅ Good: 使用 React.memo
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
});

// ✅ Good: 使用 useMemo 缓存计算结果
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.value - b.value);
}, [items]);

// ✅ Good: 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ Bad: 每次渲染都创建新对象
<Component style={{ marginTop: 10 }} />

// ✅ Good: 提取样式对象
const style = { marginTop: 10 };
<Component style={style} />
```

### 5. 虚拟滚动

```typescript

// ✅ Good: 长列表使用虚拟滚动
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div key={virtualItem.key} style={{ height: `${virtualItem.size}px` }}>
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. 懒加载

```typescript

// ✅ Good: 图片懒加载
<img loading="lazy" src="image.jpg" alt="..." />

// ✅ Good: Intersection Observer API
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadContent();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(ref.current);
  return () => observer.disconnect();
}, []);
```

## 后端性能优化

### 1. 数据库优化

```typescript

// ✅ Good: 添加索引
// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())

  @@index([email])
  @@index([createdAt])
}

// ✅ Good: 只查询需要的字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    // 不要 select *
  },
  take: 20, // 限制数量
  skip: page * 20, // 分页
});

// ✅ Good: 批量操作
await prisma.user.createMany({
  data: users,
});
```

### 2. API 缓存策略

```typescript

// ✅ Good: Next.js ISR (Incremental Static Regeneration)
export const revalidate = 60; // 60秒重新验证

// ✅ Good: 手动缓存
import { cache } from 'react';

const getCachedData = cache(async (id: string) => {
  return await fetchData(id);
});

// ✅ Good: HTTP 缓存头
export async function GET() {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

### 3. 连接池管理

```typescript

// ✅ Good: Prisma 默认使用连接池
// 生产环境配置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

## 性能监控

### Core Web Vitals 监控

```typescript

// app/layout.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // 发送到分析服务
    console.log(metric);

    // 或者发送到你的分析端点
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
      }),
    });
  });

  return null;
}
```

### 性能预算

设置性能目标并强制执行：

```json

// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "lighthouse-ci assert"
    ]
  }
}

// .lighthouserc.json
{
  "assertions": {
    "categories:performance": ["error", {"minScore": 0.9}],
    "first-contentful-paint": ["warn", {"maxNumericValue": 1800}],
    "largest-contentful-paint": ["error", {"maxNumericValue": 2500}]
  }
}
```

## 常见性能问题及解决方案

### 问题 1: 首次加载慢

**症状**: FCP > 3s, LCP > 4s

**解决方案**:

- [ ] 启用 gzip/brotli 压缩
- [ ] 使用 CDN 加速静态资源
- [ ] 代码分割，减小 bundle 大小
- [ ] 预加载关键资源
- [ ] 优化图片（WebP + 适当尺寸）
- [ ] 移除未使用的依赖

### 问题 2: 交互卡顿

**症状**: FID > 300ms, 页面响应慢

**解决方案**:

- [ ] 拆分长任务（< 50ms）
- [ ] 使用 Web Workers 处理密集计算
- [ ] 防抖/节流频繁触发的事件
- [ ] 虚拟化长列表
- [ ] 延迟加载非关键 JavaScript

### 问题 3: 内存泄漏

**症状**: 内存使用持续增长

**解决方案**:

- [ ] 清理事件监听器
- [ ] 清除定时器（setTimeout/setInterval）
- [ ] 断开不用的引用
- [ ] 使用 WeakMap/WeakSet
- [ ] 定期检查 Chrome Memory 面板

### 问题 4: 布局偏移

**症状**: CLS > 0.25, 页面跳动

**解决方案**:

- [ ] 为图片和视频设置宽高
- [ ] 避免动态插入内容上方
- [ ] 使用 transform 而非 top/left
- [ ] 预留广告位空间
- [ ] 字体加载时使用 font-display: swap

## 性能优化工具箱

### 分析工具

- **Lighthouse**: 综合性能审计
- **WebPageTest**: 深度性能分析
- **Chrome DevTools**: 实时调试
- **React DevTools**: 组件性能
- **Bundle Analyzer**: Bundle 大小分析

### 监控工具

- **Sentry**: 错误和性能监控
- **Datadog**: 全栈监控
- **New Relic**: APM 监控
- **Google Analytics**: 用户行为

### 优化库

- `@tanstack/react-query`: 数据获取和缓存
- `@tanstack/react-virtual`: 虚拟滚动
- `sharp`: 图片处理
- `compression`: Gzip/Brotli 压缩
- `redis`: 缓存层

## 性能检查清单

### 开发阶段

- [ ] 使用 TypeScript 严格模式
- [ ] 启用 ESLint 性能规则
- [ ] 定期运行 Lighthouse
- [ ] 监控 bundle 大小变化
- [ ] 测试不同网络条件

### 上线前

- [ ] 所有图片已优化
- [ ] 启用 CDN
- [ ] 配置缓存策略
- [ ] 压缩静态资源
- [ ] 移除 console.log
- [ ] 性能测试通过

### 上线后

- [ ] 监控 Core Web Vitals
- [ ] 收集真实性能数据 (RUM)
- [ ] 定期性能审计
- [ ] A/B 测试优化效果
- [ ] 持续迭代改进
