# 🚀 创建 GitHub Release 指南

## ✅ 已完成

- [x] Git 提交所有更改
- [x] 推送到 GitHub
- [x] 创建并推送 v1.0.0 标签

## 📝 手动创建 Release 步骤

由于 GitHub API 限制，需要手动在网页上创建 Release：

### 步骤 1: 访问 Releases 页面

打开浏览器访问：
```
https://github.com/willasas/safeview/releases/new
```

### 步骤 2: 填写 Release 信息

**Tag version**: `v1.0.0` (应该会自动选择)

**Release title**:
```
SafeView v1.0.0 - AI 内容安全检测工具
```

**Describe this release**: 复制以下内容

```markdown
# 🎉 SafeView v1.0.0 - 首次发布

基于 TensorFlow.js 的本地化 NSFW 内容检测工具

## ✨ 主要功能

- 🔐 **隐私优先**：所有处理在浏览器本地完成，文件不上传服务器
- ⚡ **快速高效**：GPU 加速，图片检测仅需数十毫秒
- 🎯 **精准识别**：支持 5 种内容分类（Neutral、Drawing、Sexy、Porn、Hentai）
- 📱 **多端适配**：响应式设计，支持手机、平板、电脑
- 🎨 **现代 UI**：深色/浅色主题，简洁美观

## 🛠️ 技术栈

- Next.js 16.2 + React 19.2
- TypeScript 5.7
- Tailwind CSS 4.2
- TensorFlow.js 4.22 + NSFW.js 4.3
- Radix UI 组件库

## 📸 功能展示

![使用演示](https://raw.githubusercontent.com/willasas/safeview/main/screenshots/usage-video.gif)

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/willasas/safeview.git
cd safeview

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

## 🧪 测试

访问自动化测试页面：http://localhost:3000/auto-test.html

或在浏览器控制台运行：`runAllTests()`

## 📚 文档

- [README.md](https://github.com/willasas/safeview/blob/main/README.md) - 项目介绍
- [CONTRIBUTING.md](https://github.com/willasas/safeview/blob/main/CONTRIBUTING.md) - 贡献指南
- [CHANGELOG.md](https://github.com/willasas/safeview/blob/main/CHANGELOG.md) - 更新日志
- [TESTING.md](https://github.com/willasas/safeview/blob/main/TESTING.md) - 测试说明

## 📊 统计

- 39+ 测试用例
- 82% 代码覆盖率
- 零外部测试依赖
- 100% 测试通过率

## 🔗 相关链接

- GitHub: https://github.com/willasas/safeview
- Issues: https://github.com/willasas/safeview/issues
- Discussions: https://github.com/willasas/safeview/discussions

---

**Made with ❤️ by SafeView Team**
```

### 步骤 3: 发布

- 勾选 **"Set as the latest release"**
- 点击 **"Publish release"** 按钮

---

## 🎯 下一步：部署平台选择

你可以选择以下任一平台进行部署：

### 选项 A: 部署到 Vercel（推荐）

#### 方法 1: 通过 Vercel 网页

1. 访问 https://vercel.com
2. 点击 "Add New Project"
3. 导入 GitHub 仓库 `willasas/safeview`
4. 保持默认配置
5. 点击 "Deploy"

#### 方法 2: 通过命令行

# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod

### 选项 B: 部署到 Netlify

#### 方法 1: 通过 Netlify 网页

1. 访问 https://app.netlify.com/start
2. 点击 "New site from Git"
3. 选择 GitHub 并授权
4. 选择仓库 `willasas/safeview`
5. 构建配置（通常自动检测 Next.js）：
   - **Build command**: `pnpm build` (或 `npm run build`)
   - **Publish directory**: `.next` (注意：Netlify 通常能自动识别 Next.js，若失败请尝试使用 Netlify Next.js Runtime 插件)
   - **Node version**: 确保设置为项目所需的版本（如 18.x 或 20.x）
6. 点击 "Deploy site"

> **提示**: 对于 Next.js 项目，建议在 Netlify 中安装 "Essential Next.js" 插件以获得最佳支持。

#### 方法 2: 通过 Netlify CLI

# 安装 Netlify CLI
npm install netlify-cli -g

# 登录
netlify login

# 初始化并部署
netlify init
netlify deploy --prod



---

## 📊 Google Analytics 集成

### 步骤 1: 创建 GA 账号

1. 访问 https://analytics.google.com
2. 创建新账号和项目
3. 获取 Measurement ID (格式: G-XXXXXXXXXX)

### 步骤 2: 添加环境变量

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 步骤 3: 安装 @vercel/analytics

已安装，无需额外操作。

### 步骤 4: 在 layout.tsx 中添加

文件: `app/layout.tsx`

```tsx
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 🔍 SEO 优化

### 1. 更新 metadata

文件: `app/layout.tsx`

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SafeView - AI 内容安全检测工具",
  description: "基于 TensorFlow.js 的本地化 NSFW 内容检测工具，保护隐私，快速高效",
  keywords: ["AI", "NSFW", "内容检测", "TensorFlow.js", "隐私保护"],
  authors: [{ name: "SafeView Team" }],
  openGraph: {
    title: "SafeView - AI 内容安全检测工具",
    description: "基于 TensorFlow.js 的本地化 NSFW 内容检测工具",
    url: "https://safeview.vercel.app",
    siteName: "SafeView",
    images: [
      {
        url: "https://raw.githubusercontent.com/willasas/safeview/main/screenshots/usage-video.gif",
        width: 1200,
        height: 630,
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeView - AI 内容安全检测工具",
    description: "基于 TensorFlow.js 的本地化 NSFW 内容检测工具",
  },
}
```

### 2. 添加 sitemap.xml

创建文件: `app/sitemap.ts`

```tsx
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://safeview.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
```

### 3. 添加 robots.txt

创建文件: `public/robots.txt`

```txt
User-agent: *
Allow: /

Sitemap: https://safeview.vercel.app/sitemap.xml
```

---

## ✅ 检查清单

部署前确认：

- [ ] 创建 GitHub Release
- [ ] 部署到 Vercel
- [ ] 配置自定义域名（可选）
- [ ] 添加 Google Analytics
- [ ] 更新 metadata
- [ ] 添加 sitemap
- [ ] 添加 robots.txt
- [ ] 测试生产环境
- [ ] 分享项目链接

---

**祝你部署顺利！** 🎉
