# 解决 apt 锁问题

## 原因
Ubuntu 系统在后台自动运行 `unattended-upgrades`，正在更新软件包。

## 解决方案

### 方案 1: 等待 (推荐)
等待 2-5 分钟，让系统自动完成更新。

可以查看进度：
```bash
ps aux | grep apt
```

### 方案 2: 强制终止 (如果卡住很久)

```bash
# 查看占用进程
sudo lsof /var/lib/dpkg/lock-frontend

# 终止进程
sudo kill 1594

# 删除锁文件
sudo rm /var/lib/dpkg/lock-frontend
sudo rm /var/lib/dpkg/lock
sudo rm /var/cache/apt/archives/lock

# 修复 dpkg
sudo dpkg --configure -a

# 重新更新
sudo apt update
```

### 方案 3: 禁用自动更新 (可选)

```bash
# 停止自动更新服务
sudo systemctl stop unattended-upgrades

# 禁用自动更新
sudo systemctl disable unattended-upgrades

# 现在可以正常执行 apt 命令
sudo apt update
```

## 推荐操作

1. **先等待 2-3 分钟**
2. 如果还在运行，执行方案 2
3. 然后重新运行初始化命令

## 完整初始化命令 (等待后执行)

```bash
# 确保没有锁
sudo rm -f /var/lib/dpkg/lock-frontend
sudo rm -f /var/lib/dpkg/lock
sudo dpkg --configure -a

# 更新系统
sudo apt update && sudo apt upgrade -y

# 设置时区
sudo timedatectl set-timezone Asia/Shanghai

# 安装必要工具
sudo apt install -y curl wget git vim ufw

# 安装 Docker
sudo curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# 安装 Docker Compose
sudo apt install -y docker-compose-plugin

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 创建应用目录
sudo mkdir -p /opt/rusai-assistant

echo "✅ 服务器初始化完成！"
```