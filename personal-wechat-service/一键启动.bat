@echo off

REM 安全的编码设置
for /f "tokens=2 delims=:" %%i in ('chcp') do set current_cp=%%i
set current_cp=%current_cp: =%
if not "%current_cp%"=="65001" (
    chcp 65001 >nul 2>&1
)

title XYS WeChat Personal Service
color 0A
cls

echo.
echo ========================================================
echo            西羊石AI 个人微信自动化服务
echo                 XYS WeChat Personal Service  
echo ========================================================
echo.
echo          官网: https://xysaiai.cn
echo          关注公众号: 西羊石AI视频
echo          技术支持: WeChat XYS AI Video
echo.
echo ========================================================
echo.

REM 确保在正确目录
cd /d "%~dp0"

echo [INFO] 检查运行环境...
echo [DEBUG] 当前目录: %CD%
echo.

REM 检查关键文件
if not exist "index.js" (
    echo [ERROR] 未找到 index.js 文件
    echo [ERROR] 请确保脚本在 personal-wechat-service 目录中运行
    echo [DEBUG] 当前路径: %CD%
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

if not exist "package.json" (
    echo [ERROR] 未找到 package.json 文件  
    echo [ERROR] 请确保脚本在 personal-wechat-service 目录中运行
    echo [DEBUG] 当前路径: %CD%
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

echo [OK] 找到必要文件: index.js, package.json

REM 检查 Node.js
echo [INFO] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] 未检测到 Node.js
    echo [ACTION] 正在为您打开 Node.js 官方下载页面...
    echo [NOTICE] 请下载并安装 Node.js，安装完成后重新运行此脚本
    echo.
    start https://nodejs.org/
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
echo [OK] Node.js 已安装: %NODE_VERSION%

REM 检查 Python
echo [INFO] 检查 Python 环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] 未检测到 Python
    echo [ACTION] 正在为您打开 Python 官方下载页面...
    echo [NOTICE] 请下载并安装 Python
    echo [IMPORTANT] 安装时请务必勾选 "Add Python to PATH" 选项
    echo.
    start https://python.org/downloads/
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%v in ('python --version') do set PYTHON_VERSION=%%v
echo [OK] Python 已安装: %PYTHON_VERSION%

REM 检查微信客户端（可选）
echo [INFO] 检查微信客户端状态...
tasklist /fi "imagename eq wechat.exe" 2>nul | find "wechat.exe" >nul
if errorlevel 1 (
    echo [NOTICE] 未检测到微信客户端运行
    echo [NOTICE] 建议启动并登录微信PC客户端以获得最佳体验
    echo [NOTICE] 服务可以正常启动，但需要微信客户端才能发送消息
) else (
    echo [OK] 微信客户端已运行
)

echo.
echo [INFO] 准备安装依赖包...

REM 检查并安装 Node.js 依赖
if not exist "node_modules" (
    echo [INFO] 首次运行，正在安装 Node.js 依赖包...
    echo [DEBUG] 执行命令: npm install
    npm install
    if errorlevel 1 (
        echo [ERROR] Node.js 依赖包安装失败
        echo [SOLUTION] 可能的解决方案:
        echo [SOLUTION]   1. 检查网络连接是否正常
        echo [SOLUTION]   2. 尝试使用国内镜像: npm config set registry https://registry.npmmirror.com
        echo [SOLUTION]   3. 手动运行: npm install
        echo.
        echo 按任意键退出...
        pause >nul
        exit /b 1
    )
    echo [OK] Node.js 依赖包安装成功
) else (
    echo [OK] Node.js 依赖包已存在，跳过安装
)

REM 检查并安装 Python 依赖 - wxauto
echo [INFO] 检查 Python 库: wxauto...
python -c "import wxauto" >nul 2>&1
if errorlevel 1 (
    echo [INFO] wxauto 库未安装，正在安装...
    echo [DEBUG] 执行命令: pip install wxauto
    pip install wxauto
    if errorlevel 1 (
        echo [INFO] 使用清华大学镜像源重试...
        echo [DEBUG] 执行命令: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        if errorlevel 1 (
            echo [ERROR] wxauto 库安装失败
            echo [SOLUTION] 手动安装命令:
            echo [SOLUTION]   pip install wxauto
            echo [SOLUTION]   或使用镜像: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
            echo.
            echo 按任意键退出...
            pause >nul
            exit /b 1
        )
    )
    echo [OK] wxauto 库安装成功
) else (
    echo [OK] wxauto 库已安装
)

REM 检查并安装 Python 依赖 - requests
echo [INFO] 检查 Python 库: requests...
python -c "import requests" >nul 2>&1
if errorlevel 1 (
    echo [INFO] requests 库未安装，正在安装...
    echo [DEBUG] 执行命令: pip install requests
    pip install requests
    if errorlevel 1 (
        echo [INFO] 使用清华大学镜像源重试...
        echo [DEBUG] 执行命令: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
        if errorlevel 1 (
            echo [ERROR] requests 库安装失败
            echo [SOLUTION] 手动安装命令:
            echo [SOLUTION]   pip install requests
            echo.
            echo 按任意键退出...
            pause >nul
            exit /b 1
        )
    )
    echo [OK] requests 库安装成功
) else (
    echo [OK] requests 库已安装
)

echo.
echo [SUCCESS] 所有依赖检查完成！

echo.
echo ========================================================
echo                    启动微信服务
echo ========================================================
echo.
echo 服务地址: http://localhost:3000
echo 健康检查: http://localhost:3000/health
echo API 文档: 请查看项目 README.md
echo.
echo 在 N8N 中配置个人微信服务地址为: http://localhost:3000
echo.
echo ========================================================
echo           按 Ctrl+C 可随时停止服务
echo ========================================================
echo.

REM 最终检查
echo [INFO] 启动服务前最终检查...
if not exist "index.js" (
    echo [ERROR] 关键文件 index.js 丢失！
    echo [ERROR] 请重新下载完整的项目文件
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

echo [INFO] 正在启动西羊石AI微信自动化服务...
echo [DEBUG] 执行命令: node index.js
echo.

REM 启动服务
node index.js

REM 服务停止后的处理
echo.
echo [INFO] 微信自动化服务已停止
echo [INFO] 感谢使用西羊石AI微信插件！
echo.
echo 如需技术支持:
echo   - 官网: https://xysaiai.cn
echo   - 公众号: 西羊石AI视频
echo.
echo 按任意键退出...
pause >nul