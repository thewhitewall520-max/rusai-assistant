# GitHub Secrets 配置详细步骤

## 第一步: 生成 SSH 密钥

在你的电脑上打开终端 (Mac/Linux) 或 Git Bash (Windows):

```bash
# 生成密钥对
ssh-keygen -t ed25519 -C "deploy@rusai.cc"

# 按 Enter 使用默认路径
# 按 Enter 不设置密码 (方便自动部署)
```

输出示例:
```
Generating public/private ed25519 key pair.
Enter file in which to save the key (/Users/you/.ssh/id_ed25519): 
Enter passphrase (empty for no passphrase): 
Your identification has been saved in /Users/you/.ssh/id_ed25519
Your public key has been saved in /Users/you/.ssh/id_ed25519.pub
```

## 第二步: 添加公钥到服务器

### 1. 查看公钥

```bash
cat ~/.ssh/id_ed25519.pub
```

输出示例:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDIhz2GK/XCUj4i6Q5yQJNL1MXMY0RxzPV2QrBqfHrDq deploy@rusai.cc
```

### 2. 复制公钥内容

复制整行内容 (从 ssh-ed25519 到 deploy@rusai.cc)

### 3. 添加到服务器

连接服务器并执行:

```bash
ssh root@139.180.142.145

# 在服务器上执行
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDIhz2GK/XCUj4i6Q5yQJNL1MXMY0RxzPV2QrBqfHrDq deploy@rusai.cc" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 测试免密登录
exit
ssh root@139.180.142.145
# 应该不需要密码了
```

## 第三步: 获取 SSH 私钥

```bash
cat ~/.ssh/id_ed25519
```

输出示例:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBkdXBsaWNhdGVzLWFyZS1maW5lLWZvci10ZXN0aW5nAAAAFHRlc3R0ZXN0
dGVzdHRlc3R0ZXN0AAAACXN0dWJ0ZXN0AAAAHHN0dWItdGVzdC1rZXktZm9yLXRlc3Rpbm
c=
-----END OPENSSH PRIVATE KEY-----
```

**复制整段内容** (包括 BEGIN 和 END 行)

## 第四步: 在 GitHub 添加 Secrets

### 1. 访问设置页面

打开浏览器访问:
```
https://github.com/thewhitewall520-max/rusai-assistant/settings/secrets/actions
```

### 2. 添加 Secrets

点击绿色按钮 **"New repository secret"**

#### Secret 1: SERVER_HOST
```
Name: SERVER_HOST
Value: 139.180.142.145
```
点击 **Add secret**

#### Secret 2: SERVER_USER
```
Name: SERVER_USER
Value: root
```
点击 **Add secret**

#### Secret 3: SSH_PRIVATE_KEY
```
Name: SSH_PRIVATE_KEY
Value: (粘贴你的私钥内容)
```
点击 **Add secret**

#### Secret 4: KIMI_API_KEY
```
Name: KIMI_API_KEY
Value: (你的 Kimi API Key)
```
点击 **Add secret**

#### Secret 5: NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: (生成随机字符串)
```

生成随机字符串:
```bash
openssl rand -base64 32
```

点击 **Add secret**

## 第五步: 验证配置

### 1. 检查所有 Secrets

页面应该显示:
- ✅ SERVER_HOST
- ✅ SERVER_USER
- ✅ SSH_PRIVATE_KEY
- ✅ KIMI_API_KEY
- ✅ NEXTAUTH_SECRET

### 2. 测试部署

在本地执行:
```bash
cd writing-assistant
git add .
git commit -m "feat: setup auto deployment"
git push origin main
```

### 3. 查看部署状态

访问:
```
https://github.com/thewhitewall520-max/rusai-assistant/actions
```

应该看到绿色的 ✅ 表示部署成功

## 第六步: 验证网站

访问:
- http://www.rusai.cc

应该显示最新版本的网站

## 常见问题

### 问题 1: Permission denied (publickey)

解决:
```bash
# 在服务器上检查权限
ls -la ~/.ssh/
# 应该是:
# drwx------ 2 root root .ssh
# -rw------- 1 root root authorized_keys

# 修复权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 问题 2: Could not resolve hostname

解决: 检查 SERVER_HOST 是否正确

### 问题 3: docker: command not found

解决: 服务器上 Docker 未安装，重新执行安装步骤

## 总结

配置完成后，每次 push 代码到 main 分支:
1. GitHub Actions 自动触发
2. 连接服务器
3. 拉取最新代码
4. 更新环境变量
5. 重启 Docker
6. 网站自动更新

无需手动登录服务器！