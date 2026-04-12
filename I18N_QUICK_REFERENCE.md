# 多语言快速参考

## 🚀 快速开始

### 1. 在组件中使用翻译
```tsx
import { useI18n } from '@/contexts/i18n-context';

const { t, locale, setLocale } = useI18n();

// 使用翻译
<h1>{t('home.title')}</h1>

// 切换语言
<button onClick={() => setLocale('en')}>English</button>
```

### 2. 添加新翻译
```json
// messages/zh.json
{
  "myKey": {
    "title": "我的标题"
  }
}

// messages/en.json
{
  "myKey": {
    "title": "My Title"
  }
}
```

## 📁 文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| Context Provider | `contexts/i18n-context.tsx` | 核心逻辑 |
| 中文翻译 | `messages/zh.json` | 中文文本 |
| 英文翻译 | `messages/en.json` | 英文文本 |
| 语言切换器 | `components/language-switcher.tsx` | UI 组件 |
| 使用指南 | `MULTILINGUAL_GUIDE.md` | 详细文档 |
| 升级报告 | `I18N_UPGRADE_REPORT.md` | 完成报告 |

## 🔑 常用翻译键

### 通用
- `common.appName` - 应用名称
- `common.tagline` - 标语
- `common.version` - 版本信息

### 导航
- `nav.home` - 首页
- `nav.image` - 图像
- `nav.text` - 文本
- `nav.video` - 视频
- `nav.audio` - 音频

### 首页
- `home.title` - 页面标题
- `home.description` - 页面描述
- `home.latestTools` - 最新工具

### 检测器
- `detector.title` - 检测器标题
- `detector.privacyFirst` - 隐私优先
- `detector.batchDetection` - 批量检测
- `detector.multiModel` - 多模型支持

### 页脚
- `footer.aboutUs` - 关于我们
- `footer.terms` - 服务条款
- `footer.privacy` - 隐私政策
- `footer.disclaimer` - 免责声明

## ⚡ 快捷操作

### 测试多语言功能
访问: http://localhost:3000/i18n-test

### 查看当前语言
```tsx
const { locale } = useI18n();
console.log(locale); // 'zh' or 'en'
```

### 强制切换语言
```tsx
const { setLocale } = useI18n();
setLocale('zh'); // 切换到中文
setLocale('en'); // 切换到英文
```

## 💡 最佳实践

✅ **推荐做法**:
- 所有用户可见文本都使用翻译
- 保持翻译键的命名一致性
- 同时更新 zh.json 和 en.json
- 使用嵌套结构组织翻译键

❌ **避免做法**:
- 不要在组件中硬编码文本
- 不要混合使用翻译和硬编码
- 不要忘记同步更新两种语言
- 不要使用过深的嵌套层级

## 🔍 调试技巧

### 检查翻译是否生效
```tsx
// 如果看到键名而不是翻译文本，说明翻译缺失
{t('missing.key')} // 显示: "missing.key"
```

### 查看所有可用翻译
打开浏览器控制台:
```javascript
// 中文
import zh from '@/messages/zh.json';
console.log(zh);

// 英文
import en from '@/messages/en.json';
console.log(en);
```

## 📊 统计信息

- **支持语言**: 2 种 (zh, en)
- **翻译键数量**: ~68 个
- **翻译记录总数**: ~136 条
- **已集成组件**: 10 个主要组件
- **待优化组件**: 1 个（user-settings-panel）

---

**最后更新**: 2026-04-12
**维护者**: DC Tools Team
