#!/bin/bash
# 写入白板状态
# 用法: ./fairy-write.sh [project] '{"key": "value", ...}'
# 会合并写入，只更新提供的字段，不覆盖其他字段

BASE_DIR="/Users/aq/.openclaw/workspace/.fairy"

if [ -n "$1" ] && [ "$1" != "global" ]; then
  TARGET_DIR="/Users/aq/.openclaw/workspace/$1/.fairy"
  mkdir -p "$TARGET_DIR"
  STATE_FILE="$TARGET_DIR/state.json"
else
  STATE_FILE="$BASE_DIR/state.json"
fi

python3 -c "
import json, sys, os
update = json.loads('${2:-{\}}') if len(sys.argv) > 2 else {}

# Read current state
current = {}
if os.path.exists('$STATE_FILE'):
    with open('$STATE_FILE') as f:
        try:
            current = json.load(f)
        except:
            current = {}

# Merge: update only provided fields
current.update(update)
current['updatedAt'] = __import__('datetime').datetime.now().strftime('%Y-%m-%dT%H:%M:%S+08:00')

with open('$STATE_FILE', 'w') as f:
    json.dump(current, f, indent=2, ensure_ascii=False)

print('✅ 白板已更新')
print(json.dumps(current, indent=2, ensure_ascii=False))
"
