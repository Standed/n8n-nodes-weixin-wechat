# 🚀 快速配置指南 - 获取您的推送密钥

## ✅ 已为您准备好的配置

您的 `.env` 文件已经更新，现在只需要替换以下占位符为真实的密钥：

## 📋 需要替换的配置

### 1. 🦌 PushDeer（最快配置 - 5分钟）

**第一步：下载应用**
- iOS: App Store搜索"PushDeer"
- Android: https://github.com/easychen/pushdeer/releases

**第二步：获取PushKey**
1. 打开PushDeer应用
2. 注册账号（推荐用Apple ID）
3. 进入"设备"页面
4. 复制**PushKey**

**第三步：替换配置**
在 `.env` 文件中找到：
```env
PUSHDEER_PUSHKEY=请替换为你的PushKey
```
替换为：
```env
PUSHDEER_PUSHKEY=你复制的PushKey
```

### 2. 🤖 企业微信群机器人（2分钟）

**第一步：创建群聊**
1. 企业微信创建群或使用现有群
2. 进入群聊设置

**第二步：添加机器人**
1. 群设置 → 管理 → 添加群机器人
2. 设置机器人名称和头像
3. 复制生成的**Webhook地址**

**第三步：替换配置**
在 `.env` 文件中找到：
```env
ENTERPRISE_WECHAT_BOT_WEBHOOK=请替换为你的Webhook地址
```
替换为：
```env
ENTERPRISE_WECHAT_BOT_WEBHOOK=你复制的webhook地址
```

### 3. 🐕 Bark（iOS用户 - 1分钟）

**第一步：下载Bark**
- App Store搜索"Bark"并安装

**第二步：获取设备key**
1. 打开Bark应用
2. 复制显示的URL中的key部分
   - 例如：`https://api.day.app/ABC123XYZ/`
   - 你的key就是：`ABC123XYZ`

**第三步：替换配置**
在 `.env` 文件中找到：
```env
BARK_DEVICE_KEY=请替换为你的设备Key
```
替换为：
```env
BARK_DEVICE_KEY=你的设备key
```

### 4. 📱 微信公众号（最重要 - 需要注册）

**第一步：注册公众号**
1. 访问 https://mp.weixin.qq.com/
2. 选择"注册" → "订阅号"
3. 完成注册和认证

**第二步：获取开发信息**
1. 登录公众号后台
2. 左侧菜单：**开发** → **基本配置**
3. 获取 **AppID**
4. 生成 **AppSecret**

**第三步：创建模板消息**
1. 左侧菜单：**模板消息**
2. 选择"系统通知"类模板
3. 复制**模板ID**

**第四步：替换配置**
在 `.env` 文件中找到：
```env
WECHAT_OFFICIAL_APPID=请替换为你的AppID
WECHAT_OFFICIAL_APPSECRET=请替换为你的AppSecret
WECHAT_OFFICIAL_TEMPLATE_ID=请替换为你的模板ID
```
替换为实际的值

## 🧪 测试配置

配置完成后，重启服务：
```bash
cd unified-message-service
npm start
```

测试命令：
```bash
# 查看可用服务
curl -H "x-api-key: unified-message-key-2024" http://localhost:3000/services

# 测试PushDeer
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "pushdeer",
    "title": "测试成功！",
    "text": "PushDeer推送正常工作"
  }'

# 测试企业微信机器人
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "enterprise-wechat-bot",
    "text": "企业微信机器人测试成功！"
  }'

# 测试Bark
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "bark",
    "title": "Bark测试",
    "text": "iOS推送成功！"
  }'

# 测试微信公众号
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "wechat-official-account",
    "title": "来自您的公众号",
    "text": "公众号推送测试成功！"
  }'
```

## 🎯 建议配置顺序

1. **PushDeer** (5分钟) - 立即可用，手机直推
2. **企业微信机器人** (2分钟) - 群组通知
3. **Bark** (1分钟) - iOS最佳体验
4. **微信公众号** (需要审核) - 最重要，为您引流用户

## ✨ 配置完成后的优势

✅ **6种推送方式** - 全场景覆盖  
✅ **用户引流** - 微信公众号积累粉丝  
✅ **多重保障** - 消息100%送达  
✅ **完全免费** - 无任何付费限制  
✅ **专业体验** - 推送效果美观  

开始配置吧！🚀