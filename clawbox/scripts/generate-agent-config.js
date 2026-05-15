#!/usr/bin/env node

/**
 * ClawBox AgentForge — Generate Agent Configuration
 *
 * Usage:
 *   node scripts/generate-agent-config.js --theme fairytail [--output ./output-dir] [--dry-run]
 *   node scripts/generate-agent-config.js --custom "纳兹,格雷,艾露莎,温蒂,米拉珍" [--output ./output-dir] [--dry-run]
 *   node scripts/generate-agent-config.js --config ./config/agent-config.txt [--output ./output-dir] [--dry-run]
 *
 * Options:
 *   --theme <name>       Use a predefined theme (fairytail, onepiece, naruto, demon-slayer)
 *   --custom <names>     Custom agent names, comma-separated (5 names required)
 *   --config <file>      Read --theme and --custom from config file (set by installer)
 *   --output <dir>       Output directory (default: current dir)
 *   --dry-run            Preview output without writing files
 *   --agent-name <name>  The human user's name (owner of the team)
 */

const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = path.resolve(__dirname);
const CLAWBOX_HOME = path.resolve(SCRIPTS_DIR, '..');
const THEMES_DIR = path.join(CLAWBOX_HOME, 'installer', 'resources', 'themes');

// ─── Argument Parsing ─────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { theme: null, custom: null, output: null, dryRun: false, agentName: '老大' };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--theme':
        opts.theme = args[++i];
        break;
      case '--custom':
        opts.custom = args[++i];
        break;
      case '--config':
        opts.configFile = args[++i];
        break;
      case '--output':
        opts.output = args[++i];
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--agent-name':
        opts.agentName = args[++i];
        break;
      default:
        console.warn(`⚠️  Unknown option: ${args[i]}`);
    }
  }

  return opts;
}

// ─── Config File Reader ─────────────────────────────────────────

function readConfigFile(configPath) {
  const content = fs.readFileSync(configPath, 'utf-8');
  const lines = content.split('\n');
  const config = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('THEME=')) config.theme = trimmed.substring(6).trim();
    if (trimmed.startsWith('CUSTOM_NAMES=')) config.custom = trimmed.substring(13).trim();
    if (trimmed.startsWith('AGENT_NAME=')) config.agentName = trimmed.substring(10).trim();
    if (trimmed.startsWith('WELCOME_MSG=')) config.welcomeMsg = trimmed.substring(12).trim();
  }

  return config;
}

// ─── Template Engine (simple string replacement) ────────────────

function renderTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    // Handle nested keys like agents.0.displayName
    const placeholder = new RegExp(`\\\{\\\{${escapeRegExp(key)}\\\}\\\}`, 'g');
    result = result.replace(placeholder, value != null ? String(value) : '');
  }
  return result;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderObject(obj, vars) {
  if (typeof obj === 'string') {
    return renderTemplate(obj, vars);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => renderObject(item, vars));
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = renderObject(value, vars);
    }
    return result;
  }
  return obj;
}

// ─── Theme / Custom Data ────────────────────────────────────────

function loadThemeData(themeName) {
  const themeDir = path.join(THEMES_DIR, themeName);
  if (!fs.existsSync(themeDir)) {
    console.error(`❌ Theme not found: ${themeName}`);
    console.error(`   Available themes: ${getAvailableThemes().join(', ')}`);
    process.exit(1);
  }

  const agentsJson = JSON.parse(fs.readFileSync(path.join(themeDir, 'agents.json'), 'utf-8'));
  return agentsJson;
}

function applyCustomNames(themeData, customNames) {
  const names = customNames.split(',').map(s => s.trim());

  if (names.length !== 5) {
    console.error(`❌ Custom mode requires exactly 5 agent names, got ${names.length}`);
    console.error(`   Provided: ${customNames}`);
    process.exit(1);
  }

  const updated = JSON.parse(JSON.stringify(themeData)); // deep clone
  for (let i = 0; i < 5; i++) {
    updated.agents[i].name = names[i];
    updated.agents[i].displayName = names[i];
  }
  return updated;
}

function getAvailableThemes() {
  try {
    return fs.readdirSync(THEMES_DIR).filter(f => {
      const stat = fs.statSync(path.join(THEMES_DIR, f));
      return stat.isDirectory() && f !== '.DS_Store';
    });
  } catch {
    return [];
  }
}

// ─── Template Loading ───────────────────────────────────────────

function loadThemeTemplates(themeName) {
  const themeDir = path.join(THEMES_DIR, themeName);
  const files = {};

  for (const file of ['AGENTS.md.tpl', 'SOUL.md.tpl']) {
    const filePath = path.join(themeDir, file);
    if (fs.existsSync(filePath)) {
      files[file] = fs.readFileSync(filePath, 'utf-8');
    } else {
      console.warn(`⚠️  Template ${file} not found in theme ${themeName}`);
      files[file] = '';
    }
  }

  return files;
}

// ─── Variable Builder ───────────────────────────────────────────

function buildRenderVars(themeData, agentName, customNames) {
  const agents = customNames
    ? themeData.agents.map((a, i) => {
        const name = customNames.split(',')[i].trim();
        return { ...a, name, displayName: name };
      })
    : themeData.agents;

  const vars = {
    team_name: themeData.name,
    agent_name: agentName || '老大',
    agents: agents,
  };

  // Flat vars for simple template replacement
  const flatVars = {};
  flatVars['team_name'] = themeData.name;
  flatVars['agent_name'] = agentName || '老大';

  for (let i = 0; i < agents.length; i++) {
    for (const [key, value] of Object.entries(agents[i])) {
      flatVars[`agents.${i}.${key}`] = String(value);
    }
  }

  return { agents, vars, flatVars };
}

// ─── Configuration Generation ───────────────────────────────────

function generateOpenclawConfig(agents, agentName) {
  const agentConfigs = {};

  for (const agent of agents) {
    agentConfigs[agent.name] = {
      name: agent.displayName,
      role: agent.role,
      emoji: agent.emoji,
      tagline: agent.tagline,
      model: agent.model || 'qwen2.5:7b',
      tools: agent.tools || [],
      identity: `你是${agent.displayName}，${agent.tagline}。`,
    };
  }

  return {
    agents: agentConfigs,
  };
}

// ─── Default Theme Fallback ─────────────────────────────────────

function getDefaultThemeData() {
  // If no theme is available, create a minimal default
  return {
    theme: 'default',
    name: 'AI 团队',
    emoji: '🤖',
    agents: [
      { name: '开发', displayName: '开发', role: '开发', emoji: '💻', tagline: '开发 Agent', model: 'qwen2.5:7b', tools: ['coding', 'fs', 'exec'], welcome: '开始开发！' },
      { name: '测试', displayName: '测试', role: '测试', emoji: '🔍', tagline: '测试 Agent', model: 'qwen2.5:7b', tools: ['fs', 'messaging', 'exec'], welcome: '开始测试！' },
      { name: '验收', displayName: '验收', role: '验收', emoji: '✅', tagline: '验收 Agent', model: 'deepseek/deepseek-v4-flash', tools: ['read'], welcome: '开始验收！' },
      { name: '安全', displayName: '安全', role: '安全审查', emoji: '🛡️', tagline: '安全审查 Agent', model: 'qwen2.5:7b', tools: ['read', 'fs'], welcome: '开始安全审查！' },
      { name: '部署', displayName: '部署', role: '部署', emoji: '🚀', tagline: '部署 Agent', model: 'deepseek/deepseek-v4-flash', tools: ['exec', 'fs', 'messaging'], welcome: '准备部署！' },
    ],
  };
}

// ─── Main Logic ─────────────────────────────────────────────────

function main() {
  const opts = parseArgs();
  const outputDir = opts.output ? path.resolve(opts.output) : process.cwd();

  // Read config file if provided
  if (opts.configFile) {
    const config = readConfigFile(opts.configFile);
    if (config.theme) opts.theme = config.theme;
    if (config.custom) opts.custom = config.custom;
    if (config.agentName) opts.agentName = config.agentName;
  }

  // Build theme data
  let themeData;
  let themeName;

  if (opts.custom) {
    // Use fairytail as base for custom, then override names
    themeData = loadThemeData('fairytail');
    themeName = 'custom';
    themeData.name = '自定义团队';
    themeData.emoji = '✏️';
    themeData = applyCustomNames(themeData, opts.custom);
  } else if (opts.theme) {
    themeName = opts.theme;
    themeData = loadThemeData(opts.theme);
  } else {
    // Default: fairytail
    themeName = 'fairytail';
    themeData = loadThemeData('fairytail');
  }

  // Load templates from fairytail as base (custom uses fairytail)
  const templateTheme = opts.custom ? 'fairytail' : themeName;
  const templates = loadThemeTemplates(templateTheme);

  // Build render variables
  const { agents, flatVars } = buildRenderVars(
    themeData,
    opts.agentName,
    opts.custom || null
  );

  // ── Generate Output ──

  // 1. openclaw.json agents section
  const ocConfig = generateOpenclawConfig(agents, opts.agentName);
  const ocConfigJson = JSON.stringify(ocConfig, null, 2);

  // 2. AGENTS.md
  const agentsMd = renderTemplate(templates['AGENTS.md.tpl'], flatVars);

  // 3. SOUL.md
  const soulMd = renderTemplate(templates['SOUL.md.tpl'], flatVars);

  // 4. Per-agent SOUL.md
  const agentSouls = agents.map((agent, index) => {
    return {
      name: agent.displayName,
      filename: `SOUL-${agent.name}.md`,
      content: `# SOUL.md - ${agent.displayName} · ${themeData.name} Team

**角色:** ${agent.displayName} — ${agent.role}
**代号:** ${agent.emoji}
**身份:** ${agent.tagline}

> 本文件由 ClawBox AgentForge 主题系统自动生成。

- 角色: ${agent.role}
- 模型: ${agent.model || 'qwen2.5:7b'}
- 工具: ${(agent.tools || []).join(', ')}
- 欢迎语: ${agent.welcome || `你好！我是${agent.displayName}。`}

**🔴 铁则:** ${agent.role === '验收' ? '只读权限，不执行代码。严格按照测试报告做判断。' :
  agent.role === '开发' ? '不自我验收，完成开发后交由测试和验收团队。' :
  agent.role === '测试' ? '不跳过验收环节，测试结果提交给验收 Agent。' :
  agent.role === '安全审查' ? '不决定部署与否，只给出安全建议。' :
  '不参与开发或测试，只负责上线部署。'}
`,
    };
  });

  // ── Output ──

  if (opts.dryRun) {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🔍 DRY RUN — Preview Only (no files written)');
    console.log(`   Theme: ${themeName} (${themeData.name})`);
    console.log(`   Agent Name: ${opts.agentName}`);
    console.log(`   Output Dir: ${outputDir}`);
    console.log('═══════════════════════════════════════════════\n');

    console.log('📋 Team Roster:');
    console.log('─────────────────');
    agents.forEach((a, i) => {
      console.log(`  ${a.emoji} ${a.displayName} → ${a.role} (${a.model})`);
    });

    console.log('\n📄 Generated Files:');
    console.log('────────────────────');
    console.log(`  1. openclaw.json (agents section)`);
    console.log(ocConfigJson.substring(0, 1000) + '...');
    console.log(`\n  2. AGENTS.md (${agentsMd.length} bytes)`);
    console.log(agentsMd.substring(0, 500) + '...');
    console.log(`\n  3. SOUL.md (${soulMd.length} bytes)`);
    console.log(soulMd.substring(0, 500) + '...');
    console.log(`\n  4. Per-agent SOULs:`);
    agentSouls.forEach(s => console.log(`     - ${s.filename} (${s.content.length} bytes)`));
    console.log('\n✅ DRY RUN Complete — no files written.');
    return;
  }

  // ── Write Files ──

  // Ensure output directory has subdirs
  const agentConfDir = path.join(outputDir, 'agents');
  fs.mkdirSync(agentConfDir, { recursive: true });

  // Write openclaw.json fragment
  const ocPath = path.join(outputDir, 'openclaw-config.json');
  fs.writeFileSync(ocPath, ocConfigJson);
  console.log(`✅ Written: ${ocPath}`);

  // Write AGENTS.md
  const agentsMdPath = path.join(outputDir, 'AGENTS.md');
  fs.writeFileSync(agentsMdPath, agentsMd);
  console.log(`✅ Written: ${agentsMdPath}`);

  // Write SOUL.md (combined)
  const soulMdPath = path.join(outputDir, 'SOUL.md');
  fs.writeFileSync(soulMdPath, soulMd);
  console.log(`✅ Written: ${soulMdPath}`);

  // Write per-agent SOUL files
  for (const soul of agentSouls) {
    const soulPath = path.join(agentConfDir, soul.filename);
    fs.writeFileSync(soulPath, soul.content);
    console.log(`✅ Written: ${soulPath}`);
  }

  // Write theme metadata
  const metaPath = path.join(outputDir, '.theme.json');
  const meta = {
    theme: themeName,
    themeName: themeData.name,
    agentName: opts.agentName,
    generatedAt: new Date().toISOString(),
    agents: agents.map(a => ({ name: a.name, displayName: a.displayName, role: a.role, emoji: a.emoji })),
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`✅ Written: ${metaPath}`);

  console.log(`\n🎉 AgentForge 团队配置生成完成！`);
  console.log(`   Theme: ${themeName} (${themeData.name})`);
  console.log(`   Agents: ${agents.map(a => a.emoji + a.displayName).join(' ')}`);
}

// ─── Run ────────────────────────────────────────────────────────

main();
