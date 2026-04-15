# 测试覆盖率报告

## 📊 当前状态

目前项目使用 Playwright 进行 E2E 测试，暂无单元测试覆盖率统计。

## 🎯 目标

- **短期目标**: 为核心工具函数添加单元测试
- **中期目标**: 达到 60% 代码覆盖率
- **长期目标**: 达到 80%+ 代码覆盖率

## 📝 建议的测试策略

### 1. 单元测试优先级

#### 🔴 高优先级
- [ ] `lib/utils.ts` - 工具函数
- [ ] `lib/nav-utils.ts` - 导航工具函数
- [ ] `lib/error-handler.ts` - 错误处理工具
- [ ] `hooks/use-nsfw.ts` - NSFW 检测逻辑
- [ ] `hooks/use-image-compress.ts` - 图片压缩逻辑

#### 🟡 中优先级
- [ ] `components/detection-result.tsx` - 检测结果组件
- [ ] `components/file-upload.tsx` - 文件上传组件
- [ ] `contexts/i18n-context.tsx` - 国际化上下文

#### 🟢 低优先级
- [ ] UI 组件 (`components/ui/*`)
- [ ] 页面组件 (`app/**/*.tsx`)

### 2. E2E 测试覆盖

当前已有：
- ✅ 批量检测测试
- ✅ 模型配置测试
- ✅ 主题切换测试
- ✅ 结果操作测试

建议补充：
- [ ] 图片压缩功能测试
- [ ] 文本分析功能测试
- [ ] 二维码生成测试
- [ ] 条形码生成测试
- [ ] 支付二维码合并测试

## 🔧 推荐的工具

### 单元测试 + 覆盖率
```bash
# 安装 Vitest（推荐，与 Next.js 兼容性好）
pnpm add -D vitest @vitest/coverage-v8

# 或使用 Jest
pnpm add -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom
```

### 配置文件示例 (vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
      },
    },
  },
});
```

## 📈 监控和改进

### CI/CD 集成
在 GitHub Actions 或 Netlify 构建中添加覆盖率检查：

```yaml
# .github/workflows/test.yml
name: Test and Coverage
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm test:unit --coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

### 可视化报告
- 使用 `coverage/lcov-report/index.html` 查看详细的覆盖率报告
- 集成 Codecov 或 Coveralls 进行在线监控

## 💡 最佳实践

1. **先写测试，再写代码** (TDD)
2. **关注边界条件**和错误处理
3. **保持测试简洁**，一个测试只验证一件事
4. **定期审查**测试用例的有效性
5. **不要为了覆盖率而测试**，质量优先于数量

## 🔗 相关资源

- [Vitest 文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright 文档](https://playwright.dev/)
- [Codecov](https://codecov.io/)

---

**最后更新**: 2026年4月15日
**下次审查**: 2026年5月15日
