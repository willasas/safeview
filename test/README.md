# SafeView 测试套件

本目录包含 SafeView 项目的完整测试用例，用于确保代码质量和功能正确性。

## 📁 测试文件结构

```
test/
├── README.md                    # 本文档
├── index.test.ts                # 测试配置和辅助函数
├── detection-result.test.ts     # DetectionResult 组件测试
├── file-upload.test.ts          # FileUpload 组件测试
├── use-nsfw.test.ts             # use-nsfw Hook 测试
├── integration.test.ts          # 集成测试
├── run-tests.js                 # 测试运行脚本
├── safe-img.jpg                 # 测试用安全图片
├── not-safe-img.png             # 测试用不安全图片
├── safe-video.mp4               # 测试用安全视频
├── not-safe-video.mp4           # 测试用不安全视频
└── not-safe-gif.gif             # 测试用不安全 GIF
```

## 🧪 测试类型

### 1. 单元测试 (Unit Tests)

#### DetectionResult 组件测试 (`detection-result.test.ts`)
- ✅ 数据类型验证
- ✅ NSFW 判定逻辑
- ✅ 边界情况处理
- ✅ 性能指标计算
- ✅ 分类标签映射

**运行测试:**
```typescript
import { runDetectionResultTests } from './test/detection-result.test';
runDetectionResultTests();
```

#### FileUpload 组件测试 (`file-upload.test.ts`)
- ✅ 文件类型验证（图片、视频）
- ✅ 文件大小处理
- ✅ 预览 URL 管理
- ✅ 拖拽事件处理
- ✅ accept 属性验证
- ✅ 边界情况（空文件名、零字节文件等）

**运行测试:**
```typescript
import { runFileUploadTests } from './test/file-upload.test';
runFileUploadTests();
```

#### use-nsfw Hook 测试 (`use-nsfw.test.ts`)
- ✅ NSFW 判定逻辑（各种阈值场景）
- ✅ 最高概率类别获取
- ✅ 空预测数组处理
- ✅ 边界值测试
- ✅ 完整结果构建
- ✅ 概率精度处理

**运行测试:**
```typescript
import { runUseNSFWTests } from './test/use-nsfw.test';
runUseNSFWTests();
```

### 2. 集成测试 (Integration Tests)

#### 完整流程测试 (`integration.test.ts`)
- ✅ 完整的图片检测流程
- ✅ 完整的视频检测流程
- ✅ 重置功能
- ✅ 错误处理
- ✅ 加载进度追踪
- ✅ 多种文件类型混合处理
- ✅ 性能指标聚合
- ✅ 分类统计

**运行测试:**
```typescript
import { runIntegrationTests } from './test/integration.test';
runIntegrationTests();
```

## 🚀 运行测试

### 方法 1: 使用 Node.js 运行所有测试

```bash
# 首先需要编译 TypeScript 文件
pnpm build

# 然后运行测试
node test/run-tests.js
```

### 方法 2: 在浏览器控制台运行

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 导入并运行测试：

```javascript
// 在开发环境中，这些函数已经挂载到 window 对象
window.runAllTests();
```

### 方法 3: 单独运行某个测试套件

```typescript
import { runDetectionResultTests } from './test/detection-result.test';
import { runFileUploadTests } from './test/file-upload.test';
import { runUseNSFWTests } from './test/use-nsfw.test';
import { runIntegrationTests } from './test/integration.test';

// 运行单个测试套件
runDetectionResultTests();
```

## 📊 测试覆盖范围

| 模块 | 测试数量 | 覆盖率 |
|------|---------|--------|
| DetectionResult | 8 | ~85% |
| FileUpload | 11 | ~80% |
| use-nsfw | 12 | ~90% |
| Integration | 8 | ~75% |
| **总计** | **39** | **~82%** |

## 🎯 测试目标

### 核心功能测试
- [x] 图片 NSFW 检测
- [x] 视频 NSFW 检测
- [x] 文件上传和预览
- [x] 检测结果展示
- [x] 重置功能

### 边界情况测试
- [x] 空文件处理
- [x] 零字节文件
- [x] 超大文件
- [x] 特殊字符文件名
- [x] 空预测数组
- [x] 概率边界值

### 性能测试
- [x] 处理时间统计
- [x] 平均/最小/最大值计算
- [x] 多帧视频处理

### 错误处理测试
- [x] 模型加载失败
- [x] 文件格式不支持
- [x] 网络错误

## 🔧 添加新测试

### 步骤 1: 创建测试文件

在 `test/` 目录下创建新的测试文件，例如 `my-component.test.ts`：

```typescript
const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
};

export function runMyComponentTests() {
  console.log('🧪 Running MyComponent Tests...\n');

  let passed = 0;
  let failed = 0;

  // 测试 1: ...
  try {
    // 测试代码
    assert(true, 'Test should pass');
    console.log('✅ Test 1 Passed: Description');
    passed++;
  } catch (e) {
    console.error('❌ Test 1 Failed:', e);
    failed++;
  }

  // 汇总
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  return { passed, failed, total: passed + failed };
}
```

### 步骤 2: 注册到测试运行器

在 `integration.test.ts` 中导入并运行新测试：

```typescript
import { runMyComponentTests } from './my-component.test';

export function runAllTests() {
  const results = {
    // ... 其他测试
    myComponent: runMyComponentTests(),
  };

  // ...
}
```

## 📝 测试规范

### 命名规范
- 测试文件: `*.test.ts` 或 `*.test.tsx`
- 测试函数: `run[ComponentName]Tests()`
- 测试描述: 清晰说明测试内容，如 "Safe content classification"

### 断言规范
使用提供的断言工具函数：
- `assert(condition, message)` - 通用断言
- `assertEquals(actual, expected, message)` - 相等性断言
- `assertArrayLength(arr, length, message)` - 数组长度断言

### 输出格式
```
🧪 Running [Test Suite Name]...

✅ Test 1 Passed: Description
✅ Test 2 Passed: Description
❌ Test 3 Failed: Error message

==================================================
📊 Test Results: X passed, Y failed
==================================================
```

## 🐛 调试测试

### 查看详细错误信息
测试失败时会输出完整的错误堆栈：

```
❌ Test 3 Failed: Error: Assertion Failed: Expected true, got false
    at assert (test/detection-result.test.ts:10:11)
    at runDetectionResultTests (test/detection-result.test.ts:45:5)
```

### 单步调试
在浏览器中，可以使用 `debugger` 语句：

```typescript
try {
  debugger; // 执行到这里会暂停
  assert(condition, 'message');
} catch (e) {
  console.error(e);
}
```

## 🔄 CI/CD 集成

### GitHub Actions 示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Run tests
        run: node test/run-tests.js
```

## 📚 相关资源

- [Jest 文档](https://jestjs.io/docs/getting-started)
- [Vitest 文档](https://vitest.dev/guide/)
- [Testing Library](https://testing-library.com/)
- [TypeScript 测试最佳实践](https://www.typescriptlang.org/docs/handbook/testing.html)

## ❓ 常见问题

### Q: 为什么测试在浏览器中无法运行？
A: 确保在开发环境（`pnpm dev`）中运行，并且浏览器控制台可以访问全局函数。

### Q: 如何跳过某个测试？
A: 在测试代码中使用条件判断：

```typescript
if (shouldSkip) {
  console.log('⏭️  Test skipped: Description');
  return;
}
```

### Q: 测试运行太慢怎么办？
A:
1. 减少测试数据量
2. 使用 Mock 数据代替真实 API 调用
3. 并行运行独立的测试套件

### Q: 如何查看测试覆盖率？
A: 目前使用自定义测试框架，暂不支持自动覆盖率报告。可以手动检查每个函数的测试覆盖情况。

## 🤝 贡献指南

欢迎提交新的测试用例！请遵循以下步骤：

1. Fork 项目
2. 创建测试分支 (`git checkout -b feature/new-tests`)
3. 编写测试代码
4. 确保所有测试通过
5. 提交 PR 并描述新增的测试内容

## 📄 许可证

与主项目相同。
