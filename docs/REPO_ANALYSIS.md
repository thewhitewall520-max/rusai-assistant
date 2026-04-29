# 仓库分析报告 - rusai-assistant

## 仓库信息

| 项目 | 详情 |
|------|------|
| **仓库地址** | https://github.com/thewhitewall520-max/rusai-assistant |
| **项目名称** | RusAI Assistant |
| **描述** | 中俄AI寫作工具 |
| **域名** | rusai.cc |
| **状态** | 已有基础代码，需要重构升级 |

## 现有技术栈

### 前端
- **框架**: Next.js 14.2.0 (React 18)
- **认证**: NextAuth.js 4.24.14
- **数据库 ORM**: Prisma 7.8.0
- **样式**: 未明确 (可能是 CSS Modules 或 Tailwind)

### 后端
- **框架**: FastAPI (Python)
- **服务器**: Uvicorn
- **数据库**: SQLite (dev.db) - 生产环境需要更换

### 当前功能 (已完成)
- ✅ 翻译功能 (中→俄 + 语气选择)
- ✅ 邮件生成
- ✅ 基础 UI
- 🔄 登录系统 (部分完成)
- ⏳ 历史记录 (未开始)

## 需要清理/升级的内容

### 1. 代码结构问题

```
当前结构 (需要重构):
├── .env                    # ❌ 包含敏感信息，需要清理
├── dev.db                  # ❌ SQLite 数据库，不应提交到 Git
├── backend/                # 🟡 Python 后端，建议保留或升级
│   ├── main.py
│   ├── app/
│   └── requirements.txt
├── pages/                  # 🟡 Next.js 页面
├── prisma/                 # 🟡 数据库模型
├── styles/                 # 🟡 样式文件
├── package.json            # 🟡 前端依赖
└── ...

目标结构 (重构后):
├── .github/
│   └── workflows/          # ✅ CI/CD 配置
├── src/
│   ├── frontend/           # 🆕 Next.js 前端
│   └── backend/            # 🆕 NestJS 或保留 Python
├── infra/                  # 🆕 Docker + Nginx
├── docs/                   # 🆕 文档
└── README.md
```

### 2. 安全问题

| 问题 | 严重程度 | 解决方案 |
|------|---------|---------|
| `.env` 文件在仓库中 | 🔴 高 | 删除并添加到 `.gitignore` |
| `dev.db` 数据库在仓库中 | 🔴 高 | 删除并添加到 `.gitignore` |
| 无 CI/CD | 🟡 中 | 添加 GitHub Actions |
| 无测试 | 🟡 中 | 添加测试框架 |

### 3. 技术升级建议

#### 方案 A: 保留现有技术栈 (推荐短期)
- 保留 Next.js + FastAPI
- 添加 Docker 支持
- 配置 CI/CD
- 将 SQLite 升级为 PostgreSQL

#### 方案 B: 全面重构 (推荐长期)
- 前端: Next.js → React + Vite (更灵活)
- 后端: FastAPI → NestJS (更好的类型安全)
- 数据库: SQLite → PostgreSQL
- 添加完整的微服务架构

## 清理计划

### 第一步: 清理敏感文件
```bash
# 删除敏感文件
git rm .env dev.db

# 更新 .gitignore
echo ".env" >> .gitignore
echo "*.db" >> .gitignore
echo "node_modules/" >> .gitignore
```

### 第二步: 重构项目结构
```bash
# 创建新结构
mkdir -p src/frontend src/backend infra docs

# 移动现有代码
mv pages/ src/frontend/
mv styles/ src/frontend/
mv backend/ src/backend/
```

### 第三步: 添加基础设施
- Docker + Docker Compose
- Nginx 配置
- GitHub Actions CI/CD
- 环境变量模板

### 第四步: 数据库迁移
- SQLite → PostgreSQL
- Prisma schema 更新
- 数据迁移脚本

## 域名配置

### rusai.cc 配置

```nginx
# Nginx 配置
server {
    listen 80;
    server_name rusai.cc www.rusai.cc;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rusai.cc www.rusai.cc;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

## 建议执行顺序

1. **立即执行**:
   - [ ] 清理敏感文件 (.env, dev.db)
   - [ ] 更新 .gitignore
   - [ ] 创建新的项目结构

2. **本周执行**:
   - [ ] 添加 Docker 支持
   - [ ] 配置 CI/CD
   - [ ] 设置测试服务器

3. **下周执行**:
   - [ ] 数据库迁移 (SQLite → PostgreSQL)
   - [ ] 完善功能 (登录、历史记录)
   - [ ] 配置域名 SSL

4. **持续优化**:
   - [ ] 添加测试
   - [ ] 性能优化
   - [ ] 监控告警

## 决策点

需要确认:
1. **保留 Python 后端还是改用 Node.js?**
2. **是否保留 Next.js 还是改用纯 React?**
3. **测试服务器信息 (IP, SSH 密钥)**
4. **预算范围 (影响服务器配置)**

---

*分析时间: 2026-04-29*
*分析师: CTO Agent*