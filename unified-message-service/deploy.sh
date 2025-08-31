#!/bin/bash

echo "🚀 西羊石AI微信服务 - 一键部署脚本"
echo "======================================"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker未安装"
    echo "请先安装Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查Docker是否运行
if ! docker info &> /dev/null; then
    echo "❌ 错误: Docker未启动"
    echo "请启动Docker服务后重试"
    exit 1
fi

echo "✅ Docker检查通过"

# 停止并删除已存在的容器
echo "🧹 清理旧容器..."
docker stop wechat-service 2>/dev/null
docker rm wechat-service 2>/dev/null

# 构建并启动服务
echo "🔨 构建微信服务..."
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "📋 服务信息:"
    echo "  - 服务地址: http://localhost:3000"
    echo "  - 健康检查: http://localhost:3000/health"
    echo "  - 查看日志: docker logs -f wechat-service"
    echo ""
    echo "🔧 下一步配置:"
    echo "  1. 访问 http://localhost:3000/health 确认服务正常"
    echo "  2. 在n8n中配置凭据："
    echo "     - Base URL: http://localhost:3000"
    echo "     - API Key: 关注公众号'西羊石AI视频'获取"
    echo ""
    echo "📞 技术支持: https://xysaiai.cn"
else
    echo "❌ 部署失败，请查看错误信息"
    exit 1
fi
