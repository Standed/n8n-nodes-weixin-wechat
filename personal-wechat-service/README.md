# 个人微信自动化服务

> 西羊石AI出品 | 官网：https://xysaiai.cn/

为N8N提供个人微信发送功能的独立PC服务程序。

## 🚀 快速开始

### 1. 环境要求
- ✅ **操作系统**: Windows 10+ 或 Windows Server 2016+（推荐）
- ✅ **Node.js**: 14.0+（[下载地址](https://nodejs.org/)）
- ✅ **Python**: 3.9-3.12（会自动安装）
- ✅ **微信版本**: 微信PC版 3.9.8 - 3.9.12
  - ❌ 不支持微信4.0版本
  - 📥 推荐下载：[微信3.9.12版本](https://pan.baidu.com/s/1j2p3NTdjSexbQVPQD3Wopg) 提取码: d7j4
- ✅ PC上已登录微信客户端

### 2. 安装运行

#### 第一次使用 - 安装环境
**Windows用户（推荐）**
1. 双击 `一键启动.bat` - 完全自动化安装并启动
   - ✅ 自动检测并安装Node.js环境
   - ✅ 自动检测并安装Python依赖
   - ✅ 自动启动服务，无需二次点击
   - ⏱️ 首次运行约需1-2分钟完成所有设置

**Mac/Linux用户**
1. 执行安装脚本：
```bash
chmod +x install_requirements.sh
./install_requirements.sh
```
2. 启动服务：
```bash
chmod +x start.sh
./start.sh
```

#### Python依赖说明
本服务基于以下技术栈：
- **Node.js**: HTTP API服务框架
- **Python + wxauto**: 真实的微信客户端自动化控制
- **Windows**: wxauto主要支持Windows平台

#### 手动安装（开发者）
```bash
# 安装Node.js依赖
npm install

# 安装Python依赖
pip install wxauto

# 启动服务
npm start
```

## 🔧 配置说明

### 默认配置
- **端口**：3000
- **监听**：0.0.0.0（允许外部访问）

### 环境变量
```bash
PORT=3000  # 自定义端口
```

## 🌐 N8N配置

### 本地N8N
```
个人微信服务地址: http://localhost:3000
```

### Docker版N8N
```
个人微信服务地址: http://host.docker.internal:3000
```

### 云端N8N（需要内网穿透）
推荐使用内网穿透工具：

**🌟 Cloudflare Tunnel（推荐）**：
- **优势**：免费、稳定、安全、无需开放端口
- **安装**：下载 [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/)
- **配置步骤**：
  1. 注册Cloudflare账户
  2. `cloudflared tunnel create wechat-service`
  3. `cloudflared tunnel route dns wechat-service your-domain.com`
  4. `cloudflared tunnel run wechat-service`
- **N8N配置**：`https://your-domain.com`

**其他选择**：
- **ngrok**: `ngrok http 3000` → 使用生成的HTTPS地址
- **frp**: 自建服务器穿透 → 使用您的域名地址  
- **NATAPP**: 国内用户，速度更快

**直接IP访问**（不推荐）：
```
个人微信服务地址: http://您的PC公网IP:3000
```
需要：
1. 开放PC防火墙的3000端口
2. 路由器端口转发（如需要）

## 🔗 API接口

### 健康检查
```
GET /health
```

### 服务状态  
```
GET /status
```

### 发送文本消息
```
POST /send/text
{
  "text": "消息内容",
  "toType": "filehelper|contact|room",
  "toIds": ["联系人1", "联系人2"],
  "batchOptions": {
    "sendDelay": 3,
    "randomDelay": true
  }
}
```

### 发送文件 (完整支持)
```
POST /send/file
Content-Type: application/json
x-api-key: YOUR_API_KEY

{
  "filename": "文件名",
  "url": "文件URL (可选)",
  "fileData": {
    "data": "base64编码的文件数据 (可选)",
    "fileName": "原始文件名",
    "mimeType": "文件MIME类型"
  },
  "toType": "filehelper|contact|room",
  "toIds": ["联系人1", "联系人2"]
}
```

**支持的文件发送方式**：
1. **URL方式**：提供`url`参数，自动下载并发送
2. **二进制数据**：提供`fileData`对象，直接发送二进制数据

**支持的文件类型**：
- 图片：jpg, png, gif, webp
- 文档：pdf, doc, docx, txt, xlsx
- 视频：mp4, avi, mov
- 音频：mp3, wav
- 压缩包：zip, rar, 7z
- 其他任意格式

## 📋 功能特性

- ✅ HTTP API服务
- ✅ 健康检查和环境检测
- ✅ 真实微信客户端控制（基于wxauto）
- ✅ 文本消息发送
- ✅ 文件消息发送（图片、文档、视频等）
- ✅ URL文件下载发送
- ✅ 二进制数据文件发送
- ✅ 批量发送和间隔控制
- ✅ 文件传输助手支持
- ✅ 智能临时文件清理
- ⚠️ Windows平台优先支持

## 🛠️ 技术架构

- **前端API**: Node.js + Express
- **微信控制**: Python + wxauto
- **跨语言通信**: child_process + JSON
- **平台支持**: Windows (主要) | Mac/Linux (实验性)

## ⚠️ 平台兼容性

### Windows (推荐)
- ✅ 完全支持
- ✅ wxauto原生支持
- ✅ PC微信客户端完美集成

### Mac/Linux 
- ⚠️ 实验性支持
- ⚠️ wxauto兼容性有限
- 💡 未来可能集成其他方案：
  - AppleScript (Mac)
  - Web微信 (跨平台)
  - 其他UI自动化工具

## 🚀 使用说明

### 1. 环境准备
1. Windows PC + 已登录的微信客户端
2. 运行环境安装脚本
3. 启动个人微信服务

### 2. N8N配置
在N8N的西羊石AI微信插件凭证中配置：
- API Key: [从公众号获取]
- 个人微信服务地址: `http://localhost:3000`

### 3. 功能测试
**API测试**：
```bash
# 测试完整HTTP API接口
python test_api_file_send.py
```

**功能测试**：
```bash
# 测试文件发送核心功能
python test_file_send.py
```

**N8N工作流测试**：
- 发送文本到文件传输助手
- 发送图片给指定联系人
- 批量文件发送

## 📞 技术支持

- 🏠 官网：https://xysaiai.cn/
- 📱 微信：关注公众号"西羊石AI视频"
- 📧 邮件：support@xysaiai.cn

## 📄 许可证

MIT License - 西羊石AI团队