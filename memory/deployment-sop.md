# 🐉 妖精尾巴部署 SOP（標準作業流程）

> 最後更新：2026-05-01
> 參考來源：柯南團隊 SOP 架構

## 觸發條件

部署流程在以下任一條件觸發時啟動：
- 納茲完成開發並 push 到 GitHub
- 格雷測試通過
- 艾露莎驗收審計通過
- 老大直接下令部署

## 角色職責

| 角色 | Agent | 模型 | 階段 | 說明 |
|------|-------|------|------|------|
| 需求分析 | 馬卡羅夫 | qwen2.5:7b | ① | 理解需求、拆解任務、確認範圍不擴散 |
| 方案設計 | 阿悄 | deepseek | ①→② | 確認架構方案後交辦 |
| 開發實現 | 納茲 | qwen2.5:7b | ② | 定位程式碼、修改實現 |
| 建置環境 | 艾爾夫曼 | mistral:7b | ② | Docker / infra 相關 |
| 前端體驗 | 朱比亞 | mistral:7b | ② | UI/UX 修改（只讀） |
| 安全審查 | 溫蒂 | qwen2.5:7b | ③ | API key、.env、代碼安全（只讀） |
| 測試驗證 | 格雷 | mistral:7b | ③ | 跑測試用例 |
| 驗收審計 | 艾露莎 | **deepseek** | ③ | 審計代碼質量，確認只改指定內容（只讀） |
| 匯總通知 | 哈比 | phi4:latest | ④ | 接收各階段結論匯總後回傳（無工具） |
| 發布協調 | 米拉珍 | qwen2.5:7b | ⑤ | 確認發布條件滿足，通知老大批准 |
| 部署執行 | 阿悄 / 老大 | deepseek | ⑤ | 老大批准後 push / deploy |

**工作流程：**

```
老大需求 → 馬卡羅夫拆解(①) → 阿悄確認方案 →
  → 納茲/朱比亞/艾爾夫曼實現(②) →
  → 艾露莎審計 + 格雷測試(③) →
  → 哈比匯總(④) →
  → 米拉珍確認 → 老大批准 → 阿悄部署(⑤)
```

**鐵律：** 不讓單一模型從需求到測試一路跑到底，每個階段用對應角色和模型完成。

## 紀律（鐵律）

1. **禁止直接在測試機上修改任何檔案** — 所有修改都通過 git push
2. **禁止直接進入 Docker 容器修改檔案** — 容器只通過 compose / Dockerfile 管理
3. **見紅即停** — 遇到報錯停止操作，完整回傳錯誤內容給對應角色判斷
4. **開發和驗收必須分離** — 執行者不能自己驗收自己
5. **任何 push/deploy 需要老大明確批准**

## RusAI 標準部署命令序列

```bash
# 1. 拉取最新代碼
cd /opt/rusai-assistant
git pull origin main

# 2. 安裝依賴
cd /opt/rusai-assistant/rusai-assistant
npm install

# 3. Prisma 資料庫同步
npx prisma generate
npx prisma db push --accept-data-loss

# 4. 建置前端
npx next build

# 5. 重啟服務
pm2 restart rusai

# 6. 驗證
curl -sk -o /dev/null -w '%{http_code}' https://rusai.cc/
# 預期: 200
```

## 排查命令

```bash
# 查看 Next.js 錯誤日誌
pm2 logs rusai --lines 30 --nostream

# 查看 Nginx 狀態
systemctl status nginx

# 查看 PostgreSQL
docker ps --filter name=rusai-postgres

# 查看 Ollama 狀態
systemctl status ollama
```

## 回滾流程

若部署後發現問題：
1. `git revert HEAD` 回到上一個版本
2. `pm2 restart rusai` 重啟
3. 通知老大

## 已知 Agent 限制與處理方式

### 1. Subagent 無 exec/SSH 工具
spawn 的子 Agent 無法直接 SSH 到伺服器或執行 exec。

**處理方式：**
- 主 Agent（阿悄）負責所有 SSH/exec 操作
- Subagent 負責分析、審計、方案設計等純文字工作
- 主 Agent 把 SSH 結果餵給 subagent → subagent 分析 → 主 Agent 執行修復

### 2. 本地模型多步任務掉 context
qwen2.5:7b / mistral:7b 在執行超過 5 步的任務時，context 會被 truncate。

**處理方式：**
- 拆分任務為 < 5 步的小任務
- 審計和複雜分析交給 deepseek（艾露莎）
- 開發、測試等日常任務保持用本地模型

### 3. output: 'standalone' 衝突
`next start` 不支援 `output: standalone` 配置。

**永遠不要加 `output: 'standalone'` 到 `next.config.js`**

### 4. PM2 環境變數
PM2 process 不會自動讀取 `.env` 文件。

**處理方式：**
- 透過 `ecosystem.config.js` 明確定義環境變數
- `pm2 restart rusai --update-env` 更新環境
- 重要：每次加新變數後要 `rm -rf .next && npx next build` 重建

### 5. www.rusai.cc 登入問題
www → 主域名的 301 跳轉會丟失 POST 資料。

**處理方式：**
- nginx 使用 308 跳轉（保留 POST body）
- Google OAuth callback URI 要同時包含 rusai.cc 和 www.rusai.cc
