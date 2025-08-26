# Docker 环境测试指南

## 🐳 在 Docker 中测试 n8n 插件

### 方法 1：使用 Volume 挂载（推荐）

#### 步骤 1：准备插件文件

```bash
# 确保插件包存在
cd E:\N8N\devProject\n8n-nodes-wechat-personal
ls -la n8n-nodes-wechat-personal-0.1.0.tgz
```

#### 步骤 2：停止现有容器并重新启动（包含挂载）

```bash
# 停止现有 n8n 容器
docker stop n8n

# 重新启动容器，挂载插件目录
docker run -d \
  --name n8n-new \
  -p 5678:5678 \
  -v "E:\N8N\devProject\n8n-nodes-wechat-personal:/plugins" \
  -e N8N_CUSTOM_EXTENSIONS="/plugins" \
  docker.n8n.io/n8nio/n8n:1.106.3
```

### 方法 2：复制到容器内部

#### 步骤 1：复制插件包到容器

```bash
# Windows PowerShell 或 CMD
docker cp "E:\N8N\devProject\n8n-nodes-wechat-personal\n8n-nodes-wechat-personal-0.1.0.tgz" n8n:/tmp/plugin.tgz
```

#### 步骤 2：在容器内安装

```bash
# 进入容器
docker exec n8n npm install -g /tmp/plugin.tgz

# 或者直接执行
docker exec n8n sh -c "npm install -g /tmp/plugin.tgz"
```

#### 步骤 3：重启容器

```bash
docker restart n8n
```

### 方法 3：使用 n8n 社区节点安装（如果已发布）

```bash
docker exec n8n npm install -g n8n-nodes-wechat-personal
docker restart n8n
```

### 方法 4：修改 Docker Compose 配置

如果你使用 docker-compose，可以这样配置：

```yaml
# docker-compose.yml
version: '3.8'
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:1.106.3
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n-nodes-wechat-personal:/plugins
    environment:
      - N8N_CUSTOM_EXTENSIONS=/plugins
    command: >
      sh -c "npm install -g /plugins/n8n-nodes-wechat-personal-0.1.0.tgz && n8n start"

volumes:
  n8n_data:
```

### 方法 5：构建自定义镜像

创建 Dockerfile：

```dockerfile
# Dockerfile.n8n-wechat
FROM docker.n8n.io/n8nio/n8n:1.106.3

USER root

# 复制插件
COPY n8n-nodes-wechat-personal-0.1.0.tgz /tmp/

# 安装插件
RUN npm install -g /tmp/n8n-nodes-wechat-personal-0.1.0.tgz

USER node

EXPOSE 5678
CMD ["n8n", "start"]
```

构建和运行：

```bash
# 构建镜像
docker build -f Dockerfile.n8n-wechat -t n8n-with-wechat .

# 运行
docker run -d -p 5678:5678 --name n8n-wechat n8n-with-wechat
```

## 🔍 验证安装

### 检查插件是否安装成功

```bash
# 检查全局安装的包
docker exec n8n npm list -g --depth=0

# 查找 wechat 相关包
docker exec n8n npm list -g | grep wechat
```

### 检查 n8n 是否识别插件

```bash
# 查看 n8n 日志
docker logs n8n

# 重启并查看启动日志
docker restart n8n && docker logs -f n8n
```

## 🐛 故障排除

### 问题 1：插件不出现在 n8n 中

```bash
# 重启容器
docker restart n8n

# 检查插件文件
docker exec n8n find /usr/local/lib/node_modules -name "*wechat*" -type d
```

### 问题 2：权限问题

```bash
# 以 root 身份安装
docker exec --user root n8n npm install -g /tmp/plugin.tgz
```

### 问题 3：路径问题

```bash
# 检查文件是否存在
docker exec n8n ls -la /tmp/

# 检查 npm 全局路径
docker exec n8n npm config get prefix
```

## 📝 快速测试命令

```bash
# 一键测试脚本
cd "E:\N8N\devProject\n8n-nodes-wechat-personal"

# 复制并安装
docker cp "./n8n-nodes-wechat-personal-0.1.0.tgz" n8n:/tmp/plugin.tgz
docker exec --user root n8n npm install -g /tmp/plugin.tgz
docker restart n8n

# 等待重启完成
timeout 30 bash -c 'until curl -s http://localhost:5678 > /dev/null; do sleep 2; done'
echo "n8n 已重启，请打开 http://localhost:5678 测试"
```

## ✅ 成功标志

插件安装成功后，你应该能够：

1. 在 n8n 中搜索到 "WeChat (Personal) Send" 节点
2. 节点配置中看到正确的选项
3. 看到微信绿色图标

## 🎯 下一步

安装成功后，按照主 README.md 设置：
1. 配置 WeChat Personal Bot API 凭据  
2. 设置 Wechaty bot 服务
3. 测试发送消息功能