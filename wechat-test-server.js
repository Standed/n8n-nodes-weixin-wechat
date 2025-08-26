const express = require('express');
const app = express();
app.use(express.json());

// CORS支持，允许Docker访问
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Health check - 凭据测试会调用这个
app.get('/health', (req, res) => {
  console.log('✅ Health check called');
  console.log('  - API key:', req.headers['x-api-key']);
  
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Missing API key' 
    });
  }
  
  if (apiKey !== 'test-key-123') {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Invalid API key' 
    });
  }
  
  res.json({ 
    status: 'ok', 
    loggedIn: true,
    message: 'Bot service is running and authenticated',
    timestamp: new Date().toISOString()
  });
});

// Mock contacts
app.get('/contacts', (req, res) => {
  console.log('📋 Getting contacts list');
  res.json([
    { id: 'friend001', name: '张三', alias: 'zhangsan' },
    { id: 'friend002', name: '李四', alias: 'lisi' },
    { id: 'friend003', name: '王五', alias: 'wangwu' }
  ]);
});

// Mock rooms  
app.get('/rooms', (req, res) => {
  console.log('📋 Getting rooms list');
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
  
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'test-key-123') {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid API key' 
    });
  }
  
  if (!req.body.text) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing text content' 
    });
  }
  
  res.json({ 
    success: true, 
    messageId: 'msg_' + Date.now(),
    message: 'Text sent successfully',
    data: {
      toType: req.body.toType,
      toId: req.body.toId,
      text: req.body.text
    }
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
  
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'test-key-123') {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid API key' 
    });
  }
  
  if (!req.body.url) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing file URL' 
    });
  }
  
  res.json({ 
    success: true, 
    messageId: 'file_' + Date.now(),
    message: 'File sent successfully',
    data: {
      toType: req.body.toType,
      toId: req.body.toId,
      url: req.body.url,
      filename: req.body.filename
    }
  });
});

// 404处理
app.use((req, res) => {
  console.log('❌ 404 - Path not found:', req.path);
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('🤖 WeChat Bot 测试服务器启动成功!');
  console.log(`   本地访问: http://localhost:${port}`);
  console.log(`   Docker访问: http://host.docker.internal:${port}`);
  console.log('');
  console.log('📖 配置信息:');
  console.log('   Base URL: http://host.docker.internal:3000');
  console.log('   API Key: test-key-123');
  console.log('');
  console.log('🔧 可用端点:');
  console.log('   GET  /health   - 健康检查');
  console.log('   GET  /contacts - 联系人列表');
  console.log('   GET  /rooms    - 群组列表');
  console.log('   POST /send/text - 发送文本');
  console.log('   POST /send/file - 发送文件');
  console.log('');
  console.log('⏰ 服务器时间:', new Date().toISOString());
});