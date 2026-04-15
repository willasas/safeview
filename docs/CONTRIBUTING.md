# 🤝 贡献指南

感谢您对 DC工具集 项目的关注！我们欢迎所有形式的贡献。

---

## 🚀 快速开始

### 1. Fork 项目
```bash
# 在 GitHub 上点击 Fork 按钮
```

### 2. 克隆仓库
```bash
git clone https://github.com/YOUR_USERNAME/safeview.git
cd safeview
```

### 3. 安装依赖
```bash
pnpm install
```

### 4. 创建分支
```bash
git checkout -b feature/your-feature-name
```

### 5. 开发
```bash
pnpm dev
```

### 6. 测试
```bash
pnpm test
```

### 7. 提交
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

### 8. 创建 Pull Request
在 GitHub 上创建 PR，描述你的改动。

---

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [提交 PR](#提交-pr)
- [代码规范](#代码规范)
- [测试](#测试)

---

## 行为准则

本项目采用开放和友好的社区原则。请尊重所有参与者，保持建设性的讨论氛围。

---

## 如何贡献

### 1. 报告 Bug

如果你发现了 bug，请：

1. 搜索 [Issues](https://github.com/willasas/safeview/issues) 确保该问题尚未被报告
2. 创建新的 Issue，包含：
   - 清晰的标题和描述
   - 复现步骤
   - 预期行为和实际行为
   - 截图或录屏（如果适用）
   - 环境信息（浏览器、操作系统等）

### 2. 提出新功能

如果你有新的功能想法：

1. 先在 [Issues](https://github.com/willasas/safeview/issues) 或 [Discussions](https://github.com/willasas/safeview/discussions) 中讨论
2. 说明功能的必要性和使用场景
3. 等待社区反馈和项目维护者的意见

### 3. 提交代码

#### 简单修复（拼写错误、小 bug）
- 直接 Fork 项目并提交 Pull Request

#### 较大改动
1. 先在 Issue 中讨论你的计划
2. 获得维护者同意后开始开发
3. 遵循项目的代码规范
4. 添加必要的测试
5. 更新相关文档

---

## 开发环境设置

### 前置要求

- Node.js 18+
- pnpm（推荐）或 npm

### 安装步骤

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/YOUR_USERNAME/safeview.git
cd safeview

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 在浏览器中访问 http://localhost:3000
```

### 常用命令

```bash
pnpm dev       # 启动开发服务器
pnpm build     # 构建生产版本
pnpm start     # 启动生产服务器
pnpm lint      # 运行代码检查
```

### 运行测试

```bash
# 方法 1: 自动化测试页面
# 访问 http://localhost:3000/auto-test.html

# 方法 2: 浏览器控制台
# 1. pnpm dev
# 2. 打开 http://localhost:3000
# 3. F12 打开控制台
# 4. 输入: runAllTests()
```

详见 [TESTING.md](./TESTING.md)

---

## 提交 PR

### PR 标题规范

使用清晰的标题描述你的改动：

- ✅ `fix: 修复视频检测时的纹理错误`
- ✅ `feat: 添加深色模式支持`
- ✅ `docs: 更新 README 中的安装说明`
- ❌ `修复bug`
- ❌ `更新`

### PR 描述模板

```markdown
## 📝 描述
简要描述这个 PR 做了什么改动

## 🔗 相关 Issue
Closes #123

## 🧪 测试
- [ ] 已在本地测试通过
- [ ] 添加了新的测试用例（如适用）
- [ ] 更新了相关文档

## 📸 截图（如适用）
添加前后对比截图

## ✅ 检查清单
- [ ] 代码符合项目规范
- [ ] 没有引入新的警告或错误
- [ ] 更新了相关文档
- [ ] 通过了所有测试
```

### PR 流程

1. 从 `main` 分支创建新分支
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. 进行开发并提交更改
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   ```

3. 推送到你的 Fork
   ```bash
   git push origin feature/your-feature-name
   ```

4. 在 GitHub 上创建 Pull Request

---

## 代码规范

### TypeScript

- 使用 TypeScript 编写所有新代码
- 避免使用 `any` 类型，除非绝对必要
- 为函数和组件添加类型注解

### React

- 使用函数组件和 Hooks
- 优先使用 `useCallback` 和 `useMemo` 优化性能
- 保持组件小而专注

### 样式

- 使用 Tailwind CSS
- 遵循项目的颜色方案和间距规范
- 确保响应式设计

### 命名规范

- 组件：PascalCase (`DetectionResult.tsx`)
- 文件：kebab-case (`detection-result.tsx`)
- 变量/函数：camelCase (`handleFileSelect`)
- 常量：UPPER_SNAKE_CASE (`NSFW_THRESHOLDS`)

### 注释

- 为复杂逻辑添加注释
- 使用 JSDoc 注释公共 API
- 保持注释简洁明了

---

## 测试

### 测试要求

- 新功能应包含相应的测试
- Bug 修复应添加回归测试
- 确保所有测试通过后再提交 PR

### 运行测试

```bash
# 访问自动化测试页面
http://localhost:3000/auto-test.html

# 或在浏览器控制台运行
runAllTests()
```

详见 [TESTING.md](./TESTING.md)

---

## 文档

### 文档更新

如果你的改动影响了用户使用方式，请更新相关文档：

- `README.md` - 项目主文档
- `TESTING.md` - 测试文档
- `screenshots/*.md` - 截图和配图指南

### 文档规范

- 使用清晰的中文或英文
- 提供具体的示例代码
- 包含截图或动图（如适用）
- 保持格式一致

---

## 审查流程

1. 维护者会审查你的 PR
2. 可能会提出修改建议或问题
3. 根据反馈进行修改
4. 审查通过后合并到主分支

---

## 常见问题

### Q: 我的 PR 多久会被审查？

A: 我们会尽快审查，通常在 1-3 个工作日内。如果超过一周没有回应，可以在 PR 中 @ 维护者。

### Q: 我可以同时提交多个 PR 吗？

A: 可以，但建议每个 PR 专注于一个功能或修复。

### Q: 如果我的 PR 被拒绝了怎么办？

A: 不要灰心！我们会说明拒绝的原因。你可以根据反馈修改后重新提交，或者选择其他 Issue 参与。

---

## 致谢

感谢所有为 SafeView 做出贡献的开发者！你们的努力让这个项目变得更好。

🌟 [查看贡献者列表](https://github.com/willasas/safeview/graphs/contributors)

---

## 联系方式

- 📧 Email: 546929134@qq.com
- 💬 GitHub Discussions: [点击这里](https://github.com/willasas/safeview/discussions)
- 🐛 Issues: [点击这里](https://github.com/willasas/safeview/issues)

---

**再次感谢你的贡献！** 🎉
