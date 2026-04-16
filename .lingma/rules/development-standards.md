---
trigger: always_on
---
# 全栈开发规范 Rules

## 1. 代码质量规范

### TypeScript 规范

- ✅ 所有新文件必须使用 TypeScript
- ✅ 避免使用 `any` 类型，使用 `unknown` 或具体类型
- ✅ 为函数参数和返回值定义类型
- ✅ 使用接口（interface）定义对象结构
- ✅ 启用严格模式（strict: true）

```typescript

// ❌ Bad
function getData(id) {
  return fetch(`/api/data/${id}`);
}

// ✅ Good
interface UserData {
  id: string;
  name: string;
  email: string;
}

async function getUserData(id: string): Promise<UserData> {
  const response = await fetch(`/api/data/${id}`);
  return response.json();
}

```

### 组件规范

- ✅ 使用函数组件 + Hooks
- ✅ 组件文件名使用 PascalCase
- ✅ 每个组件单一职责
- ✅ Props 使用 interface 定义
- ✅ 添加 PropTypes 或 TypeScript 类型检查

```typescript

// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

```

## 2. 项目结构规范

### 目录组织

```

src/
├── app/              # Next.js App Router
│   ├── api/         # API 路由
│   ├── tools/       # 工具页面
│   └── layout.tsx   # 根布局
├── components/      # 可复用组件
│   ├── ui/         # 基础 UI 组件
│   └── features/   # 功能组件
├── lib/            # 工具函数和配置
├── hooks/          # 自定义 Hooks
├── contexts/       # React Contexts
├── types/          # TypeScript 类型定义
└── styles/         # 全局样式

```

### 文件命名

- 组件：`PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks：`useCamelCase.ts` (e.g., `useAuth.ts`)
- 工具函数：`camelCase.ts` (e.g., `formatDate.ts`)
- 常量：`UPPER_CASE.ts` (e.g., `API_ENDPOINTS.ts`)
- 测试文件：`*.test.ts` 或 `*.spec.ts`

## 3. Git 工作流规范

### 分支策略

- `main`: 生产环境代码
- `dev`: 开发环境代码
- `feature/*`: 功能分支
- `bugfix/*`: 修复分支
- `hotfix/*`: 紧急修复分支

### Commit 消息规范

使用 Conventional Commits 格式：

```

<type>(<scope>): <description>

[optional body]

[optional footer(s)]

```

**Type 类型**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

**示例**:

```bash

feat(nav): 添加网站导航自动检测功能

- 实现批量网站状态检测
- 添加缓存机制避免重复请求
- 优化错误处理和用户提示

Closes #123

```

### PR 规范

- [ ] 代码已通过自检
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 通过了 CI/CD 检查
- [ ] 至少有 1 人 Code Review

## 4. API 设计规范

### RESTful API

- 使用名词复数表示资源：`/api/users` 而非 `/api/user`
- 使用 HTTP 方法表示操作：
  - GET: 获取资源
  - POST: 创建资源
  - PUT: 更新资源（完整）
  - PATCH: 更新资源（部分）
  - DELETE: 删除资源

### 响应格式

```typescript

// 成功响应
{
  success: true,
  data: {...},
  message?: string
}

// 错误响应
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: [...]
  }
}

```

### 状态码使用

- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未认证
- 403: 无权限
- 404: 资源不存在
- 500: 服务器错误

## 5. 性能优化规范

### 前端性能

- ✅ 图片懒加载
- ✅ 代码分割（动态 import）
- ✅ 使用 React.memo 避免不必要的重渲染
- ✅ 使用 useMemo 和 useCallback 优化计算
- ✅ 虚拟滚动处理长列表

```typescript

// ✅ Good: 使用动态导入
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});

// ✅ Good: 使用 useMemo
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

```

### 后端性能

- ✅ 数据库查询添加索引
- ✅ 使用分页避免一次性加载大量数据
- ✅ API 响应缓存
- ✅ 异步处理耗时操作
- ✅ 连接池管理

## 6. 安全规范

### 输入验证

- ✅ 所有用户输入必须验证
- ✅ 使用 Zod 或 Joi 进行 schema 验证
- ✅ 防止 SQL 注入
- ✅ 防止 XSS 攻击
- ✅ 防止 CSRF 攻击

```typescript

import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(150)
});

// 验证输入
const result = userSchema.safeParse(input);
if (!result.success) {
  throw new Error('Invalid input');
}

```

### 认证授权

- ✅ 使用 HTTPS
- ✅ 密码加密存储（bcrypt）
- ✅ JWT token 设置合理过期时间
- ✅ 敏感操作需要二次验证
- ✅ 实施速率限制

## 7. 测试规范

### 测试覆盖率要求

- 单元测试：核心业务逻辑 > 80%
- 集成测试：API 接口 100%
- E2E 测试：关键用户流程 100%

### 测试文件组织

```

src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── lib/
│   ├── utils.ts
│   └── utils.test.ts

```

### 测试命名规范

```typescript

describe('Button', () => {
  it('should render with correct label', () => {
    // ...
  });

  it('should call onClick when clicked', () => {
    // ...
  });

  it('should be disabled when disabled prop is true', () => {
    // ...
  });
});

```

## 8. 文档规范

### 代码注释

- ✅ 公共 API 必须有 JSDoc 注释
- ✅ 复杂逻辑需要解释为什么（而非是什么）
- ✅ TODO 注释需要包含负责人和日期

```typescript

/**
 * 计算两个日期之间的天数差
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @returns 天数差
 * @example
 * ```ts
 * const days = calculateDaysBetween('2024-01-01', '2024-01-10');
 * console.log(days); // 9
 * ```
 */
function calculateDaysBetween(startDate: string, endDate: string): number {
  // 实现...
}

```

### README 必需内容

- 项目简介
- 技术栈
- 快速开始
- 项目结构
- 贡献指南
- 许可证

## 9. 国际化规范

### 翻译键命名

- 使用点号分隔的层级结构
- 使用小写字母和下划线
- 按功能模块分组

```json

{
  "common": {
    "appName": "DC工具集",
    "loading": "加载中..."
  },
  "nav": {
    "home": "首页",
    "tools": "工具"
  },
  "tools": {
    "nsfwDetector": {
      "title": "NSFW 检测",
      "uploadImage": "上传图片"
    }
  }
}

```

### 使用规范

- ✅ 所有用户可见文本必须国际化
- ✅ 不要在代码中硬编码文本
- ✅ 提供默认语言（中文）
- ✅ 支持 RTL 语言（如需要）

## 10. 部署规范

### 环境变量管理

- ✅ 敏感信息必须使用环境变量
- ✅ 区分开发、测试、生产环境
- ✅ 提供 `.env.example` 模板
- ✅ 不要提交 `.env` 文件到 Git
- ✅ 使用 `NEXT_PUBLIC_` 前缀暴露给客户端

### CI/CD 流程

- ✅ 每次 push 触发自动化测试
- ✅ 合并到 main 前必须通过所有检查
- ✅ 自动化部署到 staging 环境
- ✅ 手动确认部署到 production
- ✅ 部署后运行冒烟测试

### 监控和日志

- ✅ 记录关键操作日志
- ✅ 错误追踪和报警（Sentry）
- ✅ 性能监控（Lighthouse CI）
- ✅ 用户行为分析（可选）
- ✅ 设置合理的日志级别

## 11. 错误处理规范

### 前端错误处理

```typescript

// ✅ Good: 统一的错误处理
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  if (error instanceof TypeError) {
    // 网络错误
    toast.error('网络连接失败，请检查网络');
  } else if (error instanceof Error) {
    // 业务错误
    toast.error(error.message);
  } else {
    // 未知错误
    toast.error('发生未知错误');
    console.error('Unexpected error:', error);
  }
}

```

### 后端错误处理

```typescript

// API Route 错误处理
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 业务逻辑
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

```

### 错误边界

- ✅ React Error Boundary 捕获组件错误
- ✅ Next.js error.tsx 处理页面级错误
- ✅ 全局错误处理器记录未捕获异常

## 12. 日志规范

### 日志级别

- `console.log`: 开发环境调试信息
- `console.warn`: 警告信息（生产环境保留）
- `console.error`: 错误信息（生产环境保留）
- `console.debug`: 详细调试（仅开发环境）

### 最佳实践

```typescript

// ❌ Bad: 生产环境遗留调试日志
console.log('user data:', userData);

// ✅ Good: 条件日志
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info:', data);
}

// ✅ Good: 结构化错误日志
console.error('Failed to fetch user', {
  userId,
  error: error.message,
  timestamp: new Date().toISOString()
});

```

### 禁止事项

- ❌ 不要在生产环境输出敏感信息
- ❌ 不要使用 alert() 调试
- ❌ 不要遗留 console.log 在提交代码中
- ❌ 不要吞掉错误（空的 catch 块）

## 13. 性能指标要求

### Core Web Vitals 目标

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 800ms

### 性能优化检查清单

- [ ] 图片使用 WebP/AVIF 格式
- [ ] 图片懒加载和适当尺寸
- [ ] 代码分割和动态导入
- [ ] 字体优化（font-display: swap）
- [ ] 减少第三方脚本
- [ ] 启用 gzip/brotli 压缩
- [ ] 使用 CDN 加速静态资源
- [ ] 数据库查询添加索引
- [ ] API 响应缓存策略
- [ ] 避免内存泄漏

### 性能监控

```typescript

// 使用 web-vitals 库监控
import { getLCP, getFID, getCLS } from 'web-vitals';

getLCP(console.log);
getFID(console.log);
getCLS(console.log);

```
