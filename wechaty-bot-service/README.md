# Wechaty Bot Service for n8n

基于 Wechaty + PadLocal 的微信 Bot 服务，专为 n8n 集成设计，支持真实微信消息发送。

## 🚀 快速开始

### 1. 获取 PadLocal Token

1. 访问 [PadLocal 官网](https://wechaty.js.org/docs/puppet-providers/padlocal)
2. 注册账号并获取 Token
3. **免费试用7天**，之后需要付费（成本较低，适合推广）

### 2. 配置环境

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置
# 设置你的 PadLocal Token 和 API Key
```

`.env` 文件内容：
```env
PADLOCAL_TOKEN=puppet_padlocal_你的令牌
API_KEY=wechaty-n8n-key-2024
PORT=3000
```

### 3. 本地运行

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 或开发模式
npm run dev
```

### 4. Docker 运行（推荐）

```bash
# 使用 docker-compose
docker-compose up -d

# 或手动构建
docker build -t wechaty-bot-service .
docker run -d -p 3000:3000 --env-file .env wechaty-bot-service
```

## 📱 微信登录

1. 启动服务后，查看控制台输出
2. 会显示二维码链接，类似：
   ```
   📱 扫码登录状态: 2
   🔗 扫码链接: https://wechaty.js.org/qrcode/xxxxx
   ```
3. 用微信扫描二维码完成登录
4. 登录成功后会显示：`✅ 登录成功: 你的微信名`

## 🔧 API 接口

### 认证
所有接口需要在 Header 中包含 API Key：
```
x-api-key: wechaty-n8n-key-2024
```

### 接口列表

#### 1. 健康检查
```bash
GET /health
```
返回：
```json
{
  "status": "ok",
  "loggedIn": true,
  "message": "微信已登录，Bot服务正常",
  "botName": "你的微信名",
  "contacts": 156,
  "rooms": 23
}
```

#### 2. 获取联系人列表
```bash
GET /contacts
```
返回：
```json
[
  {
    "id": "contact_id_123",
    "name": "张三",
    "alias": "小张"
  }
]
```

#### 3. 获取群组列表
```bash
GET /rooms
```
返回：
```json
[
  {
    "id": "room_id_456",
    "topic": "工作群",
    "memberCount": 15
  }
]
```

#### 4. 发送文本消息
```bash
POST /send/text
Content-Type: application/json

{
  "toType": "filehelper",  // contact, room, filehelper
  "toId": "",              // 联系人或群组ID，filehelper时为空
  "text": "Hello from n8n!"
}
```

#### 5. 发送文件
```bash
POST /send/file
Content-Type: application/json

{
  "toType": "contact",
  "toId": "contact_id_123",
  "url": "https://example.com/file.pdf",
  "filename": "document.pdf"
}
```

## 🔌 n8n 集成配置

在 n8n 的 **WeChat Personal Bot API** 凭据中配置：

- **Base URL**: `http://localhost:3000` (本地) 或 `http://host.docker.internal:3000` (Docker)
- **API Key**: `wechaty-n8n-key-2024`

## 📋 使用说明

### 发送给文件传输助手
```json
{
  "toType": "filehelper",
  "text": "Hello from n8n!"
}
```

### 发送给联系人
1. 先调用 `/contacts` 获取联系人列表
2. 使用返回的 `id` 发送消息：
```json
{
  "toType": "contact",
  "toId": "contact_id_from_list",
  "text": "Hello!"
}
```

### 发送给群组
1. 先调用 `/rooms` 获取群组列表  
2. 使用返回的 `id` 发送消息：
```json
{
  "toType": "room", 
  "toId": "room_id_from_list",
  "text": "Hello group!"
}
```

## 🚀 生产部署

### Docker Compose 生产配置

```yaml
version: '3.8'
services:
  wechaty-bot:
    image: wechaty-bot-service:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - PADLOCAL_TOKEN=${PADLOCAL_TOKEN}
      - API_KEY=${API_KEY}
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 安全建议

1. **修改默认API Key**
2. **使用HTTPS**（通过反向代理）
3. **限制访问IP**（防火墙规则）
4. **定期备份配置**
5. **监控Bot状态**

## 📊 监控和日志

### 查看日志
```bash
# Docker
docker logs wechaty-bot -f

# 本地
npm start
```

### 监控接口
- `GET /health` - 检查服务状态
- `GET /bot/info` - 获取Bot详细信息

## 💰 成本分析

### PadLocal 定价（参考）
- **免费试用**：7天
- **个人版**：约 ¥200-300/月
- **商业版**：根据使用量定价

### 为什么选择 PadLocal
1. ✅ **官方支持**：Wechaty 官方推荐
2. ✅ **稳定性高**：不容易被微信封号
3. ✅ **功能完整**：支持所有消息类型
4. ✅ **成本可控**：相比其他方案更经济
5. ✅ **易于推广**：标准化API，便于集成

## 🔧 故障排除

### 常见问题

**Q: 无法生成二维码？**
- 检查 PADLOCAL_TOKEN 是否正确
- 确认网络可以访问 PadLocal 服务

**Q: 登录后立即断开？**
- 可能是微信安全策略，建议使用常用设备
- 确保微信版本支持

**Q: 发送消息失败？**
- 检查目标ID是否正确
- 确认微信账号是否有发送权限

**Q: 服务突然停止？**
- 查看日志了解具体错误
- 检查 PadLocal Token 是否过期

### 调试模式

启用详细日志：
```bash
DEBUG=wechaty* npm start
```

## 📞 技术支持

- [Wechaty 官方文档](https://wechaty.js.org/)
- [PadLocal 支持](https://wechaty.js.org/docs/puppet-providers/padlocal)
- [n8n 社区节点文档](https://docs.n8n.io/integrations/community-nodes/)

## 📄 许可证

MIT License - 详见 LICENSE 文件