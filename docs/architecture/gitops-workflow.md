# GitOps 工作流设计

## 核心思路

```
┌─────────────┐     git push      ┌─────────────┐     CI/CD      ┌─────────────┐
│  宿主机      │ ─────────────────→ │   GitHub    │ ─────────────→ │  测试服务器  │
│ (开发环境)   │    代码提交        │  (代码仓库)  │   自动部署      │ (生产环境)   │
│             │                   │             │               │             │
│ • 纯代码     │                   │ • 版本控制   │               │ • 真实环境   │
│ • 不搭环境   │                   │ • 代码审查   │               │ • 自动构建   │
│ • IDE 开发   │                   │ • 分支管理   │               │ • 自动运行   │
└─────────────┘                   └─────────────┘               └─────────────┘
```

## 工作流程

### 1. 开发阶段 (宿主机)

```bash
# 宿主机只存代码，不运行服务
~/projects/writing-assistant/
├── src/
│   ├── frontend/     # React 代码
│   └── backend/      # NestJS 代码
├── docs/             # 文档
├── infra/            # Docker 配置
└── .github/          # CI/CD 配置

# 开发时只编辑代码，不启动 Docker
# 代码编辑 → git commit → git push
```

### 2. 代码仓库 (GitHub)

```
GitHub Repository
├── main              # 生产分支 (保护)
├── develop           # 开发分支
├── feature/*         # 功能分支
├── hotfix/*          # 紧急修复
└── .github/workflows/
    ├── ci.yml        # 持续集成
    └── cd.yml        # 持续部署
```

### 3. 测试服务器 (生产环境)

```
Test Server (VPS / Cloud)
├── Docker Engine     # 容器运行时
├── Docker Compose    # 编排
├── Nginx             # 反向代理
└── SSL Certificates  # 证书

# 自动拉取代码 → 构建 → 运行
# 不存放源代码，只运行容器
```

## 详细流程图

```
开发者 (宿主机)
    │
    │ 1. 编写代码
    │ 2. git add .
    │ 3. git commit -m "feat: add email template"
    │ 4. git push origin feature/email-template
    ▼
GitHub
    │
    │ 5. 创建 Pull Request
    │ 6. Code Review
    │ 7. Merge to develop
    ▼
GitHub Actions (CI)
    │
    │ 8. 运行测试
    │ 9. 构建镜像
    │ 10. 推送镜像到 Registry
    ▼
GitHub Actions (CD)
    │
    │ 11. SSH 连接到测试服务器
    │ 12. docker-compose pull
    │ 13. docker-compose up -d
    ▼
测试服务器 (生产环境)
    │
    │ 14. 运行新版本
    │ 15. 健康检查
    │ 16. 通知开发者
    ▼
✅ 部署完成
```

## 优势分析

| 方面 | 传统方式 | GitOps 方式 |
|------|---------|------------|
| **开发环境** | 本地搭建全套环境 | 只写代码，零环境配置 |
| **环境一致性** | 容易出偏差 | 完全一致 (Docker) |
| **部署速度** | 手动上传，容易出错 | 自动触发，快速可靠 |
| **版本控制** | 容易遗漏文件 | Git 完整记录 |
| **回滚** | 困难 | 一键回滚到任意版本 |
| **协作** | 文件传输 | 分支管理，代码审查 |
| **安全性** | 代码分散 | 统一仓库，权限控制 |

## 技术实现

### GitHub Actions CI 配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ develop, main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies (Backend)
        working-directory: ./src/backend
        run: npm ci
        
      - name: Run tests (Backend)
        working-directory: ./src/backend
        run: npm test
        
      - name: Install dependencies (Frontend)
        working-directory: ./src/frontend
        run: npm ci
        
      - name: Build (Frontend)
        working-directory: ./src/frontend
        run: npm run build
```

### GitHub Actions CD 配置

```yaml
# .github/workflows/cd.yml
name: CD

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Test Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.TEST_SERVER_HOST }}
          username: ${{ secrets.TEST_SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/writing-assistant
            git pull origin main
            docker-compose pull
            docker-compose up -d --build
            docker system prune -f
```

### 测试服务器目录结构

```
/opt/writing-assistant/
├── docker-compose.yml      # 从 Git 拉取
├── .env                    # 服务器本地配置 (不提交 Git)
├── nginx/
│   └── nginx.conf          # 从 Git 拉取
└── data/                   # 数据卷 (不提交 Git)
    ├── postgres/
    └── redis/
```

## 环境变量管理

### 宿主机 (开发)
```bash
# .env.local (本地开发配置，不提交 Git)
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/writing_assistant
```

### GitHub (CI/CD)
```
Settings → Secrets and variables → Actions
├── TEST_SERVER_HOST      # 测试服务器 IP
├── TEST_SERVER_USER      # SSH 用户名
├── SSH_PRIVATE_KEY       # SSH 私钥
├── OPENAI_API_KEY        # API 密钥
└── DATABASE_PASSWORD     # 数据库密码
```

### 测试服务器 (生产)
```bash
# /opt/writing-assistant/.env (服务器本地，不提交 Git)
NODE_ENV=production
DATABASE_URL=postgresql://db:5432/writing_assistant
OPENAI_API_KEY=sk-...
```

## 部署策略

### 1. 蓝绿部署 (推荐)
```
测试服务器
├── blue  (当前版本 v1.0)
└── green (新版本 v1.1)

# 部署流程
1. 在 green 部署新版本
2. 健康检查通过
3. Nginx 切换流量到 green
4. blue 保持运行 (快速回滚)
```

### 2. 滚动部署
```
测试服务器
├── container-1 (更新中)
├── container-2 (运行中)
└── container-3 (运行中)

# 逐个更新容器，零停机
```

## 监控与告警

```
测试服务器监控
├── Uptime Kuma         # 服务状态监控
├── Prometheus          # 指标收集
├── Grafana             # 可视化面板
└── AlertManager        # 告警通知

# 告警渠道
├── Telegram Bot
├── Email
└── Webhook
```

## 完整工作流示例

### 日常开发流程

```bash
# 1. 宿主机上开始新功能
git checkout -b feature/ai-rewrite
code .

# 2. 编写代码 (只编辑，不运行 Docker)
# ... coding ...

# 3. 提交代码
git add .
git commit -m "feat: add AI rewrite function"
git push origin feature/ai-rewrite

# 4. GitHub 上创建 PR
# 5. Code Review
# 6. Merge to develop

# 7. 自动触发 CI/CD
# 8. 测试服务器自动更新

# 9. 验证功能
# 访问 https://test-server.com
```

### 紧急修复流程

```bash
# 1. 创建热修复分支
git checkout -b hotfix/critical-bug

# 2. 修复代码
# ... fix ...

# 3. 提交并合并到 main
git commit -m "hotfix: fix critical bug"
git push origin hotfix/critical-bug
# PR → Merge to main

# 4. 自动部署到测试服务器
# 5. 验证后合并到 develop
```

## 总结

| 组件 | 职责 | 状态 |
|------|------|------|
| **宿主机** | 纯代码开发，零环境 | ✅ 最轻量 |
| **GitHub** | 版本控制 + CI/CD | ✅ 自动化 |
| **测试服务器** | 真实运行环境 | ✅ 生产级 |

这个方案的优势：**开发极简、部署自动化、环境一致性、快速回滚**。