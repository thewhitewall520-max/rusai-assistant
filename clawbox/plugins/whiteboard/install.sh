#!/bin/bash
# ============================================================
# 🧩 白板插件 — 一键安装脚本
# 智能协作白板插件 Lite 版 v1.0.0
# 一行搞定: bash -c "$(curl -fsSL https://xxx/install.sh)"
# ============================================================
set -e

# ---------- 颜色 ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  🧩 白板插件 — 一键安装${NC}"
echo -e "${BLUE}============================================${NC}"

# ---------- 1. 检测环境 ----------
echo ""
echo -e "${YELLOW}🔍 检测环境...${NC}"

# 检测 OpenClaw 环境
if [ -d "$HOME/.openclaw" ]; then
  echo -e "${GREEN}✅ OpenClaw 环境检测通过${NC}"
  OPENCLAW_DIR="$HOME/.openclaw"
else
  echo -e "${YELLOW}⚠️  未检测到 OpenClaw 环境（可手动初始化）${NC}"
  OPENCLAW_DIR="$HOME/.openclaw"
  mkdir -p "$OPENCLAW_DIR/workspace"
fi

# 检测 python3
if command -v python3 &>/dev/null; then
  echo -e "${GREEN}✅ Python3 检测通过 ($(python3 --version))${NC}"
else
  echo -e "${RED}❌ 需要 Python3，但未找到${NC}"
  echo "   请安装: brew install python3"
  exit 1
fi

# 检测 bash
BASH_VER=$(bash --version | head -1)
echo -e "${GREEN}✅ Bash 检测通过 ($BASH_VER)${NC}"

# ---------- 2. 确定安装目录 ----------
echo ""
echo -e "${YELLOW}📂 确定安装路径...${NC}"

# 检测 install.sh 是在本地运行还是通过 curl 管道运行
# 检测 install.sh 是在本地运行还是远程管道模式
SCRIPT_SOURCE="${BASH_SOURCE[0]:-$0}"
if [ -f "$SCRIPT_SOURCE" ]; then
  # 本地运行 — 从脚本位置取文件
  PLUGIN_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd)"
  echo -e "${GREEN}✅ 本地安装模式: $PLUGIN_DIR${NC}"
else
  # 管道运行 — 需要下载
  echo -e "${YELLOW}📥 管道安装模式，从 GitHub 下载...${NC}"
  echo "   暂不支持远程安装，请先 clone 仓库后本地运行"
  echo "   git clone <repo-url> && cd whiteboard && bash install.sh"
  exit 1
fi

# ---------- 3. 创建 .fairy 目录 ----------
echo ""
echo -e "${YELLOW}📁 创建 .fairy 工作目录...${NC}"

FAIRY_DIR="$OPENCLAW_DIR/workspace/.fairy"
mkdir -p "$FAIRY_DIR"

if [ -f "$FAIRY_DIR/state.json" ]; then
  echo -e "${YELLOW}⚠️  state.json 已存在，保留现有配置${NC}"
else
  echo -e "${GREEN}📝 写入初始 state.json...${NC}"
  if [ -f "$PLUGIN_DIR/templates/state.json" ]; then
    cp "$PLUGIN_DIR/templates/state.json" "$FAIRY_DIR/state.json"
  else
    # 直接写入模板
    timestamp=$(date +"%Y-%m-%dT%H:%M:%S+08:00")
    cat > "$FAIRY_DIR/state.json" << EOF
{
  "currentProject": "my-project",
  "projects": {
    "my-project": {
      "name": "我的项目",
      "phase": "需求",
      "chainBroken": false,
      "agents": {},
      "awaitingDecision": [],
      "createdAt": "$timestamp",
      "updatedAt": "$timestamp"
    }
  }
}
EOF
  fi
fi

# 初始化空的 changelog 和 lessons
if [ ! -f "$FAIRY_DIR/changelog.md" ]; then
  echo "# 变更日志" > "$FAIRY_DIR/changelog.md"
  echo "" >> "$FAIRY_DIR/changelog.md"
  echo "| 时间 | 操作 | 说明 |" >> "$FAIRY_DIR/changelog.md"
  echo "|------|------|------|" >> "$FAIRY_DIR/changelog.md"
  echo -e "${GREEN}✅ changelog.md 已创建${NC}"
fi

if [ ! -f "$FAIRY_DIR/lessons.md" ]; then
  echo "# 🧠 经验库" > "$FAIRY_DIR/lessons.md"
  echo -e "${GREEN}✅ lessons.md 已创建${NC}"
fi

echo -e "${GREEN}✅ .fairy 工作目录就绪: $FAIRY_DIR${NC}"

# ---------- 4. 安装 CLI 工具 ----------
echo ""
echo -e "${YELLOW}🔧 安装 CLI 工具...${NC}"

# 确保 ~/.local/bin 存在
LOCAL_BIN="$HOME/.local/bin"
mkdir -p "$LOCAL_BIN"

# 复制 fairy CLI
CLI_SRC="$PLUGIN_DIR/cli/fairy"
if [ -f "$CLI_SRC" ]; then
  cp "$CLI_SRC" "$LOCAL_BIN/fairy"
  chmod +x "$LOCAL_BIN/fairy"
  echo -e "${GREEN}✅ fairy CLI 已安装到 $LOCAL_BIN/fairy${NC}"
else
  # 远程模式：直接写入 CLI
  echo -e "${YELLOW}⚠️  cli/fairy 未找到，尝试从脚本内嵌获取...${NC}"
  echo "   请确保完整 clone 了插件目录"
  exit 1
fi

# 复制 lib/state.sh
LIB_DIR="$HOME/.local/lib/fairy"
mkdir -p "$LIB_DIR"
if [ -f "$PLUGIN_DIR/lib/state.sh" ]; then
  cp "$PLUGIN_DIR/lib/state.sh" "$LIB_DIR/state.sh"
  echo -e "${GREEN}✅ state.sh 库已安装到 $LIB_DIR/state.sh${NC}"
fi

# 将 ~/.local/bin 加入 PATH（如果不在）
if [[ ":$PATH:" != *":$LOCAL_BIN:"* ]]; then
  SHELL_CONFIG="$HOME/.zshrc"
  if [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
  fi
  echo "" >> "$SHELL_CONFIG"
  echo '# 🧩 白板插件 — 添加 ~/.local/bin 到 PATH' >> "$SHELL_CONFIG"
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_CONFIG"
  echo -e "${YELLOW}📝 已将 ~/.local/bin 添加到 $SHELL_CONFIG${NC}"
  echo -e "${YELLOW}   请运行: source $SHELL_CONFIG${NC}"
fi

# ---------- 5. 集成 AGENTS.md ----------
echo ""
echo -e "${YELLOW}📝 检查 AGENTS.md 集成...${NC}"

AGENTS_MD="$OPENCLAW_DIR/workspace/AGENTS.md"
INTEGRATION_FILE="$PLUGIN_DIR/templates/agents-integration.md"

if [ -f "$AGENTS_MD" ]; then
  if grep -q "白板" "$AGENTS_MD" 2>/dev/null || grep -q "fairy" "$AGENTS_MD" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  AGENTS.md 似乎已包含白板配置，跳过${NC}"
  else
    if [ -f "$INTEGRATION_FILE" ]; then
      cat "$INTEGRATION_FILE" >> "$AGENTS_MD"
      echo "" >> "$AGENTS_MD"
      echo -e "${GREEN}✅ 已追加白板使用说明到 AGENTS.md${NC}"
    else
      echo -e "${YELLOW}⚠️  templates/agents-integration.md 不存在，跳过${NC}"
    fi
  fi
else
  echo -e "${YELLOW}⚠️  AGENTS.md 不存在，跳过集成${NC}"
fi

# ---------- 6. 安装自检 ----------
echo ""
echo -e "${YELLOW}✅ 运行安装自检...${NC}"

FAILED=0

# 检查 CLI 是否可用
if command -v fairy &>/dev/null; then
  echo -e "${GREEN}  ✅ fairy CLI 命令可用${NC}"
else
  if [ -x "$LOCAL_BIN/fairy" ]; then
    echo -e "${GREEN}  ✅ fairy CLI 已安装（需 source shell config）${NC}"
  else
    echo -e "${RED}  ❌ fairy CLI 未正确安装${NC}"
    FAILED=1
  fi
fi

# 检查 .fairy 目录
if [ -d "$FAIRY_DIR" ]; then
  echo -e "${GREEN}  ✅ .fairy 目录存在${NC}"
else
  echo -e "${RED}  ❌ .fairy 目录不存在${NC}"
  FAILED=1
fi

# 检查 state.json
if [ -f "$FAIRY_DIR/state.json" ]; then
  if python3 -c "import json; json.load(open('$FAIRY_DIR/state.json'))" 2>/dev/null; then
    echo -e "${GREEN}  ✅ state.json 格式正确${NC}"
  else
    echo -e "${RED}  ❌ state.json 格式无效${NC}"
    FAILED=1
  fi
else
  echo -e "${RED}  ❌ state.json 不存在${NC}"
  FAILED=1
fi

# 检查 changelog
if [ -f "$FAIRY_DIR/changelog.md" ]; then
  echo -e "${GREEN}  ✅ changelog.md 存在${NC}"
else
  echo -e "${YELLOW}  ⚠️  changelog.md 不存在（已自动创建）${NC}"
fi

# 检查 lessons
if [ -f "$FAIRY_DIR/lessons.md" ]; then
  echo -e "${GREEN}  ✅ lessons.md 存在${NC}"
else
  echo -e "${YELLOW}  ⚠️  lessons.md 不存在（已自动创建）${NC}"
fi

# ---------- 7. 完成 ----------
echo ""
echo -e "${BLUE}============================================${NC}"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}  🎉 白板插件安装成功！${NC}"
  echo -e "${GREEN}============================================${NC}"
  echo ""
  echo -e "${YELLOW}📖 快速上手:${NC}"
  echo ""
  echo "  # 查看当前状态"
  echo "  fairy status"
  echo ""
  echo "  # 记录变更"
  echo "  fairy log '纳兹 完成需求分析'"
  echo ""
  echo "  # 记录经验"
  echo "  fairy lesson API超时 '增加超时时间阈值'"
  echo ""
  echo "  # 更新 Agent 状态"
  echo "  fairy update-agent natsu running '白板插件开发'"
  echo ""
  echo "  # 检查阶段门禁"
  echo "  fairy chain-check"
  echo ""
  echo "  # 查看全部命令"
  echo "  fairy help"
  echo ""
  echo -e "${BLUE}📍 数据目录: $FAIRY_DIR${NC}"
  echo -e "${BLUE}📍 CLI 路径: $LOCAL_BIN/fairy${NC}"
else
  echo -e "${RED}  安装存在问题，请检查以上错误${NC}"
  echo -e "${RED}============================================${NC}"
  exit 1
fi
