@echo off
chcp 65001 >nul
title XYS WeChat Personal Service - 一键自动化部署
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
echo [INFO] 🚀 开始一键自动化部署...
echo [INFO] 本脚本将自动检查并安装所需环境，全程自动化，请耐心等待
echo.

:check_winget
echo [INFO] 正在检查Windows包管理器...
where winget >nul 2>&1
if errorlevel 1 (
    echo [WARN] Windows包管理器(winget)不可用
    echo [INFO] 将使用传统安装方式
    set "AUTO_INSTALL=false"
) else (
    echo [OK] Windows包管理器可用，启用自动安装模式
    set "AUTO_INSTALL=true"
)
echo.

:check_nodejs
echo [INFO] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Node.js未安装，正在自动安装...
    if "%AUTO_INSTALL%"=="true" (
        echo [INFO] 使用winget自动安装Node.js...
        winget install OpenJS.NodeJS --accept-source-agreements --accept-package-agreements
        if errorlevel 1 (
            echo [ERROR] 自动安装失败，开始手动安装流程...
            goto manual_nodejs
        ) else (
            echo [OK] Node.js安装完成，正在验证...
            goto check_nodejs
        )
    ) else (
        goto manual_nodejs
    )
) else (
    for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
    echo [OK] Node.js已安装: %NODE_VERSION%
)
goto check_python

:manual_nodejs
echo [INFO] 正在为您打开Node.js官方下载页面...
echo [INFO] 请下载并安装Node.js，安装完成后本脚本将自动继续
start https://nodejs.org/
echo [INFO] 等待Node.js安装完成...
echo [INFO] 安装完成后请按任意键继续，脚本将自动检测...
pause >nul
goto check_nodejs

:check_python
echo [INFO] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Python未安装，正在自动安装...
    if "%AUTO_INSTALL%"=="true" (
        echo [INFO] 使用winget自动安装Python...
        winget install Python.Python.3.12 --accept-source-agreements --accept-package-agreements
        if errorlevel 1 (
            echo [ERROR] 自动安装失败，开始手动安装流程...
            goto manual_python
        ) else (
            echo [OK] Python安装完成，正在验证...
            goto check_python
        )
    ) else (
        goto manual_python
    )
) else (
    for /f "tokens=*" %%v in ('python --version') do set PYTHON_VERSION=%%v
    echo [OK] Python已安装: %PYTHON_VERSION%
)
goto check_wechat

:manual_python
echo [INFO] 正在为您打开Python官方下载页面...
echo [INFO] 请下载并安装Python，记得勾选"Add Python to PATH"
start https://python.org/downloads/
echo [INFO] 等待Python安装完成...
echo [INFO] 安装完成后请按任意键继续，脚本将自动检测...
pause >nul
goto check_python

:check_wechat
echo [INFO] 检查微信客户端状态...
tasklist /fi "imagename eq wechat.exe" 2>nul | find "wechat.exe" >nul
if errorlevel 1 (
    echo [WARN] 未检测到微信客户端运行
    echo [INFO] 请启动并登录微信PC客户端
    echo [INFO] 服务将继续启动，但需要微信客户端才能正常工作
    echo [INFO] 3秒后继续...
    timeout /t 3 >nul
) else (
    echo [OK] 微信客户端已运行
)

echo.
echo [INFO] 🔧 开始准备服务环境...
if not exist "node_modules" (
    echo [NOTICE] 检测到首次运行，将自动执行以下操作：
    echo [NOTICE]   1. 安装Node.js依赖包
    echo [NOTICE]   2. 安装Python依赖库
    echo [NOTICE]   3. 启动微信自动化服务
    echo [NOTICE] 整个过程全自动，预计耗时1-2分钟
    echo.
)

:install_nodejs_deps
echo [INFO] 安装Node.js依赖...
if not exist "node_modules" (
    echo [DEBUG] 执行: npm install
    npm install
    if errorlevel 1 (
        echo [ERROR] Node.js依赖安装失败
        echo [DEBUG] 可能的解决方案：
        echo [DEBUG]   1. 检查网络连接
        echo [DEBUG]   2. 尝试切换npm镜像: npm config set registry https://registry.npmmirror.com
        echo [DEBUG]   3. 手动运行: npm install
        echo [INFO] 5秒后退出，请解决问题后重新运行脚本...
        timeout /t 5 >nul
        exit /b 1
    )
    echo [OK] Node.js依赖安装成功
    echo [INFO] 继续安装Python依赖...
    timeout /t 2 >nul
)

:install_python_deps
echo [INFO] 检查Python依赖...

REM Check wxauto
echo [DEBUG] 检测wxauto库...
python -c "import wxauto" 2>nul
if errorlevel 1 (
    echo [INFO] 安装wxauto库...
    echo [DEBUG] 执行: pip install wxauto
    pip install wxauto
    if errorlevel 1 (
        echo [INFO] 使用清华镜像源重试...
        echo [DEBUG] 执行: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        if errorlevel 1 (
            echo [ERROR] wxauto安装失败
            echo [DEBUG] 手动安装命令：
            echo [DEBUG]   pip install wxauto
            echo [DEBUG] 或使用镜像源：
            echo [DEBUG]   pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
            echo [INFO] 5秒后退出，请解决问题后重新运行脚本...
            timeout /t 5 >nul
            exit /b 1
        )
    )
    echo [OK] wxauto安装成功
) else (
    echo [OK] wxauto已安装
)

REM Check requests
echo [DEBUG] 检测requests库...
python -c "import requests" 2>nul
if errorlevel 1 (
    echo [INFO] 安装requests库...
    echo [DEBUG] 执行: pip install requests
    pip install requests
    if errorlevel 1 (
        echo [INFO] 使用清华镜像源重试...
        echo [DEBUG] 执行: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
        if errorlevel 1 (
            echo [ERROR] requests安装失败
            echo [DEBUG] 手动安装命令: pip install requests
            echo [INFO] 5秒后退出，请解决问题后重新运行脚本...
            timeout /t 5 >nul
            exit /b 1
        )
    )
    echo [OK] requests安装成功
) else (
    echo [OK] requests已安装
)

echo.
echo [OK] Python依赖检查完成，继续启动服务...
timeout /t 2 >nul

echo.
echo ========================================================
echo                    🚀 服务启动中
echo ========================================================
echo.
echo [INFO] 服务地址: http://localhost:3000
echo [INFO] 在N8N中配置此地址以使用个人微信功能
echo [INFO] 健康检查: http://localhost:3000/health
echo.
echo ========================================================
echo           按 Ctrl+C 停止服务
echo ========================================================
echo.
echo [DEBUG] 启动命令: node index.js
echo [DEBUG] 如果服务无法启动，请检查：
echo [DEBUG]   1. Node.js和Python是否正确安装
echo [DEBUG]   2. 端口3000是否被占用
echo [DEBUG]   3. index.js文件是否存在
echo.

REM Start service
node index.js
if errorlevel 1 (
    echo.
    echo [ERROR] 服务启动失败！
    echo [DEBUG] 请检查上方的错误信息
    echo [DEBUG] 常见问题：
    echo [DEBUG]   - 端口3000已被占用
    echo [DEBUG]   - Node.js环境异常
    echo [DEBUG]   - 缺少必要文件
    echo [INFO] 5秒后退出...
    timeout /t 5 >nul
    exit /b 1
)

echo.
echo [INFO] 服务已停止
echo [INFO] 感谢使用西羊石AI个人微信自动化服务！
echo [INFO] 官网: https://xysaiai.cn