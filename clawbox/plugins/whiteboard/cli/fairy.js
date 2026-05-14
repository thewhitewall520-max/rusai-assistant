#!/usr/bin/env node
/**
 * ============================================================
 * 🧩 fairy — 白板 CLI 工具 (Node.js 版)
 * 智能协作白板插件 v1.0.0
 * 跨平台: macOS / Linux / Windows
 * 零 npm 依赖，纯 Node.js 内置模块
 * ============================================================
 */

const path = require('path');
const {
  getDefaultFairyDir,
  ensureFairyDir,
  readState,
  writeState,
  appendChangelog,
  appendLesson,
  checkChain,
  updateAgent,
  validateStatus
} = require('../lib/state.js');
const {
  readLicense,
  hasFeature,
  getProductName,
  getLicenseStatus,
  activateLicense,
  PRODUCTS
} = require('../lib/license.js');

// ---------- Helpers ----------

const FAIRY_DIR = getDefaultFairyDir();

/**
 * Ensure .fairy directory and state.json exist
 */
function ensureState() {
  ensureFairyDir(FAIRY_DIR);
  const stateFile = path.join(FAIRY_DIR, 'state.json');
  const fs = require('fs');
  if (!fs.existsSync(stateFile)) {
    const timestamp = formatTimestamp(new Date());
    const initial = {
      currentProject: 'my-project',
      projects: {
        'my-project': {
          name: '我的项目',
          phase: '需求',
          chainBroken: false,
          agents: {},
          awaitingDecision: [],
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    };
    fs.writeFileSync(stateFile, JSON.stringify(initial, null, 2) + '\n', 'utf-8');
    console.log('⚠️  state.json 不存在，已自动初始化');
  }
}

function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${M}-${d}T${h}:${m}:${s}+08:00`;
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ---------- Command implementations ----------

/**
 * cmd_status - Show project and agent status
 */
function cmdStatus(projectArg) {
  ensureState();
  const state = readState(FAIRY_DIR, projectArg);
  const projectName = state.currentProject || 'unknown';
  const project = (state.projects || {})[projectName] || {};

  const chainBroken = !!project.chainBroken;
  const phase = project.phase || 'unknown';
  const agents = project.agents || {};
  const awaiting = project.awaitingDecision || [];

  console.log(`📋 项目: ${projectName}`);
  console.log(`📌 阶段: ${phase}`);
  console.log(`🔗 链式中断: ${chainBroken ? '是 ⚠️' : '否 ✅'}`);
  if (awaiting.length > 0) {
    console.log(`💬 等待决策: ${awaiting.length} 项`);
    awaiting.forEach(a => console.log(`   - ${a}`));
  }
  console.log('');
  console.log('Agent 状态:');
  const agentNames = Object.keys(agents);
  if (agentNames.length === 0) {
    console.log('  (暂无 Agent)');
  } else {
    agentNames.forEach(name => {
      const info = agents[name];
      console.log(`  ${name}: ${info.status || '?'} — ${info.task || ''}`);
    });
  }
}

/**
 * cmd_log - Append changelog entry
 */
function cmdLog(message) {
  if (!message) {
    console.error('❌ 用法: fairy log <消息内容>');
    console.error('   例: fairy log 纳兹 完成需求分析');
    process.exit(1);
  }
  ensureState();
  appendChangelog(FAIRY_DIR, message);
  console.log('✅ 变更日志已追加');
}

/**
 * cmd_lesson - Add lesson record
 */
function cmdLesson(topic, detail) {
  if (!topic || !detail) {
    console.error('❌ 用法: fairy lesson <主题> <详细说明>');
    console.error('   例: fairy lesson API超时 "增加超时时间阈值"');
    process.exit(1);
  }
  ensureState();
  appendLesson(FAIRY_DIR, topic, detail);
  console.log('✅ 经验已记录');
}

/**
 * cmd_chain_check - Check phase gating
 */
function cmdChainCheck(projectArg) {
  ensureState();
  const result = checkChain(FAIRY_DIR);
  const projectName = result.state.currentProject || 'unknown';
  const project = (result.state.projects || {})[projectName] || {};

  console.log(`📋 项目: ${projectName}`);
  console.log(`📌 阶段: ${project.phase || 'unknown'}`);
  console.log(`🔗 链式中断: ${result.broken ? '是 ⚠️' : '否 ✅'}`);

  const awaiting = project.awaitingDecision || [];
  if (awaiting.length > 0) {
    console.log(`💬 等待决策: ${awaiting.length} 项`);
    awaiting.forEach(a => console.log(`   - ${a}`));
  }

  console.log('');
  console.log('Agent 状态:');
  const agents = project.agents || {};
  const agentNames = Object.keys(agents);
  if (agentNames.length === 0) {
    console.log('  (暂无 Agent)');
  } else {
    agentNames.forEach(name => {
      const info = agents[name];
      console.log(`  ${name}: ${info.status || '?'} — ${info.task || ''}`);
    });
  }

  if (result.broken) {
    console.log('');
    console.log('⚠️  链式中断！请修复后再继续下一阶段。');
    console.log("   使用 'fairy update-agent <name> fixed' 确认修复");
    process.exit(1);
  }

  console.log('');
  console.log('✅ 门禁通过，可以继续下一阶段。');
}

/**
 * cmd_update_agent - Update agent status
 */
function cmdUpdateAgent(agentName, agentStatus, agentTask) {
  if (!agentName || !agentStatus) {
    console.error('❌ 用法: fairy update-agent <Agent名> <状态> [任务描述]');
    console.error('   例: fairy update-agent natsu running 白板插件开发');
    console.error('   状态: done | running | idle | failed | fixed');
    process.exit(1);
  }

  if (!validateStatus(agentStatus)) {
    console.error(`❌ 无效状态: '${agentStatus}'`);
    console.error('   有效状态: done | running | idle | failed | fixed');
    process.exit(1);
  }

  ensureState();
  updateAgent(FAIRY_DIR, agentName, agentStatus, agentTask || '');
  console.log(`✅ Agent "${agentName}" 状态已更新为: ${agentStatus}`);
}

/**
 * cmd_help - Show help
 */
function cmdHelp() {
  console.log(`
🧩 fairy — 智能协作白板 CLI 工具 v1.0.0

用法:
  fairy status [project]             — 显示当前项目/Agent 状态
  fairy log <message>                — 追加变更日志
  fairy lesson <topic> <detail>      — 添加经验记录
  fairy chain-check [project]        — 检查阶段门禁状态
  fairy update-agent <name> <status> [task] — 更新 Agent 状态
  fairy license [code]              — 激活/查看许可证状态
  fairy help                         — 显示此帮助

状态值:
  done       — 完成
  running    — 执行中
  idle       — 空闲
  failed     — 失败（会设置 chainBroken）
  fixed      — 已修复（清除 chainBroken）

环境变量:
  FAIRY_DIR  — 指定 .fairy 目录位置（默认: ~/.openclaw/workspace/.fairy）

示例:
  fairy status
  fairy log "纳兹 完成需求分析"
  fairy lesson API超时 "增加超时时间阈值"
  fairy chain-check
  fairy update-agent natsu running 白板插件开发
  fairy update-agent natsu done
`);
}

/**
 * cmd_license - Show or activate license
 */
function cmdLicense(code) {
  if (code) {
    // Activate license
    console.log('🔑 正在验证授权码...');
    activateLicense(code).then(result => {
      if (result.success) {
        console.log(`✅ 激活成功！`);
        console.log(`   产品: ${result.productName}`);
        console.log(`   买家: ${result.buyer}`);
      } else {
        console.log(`❌ 激活失败: ${result.error}`);
        process.exit(1);
      }
    }).catch(e => {
      console.log(`❌ 激活失败: ${e.message}`);
      process.exit(1);
    });
  } else {
    // Show license status
    const status = getLicenseStatus();
    console.log('');
    console.log('🔑 许可证状态');
    console.log('─────────────────');
    console.log(`  状态: ${status.activated ? '✅ 已激活' : '⚪ 未激活'}`);
    console.log(`  产品: ${status.productName}`);
    if (status.buyer) console.log(`  买家: ${status.buyer}`);
    if (status.activatedAt) console.log(`  激活时间: ${status.activatedAt}`);
    console.log('');
    
    if (!status.activated) {
      console.log('  可用功能: 白板 Lite (免费)');
      console.log('  升级: 获取授权码后运行 fairy license <授权码>');
      console.log('');
      console.log('  产品定价:');
      console.log('    WB-LITE  白板 Lite    ¥49');
      console.log('    WB-PRO   白板 Pro     ¥79');
      console.log('    AF       AgentForge  ¥149');
    } else {
      console.log(`  已解锁功能:`);
      status.features.forEach(f => console.log(`    ✅ ${f}`));
    }
    console.log('');
  }
}

// ============================================================
// Main routing
// ============================================================

const args = process.argv.slice(2);
const cmd = args[0] || 'help';

switch (cmd) {
  case 'status':
    cmdStatus(args[1]);
    break;
  case 'log':
    cmdLog(args.slice(1).join(' '));
    break;
  case 'lesson':
    cmdLesson(args[1], args.slice(2).join(' '));
    break;
  case 'chain-check':
    cmdChainCheck(args[1]);
    break;
  case 'update-agent':
    cmdUpdateAgent(args[1], args[2], args.slice(3).join(' '));
    break;
  case 'license':
    cmdLicense(args[1]);
    break;
  case 'help':
  case '--help':
  case '-h':
    cmdHelp();
    break;
  default:
    console.error(`❌ 未知命令: ${cmd}`);
    console.error('   使用 \'fairy help\' 查看可用命令');
    process.exit(1);
}
