/**
 * ClawBox — Install OpenClaw Gateway
 * 
 * 在 Node.js portable 环境下运行，安装 OpenClaw Gateway 到用户目录。
 * 安装流程：npx openclaw@latest --no-onboard
 * 
 * 运行方式：
 *   node scripts/install-openclaw.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLAWBOX_HOME = process.env.CLAWBOX_HOME || path.resolve(__dirname, '..');
const NODE_DIR = path.join(CLAWBOX_HOME, 'nodejs');
const NODE_EXE = path.join(NODE_DIR, 'node.exe');
const NPX_CMD = path.join(NODE_DIR, 'npx.cmd');
const LOG_FILE = path.join(CLAWBOX_HOME, 'logs', 'install-openclaw.log');

// 初始化日志目录（只调用一次）
const LOG_DIR = path.dirname(LOG_FILE);
try {
  fs.mkdirSync(LOG_DIR, { recursive: true });
} catch (e) { /* ignore */ }

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) { /* ignore */ }
}

function run(cmd, opts = {}) {
  log(`执行: ${cmd}`);
  try {
    const output = execSync(cmd, {
      cwd: CLAWBOX_HOME,
      env: {
        ...process.env,
        PATH: `${NODE_DIR};${process.env.PATH || ''}`,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      ...opts,
    });
    log(`输出: ${output.toString().trim()}`);
    return true;
  } catch (err) {
    log(`错误: ${err.message}`);
    if (err.stdout) log(`stdout: ${err.stdout.toString().trim()}`);
    if (err.stderr) log(`stderr: ${err.stderr.toString().trim()}`);
    return false;
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  log('=== ClawBox — OpenClaw Gateway 安装开始 ===');
  log(`Node.js: ${NODE_EXE}`);
  log(`工作目录: ${CLAWBOX_HOME}`);

  // 确保 Node.js portable 存在
  if (!fs.existsSync(NODE_EXE)) {
    log(`❌ Node.js portable 未找到: ${NODE_EXE}`);
    console.log('\n❌ 安装文件损坏，请重新下载安装包');
    console.log('安装失败，5秒后自动退出...');
    setTimeout(() => process.exit(1), 5000);
  }

  // 检查 Node.js 版本
  log('🔍 检查 Node.js 版本...');
  const versionCheck = run(`${NODE_EXE} -e "const v=process.versions.node;const [maj,min,patch]=v.split('.').map(Number);process.exit(maj>22||(maj===22&&min>=19)?0:1)"`, { timeout: 5000 });
  if (!versionCheck) {
    log('❌ Node.js 版本过低，需要 >= 22.19.0');
    console.log('\n❌ Node.js 版本过旧，需要 v22.19.0 以上');
    console.log('   当前版本: ' + run(`${NODE_EXE} --version`));
    console.log('   请重新下载最新版安装包');
    console.log('安装失败，5秒后自动退出...');
    setTimeout(() => process.exit(1), 5000);
  }

  // 设置 npm 中国镜像源
  log('🌐 设置 npm registry 为国内镜像...');
  run(`${NPX_CMD} npm config set registry https://registry.npmmirror.com`, { timeout: 10000 });

  // 步骤 1: 安装 OpenClaw
  console.log('⏳ 正在下载 OpenClaw，可能需要 1-3 分钟...');
  log('📦 安装 OpenClaw...');
  log('   使用 npx (首次从 npm 下载，之后缓存)');
  
  // 安装 OpenClaw（带重试）
  let npxResult = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    log(`📦 安装 OpenClaw (第 ${attempt}/3 次尝试)...`);
    npxResult = run(`${NPX_CMD} --registry https://registry.npmmirror.com openclaw@latest --no-onboard`, { timeout: 600000 });
    if (npxResult) break;
    if (attempt < 3) {
      log(`⏳ 等待 5 秒后重试...`);
      await sleep(5000);
    }
  }
  if (!npxResult) {
    log('❌ OpenClaw 安装失败。');
    console.log('\n❌ 安装失败。请检查：');
    console.log('   1. 网络连接是否正常');
    console.log('   2. 防火墙是否阻止了 npm');
    console.log('   日志文件: ' + LOG_FILE);
    console.log('安装失败，5秒后自动退出...');
    setTimeout(() => process.exit(1), 5000);
  }

  // 步骤 4: 验证
  log('🔍 验证安装...');
  run(`${NPX_CMD} openclaw --version`, { timeout: 30000 });

  log('✅ OpenClaw Gateway 安装完成');
  log('=== 安装结束 ===');
}

main().catch(err => {
  log(`❌ 未捕获错误: ${err.message}`);
  console.log('\n❌ 安装失败，请检查网络连接后重试');
  console.log('   日志文件: ' + LOG_FILE);
  console.log('安装失败，5秒后自动退出...');
  setTimeout(() => process.exit(1), 5000);
});
