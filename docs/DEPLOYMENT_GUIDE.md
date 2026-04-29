# 部署指南

## 架构概述

```
┌─────────────┐      git push       ┌─────────────┐      CI/CD       ┌─────────────┐
│   宿主机     │  ────────────────→  │   GitHub    │  ──────────────→ │  测试服务器  │
│  (开发)      │                     │  (代码仓库)  │                  │  (生产环境)  │
│             │                     │             │                  │             │
│ • 纯代码     │                     │ • 版本控制   │                  │ • Docker    │
│ • 不搭环境   │                     │ • CI/CD     │                  │ • Nginx     │
│ • VS Code   │                     │ • 镜像仓库   │                  │ • SSL       │
└─────────────┘                     └─────────────┘                  └─────────────┘
```

## 环境要求

### 宿主机 (开发)
- **操作系统**: macOS / Linux / Windows (WSL2)
- **必需软件**:
  - Git
  - VS Code (推荐) 或任意编辑器
  - Node.js 20+ (可选，用于本地测试)
- **不需要**: Docker, PostgreSQL, Redis

### GitHub
- **仓库**: 已创建
- **Secrets 配置**: 见下文

### 测试服务器 (生产)
- **操作系统**: Ubuntu 22.04 LTS
- **配置**: 2 CPU, 4GB RAM, 50GB SSD (最低)
- **必需软件**:
  - Docker Engine
  - Docker Compose
  - Git
  - Nginx (可选，如果用 Docker Nginx)

## 快速开始

### 1. 宿主机设置 (开发)

```bash
# 克隆仓库
git clone <your-repo-url>
cd writing-assistant

# 创建功能分支
git checkout -b feature/your-feature

# 开始编码 (只编辑代码，不运行服务)
code .
```

### 2. GitHub 配置

#### 设置 Secrets

进入 `Settings → Secrets and variables → Actions`，添加以下 secrets：

| Secret Name | 说明 | 获取方式 |
|------------|------|---------|
| `TEST_SERVER_HOST` | 测试服务器 IP | 你的服务器 IP |
| `TEST_SERVER_USER` | SSH 用户名 | 通常是 `root` 或 `ubuntu` |
| `SSH_PRIVATE_KEY` | SSH 私钥 | `cat ~/.ssh/id_rsa` |
| `DOCKER_USERNAME` | Docker Hub 用户名 | Docker Hub 账号 |
| `DOCKER_PASSWORD` | Docker Hub 密码/Token | Docker Hub 设置 |
| `OPENAI_API_KEY` | OpenAI API Key | OpenAI 后台 |
| `ANTHROPIC_API_KEY` | Claude API Key | Anthropic 后台 |
| `DATABASE_PASSWORD` | 数据库密码 | 自定义 |
| `REDIS_PASSWORD` | Redis 密码 | 自定义 |
| `JWT_SECRET` | JWT 密钥 | `openssl rand -base64 32` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | @BotFather |
| `TELEGRAM_CHAT_ID` | Telegram Chat ID | 你的用户 ID |

### 3. 测试服务器设置 (生产)

#### 初始安装

```bash
# 1. 连接服务器
ssh root@your-server-ip

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 3. 安装 Docker Compose
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# 4. 创建项目目录
mkdir -p /opt/writing-assistant
cd /opt/writing-assistant

# 5. 克隆代码
git clone <your-repo-url> .

# 6. 创建环境文件
cat > .env << 'EOF'
NODE_ENV=production
DB_USER=writing_assistant
DB_PASSWORD=your_secure_password
DB_NAME=writing_assistant
DATABASE_URL=postgresql://writing_assistant:your_secure_password@postgres:5432/writing_assistant
REDIS_PASSWORD=your_redis_password
REDIS_URL=redis://:your_redis_password@redis:6379
JWT_SECRET=your_jwt_secret_key_min_32_chars
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_MODEL=gpt-4
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key
FRONTEND_URL=https://your-domain.com
PORT=3000
EOF

# 7. 启动服务
docker-compose up -d

# 8. 查看状态
docker-compose ps
docker-compose logs -f
```

#### 配置 Nginx (如果使用系统 Nginx)

```bash
# 安装 Nginx
apt install nginx certbot python3-certbot-nginx

# 复制配置
cp /opt/writing-assistant/infra/nginx/nginx.conf /etc/nginx/sites-available/writing-assistant
ln -s /etc/nginx/sites-available/writing-assistant /etc/nginx/sites-enabled/

# 获取 SSL 证书
certbot --nginx -d your-domain.com

# 重启 Nginx
systemctl restart nginx
```

## 日常开发流程

### 开发新功能

```bash
# 1. 在宿主机上创建分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. 编写代码
# ... 编辑文件 ...

# 3. 提交代码
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 4. 在 GitHub 创建 Pull Request
# 5. 代码审查
# 6. 合并到 develop
```

### 自动部署

```
git push origin main
    ↓
GitHub Actions 触发
    ↓
运行测试 → 构建镜像 → 推送 Docker Hub
    ↓
SSH 到测试服务器
    ↓
git pull → docker-compose up -d
    ↓
✅ 部署完成
```

### 查看部署状态

```bash
# 在测试服务器上
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
```

## 回滚操作

### 自动回滚

如果健康检查失败，CD 会自动回滚到上一个版本。

### 手动回滚

1. 进入 GitHub Actions
2. 选择 "Rollback" 工作流
3. 点击 "Run workflow"
4. 输入要回滚的版本 (commit SHA 或 tag)
5. 点击运行

### 紧急回滚 (服务器上)

```bash
ssh root@your-server-ip
cd /opt/writing-assistant

# 查看历史版本
git log --oneline -10

# 回滚到指定版本
git reset --hard <commit-sha>
docker-compose up -d
```

## 监控与日志

### 查看日志

```bash
# 实时日志
docker-compose logs -f

# 后端日志
docker-compose logs -f backend

# 前端日志
docker-compose logs -f frontend

# 数据库日志
docker-compose logs -f postgres
```

### 监控资源

```bash
# Docker 状态
docker stats

# 系统资源
htop

# 磁盘使用
df -h
docker system df
```

## 备份策略

### 数据库备份

```bash
# 手动备份
docker-compose exec postgres pg_dump -U writing_assistant writing_assistant > backup_$(date +%Y%m%d).sql

# 自动备份 (添加到 crontab)
0 3 * * * cd /opt/writing-assistant && docker-compose exec -T postgres pg_dump -U writing_assistant writing_assistant > /backups/writing_assistant_$(date +\%Y\%m\%d).sql
```

### 代码备份

代码已经在 GitHub 上，天然有版本控制和备份。

## 故障排除

### 服务无法启动

```bash
# 检查日志
docker-compose logs

# 检查端口占用
netstat -tlnp | grep 3000
netstat -tlnp | grep 5173

# 重启服务
docker-compose restart

# 完全重建
docker-compose down
docker-compose up -d --build
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose ps postgres
docker-compose logs postgres

# 进入数据库
docker-compose exec postgres psql -U writing_assistant -d writing_assistant
```

### SSL 证书问题

```bash
# 重新申请证书
certbot renew --force-renewal

# 检查证书状态
certbot certificates
```

## 安全建议

1. **SSH 密钥**: 使用密钥登录，禁用密码登录
2. **防火墙**: 只开放必要端口 (80, 443, 22)
3. **定期更新**: `apt update && apt upgrade`
4. **Docker 安全**: 定期更新基础镜像
5. **Secrets 管理**: 不在代码中硬编码密钥
6. **备份**: 定期备份数据库

## 扩展建议

### 添加更多服务器

```
GitHub Actions
    ├── deploy-staging.yml   # 部署到测试环境
    └── deploy-production.yml # 部署到生产环境
```

### 使用 Kubernetes (大规模)

```
GitHub Actions
    └── deploy-k8s.yml
        ├── 构建镜像
        ├── 推送镜像
        └── kubectl apply
```

## 总结

| 步骤 | 命令 | 位置 |
|------|------|------|
| 开发 | `git push` | 宿主机 |
| 构建 | 自动触发 | GitHub Actions |
| 部署 | 自动触发 | 测试服务器 |
| 监控 | `docker-compose logs` | 测试服务器 |
| 回滚 | GitHub Actions / SSH | 任意 |

这个方案实现了 **开发极简、部署自动化、环境一致性**。