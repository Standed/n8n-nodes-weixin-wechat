@echo off
chcp 65001 >nul
echo.
echo =====================================
echo   西羊石AI - 个人微信自动化环境安装
echo =====================================
echo.

echo 🔍 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装或未添加到系统PATH
    echo 💡 请先安装Python: https://python.org/downloads/
    echo 📖 安装教程: https://xysaiai.cn/docs/python-install
    pause
    exit /b 1
)

echo ✅ Python环境正常
python --version

echo.
echo 📦 安装wxauto依赖库...
echo pip install wxauto
pip install wxauto

if errorlevel 1 (
    echo.
    echo ❌ wxauto安装失败，尝试使用国内镜像源...
    echo pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
    pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
    
    if errorlevel 1 (
        echo.
        echo ❌ 安装仍然失败，请手动安装：
        echo pip install wxauto
        echo.
        echo 或访问官网获取帮助: https://xysaiai.cn/
        pause
        exit /b 1
    )
)

echo.
echo ✅ 依赖安装完成！
echo.
echo 📋 环境配置清单：
echo ✅ Python环境
echo ✅ wxauto库
echo.
echo 🚀 接下来的步骤：
echo 1. 确保PC微信客户端已启动并登录
echo 2. 运行 start.bat 启动服务
echo 3. 在N8N中配置个人微信服务地址
echo.
echo 🔗 技术支持: https://xysaiai.cn/
echo 📱 关注公众号"西羊石AI视频"获取帮助
echo.
pause