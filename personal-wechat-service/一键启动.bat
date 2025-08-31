@echo off
chcp 65001 >nul
title 西羊石AI个人微信自动化服务
color 0A
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                 西羊石AI个人微信自动化服务                  ║
echo ║                 官网: https://xysaiai.cn/                 ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🔍 正在检查运行环境...

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到Node.js
    echo 💡 正在打开Node.js下载页面...
    start https://nodejs.org/
    echo.
    echo 请下载安装Node.js后重新运行本脚本
    pause
    exit /b 1
)
echo ✅ Node.js环境正常

REM 检查Python  
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到Python
    echo 💡 正在打开Python下载页面...
    start https://python.org/downloads/
    echo.
    echo 请下载安装Python后重新运行本脚本
    pause  
    exit /b 1
)
echo ✅ Python环境正常

REM 检查微信是否运行
tasklist /fi "imagename eq wechat.exe" 2>nul | find "wechat.exe" >nul
if errorlevel 1 (
    echo ⚠️  未检测到微信客户端运行
    echo 💡 请先启动并登录微信PC客户端
    echo.
    echo 按任意键继续（如果微信已在运行）...
    pause >nul
)

echo.
echo 📦 正在准备服务环境...

REM 安装Node.js依赖
if not exist "node_modules" (
    echo 正在安装Node.js依赖...
    npm install
    if errorlevel 1 (
        echo ❌ Node.js依赖安装失败
        pause
        exit /b 1
    )
)

REM 安装Python依赖
echo 正在检查Python依赖...
python -c "import wxauto" 2>nul
if errorlevel 1 (
    echo 正在安装wxauto依赖...
    pip install wxauto
    if errorlevel 1 (
        echo 尝试使用国内镜像源...
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        if errorlevel 1 (
            echo ❌ wxauto依赖安装失败
            echo 💡 请手动运行: pip install wxauto
            pause
            exit /b 1
        )
    )
)

echo.
echo 🚀 正在启动个人微信自动化服务...
echo 📌 服务地址: http://localhost:3001
echo 💡 在N8N中配置此地址即可使用
echo.
echo ────────────────────────────────────────────────────
echo 按 Ctrl+C 停止服务
echo ────────────────────────────────────────────────────
echo.

REM 启动服务
node index.js

echo.
echo 服务已停止
pause