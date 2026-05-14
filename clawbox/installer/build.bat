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
set ISCC_EXE=
where iscc >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set ISCC_EXE=iscc
) else if exist "%PROGRAMFILES%\Inno Setup 6\ISCC.exe" (
    set ISCC_EXE="%PROGRAMFILES%\Inno Setup 6\ISCC.exe"
) else if exist "%PROGRAMFILES(X86)%\Inno Setup 6\ISCC.exe" (
    set ISCC_EXE="%PROGRAMFILES(X86)%\Inno Setup 6\ISCC.exe"
) else (
    echo ❌ 未找到 Inno Setup (iscc)
    echo.
    echo 请先安装 Inno Setup: https://jrsoftware.org/isdl.php
    echo.
    if "%GITHUB_ACTIONS%"=="" pause
    exit /b 1
)
echo ✅ Inno Setup 已检测 (%ISCC_EXE%)
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

REM ── 确保 Node.js portable 存在（自动下载） ──────────────
set NODEJS_DIR=%~dp0nodejs
set NODE_VERSION=v22.19.0
set NODE_MIRROR=https://npmmirror.com/mirrors/node

if not exist "%NODEJS_DIR%\node.exe" (
    echo 📥 正在从中国镜像下载 Node.js %NODE_VERSION%...
    
    if not exist "%NODEJS_DIR%" mkdir "%NODEJS_DIR%"
    set NODE_ZIP=%TEMP%\node-%NODE_VERSION%-win-x64.zip
    
    powershell -Command "$wc=New-Object Net.WebClient; Write-Host '⏳ 下载中 (约50MB)...'; $wc.DownloadFile('%NODE_MIRROR%/%NODE_VERSION%/node-%NODE_VERSION%-win-x64.zip', '%NODE_ZIP%')"
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 下载失败，请检查网络
        if "%GITHUB_ACTIONS%"=="" pause
        exit /b 1
    )
    echo 📦 解压中...
    powershell -Command "Expand-Archive -Path '%NODE_ZIP%' -DestinationPath '%TEMP%\node-extract' -Force"
    xcopy /E /Y /Q "%TEMP%\node-extract\node-%NODE_VERSION%-win-x64\*" "%NODEJS_DIR%\" >nul
    del /Q "%NODE_ZIP%" 2>nul & rmdir /S /Q "%TEMP%\node-extract" 2>nul
)
echo ✅ Node.js portable 已检测 (%NODEJS_DIR%\node.exe)
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
    if "%GITHUB_ACTIONS%"=="" pause
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
%ISCC_EXE% /dMyAppVersion=%APP_VERSION% "%~dp0clawbox.iss"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 构建失败！错误码: %ERRORLEVEL%
    if "%GITHUB_ACTIONS%"=="" pause
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
echo   2. 单文件安装包，客户双击即可安装（无需管理员权限）
echo   3. 安装过程中可设置 AI Agent 名字和欢迎语
echo   4. 安装完成后自动启动 Dashboard
echo.
if "%GITHUB_ACTIONS%"=="" pause
