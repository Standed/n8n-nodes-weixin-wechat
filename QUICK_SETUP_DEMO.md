# 🚀 5分钟快速配置指南

## 你的问题已解决！

### ✅ 新增的免费替代方案

1. **PushDeer** (推荐) - 完全免费，无限制，可自建
2. **Bark** (iOS用户) - 推送体验极佳
3. **企业微信群机器人** - 无需付费IP配置

### 🔧 立即配置（任选一种）

#### 方案A: PushDeer (最推荐)
1. 手机下载 PushDeer App
2. 注册获取 PushKey
3. 在 `.env` 文件中添加:
```env
PUSHDEER_PUSHKEY=你的pushkey
```
4. 重启服务，立即可用！

#### 方案B: Bark (iOS用户)
1. App Store 下载 Bark
2. 获取设备 Key
3. 在 `.env` 文件中添加:
```env
BARK_DEVICE_KEY=你的设备key
```

#### 方案C: 企业微信群机器人
1. 创建企业微信群
2. 添加群机器人，获取 webhook URL
3. 在 `.env` 文件中添加:
```env
ENTERPRISE_WECHAT_BOT_WEBHOOK=你的webhook_url
```

## 🧪 快速测试

配置完成后，重启服务测试：

### PushDeer测试:
```bash
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "pushdeer",
    "title": "n8n测试",
    "text": "PushDeer推送测试成功！"
  }'
```

### Bark测试:
```bash
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "bark",
    "title": "n8n测试",
    "text": "Bark推送测试成功！"
  }'
```

## 🎯 推荐方案对比

| 方案 | 免费 | 限制 | 平台 | 自建 | 推荐度 |
|------|------|------|------|------|--------|
| PushDeer | ✅ | 无 | iOS/Android | ✅ | ⭐⭐⭐⭐⭐ |
| Bark | ✅ | 无 | iOS | ✅ | ⭐⭐⭐⭐ |
| 企业微信机器人 | ✅ | 群消息 | 所有 | ❌ | ⭐⭐⭐⭐ |

## ✨ 优势

- **完全免费**: 无任何付费限制
- **数据安全**: 可以自建服务器，完全掌控
- **推送直接**: 直接推送到手机，无需第三方公众号
- **体验优秀**: 推送速度快，显示效果好
- **无限制**: 没有每日条数限制

## 🚀 立即开始

选择你喜欢的方案，5分钟内就能完成配置！

**推荐顺序**:
1. PushDeer (跨平台，最灵活)
2. Bark (iOS体验最佳)  
3. 企业微信机器人 (团队使用)

你想先配置哪一个？