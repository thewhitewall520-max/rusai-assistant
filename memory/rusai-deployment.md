# RusAI 部署架構與決策紀錄

## 伺服器
- **IP:** 139.180.142.145
- **RAM:** 1GB（暫不升級）
- **OS:** Ubuntu 20.04
- **路徑:** `/opt/rusai-assistant/`

## 域名
- rusai.cc → 139.180.142.145 ✅
- www.rusai.cc → 139.180.142.145 ✅ → 301 → rusai.cc
- SSL: Let's Encrypt（certbot 自動續約）
- Cloudflare: 代理模式未確認

## Running Services
| 服務 | Port | 管理 |
|------|------|------|
| Nginx | 80→301, 443 http2 | systemd |
| Next.js (RusAI) | 3000 | PM2 (`rusai`) |
| PostgreSQL | 5432 | Docker (`rusai-postgres`) |
| Ollama | 11434 | systemd |
| OpenClaw Gateway | 18789 | systemd (~/.config/systemd/user/) |

## 決策紀錄

### Writing Assistant 老版（NestJS + React）
- **已淘汰**，保留在 `src/` 僅供參考
- RusAI (Next.js) 是主項目

### GitHub Actions
- `.github/workflows/` 在本地但 token 無 workflow scope
- 不處理，先擱置

### OpenClaw
- 主 Agent 走本地 Mac
- 伺服器 OpenClaw 保留但不作為主力

### 模型策略
- 艾露莎升級 deepseek（審計需要完整上下文）
- 其他日常 Agent 用本地 ollama 免費模型

### 社交登入
- Google OAuth 已配置（callback URI 包含 rusai.cc 和 www.rusai.cc）
- 需要用戶在 Google Cloud Console 加上 www.rusai.cc callback
