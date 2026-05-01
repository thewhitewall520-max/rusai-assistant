# 🐉 妖精尾巴部署 SOP（標準作業流程）

> 最後更新：2026-05-02
> 參考來源：柯南團隊 SOP 架構

---

## 五階段工作流程

```
① 馬卡羅夫拆解需求 → 阿悄確認架構
         ↓
② 納茲/朱比亞/艾爾夫曼實現
         ↓
③ 格雷測試 + 溫蒂安全審查 + 艾露莎驗收審計
         ↓
④ 哈比匯總各階段結論
         ↓
⑤ 米拉珍確認發布條件 → 老大批准 → 阿悄部署
```

**鐵律：不讓單一模型從需求到測試一路跑到底**

---

## 角色與職責

| 角色 | Agent | 模型 | 階段 | 權限 | 說明 |
|------|-------|------|------|------|------|
| CTO | 阿悄 | deepseek | 全流程 | exec/SSH | 技術決策、架構設計、所有 SSH 操作 |
| 任務總管 | 馬卡羅夫 | qwen2.5:7b | ① | 純分析 | 需求拆解、任務分派 |
| 戰略規劃 | 梅比斯 | phi4 | ① | 純文字 | 路線圖規劃 |
| 開發 | 納茲 | qwen2.5:7b | ② | ✅ | 代碼實現 |
| 前端 | 朱比亞 | mistral:7b | ② | 只讀 | UI/UX 建議 |
| 建置 | 艾爾夫曼 | mistral:7b | ② | ✅ | Docker/infra |
| 測試 | 格雷 | mistral:7b | ③ | ✅ | 功能測試 |
| 安全 | 溫蒂 | qwen2.5:7b | ③ | 只讀 | API Key、代碼安全 |
| 驗收 | 艾露莎 | **deepseek** | ③ | 只讀 | 代碼審計、質量把關 |
| 文檔 | 露西 | qwen2.5:7b | ③ | ✅ | 文件更新 |
| 通知 | 哈比 | phi4 | ④ | 純文字 | 匯總結論 |
| 發布 | 米拉珍 | qwen2.5:7b | ⑤ | 禁執行 | 條件確認 |
| 高風險 | 吉爾達斯 | deepseek | ①⑤ | ✅ | 架構變更評估 |
| 知識庫 | 蕾比 | qwen2.5:7b | — | ✅ | 文檔索引 |

---

## 實際分工模式（已知限制對策）

### Subagent 無 exec/SSH 工具
spawn 的子 Agent 無法 SSH 到伺服器或執行 exec。

**實際做法：**
```
主 Agent（阿悄）→ SSH 取得資料/日誌
         ↓ 餵資料
Subagent → 分析/審計/方案設計（純文字）
         ↓ 回傳結論
主 Agent → 執行修復/部署
```

### 本地模型多步任務掉 context
qwen2.5:7b / mistral:7b 執行超過 5 步時會被 truncate。

**實際做法：**
- 拆分任務為小於 5 步
- 審計和複雜分析 → 艾露莎（deepseek）
- 開發、測試、建置 → 本地模型（單一步驟）

---

## RusAI 標準部署命令序列

```bash
# 1. 拉取最新代碼
cd /opt/rusai-assistant && git pull origin main

# 2. 安裝依賴
cd /opt/rusai-assistant/rusai-assistant && npm install

# 3. Prisma 資料庫同步
npx prisma generate && npx prisma db push --accept-data-loss

# 4. 建置前端（必須 clean build + 更新 env）
rm -rf .next && npx next build

# 5. 重啟服務
pm2 restart rusai --update-env

# 6. 驗證
for p in "/" "/login" "/workspace" "/admin"; do
  curl -sk -o /dev/null -w "%{http_code}" "https://rusai.cc$p"; echo " $p"
done
# 預期全部 200
```

---

## 排查命令

```bash
# Next.js 錯誤日誌
pm2 logs rusai --lines 30 --nostream

# 清除日誌後重測
pm2 flush && sleep 1 && [觸發操作] && pm2 logs rusai --nostream --lines 10

# Nginx 狀態
systemctl status nginx && nginx -t

# PostgreSQL
docker ps --filter name=rusai-postgres

# Ollama
systemctl status ollama && curl -s http://127.0.0.1:11434/api/tags
```

---

## 鐵律

1. 🔒 **開發和驗收必須分離** — 執行者不能自己驗收自己
2. 🔒 **艾露莎、溫蒂、朱比亞只讀** — 絕對不修改代碼
3. 🔒 **任何 push/deploy 需要老大明確批准**
4. 🔒 **哈比和梅比斯不需要 tools**，只用純文字
5. 🔒 **phi4 不分配給需要 tools 的 Agent**
6. 🔒 **本地模型優先，deepseek 最小化使用**
7. 🔒 **禁止直接在測試機上修改任何檔案** — 所有修改通過 git
8. 🔒 **禁止直接進入 Docker 容器修改檔案**
9. 🔒 **見紅即停** — 遇到報錯停止操作，完整回傳
10. 🔒 **永遠不加 `output: 'standalone'` 到 next.config.js**

---

## 已知問題 & 處理方式

| 問題 | 症狀 | 處理 |
|------|------|------|
| Subagent 無 exec/SSH | 艾露莎等無法連伺服器 | 主 Agent 負責 SSH，subagent 只分析 |
| 本地模型掉 context | 任務輸出被截斷 | 任務拆分 <5 步，審計用 deepseek |
| standalone 衝突 | next start 500 錯誤 | **永遠不加 output:standalone** |
| PM2 不讀 .env | 新環境變數不生效 | 用 ecosystem.config.js + rebuild |
| www→主域 301 丟 POST | www 登入失敗 | nginx 改 308 |
| Prisma 7 不相容 next-auth | Google 登入 500 | 用 Prisma 6 |
| OAuth 缺 Account/Session model | Google 回調報錯 | schema 補上 model |
| User 缺 image/emailVerified | OAuth createUser 失敗 | schema 補上欄位 |

---

## 回滾流程

若部署後發現問題：
1. `cd /opt/rusai-assistant && git revert HEAD`
2. `cd rusai-assistant && rm -rf .next && npx next build`
3. `pm2 restart rusai`
4. 驗證 `curl -sk https://rusai.cc/`
5. 通知老大
