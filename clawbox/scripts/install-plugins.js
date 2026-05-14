/**
 * ClawBox — Install Plugins
 * 
 * 安装白板 Pro 插件 & AgentForge 插件。
 * - 复制白板目录文件到 OpenClaw 插件目录
 * - 解压 AgentForge zip 包到插件目录
 * 
 * 运行方式：
 *   node scripts/install-plugins.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function extractZip(zipPath, destDir) {
  // 策略1: 用 powershell 的 Expand-Archive (Windows 7+ 内置)
  try {
    const psCmd = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`;
    execSync(psCmd, { stdio: 'pipe' });
    return true;
  } catch (e) {
    log(`PowerShell 解压失败: ${e.message}`);
  }

  // 策略2: 用 Node.js 内置 zlib + 手动解析 ZIP (无需外部依赖)
  try {
    const zlib = require('zlib');
    const buffer = fs.readFileSync(zipPath);
    // 查找本地文件头签名 PK\x03\x04
    let i = 0;
    while (i < buffer.length - 30) {
      if (buffer[i] === 0x50 && buffer[i+1] === 0x4B && buffer[i+2] === 0x03 && buffer[i+3] === 0x04) {
        const compression = buffer.readUInt16LE(i + 8);
        const crc32 = buffer.readUInt32LE(i + 14);
        const compressedSize = buffer.readUInt32LE(i + 18);
        const uncompressedSize = buffer.readUInt32LE(i + 22);
        const fileNameLen = buffer.readUInt16LE(i + 26);
        const extraLen = buffer.readUInt16LE(i + 28);
        const fileName = buffer.slice(i + 30, i + 30 + fileNameLen).toString('utf8');
        const dataStart = i + 30 + fileNameLen + extraLen;
        // 跳过目录项
        if (fileName.endsWith('/')) {
          const fullPath = path.join(destDir, fileName);
          fs.mkdirSync(fullPath, { recursive: true });
          i = dataStart + compressedSize;
          continue;
        }
        // 确保目标目录存在
        const fullPath = path.join(destDir, fileName);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        const compressed = buffer.slice(dataStart, dataStart + compressedSize);
        if (compression === 0) {
          // 未压缩
          fs.writeFileSync(fullPath, compressed);
        } else if (compression === 8) {
          // Deflate
          const decompressed = zlib.inflateRawSync(compressed);
          fs.writeFileSync(fullPath, decompressed);
        } else {
          throw new Error(`不支持的压缩方式: ${compression}`);
        }
        i = dataStart + compressedSize;
      } else {
        i++;
      }
    }
    log('ZIP 解压完成 (Node.js 内置)');
    return true;
  } catch (e2) {
    log(`Node.js 解压失败: ${e2.message}`);
  }

  // 策略3: 记录错误日志
  log('❌ 所有解压策略均失败');
  const errorLog = path.join(CLAWBOX_HOME, 'logs', 'extract-error.log');
  try {
    fs.appendFileSync(errorLog, `[${new Date().toISOString()}] 解压失败: ${zipPath} -> ${destDir}\n`);
  } catch (e3) { /* ignore */ }
  return false;
}

const CLAWBOX_HOME = process.env.CLAWBOX_HOME || path.resolve(__dirname, '..');
const LOG_FILE = path.join(CLAWBOX_HOME, 'logs', 'install-plugins.log');
const NODE_DIR = path.join(CLAWBOX_HOME, 'nodejs');

// OpenClaw 插件目录 (npm 全局安装在 %USERPROFILE%/AppData/Roaming/npm 或 openclaw 内部)
const OPENCLAW_PLUGINS_DIR = path.join(
  process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming'),
  'openclaw',
  'plugins'
);

// ClawBox 配置目录
const CLAWBOX_CONFIG_DIR = path.join(
  process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming'),
  'clawbox'
);

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) { /* ignore */ }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  log('=== ClawBox — 插件安装开始 ===');

  // 读取 Agent 配置
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
    log(`配置读取: Agent=${agentName}, 欢迎语=${welcomeMsg}`);
  }

  // 步骤 1: 创建 OpenClaw 插件目录
  log(`📁 确保 OpenClaw 插件目录存在: ${OPENCLAW_PLUGINS_DIR}`);
  fs.mkdirSync(OPENCLAW_PLUGINS_DIR, { recursive: true });

  // 步骤 2: 安装白板 Pro 插件
  const whiteboardSrc = path.join(CLAWBOX_HOME, 'plugins', 'whiteboard');
  const whiteboardDest = path.join(OPENCLAW_PLUGINS_DIR, 'whiteboard');
  if (fs.existsSync(whiteboardSrc)) {
    log('📋 安装白板 Pro 插件...');
    copyDir(whiteboardSrc, whiteboardDest);
    log('✅ 白板 Pro 插件安装完成');
  } else {
    log('⚠️ 白板 Pro 源目录未找到，跳过');
  }

  // 步骤 3: 解压 AgentForge 插件
  const agentforgeZip = path.join(CLAWBOX_HOME, 'plugins', 'agentforge-v1.0.0.zip');
  const agentforgeDest = path.join(OPENCLAW_PLUGINS_DIR, 'agentforge');
  if (fs.existsSync(agentforgeZip)) {
    log('📦 安装 AgentForge 插件 (解压)...');
    fs.mkdirSync(agentforgeDest, { recursive: true });
    try {
      extractZip(agentforgeZip, agentforgeDest);
      log('✅ AgentForge 插件安装完成');
    } catch (err) {
      log(`❌ AgentForge 解压失败: ${err.message}`);
    }
  } else {
    log('⚠️ AgentForge zip 包未找到，跳过');
  }

  // 步骤 4: 保存 Agent 配置到 ClawBox 配置目录
  log('💾 保存 Agent 配置...');
  fs.mkdirSync(CLAWBOX_CONFIG_DIR, { recursive: true });
  const openclawConfig = {
    agentName: agentName,
    welcomeMessage: welcomeMsg,
    plugins: [
      { name: 'whiteboard', enabled: true },
      { name: 'agentforge', enabled: true },
    ],
    gateway: {
      port: 18789,
      autoStart: true,
    },
    installedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(CLAWBOX_CONFIG_DIR, 'config.json'),
    JSON.stringify(openclawConfig, null, 2)
  );
  log('✅ 配置保存完成');

  log('=== 插件安装结束 ===');
}

main().catch(err => {
  log(`❌ 未捕获错误: ${err.message}`);
  process.exit(1);
});
