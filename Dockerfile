# 基于官方n8n镜像
FROM docker.n8n.io/n8nio/n8n

# 切换到node用户
USER node

# 复制插件文件
COPY n8n-nodes-wechat-personal/n8n-nodes-wechat-personal-0.1.1.tgz /tmp/plugin.tgz

# 安装插件
RUN npm install /tmp/plugin.tgz

# 清理临时文件
RUN rm /tmp/plugin.tgz

# 暴露端口
EXPOSE 5678