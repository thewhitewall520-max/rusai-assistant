/**
 * ClawBox — Start Gateway (开机自启用)
 * 
 * 作为 Windows 开机自启项执行，启动 OpenClaw Gateway。
 * registry: HKCU\...\Run\ClawBoxGateway
 * 
 * 运行方式：
 *   node scripts/start-gateway.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLAWBOX_HOME = path.resolve(__dirname, '..');
const NODE_DIR = path.join(CLAWBOX_HOME, 'nodejs');
const NODE_EXE = path.join(NODE_DIR, 'node.exe');
const NPX_CMD = path.join(NODE_DIR, 'npx.cmd');
const LOG_FILE = path.join(CLAWBOX_HOME, 'logs', 'start-gateway.log');
const PID_FILE = path.join(CLAWBOX_HOME, 'data', 'gateway.pid');

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) { /* ignore */ }
}

log('=== ClawBox Gateway 启动 ===');

// 后台启动 Gateway
const child = spawn(NODE_EXE, [NPX_CMD, 'openclaw', 'gateway', 'start', '--port', '18789'], {
  cwd: CLAWBOX_HOME,
  env: {
    ...process.env,
    PATH: `${NODE_DIR};${process.env.PATH || ''}`,
  },
  stdio: 'ignore',
  detached: true,
});

child.unref();
log(`Gateway 进程已启动 (PID: ${child.pid})`);

// 保存 PID
try {
  fs.mkdirSync(path.join(CLAWBOX_HOME, 'data'), { recursive: true });
  fs.writeFileSync(PID_FILE, String(child.pid));
} catch (e) { /* ignore */ }

log('=== Gateway 启动完成 ===');
