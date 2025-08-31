# 个人微信自动化服务

> 西羊石AI出品 | 官网：https://xysaiai.cn/

为N8N提供个人微信发送功能的独立PC服务程序。

## 🚀 快速开始

### 1. 环境要求
- ✅ Windows/Mac/Linux系统
- ✅ Node.js 14.0+（[下载地址](https://nodejs.org/)）
- ✅ PC上已登录微信客户端

### 2. 安装运行

#### 第一次使用 - 安装环境
**Windows用户**
1. 双击 `install_requirements.bat` 安装Python环境
2. 双击 `start.bat` 启动服务

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
- **端口**：3001
- **监听**：0.0.0.0（允许外部访问）

### 环境变量
```bash
PORT=3001  # 自定义端口
```

## 🌐 N8N配置

### 本地N8N
```
个人微信服务地址: http://localhost:3001
```

### Docker版N8N
```
个人微信服务地址: http://host.docker.internal:3001
```

### 云端N8N
```
个人微信服务地址: http://您的PC公网IP:3001
```

**注意**：云端访问需要：
1. 开放PC防火墙的3001端口
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

### 发送文件
```
POST /send/file
{
  "filename": "文件名",
  "url": "文件URL",
  "toType": "filehelper|contact|room"
}
```

## 📋 功能特性

- ✅ HTTP API服务
- ✅ 健康检查和环境检测
- ✅ 真实微信客户端控制（基于wxauto）
- ✅ 文本消息发送
- ✅ 批量发送和间隔控制
- ✅ 文件传输助手支持
- 🚧 文件发送（开发中）
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
- 个人微信服务地址: `http://localhost:3001`

### 3. 测试发送
使用N8N工作流测试：
- 发送到文件传输助手
- 发送给指定联系人
- 批量发送

## 📞 技术支持

- 🏠 官网：https://xysaiai.cn/
- 📱 微信：关注公众号"西羊石AI视频"
- 📧 邮件：support@xysaiai.cn

## 📄 许可证

MIT License - 西羊石AI团队