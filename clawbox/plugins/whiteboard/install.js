#!/usr/bin/env node
/**
 * ============================================================
 * 🧩 白板插件 — 一键安装脚本 (Node.js 版)
 * 智能协作白板插件 Lite 版 v1.0.0
 * 跨平台: macOS / Linux / Windows
 * 零 npm 依赖，纯 Node.js 内置模块
 * ============================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// ---------- Color helpers (no dependencies) ----------
const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  reset: () => '\x1b[0m'
};

// Disable colors on Windows if terminal doesn't support them
if (process.platform === 'win32' && !process.env.TERM_PROGRAM) {
  colors.red = (s) => s;
  colors.green = (s) => s;
  colors.yellow = (s) => s;
  colors.blue = (s) => s;
}

// ---------- Helpers ----------

function getHome() {
  return process.env.HOME || process.env.USERPROFILE || process.cwd();
}

function getOpenclawDir() {
  return path.join(getHome(), '.openclaw');
}

function getPluginDir() {
  // Determine the directory where this script resides
  return path.dirname(process.argv[1]) || process.cwd();
}

function isWindows() {
  return process.platform === 'win32';
}

function formatTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+08:00`;
}

// ---------- Main install ----------

console.log(colors.blue('============================================'));
console.log(colors.blue('  🧩 白板插件 — 一键安装 (Node.js 版)'));
console.log(colors.blue('============================================'));

let exitCode = 0;

try {
  // ---------- 1. Environment check ----------
  console.log('');
  console.log(colors.yellow('🔍 检测环境...'));

  const openclawDir = getOpenclawDir();
  if (fs.existsSync(openclawDir)) {
    console.log(colors.green('✅ OpenClaw 环境检测通过'));
  } else {
    console.log(colors.yellow('⚠️  未检测到 OpenClaw 环境（可手动初始化）'));
    fs.mkdirSync(openclawDir, { recursive: true });
    fs.mkdirSync(path.join(openclawDir, 'workspace'), { recursive: true });
  }

  // Check Node.js
  console.log(colors.green(`✅ Node.js 检测通过 (${process.version})`));

  // Check platform
  const platform = process.platform;
  console.log(colors.green(`✅ 平台检测通过: ${platform}`));

  // ---------- 2. Determine plugin directory ----------
  console.log('');
  console.log(colors.yellow('📂 确定安装路径...'));

  // Try to find the plugin directory relative to this script
  // In development mode (node install.js), script path is the file itself
  // In npx mode, the script is in a different location
  const scriptPath = process.argv[1];
  let pluginDir;

  if (scriptPath && fs.existsSync(scriptPath)) {
    pluginDir = path.dirname(path.dirname(scriptPath)); // go up from cli/ to whiteboard/
    // Verify we're in the right directory
    if (!fs.existsSync(path.join(pluginDir, 'lib', 'state.js'))) {
      pluginDir = path.dirname(scriptPath); // maybe we're in whiteboard/
    }
    if (!fs.existsSync(path.join(pluginDir, 'lib', 'state.js'))) {
      pluginDir = path.join(getOpenclawDir(), 'workspace', 'plugins', 'whiteboard');
    }
  } else {
    // npx mode: try to find from cwd
    const candidates = [
      path.join(process.cwd(), 'plugins', 'whiteboard'),
      path.join(process.cwd()),
      path.join(getOpenclawDir(), 'workspace', 'plugins', 'whiteboard'),
      path.join(__dirname) // should work with require.resolve
    ];
    pluginDir = candidates.find(d => fs.existsSync(path.join(d, 'lib', 'state.js')));
    if (!pluginDir) {
      pluginDir = path.join(getOpenclawDir(), 'workspace', 'plugins', 'whiteboard');
    }
  }

  console.log(colors.green(`✅ 插件目录: ${pluginDir}`));

  // ---------- 3. Create .fairy directory ----------
  console.log('');
  console.log(colors.yellow('📁 创建 .fairy 工作目录...'));

  const fairyDir = path.join(getOpenclawDir(), 'workspace', '.fairy');
  fs.mkdirSync(fairyDir, { recursive: true });

  const stateFile = path.join(fairyDir, 'state.json');
  if (fs.existsSync(stateFile)) {
    console.log(colors.yellow('⚠️  state.json 已存在，保留现有配置'));
  } else {
    console.log(colors.green('📝 写入初始 state.json...'));
    const templateFile = path.join(pluginDir, 'templates', 'state.json');
    if (fs.existsSync(templateFile)) {
      fs.copyFileSync(templateFile, stateFile);
    } else {
      const timestamp = formatTimestamp();
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
    }
  }

  // Initialize empty changelog and lessons
  const changelogFile = path.join(fairyDir, 'changelog.md');
  if (!fs.existsSync(changelogFile)) {
    fs.writeFileSync(changelogFile, '# 变更日志\n\n| 时间 | 操作 | 说明 |\n|------|------|------|\n', 'utf-8');
    console.log(colors.green('✅ changelog.md 已创建'));
  }

  const lessonsFile = path.join(fairyDir, 'lessons.md');
  if (!fs.existsSync(lessonsFile)) {
    fs.writeFileSync(lessonsFile, '# 🧠 经验库\n', 'utf-8');
    console.log(colors.green('✅ lessons.md 已创建'));
  }

  console.log(colors.green(`✅ .fairy 工作目录就绪: ${fairyDir}`));

  // ---------- 4. Install CLI tool ----------
  console.log('');
  console.log(colors.yellow('🔧 安装 CLI 工具...'));

  const cliSrc = path.join(pluginDir, 'cli', 'fairy.js');
  if (!fs.existsSync(cliSrc)) {
    console.error(colors.red(`❌ cli/fairy.js 未找到: ${cliSrc}`));
    exitCode = 1;
    process.exit(exitCode);
  }

  if (isWindows()) {
    // Windows: Create a .cmd wrapper
    const appData = process.env.APPDATA || path.join(process.env.USERPROFILE || 'C:\\', 'AppData', 'Roaming');
    const npmDir = path.join(appData, 'npm');
    const localBinDir = path.join(process.env.USERPROFILE || 'C:\\', '.local', 'bin');
    fs.mkdirSync(npmDir, { recursive: true });
    fs.mkdirSync(localBinDir, { recursive: true });

    // Install to %APPDATA%\npm\fairy.cmd
    const cmdTarget = path.join(npmDir, 'fairy.cmd');
    const fairyJsPath = path.join(pluginDir, 'cli', 'fairy.js').replace(/\\/g, '\\\\');
    const cmdContent = `@echo off
setlocal
node "${fairyJsPath}" %*
endlocal
`;
    fs.writeFileSync(cmdTarget, cmdContent, 'utf-8');
    console.log(colors.green(`✅ fairy CLI 已安装到 ${cmdTarget}`));

    // Also create a PowerShell script
    const ps1Target = path.join(localBinDir, 'fairy.ps1');
    const ps1Content = `#!/usr/bin/env pwsh
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$fairyJs = "${pluginDir.replace(/\\/g, '\\\\')}\\cli\\fairy.js"
node $fairyJs @args
`;
    fs.writeFileSync(ps1Target, ps1Content, 'utf-8');
    console.log(colors.green(`✅ fairy.ps1 已安装到 ${ps1Target}`));
  } else {
    // macOS / Linux: Install to ~/.local/bin/fairy
    const localBin = path.join(getHome(), '.local', 'bin');
    fs.mkdirSync(localBin, { recursive: true });

    const cliTarget = path.join(localBin, 'fairy');
    // Create a shell wrapper that calls the Node.js version
    const wrapperContent = `#!/bin/bash
# 🧩 fairy CLI wrapper — calls Node.js version
DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="${pluginDir}"
exec node "$SCRIPT_DIR/cli/fairy.js" "$@"
`;
    fs.writeFileSync(cliTarget, wrapperContent, 'utf-8');
    fs.chmodSync(cliTarget, 0o755);
    console.log(colors.green(`✅ fairy CLI 已安装到 ${cliTarget}`));

    // Copy lib/state.js
    const libDir = path.join(getHome(), '.local', 'lib', 'fairy');
    fs.mkdirSync(libDir, { recursive: true });
    const libSrc = path.join(pluginDir, 'lib', 'state.js');
    if (fs.existsSync(libSrc)) {
      const libTarget = path.join(libDir, 'state.js');
      fs.copyFileSync(libSrc, libTarget);
      console.log(colors.green(`✅ state.js 库已安装到 ${libTarget}`));
    }

    // Add ~/.local/bin to PATH if not already
    const shellConfigs = [
      path.join(getHome(), '.zshrc'),
      path.join(getHome(), '.bashrc'),
      path.join(getHome(), '.bash_profile'),
      path.join(getHome(), '.profile')
    ];

    let pathAdded = false;
    for (const configFile of shellConfigs) {
      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf-8');
        if (content.includes(localBin) && content.includes('PATH')) {
          pathAdded = true;
          break;
        }
      }
    }

    if (!pathAdded) {
      // Check current PATH
      const currentPath = process.env.PATH || '';
      if (!currentPath.includes(localBin)) {
        // Try to add to zshrc first
        const zshrc = path.join(getHome(), '.zshrc');
        const appendContent = `\n# 🧩 白板插件 — 添加 ~/.local/bin 到 PATH\nexport PATH="$HOME/.local/bin:$PATH"\n`;
        fs.appendFileSync(zshrc, appendContent, 'utf-8');
        console.log(colors.yellow('📝 已将 ~/.local/bin 添加到 ~/.zshrc'));
        console.log(colors.yellow('   请运行: source ~/.zshrc'));
      }
    }
  }

  // Also install the Node.js CLI directly as a shebang script
  // Make fairy.js directly executable
  if (!isWindows()) {
    fs.chmodSync(cliSrc, 0o755);
  }

  // ---------- 5. Integrate AGENTS.md ----------
  console.log('');
  console.log(colors.yellow('📝 检查 AGENTS.md 集成...'));

  const agentsMd = path.join(getOpenclawDir(), 'workspace', 'AGENTS.md');
  const integrationFile = path.join(pluginDir, 'templates', 'agents-integration.md');

  if (fs.existsSync(agentsMd)) {
    const agentsContent = fs.readFileSync(agentsMd, 'utf-8');
    if (agentsContent.includes('白板') || agentsContent.includes('fairy')) {
      console.log(colors.yellow('⚠️  AGENTS.md 似乎已包含白板配置，跳过'));
    } else {
      if (fs.existsSync(integrationFile)) {
        const integrationContent = fs.readFileSync(integrationFile, 'utf-8');
        fs.appendFileSync(agentsMd, '\n' + integrationContent + '\n', 'utf-8');
        console.log(colors.green('✅ 已追加白板使用说明到 AGENTS.md'));
      } else {
        console.log(colors.yellow('⚠️  templates/agents-integration.md 不存在，跳过'));
      }
    }
  } else {
    console.log(colors.yellow('⚠️  AGENTS.md 不存在，跳过集成'));
  }

  // ---------- 6. Self-check ----------
  console.log('');
  console.log(colors.yellow('✅ 运行安装自检...'));

  let checkFailed = 0;

  // Check .fairy directory
  if (fs.existsSync(fairyDir)) {
    console.log(colors.green('  ✅ .fairy 目录存在'));
  } else {
    console.log(colors.red('  ❌ .fairy 目录不存在'));
    checkFailed = 1;
  }

  // Check state.json
  if (fs.existsSync(stateFile)) {
    try {
      JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      console.log(colors.green('  ✅ state.json 格式正确'));
    } catch (e) {
      console.log(colors.red('  ❌ state.json 格式无效'));
      checkFailed = 1;
    }
  } else {
    console.log(colors.red('  ❌ state.json 不存在'));
    checkFailed = 1;
  }

  // Check changelog
  if (fs.existsSync(changelogFile)) {
    console.log(colors.green('  ✅ changelog.md 存在'));
  } else {
    console.log(colors.yellow('  ⚠️  changelog.md 不存在（已自动创建）'));
  }

  // Check lessons
  if (fs.existsSync(lessonsFile)) {
    console.log(colors.green('  ✅ lessons.md 存在'));
  } else {
    console.log(colors.yellow('  ⚠️  lessons.md 不存在（已自动创建）'));
  }

  // Check CLI file exists
  if (fs.existsSync(cliSrc)) {
    console.log(colors.green('  ✅ fairy.js CLI 存在'));
  } else {
    console.log(colors.red('  ❌ fairy.js CLI 不存在'));
    checkFailed = 1;
  }

  // ---------- 7. Completion ----------
  console.log('');
  console.log(colors.blue('============================================'));
  if (checkFailed === 0) {
    console.log(colors.green('  🎉 白板插件安装成功！'));
    console.log(colors.green('============================================'));
    console.log('');
    console.log(colors.yellow('📖 快速上手:'));
    console.log('');
    console.log('  # 查看当前状态');
    console.log('  node cli/fairy.js status');
    console.log('');
    console.log('  # 记录变更');
    console.log('  node cli/fairy.js log "纳兹 完成需求分析"');
    console.log('');
    console.log('  # 记录经验');
    console.log('  node cli/fairy.js lesson API超时 "增加超时时间阈值"');
    console.log('');
    console.log('  # 更新 Agent 状态');
    console.log('  node cli/fairy.js update-agent natsu running "白板插件开发"');
    console.log('');
    console.log('  # 检查阶段门禁');
    console.log('  node cli/fairy.js chain-check');
    console.log('');
    console.log('  # 查看全部命令');
    console.log('  node cli/fairy.js help');
    console.log('');
    console.log(colors.blue(`📍 数据目录: ${fairyDir}`));
    console.log(colors.blue(`📍 插件目录: ${pluginDir}`));
    console.log('');
    console.log(colors.yellow('💡 安装后如果 'fairy' 命令不可用，请:'));
    console.log('   1. 运行: source ~/.zshrc');
    console.log('   2. 或直接使用: node <插件目录>/cli/fairy.js');
    console.log('   3. Windows 用户可使用: node .\\cli\\fairy.js');
  } else {
    console.log(colors.red('  安装存在问题，请检查以上错误'));
    console.log(colors.red('============================================'));
    process.exit(1);
  }
} catch (err) {
  console.error(colors.red(`\n❌ 安装失败: ${err.message}`));
  console.error(err.stack);
  process.exit(1);
}
