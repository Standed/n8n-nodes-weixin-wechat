@echo off
echo.
echo ============================================
echo   西羊石AI个人微信自动化服务启动器
echo   官网: https://xysaiai.cn/
echo ============================================
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装Node.js
    echo 💡 下载地址: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js已安装
echo.

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    npm install
    echo.
)

echo 🚀 启动个人微信自动化服务...
echo.
node index.js

pause