# 🐉 MEMORY.md — 阿悄长期记忆

## RusAI 项目关键信息

### 服务器
- IP: `139.180.142.145`（Vultr, 1GB RAM）
- 路径: `/opt/rusai-assistant/`
- SSH 密钥: `~/.ssh/id_ed25519`（root 可登）
- PM2: `rusai`（Next.js port 3000）
- Nginx: 443 → 3000 + 301 跳转
- PostgreSQL: Docker `rusai-postgres`

### 部署
- GitHub Actions 已失效（SSH Secrets 问题）
- 手动部署: 见 `memory/archive/2026-05-03.md` 部署命令序列

### 2026-05-03 上线内容
| 内容 | 说明 |
|------|------|
| ReferenceError 修复 | workspace.js 中文文本 `{'退出登錄'}` |
| Emoji 修复 | 三个 CSS 加 `Apple Color Emoji` |
| TourGuide 引导 | 新用户首次访问遮罩引导（cookie 控制） |
| Prisma v7 适配 | `@prisma/adapter-pg` 驱动适配 |
| 登录 500 修复 | PostgreSQL 连接恢复 |

### 铁律
- 未批准不得 push/deploy
- 开发和验收分离
- 本地模型优先
- **未批准不得 openclaw gateway restart**（先问老大）

### 2026-05-01 摘要
- 架构决策与技术选型：见 `memory/rusai-deployment.md`
- 重要 Bug 修复与根因：无重要记录
- 新增铁律/SOP 变更：妖精尾巴标准部署流程已写入 `memory/deployment-sop.md`，包含触发条件/角色职责/纪律铁律及RusAI标准部署命令序列/排查命令/回滚流程。
- 已完成的功能上线：RusAI Next.js 上线（PM2 管理），OpenAI Gateway 启动（systemd）
- 团队角色与分工变更：无重要记录
- 待办事项：Google Cloud Console 添加 www.rusai.cc callback，NEXTAUTH_URL 确保只有 rusai.cc，团队正式配置 Gateway（已做，待重启生效）

### 2026-05-02 摘要
- 架构决策与技术选型
  - 使用 Next.js、Nginx、PostgreSQL 和 Ollama 构建应用。
  - Prisma 版本调整以兼容 next-auth。

- 重要 Bug 修复与根因
  - Prisma 7 不兼容 next-auth，降级至 Prisma 6 并恢复 schema 配置。
  - OAuth 缺乏 Account/Session 模型，新增后解决。
  - 网站重定向丢失 POST 数据问题，将 301 改为 308。

- 新增铁律/SOP 变更
  - 完善了标准部署 SOP（参考柯南团队）。

- 已完成的功能上线
  - 实现暗黑模式、管理后台功能和后端用量限制。
  - 添加 Google OAuth 和双因素认证支持。

- 团队角色与分工变更
  - 大佬 (Wall White) 负责发现细节问题，令狐冲冲冲负责 SOP 参考。

- 待办事项
  - 在 Google Cloud Console 中添加 `www.rusai.cc` 到 redirect URIs。
  - 配置 CI/CD GitHub Actions（令牌范围）。
  - 升级服务器 RAM。
  - 测试社交登录功能。

### 2026-05-03 摘要
- Bug 修复了退出登录按钮的错误和Emoji图标不显示的问题。
- 新增了新用户教程引导功能。
- 解决了Prisma v7与PostgreSQL适配问题以及登录500错误。
- 使用手动SSH部署替代GitHub Actions pipeline。
- 团队成员包括文宏、纳兹、格雷和阿悄，分工负责架构/调度/SSH部署等任务。
- 待办事项为修复GitHub Actions部署pipeline和完成首页使用说明功能。

### 2026-05-04 摘要
- 架构决策与技术选型：
  - `lib/state.js` 用于 YAML 状态管理，含自定义解析器。
  
- 重要 Bug 修复与根因：
  - `/api/generate` 500 错误因 `PrismaClient()` 未带适配器导致，修复后问题解决。

- 新增铁律/SOP 变更：
  - #11 子 Agent 不搜 memory。
  - #12 任务即上下文。
  - #13 SSH/exec 由阿悄直做。

- 已完成的功能上线：
  - `Tech Daily` 技术早报系统上线，每日自动发送总结信息。
  - `Second Brain` 功能上线，集成联系人、知识条目和标签管理。

- 团队角色与分工变更：
  - 马卡罗夫 使用 `deepseek` 代替 `qwen2.5:7b`。
  - 格雷 使用 `deepseek` 代替 `mistral:7b`。
  - 纳兹工具使用限制为仅执行任务。

- 待办事项：
  - 研究 n8n 是否需要安装（等待老大决策）
