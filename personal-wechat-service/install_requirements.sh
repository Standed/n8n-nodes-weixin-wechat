#!/bin/bash

echo ""
echo "====================================="
echo "  西羊石AI - 个人微信自动化环境安装"
echo "====================================="
echo ""

echo "🔍 检查Python环境..."
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python未安装或未添加到系统PATH"
    echo "💡 请先安装Python3:"
    echo "   Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "   CentOS/RHEL: sudo yum install python3 python3-pip"
    echo "   macOS: brew install python3"
    echo "📖 安装教程: https://xysaiai.cn/docs/python-install"
    exit 1
fi

# 优先使用python3
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
else
    PYTHON_CMD="python"
    PIP_CMD="pip"
fi

echo "✅ Python环境正常"
$PYTHON_CMD --version

echo ""
echo "⚠️  重要提示:"
echo "wxauto目前主要支持Windows平台的微信客户端"
echo "Mac/Linux用户请注意兼容性问题"
echo ""
echo "📦 安装wxauto依赖库..."
echo "$PIP_CMD install wxauto"
$PIP_CMD install wxauto

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ wxauto安装失败，尝试使用国内镜像源..."
    echo "$PIP_CMD install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto"
    $PIP_CMD install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ 安装仍然失败，请手动安装："
        echo "$PIP_CMD install wxauto"
        echo ""
        echo "或访问官网获取帮助: https://xysaiai.cn/"
        exit 1
    fi
fi

echo ""
echo "✅ 依赖安装完成！"
echo ""
echo "📋 环境配置清单："
echo "✅ Python环境"
echo "✅ wxauto库"
echo ""
echo "🚀 接下来的步骤："
echo "1. 确保PC微信客户端已启动并登录"
echo "2. 运行 ./start.sh 启动服务"
echo "3. 在N8N中配置个人微信服务地址"
echo ""
echo "⚠️  Mac/Linux兼容性说明："
echo "wxauto主要支持Windows，Mac用户可能需要其他方案"
echo "详见文档: https://xysaiai.cn/docs/mac-compatibility"
echo ""
echo "🔗 技术支持: https://xysaiai.cn/"
echo "📱 关注公众号\"西羊石AI视频\"获取帮助"
echo ""