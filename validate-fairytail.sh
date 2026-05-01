#!/bin/bash
# ============================================================
# 妖精尾巴公会 Agent 团队验证脚本
# ============================================================

set -e

echo "=========================================="
echo "  🔍 妖精尾巴公会配置验证"
echo "=========================================="

errors=0
warnings=0

check() {
    local desc="$1"
    local cond="$2"
    if eval "$cond"; then
        echo "  ✅ $desc"
    else
        echo "  ❌ $desc"
        errors=$((errors + 1))
    fi
}

warn() {
    local desc="$1"
    local cond="$2"
    if ! eval "$cond"; then
        echo "  ⚠️  $desc"
        warnings=$((warnings + 1))
    fi
}

echo ""
echo "--- 1. 核心配置文件 ---"

check "openclaw.json 存在" "[ -f /Users/aq/.openclaw/openclaw.json ]"
check "openclaw.json JSON 语法正确" "python3 -c 'import json; json.load(open(\"/Users/aq/.openclaw/openclaw.json\"))' 2>/dev/null"

echo ""
echo "--- 2. Agent SOUL.md 完整性 ---"
for id in aqiao makarov natsu gray erza lucia happy wendy mirajane elfman levy juvia gildarts mavis; do
    check "agents/${id}/agent/SOUL.md" "[ -f /Users/aq/.openclaw/agents/${id}/agent/SOUL.md ]"
done

echo ""
echo "--- 3. OpenClaw 配置文件验证 ---"

CONFIG=$(python3 -c "
import json
with open('/Users/aq/.openclaw/openclaw.json') as f:
    d = json.load(f)
    print('OK')
" 2>/dev/null || echo "PARSE_ERROR")

if [ "$CONFIG" = "PARSE_ERROR" ]; then
    echo "  ❌ 无法解析 openclaw.json"
    errors=$((errors + 1))
else
    # Validate agents list
    config_content=$(python3 -c "
import json
with open('/Users/aq/.openclaw/openclaw.json') as f:
    return json.load(f)
")

    # Check agents exist
    python3 -c "
import json, sys

with open('/Users/aq/.openclaw/openclaw.json') as f:
    config = json.load(f)

agents = config.get('agents', {})
agents_list = agents.get('list', [])

agent_ids = [a['id'] for a in agents_list]
expected_ids = ['main', 'makarov', 'natsu', 'gray', 'erza', 'lucia', 'happy', 'wendy', 'mirajane', 'elfman', 'levy', 'juvia', 'gildarts', 'mavis']

# Check all expected agents exist
for eid in expected_ids:
    if eid not in agent_ids:
        print(f'FAIL: Agent {eid} not found in config')
        sys.exit(1)

print(f'OK: All {len(expected_ids)} agents configured')

# Check model assignments
model_checks = {
    'main': 'deepseek/deepseek-v4-flash',
    'makarov': 'ollama/qwen2.5:7b',
    'natsu': 'ollama/qwen2.5:7b',
    'gray': 'ollama/mistral:7b',
    'erza': 'ollama/qwen2.5:7b',
    'lucia': 'ollama/qwen2.5:7b',
    'happy': 'ollama/phi4:latest',
    'wendy': 'ollama/qwen2.5:7b',
    'mirajane': 'ollama/qwen2.5:7b',
    'elfman': 'ollama/mistral:7b',
    'levy': 'ollama/qwen2.5:7b',
    'juvia': 'ollama/mistral:7b',
    'gildarts': 'deepseek/deepseek-v4-flash',
    'mavis': 'ollama/phi4:latest'
}

for agent in agents_list:
    aid = agent['id']
    expected_model = model_checks.get(aid)
    actual_model = agent.get('model', 'NOT_SET')
    if isinstance(actual_model, dict):
        actual_model = actual_model.get('primary', str(actual_model))
    if expected_model and actual_model != expected_model:
        print(f'WARN: {aid} model mismatch: expected {expected_model}, got {actual_model}')

# Check read-only agents have tools restrictions
readonly_agents = ['erza', 'wendy', 'juvia']
for agent in agents_list:
    if agent['id'] in readonly_agents:
        tools = agent.get('tools', {})
        denied = tools.get('deny', [])
        if 'exec' not in denied and 'write' not in denied and 'edit' not in denied:
            print(f'WARN: {agent[\"id\"]} should deny exec/write/edit for read-only')

# Check happy and mavis have no skills or minimal tools
for agent in agents_list:
    if agent['id'] in ['happy', 'mavis']:
        profile = agent.get('tools', {}).get('profile', '')
        if profile != 'minimal':
            print(f'WARN: {agent[\"id\"]} should have tools.profile=minimal (no tools needed)')

print('DONE')
" 2>&1
fi

echo ""
echo "--- 4. Ollama 模型就绪状态 ---"
if command -v ollama &>/dev/null; then
    for model in "qwen2.5:7b" "mistral:7b" "phi4:latest"; do
        if ollama list 2>/dev/null | grep -q "$model"; then
            echo "  ✅ ollama $model 已就绪"
        else
            echo "  ⚠️  ollama $model 未拉取"
            warnings=$((warnings + 1))
        fi
    done
else
    echo "  ❌ ollama 未安装"
    errors=$((errors + 1))
fi

echo ""
echo "--- 5. 团队文档完整性 ---"
check "FAIRY_TAIL_TEAM.md 存在" "[ -f /Users/aq/.openclaw/workspace/FAIRY_TAIL_TEAM.md ]"
check "init-fairytail.sh 存在" "[ -f /Users/aq/.openclaw/workspace/init-fairytail.sh ]"
check "init-fairytail.sh 可执行" "[ -x /Users/aq/.openclaw/workspace/init-fairytail.sh ]"

echo ""
echo "=========================================="
echo "  验证报告"
echo "=========================================="
echo "  错误: $errors"
echo "  警告: $warnings"
if [ "$errors" -eq 0 ]; then
    echo ""
    echo "  🎉 恭喜！配置验证通过！"
    echo "  现在可以运行: bash init-fairytail.sh"
    echo "  然后重启 Gateway: openclaw gateway restart"
else
    echo ""
    echo "  ❌ 有 $errors 个错误需要修复"
    exit 1
fi
echo "=========================================="
