/**
 * ClawBox — First Run Configuration
 * 
 * 安装完成后首次执行：
 * 1. 启动 OpenClaw Gateway
 * 2. 弹出浏览器 Dashboard (http://127.0.0.1:18789)
 * 3. 可选: 打开首次引导页
 * 
 * 运行方式：
 *   node scripts/first-run.js
 */

const { exec, execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLAWBOX_HOME = process.env.CLAWBOX_HOME || path.resolve(__dirname, '..');
const NODE_DIR = path.join(CLAWBOX_HOME, 'nodejs');
const NODE_EXE = path.join(NODE_DIR, 'node.exe');
const LOG_FILE = path.join(CLAWBOX_HOME, 'logs', 'first-run.log');

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) { /* ignore */ }
}

function runBackground(scriptPath) {
  log(`后台执行: node ${scriptPath}`);
  try {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: CLAWBOX_HOME,
      env: {
        ...process.env,
        PATH: `${NODE_DIR};${process.env.PATH || ''}`,
      },
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
    return child;
  } catch (err) {
    log(`启动后台进程失败: ${err.message}`);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  log('=== ClawBox — 首次运行配置开始 ===');

  const configFile = path.join(CLAWBOX_HOME, 'config', 'agent-config.txt');
  let agentName = 'AI助手';
  let welcomeMsg = '你好！我是你的 AI 助手';
  
  if (fs.existsSync(configFile)) {
    const lines = fs.readFileSync(configFile, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('AGENT_NAME=')) agentName = trimmed.substring(10).trim();
      if (trimmed.startsWith('WELCOME_MSG=')) welcomeMsg = trimmed.substring(12).trim();
    }
  }
  log(`Agent: ${agentName}, 欢迎语: ${welcomeMsg}`);

  // 步骤 1: 写入 OpenClaw 配置文件
  log('📝 写入 OpenClaw 配置文件...');
  const openclawConfigDir = path.join(process.env.USERPROFILE, '.openclaw');
  fs.mkdirSync(openclawConfigDir, { recursive: true });
  
  // 尝试加载 generate-agent-config.js 生成的 agent 配置
  const agentConfigPath = path.join(CLAWBOX_HOME, 'config', 'openclaw-config.json');
  let generatedAgents = {};
  if (fs.existsSync(agentConfigPath)) {
    try {
      const agentConfig = JSON.parse(fs.readFileSync(agentConfigPath, 'utf-8'));
      if (agentConfig.agents) {
        generatedAgents = agentConfig.agents;
        log(`📋 从主题配置加载了 ${Object.keys(generatedAgents).length} 个 Agent`);
      }
    } catch (e) {
      log(`⚠️ 无法解析 agent 配置: ${e.message}`);
    }
  }

  // 也有单页版 AGENTS / SOULs 复制过来的可能，这里不做额外处理

  const ocConfig = {
    agent: {
      name: agentName,
      welcomeMessage: welcomeMsg,
    },
    agents: generatedAgents,
    gateway: {
      port: 18789,
      host: '127.0.0.1',
    },
    plugins: {
      directory: path.join(
        process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming'),
        'openclaw',
        'plugins'
      ),
    },
    telemetry: false,
  };
  
  fs.writeFileSync(
    path.join(openclawConfigDir, 'openclaw.json'),
    JSON.stringify(ocConfig, null, 2)
  );
  log('✅ OpenClaw 配置文件已写入');

  // 复制生成的 AGENTS.md 和 SOUL.md 到 .openclaw 目录
  const configDir = path.join(CLAWBOX_HOME, 'config');
  const copyFiles = ['AGENTS.md', 'SOUL.md', '.theme.json'];
  for (const file of copyFiles) {
    const src = path.join(configDir, file);
    if (fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, path.join(openclawConfigDir, file));
        log(`📋 已复制 ${file} 到 OpenClaw 配置目录`);
      } catch (e) {
        log(`⚠️ 复制 ${file} 失败: ${e.message}`);
      }
    }
  }

  // 复制 per-agent SOUL 文件
  const agentSoulsDir = path.join(configDir, 'agents');
  if (fs.existsSync(agentSoulsDir)) {
    try {
      const agentSoulFiles = fs.readdirSync(agentSoulsDir);
      const destAgentsDir = path.join(openclawConfigDir, 'agents');
      fs.mkdirSync(destAgentsDir, { recursive: true });
      for (const file of agentSoulFiles) {
        fs.copyFileSync(path.join(agentSoulsDir, file), path.join(destAgentsDir, file));
      }
      log(`📋 已复制 ${agentSoulFiles.length} 个 Agent SOUL 文件`);
    } catch (e) {
      log(`⚠️ 复制 Agent SOUL 文件失败: ${e.message}`);
    }
  }

  // 步骤 2: 启动 OpenClaw Gateway (后台运行)
  log('🚀 启动 OpenClaw Gateway...');
  const gatewayScript = path.join(CLAWBOX_HOME, 'scripts', 'start-gateway.js');
  runBackground(gatewayScript);
  
  // 等待 Gateway 启动
  log('⏳ 等待 Gateway 启动...');
  await sleep(15000);

  // 步骤 3: 检查 Gateway 是否启动成功
  log('🔍 检查 Gateway 状态...');
  try {
    const statusCmd = `"${NODE_EXE}" -e "const http=require('http');http.get('http://127.0.0.1:18789',r=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"`;
    const result = execSync(statusCmd, { timeout: 10000, stdio: 'pipe' });
    log('✅ Gateway 正在运行');
  } catch (err) {
    log('⚠️ Gateway 未在预期时间内启动 (可能在更长时间后启动)');
  }

  // 步骤 4: 弹出 Dashboard
  log('🌐 打开 Dashboard...');
  try {
    exec('start http://127.0.0.1:18789');
  } catch (err) {
    log(`❌ 打开浏览器失败: ${err.message}`);
  }

  // 步骤 5: 打开引导页 (如果存在)
  const guideHtml = path.join(CLAWBOX_HOME, 'first-run', 'guide.html');
  if (fs.existsSync(guideHtml)) {
    try {
      exec(`start "" "${guideHtml}"`);
      log('📖 打开首次引导页');
    } catch (err) {
      log(`⚠️ 无法打开引导页: ${err.message}`);
    }
  }

  log('✅ 首次运行配置完成！');
  log(`📌 Dashboard 地址: http://127.0.0.1:18789`);
  log('=== 首次运行结束 ===');
}

main().catch(err => {
  log(`❌ 未捕获错误: ${err.message}`);
  process.exit(1);
});
