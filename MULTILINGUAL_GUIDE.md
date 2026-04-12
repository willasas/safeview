# 多语言使用指南

## 概述

本项目已集成轻量级多语言系统，支持中文（zh）和英文（en）切换。

## 核心文件

### 1. Context Provider
- **位置**: `contexts/i18n-context.tsx`
- **功能**: 提供全局多语言状态管理

### 2. 翻译文件
- **中文**: `messages/zh.json`
- **英文**: `messages/en.json`

### 3. 语言切换器
- **位置**: `components/language-switcher.tsx`
- **功能**: 用户界面语言切换按钮

## 使用方法

### 在组件中使用多语言

```tsx
"use client";

import { useI18n } from '@/contexts/i18n-context';

export function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      {/* 使用翻译 */}
      <h1>{t('home.title')}</h1>
      <p>{t('common.description')}</p>

      {/* 获取当前语言 */}
      <span>Current: {locale}</span>

      {/* 切换语言 */}
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('zh')}>中文</button>
    </div>
  );
}
```

### 添加新的翻译键

1. 在 `messages/zh.json` 中添加中文翻译
2. 在 `messages/en.json` 中添加对应的英文翻译
3. 在组件中使用 `t('your.key.path')` 引用

示例：
```json
// messages/zh.json
{
  "mySection": {
    "title": "我的标题",
    "description": "这是描述"
  }
}

// messages/en.json
{
  "mySection": {
    "title": "My Title",
    "description": "This is a description"
  }
}
```

## 已集成的页面和组件

✅ **已完成多语言集成**:
- [app/layout.tsx](file://d:/VDhub/safeview/app/layout.tsx) - 根布局
- [components/site-header.tsx](file://d:/VDhub/safeview/components/site-header.tsx) - 顶部导航
- [components/site-footer.tsx](file://d:/VDhub/safeview/components/site-footer.tsx) - 页脚
- [components/language-switcher.tsx](file://d:/VDhub/safeview/components/language-switcher.tsx) - 语言切换器
- [app/page.tsx](file://d:/VDhub/safeview/app/page.tsx) - 首页
- [app/(tools)/nsfw-detector/page.tsx](file://d:/VDhub/safeview/app/(tools)/nsfw-detector/page.tsx) - NSFW 检测页

## 待优化的组件

以下组件包含硬编码文本，建议后续添加多语言支持：

- `components/enhanced-nsfw-detector.tsx` - NSFW 检测主组件
- `components/batch-file-upload.tsx` - 批量上传组件
- `components/batch-detection-result.tsx` - 批量检测结果
- `components/detection-result.tsx` - 单文件检测结果
- `components/user-settings-panel.tsx` - 用户设置面板

## 技术特点

✨ **优势**:
- 无需额外的 npm 包依赖
- 轻量级实现，加载速度快
- 基于 React Context，易于使用
- Cookie 持久化，刷新页面后保持语言选择
- 支持服务端渲染兼容（SSR-safe）

🔧 **工作原理**:
1. 用户通过 `LanguageSwitcher` 选择语言
2. 语言设置保存到 Cookie (`NEXT_LOCALE`)
3. `I18nProvider` 从 Cookie 读取并维护全局状态
4. 所有子组件通过 `useI18n()` Hook 访问翻译函数

## 注意事项

⚠️ **重要提示**:
- 所有使用 `useI18n()` 的组件必须是客户端组件（`"use client"`）
- 翻译键使用点号分隔的嵌套路径（如 `home.title`）
- 如果翻译键不存在，会返回键名本身作为后备

## 扩展建议

如需进一步增强多语言功能，可以考虑：
1. 添加更多语言支持（日语、韩语等）
2. 为剩余组件添加翻译
3. 实现自动语言检测（基于浏览器设置）
4. 添加 RTL（从右到左）语言支持
