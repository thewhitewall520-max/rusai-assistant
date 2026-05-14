@echo off
REM 🧩 fairy — 智能协作白板 CLI
REM Windows 批处理封装，fairy 命令指向 Node.js 版本
node "%~dp0cli\fairy.js" %*
