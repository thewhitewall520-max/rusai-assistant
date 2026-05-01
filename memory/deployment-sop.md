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

| 角色 | Agent | 說明 |
|------|-------|------|
| 開發 | 納茲 | push 代碼到 GitHub |
| 測試 | 格雷 | 跑測試用例，確認功能正常 |
| 安全審查 | 溫蒂 | 檢查 API key、.env、代碼安全（只讀） |
| 驗收審計 | 艾露莎 | 審計代碼質量，確認可部署（只讀） |
| 發布協調 | 米拉珍 | 確認發布條件滿足，通知老大批准 |
| 部署執行 | 阿悄 / 老大 | 老大批准後 push / deploy |

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
