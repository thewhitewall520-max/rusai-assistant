@echo off
REM 🧩 智能协作白板 — Windows 快速安装
REM 双击这个文件就能安装白板插件
REM 需要先安装 Node.js (https://nodejs.org)

echo ============================================
echo   🧩 智能协作白板插件 — Windows 安装
echo ============================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未检测到 Node.js
    echo.
    echo 请先安装 Node.js: https://nodejs.org
    echo 安装完成后重新双击这个文件。
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已检测
echo.

REM 运行 Node.js 安装器
node "%~dp0install.js"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 安装完成！
    echo.
    echo 接下来可以用 fairy 命令管理你的白板了。
    echo.
) else (
    echo.
    echo ❌ 安装遇到问题，请查看上方错误信息
    echo.
)

pause
