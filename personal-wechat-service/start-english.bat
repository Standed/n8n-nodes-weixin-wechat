@echo off
chcp 65001 >nul
title WeChat Personal Service
color 0A
cls
echo.
echo ========================================
echo    WeChat Personal Automation Service
echo    Website: https://xysaiai.cn
echo ========================================
echo.

echo [INFO] Checking Runtime Environment...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found
    echo [ACTION] Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js environment ready

REM Check Python  
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found
    echo [ACTION] Please install Python from https://python.org/downloads/
    pause  
    exit /b 1
)
echo [OK] Python environment ready

echo.
echo [INFO] Installing Dependencies...
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
            pause
            exit /b 1
        )
    )
)

echo.
echo ==========================================
echo [INFO] Service URL: http://localhost:3000
echo [INFO] Health check: http://localhost:3000/health
echo [INFO] Configure this URL in your n8n node
echo ==========================================
echo.
echo Press Ctrl+C to stop service
echo.

REM Start service
node index.js

echo.
echo [INFO] Service stopped
pause