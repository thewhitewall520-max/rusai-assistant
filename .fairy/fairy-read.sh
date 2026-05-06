#!/bin/bash
# 读取白板状态
# 用法: ./fairy-read.sh [project]

BASE_DIR="/Users/aq/.openclaw/workspace/.fairy"

if [ -n "$1" ]; then
  # 项目级白板
  PROJECT_DIR="/Users/aq/.openclaw/workspace/$1/.fairy"
  if [ -f "$PROJECT_DIR/state.json" ]; then
    cat "$PROJECT_DIR/state.json"
  else
    echo "{}"
  fi
else
  # 全局白板
  if [ -f "$BASE_DIR/state.json" ]; then
    cat "$BASE_DIR/state.json"
  else
    echo "{}"
  fi
fi
