@echo off
REM ============================================================
REM post-install.bat — ClawBox Post-Installation Script
REM
REM Called by Inno Setup after file extraction completes.
REM Orchestrates: install OpenClaw → install plugins → first run
REM ============================================================
SETLOCAL ENABLEDELAYEDEXPANSION

REM ── Set paths ─────────────────────────────────────────────────────────────
SET "CLAWBOX_DIR=%~dp0.."
SET "NODE_DIR=%CLAWBOX_DIR%\nodejs"

REM ── Set environment variables for child scripts ──────────────────────────
SET "CLAWBOX_AGENT_NAME=%~1"
SET "CLAWBOX_WELCOME_MSG=%~2"
SET "CLAWBOX_INSTALL_DIR=%CLAWBOX_DIR%"

REM ── Add portable Node.js to PATH ─────────────────────────────────────────
IF EXIST "%NODE_DIR%\node.exe" (
    SET "PATH=%NODE_DIR%;%PATH%"
    ECHO [post-install] Using portable Node.js from: %NODE_DIR%
) ELSE (
    ECHO [post-install] Portable Node.js not found, using system PATH
)

REM ── Verify Node.js availability ──────────────────────────────────────────
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO [post-install] ERROR: Node.js not found on PATH!
    EXIT /B 1
)

WHERE npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO [post-install] WARNING: npm not found on PATH, will try npx
)

node --version
ECHO.

REM ── Step 1: Install OpenClaw ─────────────────────────────────────────────
ECHO ============================================================
ECHO Step 1/3: Installing OpenClaw...
ECHO Agent Name: %CLAWBOX_AGENT_NAME%
ECHO ============================================================
ECHO.

CALL node "%CLAWBOX_DIR%\scripts\install-openclaw.js"
IF %ERRORLEVEL% NEQ 0 (
    ECHO [post-install] ERROR: OpenClaw installation failed!
    EXIT /B %ERRORLEVEL%
)
ECHO.

REM ── Step 2: Install Plugins ──────────────────────────────────────────────
ECHO ============================================================
ECHO Step 2/3: Installing plugins...
ECHO ============================================================
ECHO.

CALL node "%CLAWBOX_DIR%\scripts\install-plugins.js"
IF %ERRORLEVEL% NEQ 0 (
    ECHO [post-install] ERROR: Plugin installation failed!
    EXIT /B %ERRORLEVEL%
)
ECHO.

REM ── Step 3: First Run ────────────────────────────────────────────────────
ECHO ============================================================
ECHO Step 3/3: First-run setup...
ECHO ============================================================
ECHO.

CALL node "%CLAWBOX_DIR%\scripts\first-run.js"
IF %ERRORLEVEL% NEQ 0 (
    ECHO [post-install] WARNING: First-run had issues, but installation completed.
)

REM ── Done ──────────────────────────────────────────────────────────────────
ECHO.
ECHO ============================================================
ECHO ✅ ClawBox installation complete!
ECHO.
ECHO Dashboard: http://127.0.0.1:18789
ECHO Guide:     %CLAWBOX_DIR%\first-run\guide.html
ECHO ============================================================

ENDLOCAL
EXIT /B 0
