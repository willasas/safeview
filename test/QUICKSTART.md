# SafeView 测试快速开始

## 🚀 快速运行测试

### 方法 1: 浏览器控制台（推荐）

#### 选项 A: 使用自动加载（最简单）

1. 启动开发服务器：
```bash
pnpm dev
```

2. 打开浏览器访问 `http://localhost:3000`

3. 打开开发者工具（F12），切换到 Console 标签

4. 在控制台中输入：
```javascript
// 运行所有测试
runAllTests()

// 或者运行单个测试套件
runDetectionResultTests()
runFileUploadTests()
runUseNSFWTests()
runIntegrationTests()
```

#### 选项 B: 手动加载测试脚本

如果选项 A 不工作，可以手动加载测试脚本：

1. 启动开发服务器：
```bash
pnpm dev
```

2. 打开浏览器访问 `http://localhost:3000`

3. 打开开发者工具（F12），切换到 Console 标签

4. 复制并粘贴 `test/browser-tests.js` 文件的全部内容到控制台

5. 按 Enter 运行

6. 然后输入：
```javascript
runAllTests()
```

### 方法 2: Node.js 环境

```bash
# 编译 TypeScript
pnpm build

# 运行测试
node test/run-tests.js
```

## 📋 测试清单

运行测试后，你应该看到类似以下的输出：

```
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
Starting SafeView Test Suite
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

🧪 Running DetectionResult Tests...

✅ Test 1 Passed: Safe result data structure
✅ Test 2 Passed: Unsafe result data structure
✅ Test 3 Passed: Video frame results
✅ Test 4 Passed: NSFW classification logic
✅ Test 5 Passed: Empty predictions handling
✅ Test 6 Passed: Probability sum validation
✅ Test 7 Passed: Performance metrics calculation
✅ Test 8 Passed: Category labels mapping

==================================================
📊 Test Results: 8 passed, 0 failed
==================================================

🧪 Running FileUpload Tests...

✅ Test 1 Passed: Image file validation
✅ Test 2 Passed: Video file validation
✅ Test 3 Passed: Non-media file rejection
✅ Test 4 Passed: Multiple image formats
✅ Test 5 Passed: File size handling
✅ Test 6 Passed: File size limit check
✅ Test 7 Passed: Object URL management
✅ Test 8 Passed: Accept attribute validation
✅ Test 9 Passed: Empty filename handling
✅ Test 10 Passed: Zero byte file handling
✅ Test 11 Passed: Special character filename

==================================================
📊 Test Results: 11 passed, 0 failed
==================================================

🧪 Running use-nsfw Hook Tests...

✅ Test 1 Passed: Safe content classification
✅ Test 2 Passed: Porn content classification
✅ Test 3 Passed: Sexy content above threshold
✅ Test 4 Passed: Sexy content below threshold
✅ Test 5 Passed: Hentai content classification
✅ Test 6 Passed: Get highest category
✅ Test 7 Passed: Empty predictions handling
✅ Test 8 Passed: Boundary value (equal to threshold)
✅ Test 9 Passed: Boundary value (above threshold)
✅ Test 10 Passed: Multiple NSFW categories
✅ Test 11 Passed: Complete NSFWResult construction
✅ Test 12 Passed: High precision probability handling

==================================================
📊 Test Results: 12 passed, 0 failed
==================================================

🧪 Running Integration Tests...

✅ Test 1 Passed: Complete image detection flow
✅ Test 2 Passed: Complete video detection flow
✅ Test 3 Passed: Reset functionality
✅ Test 4 Passed: Error handling
✅ Test 5 Passed: Loading progress tracking
✅ Test 6 Passed: Mixed file type handling
✅ Test 7 Passed: Performance metrics aggregation
✅ Test 8 Passed: Classification statistics

==================================================
📊 Integration Test Results: 8 passed, 0 failed
==================================================

🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯
FINAL TEST RESULTS
🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯
Total Tests: 39
✅ Passed: 39
❌ Failed: 0
Success Rate: 100.00%
🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯

✨ All tests passed! ✨
```

## ✅ 预期结果

- **总测试数**: 39
- **通过率**: 100%
- **失败数**: 0

如果有任何测试失败，请检查错误信息并修复相应的问题。

## 🔍 测试覆盖的功能

### DetectionResult 组件
- ✅ 安全/不安全结果显示
- ✅ 视频帧分析
- ✅ 概率进度条
- ✅ 性能指标展示
- ✅ 分类标签映射

### FileUpload 组件
- ✅ 文件类型验证
- ✅ 文件大小限制
- ✅ 拖拽上传
- ✅ 预览管理
- ✅ 边界情况处理

### use-nsfw Hook
- ✅ NSFW 判定逻辑
- ✅ 阈值配置
- ✅ 概率计算
- ✅ 错误处理

### 集成测试
- ✅ 完整检测流程
- ✅ 重置功能
- ✅ 进度追踪
- ✅ 性能统计

## 🐛 故障排除

### 问题 1: 测试函数未定义

**错误**: `runAllTests is not defined`

**解决**:
1. 确保在开发环境中运行（`pnpm dev`）
2. 检查是否在正确的页面（首页）
3. 刷新页面后重试

### 问题 2: 某些测试失败

**解决**:
1. 查看错误详细信息
2. 检查相关组件代码是否有变更
3. 更新测试数据以匹配当前实现

### 问题 3: 浏览器控制台无输出

**解决**:
1. 确认开发者工具已打开
2. 检查 Console 过滤器设置
3. 尝试清除缓存并硬刷新（Ctrl+Shift+R）

## 📝 下一步

- 查看详细文档: [test/README.md](./README.md)
- 添加新的测试用例
- 集成到 CI/CD 流程
- 提高测试覆盖率

## 💡 提示

- 定期运行测试以确保代码质量
- 在修改核心功能后立即运行相关测试
- 为新功能编写对应的测试用例
- 保持测试代码与实现代码同步更新
