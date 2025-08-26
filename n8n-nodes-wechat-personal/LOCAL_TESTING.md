# 本地测试指南

## 📋 快速测试步骤

### 1. 构建插件

```bash
cd n8n-nodes-wechat-personal
npm install
npm run build
```

### 2. 打包插件

```bash
npm pack
# 会生成 n8n-nodes-wechat-personal-0.1.0.tgz
```

### 3. 在 n8n 中测试

#### 方法一：全局安装测试（推荐）

```bash
# 安装到全局
npm install -g ./n8n-nodes-wechat-personal-0.1.0.tgz

# 启动 n8n (确保已安装 n8n)
npx n8n start
```

#### 方法二：本地开发模式

```bash
# 在你的 n8n 项目目录中
npm install /path/to/n8n-nodes-wechat-personal

# 或者从 tgz 安装
npm install ./n8n-nodes-wechat-personal-0.1.0.tgz

# 重启 n8n
```

### 4. 验证安装

1. 打开 n8n 界面 (通常是 http://localhost:5678)
2. 新建工作流
3. 搜索 "WeChat" 
4. 你应该能看到 **WeChat (Personal) Send** 节点

## 🧪 完整测试流程

### 准备测试环境

1. **安装 n8n** (如果还没有)
```bash
npm install -g n8n
```

2. **准备微信 Bot 服务** (模拟或实际)
```bash
# 创建一个简单的测试服务器
mkdir wechat-test-server && cd wechat-test-server
npm init -y
npm install express

# 创建测试服务器文件
cat > server.js << 'EOF'
const express = require('express');
const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', loggedIn: true });
});

// Mock contacts
app.get('/contacts', (req, res) => {
  res.json([
    { id: 'friend1', name: '张三', alias: 'zhangsan' },
    { id: 'friend2', name: '李四', alias: 'lisi' }
  ]);
});

// Mock rooms
app.get('/rooms', (req, res) => {
  res.json([
    { id: 'room1', topic: '测试群组1' },
    { id: 'room2', topic: '工作群' }
  ]);
});

// Send text
app.post('/send/text', (req, res) => {
  console.log('发送文本消息:', req.body);
  res.json({ success: true, messageId: 'msg_' + Date.now() });
});

// Send file  
app.post('/send/file', (req, res) => {
  console.log('发送文件:', req.body);
  res.json({ success: true, messageId: 'file_' + Date.now() });
});

app.listen(3000, () => {
  console.log('测试服务器运行在 http://localhost:3000');
});
EOF

# 启动测试服务器
node server.js
```

### 测试节点功能

1. **配置凭据**
   - Base URL: `http://localhost:3000`
   - API Key: `test-key` (任意值)

2. **创建测试工作流**
```json
{
  "nodes": [
    {
      "parameters": {},
      "name": "When clicking \"Test Workflow\"",
      "type": "manualTrigger",
      "typeVersion": 1,
      "position": [460, 380]
    },
    {
      "parameters": {
        "toType": "filehelper",
        "mode": "text",
        "text": "Hello from n8n WeChat node!"
      },
      "name": "WeChat Send",
      "type": "wechatPersonalSend",
      "typeVersion": 1,
      "position": [680, 380],
      "credentials": {
        "wechatPersonalApi": "你的凭据名称"
      }
    }
  ],
  "connections": {
    "When clicking \"Test Workflow\"": {
      "main": [
        [
          {
            "node": "WeChat Send",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🐛 常见问题排查

### 节点没有出现

```bash
# 检查 n8n 是否识别了插件
n8n list:community-packages

# 或者查看 n8n 启动日志
```

### 构建失败

```bash
# 清除缓存重新构建
rm -rf dist/ node_modules/
npm install
npm run build
```

### 凭据测试失败

1. 确保测试服务器在运行
2. 检查 Base URL 是否正确
3. 检查网络连接

### 运行时错误

检查 n8n 控制台输出和测试服务器日志

## 📦 发布前检查

```bash
# 1. 构建成功
npm run build

# 2. 检查构建输出
ls -la dist/

# 3. 打包测试
npm pack

# 4. 检查包内容
tar -tzf n8n-nodes-wechat-personal-0.1.0.tgz

# 5. 版本准备
git tag v0.1.0
```

## 🎯 下一步

插件测试通过后，你可以：

1. **发布到 NPM**
```bash
npm publish
```

2. **设置真实的 Wechaty Bot 服务**
3. **在生产环境中使用**

## 💡 开发技巧

- 使用 `npm run dev` 进行开发时的自动构建
- 修改代码后需要重启 n8n 才能看到变化
- 可以在 n8n 的 `~/.n8n/nodes` 目录直接开发
- 使用 n8n 的日志来调试：`n8n start --log-level=debug`