# 首页导航与组件重构计划

## 技术选型

- **多语言方案**：使用 `next-intl` 库实现完整的国际化支持
- **路由结构**：采用 Next.js App Router 嵌套路由
- **状态管理**：使用 React Context 管理语言切换状态

## 实施步骤

### 任务 1：安装和配置多语言库

1. 安装依赖：`npm install next-intl`
2. 创建多语言配置文件：
   - `d:\VDhub\safeview\i18n\request.ts` - 语言检测中间件
   - `d:\VDhub\safeview\i18n\config.ts` - 多语言配置
   - `d:\VDhub\safeview\messages\zh.json` - 中文翻译
   - `d:\VDhub\safeview\messages\en.json` - 英文翻译

### 任务 2：重构路由结构

1. 移动现有页面为子路由：
   - 将 `d:\VDhub\safeview\app\page.tsx` 移动到 `d:\VDhub\safeview\app\(tools)\nsfw-detector\page.tsx`
   - 保留原检测功能完整不变

2. 创建新的首页：
   - `d:\VDhub\safeview\app\page.tsx` - 新的首页，展示 SafeView 工具卡片
   - 卡片布局参考截图样式，包含图标、标题、描述和分类标签

### 任务 3：创建 Header 组件

创建 `d:\VDhub\safeview\components\site-header.tsx`，包含：
- **左侧**：SafeView Logo（Shield 图标 + 文字）
- **中间**：导航菜单（首页、图像、文本、视频等，使用 Link 组件）
- **右侧**：
  - 主题切换按钮（复用现有的 `ModeToggle`）
  - 语言切换下拉菜单（支持中文/英文切换）
- 响应式设计：移动端使用汉堡菜单

### 任务 4：创建 Footer 组件

创建 `d:\VDhub\safeview\components\site-footer.tsx`，包含：
- **免责声明**：醒目的警告文字"本站工具严禁用于非法用途..."
- **社交媒体链接**：QQ、微信图标链接（预留占位符）
- **法律链接**：关于我们、版权声明、服务条款、隐私政策、Cookie 政策（创建独立页面或弹窗）
- **版权信息**：© 2026 SafeView. All rights reserved.
- **备案号**：预留备案号显示区域

### 任务 5：更新根布局

修改 `d:\VDhub\safeview\app\layout.tsx`：
- 集成 `NextIntlClientProvider`
- 添加 `<SiteHeader />` 和 `<SiteFooter />` 到布局中
- 确保语言切换在整个应用中生效

### 任务 6：创建法律页面

创建以下静态页面（使用对话框或独立路由）：
- `d:\VDhub\safeview\app\(legal)\about\page.tsx` - 关于我们
- `d:\VDhub\safeview\app\(legal)\terms\page.tsx` - 服务条款
- `d:\VDhub\safeview\app\(legal)\privacy\page.tsx` - 隐私政策
- `d:\VDhub\safeview\app\(legal)\cookies\page.tsx` - Cookie 政策

### 任务 7：更新 SEO 配置

修改 `d:\VDhub\safeview\app\layout.tsx` 的 metadata：
- 更新首页标题和描述
- 为 NSFW 检测子页面创建独立的 metadata（使用 `generateMetadata`）

## 文件结构预览

```

app/
├── layout.tsx                  # 根布局（含 Header/Footer）
├── page.tsx                    # 新首页（工具卡片）
├── (tools)/
│   └── nsfw-detector/
│       ├── layout.tsx          # 工具页面布局
│       └── page.tsx            # 现有检测功能（从原 page.tsx 移动）
└── (legal)/
    ├── about/page.tsx
    ├── terms/page.tsx
    ├── privacy/page.tsx
    └── cookies/page.tsx

components/
├── site-header.tsx             # 新增：全局头部
├── site-footer.tsx             # 新增：全局底部
├── language-switcher.tsx       # 新增：语言切换器
└── ... (现有组件保持不变)

i18n/
├── request.ts                  # 多语言中间件
└── config.ts                   # 多语言配置

messages/
├── zh.json                     # 中文翻译
└── en.json                     # 英文翻译

```

## 注意事项

- 保持现有检测功能完全不变，只做路由结构调整
- 多语言配置需覆盖所有 UI 文本
- Header/Footer 使用 client component 以支持交互
- 法律页面可以复用相同的布局样式
- 确保所有链接和按钮都有正确的多语言支持