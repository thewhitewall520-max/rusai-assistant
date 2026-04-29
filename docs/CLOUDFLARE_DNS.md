# Cloudflare DNS 配置

## 问题
已有 CNAME 记录，不能添加同名 A 记录。

## 解决步骤

### 1. 删除现有 CNAME 记录

在 Cloudflare DNS 管理页面：
1. 找到 `www` 的 CNAME 记录
2. 点击 **Delete** (垃圾桶图标)
3. 确认删除

### 2. 添加 A 记录

点击 **Add record**：

**第一条：**
```
Type: A
Name: @
IPv4 address: 139.180.142.145
TTL: Auto
Proxy status: DNS only (灰色云)
```

**第二条：**
```
Type: A
Name: www
IPv4 address: 139.180.142.145
TTL: Auto
Proxy status: DNS only (灰色云)
```

### 3. 关闭代理 (重要)

确保云图标是 **灰色** (DNS only)，不是橙色。

橙色 = Cloudflare 代理 (需要配置 SSL)
灰色 = 仅 DNS (直接访问服务器)

### 4. 保存

点击 **Save**

## 验证

等待 1-2 分钟后：
```bash
ping rusai.cc
ping www.rusai.cc
```

应该显示 IP: 139.180.142.145

## 部署后开启代理 (可选)

网站部署完成后，可以将云图标变成 **橙色**，开启 Cloudflare CDN：
- 加速访问
- 提供 SSL (HTTPS)
- DDoS 防护

但先确保网站能正常访问再开启。