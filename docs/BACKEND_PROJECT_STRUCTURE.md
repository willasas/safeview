# AI 图像生成平台 - 项目目录结构说明

## 📁 推荐的目录结构

### 方案：前后端分离（同级目录）✅

```
D:\VDhub\
├── safeview/                    # 前端项目（当前 Next.js 项目）
│   ├── app/
│   │   ├── tools/
│   │   │   └── ai-image-generator/  # AI 图像生成页面（新增）
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── docs/
│   │   └── AI_IMAGE_GENERATOR_ARCHITECTURE.md  # 架构文档
│   ├── package.json
│   ├── next.config.mjs
│   └── ...
│
├── ai-image-backend/            # 后端项目（新增，与 safeview 同级）
│   ├── main.py                  # FastAPI 入口
│   ├── api/                     # API 路由
│   │   └── v1/
│   │       ├── generate.py      # 图像生成接口
│   │       ├── tasks.py         # 任务查询
│   │       ├── models.py        # 模型列表
│   │       └── history.py       # 历史记录
│   ├── core/                    # 核心配置
│   │   ├── config.py            # 环境变量
│   │   ├── database.py          # 数据库连接
│   │   └── security.py          # 认证限流
│   ├── services/                # 业务逻辑
│   │   ├── comfy_client.py      # ComfyUI 客户端
│   │   ├── workflow_manager.py  # 工作流管理
│   │   └── task_queue.py        # 任务队列
│   ├── models/                  # 数据模型
│   │   ├── request.py           # Pydantic 请求模型
│   │   ├── response.py          # Pydantic 响应模型
│   │   └── database.py          # SQLAlchemy 模型
│   ├── alembic/                 # 数据库迁移
│   ├── tests/                   # 测试文件
│   ├── requirements.txt         # Python 依赖
│   ├── Dockerfile               # Docker 配置
│   ├── docker-compose.yml       # Docker Compose
│   ├── .env.example             # 环境变量示例
│   └── README.md                # 后端文档
│
└── comfyui/                     # ComfyUI 引擎（可选，独立目录）
    ├── main.py                  # ComfyUI 入口
    ├── models/                  # AI 模型文件
    │   ├── checkpoints/         # SDXL, Flux 等
    │   ├── vae/                 # VAE 模型
    │   ├── controlnet/          # ControlNet 模型
    │   └── loras/               # LoRA 模型
    ├── custom_nodes/            # 自定义节点
    └── output/                  # 生成结果
```

---

## 🎯 为什么选择同级目录？

### 优势

1. **职责清晰**
   - `safeview/` - 纯前端项目，专注 UI/UX
   - `ai-image-backend/` - 纯后端项目，专注 AI 推理
   - 互不干扰，易于理解

2. **独立 Git 仓库**
   ```bash
   # 前端仓库
   cd safeview
   git init
   
   # 后端仓库
   cd ../ai-image-backend
   git init
   ```

3. **独立部署**
   - 前端 → Vercel / Netlify
   - 后端 → GPU 服务器（Docker）
   - ComfyUI → 内网服务

4. **技术栈隔离**
   - 前端：Node.js + TypeScript
   - 后端：Python + FastAPI
   - 环境完全分离，不会冲突

5. **团队协作**
   - 前端团队负责 `safeview/`
   - 后端团队负责 `ai-image-backend/`
   - 通过 API 契约协作

6. **符合最佳实践**
   - 大多数前后端分离项目都采用这种结构
   - 易于维护和扩展

---

## 🚀 如何创建后端项目

### Step 1: 创建目录

```bash
cd D:\VDhub
mkdir ai-image-backend
cd ai-image-backend
```

### Step 2: 初始化 Python 项目

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 创建项目结构
mkdir api api\v1 core services models tests
```

### Step 3: 安装依赖

创建 `requirements.txt`：

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
sqlalchemy==2.0.25
alembic==1.13.1
psycopg2-binary==2.9.9  # PostgreSQL
redis==5.0.1
celery==5.3.6
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
slowapi==0.1.8
boto3==1.34.14  # AWS S3
websocket-client==1.7.0
requests==2.31.0
Pillow==10.2.0
```

安装：

```bash
pip install -r requirements.txt
```

### Step 4: 创建基础文件

#### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Image Generator API",
    description="AI 图像生成平台后端服务",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3303", "https://dctools.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Image Generator API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### .env.example

```env
# 服务器配置
HOST=0.0.0.0
PORT=8000
DEBUG=True

# 数据库配置
DATABASE_URL=sqlite:///./aidb.db
# 生产环境使用 PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/aidb

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# ComfyUI 配置
COMFYUI_URL=http://localhost:8188

# JWT 配置
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS S3 配置（可选）
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=ai-images
AWS_REGION=us-east-1

# 限流配置
RATE_LIMIT_PER_MINUTE=10
```

### Step 5: 启动服务

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

访问 http://localhost:8000/docs 查看 Swagger UI

---

## 🔗 前后端通信

### 前端调用后端 API

在 `safeview/app/tools/ai-image-generator/lib/api.ts` 中：

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function generateImage(params: GenerationParams) {
  const response = await fetch(`${API_BASE_URL}/api/v1/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  
  if (!response.ok) {
    throw new Error('生成失败')
  }
  
  return response.json()
}
```

### 环境变量配置

在 `safeview/.env.local` 中：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## 📦 Docker 部署

### docker-compose.yml（在 ai-image-backend 目录）

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/aidb
      - REDIS_URL=redis://redis:6379
      - COMFYUI_URL=http://comfyui:8188
    depends_on:
      - db
      - redis
      - comfyui
  
  comfyui:
    image: ghcr.io/comfyanonymous/comfyui:latest
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
  
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=aidb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
  
  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

---

## 🤝 开发工作流

### 并行开发

```bash
# 终端 1: 启动前端
cd D:\VDhub\safeview
pnpm dev

# 终端 2: 启动后端
cd D:\VDhub\ai-image-backend
venv\Scripts\activate
uvicorn main:app --reload

# 终端 3: 启动 ComfyUI
cd D:\VDhub\comfyui
python main.py --listen 0.0.0.0
```

### Git 工作流

```bash
# 前端提交
cd safeview
git add .
git commit -m "feat: add AI image generator UI"
git push

# 后端提交
cd ../ai-image-backend
git add .
git commit -m "feat: implement generation API"
git push
```

---

## 📊 项目对比

| 特性 | safeview (前端) | ai-image-backend (后端) |
|------|----------------|------------------------|
| 语言 | TypeScript | Python |
| 框架 | Next.js 16 | FastAPI |
| 端口 | 3303 | 8000 |
| 部署 | Vercel | GPU Server |
| 依赖 | Node.js 18+ | Python 3.10+ |
| 数据库 | 无（调用 API） | PostgreSQL |
| GPU | 不需要 | 必需 |

---

## ✅ 总结

**推荐的目录结构**：

```
D:\VDhub\
├── safeview/              # 前端（现有项目）
├── ai-image-backend/      # 后端（新建）
└── comfyui/               # ComfyUI（可选）
```

**核心理由**：
1. ✅ 职责清晰，易于维护
2. ✅ 独立部署，灵活扩展
3. ✅ 技术栈隔离，互不干扰
4. ✅ 符合行业标准
5. ✅ 便于团队协作

**下一步**：
1. 创建 `D:\VDhub\ai-image-backend\` 目录
2. 初始化 Python 项目
3. 安装 FastAPI 和相关依赖
4. 实现第一个 API 端点
5. 测试前后端通信

这个结构既保持了现有项目的完整性，又为后端服务提供了独立的开发空间！🚀
