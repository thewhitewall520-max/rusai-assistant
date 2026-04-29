# 修复 debconf 锁问题

## 错误信息
```
debconf: DbDriver "config": /var/cache/debconf/config.dat is locked by another process
```

## 解决方法

在服务器上执行：

```bash
# 1. 删除锁文件
sudo rm -f /var/cache/debconf/config.dat
sudo rm -f /var/cache/debconf/config.dat-*
sudo rm -f /var/cache/debconf/*.lock

# 2. 重新配置
sudo dpkg --configure -a

# 3. 修复安装
sudo apt install -f

# 4. 重新更新
sudo apt update
sudo apt upgrade -y
```

## 然后继续初始化

```bash
sudo timedatectl set-timezone Asia/Shanghai && \
sudo apt install -y curl wget git vim ufw && \
sudo curl -fsSL https://get.docker.com | sh && \
sudo systemctl enable docker && \
sudo apt install -y docker-compose-plugin && \
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && \
sudo ufw --force enable && \
sudo mkdir -p /opt/rusai-assistant && \
echo "✅ 完成!"
```

## 如果还有问题

```bash
# 强制解锁
sudo fuser -v /var/cache/debconf/config.dat
sudo kill -9 $(sudo fuser /var/cache/debconf/config.dat 2>/dev/null)

# 然后重新执行上面的命令
```