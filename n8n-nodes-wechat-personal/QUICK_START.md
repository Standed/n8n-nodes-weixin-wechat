# 快速开始指南

## 🚀 插件已安装成功！

你的 WeChat (Personal) Send 节点现在可以使用了。以下是配置说明：

## 📋 配置步骤

### 1. 设置 WeChat Bot 服务（必需）

在使用插件之前，你需要运行一个 WeChat Bot 服务。创建简单测试服务：

```bash
# 创建测试目录
mkdir wechat-test-server && cd wechat-test-server
npm init -y
npm install express

# 创建测试服务器
cat > server.js << 'EOF'
const express = require('express');
const app = express();
app.use(express.json());

// Health check - 凭据测试会调用这个
app.get('/health', (req, res) => {
  console.log('Health check called with API key:', req.headers['x-api-key']);
  res.json({ 
    status: 'ok', 
    loggedIn: true,
    message: 'Bot service is running' 
  });
});

// Mock contacts - 如果你使用 Contact 类型
app.get('/contacts', (req, res) => {
  res.json([
    { id: 'friend001', name: '张三', alias: 'zhangsan' },
    { id: 'friend002', name: '李四', alias: 'lisi' },
    { id: 'friend003', name: '王五', alias: 'wangwu' }
  ]);
});

// Mock rooms - 如果你使用 Room 类型  
app.get('/rooms', (req, res) => {
  res.json([
    { id: 'room001', topic: '测试群组' },
    { id: 'room002', topic: '工作群' },
    { id: 'room003', topic: '家庭群' }
  ]);
});

// Send text message
app.post('/send/text', (req, res) => {
  console.log('📝 发送文本消息:');
  console.log('  - 目标类型:', req.body.toType);
  console.log('  - 目标ID:', req.body.toId || 'FileHelper');
  console.log('  - 消息内容:', req.body.text);
  console.log('  - API Key:', req.headers['x-api-key']);
  
  res.json({ 
    success: true, 
    messageId: 'msg_' + Date.now(),
    message: 'Text sent successfully' 
  });
});

// Send file
app.post('/send/file', (req, res) => {
  console.log('📎 发送文件:');
  console.log('  - 目标类型:', req.body.toType);
  console.log('  - 目标ID:', req.body.toId || 'FileHelper');
  console.log('  - 文件URL:', req.body.url);
  console.log('  - 文件名:', req.body.filename || 'auto');
  console.log('  - API Key:', req.headers['x-api-key']);
  
  res.json({ 
    success: true, 
    messageId: 'file_' + Date.now(),
    message: 'File sent successfully' 
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`🤖 WeChat Bot 测试服务器运行在 http://localhost:${port}`);
  console.log('');
  console.log('📖 使用说明:');
  console.log('  Base URL: http://localhost:3000');
  console.log('  API Key: 任意值（如: test-key-123）');
  console.log('');
});
EOF

# 启动服务器
node server.js
```

### 2. 在 n8n 中配置凭据

1. **创建凭据**：
   - 进入 n8n → Credentials
   - 点击 "Create New" → "Wechat Personal Bot API"

2. **填写配置**：
   - **Base URL**: `http://localhost:3000`
   - **API Key**: `test-key-123` （任意值，与你的bot服务匹配）

3. **测试连接**：
   - 点击 "Test" 按钮
   - 应该显示 "Connection successful" ✅

## 📤 使用节点发送消息

### 发送到文件传输助手（最简单）

1. **Target Type**: 选择 `FileHelper`
2. **Mode**: 选择 `Text`  
3. **Text**: 输入消息内容，如 `Hello from n8n!`
4. 点击 "Test Workflow"

### 发送给联系人

1. **Target Type**: 选择 `Contact`
2. **Receiver ID**: 输入联系人ID，如 `friend001` 
3. **Mode**: 选择 `Text`
4. **Text**: 输入消息内容

### 发送给群组

1. **Target Type**: 选择 `Room`  
2. **Receiver ID**: 输入群组ID，如 `room001`
3. **Mode**: 选择 `Text`
4. **Text**: 输入消息内容

### 发送文件

1. **Target Type**: 选择目标类型
2. **Receiver ID**: 输入对应ID（FileHelper无需填写）
3. **Mode**: 选择 `File by URL`
4. **File URL**: 输入文件的公网URL
5. **Filename**: （可选）自定义文件名

## 🔍 Receiver ID 说明

- **FileHelper**: 不需要填写 Receiver ID
- **Contact**: 使用联系人的唯一ID（如 `friend001`）
- **Room**: 使用群组的唯一ID（如 `room001`）

这些 ID 来自你的 WeChat Bot 服务，真实环境中会是微信的实际用户/群组标识符。

## 🔧 常见问题

**Q: 凭据测试失败？**
- 确保 Bot 服务正在运行
- 检查 Base URL 是否正确
- 确保网络能访问到服务

**Q: 发送消息失败？**  
- 检查 Receiver ID 是否正确
- 查看 Bot 服务的控制台日志
- 验证 API Key 是否匹配

**Q: 图标不显示？**
- 重启 n8n 或刷新浏览器
- 这不影响功能使用

## 🎯 下一步

1. **测试基本功能**: 先用 FileHelper 测试文本发送
2. **设置真实服务**: 替换为实际的 Wechaty Bot 服务  
3. **配置真实数据**: 使用真实的联系人和群组ID

成功！你的 WeChat 插件现在已经可以正常工作了！ 🎉