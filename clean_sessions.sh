#!/bin/bash
# ============================================================
# 妖精尾巴公会 - Session 定期清理脚本
# Fairy Tail Guild - Automated Session Cleanup
# ============================================================
# 策略：
#   main Agent: 保留最近 3 天
#   其他 Agent: 保留最近 7 天
#   trajectory 文件与对应 session 共存亡
# ============================================================

BASE_DIR="/Users/aq/.openclaw/agents"
LOG_DIR="/Users/aq/.openclaw/workspace"
LOG_FILE="${LOG_DIR}/clean_sessions.log"
NOW=$(date +%s)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 确保日志目录存在
mkdir -p "$LOG_DIR"

log "=========================================="
log "妖精尾巴 Session 定期清理开始"

total_deleted=0
total_saved_before=0
total_saved_after=0

for agent_dir in "$BASE_DIR"/*/; do
    agent_id=$(basename "$agent_dir")
    sessions_dir="${agent_dir}sessions"
    
    if [ ! -d "$sessions_dir" ]; then
        continue
    fi
    
    # Agent 保留天数
    if [ "$agent_id" = "main" ]; then
        retain_days=3
    else
        retain_days=7
    fi
    
    # 计算 cutoff 时间戳
    cutoff_seconds=$((retain_days * 86400))
    
    # 计算 session 目录大小（清理前）
    before_size=$(du -sh "$sessions_dir" 2>/dev/null | awk '{print $1}')
    before_bytes=$(du -s "$sessions_dir" 2>/dev/null | awk '{print $1}')
    
    # 遍历 sessions.json 中的 session，找出过期 session
    session_ids_to_delete=""
    
    if [ -f "${sessions_dir}/sessions.json" ]; then
        # 解析 sessions.json 找出过期 session id
        expired_ids=$(python3 -c "
import json, time

now = time.time()
cutoff = now - $cutoff_seconds
retain_days = $retain_days

with open('${sessions_dir}/sessions.json') as f:
    sessions = json.load(f)

to_delete = []
to_keep = []

if isinstance(sessions, list):
    for s in sessions:
        sid = s.get('id', '')
        updated = s.get('updatedAt', 0)
        if isinstance(updated, str):
            try:
                updated = int(updated)
            except:
                updated = 0
        updated_s = updated / 1000 if updated > 1e11 else 0
        
        if updated_s > 0 and (now - updated_s) > cutoff:
            to_delete.append(sid)
        elif updated_s > 0:
            to_keep.append(sid)

elif isinstance(sessions, dict):
    for sid, s in sessions.items():
        updated = s.get('updatedAt', 0) if isinstance(s, dict) else 0
        if isinstance(updated, str):
            try:
                updated = int(updated)
            except:
                updated = 0
        updated_s = updated / 1000 if updated > 1e11 else 0
        
        if updated_s > 0 and (now - updated_s) > cutoff:
            to_delete.append(sid)
        elif updated_s > 0:
            to_keep.append(sid)

print('DELETE:' + ','.join(to_delete))
print('KEEP:' + ','.join(to_keep))
" 2>/dev/null)
        
        delete_line=$(echo "$expired_ids" | grep "^DELETE:" | sed 's/^DELETE://')
        keep_line=$(echo "$expired_ids" | grep "^KEEP:" | sed 's/^KEEP://')
        
        IFS=',' read -ra delete_ids <<< "$delete_line"
        IFS=',' read -ra keep_ids <<< "$keep_line"
    else
        delete_ids=()
        keep_ids=()
    fi
    
    # 删除过期 session 文件
    deleted_count=0
    for sid in "${delete_ids[@]}"; do
        if [ -z "$sid" ]; then continue; fi
        
        # 删除 session 相关的所有文件
        for f in "$sessions_dir/${sid}"*; do
            if [ -f "$f" ]; then
                rm -f "$f"
                deleted_count=$((deleted_count + 1))
                total_deleted=$((total_deleted + 1))
            fi
        done
    done
    
    # 同时清理 .trajectory.jsonl 孤儿文件（session.json 中未引用的）
    if [ ${#keep_ids[@]} -gt 0 ]; then
        for f in "$sessions_dir"/*.trajectory.jsonl; do
            if [ ! -f "$f" ]; then continue; fi
            basename_f=$(basename "$f")
            sid_part="${basename_f%%.trajectory.jsonl}"
            
            # 检查是否被任何 keep session 引用
            referenced=false
            for ks in "${keep_ids[@]}"; do
                if [[ "$sid_part" == "$ks"* ]]; then
                    referenced=true
                    break
                fi
            done
            
            if [ "$referenced" = false ]; then
                rm -f "$f"
                deleted_count=$((deleted_count + 1))
                total_deleted=$((total_deleted + 1))
            fi
        done
    fi
    
    # 计算清理后大小
    after_size=$(du -sh "$sessions_dir" 2>/dev/null | awk '{print $1}')
    after_bytes=$(du -s "$sessions_dir" 2>/dev/null | awk '{print $1}')
    
    if [ "$before_bytes" != "$after_bytes" ] || [ "$deleted_count" -gt 0 ]; then
        log "${agent_id}: ${before_size} → ${after_size}（删除 ${deleted_count} 个文件）"
    else
        log "${agent_id}: ${before_size}（无需清理）"
    fi
    
    total_saved_before=$((total_saved_before + before_bytes))
    total_saved_after=$((total_saved_after + after_bytes))
done

log "合计删除 ${total_deleted} 个过期 session 文件"
log "=========================================="
log "清理完成"
log ""
