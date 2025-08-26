#!/bin/bash

echo "🤖 Wechaty Bot Service 快速设置脚本"
echo "=================================="

# 创建脚本目录
mkdir -p scripts

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "📝 创建 .env 配置文件..."
    cp .env.example .env
    echo ""
    echo "⚠️  请编辑 .env 文件，设置你的 PADLOCAL_TOKEN"
    echo "   获取地址: https://wechaty.js.org/docs/puppet-providers/padlocal"
    echo ""
    echo "按回车键继续，或 Ctrl+C 退出去配置 .env..."
    read -r
fi

# 读取配置
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 检查必要配置
if [ -z "$PADLOCAL_TOKEN" ] || [ "$PADLOCAL_TOKEN" = "puppet_padlocal_your_token_here" ]; then
    echo "❌ 请在 .env 文件中配置正确的 PADLOCAL_TOKEN"
    exit 1
fi

echo "✅ 配置检查通过"
echo ""
echo "🔧 构建 Docker 镜像..."
docker-compose build

echo ""
echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 5

echo ""
echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "📋 服务信息:"
echo "   本地访问: http://localhost:3000"
echo "   Docker访问: http://host.docker.internal:3000"
echo "   API Key: $API_KEY"
echo ""
echo "📱 查看登录二维码:"
echo "   docker-compose logs wechaty-bot"
echo ""
echo "🎉 设置完成！请查看日志中的二维码进行微信登录"