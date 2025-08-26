@echo off
echo 🤖 Wechaty Bot Service 快速设置脚本（Windows）
echo ==================================

REM 检查 Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

REM 检查 .env 文件
if not exist ".env" (
    echo 📝 创建 .env 配置文件...
    copy .env.example .env
    echo.
    echo ⚠️  请编辑 .env 文件，设置你的 PADLOCAL_TOKEN
    echo    获取地址: https://wechaty.js.org/docs/puppet-providers/padlocal
    echo.
    echo 按任意键继续，或 Ctrl+C 退出去配置 .env...
    pause
)

echo ✅ 配置检查通过
echo.
echo 🔧 构建 Docker 镜像...
docker-compose build

echo.
echo 🚀 启动服务...
docker-compose up -d

echo.
echo ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

echo.
echo 🔍 检查服务状态...
docker-compose ps

echo.
echo 📋 服务信息:
echo    本地访问: http://localhost:3000
echo    Docker访问: http://host.docker.internal:3000
echo.
echo 📱 查看登录二维码:
echo    docker-compose logs wechaty-bot
echo.
echo 🎉 设置完成！请查看日志中的二维码进行微信登录
pause