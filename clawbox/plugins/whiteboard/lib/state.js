#!/usr/bin/env node
/**
 * ============================================================
 * 🧩 白板核心库 — state.js
 * 智能协作白板插件 · Node.js 版核心库
 * 零 npm 依赖，纯 Node.js 内置模块
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

// Valid agent statuses
const VALID_STATUSES = ['done', 'running', 'idle', 'failed', 'fixed'];

/**
 * Get the default .fairy directory (cross-platform)
 * Priority: FAIRY_DIR env var > ~/.openclaw/workspace/.fairy
 */
function getDefaultFairyDir() {
  if (process.env.FAIRY_DIR) {
    return process.env.FAIRY_DIR;
  }
  const home = process.env.HOME || process.env.USERPROFILE || process.cwd();
  return path.join(home, '.openclaw', 'workspace', '.fairy');
}

/**
 * Ensure .fairy directory exists
 */
function ensureFairyDir(fairyDir) {
  const dir = fairyDir || getDefaultFairyDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Read state.json from a .fairy directory
 * @param {string} [fairyDir] - Optional custom .fairy directory
 * @param {string} [project] - Optional project name for project-specific .fairy
 * @returns {object} Parsed state object
 */
function readState(fairyDir, project) {
  const baseDir = fairyDir || getDefaultFairyDir();

  let targetFile;
  if (project) {
    const home = process.env.HOME || process.env.USERPROFILE || process.cwd();
    targetFile = path.join(home, '.openclaw', 'workspace', project, '.fairy', 'state.json');
    if (!fs.existsSync(targetFile)) {
      return { error: `project '${project}' not found` };
    }
  } else {
    targetFile = path.join(baseDir, 'state.json');
  }

  if (fs.existsSync(targetFile)) {
    try {
      const content = fs.readFileSync(targetFile, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      return {};
    }
  }
  return {};
}

/**
 * Merge updates into state.json and write it back
 * @param {string} fairyDir - .fairy directory
 * @param {object} updates - Top-level keys to merge into state
 * @param {string} [project] - Project name (uses currentProject from state if not provided)
 */
function writeState(fairyDir, updates, project) {
  const dir = ensureFairyDir(fairyDir);
  const stateFile = path.join(dir, 'state.json');

  // Read current state
  let state = {};
  if (fs.existsSync(stateFile)) {
    try {
      state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    } catch (e) {
      state = {};
    }
  }

  // Update timestamp
  const now = new Date();
  const timestamp = formatTimestamp(now);
  updates.updatedAt = timestamp;

  // If updates affect a project, navigate to it
  if (updates.projectUpdate) {
    const projectName = project || state.currentProject || 'my-project';
    if (!state.projects) state.projects = {};
    if (!state.projects[projectName]) {
      state.projects[projectName] = {
        name: projectName,
        phase: '需求',
        chainBroken: false,
        agents: {},
        awaitingDecision: [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }
    const projectUpdates = updates.projectUpdate;
    delete updates.projectUpdate;
    Object.assign(state.projects[projectName], projectUpdates);
  }

  // Merge top-level updates
  Object.assign(state, updates);

  // Write back
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

/**
 * Set a nested key in state using dot notation (e.g., "projects.my-project.phase")
 * @param {string} fairyDir - .fairy directory
 * @param {string} keyPath - Dot-notation path
 * @param {*} value - Value to set
 */
function setStateByPath(fairyDir, keyPath, value) {
  const dir = ensureFairyDir(fairyDir);
  const stateFile = path.join(dir, 'state.json');

  let state = {};
  if (fs.existsSync(stateFile)) {
    try {
      state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    } catch (e) {
      state = {};
    }
  }

  const keys = keyPath.split('.');
  let target = state;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in target) || typeof target[k] !== 'object') {
      target[k] = {};
    }
    target = target[k];
  }
  target[keys[keys.length - 1]] = value;

  state.updatedAt = formatTimestamp(new Date());

  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

/**
 * Append a message to the changelog
 * @param {string} fairyDir - .fairy directory
 * @param {string} message - Log message
 */
function appendChangelog(fairyDir, message) {
  const dir = ensureFairyDir(fairyDir);
  const changelogFile = path.join(dir, 'changelog.md');

  const timestamp = formatTimestamp(new Date());

  if (!fs.existsSync(changelogFile)) {
    const header = '# 变更日志\n\n| 时间 | 操作 | 说明 |\n|------|------|------|\n';
    fs.writeFileSync(changelogFile, header, 'utf-8');
  }

  const entry = `| ${timestamp} | ${message} |\n`;
  fs.appendFileSync(changelogFile, entry, 'utf-8');
}

/**
 * Append a lesson to the lessons file
 * @param {string} fairyDir - .fairy directory
 * @param {string} topic - Lesson topic
 * @param {string} detail - Lesson detail
 */
function appendLesson(fairyDir, topic, detail) {
  const dir = ensureFairyDir(fairyDir);
  const lessonsFile = path.join(dir, 'lessons.md');

  const dateStr = formatDate(new Date());

  if (!fs.existsSync(lessonsFile)) {
    fs.writeFileSync(lessonsFile, '# 🧠 经验库\n', 'utf-8');
  }

  const entry = `\n## ${dateStr} | ${topic}\n- ${detail}\n`;
  fs.appendFileSync(lessonsFile, entry, 'utf-8');
}

/**
 * Check if chain is broken for the current project
 * @param {string} fairyDir - .fairy directory
 * @returns {{ broken: boolean, state: object, projectName: string }}
 */
function checkChain(fairyDir) {
  const state = readState(fairyDir);
  const projectName = state.currentProject || 'unknown';
  let broken = false;
  let project = {};

  if (state.projects && state.projects[projectName]) {
    project = state.projects[projectName];
    broken = !!project.chainBroken;
  }

  // Display status
  const phase = project.phase || 'unknown';
  const agents = project.agents || {};
  const awaiting = project.awaitingDecision || [];

  return { broken, state, projectName, phase, agents, awaiting };
}

/**
 * Update an agent's status in state.json
 * @param {string} fairyDir - .fairy directory
 * @param {string} agentName - Agent name
 * @param {string} status - Status value
 * @param {string} [task] - Optional task description
 */
function updateAgent(fairyDir, agentName, status, task) {
  const state = readState(fairyDir);
  const projectName = state.currentProject || 'my-project';

  if (!state.projects) state.projects = {};
  if (!state.projects[projectName]) {
    state.projects[projectName] = {
      name: projectName,
      phase: '需求',
      chainBroken: false,
      agents: {},
      awaitingDecision: [],
      createdAt: formatTimestamp(new Date()),
      updatedAt: formatTimestamp(new Date())
    };
  }

  state.projects[projectName].agents[agentName] = {
    status: status,
    task: task || ''
  };

  // If agent failed, set chainBroken; if fixed, clear it
  if (status === 'failed') {
    state.projects[projectName].chainBroken = true;
  }
  if (status === 'fixed') {
    state.projects[projectName].chainBroken = false;
  }

  state.updatedAt = formatTimestamp(new Date());

  const stateFile = path.join(ensureFairyDir(fairyDir), 'state.json');
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf-8');

  return true;
}

/**
 * Validate agent status
 * @param {string} status
 * @returns {boolean}
 */
function validateStatus(status) {
  return VALID_STATUSES.includes(status);
}

/**
 * Format a Date as ISO8601 timestamp in +08:00 timezone
 */
function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  // Always use +08:00 (Asia/Makassar)
  return `${y}-${M}-${d}T${h}:${m}:${s}+08:00`;
}

/**
 * Format a Date as YYYY-MM-DD
 */
function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Export all functions
module.exports = {
  getDefaultFairyDir,
  ensureFairyDir,
  readState,
  writeState,
  setStateByPath,
  appendChangelog,
  appendLesson,
  checkChain,
  updateAgent,
  validateStatus,
  VALID_STATUSES,
  formatTimestamp,
  formatDate
};
