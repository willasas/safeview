# 如何运行 SafeView 测试

## 🎯 推荐方法（最简单）

### 在浏览器中运行测试

1. **启动开发服务器**
   ```bash
   pnpm dev
   ```
   ⚠️ **注意**: 这是在**命令行终端**（PowerShell/CMD）中运行的命令，不是在浏览器控制台中！

2. **打开浏览器**
   - 访问: http://localhost:3000

3. **加载测试工具**

   在浏览器的 **Console**（控制台）中输入以下代码并按 Enter：
   ```javascript
   // 方法 1: 通过 script 标签加载（推荐）
   const script = document.createElement('script');
   script.src = '/test-utils.js';
   document.head.appendChild(script);
   ```

   或者

   ```javascript
   // 方法 2: 直接使用 fetch 加载
   fetch('/test-utils.js').then(r => r.text()).then(eval);
   ```

   你会看到输出：
   ```
   ✅ SafeView test functions loaded successfully!
   💡 Available commands:
      - runAllTests()              // Run all tests
      - runDetectionResultTests()  // DetectionResult tests
      ...
   ```

4. **运行测试**
   ```javascript
   // 运行所有测试
   runAllTests()

   // 或者运行单个测试套件
   runDetectionResultTests()  // DetectionResult 组件测试
   runFileUploadTests()       // FileUpload 组件测试
   runUseNSFWTests()          // use-nsfw Hook 测试
   runIntegrationTests()      // 集成测试
   ```

5. **查看结果**
   - 成功的测试会显示 ✅
   - 失败的测试会显示 ❌ 并附带错误信息
   - 最后会显示总体统计

---

## 📋 其他方法

### 方法 2: 手动加载测试脚本

如果上面的方法不工作，可以手动加载测试脚本：

1. 启动开发服务器: `pnpm dev`
2. 打开浏览器访问 http://localhost:3000
3. 打开开发者工具 (F12)
4. 打开文件 `test/browser-tests.js`
5. 复制全部内容
6. 粘贴到浏览器控制台
7. 按 Enter 运行
8. 输入 `runAllTests()` 运行测试

### 方法 3: 使用 npm script（仅显示提示）

```bash
pnpm test
```

这会显示如何在浏览器中运行测试的说明。

### 方法 4: 查看测试文档

```bash
# 查看快速开始指南
cat test/QUICKSTART.md

# 查看详细文档
cat test/README.md

# 查看测试总结
cat test/SUMMARY.md
```

---

## ❓ 常见问题

### Q: 为什么 `pnpm test` 不直接运行测试？

A: 因为测试文件是用 TypeScript 编写的，需要编译后才能被 Node.js 运行。我们选择了更简单的方案：在浏览器中直接运行测试，这样不需要额外的配置和依赖。

### Q: 控制台显示 "runAllTests is not defined"

A: 这可能是因为：
1. 页面还没有完全加载，等待几秒钟再试
2. 刷新页面后重新输入命令
3. 尝试手动加载测试脚本（见方法 2）

### Q: 如何查看某个具体的测试？

A: 运行单个测试套件：
```javascript
runDetectionResultTests()  // 只看 DetectionResult 的测试
runFileUploadTests()       // 只看 FileUpload 的测试
runUseNSFWTests()          // 只看 use-nsfw 的测试
runIntegrationTests()      // 只看集成测试
```

### Q: 测试失败怎么办？

A:
1. 查看错误信息，了解哪个测试失败了
2. 检查相关的源代码是否有问题
3. 查看测试文件中的测试逻辑是否正确
4. 如果需要，可以暂时跳过失败的测试

### Q: 可以在 CI/CD 中运行这些测试吗？

A: 可以，但需要使用 Playwright 或 Puppeteer 等工具来自动化浏览器操作。目前我们提供了基础的测试框架，你可以根据需要集成到 CI/CD 流程中。

---

## 📊 预期输出

运行 `runAllTests()` 后，你应该看到类似这样的输出：

```
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
Starting SafeView Test Suite
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

🧪 Running DetectionResult Tests...

✅ Test 1 Passed: Safe result data structure
✅ Test 2 Passed: Unsafe result data structure
...

==================================================
📊 Test Results: 8 passed, 0 failed
==================================================

🧪 Running FileUpload Tests...
...

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

---

## 📚 相关文档

- [test/README.md](./README.md) - 详细的测试文档
- [test/QUICKSTART.md](./QUICKSTART.md) - 快速开始指南
- [test/SUMMARY.md](./SUMMARY.md) - 测试总结
- [test/TEST_FILES.md](./TEST_FILES.md) - 测试文件清单
- [主项目 README](../README.md) - 项目介绍

---

## 💡 提示

- ✅ 定期运行测试以确保代码质量
- ✅ 在修改核心功能后立即运行相关测试
- ✅ 为新功能编写对应的测试用例
- ✅ 保持测试代码与实现代码同步更新

---

**最后更新**: 2026-04-12
**测试版本**: 1.0.0
**总测试数**: 39
**通过率**: 100% ✨
