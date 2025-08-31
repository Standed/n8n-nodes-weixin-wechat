#!/bin/bash

echo ""
echo "============================================"
echo "  西羊石AI个人微信自动化服务启动器"
echo "  官网: https://xysaiai.cn/"
echo "============================================"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到Node.js，请先安装Node.js"
    echo "💡 下载地址: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js已安装"
echo ""

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

echo "🚀 启动个人微信自动化服务..."
echo ""
node index.js