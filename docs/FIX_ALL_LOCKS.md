# 强制清理所有锁

## 执行以下命令

```bash
# 1. 停止所有相关进程
sudo systemctl stop unattended-upgrades
sudo systemctl disable unattended-upgrades

# 2. 杀死所有 apt/dpkg 进程
sudo killall -9 apt apt-get dpkg

# 3. 删除所有锁文件
sudo rm -f /var/lib/dpkg/lock
sudo rm -f /var/lib/dpkg/lock-frontend
sudo rm -f /var/lib/apt/lists/lock
sudo rm -f /var/cache/apt/archives/lock
sudo rm -f /var/cache/debconf/*.lock
sudo rm -f /var/cache/debconf/config.dat
sudo rm -f /var/cache/debconf/config.dat-*
sudo rm -f /var/cache/debconf/passwords.dat
sudo rm -f /var/cache/debconf/passwords.dat-*
sudo rm -f /var/cache/debconf/templates.dat
sudo rm -f /var/cache/debconf/templates.dat-*

# 4. 重新配置 dpkg
sudo dpkg --configure -a

# 5. 修复安装
sudo apt install -f -y

# 6. 清理
sudo apt clean
sudo apt autoclean

# 7. 更新
sudo apt update
```

## 然后继续初始化

```bash
sudo apt install -y curl wget git vim ufw && \
sudo curl -fsSL https://get.docker.com | sh && \
sudo systemctl enable docker && \
sudo systemctl start docker && \
sudo apt install -y docker-compose-plugin && \
sudo ufw allow 22 && \
sudo ufw allow 80 && \
sudo ufw allow 443 && \
sudo ufw --force enable && \
sudo mkdir -p /opt/rusai-assistant && \
echo "✅ 服务器初始化完成!"
```