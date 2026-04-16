# Lingma Skills & Rules 模板

这是一个全栈开发专用的 Lingma 配置模板，包含 skills（技能）和 rules（规范）。

## 📦 包含的内容

### Skills (技能库)
1. **fullstack-development.md** - 全栈开发技能
   - 需求分析流程
   - 架构设计方法
   - 开发最佳实践
   - 测试策略
   - 部署运维

2. **ui-ux-design.md** - UI/UX 设计技能
   - 设计原则
   - 设计流程
   - 设计系统要素
   - 可访问性规范
   - 响应式设计

3. **documentation-writing.md** - 文档编写技能
   - 文档类型和结构
   - 写作原则
   - Markdown 最佳实践
   - 文档模板

4. **requirements-analysis.md** - 需求分析技能
   - 需求收集方法
   - 需求分类和优先级
   - 需求文档结构
   - 验证清单

### Rules (开发规范)
1. **development-standards.md** - 开发标准规范
   - TypeScript 规范
   - 组件设计规范
   - 项目结构规范
   - Git 工作流
   - API 设计规范
   - 性能优化规范
   - 安全规范
   - 测试规范
   - 国际化规范

2. **workflow-guidelines.md** - 工作流程规范
   - 新功能开发流程
   - Bug 修复流程
   - Code Review 清单
   - 日常开发习惯
   - 沟通协作规范
   - 应急处理流程

## 🚀 如何使用

### 方法 1: 复制到项目（推荐团队协作）

```bash
# 在项目根目录执行
cp -r lingma-template/.lingma .lingma
```

然后将 `.lingma` 目录添加到版本控制（从 `.gitignore` 中移除）。

### 方法 2: 个人使用

1. 将 `skills/` 和 `rules/` 目录的内容复制到你的 `.lingma` 目录
2. 根据项目特点调整内容
3. 在对话中引用相应的 skill 或 rule

### 方法 3: 作为参考文档

直接阅读这些 markdown 文件，了解最佳实践和规范，手动应用到项目中。

## 💡 自定义建议

### 根据技术栈调整
- **React 项目**: 强化 React Hooks、状态管理规范
- **Vue 项目**: 添加 Vue Composition API 规范
- **Node.js 后端**: 补充 Express/NestJS 规范
- **Python 后端**: 添加 Django/FastAPI 规范

### 根据团队规模调整
- **小团队 (1-5人)**: 简化流程，注重效率
- **中团队 (6-20人)**: 标准化流程，加强 Code Review
- **大团队 (20+人)**: 严格规范，自动化检查

### 根据项目阶段调整
- **MVP 阶段**: 快速迭代，适度规范
- **成长期**: 完善测试，加强文档
- **成熟期**: 严格规范，性能优化

## 📝 维护建议

1. **定期回顾** (每月)
   - 检查规范是否仍然适用
   - 收集团队反馈
   - 更新最佳实践

2. **持续改进**
   - 记录常见问题和解决方案
   - 分享成功案例
   - 迭代优化流程

3. **团队培训**
   - 新成员入职培训
   - 定期技术分享
   - Code Review 实践

## 🔗 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React 最佳实践](https://react.dev/learn)
- [Next.js 文档](https://nextjs.org/docs)
- [Git 工作流指南](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 📄 许可证

本模板采用 MIT 许可证，可自由使用和修改。

---

**创建日期**: 2024-01-15
**版本**: 1.0.0
**维护者**: Your Team
