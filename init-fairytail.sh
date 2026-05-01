#!/bin/bash
# ============================================================
# 妖精尾巴公会 Agent 团队初始化脚本
# Fairy Tail Guild Agent Team Initialization Script
# ============================================================
# 用法: bash init-fairytail.sh
# ============================================================

set -e

echo "=========================================="
echo "  🐉 妖精尾巴公会初始化开始"
echo "=========================================="

# 验证 Ollama 运行状态
echo ""
echo "[1/6] 检查 Ollama 服务状态..."
if command -v ollama &>/dev/null; then
    echo "  ✅ Ollama 已安装"
    if ollama list &>/dev/null; then
        echo "  ✅ Ollama 服务运行中"
    else
        echo "  ⚠️  Ollama 服务未运行，请启动: ollama serve"
        echo "     或在另一个终端运行"
    fi
else
    echo "  ❌ Ollama 未安装。请先安装: https://ollama.com/download"
    exit 1
fi

# 检查本地模型
echo ""
echo "[2/6] 检查本地模型..."
for model in "qwen2.5:7b" "mistral:7b" "phi4:latest"; do
    if ollama list 2>/dev/null | grep -q "$model"; then
        echo "  ✅ $model 已就绪"
    else
        echo "  ⏳ 正在拉取 $model ..."
        ollama pull "$model"
        echo "  ✅ $model 已就绪"
    fi
done

# 检查 DeepSeek API key
echo ""
echo "[3/6] 检查 DeepSeek API Key..."
if [ -n "$DEEPSEEK_API_KEY" ]; then
    echo "  ✅ DEEPSEEK_API_KEY 已配置"
else
    echo "  ⚠️  DEEPSEEK_API_KEY 未配置"
    echo "     请在 ~/.zshrc 或环境中设置:"
    echo "     export DEEPSEEK_API_KEY=\"your-key-here\""
fi

# 检查 OLLAMA_API_KEY
echo ""
echo "[4/6] 检查 Ollama 环境变量..."
if [ -z "$OLLAMA_API_KEY" ]; then
    echo "  ⚠️  OLLAMA_API_KEY 未设置，正在写入 ~/.zshrc ..."
    echo 'export OLLAMA_API_KEY="ollama-local"' >> ~/.zshrc
    export OLLAMA_API_KEY="ollama-local"
    echo "  ✅ OLLAMA_API_KEY 已设置为 ollama-local"
else
    echo "  ✅ OLLAMA_API_KEY 已配置"
fi

# 验证 Agent 目录结构
echo ""
echo "[5/6] 验证 Agent 目录结构..."
agent_ids=("aqiao" "makarov" "natsu" "gray" "erza" "lucia" "happy" "wendy" "mirajane" "elfman" "levy" "juvia" "gildarts" "mavis")
for id in "${agent_ids[@]}"; do
    soul_path="/Users/aq/.openclaw/agents/${id}/agent/SOUL.md"
    if [ -f "$soul_path" ]; then
        echo "  ✅ ${id} - SOUL.md 存在"
    else
        echo "  ❌ ${id} - SOUL.md 缺失"
    fi
done

# 验证配置文件
echo ""
echo "[6/6] 验证配置文件..."
if [ -f "/Users/aq/.openclaw/openclaw.json" ]; then
    echo "  ✅ openclaw.json 存在"
    # 粗略验证 JSON 合法性
    if python3 -c "import json; json.load(open('/Users/aq/.openclaw/openclaw.json'))" 2>/dev/null; then
        echo "  ✅ openclaw.json JSON 语法验证通过"
    else
        echo "  ❌ openclaw.json JSON 语法错误"
        exit 1
    fi
else
    echo "  ❌ openclaw.json 不存在"
    exit 1
fi

echo ""
echo "=========================================="
echo "  🐉 妖精尾巴公会初始化完成！"
echo "=========================================="
echo ""
echo "Agent 团队已就绪:"
echo "  🐉 阿悄     (CTO Agent)         - deepseek/deepseek-v4-flash"
echo "  👴 马卡罗夫  (任务总管)          - ollama/qwen2.5:7b"
echo "  🔥 纳兹     (主力开发)          - ollama/qwen2.5:7b"
echo "  ❄️ 格雷     (测试 Debug)        - ollama/mistral:7b"
echo "  ⚔️ 艾露莎   (验收纪律)          - ollama/qwen2.5:7b (只读)"
echo "  📖 露西     (文档记录)          - ollama/qwen2.5:7b"
echo "  🐱 哈比     (通知汇报)          - ollama/phi4:latest"
echo "  🪽 温蒂     (安全审查)          - ollama/qwen2.5:7b (只读)"
echo "  😊 米拉珍   (发布协调)          - ollama/qwen2.5:7b"
echo "  💪 艾尔夫曼 (构建检查)          - ollama/mistral:7b"
echo "  📚 蕾比     (知识库)            - ollama/qwen2.5:7b"
echo "  💧 朱比亚   (前端体验)          - ollama/mistral:7b (只读)"
echo "  💥 吉尔达斯 (高风险顾问)        - deepseek/deepseek-v4-flash"
echo "  👼 梅比斯   (战略规划)          - ollama/phi4:latest"
echo ""
echo "需要重启 Gateway 来应用配置:"
echo "  openclaw gateway restart"
echo ""
