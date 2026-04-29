# 免费服务器/托管方案

## 方案对比

| 方案 | 免费额度 | 限制 | 难度 | 推荐度 |
|------|---------|------|------|--------|
| **Oracle Cloud** | 2CPU/1GB 永久免费 | 需信用卡验证 | 中 | ⭐⭐⭐⭐⭐ |
| **Google Cloud** | $300 试用金 | 90天有效期 | 中 | ⭐⭐⭐⭐ |
| **AWS** | $300 试用金 | 12个月 | 中 | ⭐⭐⭐⭐ |
| **Azure** | $200 试用金 | 30天 | 中 | ⭐⭐⭐ |
| **Railway** | $5/月额度 | 每月500小时 | 低 | ⭐⭐⭐⭐ |
| **Render** | 部分免费 | 有使用限制 | 低 | ⭐⭐⭐⭐ |
| **Fly.io** | 部分免费 | 有使用限制 | 低 | ⭐⭐⭐ |
| **GitHub Pages** | 静态网站 | 仅前端 | 低 | ⭐⭐⭐ |

---

## 🥇 推荐: Oracle Cloud (永久免费)

### 免费资源
- **2 台 AMD 实例**: 1/8 OCPU + 1GB RAM (每台)
- **或 1 台 ARM 实例**: 最高 4 OCPU + 24GB RAM
- **200GB 块存储**
- **10TB 出站流量/月**
- **永久免费** (不像其他只有试用期)

### 注册步骤

1. 访问 https://www.oracle.com/cloud/free/
2. 点击 "Start for free"
3. 创建 Oracle 账号 (邮箱+密码)
4. 填写个人信息
5. **验证信用卡** (会扣 $1 预授权，会退还)
6. 选择地区 (推荐: Japan East - Tokyo)
7. 创建实例:
```
Name: rusai-server
Image: Canonical Ubuntu 22.04
Shape: VM.Standard.A1.Flex (ARM) 或 VM.Standard.E2.1.Micro (AMD)
Networking: 创建新的 VCN
Boot volume: 50GB
Add SSH keys: 生成新密钥对
```
8. 下载私钥文件 (xxx.key)
9. 等待实例创建 (2-3 分钟)

### 连接服务器

```bash
# 修改私钥权限
chmod 600 你的密钥.key

# 连接
ssh -i 你的密钥.key ubuntu@服务器IP

# 切换到 root
sudo -i
```

### 配置 (和之前一样)

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装其他工具
apt install -y git certbot docker-compose-plugin

# 防火墙
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

---

## 🥈 备选: Railway + Vercel (全免费)

### 架构
```
用户 → Vercel (Next.js 前端) → Railway (FastAPI 后端) → Supabase (PostgreSQL)
```

### 1. Vercel (前端免费托管)

**注册**: https://vercel.com
- 用 GitHub 账号登录
- 导入你的仓库
- 自动部署

**配置**:
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
```

**自定义域名**:
- 在 Vercel 项目设置中添加 rusai.cc
- 按提示配置 DNS

### 2. Railway (后端免费托管)

**注册**: https://railway.app
- 用 GitHub 账号登录
- 创建新项目
- 从 GitHub 导入后端代码

**配置**:
```
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**环境变量**:
```
DATABASE_URL=你的数据库连接字符串
OPENAI_API_KEY=你的API密钥
```

### 3. Supabase (免费数据库)

**注册**: https://supabase.com
- 创建新项目
- 获取数据库连接信息
- 免费额度: 500MB 存储, 2GB 带宽

---

## 🥉 备选: Render (全栈免费)

### 特点
- 支持 Web Service, PostgreSQL, Redis
- 免费 tier 有使用限制
- 自动部署

### 部署步骤

1. 注册 https://render.com (用 GitHub 登录)
2. 创建 Web Service
3. 连接 GitHub 仓库
4. 配置:
```
Name: rusai-assistant
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```
5. 添加环境变量
6. 创建 PostgreSQL 数据库

---

## 方案对比总结

### 如果你想完全控制服务器
→ **Oracle Cloud** (永久免费, 需要信用卡)

### 如果你想快速上线, 不管理服务器
→ **Vercel + Railway + Supabase** (全免费, 无信用卡)

### 如果你想简单全栈部署
→ **Render** (简单, 有限制)

---

## 我的建议

### 短期 (验证想法)
使用 **Vercel + Railway + Supabase**
- 快速上线
- 无需管理服务器
- 免费额度够用

### 长期 (正式运营)
使用 **Oracle Cloud** 或购买 **Vultr**
- 完全控制
- 性能稳定
- 成本可控

---

## 下一步

选择你的方案:

**A. Oracle Cloud** (永久免费, 需信用卡)
- 我指导注册和配置

**B. Vercel + Railway** (全免费, 无需信用卡)
- 我指导分别部署前后端

**C. Render** (简单, 有限制)
- 我指导一键部署

你想选哪个？