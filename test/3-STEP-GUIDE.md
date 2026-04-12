# 🚀 SafeView 测试 - 3步快速开始

## 步骤 1: 启动开发服务器

在**命令行终端**（PowerShell/CMD）中运行：

```bash
pnpm dev
```

✅ 看到 "Ready in xxx ms" 后，保持终端窗口打开

---

## 步骤 2: 打开浏览器并加载测试工具

1. 访问: **http://localhost:3000**
2. 按 **F12** 打开开发者工具
3. 切换到 **Console** 标签
4. 输入以下代码并按 **Enter**:

```javascript
const script = document.createElement('script');
script.src = '/test-utils.js';
document.head.appendChild(script);
```

✅ 看到 "✅ SafeView test functions loaded successfully!" 表示成功

---

## 步骤 3: 运行测试

在 Console 中输入：

```javascript
runAllTests()
```

✅ 查看测试结果！

---

## 📊 预期输出

```
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
Starting SafeView Test Suite
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

🧪 Running DetectionResult Tests...
✅ Test 1 Passed: Safe result data structure

==================================================
📊 Test Results: 1 passed, 0 failed
==================================================

... (更多测试)

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

## 💡 其他命令

```javascript
// 运行所有测试
runAllTests()

// 只运行某个测试套件
runDetectionResultTests()  // DetectionResult 测试
runFileUploadTests()       // FileUpload 测试
runUseNSFWTests()          // use-nsfw Hook 测试
runIntegrationTests()      // 集成测试
```

---

## ❓ 常见问题

### Q: `pnpm dev` 在哪里运行？
A: 在**命令行终端**（PowerShell、CMD、Git Bash），不是在浏览器控制台！

### Q: 浏览器控制台显示 "runAllTests is not defined"？
A: 你需要先加载测试工具（步骤 2），然后再运行测试。

### Q: 如何重新加载测试工具？
A: 刷新页面，然后重新执行步骤 2 的代码。

---

## 📚 更多文档

- [详细运行指南](./HOW_TO_RUN_TESTS.md)
- [完整测试文档](./README.md)
- [快速开始](./QUICKSTART.md)

---

**就这么简单！** 🎉
