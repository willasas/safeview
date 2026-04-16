# 新增网站导航页

## Context

用户希望新增一个网站导航页面，展示各类AI工具的链接卡片。参考截图显示的是一个网格布局的导航页，每个卡片包含网站Logo、名称、描述和分类标签，点击后跳转到对应网站。

## 实现方案

### 1. 创建导航页面路由

- 新建 `app/nav/page.tsx`
- 使用 Next.js App Router 文件系统路由，路径为 `/nav`

### 2. 定义导航数据

- 在 `lib/nav-data.ts` 中定义导航链接数据
- 数据结构包含:
  - `name`: 网站名称
  - `description`: 简短描述
  - `url`: 网站链接
  - `icon`: 网站Logo (使用 Emoji 或 SVG 图标)
  - `tags`: 分类标签数组 (如 "AI对话工具", "AI写作工具")
  - `stats`: 可选的统计数据 (如浏览量、点赞数)

### 3. 页面布局结构

参考截图设计:

```

┌─────────────────────────────────────────────────────┐
│  页面标题: "AI 网站导航"                              │
│  副标题: "精选 AI 工具导航"                            │
├─────────────────────────────────────────────────────┤
│  [卡片1]  [卡片2]  [卡片3]  [卡片4]                   │
│  [卡片5]  [卡片6]  [卡片7]  [卡片8]                   │
│  ...                                                  │
├─────────────────────────────────────────────────────┤
│  "加载更多" 按钮                                      │
└─────────────────────────────────────────────────────┘

```

### 4. 卡片组件设计

创建 `components/nav-card.tsx`:

```tsx

// 卡片结构 (参考截图)
<a href={url} target="_blank" rel="noopener noreferrer"
   className="group relative rounded-xl border bg-card 
              hover:shadow-lg transition-all duration-300">
  
  {/* 头部: Logo + 名称 + 描述 */}
  <div className="flex items-start gap-3 p-4">
    {/* Logo - 40x40 圆形/圆角 */}
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br">
      {icon}
    </div>
    
    <div className="flex-1 min-w-0">
      <h3 className="font-medium">{name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {description}
      </p>
    </div>
    
    {/* 右侧箭头图标 */}
    <ExternalLink className="h-4 w-4 text-muted-foreground 
                             group-hover:text-primary" />
  </div>
  
  {/* 底部: 标签 */}
  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
    {tags.map(tag => (
      <span className="text-xs px-2 py-0.5 rounded-full 
                       bg-muted text-muted-foreground">
        {tag}
      </span>
    ))}
  </div>
</a>

```

### 5. 页面主组件

`app/nav/page.tsx`:

```tsx

export default function NavPage() {
  const [visibleCount, setVisibleCount] = useState(8);
  
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      
      {/* 页面头部 */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold">AI 网站导航</h1>
          <p className="text-muted-foreground mt-2">
            精选优质 AI 工具，一键直达
          </p>
        </div>
      </section>
      
      {/* 导航卡片网格 */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 
                          lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {navData.slice(0, visibleCount).map((item) => (
              <NavCard key={item.url} {...item} />
            ))}
          </div>
          
          {visibleCount < navData.length && (
            <div className="text-center mt-8">
              <Button onClick={() => setVisibleCount(prev => prev + 8)}>
                加载更多
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <SiteFooter />
    </main>
  );
}

```

### 6. 关键文件清单

| 文件 | 说明 |
|------|------|
| `app/nav/page.tsx` | 导航页面主组件 |
| `components/nav-card.tsx` | 导航卡片组件 |
| `lib/nav-data.ts` | 导航链接数据配置 |

### 7. 设计要点

- **响应式网格**: 1列(手机) → 2列(平板) → 3列(桌面) → 4列(大屏)
- **卡片悬停效果**: `hover:-translate-y-0.5 hover:shadow-lg`
- **标签颜色**: 使用 `bg-muted text-muted-foreground` 保持简洁
- **外部链接**: 使用 `target="_blank" rel="noopener noreferrer"` 在新标签页打开
- **主题适配**: 自动跟随系统深色/浅色主题

### 8. 验证方式

1. 运行 `npm run dev` 启动开发服务器
2. 访问 `http://localhost:3000/nav` 查看页面
3. 测试卡片点击是否正常跳转
4. 测试响应式布局在不同屏幕尺寸下的表现
5. 测试"加载更多"功能
