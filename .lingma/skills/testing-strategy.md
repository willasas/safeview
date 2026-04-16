# Testing Strategy Skill

## 适用场景

当你需要编写测试、制定测试策略或提高测试覆盖率时。

## 测试金字塔

```

       /\
      /  \     E2E Tests (10%)
     /----\
    /      \   Integration Tests (20%)
   /--------\
  /          \ Unit Tests (70%)
 /------------\

```

## 测试类型

### 1. 单元测试 (Unit Tests)

测试单个函数或组件的 isolated 行为

**工具**: Jest, Vitest
**覆盖率目标**: > 80%

```typescript

// utils/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  it('should handle invalid date', () => {
    expect(() => formatDate(null)).toThrow('Invalid date');
  });

  it('should support custom format', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date, 'MM/DD/YYYY')).toBe('01/15/2024');
  });
});

```

### 2. 集成测试 (Integration Tests)

测试多个模块之间的交互

**工具**: Jest + React Testing Library
**覆盖率目标**: 关键路径 100%

```typescript

// components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { mockAuthProvider } from '@/test/mocks/auth';

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    const onSubmit = jest.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('should show error for invalid email', async () => {
    render(<LoginForm onSubmit={() => {}} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});

```

### 3. E2E 测试 (End-to-End Tests)

测试完整的用户流程

**工具**: Playwright, Cypress
**覆盖率目标**: 关键用户流程 100%

```typescript

// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    // 访问登录页
    await page.goto('/login');

    // 填写表单
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');

    // 提交
    await page.click('button[type="submit"]');

    // 验证跳转
    await expect(page).toHaveURL('/dashboard');

    // 验证用户信息
    await expect(page.locator('.user-name')).toContainText('John Doe');
  });

  test('should show error for wrong password', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'wrong-password');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message'))
      .toContainText('Invalid credentials');
  });

  test('should remember user preference', async ({ page }) => {
    await page.goto('/login');

    // 勾选记住我
    await page.check('input[name="remember"]');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 关闭浏览器并重新打开
    await page.context().clearCookies();
    await page.goto('/');

    // 验证仍然登录
    await expect(page).toHaveURL('/dashboard');
  });
});

```

## 测试最佳实践

### AAA 模式

```typescript

it('should calculate total correctly', () => {
  // Arrange - 准备
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ];

  // Act - 执行
  const total = calculateTotal(items);

  // Assert - 断言
  expect(total).toBe(250);
});

```

### 测试命名规范

```typescript

// ❌ Bad
it('works', () => {});
it('test 1', () => {});

// ✅ Good
it('should return empty array when no items', () => {});
it('should throw error when price is negative', () => {});
it('should apply discount for premium users', () => {});

```

### Mock 和 Stub

```typescript

// ✅ Good: Mock API 调用
jest.mock('@/lib/api', () => ({
  fetchUsers: jest.fn(),
}));

import { fetchUsers } from '@/lib/api';

describe('UserList', () => {
  it('should display users', async () => {
    const mockUsers = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];

    (fetchUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(<UserList />);

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();
  });
});

// ✅ Good: Mock Timer
jest.useFakeTimers();

it('should debounce input', () => {
  const onChange = jest.fn();
  render(<SearchInput onChange={onChange} />);

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'test' }
  });

  // Fast-forward time
  jest.advanceTimersByTime(300);

  expect(onChange).toHaveBeenCalledWith('test');
});

```

### 测试数据工厂

```typescript

// test/factories/user.ts
export function createUser(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
    ...overrides
  };
}

// 使用
const adminUser = createUser({ role: 'admin' });
const inactiveUser = createUser({ isActive: false });

```

## React 组件测试

### 渲染测试

```typescript

import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should apply variant classes', () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

```

### 交互测试

```typescript

import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

describe('Counter', () => {
  it('should increment on click', () => {
    render(<Counter />);

    const button = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(button);

    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('should call onChange when count changes', () => {
    const onChange = jest.fn();
    render(<Counter onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /increment/i }));

    expect(onChange).toHaveBeenCalledWith(1);
  });
});

```

### Hooks 测试

```typescript

import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should reset', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });
});

```

## API 测试

### REST API 测试

```typescript

// tests/api/users.test.ts
import { test, expect } from '@playwright/test';

test.describe('Users API', () => {
  test('GET /api/users should return users', async ({ request }) => {
    const response = await request.get('/api/users');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
  });

  test('POST /api/users should create user', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const user = await response.json();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
  });

  test('should validate input', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: {
        name: '',
        email: 'invalid-email'
      }
    });

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.errors).toBeDefined();
  });
});

```

## 测试配置

### Jest 配置

```javascript

// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

```

### Playwright 配置

```typescript

// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
});

```

## CI/CD 集成

### GitHub Actions

```yaml

# .github/workflows/test.yml

name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3

```

## 测试命令

```json

{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test && pnpm test:e2e"
  }
}

```

## 常见测试场景

### 异步操作

```typescript

it('should fetch data', async () => {
  const { result } = renderHook(() => useFetchData());

  // Wait for data to load
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });

  expect(result.current.loading).toBe(false);
});

```

### 错误处理

```typescript

it('should handle fetch error', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

  const { result } = renderHook(() => useFetchData());

  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
  });
});

```

### 条件渲染

```typescript

it('should show loading state', () => {
  render(<DataList loading={true} />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

it('should show empty state', () => {
  render(<DataList data={[]} />);
  expect(screen.getByText(/no data/i)).toBeInTheDocument();
});

```

## 测试检查清单

### 单元测试

- [ ] 测试所有公共函数
- [ ] 覆盖边界情况
- [ ] 测试错误处理
- [ ] Mock 外部依赖
- [ ] 保持测试独立

### 集成测试

- [ ] 测试组件交互
- [ ] 测试状态管理
- [ ] 测试 API 调用
- [ ] 测试路由导航
- [ ] 测试表单提交

### E2E 测试

- [ ] 测试关键用户流程
- [ ] 跨浏览器测试
- [ ] 测试响应式设计
- [ ] 测试无障碍功能
- [ ] 测试性能指标

## 测试工具推荐

### 测试框架

- **Jest**: JavaScript 测试框架
- **Vitest**: Vite 原生测试框架
- **Playwright**: E2E 测试
- **Cypress**: E2E 测试（备选）

### 测试库

- **@testing-library/react**: React 组件测试
- **@testing-library/user-event**: 用户交互模拟
- **msw**: API Mock
- **faker**: 测试数据生成

### 代码覆盖率

- **Istanbul/nyc**: 覆盖率报告
- **Codecov**: 覆盖率可视化
- **Coveralls**: 覆盖率追踪

### 性能测试

- **k6**: 负载测试
- **Artillery**: API 性能测试
- **Lighthouse CI**: 自动化性能审计
