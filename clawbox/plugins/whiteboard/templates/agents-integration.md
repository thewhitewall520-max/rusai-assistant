## 🧩 白板（智能协作板）

每次 spawn 子 Agent 前：
1. 读 `.fairy/state.json` 看当前状态
2. 更新白板：currentAgent/nextAgent/lastAction
3. 在任务 prompt 中附上白板摘要给子 Agent

每次子 Agent 回报后：
1. 更新白板：agents.{name}.status / chainBroken / nextAgent
2. 追加到 `.fairy/changelog.md`
