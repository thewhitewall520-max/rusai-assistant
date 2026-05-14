# 🧩 ClawBox — 一键安装你的 AI 助手

ClawBox 是一个开箱即用的 AI Agent 桌面环境。双击安装，无需远程，不用配环境。

## 安装

1. 下载 `clawbox-setup-1.0.0.exe`
2. 双击运行
3. 安装过程中填写你的 AI 助手名字和欢迎语
4. 安装完自动弹出 Dashboard 和引导页

## 开始使用

### 连接聊天软件

安装完成后，引导页会展示 6 种聊天渠道的配置教程：

- 📱 **Telegram** — 自己创建一个 Bot，填入 Token 即可
- 💬 **微信** — 支持公众号 / ClawBot 插件 / ClawChat 小程序
- 📄 **飞书/Lark** — 飞书开放平台建应用，配置 AppID + Secret
- 🎮 **Discord** — 开发者后台创建 Bot，配置权限
- 💚 **WhatsApp** — 扫码绑定 WhatsApp Web
- 🔷 **Slack** — 创建 Slack App，配置 Socket Mode

所有配置都在 Dashboard（`http://127.0.0.1:18789`）中完成。

### 更改设置

- **改名字/欢迎语** → 编辑 `%USERPROFILE%\.openclaw\openclaw.json`
- **切换 AI 模型** → Dashboard 中配置（支持 API 模型和本地 Ollama）
- **添加更多渠道** → Dashboard → 渠道设置

## 卸载

**方式一：** 开始菜单 → ClawBox → 卸载 ClawBox
**方式二：** 控制面板 → 程序和功能 → ClawBox → 卸载

卸载时会询问是否删除所有 AI 对话数据。

## 支持

联系闲鱼卖家获取帮助。
