/**
 * 🔨 AgentForge — 流水线编排模块
 * 需要 AF 许可证
 */
const { hasFeature } = require('./license.js');

function checkPipelineAccess() {
  if (!hasFeature('pipeline')) {
    console.log('⛔ 流水线功能需要 AgentForge 许可证');
    return false;
  }
  return true;
}

/**
 * forge init — 一键初始化项目 + 生成 Agent
 */
function initProject(projectName) {
  if (!checkPipelineAccess()) process.exit(1);
  console.log(`🔨 初始化项目: ${projectName}`);
  // TODO: 生成 3 个 Agent 模板
  console.log('✅ 项目初始化完成');
}

/**
 * forge pipeline — 自动跑开发→测试→验收
 */
function runPipeline(task) {
  if (!checkPipelineAccess()) process.exit(1);
  console.log(`🔨 运行流水线: ${task}`);
  // TODO: 编排开发→测试→验收链
  console.log('✅ 流水线完成');
}

/**
 * forge deploy — 安全部署
 */
function safeDeploy(agentName) {
  if (!hasFeature('deploy')) {
    console.log('⛔ 部署功能需要 AgentForge 许可证');
    process.exit(1);
  }
  // TODO: 检查验收状态，通过才放行
  console.log('✅ 部署完成');
}

/**
 * forge agents — 列出已生成的 Agent
 */
function listAgents() {
  if (!checkPipelineAccess()) process.exit(1);
  // TODO: 读取 agents 目录
  console.log('🔨 生成的 Agent:');
  console.log('  (暂无，运行 forge init 创建)');
}

/**
 * forge queue — 排入任务队列
 */
function queueTask(task) {
  if (!hasFeature('task-queue')) {
    console.log('⛔ 任务队列需要 AgentForge 许可证');
    process.exit(1);
  }
  // TODO: 写入任务队列
  console.log(`📋 任务已排队: ${task}`);
}

module.exports = { initProject, runPipeline, safeDeploy, listAgents, queueTask, checkPipelineAccess };
