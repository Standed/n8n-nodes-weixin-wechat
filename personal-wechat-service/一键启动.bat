@echo off
chcp 65001 >nul
title XYS WeChat Personal Service
color 0A
cls
echo.
echo    ██╗  ██╗██╗   ██╗███████╗ █████╗ ██╗
echo    ╚██╗██╔╝╚██╗ ██╔╝██╔════╝██╔══██╗██║
echo     ╚███╔╝  ╚████╔╝ ███████╗███████║██║
echo     ██╔██╗   ╚██╔╝  ╚════██║██╔══██║██║
echo    ██╔╝ ██╗   ██║   ███████║██║  ██║██║
echo    ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝
echo.
echo    ██╗    ██╗███████╗ ██████╗██╗  ██╗ █████╗ ████████╗
echo    ██║    ██║██╔════╝██╔════╝██║  ██║██╔══██╗╚══██╔══╝
echo    ██║ █╗ ██║█████╗  ██║     ███████║███████║   ██║
echo    ██║███╗██║██╔══╝  ██║     ██╔══██║██╔══██║   ██║
echo    ╚███╔███╔╝███████╗╚██████╗██║  ██║██║  ██║   ██║
echo     ╚══╝╚══╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝
echo.
echo    ███████╗███████╗██████╗ ██╗   ██╗██╗ ██████╗███████╗
echo    ██╔════╝██╔════╝██╔══██╗██║   ██║██║██╔════╝██╔════╝
echo    ███████╗█████╗  ██████╔╝██║   ██║██║██║     █████╗
echo    ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║██║     ██╔══╝
echo    ███████║███████╗██║  ██║ ╚████╔╝ ██║╚██████╗███████╗
echo    ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝ ╚═════╝╚══════╝
echo.
echo    ╔════════════════════════════════════════════════════╗
echo    ║        Personal WeChat Automation Service          ║
echo    ║            Website: https://xysaiai.cn             ║
echo    ║         Follow WeChat: XYS AI Video                ║
echo    ╚════════════════════════════════════════════════════╝
echo.

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
    echo Installing Node.js dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install Node.js dependencies
        pause
        exit /b 1
    )
)

REM Install Python dependencies
echo Checking Python dependencies...
python -c "import wxauto" 2>nul
if errorlevel 1 (
    echo Installing wxauto dependencies...
    pip install wxauto
    if errorlevel 1 (
        echo Trying with China mirror source...
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        if errorlevel 1 (
            echo [ERROR] Failed to install wxauto
            echo [FIX] Please manually run: pip install wxauto
            pause
            exit /b 1
        )
    )
)

echo.
echo    ╔═══════════════════════════════════════╗
echo    ║         SERVICE STARTING              ║
echo    ╚═══════════════════════════════════════╝
echo.
echo [INFO] Service URL: http://localhost:3001
echo [INFO] Configure this URL in your n8n node
echo.
echo ================================================
echo Press Ctrl+C to stop service
echo ================================================
echo.

REM Start service
node index.js

echo.
echo [INFO] Service stopped
pause