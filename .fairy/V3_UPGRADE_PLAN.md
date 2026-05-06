# 妖精尾巴 V3 升级计划

## ① 任务链自动化 — sessions_send 接力
核心：不再等子 Agent 跑完，他跑完主动敲我。

```
我 spawn 纳兹（prompt 含"完成后 sessions_send 通知我"）
  → 纳兹完成 → sessions_send 给主会话"纳兹完成"
  → 我收到消息 → 立即 spawn 温蒂
  → 温蒂完成 → sessions_send "温蒂完成"
  → 我 spawn 格雷
  → 格雷完成 → sessions_send "格雷完成"
  → 我 spawn 艾露莎
  → 艾露莎完成 → sessions_send "艾露莎完成"
  → 我汇总给老大
```

我不再空等，纳兹跑的时候我可以做别的。

## ② 马卡罗夫升级 — 值守 Agent
巡警 + 自动运维：
- 上下文>80% → 自动触发压缩
- 发现断链 → 自动催办 + 更新白板
- 清理旧 session（>24h）
- 经验库巡检

## ③ 经验库 — .fairy/lessons.md
露西每次修完 bug 自动记录一条：
```
## 2026-05-06 | 攻击不生效
根因: applyDamageToEnemy 被注释
修复: 取消注释第X行
标签: 游戏,攻击,动画
```
下次类似 bug 直接查经验库，不用从头分析。
