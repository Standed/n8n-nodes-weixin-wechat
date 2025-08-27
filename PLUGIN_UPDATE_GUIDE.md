# 🔄 n8n插件更新指南

## 🎯 新增功能

在原有的文件发送功能基础上，新增了**本地文件上传**选项：

### 📋 模式选择
现在您在n8n中有三种消息发送模式：

1. **Text** - 发送文本消息
2. **File by URL** - 通过URL发送文件 
3. **Upload Local File** - 上传本地文件 ⭐ **新功能**

## 🚀 使用方法

### 步骤1: 更新插件
运行更新脚本:
```bash
E:\N8N\devProject\update_n8n_plugin.bat
```

### 步骤2: 在n8n中使用

1. **添加WeChat Multi Send节点**
2. **选择Service Type**: 企业微信机器人 (推荐)
3. **选择Mode**: Upload Local File
4. **配置参数**:
   - **Local File**: 输入二进制数据属性名 (通常是 `data`)
   - **Upload Filename**: 自定义文件名 (可选)

### 步骤3: 工作流示例

```
[Read Binary File] → [WeChat Multi Send]
       ↓
   binary.data  →  Local File: data
                   Mode: Upload Local File
                   Service: enterprise-wechat-bot
                   Upload Filename: 我的文档.pdf
```

## 🔧 字段说明

### Local File 字段
- **作用**: 指定包含文件数据的二进制属性名
- **常用值**: `data` (默认)
- **示例**: 如果前面的节点输出了 `binary.myfile`，则填入 `myfile`

### Upload Filename 字段  
- **作用**: 为上传的文件指定自定义名称
- **可选**: 如果不填，将使用原始文件名
- **智能扩展名**: 系统会根据文件内容自动补全正确的扩展名

## 📊 支持的文件大小

| 文件类型 | 大小限制 |
|---------|----------|
| 🖼️ 图片 | 50MB |
| 🎥 视频 | 1GB |
| 📊 PPT | 1GB |  
| 📄 文档 | 500MB |
| 🎵 音频 | 100MB |
| 📦 压缩包 | 100MB |

## ⚠️ 注意事项

1. **二进制数据来源**: 本地文件上传需要前面的节点提供二进制数据，如:
   - Read Binary File 节点
   - HTTP Request 节点 (下载文件)
   - Google Drive 节点等

2. **服务支持**: 目前本地文件上传仅支持:
   - ✅ 企业微信机器人 
   - ❌ Server酱 (不支持文件)

3. **网络环境**: Docker n8n 需要能访问 `host.docker.internal:3000`

## 🎉 更新完成

现在您的n8n工作流可以直接上传和发送本地文件到企业微信了！

不再需要先上传文件到网络存储，然后通过URL发送，真正实现了一步到位的本地文件分享。