@echo off
chcp 65001 >nul
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

echo [INFO] Checking Runtime Environment...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found
    echo [ACTION] Opening Node.js download page...
    start https://nodejs.org/
    echo.
    echo Please install Node.js and run this script again
    pause
    exit /b 1
)
echo [OK] Node.js environment ready

REM Check Python  
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found
    echo [ACTION] Opening Python download page...
    start https://python.org/downloads/
    echo.
    echo Please install Python and run this script again
    pause  
    exit /b 1
)
echo [OK] Python environment ready

REM Check WeChat Process
tasklist /fi "imagename eq wechat.exe" 2>nul | find "wechat.exe" >nul
if errorlevel 1 (
    echo [WARN] WeChat client not detected
    echo [INFO] Please start and login WeChat PC client first
    echo.
    echo Press any key to continue if WeChat is running...
    pause >nul
)

echo.
echo [INFO] Preparing Service Environment...
echo.

REM Install Node.js dependencies
if not exist "node_modules" (
    echo [INFO] Installing Node.js dependencies...
    echo [DEBUG] Running: npm install
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install Node.js dependencies
        echo [DEBUG] Please check if package.json exists and network is available
        echo [DEBUG] You can try manually running: npm install
        pause
        exit /b 1
    )
    echo [OK] Node.js dependencies installed successfully
    echo.
    echo [INFO] First-time setup completed. Press any key to start service...
    pause >nul
)

REM Install Python dependencies
echo [INFO] Checking Python dependencies...

REM Check wxauto
echo [DEBUG] Testing: python -c "import wxauto"
python -c "import wxauto" 2>nul
if errorlevel 1 (
    echo [INFO] Installing wxauto dependencies...
    echo [DEBUG] Running: pip install wxauto
    pip install wxauto
    if errorlevel 1 (
        echo [INFO] Trying with China mirror source...
        echo [DEBUG] Running: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        if errorlevel 1 (
            echo [ERROR] Failed to install wxauto
            echo [DEBUG] Manual installation commands:
            echo [DEBUG]   pip install wxauto
            echo [DEBUG]   pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
            echo [DEBUG] Check Python and pip installation
            pause
            exit /b 1
        )
    )
    echo [OK] wxauto installed successfully
else
    echo [OK] wxauto already installed
)

REM Check requests
echo [DEBUG] Testing: python -c "import requests"
python -c "import requests" 2>nul
if errorlevel 1 (
    echo [INFO] Installing requests library...
    echo [DEBUG] Running: pip install requests
    pip install requests
    if errorlevel 1 (
        echo [INFO] Trying with China mirror source...
        echo [DEBUG] Running: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
        if errorlevel 1 (
            echo [ERROR] Failed to install requests
            echo [DEBUG] Manual installation commands:
            echo [DEBUG]   pip install requests
            pause
            exit /b 1
        )
    )
    echo [OK] requests installed successfully
else
    echo [OK] requests already installed
)

echo.
echo [INFO] Python dependencies setup completed. Continuing...
timeout /t 2 >nul

echo.
echo ========================================================
echo                    SERVICE STARTING
echo ========================================================
echo.
echo [INFO] Service will run on: http://localhost:3000
echo [INFO] Configure this URL in your N8N WeChat node
echo [INFO] Health check endpoint: http://localhost:3000/health
echo.
echo ========================================================
echo           Press Ctrl+C to stop service
echo ========================================================
echo.
echo [DEBUG] Starting service with command: node index.js
echo [DEBUG] If service fails to start, check:
echo [DEBUG]   1. Node.js is properly installed
echo [DEBUG]   2. index.js exists in current directory
echo [DEBUG]   3. All dependencies are installed
echo.

REM Start service
node index.js
if errorlevel 1 (
    echo.
    echo [ERROR] Service failed to start!
    echo [DEBUG] Check the error messages above
    echo [DEBUG] Common issues:
    echo [DEBUG]   - Port 3000 already in use
    echo [DEBUG]   - Missing dependencies
    echo [DEBUG]   - Node.js not properly installed
    pause
    exit /b 1
)

echo.
echo [INFO] Service stopped
pause