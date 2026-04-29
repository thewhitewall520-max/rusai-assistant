# Vultr 服务器类型选择

## 四个选项对比

| 类型 | 价格 | 适用场景 | 推荐 |
|------|------|---------|------|
| **Dedicated CPU** | $$$ | 高性能计算，游戏服务器 | ❌ 太贵 |
| **Cloud GPU** | $$$$$ | AI训练，视频渲染 | ❌ 完全不需要 |
| **Shared CPU** | $ | 网站，博客，小型应用 | ✅ 选这个！ |
| **Bare Metal** | $$$$ | 物理服务器，特殊需求 | ❌ 太贵 |

## 选择 Shared CPU

理由：
- ✅ 最便宜 ($5/月)
- ✅ 足够运行网站
- ✅ 适合 Next.js + FastAPI
- ✅ 你的预算 ($10) 可以用2个月

## 选择后配置

```
Type: Shared CPU
Location: Singapore
Plan: $5/mo (1 vCPU / 1GB RAM / 25GB SSD)
Image: Ubuntu 22.04 LTS
Backups: Disable
```

## 不要选其他的原因

| 类型 | 最低价格 | 为什么不要 |
|------|---------|-----------|
| Dedicated CPU | $36/月 | 太贵，性能过剩 |
| Cloud GPU | $90+/月 | 完全不需要显卡 |
| Bare Metal | $120+/月 | 物理服务器，太贵 |

## 点击 Shared CPU 后

应该看到价格选项：
```
$5/mo   ← 选这个！
$6/mo
$10/mo
$20/mo
...
```

选择 **$5/mo** 即可！