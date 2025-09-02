@echo off

REM Safe encoding setup
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
echo            XYS AI WeChat Automation Service
echo                 Personal WeChat Integration
echo ========================================================
echo.
echo          Website: https://xysaiai.cn
echo          WeChat: Follow "XYS AI Video" for support
echo          Tech Support: WeChat XYS AI Video
echo.
echo ========================================================
echo.

REM Ensure correct directory
cd /d "%~dp0"

echo [INFO] Checking runtime environment...
echo [DEBUG] Current directory: %CD%
echo.

REM Check essential files
if not exist "index.js" (
    echo [ERROR] index.js file not found
    echo [ERROR] Please ensure the script is running in the personal-wechat-service directory
    echo [DEBUG] Current path: %CD%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

if not exist "package.json" (
    echo [ERROR] package.json file not found  
    echo [ERROR] Please ensure the script is running in the personal-wechat-service directory
    echo [DEBUG] Current path: %CD%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [OK] Found essential files: index.js, package.json

REM Check Node.js
echo [INFO] Checking Node.js environment...
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Node.js not detected
    echo [ACTION] Opening Node.js official download page...
    echo [NOTICE] Please download and install Node.js, then restart this script
    echo.
    start https://nodejs.org/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
echo [OK] Node.js installed: %NODE_VERSION%

REM Check Python
echo [INFO] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Python not detected
    echo [ACTION] Opening Python official download page...
    echo [NOTICE] Please download and install Python
    echo [IMPORTANT] Make sure to check "Add Python to PATH" during installation
    echo.
    start https://python.org/downloads/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%v in ('python --version') do set PYTHON_VERSION=%%v
echo [OK] Python installed: %PYTHON_VERSION%

REM Check WeChat client (optional)
echo [INFO] Checking WeChat client status...
tasklist /fi "imagename eq wechat.exe" 2>nul | find "wechat.exe" >nul
if errorlevel 1 (
    echo [NOTICE] WeChat client not running
    echo [NOTICE] Recommend starting and logging into WeChat PC client for best experience
    echo [NOTICE] Service can start normally, but WeChat client is required to send messages
) else (
    echo [OK] WeChat client is running
)

echo.
echo [INFO] Preparing to install dependencies...

REM Check and install Node.js dependencies
if not exist "node_modules" (
    echo [INFO] First run detected, installing Node.js dependencies...
    echo [DEBUG] Executing: npm install
    npm install
    if errorlevel 1 (
        echo [ERROR] Node.js dependencies installation failed
        echo [SOLUTION] Possible solutions:
        echo [SOLUTION]   1. Check your network connection
        echo [SOLUTION]   2. Try using China mirror: npm config set registry https://registry.npmmirror.com
        echo [SOLUTION]   3. Run manually: npm install
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo [OK] Node.js dependencies installed successfully
) else (
    echo [OK] Node.js dependencies already exist, skipping installation
)

REM Check and install Python dependencies - wxauto
echo [INFO] Checking Python library: wxauto...
python -c "import wxauto" >nul 2>&1
if errorlevel 1 (
    echo [INFO] wxauto library not installed, installing...
    echo [DEBUG] Executing: pip install wxauto
    pip install wxauto
    if errorlevel 1 (
        echo [INFO] Retrying with Tsinghua University mirror...
        echo [DEBUG] Executing: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
        if errorlevel 1 (
            echo [ERROR] wxauto library installation failed
            echo [SOLUTION] Manual installation commands:
            echo [SOLUTION]   pip install wxauto
            echo [SOLUTION]   Or with mirror: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple wxauto
            echo.
            echo Press any key to exit...
            pause >nul
            exit /b 1
        )
    )
    echo [OK] wxauto library installed successfully
) else (
    echo [OK] wxauto library already installed
)

REM Check and install Python dependencies - requests
echo [INFO] Checking Python library: requests...
python -c "import requests" >nul 2>&1
if errorlevel 1 (
    echo [INFO] requests library not installed, installing...
    echo [DEBUG] Executing: pip install requests
    pip install requests
    if errorlevel 1 (
        echo [INFO] Retrying with Tsinghua University mirror...
        echo [DEBUG] Executing: pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
        pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
        if errorlevel 1 (
            echo [ERROR] requests library installation failed
            echo [SOLUTION] Manual installation commands:
            echo [SOLUTION]   pip install requests
            echo.
            echo Press any key to exit...
            pause >nul
            exit /b 1
        )
    )
    echo [OK] requests library installed successfully
) else (
    echo [OK] requests library already installed
)

echo.
echo [SUCCESS] All dependencies check completed!

echo.
echo ========================================================
echo                    Starting WeChat Service
echo ========================================================
echo.
echo Service URL: http://localhost:3000
echo Health Check: http://localhost:3000/health
echo API Documentation: Please check project README.md
echo.
echo Configure personal WeChat service URL in N8N: http://localhost:3000
echo.
echo ========================================================
echo           Press Ctrl+C to stop service anytime
echo ========================================================
echo.

REM Final check
echo [INFO] Final check before starting service...
if not exist "index.js" (
    echo [ERROR] Critical file index.js missing!
    echo [ERROR] Please re-download the complete project files
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [INFO] Starting XYS AI WeChat Automation Service...
echo [DEBUG] Executing: node index.js
echo.

REM Start service
node index.js

REM Handle service stop
echo.
echo [INFO] WeChat automation service has stopped
echo [INFO] Thank you for using XYS AI WeChat Plugin!
echo.
echo For technical support:
echo   - Website: https://xysaiai.cn
echo   - WeChat: Follow "XYS AI Video"
echo.
echo Press any key to exit...
pause >nul