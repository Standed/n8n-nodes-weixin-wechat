# 🚀 企业微信机器人增强功能指南

## ✅ 问题解决总结

### 1. 文件大小限制优化

**调整前:**
- 图片: 10MB ❌
- 视频: 100MB ❌  
- 文档: 20MB ❌

**调整后:**
```javascript
✅ 图片文件: 50MB
✅ 视频文件: 1GB  
✅ PPT演示: 1GB
✅ 文档文件: 500MB
✅ 其他文件: 100MB
```

### 2. 本地文件上传功能

**新增功能:**
- ✅ **直接文件上传** - 支持从n8n直接上传本地文件
- ✅ **智能文件处理** - 自动识别文件类型和大小限制
- ✅ **临时文件清理** - 上传完成后自动清理临时文件
- ✅ **安全校验** - 完整的文件类型和大小验证

## 🔧 新增API接口

### 本地文件上传接口

**接口地址:** `POST /upload/file`

**请求方式:** `multipart/form-data`

**请求参数:**
```javascript
{
  // 表单字段
  "file": [文件数据],           // 必填: 要上传的文件
  "service": "enterprise-wechat-bot", // 必填: 服务类型
  "filename": "自定义文件名"      // 可选: 自定义文件名
}
```

**curl测试示例:**
```bash
# 上传本地文件到企业微信
curl -X POST http://localhost:3000/upload/file \
  -H "x-api-key: unified-message-key-2024" \
  -F "file=@/path/to/your/file.pdf" \
  -F "service=enterprise-wechat-bot" \
  -F "filename=重要文档.pdf"
```

**响应示例:**
```json
{
  "success": true,
  "service": "enterprise-wechat-bot",
  "fileName": "重要文档.pdf",
  "fileSize": "1024KB",
  "messageId": "enterprise_bot_file_1756280635122",
  "response": {
    "errcode": 0,
    "errmsg": "ok"
  }
}
```

## 📊 智能文件大小检查

系统现在能根据文件类型智能应用不同的大小限制：

```javascript
function checkFileSize(fileName, fileSize) {
  const extension = getExtension(fileName);
  
  if (isImage(extension)) {
    maxSize = 50MB;   // 图片
  } else if (isVideo(extension)) {
    maxSize = 1GB;    // 视频
  } else if (isPPT(extension)) {
    maxSize = 1GB;    // PPT演示
  } else if (isDocument(extension)) {
    maxSize = 500MB;  // 文档
  } else {
    maxSize = 100MB;  // 其他
  }
}
```

## 🛡️ 增强安全特性

### 文件类型校验
- **双重验证**: 文件扩展名 + MIME类型
- **白名单机制**: 仅允许安全的文件格式
- **防绕过**: 不能通过修改扩展名绕过检查

### 上传安全
- **临时存储**: 文件先存储到临时目录
- **自动清理**: 上传完成或失败后自动删除临时文件
- **大小监控**: 实时监控上传文件大小
- **超时保护**: 设置合理的上传超时时间

## 🎯 在n8n中的使用方法

### 方法1: URL文件上传（原有功能）
```javascript
// n8n工作流中使用HTTP Request节点
POST http://host.docker.internal:3000/send/file
Headers: x-api-key: unified-message-key-2024
Body: {
  "service": "enterprise-wechat-bot",
  "url": "https://example.com/file.pdf",
  "filename": "文档名称.pdf"
}
```

### 方法2: 本地文件上传（新功能）
```javascript
// n8n工作流中使用HTTP Request节点
POST http://host.docker.internal:3000/upload/file
Headers: x-api-key: unified-message-key-2024
Body Type: Form-Data
Body: {
  "file": [从前面节点获取的文件数据],
  "service": "enterprise-wechat-bot", 
  "filename": "本地文档.pdf"
}
```

## 🚀 实际测试结果

### ✅ 本地文件上传测试
```bash
输入: 测试文档.txt (16 bytes)
处理: 📁 本地文件处理: 测试文档.txt (0KB)
上传: ⏱️  本地文件上传耗时: 162ms  
结果: ✅ 企业微信机器人本地文件发送成功
清理: 🗑️  清理临时文件
```

## 🌟 功能优势

### 🎯 **用户体验提升**
- 支持直接上传本地文件，无需先上传到网络存储
- 智能文件名处理，自动补全文件扩展名
- 大文件支持，视频和PPT可达1GB

### 🛡️ **安全性增强**  
- 多层安全校验，防止恶意文件上传
- 临时文件自动清理，不占用磁盘空间
- 速率限制和文件大小限制，防止资源滥用

### ⚡ **性能优化**
- 流式文件处理，支持大文件上传
- 智能超时设置，大文件上传时间达5分钟
- 实时上传进度监控

## 📋 支持的文件类型和大小

| 文件类型 | 扩展名 | 大小限制 | 用途 |
|---------|--------|----------|------|
| 🖼️ 图片 | .jpg, .png, .gif, .webp 等 | 50MB | 图片分享 |
| 🎥 视频 | .mp4, .mov, .avi, .wmv 等 | 1GB | 视频分享 |
| 📊 演示 | .ppt, .pptx | 1GB | 演示文稿 |
| 📄 文档 | .pdf, .doc, .docx, .xlsx 等 | 500MB | 文档共享 |
| 🎵 音频 | .mp3, .wav, .flac 等 | 100MB | 音频分享 |
| 📦 压缩 | .zip, .rar, .7z 等 | 100MB | 压缩包 |

现在您的企业微信机器人既支持URL文件发送，也支持本地文件直接上传，为n8n工作流提供了更灵活的文件处理能力！🎉