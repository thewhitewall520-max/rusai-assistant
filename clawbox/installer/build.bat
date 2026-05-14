@echo off
REM ============================================
REM   🔥 ClawBox 安装包构建脚本
REM   用法: build.bat [版本号]
REM   默认版本: 1.0.0
REM ============================================
setlocal enabledelayedexpansion

echo ============================================
echo   🔥 ClawBox Installer Builder
echo   妖精尾巴公会 CTO — 纳兹
echo ============================================
echo.

REM 版本号
if "%~1"=="" (
    set APP_VERSION=1.0.0
) else (
    set APP_VERSION=%~1
)
echo 版本: %APP_VERSION%
echo.

REM 检查 Inno Setup 是否安装
where iscc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未找到 Inno Setup (iscc)
    echo.
    echo 请先安装 Inno Setup: https://jrsoftware.org/isdl.php
    echo 安装完成后确保 iscc.exe 在 PATH 中。
    echo.
    pause
    exit /b 1
)
echo ✅ Inno Setup 已检测
echo.

REM 确认资源文件
set RESOURCES_DIR=%~dp0resources
if not exist "%RESOURCES_DIR%" (
    echo 📁 创建资源目录...
    mkdir "%RESOURCES_DIR%"
)

REM 检查图标文件
if not exist "%RESOURCES_DIR%\clawbox.ico" (
    echo ⚠️ 未找到图标文件 (resources\clawbox.ico)
    echo 使用 Inno Setup 默认图标
)

REM 确认 Node.js portable 存在
set NODEJS_DIR=%~dp0nodejs
if not exist "%NODEJS_DIR%\node.exe" (
    echo ❌ Node.js portable 未找到: %NODEJS_DIR%
    echo 请先下载 Node.js Windows x64 便携版并解压到 %NODEJS_DIR%
    echo 下载地址: https://nodejs.org/en/download/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js portable 已检测
echo.

REM 确认白板插件存在
set WHITEBOARD_DIR=%~dp0..\plugins\whiteboard
if not exist "%WHITEBOARD_DIR%" (
    echo ⚠️ 白板 Pro 插件目录未找到: %WHITEBOARD_DIR%
    echo 构建将继续，但白板插件不会被包含。
) else (
    echo ✅ 白板 Pro 插件已检测
)

REM 确认 AgentForge zip 包
set AGENTFORGE_ZIP=%~dp0..\plugins\agentforge-v1.0.0.zip
if not exist "%AGENTFORGE_ZIP%" (
    echo ⚠️ AgentForge zip 包未找到: %AGENTFORGE_ZIP%
    echo 构建将继续，但 AgentForge 不会被包含。
) else (
    echo ✅ AgentForge zip 包已检测
)

REM 确认 scripts 目录
set SCRIPTS_DIR=%~dp0..\scripts
if not exist "%SCRIPTS_DIR%" (
    echo ❌ Scripts 目录未找到: %SCRIPTS_DIR%
    pause
    exit /b 1
)
echo ✅ 安装脚本已检测
echo.

REM 清理之前的构建输出
set OUTPUT_DIR=%~dp0output
if exist "%OUTPUT_DIR%" (
    echo 🧹 清理旧构建...
    rmdir /s /q "%OUTPUT_DIR%"
)

REM 编译 Inno Setup 脚本
echo 🔨 编译安装包...
echo.
iscc /dMyAppVersion=%APP_VERSION% "%~dp0clawbox.iss"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 构建失败！错误码: %ERRORLEVEL%
    pause
    exit /b 1
)

echo.
echo ============================================
echo   ✅ 构建成功！
echo ============================================
echo.
echo 📦 安装包已生成:
for %%f in ("%OUTPUT_DIR%\*.exe") do (
    echo   %%~nxf
    echo   大小: %%~zf 字节
)
echo.
echo 📌 输出目录: %OUTPUT_DIR%
echo.
echo 🚀 使用说明:
echo   1. 将 clawbox-setup-*.exe 分发给客户
echo   2. 客户双击即可安装（无需管理员权限）
echo   3. 安装过程中可设置 AI Agent 名字和欢迎语
echo   4. 安装完成后自动启动 Dashboard
echo.
pause
