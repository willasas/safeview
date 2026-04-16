# Lingma Skills & Rules 使用指南

本目录包含了为全栈开发定制的 Skills（技能）和 Rules（规范），帮助你更高效地进行需求整理、UI 设计、文档编写和代码开发。

## 📁 目录结构

```

.lingma/
├── skills/              # 技能库
│   ├── fullstack-development.md      # 全栈开发技能
│   ├── ui-ux-design.md               # UI/UX 设计技能
│   ├── documentation-writing.md      # 文档编写技能
│   └── requirements-analysis.md      # 需求分析技能
├── rules/               # 开发规范
│   ├── development-standards.md      # 开发标准规范
│   └── workflow-guidelines.md        # 工作流程规范
├── plans/               # 项目计划
├── specs/               # 技术规格书
└── agents/              # AI 代理配置

```

## 🎯 Skills 使用说明

Skills 是特定领域的专业知识集合，在需要时可以调用相应的 skill 来获取指导。

### 1. Full-Stack Development (全栈开发)

**适用场景**:
- 开发新功能模块
- 设计 API 接口
- 数据库建模
- 前后端集成

**如何调用**:

```

请使用 fullstack-development skill 帮我设计一个用户管理系统

```

### 2. UI/UX Design (UI/UX 设计)

**适用场景**:
- 设计新页面布局
- 优化用户体验
- 创建设计系统
- 响应式设计

**如何调用**:

```

使用 ui-ux-design skill 为这个表单页面设计一个现代化的 UI

```

### 3. Documentation Writing (文档编写)

**适用场景**:
- 编写 README
- 创建 API 文档
- 撰写技术设计文档
- 制作用户手册

**如何调用**:

```

按照 documentation-writing skill 的规范，为这个 API 编写文档

```

### 4. Requirements Analysis (需求分析)

**适用场景**:
- 整理产品需求
- 分析业务逻辑
- 规划功能特性
- 评估技术方案

**如何调用**:

```

使用 requirements-analysis skill 帮我分析这个功能的需求

```

## 📋 Rules 使用说明

Rules 是必须遵循的开发规范和最佳实践，AI 助手会自动应用这些规则。

### 1. Development Standards (开发标准)

包含以下规范：
- TypeScript 编码规范
- 组件设计规范
- 项目结构规范
- Git 工作流
- API 设计规范
- 性能优化规范
- 安全规范
- 测试规范
- 文档规范
- 国际化规范
- 部署规范

**自动应用**: 在生成代码时，AI 会自动遵循这些规范。

### 2. Workflow Guidelines (工作流程)

包含以下流程：
- 新功能开发流程
- Bug 修复流程
- Code Review 清单
- 日常开发习惯
- 沟通协作规范
- 学习成长建议
- 应急处理流程

**自动应用**: 在提供建议时，AI 会参考这些工作流程。

## 💡 使用技巧

### 1. 组合使用 Skills

可以组合多个 skills 来完成复杂任务：

```

首先使用 requirements-analysis skill 分析需求，
然后使用 ui-ux-design skill 设计界面，
最后使用 fullstack-development skill 实现功能

```

### 2. 参考 Rules 进行检查

在完成开发后，可以让 AI 根据 rules 进行代码审查：

```

请根据 development-standards 规范检查这段代码

```

### 3. 定制化调整

你可以根据项目实际情况修改或添加新的 skills 和 rules：

- 在 `skills/` 目录下创建新的 `.md` 文件
- 在 `rules/` 目录下添加项目特定的规范
- 定期回顾和更新内容

### 4. 团队协作

将这些规范分享给团队成员：
- 新成员入职时阅读这些文档
- Code Review 时参考相关规范
- 定期组织学习和讨论

## 🚀 快速开始

### 对于新项目

1. 复制 `.lingma` 目录到新项目
2. 根据项目特点调整 rules
3. 团队培训和使用

### 对于现有项目

1. 逐步引入规范的各个方面
2. 优先解决最痛的问题
3. 持续改进和优化

## 📝 示例场景

### 场景 1: 开发新功能

```

用户: 我想添加一个图片上传功能

AI: 让我使用 fullstack-development skill 来规划这个功能...

1. 需求分析:
   - 支持哪些图片格式？
   - 文件大小限制？
   - 是否需要压缩？

2. 技术方案:
   - 前端: 使用 react-dropzone
   - 后端: Multer 处理文件上传
   - 存储: AWS S3 或本地存储

3. 实现步骤:
   ...

```

### 场景 2: Code Review

```

用户: 请审查这段代码

AI: 根据 development-standards 规范，我发现以下问题:

❌ 问题 1: 使用了 any 类型
   建议: 定义具体的 TypeScript 接口

❌ 问题 2: 缺少错误处理
   建议: 添加 try-catch 块

✅ 优点: 组件拆分合理，职责清晰

```

### 场景 3: 编写文档

```

用户: 帮我写一个 API 文档

AI: 按照 documentation-writing skill 的规范，API 文档应包含:

# API 名称

## 概述

...

## 请求

- Method: POST
- URL: /api/xxx
- Headers: {...}
- Body: {...}

## 响应

...

## 示例

...

```

## 🔄 维护和更新

### 定期回顾

- 每月检查一次 rules 是否仍然适用
- 根据实际使用情况调整 skills
- 收集团队反馈并改进

### 版本管理

- 使用 Git 跟踪 changes
- 重要的变更添加 changelog
- 保持向后兼容

## 🤝 贡献指南

欢迎提出改进建议：
1. Fork 项目
2. 创建分支 (`git checkout -b feature/improve-docs`)
3. 提交更改 (`git commit -m 'docs: improve workflow guidelines'`)
4. 推送到分支 (`git push origin feature/improve-docs`)
5. 创建 Pull Request

## 📞 支持和反馈

如有问题或建议，请：
- 提交 Issue
- 联系项目维护者
- 参与讨论和改进

---

**最后更新**: 2024-01-15
**维护者**: Development Team
