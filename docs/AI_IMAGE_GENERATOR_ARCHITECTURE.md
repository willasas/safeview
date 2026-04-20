# AI 图像生成平台 - 前后端分离架构说明

## 🎯 为什么选择前后端分离？

### 核心优势

1. **职责清晰，分工明确**
   - 前端（Next.js）：专注 UI/UX、用户交互、状态管理
   - 后端（FastAPI）：专注 AI 推理、任务调度、数据存储
   - ComfyUI：专注模型推理、工作流执行

2. **独立部署，灵活扩展**
   ```
   前端 → Vercel / Netlify / Cloudflare Pages (CDN 加速)
   后端 → GPU 服务器 (Docker + Nginx)
   ComfyUI → 内网服务 (端口 8188)
   ```

3. **技术栈最优选择**
   - 前端：TypeScript + React 生态（已有技术栈）
   - 后端：Python FastAPI（AI 生态友好）
   - 数据库：PostgreSQL（生产级可靠性）

4. **资源隔离，性能优化**
   - GPU 密集型任务在后端，不影响前端响应
   - 前端可以快速迭代，无需等待后端
   - 可以独立扩缩容（前端无状态，后端有状态）

5. **多端支持**
   - Web 应用（Next.js）
   - 移动 App（React Native / Flutter）
   - 桌面应用（Electron）
   - 都可以调用同一个后端 API

6. **团队协作**
   - 前端团队和后端团队可以并行开发
   - 通过 API 契约（OpenAPI/Swagger）协作
   - 减少沟通成本

---

## 🏗️ 前后端分离架构图

```
┌─────────────────────────────────────────┐
│         用户浏览器 / 移动设备             │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────┐
│      前端应用 (Next.js 16)               │
│      部署: Vercel / Netlify              │
│      域名: dctools.app                   │
│                                          │
│  - app/tools/ai-image-generator/        │
│  - React 组件 + TypeScript              │
│  - Axios 调用后端 API                    │
│  - WebSocket 实时通信                    │
└──────────────┬──────────────────────────┘
               │ REST API + WebSocket
               │ https://api.dctools.app
┌──────────────▼──────────────────────────┐
│   后端 API (Python FastAPI)              │
│   部署: GPU Server + Docker             │
│   域名: api.dctools.app                 │
│                                          │
│  Endpoints:                             │
│  POST   /api/v1/generate               │
│  GET    /api/v1/tasks/{id}             │
│  GET    /api/v1/models                 │
│  GET    /api/v1/history                │
│  WS     /ws/progress/{id}              │
│                                          │
│  核心模块:                               │
│  - 任务队列 (Celery + Redis)            │
│  - ComfyUI 客户端封装                    │
│  - 工作流动态构建                        │
│  - 文件存储 (S3 / 本地)                  │
│  - JWT 认证 + 限流                      │
└──────────────┬──────────────────────────┘
               │ HTTP (内网)
┌──────────────▼──────────────────────────┐
│      ComfyUI Service                     │
│      端口: 8188 (不对外暴露)             │
│                                          │
│  - 工作流执行引擎                        │
│  - 模型加载与管理                        │
│  - GPU 资源调度                          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      AI Models + GPU                    │
│  - SDXL / Flux / ControlNet            │
│  - NVIDIA A100/A10/RTX 3090            │
│  - CUDA 12.x + PyTorch                 │
└─────────────────────────────────────────┘
```

---

## 📁 项目目录结构

```
dctools/                          # 前端项目（现有）
├── app/
│   └── tools/
│       └── ai-image-generator/   # AI 图像生成页面
│           ├── page.tsx
│           ├── components/
│           ├── hooks/
│           └── lib/
├── package.json
└── ...

backend/                          # 后端项目（新增）
├── main.py                       # FastAPI 入口
├── api/
│   └── v1/
│       ├── generate.py           # 生成接口
│       ├── tasks.py              # 任务查询
│       ├── models.py             # 模型列表
│       └── history.py            # 历史记录
├── core/
│   ├── config.py                 # 配置管理
│   ├── database.py               # 数据库连接
│   └── security.py               # 认证与限流
├── services/
│   ├── comfy_client.py           # ComfyUI 客户端
│   ├── workflow_manager.py       # 工作流管理器
│   └── task_queue.py             # 任务队列
├── models/                       # Pydantic & SQLAlchemy
├── alembic/                      # 数据库迁移
├── requirements.txt
├── Dockerfile
└── .env

comfyui/                          # ComfyUI 安装目录
├── main.py                       # ComfyUI 入口
├── models/                       # AI 模型文件
│   ├── checkpoints/
│   ├── vae/
│   ├── controlnet/
│   └── loras/
└── ...

docker-compose.yml                # Docker 编排
```

---

## 🔌 API 接口设计

### RESTful API

#### 1. 提交生成任务
```http
POST https://api.dctools.app/api/v1/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "prompt": "a beautiful sunset over mountains",
  "negative_prompt": "blurry, low quality",
  "model": "sdxl",
  "steps": 20,
  "cfg_scale": 7.5,
  "width": 1024,
  "height": 1024,
  "seed": null
}
```

**响应**:
```json
{
  "task_id": "uuid-12345",
  "status": "queued",
  "estimated_time": 30
}
```

#### 2. 查询任务状态
```http
GET https://api.dctools.app/api/v1/tasks/{task_id}
```

**响应**:
```json
{
  "task_id": "uuid-12345",
  "status": "processing",
  "progress": 65,
  "current_step": 13,
  "total_steps": 20
}
```

#### 3. 获取生成结果
```http
GET https://api.dctools.app/api/v1/tasks/{task_id}/result
```

**响应**:
```json
{
  "task_id": "uuid-12345",
  "status": "completed",
  "image_url": "https://cdn.dctools.app/images/xxx.png",
  "metadata": {
    "model": "sdxl",
    "steps": 20,
    "cfg_scale": 7.5,
    "seed": 123456789,
    "generation_time": 28.5
  }
}
```

#### 4. 获取可用模型列表
```http
GET https://api.dctools.app/api/v1/models
```

**响应**:
```json
{
  "models": [
    {
      "id": "sdxl",
      "name": "Stable Diffusion XL",
      "description": "高质量通用模型",
      "max_resolution": "1024x1024",
      "supported_features": ["txt2img", "img2img"]
    },
    {
      "id": "flux",
      "name": "Flux.1 Dev",
      "description": "最新一代模型，细节更好",
      "max_resolution": "2048x2048",
      "supported_features": ["txt2img", "img2img", "controlnet"]
    }
  ]
}
```

#### 5. 获取历史记录
```http
GET https://api.dctools.app/api/v1/history?page=1&limit=20
```

### WebSocket 实时推送

```javascript
const ws = new WebSocket('wss://api.dctools.app/ws/progress/{task_id}')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log(`进度: ${data.progress}%`)

  if (data.status === 'completed') {
    console.log('生成完成!', data.image_url)
  }
}
```

---

## 🚀 部署方案

### 开发环境

```bash
# 1. 启动后端
cd backend
docker-compose up -d

# 2. 启动前端
cd ..
pnpm dev

# 访问
# 前端: http://localhost:3303
# 后端 API: http://localhost:8000/docs (Swagger UI)
# ComfyUI: http://localhost:8188
```

### 生产环境

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # 前端 - 部署到 Vercel
  # 不需要在 Docker 中运行

  # 后端 API
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/aidb
      - REDIS_URL=redis://redis:6379
      - COMFYUI_URL=http://comfyui:8188
      - AWS_S3_BUCKET=ai-images
    depends_on:
      - db
      - redis
      - comfyui

  # ComfyUI
  comfyui:
    build: ./comfyui
    ports:
      - "8188:8188"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    volumes:
      - ./models:/app/models
      - ./output:/app/output

  # 数据库
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=aidb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

  # Redis
  redis:
    image: redis:7-alpine

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  pgdata:
```

---

## 🔐 安全考虑

### 1. CORS 配置
```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dctools.app", "http://localhost:3303"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. API 认证
```python
# 使用 JWT Token
from fastapi import Depends, HTTPException
from jose import jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 3. 速率限制
```python
# 防止滥用
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/generate")
@limiter.limit("10/minute")  # 每分钟最多 10 次
async def generate(request: Request, params: GenerationRequest):
    ...
```

### 4. 文件上传安全
- 验证文件类型（只允许图片）
- 限制文件大小（最大 10MB）
- 扫描恶意内容
- 存储在隔离目录

---

## 💰 成本估算

### 开发阶段（本地）
- GPU 服务器：自有硬件或云GPU（约 ¥500-2000/月）
- 前端托管：Vercel 免费层
- 域名：¥50/年

### 生产阶段（云服务）
| 组件 | 服务商 | 费用 |
|------|--------|------|
| 前端托管 | Vercel Pro | $20/月 |
| 后端 API | AWS EC2 g4dn.xlarge | $0.526/小时 |
| GPU 实例 | AWS/Azure/GCP | $1-3/小时 |
| 数据库 | AWS RDS PostgreSQL | $50/月 |
| 对象存储 | AWS S3 | $0.023/GB |
| CDN | CloudFront | $0.085/GB |

**优化建议**：
- 使用 Spot Instances 降低 GPU 成本（节省 70%）
- 实现自动扩缩容（空闲时关闭 GPU 实例）
- 使用缓存减少重复生成

---

## 📊 性能指标

### 目标性能
- API 响应时间：< 100ms（不含生成时间）
- 图像生成时间：< 30秒（SDXL, 1024x1024）
- WebSocket 延迟：< 50ms
- 并发处理能力：10-50 QPS

### 监控指标
- GPU 利用率
- 显存占用
- 任务队列长度
- API 错误率
- 平均生成时间

---

## 🔄 开发流程

### 前后端并行开发

```
Week 1-2:
  后端 - 搭建 FastAPI + ComfyUI 集成
  前端 - 设计 UI 原型 + 组件开发

Week 3-4:
  后端 - 实现核心 API + WebSocket
  前端 - 集成 API + 实现交互逻辑

Week 5-6:
  后端 - 优化性能 + 添加测试
  前端 - 完善功能 + E2E 测试

Week 7-8:
  联调 + 部署 + 文档
```

### API 契约先行

1. 先定义 OpenAPI/Swagger 规范
2. 前后端基于规范并行开发
3. 使用 Mock 数据进行前端开发
4. 后端完成后进行集成测试

---

## ✅ 总结

**前后端分离的核心价值**：

1. ✅ **技术栈最优**：前端用 JS/TS，后端用 Python
2. ✅ **独立部署**：前端 CDN 加速，后端 GPU 专用
3. ✅ **易于维护**：职责清晰，团队协作顺畅
4. ✅ **可扩展性**：支持多端、易扩容
5. ✅ **性能优化**：资源隔离，互不影响

**下一步行动**：
1. 创建 `backend/` 目录
2. 初始化 FastAPI 项目
3. 安装 ComfyUI 并测试
4. 定义 API 接口规范（OpenAPI）
5. 开始并行开发

这个架构既保持了现有 DC工具集的技术优势，又引入了专业的 AI 服务能力，是最佳实践！🚀
