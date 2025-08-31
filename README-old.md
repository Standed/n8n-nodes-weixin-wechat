# 西羊石AI微信插件 | WeChat Node for n8n

![NPM Version](https://img.shields.io/npm/v/n8n-nodes-weixin-wechat?style=flat-square&logo=npm)
![NPM Downloads](https://img.shields.io/npm/dt/n8n-nodes-weixin-wechat?style=flat-square&logo=npm)
![License](https://img.shields.io/npm/l/n8n-nodes-weixin-wechat?style=flat-square)

**n8n社区节点插件，支持企业微信机器人和个人微信自动化** 📱✨

> ✨ **v1.2.5修复**：解决N8N安装权限错误，优化包体积和稳定性！

## 🎯 插件特色

### 🏢 企业微信机器人（推荐）
- ✅ **无需IP白名单** - 直接使用webhook地址
- ✅ **稳定可靠** - 官方API支持，不会被封号
- ✅ **支持群聊** - 发送到企业微信群
- ✅ **Markdown支持** - 富文本消息格式
- ✅ **多种消息类型** - 文本、Markdown、图片等

### 🙋‍♂️ 个人微信自动化（真实控制）
- ✅ **真实微信控制** - 基于wxauto的PC微信客户端控制
- ✅ **Windows优先支持** - 完美兼容Windows系统
- ✅ **无协议限制** - 兼容所有微信版本
- ✅ **功能全面** - 联系人、群聊、文件传输助手
- ✅ **批量发送** - 支持多目标、延迟控制
- ✅ **独立PC服务** - 可部署在本地/云端

## 🚀 快速开始

### 第一步：安装插件
1. n8n → **设置** → **社区节点** → **安装**
2. 输入：`n8n-nodes-weixin-wechat`
3. 等待安装完成，重启n8n

### 第二步：配置凭据
1. **获取密钥**：关注公众号 **"西羊石AI视频"** 发送 **"API"** 
2. **配置凭据**：n8n → **凭据** → **西羊石AI微信插件 API**
   - **API Key**: 粘贴从公众号获取的密钥
   - **个人微信服务地址**: 根据部署方式选择
     - 本地部署：`http://localhost:3001`
     - Docker部署：`http://host.docker.internal:3001`
     - 云端部署：`http://您的PC公网IP:3001`

### 第三步：个人微信服务部署（可选）

如果需要使用个人微信自动化功能：

1. **下载个人微信服务**：
   ```bash
   # 从GitHub下载个人微信服务
   git clone https://github.com/Standed/n8n-nodes-weixin-wechat.git
   cd n8n-nodes-weixin-wechat/personal-wechat-service
   ```

2. **Windows用户快速安装**：
   ```cmd
   # 双击运行环境安装脚本
   install_requirements.bat
   
   # 启动服务
   start.bat
   ```

3. **Mac/Linux用户安装**：
   ```bash
   # 安装环境
   chmod +x install_requirements.sh
   ./install_requirements.sh
   
   # 启动服务
   chmod +x start.sh
   ./start.sh
   ```

4. **手动安装**：
   ```bash
   # 安装Node.js依赖
   npm install
   
   # 安装Python依赖
   pip install wxauto
   
   # 启动服务
   npm start
   ```

## 📋 使用方法

### 🏢 企业微信机器人使用

1. **获取Webhook地址**
   - 在企业微信群中添加机器人
   - 复制生成的webhook URL
   
2. **配置N8N节点**
   - 选择服务：**企业微信机器人**
   - 粘贴Webhook地址
   - 选择消息类型：文本/Markdown
   - 输入消息内容，执行工作流

### 🙋‍♂️ 个人微信自动化使用

1. **环境准备**
   - 确保微信PC版已启动并登录
   - 启动个人微信服务
   
2. **配置目标**
   - 选择服务：**个人微信自动化** 
   - 选择目标：联系人/群聊/文件传输助手
   - 支持多目标（用逗号分隔）：`张三,李四,工作群`

3. **批量选项**
   - **发送间隔**：防止被封号，建议3-5秒
   - **随机延迟**：增加1-5秒随机延迟

## 🎨 支持的消息类型

| 类型 | 企业微信机器人 | 个人微信自动化 | 说明 |
|-----|:-------------:|:-------------:|------|
| 💬 文本消息 | ✅ | ✅ | 纯文本内容 |
| 📝 Markdown | ✅ | ❌ | 富文本格式（企业微信专用） |
| 🖼️ 图片 | 🚧 | ✅ | JPG, PNG, GIF等 |
| 🎥 视频 | 🚧 | ✅ | MP4, AVI等 |
| 📄 文档 | 🚧 | ✅ | PDF, DOC, DOCX等 |
| 🎵 音频 | 🚧 | ✅ | MP3, WAV等 |
| 📎 文件 | 🚧 | ✅ | 任意文件类型 |

## 🛠️ 部署架构

### 企业微信机器人架构
```
N8N → 西羊石AI微信插件 → 企业微信Webhook API → 企业微信群
```

### 个人微信自动化架构
```
N8N → 西羊石AI微信插件 → 个人微信PC服务 → Python wxauto → 微信PC客户端
```

## ⚠️ 平台兼容性

### 企业微信机器人
- ✅ **全平台支持** - Windows/Mac/Linux/Docker
- ✅ **云端部署** - 支持所有云服务商

### 个人微信自动化
- ✅ **Windows（推荐）** - 完全支持，wxauto原生支持
- ⚠️ **Mac** - 实验性支持，wxauto兼容性有限
- ⚠️ **Linux** - 实验性支持，需要额外配置
- 💡 **未来计划** - AppleScript(Mac)、Web微信(跨平台)

## 🔧 高级功能

### 文件发送
- **URL方式**：提供文件的网络链接
- **上传方式**：使用n8n工作流中的二进制数据

### 批量发送
- 支持多个联系人/群聊同时发送
- 智能延迟控制，避免被限制
- 随机延迟增加真实性

### 错误处理
- 自动重试机制
- 详细错误日志
- 支持"失败时继续"模式

## 📈 工作流示例

### 定时群发通知
```
定时器 → HTTP请求获取内容 → WeChat发送节点 → 记录日志
```

### 文件自动分发
```  
文件监控 → 文件读取 → WeChat发送节点(上传模式) → 通知完成
```

### 多渠道消息同步
```
Webhook接收 → 条件判断 → WeChat发送(多目标) → 响应确认
```

## 🔒 安全说明

- ✅ 使用官方API，安全可靠
- ✅ 支持API密钥认证
- ✅ 遵循微信使用规范
- ⚠️ 请勿高频发送，避免被限制
- ✅ 个人微信服务本地运行，数据安全

## 🆘 常见问题

### Q: 个人微信自动化需要什么环境？
A: Windows系统（推荐），已登录的微信PC版，Python环境，wxauto库

### Q: 企业微信机器人有什么限制？
A: 只能发送到添加了机器人的企业微信群，支持官方限制的消息类型

### Q: 支持发送到个人聊天吗？
A: 个人微信自动化支持，企业微信机器人仅支持群聊

### Q: Docker用户如何配置个人微信服务地址？
A: 使用 `http://host.docker.internal:3001`，确保个人微信服务在宿主机运行

### Q: 云端N8N如何使用个人微信功能？
A: 在本地PC运行个人微信服务，配置公网IP访问：`http://您的IP:3001`

### Q: 如何获取技术支持？
A: 关注公众号"西羊石AI视频"或访问 https://xysaiai.cn

## 📞 技术支持

- 🌐 **官网**: https://xysaiai.cn
- 📱 **公众号**: 西羊石AI视频  
- 🔑 **获取API**: 公众号回复"API"
- 💬 **技术交流**: 关注公众号加入用户群
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/Standed/n8n-nodes-weixin-wechat/issues)

## 📝 更新日志

### v1.2.5 (最新)
- 🐛 **重要修复**：解决N8N安装时的EACCES权限错误
- ✅ 清理冗余备份文件，优化包体积（从44.1kB降至29.6kB）
- ✅ 提升安装成功率和稳定性
- 🔧 完善构建流程和文件管理

### v1.2.4 
- 🐛 尝试修复权限问题（部分解决）

### v1.2.3
- ✅ 新增真实个人微信自动化（基于wxauto）
- ✅ 企业微信支持Markdown消息
- ✅ 固定端口凭证验证
- ✅ 完善跨平台部署支持
- ✅ 新增个人微信PC服务
- 🐛 修复权限问题和图标显示

### v1.2.2
- ✅ 基础企业微信和个人微信支持
- ✅ 嵌入式服务架构

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢以下开源项目的支持：
- [n8n](https://n8n.io/) - 强大的工作流自动化平台
- [wxauto](https://github.com/cluic/wxauto) - Windows微信自动化库

---

<div align="center">

**⭐ 觉得好用？给个Star支持一下！**

Made with ❤️ by [西羊石AI](https://xysaiai.cn)

</div>