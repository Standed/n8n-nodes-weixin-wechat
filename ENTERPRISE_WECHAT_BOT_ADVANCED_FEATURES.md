# 🚀 企业微信机器人高级功能使用指南

## ✨ 新增功能

基于企业微信机器人官方API，我们已扩展支持以下高级功能：

1. **智能文件处理** - 根据文件类型智能选择发送方式
2. **图文消息** - 发送多图文消息卡片
3. **模板卡片** - 发送美观的通知卡片
4. **增强文件支持** - 支持视频、音频、文档等各种文件

## 📄 API使用示例

### 1. 智能文件发送

**支持的文件类型处理：**

```bash
# 视频文件 - 自动转为链接形式
curl -X POST http://localhost:3000/send/file \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "enterprise-wechat-bot",
    "url": "https://example.com/video.mp4",
    "filename": "演示视频.mp4"
  }'

# 图片文件 - 直接发送图片
curl -X POST http://localhost:3000/send/file \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "enterprise-wechat-bot",
    "url": "https://httpbin.org/image/png",
    "filename": "测试图片.png"
  }'

# 文档文件 - 发送下载链接
curl -X POST http://localhost:3000/send/file \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "enterprise-wechat-bot",
    "url": "https://example.com/document.pdf",
    "filename": "项目文档.pdf"
  }'
```

### 2. 图文消息

```bash
# 发送图文消息
curl -X POST http://localhost:3000/send/news \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "enterprise-wechat-bot",
    "articles": [
      {
        "title": "重要通知：系统升级",
        "description": "系统将在今晚进行升级维护",
        "url": "https://example.com/notice",
        "picurl": "https://example.com/notice.jpg"
      },
      {
        "title": "新功能发布",
        "description": "企业微信机器人新增高级功能",
        "url": "https://example.com/features",
        "picurl": "https://example.com/features.jpg"
      }
    ]
  }'
```

### 3. 文本通知模板卡片

```bash
# 发送文本通知卡片
curl -X POST http://localhost:3000/send/template-card \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "enterprise-wechat-bot",
    "cardType": "text_notice",
    "cardData": {
      "source": {
        "icon_url": "https://example.com/icon.png",
        "desc": "系统通知"
      },
      "main_title": {
        "title": "服务器监控告警",
        "desc": "检测到异常流量"
      },
      "emphasis_content": {
        "title": "CPU使用率",
        "desc": "85%"
      },
      "quote_area": {
        "type": 1,
        "url": "https://example.com/monitor",
        "appid": "",
        "pagepath": "",
        "title": "查看详细监控数据",
        "quote_text": "点击查看实时监控面板"
      },
      "sub_title_text": "请及时处理",
      "horizontal_content_list": [
        {
          "keyname": "告警时间",
          "value": "2024-08-27 12:30:00"
        },
        {
          "keyname": "影响服务",
          "value": "Web服务"
        }
      ],
      "jump_list": [
        {
          "type": 1,
          "url": "https://example.com/handle",
          "title": "立即处理"
        }
      ],
      "card_action": {
        "type": 1,
        "url": "https://example.com/detail"
      }
    }
  }'
```

### 4. 图文展示模板卡片

```bash
# 发送图文展示卡片
curl -X POST http://localhost:3000/send/template-card \
  -H "Content-Type: application/json" \
  -H "x-api-key: unified-message-key-2024" \
  -d '{
    "service": "enterprise-wechat-bot",
    "cardType": "news_notice",
    "cardData": {
      "source": {
        "icon_url": "https://example.com/news-icon.png",
        "desc": "新闻资讯"
      },
      "main_title": {
        "title": "产品更新日志",
        "desc": "V2.0版本正式发布"
      },
      "card_image": {
        "url": "https://example.com/update-banner.jpg",
        "aspect_ratio": 2.25
      },
      "image_text_area": {
        "type": 1,
        "url": "https://example.com/changelog",
        "title": "查看完整更新日志",
        "desc": "本次更新包含多项新功能和性能优化",
        "image_url": "https://example.com/changelog-thumb.jpg"
      },
      "quote_area": {
        "type": 1,
        "url": "https://example.com/download",
        "title": "立即升级",
        "quote_text": "体验全新功能"
      },
      "vertical_content_list": [
        {
          "title": "新增功能",
          "desc": "智能推荐系统"
        },
        {
          "title": "性能优化",
          "desc": "响应速度提升50%"
        }
      ],
      "horizontal_content_list": [
        {
          "keyname": "发布时间",
          "value": "2024-08-27"
        },
        {
          "keyname": "版本号",
          "value": "V2.0.0"
        }
      ],
      "jump_list": [
        {
          "type": 1,
          "url": "https://example.com/download",
          "title": "下载更新"
        },
        {
          "type": 1,
          "url": "https://example.com/docs",
          "title": "使用文档"
        }
      ],
      "card_action": {
        "type": 1,
        "url": "https://example.com/product"
      }
    }
  }'
```

## 🎯 智能文件处理规则

| 文件类型 | 处理方式 | 图标 | 说明 |
|---------|---------|------|------|
| 视频文件 | 链接分享 | 📹 | .mp4, .avi, .mov, .wmv, .flv, .webm |
| 音频文件 | 链接分享 | 🎵 | .mp3, .wav, .flac, .aac, .ogg |
| 图片文件 | 直接发送 | 🖼️ | .jpg, .jpeg, .png, .gif, .bmp, .webp |
| 文档文件 | 链接分享 | 📄 | .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx, .txt |
| 压缩文件 | 链接分享 | 📦 | .zip, .rar, .7z, .tar, .gz |
| 其他文件 | 通用链接 | 📎 | 其他所有格式 |

## 🔧 在 n8n 中使用

在您的 Docker n8n 中，现在可以：

1. **发送视频文件**：选择"企业微信"，文件URL设置为视频链接
2. **发送图文消息**：使用新的图文消息API
3. **发送模板卡片**：创建美观的通知卡片

## ✨ 功能优势

✅ **智能识别** - 自动根据文件类型选择最佳发送方式  
✅ **美观展示** - 模板卡片提供专业的消息展示  
✅ **链接预览** - 图文消息支持链接预览  
✅ **多媒体支持** - 完整支持图片、视频、音频、文档  
✅ **用户友好** - 清晰的文件类型标识和操作指引  

现在您的企业微信机器人功能更加强大和专业了！🚀