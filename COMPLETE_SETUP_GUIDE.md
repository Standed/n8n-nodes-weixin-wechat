# 🌟 全能推送系统完整配置指南

## 🎯 你将获得的完整推送能力

1. **你的微信公众号** - 用户关注你，专业推送 ⭐⭐⭐⭐⭐
2. **PushDeer** - 直接手机推送，无限制 ⭐⭐⭐⭐⭐  
3. **Bark** - iOS最佳体验 ⭐⭐⭐⭐⭐
4. **企业微信机器人** - 团队通知，无IP限制 ⭐⭐⭐⭐
5. **企业微信API** - 官方接口（已配置）⭐⭐⭐
6. **Server酱** - 备用方案（已配置）⭐⭐⭐

## 🔧 详细配置步骤

### 1. 📱 微信公众号配置（最重要）

#### 第一步：注册公众号
1. 访问 https://mp.weixin.qq.com/
2. 注册**订阅号**（个人即可，免费）
3. 完成认证流程

#### 第二步：获取开发信息
1. 登录公众号后台
2. 左侧菜单：**开发** > **基本配置**
3. 获取以下信息：
   - **AppID** (应用ID)
   - **AppSecret** (应用密钥，需要生成)

#### 第三步：创建模板消息
1. 左侧菜单：**模板消息**
2. 选择**消息通知类**模板，例如：
   ```
   标题：{{first.DATA}}
   时间：{{keyword1.DATA}}  
   内容：{{keyword2.DATA}}
   备注：{{remark.DATA}}
   ```
3. 复制**模板ID**

#### 第四步：配置到服务
在 `.env` 文件中添加：
```env
WECHAT_OFFICIAL_APPID=你的AppID
WECHAT_OFFICIAL_APPSECRET=你的AppSecret
WECHAT_OFFICIAL_TEMPLATE_ID=你的模板ID
```

### 2. 🦌 PushDeer配置（推荐）

#### 第一步：安装应用
- **iOS**: App Store搜索"PushDeer"
- **Android**: https://github.com/easychen/pushdeer/releases

#### 第二步：获取推送key
1. 打开PushDeer应用
2. 注册账号（可以用Apple ID或邮箱）
3. 进入**设备**页面
4. 复制**PushKey**

#### 第三步：配置到服务
```env
PUSHDEER_PUSHKEY=你的PushKey
PUSHDEER_BASE_URL=https://api2.pushdeer.com
```

### 3. 🐕 Bark配置（iOS用户）

#### 第一步：安装Bark
- App Store搜索"Bark"并安装

#### 第二步：获取设备key
1. 打开Bark应用
2. 复制显示的URL中的key部分
   - 例如：`https://api.day.app/your_device_key/`
   - 你的key就是：`your_device_key`

#### 第三步：配置到服务
```env
BARK_DEVICE_KEY=你的设备key
BARK_BASE_URL=https://api.day.app
```

### 4. 🤖 企业微信群机器人配置

#### 第一步：创建企业微信群
1. 企业微信创建一个群聊
2. 或使用现有群聊

#### 第二步：添加群机器人
1. 进入群聊
2. 右上角**设置** > **管理**
3. 点击**添加群机器人**
4. 设置机器人名称和头像
5. 复制生成的**Webhook地址**

#### 第三步：配置到服务
```env
ENTERPRISE_WECHAT_BOT_WEBHOOK=你的webhook地址
```

### 5. ✅ 企业微信API（已配置，有IP限制）
```env
ENTERPRISE_WECHAT_CORPID=wwb850f7d60428b250
ENTERPRISE_WECHAT_CORPSECRET=7QX0l9JDBdzVC0_Oao03waVUDNmSVvgjhcoVFBB6pxU
ENTERPRISE_WECHAT_AGENTID=1000004
```

### 6. ✅ Server酱（已配置，备用）
```env
SERVER_CHAN_SENDKEY=SCT294016THn02XWw8g5Cia3hkAexuT4yc
```

## 🎮 完整的.env配置模板

将以下内容复制到你的 `.env` 文件：

```env
# 基础配置
PORT=3000
API_KEY=unified-message-key-2024

# ===========================================
# 1. 你的微信公众号（主力推送）⭐⭐⭐⭐⭐
# ===========================================
WECHAT_OFFICIAL_APPID=替换为你的AppID
WECHAT_OFFICIAL_APPSECRET=替换为你的AppSecret
WECHAT_OFFICIAL_TEMPLATE_ID=替换为你的模板ID

# ===========================================  
# 2. PushDeer（手机直推）⭐⭐⭐⭐⭐
# ===========================================
PUSHDEER_PUSHKEY=替换为你的PushKey
PUSHDEER_BASE_URL=https://api2.pushdeer.com

# ===========================================
# 3. Bark（iOS极佳体验）⭐⭐⭐⭐⭐  
# ===========================================
BARK_DEVICE_KEY=替换为你的设备key
BARK_BASE_URL=https://api.day.app

# ===========================================
# 4. 企业微信机器人（团队通知）⭐⭐⭐⭐
# ===========================================
ENTERPRISE_WECHAT_BOT_WEBHOOK=替换为你的webhook地址

# ===========================================
# 5. 企业微信API（官方接口）⭐⭐⭐
# ===========================================
ENTERPRISE_WECHAT_CORPID=wwb850f7d60428b250
ENTERPRISE_WECHAT_CORPSECRET=7QX0l9JDBdzVC0_Oao03waVUDNmSVvgjhcoVFBB6pxU
ENTERPRISE_WECHAT_AGENTID=1000004

# ===========================================
# 6. Server酱（备用方案）⭐⭐⭐
# ===========================================
SERVER_CHAN_SENDKEY=SCT294016THn02XWw8g5Cia3hkAexuT4yc

# ===========================================
# 个人微信配置（可选）
# ===========================================
ENABLE_PERSONAL_WECHAT=false
```

## 🧪 测试所有服务

配置完成后，重启服务：
```bash
cd unified-message-service
npm start
```

### 测试命令

```bash
# 查看可用服务
curl -H "x-api-key: unified-message-key-2024" http://localhost:3000/services

# 测试你的微信公众号
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "wechat-official-account",
    "title": "来自你的公众号",
    "text": "恭喜！你的公众号推送成功！"
  }'

# 测试PushDeer  
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "pushdeer",
    "title": "PushDeer测试",
    "text": "直接推送到你的手机！"
  }'

# 测试Bark
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "bark", 
    "title": "Bark测试",
    "text": "iOS最佳推送体验！"
  }'

# 测试企业微信机器人
curl -X POST http://localhost:3000/send/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "enterprise-wechat-bot",
    "text": "企业微信群机器人测试成功！"
  }'
```

## 🎯 使用场景

| 场景 | 推荐服务 | 原因 |
|------|----------|------|
| **用户通知** | 你的微信公众号 | 专业，用户关注你 |
| **个人提醒** | PushDeer | 直接快速 |  
| **iOS推送** | Bark | 体验最佳 |
| **团队通知** | 企业微信机器人 | 群组消息 |
| **系统监控** | PushDeer + Bark | 多重保障 |
| **营销推广** | 你的微信公众号 | 积累粉丝 |

## ✨ 你的优势

✅ **6种推送方式** - 覆盖所有场景  
✅ **用户引流** - 微信公众号为你积累用户  
✅ **多重保障** - 消息100%送达  
✅ **完全免费** - 无任何付费限制  
✅ **数据掌控** - 所有服务都可自建  
✅ **专业体验** - 推送效果专业美观

## 🚀 配置顺序建议

1. **PushDeer** (5分钟) - 立即可用
2. **企业微信机器人** (2分钟) - 简单快速  
3. **Bark** (1分钟) - iOS用户
4. **你的微信公众号** (需要注册审核) - 最重要

**准备好了吗？让我们开始配置第一个服务！** 🎉