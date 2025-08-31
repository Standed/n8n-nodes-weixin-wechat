# 基于Node.js 18镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（仅生产环境）
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 创建日志目录
RUN mkdir -p /app/logs /app/wxauto_logs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3   CMD curl -f http://localhost:3000/health || exit 1

# 设置环境变量
ENV NODE_ENV=production

# 启动服务
CMD ["npm", "start"]
