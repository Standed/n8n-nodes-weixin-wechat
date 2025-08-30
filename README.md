# n8n-nodes-weixin-wechat

> 🌟 西羊石AI微信插件
> 
> 官网: https://xysaiai.cn/  
> 公众号: 西羊石AI视频

## 🚀 功能特点

最简化的n8n微信发送插件，覆盖国内外关键词，支持3种微信服务：

### 1. 🏢 企业微信机器人 (推荐)
- ✅ 无需IP白名单，稳定可靠
- ✅ 支持文本、图片、文件发送
- ✅ 配置简单，即开即用

### 2. 🙋‍♂️ 个人微信自动化
- ✅ UI自动化控制微信PC版
- ✅ 无协议限制，兼容性强
- ✅ 支持所有微信版本


## 📦 快速开始

### 安装n8n节点
```bash
cd n8n-nodes-weixin-wechat
npm install
npm run build
```

### 启动统一消息服务
```bash
cd unified-message-service
npm install
node index.js
```

### 配置服务
编辑 `unified-message-service/.env` 文件：
```env
# 企业微信机器人
ENTERPRISE_WECHAT_BOT_WEBHOOK=your_webhook_url

# 个人微信自动化
ENABLE_WXAUTO_WECHAT=true
PYTHON_PATH=python
```

## 🔧 个人微信自动化依赖安装
```bash
pip install wxauto requests
```

## 📖 使用说明

1. 在n8n中添加"WeChat Send"节点
2. 选择服务类型（企业微信机器人/个人微信自动化）
3. 配置消息内容和接收者
4. 执行工作流即可发送

## 🌟 技术支持

- 官网: https://xysaiai.cn/
- 公众号: 西羊石AI视频
- GitHub: 西羊石AI开源项目
