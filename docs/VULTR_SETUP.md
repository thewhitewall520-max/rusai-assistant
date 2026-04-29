# Vultr 服务器配置步骤

## 创建服务器

1. 登录 https://my.vultr.com
2. 点击左侧 "Products" → "Compute"
3. 点击蓝色 "Deploy Server" 按钮

### 配置选择

```
Choose Server:
  ✅ Cloud Compute (Shared CPU)

CPU & Storage Technology:
  ✅ Regular Performance (Intel)
  
Server Location:
  ✅ Singapore (国内访问最快)
  备选: Tokyo (日本)

Server Image:
  ✅ Ubuntu 22.04 LTS x64

Server Size:
  ✅ $5/mo
     1 vCPU / 1GB RAM / 25GB SSD / 1TB Bandwidth

Additional Features:
  ✅ Enable IPv6
  ☐ Auto Backups (可选，$1.20/月)
  ☐ DDOS Protection (不需要)

Server Hostname & Label:
  Hostname: rusai-server
  Label: RusAI Production
```

4. 点击 "Deploy Now"
5. 等待 1-2 分钟，状态变成 "Running"

## 获取连接信息

点击服务器名称进入详情页，记录：

| 信息 | 位置 |
|------|------|
| **IP Address** | 页面顶部，例如: 123.456.789.0 |
| **Username** | 默认是 `root` |
| **Password** | 点击 "View Password" 查看 |

## 连接服务器

### Windows 用户

1. 下载 PuTTY: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
2. 打开 PuTTY
3. Host Name: `你的服务器IP`
4. Port: `22`
5. 点击 "Open"
6. 用户名: `root`
7. 密码: 刚才查看的密码 (输入时不显示)

### Mac/Linux 用户

打开终端执行:
```bash
ssh root@你的服务器IP
# 输入密码
```

## 服务器初始化

连接成功后，复制粘贴执行以下命令:

```bash
# 1. 更新系统
apt update && apt upgrade -y

# 2. 设置时区为上海
timedatectl set-timezone Asia/Shanghai

# 3. 安装必要工具
apt install -y curl wget git vim htop ufw

# 4. 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 5. 安装 Docker Compose
apt install -y docker-compose-plugin

# 验证安装
docker --version
docker compose version

# 6. 配置防火墙
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# 查看防火墙状态
ufw status

# 7. 创建应用目录
mkdir -p /opt/rusai-assistant

# 8. 完成
echo "服务器初始化完成!"
```

## 配置域名 DNS

在你的域名管理平台 (购买 rusai.cc 的地方):

添加 DNS 记录:
```
类型: A
主机: @
值: 你的服务器IP
TTL: 600

类型: A
主机: www
值: 你的服务器IP
TTL: 600
```

等待 5-30 分钟生效。

验证:
```bash
ping rusai.cc
```

## 提供信息给我

完成以上步骤后，告诉我:

1. **服务器 IP**: 例如 123.456.789.0
2. **SSH 密码**: 用于配置 GitHub Actions

我将帮你:
- 配置 GitHub Actions 自动部署
- 清理并更新代码仓库
- 部署应用到服务器

---

## 费用说明

| 项目 | 费用 |
|------|------|
| 服务器 ($5/月) | $5/月 |
| 域名 | ~$1/月 |
| **总计** | **~$6/月** |

你的 $10 可以用约 1.5 个月，足够测试和初期运行。
