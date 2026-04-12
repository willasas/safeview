# 🖼️ SafeView 图片使用指南

本文档说明如何在各个位置使用 screenshots 文件夹中的图片和 GIF。

---

## 📋 图片清单

| 文件名 | 类型 | 大小 | 用途 | 使用位置 |
|--------|------|------|------|----------|
| `usage-video.gif` | GIF | 3.1 MB | 使用流程演示 | README 首屏、社交媒体 |
| `image-detection-sfw.png` | PNG | 706 KB | 安全图片检测示例 | README、公众号文章 |
| `image-detection-nsfw.png` | PNG | 278 KB | 不安全图片检测示例 | README、公众号文章 |
| `video-detection-sfw.png` | PNG | 813 KB | 安全视频检测示例 | README、公众号文章 |
| `video-detection-nsfw.png` | PNG | 404 KB | 不安全视频检测示例 | README、公众号文章 |
| `detailed-report.jpeg` | JPEG | 94 KB | 详细检测报告 | README、技术文档 |

---

## 📍 使用位置

### 1. README.md（项目主页）

#### 功能展示部分

```markdown
### 🎬 使用演示

![SafeView 使用演示](./screenshots/usage-video.gif)

*拖拽上传 → AI 检测 → 查看结果，三步完成内容安全检查*

---

### 🖼️ 图片检测

#### 安全内容检测

![安全图片检测](./screenshots/image-detection-sfw.png)

*检测结果：✅ 内容安全 - Neutral 类别概率 95%*

#### 不安全内容检测

![不安全图片检测](./screenshots/image-detection-nsfw.png)

*检测结果：⚠️ 检测到不安全内容 - Porn 类别概率 85%*

---

### 🎥 视频检测

#### 安全视频检测

![安全视频检测](./screenshots/video-detection-sfw.png)

*检测结果：✅ 视频安全 - 所有帧均为安全内容*

#### 不安全视频检测

![不安全视频检测](./screenshots/video-detection-nsfw.png)

*检测结果：⚠️ 检测到不安全内容 - 部分帧包含 NSFW 内容*

---

### 📊 详细分析报告

![详细检测报告](./screenshots/detailed-report.jpeg)

提供详细的概率分析和可视化图表。
```

**相对路径**: `./screenshots/xxx`
**适用场景**: GitHub README、GitLab README

---

### 2. 微信公众号文章

#### 配图顺序建议

1. **开头引入后** - 使用演示 GIF
   ```markdown
   ![SafeView 使用演示](../screenshots/usage-video.gif)
   ```

2. **核心功能介绍** - 图片检测对比
   ```markdown
   ![安全图片检测](../screenshots/image-detection-sfw.png)
   ![不安全图片检测](../screenshots/image-detection-nsfw.png)
   ```

3. **视频检测功能** - 视频检测对比
   ```markdown
   ![安全视频检测](../screenshots/video-detection-sfw.png)
   ![不安全视频检测](../screenshots/video-detection-nsfw.png)
   ```

4. **技术亮点** - 详细报告
   ```markdown
   ![详细检测报告](../screenshots/detailed-report.jpeg)
   ```

**相对路径**: `../screenshots/xxx`（从 screenshots 子目录引用）
**注意**: 微信公众号后台需要手动上传图片，不能使用 Markdown 链接

---

### 3. 社交媒体分享

#### Twitter / X

```markdown
🔒 SafeView - 本地 AI 内容检测工具

✨ 完全在浏览器运行
🔐 文件不上传服务器
⚡ 毫秒级检测速度

![Demo](./screenshots/usage-video.gif)

GitHub: https://github.com/willasas/safeview

#AI #OpenSource #Privacy
```

#### LinkedIn

```markdown
Excited to share my latest open-source project: SafeView!

🛡️ AI-powered content safety detector
🔒 100% local processing - no data leaves your browser
⚡ Lightning fast detection using TensorFlow.js

Check it out: https://github.com/willasas/safeview

[Attach: usage-video.gif or image-detection-sfw.png]

#MachineLearning #WebDevelopment #OpenSource #AI
```

#### Reddit (r/webdev, r/MachineLearning)

```markdown
Title: I built a local AI NSFW detector using TensorFlow.js - all processing happens in the browser!

Body:
Hey everyone! I just finished building SafeView, a privacy-first content safety detection tool.

Key features:
- 🔐 Complete privacy: files never leave your browser
- ⚡ Fast detection: images processed in 50-200ms
- 🎯 Accurate: 5-category classification using NSFW.js
- 📱 Responsive: works on mobile and desktop

Tech stack: Next.js 16, React 19, TensorFlow.js, Tailwind CSS

Screenshots:
[Attach: image-detection-sfw.png, video-detection-sfw.png]

GitHub: https://github.com/willasas/safeview

Would love to hear your feedback!
```

---

### 4. 技术博客文章

#### Medium / Dev.to / 知乎

在文章中穿插使用截图：

```markdown
## How It Works

When you upload an image, SafeView processes it locally using TensorFlow.js:

![Detection Process](./screenshots/image-detection-sfw.png)

The model classifies content into 5 categories:
- Neutral (safe content)
- Drawing (art/animation)
- Sexy (suggestive but not explicit)
- Porn (explicit content)
- Hentai (anime adult content)

For videos, we sample multiple frames:

![Video Detection](./screenshots/video-detection-sfw.png)

Each frame is analyzed independently, and we calculate an overall safety score.
```

---

## 🎨 图片优化建议

### 文件大小优化

当前文件大小已经比较合理，如需进一步压缩：

```bash
# 使用 imagemin 压缩 PNG
pnpm add -D imagemin imagemin-pngquant

# 或使用在线工具
# - TinyPNG: https://tinypng.com/
# - Squoosh: https://squoosh.app/
```

### 响应式图片

在不同设备上显示不同尺寸：

```html
<picture>
  <source media="(max-width: 768px)" srcset="./screenshots/image-detection-sfw-mobile.png">
  <img src="./screenshots/image-detection-sfw.png" alt="SafeView Detection">
</picture>
```

### Lazy Loading

延迟加载图片以提升性能：

```html
<img src="./screenshots/usage-video.gif"
     alt="Demo"
     loading="lazy"
     width="1920"
     height="1080">
```

---

## 📊 图片统计

### 总大小
- **所有图片总计**: ~6.6 MB
- **GIF**: 3.1 MB (47%)
- **PNG**: 3.2 MB (49%)
- **JPEG**: 94 KB (1%)

### 推荐用途优先级

1. **必须使用** (高优先级):
   - `usage-video.gif` - 最直观的演示
   - `image-detection-sfw.png` - 展示核心功能
   - `video-detection-sfw.png` - 展示视频检测

2. **建议使用** (中优先级):
   - `image-detection-nsfw.png` - 对比展示
   - `video-detection-nsfw.png` - 对比展示
   - `detailed-report.jpeg` - 技术细节

3. **可选使用** (低优先级):
   - `image-detection.png` - 旧版截图
   - `video-detection.png` - 旧版截图

---

## 🔗 快速链接

- [README.md](../README.md) - 项目主文档
- [WECHAT_ARTICLE.md](./WECHAT_ARTICLE.md) - 微信公众号文章模板
- [GitHub Repository](https://github.com/willasas/safeview) - 代码仓库

---

**最后更新**: 2026-04-12
**维护者**: SafeView Team
