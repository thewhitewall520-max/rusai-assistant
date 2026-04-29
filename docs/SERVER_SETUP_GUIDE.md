# 服务器购买与配置完整指南

## 推荐服务商

### 🥇 首选: Vultr
- **官网**: https://www.vultr.com
- **价格**: $5/月 (1CPU/1GB/25GB)
- **特点**: 按小时计费，随时删除，支持支付宝
- **优惠**: 新用户充 $10 送 $100 (找我要 referral link)

### 🥈 备选: Linode
- **官网**: https://www.linode.com
- **价格**: $5/月
- **特点**: 稳定，文档丰富
- **优惠**: 新用户送 $100 额度

### 🥉 备选: DigitalOcean
- **官网**: https://www.digitalocean.com
- **价格**: $6/月
- **特点**: 简单易用，社区活跃
- **优惠**: 新用户送 $200 额度

---

## Vultr 购买步骤 (推荐)

### 第一步: 注册账号

1. 访问 https://www.vultr.com
2. 点击 "Sign Up"
3. 填写邮箱和密码
4. 验证邮箱

### 第二步: 充值

1. 登录后点击 "Billing"
2. 选择 "Add Funds"
3. 选择支付方式:
   - **支付宝** (推荐，方便)
   - 信用卡
   - PayPal
4. 最低充值 $10

### 第三步: 创建服务器

1. 点击左侧 "Products" → "Compute"
2. 点击 "Deploy Server"
3. 选择配置:

```
Choose Server:
  ✅ Cloud Compute (Shared CPU)

CPU & Storage Technology:
  ✅ Regular Performance (Intel)
  
Server Location:
  ✅ Singapore (国内访问快)
  或 Tokyo (日本)
  或 Los Angeles (美国西海岸)

Server Image:
  ✅ Ubuntu 22.04 LTS x64

Server Size:
  ✅ $5/mo (1 vCPU, 1GB RAM, 25GB SSD)
  
Additional Features:
  ✅ Enable IPv6
  ☐ Auto Backups (可选，$1/月)
  ☐ DDOS Protection (可选)

Server Hostname & Label:
  Hostname: rusai-server
  Label: RusAI Production
```

4. 点击 "Deploy Now"
5. 等待 1-2 分钟，服务器创建完成

### 第四步: 获取服务器信息

1. 点击服务器名称进入详情
2. 记录以下信息:
   - **IP Address**: 例如 123.456.789.0
   - **Username**: root
   - **Password**: 点击 "View Password" 查看

---

## 连接服务器

### Windows 用户

1. 下载 PuTTY: https://www.putty.org/
2. 打开 PuTTY
3. Host Name: 你的服务器 IP
4. Port: 22
5. 点击 "Open"
6. 用户名: root
7. 密码: 刚才查看的密码

### Mac/Linux 用户

```bash
# 打开终端
ssh root@你的服务器IP

# 输入密码 (输入时不显示)
```

---

## 服务器初始化

连接成功后，依次执行:

```bash
# 1. 更新系统
apt update && apt upgrade -y

# 2. 设置时区
timedatectl set-timezone Asia/Shanghai

# 3. 安装必要工具
apt install -y curl wget git vim htop

# 4. 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 5. 安装 Docker Compose
apt install -y docker-compose-plugin

# 验证安装
docker --version
docker compose version

# 6. 创建新用户 (推荐，不用 root 运行应用)
useradd -m -s /bin/bash rusai
usermod -aG docker rusai

# 7. 配置防火墙
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# 8. 配置 SSH 安全 (可选)
vim /etc/ssh/sshd_config
# 修改: PermitRootLogin no
# 修改: PasswordAuthentication no (如果使用密钥)
systemctl restart sshd
```

---

## 配置域名 DNS

### 在域名管理平台 (购买域名的地方)

添加以下 DNS 记录:

```
Type    Name        Value               TTL
A       @           你的服务器IP        600
A       www         你的服务器IP        600
```

例如:
```
A  rusai.cc      123.456.789.0    600
A  www.rusai.cc  123.456.789.0    600
```

等待 DNS 生效 (通常 5-30 分钟)

验证:
```bash
ping rusai.cc
```

---

## 部署应用

### 1. 克隆代码

```bash
# 切换到应用用户
su - rusai

# 创建应用目录
mkdir -p /opt/rusai-assistant
cd /opt/rusai-assistant

# 克隆代码
git clone https://github.com/thewhitewall520-max/rusai-assistant.git .
```

### 2. 配置环境变量

```bash
# 创建环境文件
cat > .env << 'EOF'
# Database
DB_USER=rusai
DB_PASSWORD=$(openssl rand -base64 32)
DB_NAME=rusai

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://rusai.cc

# AI API (你需要填入真实的)
OPENAI_API_KEY=sk-your-openai-key

# Environment
NODE_ENV=production
EOF
```

### 3. 启动服务

```bash
# 使用 Docker Compose 启动
docker compose -f infra/docker-compose.yml up -d

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f
```

### 4. 配置 SSL (HTTPS)

```bash
# 安装 Certbot
apt install -y certbot

# 获取证书
certbot certonly --standalone -d rusai.cc -d www.rusai.cc

# 配置自动续期
echo "0 3 * * * certbot renew --quiet" | crontab -
```

---

## 配置 GitHub Actions

### 在 GitHub 仓库设置 Secrets

1. 打开仓库: https://github.com/thewhitewall520-max/rusai-assistant
2. 点击 Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. 添加以下 secrets:

| Secret Name | Value | 说明 |
|------------|-------|------|
| `SERVER_HOST` | 你的服务器IP | 例如: 123.456.789.0 |
| `SERVER_USER` | root 或 rusai | SSH 用户名 |
| `SSH_PRIVATE_KEY` | SSH 私钥内容 | 见下方生成步骤 |

### 生成 SSH 密钥对

在**你的电脑**上执行:

```bash
# 生成密钥 (如果还没有)
ssh-keygen -t ed25519 -C "deploy@rusai.cc"

# 查看公钥
cat ~/.ssh/id_ed25519.pub
# 复制内容，添加到服务器的 authorized_keys

# 查看私钥 (这就是要填入 GitHub Secrets 的)
cat ~/.ssh/id_ed25519
```

### 添加公钥到服务器

```bash
# 在服务器上
mkdir -p ~/.ssh
vim ~/.ssh/authorized_keys
# 粘贴你的公钥
chmod 600 ~/.ssh/authorized_keys
```

---

## 验证部署

### 1. 检查服务状态

```bash
docker compose ps
```

应该看到:
- postgres: Up
- redis: Up
- backend: Up
- frontend: Up
- nginx: Up

### 2. 访问网站

打开浏览器访问:
- http://rusai.cc
- https://rusai.cc (SSL 配置后)

### 3. 检查日志

```bash
# 后端日志
docker compose logs backend

# 前端日志
docker compose logs frontend

# Nginx 日志
docker compose logs nginx
```

---

## 维护命令

```bash
# 查看资源使用
docker stats

# 重启服务
docker compose restart

# 更新代码后重新部署
git pull origin main
docker compose up -d --build

# 备份数据库
docker compose exec postgres pg_dump -U rusai rusai > backup.sql

# 恢复数据库
docker compose exec -T postgres psql -U rusai rusai < backup.sql

# 查看磁盘使用
df -h
docker system df

# 清理未使用的镜像
docker system prune -f
```

---

## 故障排除

### 无法连接 SSH
```bash
# 检查防火墙
ufw status

# 检查 SSH 服务
systemctl status sshd
```

### 网站无法访问
```bash
# 检查 Nginx
docker compose logs nginx

# 检查端口
netstat -tlnp | grep 80
netstat -tlnp | grep 443
```

### 数据库连接失败
```bash
# 检查 PostgreSQL
docker compose logs postgres

# 进入数据库
docker compose exec postgres psql -U rusai -d rusai
```

---

## 费用总结

| 项目 | 月费 | 年费 |
|------|------|------|
| Vultr 服务器 ($5) | $5 | $60 |
| 域名 | $1 | $12 |
| **总计** | **$6** | **$72** |

约 ¥45/月，¥520/年

---

## 下一步

完成以上步骤后，告诉我:
1. 服务器 IP
2. 使用的用户名 (root 或 rusai)
3. SSH 私钥 (用于 GitHub Actions)

我将帮你:
- 配置 GitHub Actions 自动部署
- 清理并更新代码仓库
- 配置完整的 CI/CD 流程