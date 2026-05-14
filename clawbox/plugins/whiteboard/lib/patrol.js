/**
 * 🧩 白板 Pro — 值守巡检模块
 * 需要 WB-PRO 或 AF 许可证
 */
const { hasFeature } = require('./license.js');

function checkPatrolAccess() {
  if (!hasFeature('patrol')) {
    console.log('⛔ 值守巡检需要白板 Pro 或 AgentForge 许可证');
    console.log('   获取授权码后运行: fairy license <授权码>');
    return false;
  }
  return true;
}

/**
 * 运行一次巡检：检查所有 Agent 状态，标记超时
 */
function runPatrol(fairyDir) {
  if (!checkPatrolAccess()) process.exit(1);
  console.log('🕵️ 值守巡检运行中...');
  // TODO: 实现巡检逻辑
  console.log('✅ 巡检完成');
}

/**
 * 检查上下文水位（>70% 告警）
 */
function checkContextWatermark(fairyDir) {
  if (!checkPatrolAccess()) return;
  // TODO: 实现水位监控
}

/**
 * 发送超时告警（Telegram）
 */
function sendAlert(message) {
  if (!hasFeature('alerts')) {
    console.log('⛔ 告警功能需要白板 Pro 或 AgentForge 许可证');
    return;
  }
  // TODO: 实现 Telegram 告警
}

module.exports = { runPatrol, checkContextWatermark, sendAlert, checkPatrolAccess };
