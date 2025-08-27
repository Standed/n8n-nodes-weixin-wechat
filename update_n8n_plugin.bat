@echo off
echo 🔄 更新n8n插件到Docker容器...

cd n8n-nodes-wechat-personal

echo 📦 构建npm包...
call npm pack

echo 📋 查找最新的包文件...
for /f %%i in ('dir /b *.tgz') do set PACKAGE_FILE=%%i
echo 找到包文件: %PACKAGE_FILE%

echo 🐳 安装到Docker n8n容器...
docker exec n8n npm install /data/devProject/n8n-nodes-wechat-personal/%PACKAGE_FILE%

echo ♻️  重启n8n容器...
docker restart n8n

echo ⏰ 等待n8n启动...
timeout /t 30

echo ✅ 插件更新完成！
echo 💡 请刷新n8n网页界面，现在应该可以看到 "Upload Local File" 选项了

pause