# 仓库清理与升级计划

## 🎯 目标
将现有 `rusai-assistant` 仓库清理并升级为生产级项目

## 📊 现状分析

### 现有技术栈
- **前端**: Next.js 14 + React 18 + NextAuth
- **后端**: Python FastAPI
- **数据库**: SQLite (dev.db)
- **ORM**: Prisma

### 存在的问题
1. ❌ `.env` 文件包含敏感信息且在仓库中
2. ❌ `dev.db` 数据库文件在仓库中
3. ❌ 无 Docker 支持
4. ❌ 无 CI/CD
5. ❌ 项目结构混乱

## 🧹 清理步骤

### Step 1: 清理敏感文件

```bash
# 1. 克隆仓库
git clone https://github.com/thewhitewall520-max/rusai-assistant.git
cd rusai-assistant

# 2. 删除敏感文件
git rm .env
git rm dev.db

# 3. 更新 .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc

# Environment
.env
.env.local
.env.*.local

# Database
*.db
*.sqlite
*.sqlite3

# Build
.next/
dist/
build/

# Logs
*.log
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.docker/

# Temporary
tmp/
temp/
EOF

# 4. 提交清理
git add .gitignore
git commit -m "security: remove sensitive files and update .gitignore"
```

### Step 2: 重构项目结构

```bash
# 创建新结构
mkdir -p src/frontend src/backend infra/docker infra/nginx docs

# 移动前端代码
mv pages/ src/frontend/
mv styles/ src/frontend/
mv public/ src/frontend/ 2>/dev/null || true
mv components/ src/frontend/ 2>/dev/null || true
mv lib/ src/frontend/ 2>/dev/null || true
mv utils/ src/frontend/ 2>/dev/null || true

# 移动后端代码
mv backend/* src/backend/
rmdir backend

# 移动配置文件
mv package.json src/frontend/
mv package-lock.json src/frontend/
mv next.config.js src/frontend/
mv tsconfig.json src/frontend/ 2>/dev/null || true
mv tailwind.config.js src/frontend/ 2>/dev/null || true
mv postcss.config.js src/frontend/ 2>/dev/null || true

# 移动 Prisma
mv prisma/ src/frontend/ 2>/dev/null || true
mv prisma.config.ts src/frontend/ 2>/dev/null || true

# 提交重构
git add .
git commit -m "refactor: restructure project layout"
```

### Step 3: 添加 Docker 支持

```bash
# 创建 Docker 配置
cat > infra/docker/Dockerfile.frontend << 'EOF'
FROM node:20-alpine AS base

FROM base AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "start"]
EOF

cat > infra/docker/Dockerfile.backend << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
```

### Step 4: 添加 Docker Compose

```bash
cat > infra/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: rusai-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-rusai}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
      POSTGRES_DB: ${DB_NAME:-rusai}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-rusai}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: rusai-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-changeme}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  backend:
    build:
      context: ../src/backend
      dockerfile: ../../infra/docker/Dockerfile.backend
    container_name: rusai-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${DB_USER:-rusai}:${DB_PASSWORD:-changeme}@postgres:5432/${DB_NAME:-rusai}
      REDIS_URL: redis://:${REDIS_PASSWORD:-changeme}@redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ../src/frontend
      dockerfile: ../../infra/docker/Dockerfile.frontend
    container_name: rusai-frontend
    restart: unless-stopped
    environment:
      NEXTAUTH_URL: https://rusai.cc
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      DATABASE_URL: postgresql://${DB_USER:-rusai}:${DB_PASSWORD:-changeme}@postgres:5432/${DB_NAME:-rusai}
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: rusai-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
EOF
```

### Step 5: 添加 CI/CD

```bash
mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - working-directory: ./src/frontend
        run: |
          npm ci
          npm run lint
          npm run build

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - working-directory: ./src/backend
        run: |
          pip install -r requirements.txt
          # 添加测试命令
EOF

cat > .github/workflows/cd.yml << 'EOF'
name: CD

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/rusai-assistant
            git pull origin main
            docker-compose -f infra/docker-compose.yml pull
            docker-compose -f infra/docker-compose.yml up -d
            docker system prune -f
EOF
```

### Step 6: 添加环境变量模板

```bash
cat > .env.example << 'EOF'
# Database
DB_USER=rusai
DB_PASSWORD=your_secure_password
DB_NAME=rusai
DATABASE_URL=postgresql://rusai:your_secure_password@localhost:5432/rusai

# Redis
REDIS_PASSWORD=your_redis_password

# NextAuth
NEXTAUTH_URL=https://rusai.cc
NEXTAUTH_SECRET=your_nextauth_secret

# AI API
OPENAI_API_KEY=sk-your_openai_key

# Server
PORT=3000
NODE_ENV=production
EOF
```

### Step 7: 更新文档

```bash
cat > README.md << 'EOF'
# RusAI Assistant

AI-powered Chinese-Russian writing and translation tool.

## Quick Start

```bash
# Clone
git clone https://github.com/thewhitewall520-max/rusai-assistant.git
cd rusai-assistant

# Setup environment
cp .env.example .env
# Edit .env with your values

# Start services
docker-compose -f infra/docker-compose.yml up -d
```

## Development

### Frontend
```bash
cd src/frontend
npm install
npm run dev
```

### Backend
```bash
cd src/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md)
EOF
```

## 📝 提交更改

```bash
# 添加所有新文件
git add .

# 提交
git commit -m "feat: add Docker, CI/CD, and project structure

- Add Docker support for frontend and backend
- Add Docker Compose configuration
- Add GitHub Actions CI/CD
- Add Nginx configuration
- Restructure project layout
- Add environment variable templates
- Update documentation"

# 推送到仓库
git push origin main
```

## ✅ 清理后检查清单

- [ ] `.env` 已删除
- [ ] `dev.db` 已删除
- [ ] `.gitignore` 已更新
- [ ] 项目结构已重构
- [ ] Docker 配置已添加
- [ ] CI/CD 已配置
- [ ] 文档已更新
- [ ] 敏感信息未提交

## 🚀 下一步

1. **配置测试服务器** (提供 IP 和 SSH 密钥)
2. **设置域名 DNS** (rusai.cc)
3. **申请 SSL 证书**
4. **配置 GitHub Secrets**
5. **测试部署流程**