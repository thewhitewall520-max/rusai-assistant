# 部署方案对比

## 当前状态
- ✅ 域名: rusai.cc 已购买
- ❌ 服务器: 暂无
- 📝 GitHub 仓库: 需要清理和配置

## 方案选择

### 方案 A: 云服务器 (推荐)

**推荐服务商**:

| 服务商 | 配置 | 价格/月 | 特点 |
|--------|------|---------|------|
| **Vultr** | 1CPU/1GB/25GB | $5 | 按小时计费，随时删除 |
| **Linode** | 1CPU/1GB/25GB | $5 | 稳定，文档丰富 |
| **DigitalOcean** | 1CPU/1GB/25GB | $6 | 简单易用 |
| **AWS Lightsail** | 1CPU/512MB/20GB | $3.5 | AWS 生态 |
| **腾讯云轻量** | 1CPU/1GB/25GB | ¥40 | 国内访问快 |
| **阿里云轻量** | 1CPU/1GB/25GB | ¥45 | 国内访问快 |

**推荐配置** (最低):
- 1 vCPU
- 1GB RAM
- 25GB SSD
- 1TB 流量
- Ubuntu 22.04 LTS

**部署架构**:
```
用户 → Cloudflare (DNS + CDN) → 云服务器 (Docker)
                                      ├── Nginx
                                      ├── Next.js (Frontend)
                                      ├── FastAPI (Backend)
                                      ├── PostgreSQL
                                      └── Redis
```

---

### 方案 B: 免费方案 (临时)

#### 1. Vercel (前端免费托管)
- **价格**: 免费
- **限制**: 函数执行时间 10s，带宽 100GB/月
- **适用**: Next.js 前端托管
- **域名**: 支持自定义域名 rusai.cc

#### 2. Railway / Render (后端免费托管)
- **价格**: 免费 tier
- **限制**: 每月 500 小时运行时间
- **适用**: Python FastAPI 后端
- **数据库**: 内置 PostgreSQL

#### 3. Supabase (免费数据库)
- **价格**: 免费 tier
- **限制**: 500MB 存储，2GB 带宽
- **适用**: PostgreSQL 数据库

**免费架构**:
```
用户 → Vercel (Next.js 前端) → Railway (FastAPI 后端) → Supabase (PostgreSQL)
```

**缺点**:
- 服务分散，管理复杂
- 免费 tier 有限制
- 不适合长期运营

---

### 方案 C: 家庭服务器 (如果你有)

**要求**:
- 公网 IP (或内网穿透)
- 24小时开机
- 足够带宽

**内网穿透工具**:
- frp
- ngrok
- Cloudflare Tunnel

---

## 推荐方案: 方案 A (云服务器)

### 理由
1. **成本可控**: $5-6/月，约 ¥35-40
2. **完全控制**:  root 权限，自由配置
3. **性能稳定**: 不受其他用户影响
4. **易于扩展**: 随时升级配置
5. **学习价值**: 掌握完整部署流程

### 部署步骤

#### 1. 购买服务器
推荐 **Vultr** 或 **Linode**
- 注册账号
- 创建实例 (Ubuntu 22.04)
- 选择地区 (建议新加坡/东京，国内访问快)

#### 2. 配置域名 DNS
```
rusai.cc → A记录 → 服务器IP
www.rusai.cc → CNAME → rusai.cc
```

#### 3. 服务器初始化
```bash
# 连接服务器
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
apt install docker-compose-plugin

# 配置防火墙
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

#### 4. 部署应用
```bash
# 克隆代码
git clone https://github.com/thewhitewall520-max/rusai-assistant.git
cd rusai-assistant

# 配置环境变量
cp .env.example .env
# 编辑 .env

# 启动服务
docker-compose -f infra/docker-compose.yml up -d
```

#### 5. 配置 SSL
```bash
# 安装 certbot
apt install certbot

# 获取证书
certbot certonly --standalone -d rusai.cc -d www.rusai.cc

# 自动续期
echo "0 3 * * * certbot renew --quiet" | crontab -
```

---

## 成本估算

### 月度成本

| 项目 | 费用 | 说明 |
|------|------|------|
| 云服务器 | $5-6 | 最低配置 |
| 域名 | $1 | 按年摊销 |
| **总计** | **$6-7/月** | 约 ¥45-50 |

### 年度成本
- 服务器: $72
- 域名: $12
- **总计: $84/年** (约 ¥600)

---

## 下一步行动

### 如果你选择购买服务器:

1. **选择服务商** (推荐 Vultr)
2. **注册并创建实例**
3. **提供服务器 IP 给我**
4. **配置 DNS 指向服务器**
5. **我帮你完成自动化部署**

### 如果你选择免费方案:

1. **注册 Vercel 账号**
2. **注册 Railway 账号**
3. **我帮你配置多平台部署**

---

## 我的建议

**短期 (1-3个月)**: 使用免费方案快速验证
**长期 (3个月+)**: 购买云服务器，完全控制

你想选择哪个方案？我可以帮你:
- 推荐具体的服务商和配置
- 提供优惠码 (如果有)
- 指导注册和购买流程