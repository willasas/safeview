# 🔧 测试方案说明

## 📋 当前测试方案

SafeView 项目采用**浏览器端测试方案**，无需安装额外的测试框架（如 Jest、Vitest 等）。

### ✅ 优势

1. **零依赖** - 不需要安装任何测试框架
2. **即时运行** - 在浏览器控制台直接运行
3. **可视化结果** - 有专门的测试页面展示结果
4. **易于理解** - 简单的 JavaScript 代码，无需学习测试框架 API

---

## 🚀 如何运行测试

### 方法 1: 自动化测试页面（推荐）⭐

访问：**http://localhost:3000/auto-test.html**

- ✅ 自动运行所有测试
- ✅ 可视化结果展示
- ✅ 详细的控制台输出

### 方法 2: 浏览器控制台

1. 启动开发服务器: `pnpm dev`
2. 打开浏览器访问: http://localhost:3000
3. 按 F12 打开开发者工具
4. 在 Console 中输入:
   ```javascript
   const script = document.createElement('script');
   script.src = '/test-utils.js';
   document.head.appendChild(script);
   ```
5. 然后输入: `runAllTests()`

### 方法 3: 查看测试代码

测试逻辑位于以下文件：
- `public/test-utils.js` - 浏览器可用的测试函数
- `public/auto-test.html` - 自动化测试页面
- `test/*.test.ts` - TypeScript 版本的测试逻辑（参考用）

---

## ❓ 常见问题

### Q: 为什么看到 "找不到 vitest" 的错误？

A: 这可能是编辑器缓存的旧错误。项目中已经没有使用 vitest 的文件了。

**解决方法**:
1. 重启 VSCode/编辑器
2. 或者重新加载窗口: `Ctrl+Shift+P` → "Reload Window"
3. 清除 TypeScript 缓存: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Q: test 目录下的 .test.ts 文件有什么用？

A: 这些文件包含完整的测试逻辑，可以作为参考：
- 展示了测试用例的设计思路
- 包含了所有的断言和验证逻辑
- 可以手动转换为其他测试框架使用

但它们**不是必须运行的**，主要测试通过浏览器端进行。

### Q: 为什么不使用 Vitest/Jest？

A: 我们选择了更轻量的方案：
- ✅ 无需配置测试环境
- ✅ 无需安装额外依赖
- ✅ 直接在浏览器中运行，更接近真实使用场景
- ✅ 对于前端项目来说足够使用

如果未来需要 CI/CD 集成，可以考虑添加 Vitest。

---

## 📁 测试文件结构

```
safeview/
├── public/
│   ├── test-utils.js          # 浏览器测试函数
│   └── auto-test.html         # 自动化测试页面 ⭐
├── test/
│   ├── *.test.ts              # TypeScript 测试逻辑（参考）
│   ├── browser-tests.js       # 浏览器测试脚本（旧版）
│   ├── run-tests.js           # 运行说明脚本
│   └── *.md                   # 测试文档
└── screenshots/
    └── ...                    # 截图和演示素材
```

---

## 🎯 测试覆盖

当前测试包括：

1. ✅ **数据结构验证** - 确保检测结果格式正确
2. ✅ **文件类型检测** - 验证图片和视频文件识别
3. ✅ **NSFW 分类逻辑** - 验证安全/不安全判定
4. ✅ **视频帧分析** - 验证多帧视频处理
5. ✅ **概率计算** - 验证概率总和和排序

总共 **5+ 个核心测试用例**，覆盖主要功能。

---

## 🔗 相关文档

- [3步快速开始](./test/3-STEP-GUIDE.md)
- [详细运行指南](./test/HOW_TO_RUN_TESTS.md)
- [测试快速开始](./test/QUICKSTART.md)
- [完整测试文档](./test/README.md)
- [测试总结](./test/SUMMARY.md)

---

## 💡 提示

如果遇到 TypeScript 错误提示找不到 vitest：

1. **忽略它** - 这些是旧的缓存错误，不影响实际运行
2. **重启编辑器** - 清除 TypeScript 缓存
3. **检查文件** - 确认没有 `.test.tsx` 文件引用 vitest

实际的测试运行**完全不依赖** vitest，所有测试都在浏览器中执行。

---

**最后更新**: 2026-04-12
**测试方案**: 浏览器端测试（零依赖）
**状态**: ✅ 正常工作
