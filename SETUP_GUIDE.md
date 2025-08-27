# n8n WeChat 多服务推送插件 - 配置指南

## 概述

本插件支持三种免费的微信推送方式：
- **Server酱** (推荐) - 完全免费，每天100条，微信推送
- **企业微信** - 官方API，完全免费，无限制
- **个人微信** - Wechaty Bot，免费版有限制

## 快速开始

### 1. 启动统一消息服务

```bash
cd unified-message-service
cp .env.example .env
# 编辑 .env 配置文件
npm install
npm start
```

### 2. 安装 n8n 插件

确保你的 n8n 容器能访问到消息服务：

```bash
# 将插件文件复制到 n8n 容器
docker cp n8n-nodes-wechat-personal/ your-n8n-container:/data/custom-nodes/
```

重启 n8n 容器后，搜索 "wechat" 即可找到 "WeChat Multi Send" 节点。

## 服务配置

### 方案1: Server酱 (推荐新用户)

**优点**: 完全免费，配置简单，每天100条免费额度
**缺点**: 有每日限制，需要关注公众号

**配置步骤**:
1. 访问 https://sct.ftqq.com/
2. 微信登录并获取 SendKey
3. 在 `.env` 文件中配置:
```
SERVER_CHAN_SENDKEY=your_sendkey_here
```

### 方案2: 企业微信 (推荐商业用途)

**优点**: 完全免费，无限制，官方支持
**缺点**: 需要注册企业微信

**配置步骤**:
1. 访问 https://work.weixin.qq.com/ 注册企业微信
2. 创建应用，获取以下信息:
   - 企业ID (corpid)
   - 应用Secret (corpsecret)  
   - 应用ID (agentid)
3. 在 `.env` 文件中配置:
```
ENTERPRISE_WECHAT_CORPID=your_corp_id
ENTERPRISE_WECHAT_CORPSECRET=your_corp_secret
ENTERPRISE_WECHAT_AGENTID=your_agent_id
```

### 方案3: 个人微信 (可选)

**优点**: 可以发送到个人联系人和群组
**缺点**: Web版本不稳定，可能需要付费puppet

**配置步骤**:
1. 在 `.env` 文件中启用:
```
ENABLE_PERSONAL_WECHAT=true
PERSONAL_WECHAT_PUPPET=wechat  # 免费但有限制
```

2. 如需更稳定的服务，可考虑使用 PadLocal (付费):
```
PERSONAL_WECHAT_PUPPET=padlocal
PADLOCAL_TOKEN=your_padlocal_token
```

## 推荐配置组合

### 组合1: 完全免费 (推荐新用户)
```env
# Server酱 - 主要推送方式
SERVER_CHAN_SENDKEY=your_sendkey

# 企业微信 - 备用方式
ENTERPRISE_WECHAT_CORPID=your_corp_id
ENTERPRISE_WECHAT_CORPSECRET=your_corp_secret
ENTERPRISE_WECHAT_AGENTID=your_agent_id

# 个人微信 - 测试用
ENABLE_PERSONAL_WECHAT=false
```

### 组合2: 商业推荐
```env
# 企业微信 - 主要业务推送
ENTERPRISE_WECHAT_CORPID=your_corp_id
ENTERPRISE_WECHAT_CORPSECRET=your_corp_secret
ENTERPRISE_WECHAT_AGENTID=your_agent_id

# Server酱 - 通知提醒
SERVER_CHAN_SENDKEY=your_sendkey

# 个人微信 - 高级功能 (可选付费)
ENABLE_PERSONAL_WECHAT=true
PERSONAL_WECHAT_PUPPET=padlocal
PADLOCAL_TOKEN=your_padlocal_token
```

## 使用方法

### 在 n8n 中使用

1. 添加 "WeChat Multi Send" 节点
2. 配置凭据:
   - Base URL: `http://host.docker.internal:3000`
   - API Key: `unified-message-key-2024` (或你的自定义key)
3. 选择服务类型:
   - **Server酱**: 输入消息标题和内容
   - **企业微信**: 输入用户ID (@all 表示所有人)
   - **个人微信**: 选择目标类型和ID

### API 直接调用

发送文本消息:
```bash
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "server-chan",
    "title": "测试消息",
    "text": "这是来自API的测试消息"
  }'
```

## 故障排除

### 1. n8n 看不到插件
- 确保插件文件正确复制到容器内
- 重启 n8n 容器
- 检查插件 package.json 中的 n8nNodesApiVersion

### 2. 服务连接失败
- 检查 Docker 网络配置
- 确保使用 `host.docker.internal` 而不是 `localhost`
- 检查防火墙设置

### 3. 个人微信登录失败
- 检查网络连接
- 避免同时在多个地方登录微信
- 考虑使用付费 puppet 获得更好的稳定性

### 4. 企业微信配置问题
- 确保企业微信应用状态正常
- 检查 corpid、secret、agentid 是否正确
- 确认应用权限设置

## 服务监控

访问服务健康检查：
```bash
curl -H "x-api-key: unified-message-key-2024" \
  http://localhost:3000/health
```

查看可用服务：
```bash
curl -H "x-api-key: unified-message-key-2024" \
  http://localhost:3000/services
```

## 安全建议

1. 修改默认 API_KEY
2. 使用 HTTPS (生产环境)
3. 定期更新依赖包
4. 监控消息发送日志
5. 不要在代码中硬编码敏感信息

## 支持与问题

如遇到问题，请检查：
1. 服务日志输出
2. n8n 工作流执行日志  
3. 网络连接状态
4. 配置文件格式

---

**注意**: 本插件遵循各平台使用条款，建议合理使用，避免频繁发送消息。