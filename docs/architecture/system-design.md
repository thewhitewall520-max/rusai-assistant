# 系统架构设计

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile Web  │  │  Browser Ext │      │
│  │  (React)     │  │  (PWA)       │  │  (未来)       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      API 网关层                              │
│                    (Nginx / Kong)                            │
│         负载均衡 / 限流 / SSL / 静态资源托管                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     应用服务层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   用户服务    │  │   写作服务    │  │   翻译服务    │      │
│  │  (Auth/JWT)  │  │  (AI 写作)   │  │  (NMT/API)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   模板服务    │  │   文件服务    │  │   支付服务    │      │
│  │  (Templates) │  │  (Export)    │  │  (Stripe)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      数据层                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │    S3/MinIO  │      │
│  │  (主数据库)   │  │   (缓存)     │  │  (文件存储)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI 服务层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  OpenAI API  │  │ Claude API   │  │  自研模型     │      │
│  │  (GPT-4)     │  │  (Anthropic) │  │  (未来)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Google Trans │  │  DeepL API   │                         │
│  │  (翻译备用)   │  │  (翻译备用)   │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## 技术选型理由

### 前端
- **React 18**: 生态成熟，组件化开发
- **TypeScript**: 类型安全，提升开发效率
- **Tailwind CSS**: 原子化 CSS，快速 UI 开发
- **i18next**: 成熟的国际化方案，支持复数、上下文等

### 后端
- **Node.js + NestJS**: 企业级框架，内置依赖注入、模块化
- **PostgreSQL**: 支持 JSON、全文搜索，适合内容存储
- **Redis**: 会话缓存、限流、热点数据

### AI 能力
- **OpenAI API**: 主要 AI 写作能力
- **Claude API**: 备选，长文本处理更强
- **Google Translate / DeepL**: 翻译备用方案

## 数据模型

### 用户 (users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  preferred_language VARCHAR(10) DEFAULT 'zh',
  subscription_tier VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 文档 (documents)
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  content TEXT,
  type VARCHAR(50), -- email, essay, translation, etc.
  language VARCHAR(10),
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 模板 (templates)
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  category VARCHAR(50), -- email, essay, etc.
  content TEXT,
  language VARCHAR(10),
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API 设计

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/refresh` - 刷新 Token

### 文档
- `GET /api/documents` - 列表
- `POST /api/documents` - 创建
- `GET /api/documents/:id` - 详情
- `PUT /api/documents/:id` - 更新
- `DELETE /api/documents/:id` - 删除

### AI 写作
- `POST /api/ai/generate` - 生成内容
- `POST /api/ai/rewrite` - 改写
- `POST /api/ai/translate` - 翻译
- `POST /api/ai/complete` - 补全

### 模板
- `GET /api/templates` - 模板列表
- `POST /api/templates` - 创建模板
- `GET /api/templates/:id` - 模板详情

## 安全设计

1. **JWT 认证**: Access Token + Refresh Token
2. **API 限流**: 基于用户等级的请求限制
3. **输入验证**: Zod / Joi  schema 验证
4. **SQL 注入防护**: ORM 参数化查询
5. **XSS 防护**: 输入过滤、CSP 策略
6. **数据加密**: 敏感字段加密存储

## 性能优化

1. **数据库索引**: 常用查询字段加索引
2. **Redis 缓存**: 热点数据缓存
3. **CDN**: 静态资源加速
4. **数据库连接池**: 避免连接耗尽
5. **分页查询**: 大数据量分页
6. **AI 响应流式**: SSE 流式输出