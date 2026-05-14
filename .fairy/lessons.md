# 🧠 妖精尾巴经验库

每次从失败/异常中学习到的东西，记录在此。

## 格式
```
## YYYY-MM-DD | [问题简述]
- 场景：
- 根因：
- 教训：
- 改进措施：
```

---

## 2026-05-09 | CLI 命令挂起 — Commander async handler 未正确处理
- **场景**：ContextWeaver 插件的 `ctx status / compact / cost` CLI 命令在 Gateway 上下文中挂起不退出
- **根因**：`.action()` handlers 使用 `.then()` 链返回 Promise，Gateway CLI runner 未正确 await
- **教训**：OpenClaw Gateway 插件 CLI handler 必须用 `async/await` + `try/catch`，不要用 `.then()` 链
- **改进**：纳兹已将全部 handler 改为 async/await，格雷补充 41 个单元测试确保回归

## 2026-05-09 | Tech Daily fetcher stdout 污染
- **场景**：fetcher 输出混合 debug log 和 JSON 到 stdout，下游 summarizer 解析失败
- **根因**：`console.log()` 同时用于调试信息和数据输出，导致管道 JSON 无效
- **教训**：调试日志必须走 stderr（`console.error`），stdout 只输出机器可解析的数据
- **改进**：纳兹修复中，待验证

---

## 使用原则
- 露西：每次根因分析完成后写一条
- 阿悄：遇到值得记录的架构教训时写一条
- 格雷：发现值得记录的测试教训时写一条

## 2026-05-09 | 诊断: 超时
- **场景**：ETIMEOUT
- **教训**：增加超时时间阈值
- **改进**：增加超时时间阈值

## 2026-05-09 | 诊断: 超时
- **场景**：ETIMEOUT connecting to api.openai.com
- **教训**：[经验库 2026-05-09] 增加超时时间阈值
- **改进**：[经验库 2026-05-09] 增加超时时间阈值

## 2026-05-10 | BASH_SOURCE空值
- 在bash脚本中，当通过bash install.sh调用时，BASH_SOURCE为空，需用${BASH_SOURCE[0]:-$0}兜底

## 2026-05-10 | 测试主题
- 测试详情 — 验证白板插件功能

## 2026-05-10 | some-topic
- some detail here

## 2026-05-10 | 无参数检查
- fairy update-agent 无参时输出友好提示

## 2026-05-10 | Windows安装
- 白板插件需加 fairy.bat 或 install.bat，双击即装，给小白用户最友好

## 2026-05-10 | 测试主题
- 测试详细说明

## 2026-05-10 | 跨平台测试
- Node.js 版 CLI 在 macOS 上所有命令验证通过

## 2026-05-10 | 测试标题
- 测试详情
