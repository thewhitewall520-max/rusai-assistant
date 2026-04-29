# Vultr 服务器创建完成 - 下一步

## 1. 获取服务器信息

在 Vultr 控制面板：
1. 点击你的服务器名称
2. 记录以下信息：

| 信息 | 位置 | 示例 |
|------|------|------|
| **IP Address** | 页面顶部 | 123.456.789.0 |
| **Username** | 默认 | root |
| **Password** | 点击 "View Password" | 点击查看 |

## 2. 连接服务器

### Mac/Linux
打开终端：
```bash
ssh root@你的IP地址
# 输入密码（输入时不显示）
```

### Windows
1. 下载 PuTTY：https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
2. Host Name: 你的IP地址
3. Port: 22
4. 点击 Open
5. 用户名: root
6. 密码: 刚才查看的密码

## 3. 一键初始化脚本

连接成功后，复制粘贴执行：

```bash
# 更新系统
apt update && apt upgrade -y

# 设置时区
timedatectl set-timezone Asia/Shanghai

# 安装必要工具
apt install -y curl wget git vim ufw

# 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 安装 Docker Compose
apt install -y docker-compose-plugin

# 验证安装
docker --version
docker compose version

# 配置防火墙
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 创建应用目录
mkdir -p /opt/rusai-assistant

echo "✅ 服务器初始化完成！"
```

## 4. 配置域名 DNS

在你的域名管理平台（购买 rusai.cc 的地方）添加记录：

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

## 5. 提供信息给我

完成以上步骤后，告诉我：

1. **服务器 IP**: ?
2. **root 密码**: ?

我将立即帮你：
- 配置 GitHub Actions 自动部署
- 清理并更新代码仓库
- 部署应用到服务器

预计 10 分钟后网站可访问！