# 🧩 智能协作白板插件 — Fairy Whiteboard

> AI Agent 团队的"作战地图"。
> 跨平台：macOS ✅ / Linux ✅ / Windows ✅

## 为什么需要白板？

AI Agent 团队开发时常见问题：

| 问题 | 白板解决 |
|------|---------|
| Agent 不知道自己该干嘛 | 状态管理 — 每个 Agent 角色清晰 |
| Agent 互相不知道对方做了什么 | 变更日志 — 全链路可追溯 |
| Agent 跳阶段执行 | 阶段门禁 — chain-check 拦截违规 |
| 踩过的坑下次继续踩 | 经验库 — 教训可复用 |

## 安装

### Node.js 版（推荐，跨平台）

```bash
# macOS / Linux / WSL
cd plugins/whiteboard
node install.js

# 或直接使用
node cli/fairy.js help
```

```powershell
# Windows PowerShell
cd plugins\whiteboard
node install.js
```

### bash 版（macOS / Linux 传统方式）

```bash
cd plugins/whiteboard
bash install.sh
```

### 系统要求

| 平台 | Node.js 版 | bash 版 |
|------|-----------|---------|
| macOS | ✅ Node.js 18+ | ✅ bash + python3 |
| Linux | ✅ Node.js 18+ | ✅ bash + python3 |
| WSL | ✅ Node.js 18+ | ✅ bash + python3 |
| Windows 原生 | ✅ Node.js 18+ | ❌ |

## CLI 命令

```bash
fairy status [project]                    # 显示当前项目/Agent 状态
fairy log <message>                       # 追加变更日志
fairy lesson <topic> <detail>             # 添加经验记录
fairy chain-check [project]               # 检查阶段门禁状态
fairy update-agent <name> <status> [task] # 更新 Agent 状态
fairy help                                # 显示帮助
```

如果 `fairy` 命令不可用，直接使用：

```bash
node cli/fairy.js <command> [args]
```

### 状态值

| 状态 | 含义 |
|------|------|
| `done` | 完成 |
| `running` | 执行中 |
| `idle` | 空闲 |
| `failed` | 失败（自动设置 chainBroken） |
| `fixed` | 已修复（自动清除 chainBroken） |

## 数据文件

所有数据存储在 `.fairy/` 目录：

```
.fairy/
├── state.json       ← 项目/Agent 状态（JSON）
├── changelog.md     ← 变更日志
└── lessons.md       ← 经验库
```

环境变量 `FAIRY_DIR` 可覆盖默认路径。

## 集成到 AGENTS.md

在 AGENTS.md 中添加白板使用说明：

```markdown
## 🧩 白板（智能协作板）

每次 spawn 子 Agent 前：
1. 读 `.fairy/state.json` 看当前状态
2. 更新白板：currentAgent/nextAgent/lastAction
3. 在任务 prompt 中附上白板摘要给子 Agent

每次子 Agent 回报后：
1. 更新白板：agents.{name}.status / chainBroken / nextAgent
2. 追加到 `.fairy/changelog.md`
```

## 目录结构

```
plugins/whiteboard/
├── cli/
│   ├── fairy           ← bash 版 CLI（保留，macOS/Linux）
│   └── fairy.js        ← Node.js 版 CLI（主推，跨平台）
├── lib/
│   ├── state.sh        ← bash 版核心库（保留）
│   └── state.js        ← Node.js 版核心库（跨平台）
├── install.sh          ← bash 版安装器（保留）
├── install.js          ← Node.js 版安装器（跨平台，推荐）
├── templates/
│   ├── state.json          ← 初始状态模板
│   └── agents-integration.md ← AGENTS.md 集成片段
├── VERSION             ← 版本号
└── README.md           ← 本文件
```

## 技术说明

- **Node.js 版**：零 npm 依赖，纯 `fs` / `path` / `process` 内置模块
- **Windows 兼容**：路径用 `path.join`，换行兼容，支持 `%APPDATA%\npm\fairy.cmd`
- **bash 版保留**：macOS/Linux 用户继续可用 `bash cli/fairy`
- **自动检测**：安装脚本自动识别平台

## Pro 版预告 ¥79

即将推出：
- 多项目管理（支持多个 .fairy 目录）
- 值守巡检（自动巡检 Agent 状态）
- 超时告警（Agent 运行超时通知）
- 审计日志（全量操作审计）

## 许可

妖精尾巴公会内部工具。
