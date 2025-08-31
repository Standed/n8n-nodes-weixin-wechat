# 西羊石AI微信插件 | WeChat Node for n8n

![NPM Version](https://img.shields.io/npm/v/n8n-nodes-weixin-wechat?style=flat-square&logo=npm)
![NPM Downloads](https://img.shields.io/npm/dt/n8n-nodes-weixin-wechat?style=flat-square&logo=npm)
![License](https://img.shields.io/npm/l/n8n-nodes-weixin-wechat?style=flat-square)

**n8n社区节点插件，支持企业微信机器人和个人微信自动化** 📱✨

> ✨ **插件特色**：内置轻量级微信服务，安装后即可使用！无需额外部署任何服务！

## 🎯 插件特色

### 🏢 企业微信机器人（推荐）
- ✅ **无需IP白名单** - 直接使用webhook地址
- ✅ **稳定可靠** - 官方API支持，不会被封号
- ✅ **支持群聊** - 发送到企业微信群
- ✅ **多媒体支持** - 文本、图片、视频、文档等

### 🙋‍♂️ 个人微信自动化  
- ✅ **UI自动化** - 直接控制微信PC版
- ✅ **无协议限制** - 兼容所有微信版本
- ✅ **功能全面** - 联系人、群聊、文件传输助手
- ✅ **批量发送** - 支持多目标、延迟控制

## 🚀 超简单2步开始

### 第一步：安装插件
1. n8n → **设置** → **社区节点** → **安装**
2. 输入：`n8n-nodes-weixin-wechat`
3. 等待安装完成，重启n8n

### 第二步：获取API密钥
1. **获取密钥**：关注公众号 **"西羊石AI视频"** 发送 **"API"** 
2. **配置凭据**：n8n → **凭据** → **西羊石AI微信插件 API**
   - **Base URL**: `http://localhost:3000` (保持默认即可)
   - **API Key**: 粘贴从公众号获取的密钥
3. **测试连接** → **保存**

🎉 **完成！插件会自动启动内置微信服务，现在就可以使用了！**

---

## ✨ **内置服务的优势**

- 🚀 **零配置**：插件自动启动微信服务，无需手动部署
- 🔒 **本地运行**：所有数据在本地处理，完全安全
- ⚡ **即插即用**：安装插件后立即可用，无需额外步骤
- 🆓 **完全免费**：无云服务费用，无使用限制
- 🛠️ **智能检测**：自动检测端口冲突，动态分配可用端口

---

## 🔧 **高级配置（可选）**

如果需要使用外部微信服务或自定义配置：

### 方式一：Docker部署
```bash
docker run -d --name wechat-service -p 3001:3000 xysaiai/wechat-service:latest
```
然后修改Base URL为：`http://localhost:3001`

### 方式二：源码部署
```bash
git clone https://github.com/xysaiai/wechat-service.git
cd wechat-service && npm install && npm start
```

## 📋 使用方法

### 🏢 企业微信机器人使用

1. **获取Webhook地址**
   - 在企业微信群中添加机器人
   - 复制生成的webhook URL
   
2. **配置服务**
   - 下载并启动 [西羊石AI微信服务](https://xysaiai.cn)
   - 在配置文件中添加webhook地址

3. **发送消息**
   - 选择服务：**企业微信机器人**
   - 选择消息类型：文本/图片/视频等
   - 输入内容，执行工作流

### 🙋‍♂️ 个人微信自动化使用

1. **环境准备**
   - 确保微信PC版已登录
   - 下载 [西羊石AI微信服务](https://xysaiai.cn)
   
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
| 🖼️ 图片 | ✅ | ✅ | JPG, PNG, GIF等 |
| 🎥 视频 | ✅ | ✅ | MP4, AVI等 |
| 📄 文档 | ✅ | ✅ | PDF, DOC, DOCX等 |
| 🎵 音频 | ✅ | ✅ | MP3, WAV等 |
| 📎 文件 | ✅ | ✅ | 任意文件类型 |

## 🛠️ 服务配置

### 企业微信机器人配置
```env
# 企业微信群机器人webhook地址
ENTERPRISE_WECHAT_BOT_WEBHOOK=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY
```

### 个人微信自动化配置
```env
# 启用个人微信自动化
ENABLE_WXAUTO_WECHAT=true
PYTHON_PATH=python

# 安装依赖
pip install wxauto requests
```

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

## 🆘 常见问题

### Q: 个人微信自动化需要什么环境？
A: 需要Windows系统，微信PC版，Python环境

### Q: 企业微信机器人有什么限制？
A: 只能发送到添加了机器人的企业微信群

### Q: 支持发送到个人聊天吗？
A: 个人微信自动化支持，企业微信机器人仅支持群聊

### Q: 如何获取技术支持？
A: 关注公众号"西羊石AI视频"或访问 https://xysaiai.cn

## 📞 技术支持

- 🌐 **官网**: https://xysaiai.cn
- 📱 **公众号**: 西羊石AI视频  
- 🔑 **获取API**: 公众号回复"API"
- 💬 **技术交流**: 关注公众号加入用户群

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢n8n社区的支持，让自动化变得更简单！

---

<div align="center">

**⭐ 觉得好用？给个Star支持一下！**

Made with ❤️ by [西羊石AI](https://xysaiai.cn)

</div>