# 🐉 妖精尾巴公会 · 完整概况

> 最后更新：2026-05-06 22:58 WITA
> 平台：OpenClaw · Apple M4 Pro 24GB · macOS

---

## 一、Agent 编成

### 活跃 Agent（走 deepseek API）

| Agent | 模型 | 角色 | 工具 | TG Bot |
|-------|------|------|------|--------|
| **阿悄** 🐉 | deepseek | CTO/总调度 | 全权限 | @Aqiaoandwhitewall_bot |
| **纳兹** 🔥 | deepseek | 开发 | exec/fs/sessions/msg | @Naziandwhitewall_bot |
| **格雷** ❄️ | deepseek | 测试执行 | exec/fs/sessions/msg | @Greeandwhitewall_bot |
| **艾露莎** ⚔️ | deepseek | 验收审计 | sessions/memory/msg（只读） | @Ellsaandwhitewall_bot |
| **露西** 🌟 | deepseek | 调试/根因分析 | exec/fs/sessions/msg | 未配独立bot |
| **温蒂** 🪽 | deepseek | 写测试用例 | fs/sessions/msg（可写文件） | 未配独立bot |
| **马卡罗夫** 👴 | deepseek | 值守Agent | sessions/memory/msg/exec(限curl) | @Makarofandwhitewall_bot |

### 备用 Agent（走 qwen2.5:14b 本地 🆓）

| Agent | 模型 | 状态 |
|-------|------|------|
| 米拉珍 😊 | qwen2.5:14b | 吉祥物（备用） |
| 哈比 🐱 | qwen2.5:14b | 空闲 |
| 艾尔夫曼 💪 | qwen2.5:14b | 空闲 |
| 蕾比 📖 | qwen2.5:14b | 空闲 |
| 朱比亚 🌊 | qwen2.5:14b | 空闲 |
| 梅比斯 👼 | qwen2.5:14b | 空闲 |
| 基尔达斯 🦅 | deepseek | 空闲（暂不动） |

---

## 二、完整工作流

```
老大提出需求
  │
  ▼
① 阿悄 ── 读白板 → 读代码索引 → 拆任务 → spawn 纳兹
  │
  ▼
② 纳兹 ── 读白板 → 读代码索引中相关函数 → 开发 → 更新白板
        → sessions_send 通知阿悄"纳兹完成"
  │
  ▼
③ 温蒂 ── 读白板 → 读改动的文件 → 写测试用例到 tests/
        → sessions_send 通知阿悄"温蒂完成"
  │
  ▼
④ 格雷 ── 执行测试 → 更新白板
        ├─ ✅ 通过 → sessions_send "测试通过"
        └─ ❌ 失败 → sessions_send "测试失败"
              │
              ▼
           露西 ── 查经验库 → 读代码/日志 → 定位根因
                → 追加到经验库 → sessions_send 给阿悄
                → 回纳兹修
  │
  ▼
⑤ 艾露莎 ── 验收审计（测试覆盖+需求达标+代码质量）
         → sessions_send "艾露莎验收：[结论]"
  │
  ▼
⑥ 阿悄 ── 汇总 → 报老大
```

---

## 三、智能协作白板

```
.fairy/
├── state.json        ← 共享状态（谁在做、下一步谁、有无断链）
├── changelog.md      ← 每次变更记录
├── lessons.md        ← 经验库（露西每次debug记录）
├── index-code.py     ← 代码索引生成器
├── fairy-read.sh     ← 读白板脚本
├── fairy-write.sh    ← 写白板脚本
└── code-index/       ← 各项目代码索引
    └── {project}/index.json  ← 函数列表+行号

白板字段：
- project / phase / currentAgent / nextAgent
- chainBroken（链条断裂标记 🔴）
- agents.{name}.status（idle / running / done）
- lastAction（谁做了什么、什么时候）
```

**流程：** 每次 spawn 子 Agent 前 → 读白板 → 附摘要到 prompt → 子 Agent 完成后 → 更新白板

---

## 四、监管体系（马卡罗夫值守）

**每 2 小时自动巡检：**

| 检查项 | 触发条件 | 处置 |
|--------|----------|------|
| 上下文用量 > 80% | session_status | 标记"需要压缩" |
| Session FAILED | sessions_list | 群内公开告警 |
| 白板 chainBroken=true | 读 state.json | 群内告警 + 标记需人工介入 |
| Agent > 2h 无活跃 | sessions_list | 记录到报告 |
| 旧 session > 24h | 读文件时间 | 提示可清理 |
| 断链超 2h | 白板 lastAction | 群内公开告警 |
| 经验库巡检 | 读 lessons.md | 统计条目数 |

**报告方式：** 马卡罗夫用自己的 TG bot 直接发到群里，不走系统路由。

---

## 五、代码索引系统

**目的：** 纳兹开发时不用从头读完整文件

```
.fairy/index-code.py → 扫描 JS/HTML → 提取函数/类/配置
                     → 输出到 .fairy/code-index/{project}/index.json
```

阿悄 spawn 纳兹时从索引提取相关函数行号写到 prompt：
```
"攻击相关函数在 index.html:868 playerAttack()，距离逻辑在 index.html:901"
```

---

## 六、铁律

1. ❌ 未经批准不得 push/deploy
2. ❌ 开发和验收分离（纳兹不验收，艾露莎不开发）
3. ❌ 未经老大批准不得 `openclaw gateway restart`
4. ❌ 子 Agent 不搜索 memory
5. ❌ 阿悄不得直接写代码/做测试/做审查
6. ✅ 本地模型优先（非技术活走 qwen2.5:14b）
7. ✅ 所有 SSH/exec 由阿悄直做

---

## 七、基础设施

| 组件 | 说明 |
|------|------|
| TG Bot | 每个活跃 Agent 有独立 bot（各自 token） |
| cron | 马卡罗夫值守（0 */2 * * *） |
| 工作区 | /Users/aq/.openclaw/workspace/ |
| 白板 | .fairy/ 目录，所有 Agent 可读写 |
| 经验库 | .fairy/lessons.md |
| 本地模型 | qwen2.5:14b（唯一本地模型，9.0GB） |
| API 模型 | deepseek/deepseek-v4-flash |
