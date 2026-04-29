# 服务器初始化命令

## 连接服务器

```bash
ssh root@139.180.142.145
```

密码：`s4L=g9298oiBmJA=`

## 初始化脚本

连接成功后，复制粘贴执行：

```bash
# 1. 更新系统
apt update && apt upgrade -y

# 2. 设置时区
timedatectl set-timezone Asia/Shanghai

# 3. 安装必要工具
apt install -y curl wget git vim ufw

# 4. 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 5. 安装 Docker Compose
apt install -y docker-compose-plugin

# 6. 验证安装
docker --version
docker compose version

# 7. 配置防火墙
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 8. 创建应用目录
mkdir -p /opt/rusai-assistant

# 9. 完成
echo "✅ 服务器初始化完成！"
echo "IP: 139.180.142.145"
```

## 修改密码（推荐）

```bash
passwd
# 输入新密码
# 确认新密码
```

## 配置 SSH 密钥（更安全）

在你的电脑上执行：
```bash
ssh-keygen -t ed25519 -C "rusai"
ssh-copy-id root@139.180.142.145
```

之后就可以免密码登录：
```bash
ssh root@139.180.142.145
```

## 配置域名 DNS

在你的域名管理平台添加：

```
类型: A
主机: @
值: 139.180.142.145
TTL: 600

类型: A
主机: www
值: 139.180.142.145
TTL: 600
```

## 完成后告诉我

初始化完成后告诉我，我将配置 GitHub Actions 自动部署。