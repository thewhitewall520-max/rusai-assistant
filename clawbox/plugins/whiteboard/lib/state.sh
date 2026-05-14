#!/bin/bash
# ============================================================
# 🧩 白板核心库 — state.sh
# 智能协作白板插件 Lite 版 · 可 sourced 的库函数
# 依赖: bash + python3 (macOS 自带)
# ============================================================

# ---------- 配置 ----------
FAIRY_DIR="${FAIRY_DIR:-$HOME/.openclaw/workspace/.fairy}"
STATE_FILE="$FAIRY_DIR/state.json"
CHANGELOG_FILE="$FAIRY_DIR/changelog.md"
LESSONS_FILE="$FAIRY_DIR/lessons.md"

# 确保 .fairy 目录存在
ensure_fairy_dir() {
  mkdir -p "$FAIRY_DIR"
}

# ---------- read_state — 读取当前 state.json ----------
# 用法: read_state [project]
# 输出: 完整 state.json 内容到 stdout
read_state() {
  ensure_fairy_dir
  local project="$1"
  local target_file="$STATE_FILE"

  if [ -n "$project" ]; then
    local project_dir="$HOME/.openclaw/workspace/$project/.fairy"
    if [ -f "$project_dir/state.json" ]; then
      target_file="$project_dir/state.json"
    else
      echo "{\"error\": \"project '$project' not found\"}"
      return 1
    fi
  fi

  if [ -f "$target_file" ]; then
    cat "$target_file"
  else
    echo "{}"
  fi
}

# ---------- write_state — 更新 state.json 字段 ----------
# 用法: write_state <key> <value>
# key 支持点号路径如: projects.my-project.phase
# value 可以是字符串或 JSON 值（自动检测）
write_state() {
  ensure_fairy_dir
  local key="$1"
  local value="$2"

  if [ -z "$key" ] || [ -z "$value" ]; then
    echo "❌ 用法: write_state <key> <value>"
    return 1
  fi

  python3 -c "
import json, sys, os

state_file = '$STATE_FILE'
key = '${key}'
value_raw = '${value}'

# Try to parse value as JSON, fall back to string
try:
    value = json.loads(value_raw)
except (json.JSONDecodeError, ValueError):
    value = value_raw

# Read current state
current = {}
if os.path.exists(state_file):
    with open(state_file) as f:
        try:
            current = json.load(f)
        except:
            current = {}

# Navigate/set nested keys using dot notation
keys = key.split('.')
target = current
for k in keys[:-1]:
    if k not in target or not isinstance(target[k], dict):
        target[k] = {}
    target = target[k]
target[keys[-1]] = value

# Update timestamp
current['updatedAt'] = __import__('datetime').datetime.now().strftime('%Y-%m-%dT%H:%M:%S+08:00')

with open(state_file, 'w') as f:
    json.dump(current, f, indent=2, ensure_ascii=False)

print('✅ 白板已更新')
" || {
    echo "❌ 写入 state.json 失败"
    return 1
  }
}

# ---------- append_changelog — 追加变更日志 ----------
# 用法: append_changelog <message>
append_changelog() {
  ensure_fairy_dir
  local message="$1"

  if [ -z "$message" ]; then
    echo "❌ 用法: append_changelog <message>"
    return 1
  fi

  local timestamp
  timestamp=$(date +"%Y-%m-%dT%H:%M:%S+08:00")

  if [ ! -f "$CHANGELOG_FILE" ]; then
    echo "# 变更日志" > "$CHANGELOG_FILE"
    echo "" >> "$CHANGELOG_FILE"
    echo "| 时间 | 操作 | 说明 |" >> "$CHANGELOG_FILE"
    echo "|------|------|------|" >> "$CHANGELOG_FILE"
  fi

  echo "| $timestamp | $message |" >> "$CHANGELOG_FILE"
  echo "✅ 变更日志已追加"
}

# ---------- append_lesson — 追加经验记录 ----------
# 用法: append_lesson <topic> <detail>
append_lesson() {
  ensure_fairy_dir
  local topic="$1"
  local detail="$2"

  if [ -z "$topic" ] || [ -z "$detail" ]; then
    echo "❌ 用法: append_lesson <topic> <detail>"
    return 1
  fi

  local date_str
  date_str=$(date +"%Y-%m-%d")

  if [ ! -f "$LESSONS_FILE" ]; then
    echo "# 🧠 经验库" > "$LESSONS_FILE"
    echo "" >> "$LESSONS_FILE"
  fi

  {
    echo ""
    echo "## $date_str | $topic"
    echo "- $detail"
  } >> "$LESSONS_FILE"

  echo "✅ 经验已记录"
}

# ---------- check_chain — 检查阶段门禁 ----------
# 用法: check_chain [project]
# 输出: 当前是否链式中断及状态详情
check_chain() {
  ensure_fairy_dir
  local project="$1"
  local target_file="$STATE_FILE"

  if [ -n "$project" ]; then
    local project_dir="$HOME/.openclaw/workspace/$project/.fairy"
    if [ -f "$project_dir/state.json" ]; then
      target_file="$project_dir/state.json"
    else
      echo "❌ 项目 '$project' 不存在"
      return 1
    fi
  fi

  if [ ! -f "$target_file" ]; then
    echo "⚠️  state.json 不存在"
    return 1
  fi

  python3 -c "
import json, sys

with open('$target_file') as f:
    state = json.load(f)

project_name = state.get('currentProject', 'unknown')
project = state.get('projects', {}).get(project_name, {})

chain_broken = project.get('chainBroken', False)
phase = project.get('phase', 'unknown')
agents = project.get('agents', {})
awaiting = project.get('awaitingDecision', [])

print(f'📋 项目: {project_name}')
print(f'📌 阶段: {phase}')
print(f'🔗 链式中断: {\"是 ⚠️\" if chain_broken else \"否 ✅\"}')

if awaiting:
    print(f'💬 等待决策: {len(awaiting)} 项')
    for a in awaiting:
        print(f'   - {a}')

print('')
print('Agent 状态:')
for name, info in agents.items():
    print(f'  {name}: {info.get(\"status\",\"?\")} — {info.get(\"task\",\"\")}')
" || {
    echo "⚠️  检查门禁状态失败"
    return 1
  }
}
