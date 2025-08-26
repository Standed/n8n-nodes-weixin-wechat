const express = require('express');
const cors = require('cors');
const { WechatyBuilder } = require('wechaty');
const { PuppetPadlocal } = require('wechaty-puppet-padlocal');
const { FileBox } = require('file-box');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 配置
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'wechaty-n8n-key-2024';
const PADLOCAL_TOKEN = process.env.PADLOCAL_TOKEN || '';

// Bot 状态
let bot = null;
let isLoggedIn = false;
let contacts = new Map();
let rooms = new Map();
let botSelf = null;

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// API Key 验证中间件
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or missing API key' 
    });
  }
  next();
};

// 初始化 Wechaty Bot
async function initBot() {
  console.log('🤖 初始化 Wechaty Bot...');
  
  if (!PADLOCAL_TOKEN) {
    console.error('❌ 错误: 需要 PADLOCAL_TOKEN 环境变量');
    console.log('请在 .env 文件中设置: PADLOCAL_TOKEN=你的PadLocal令牌');
    console.log('获取令牌: https://wechaty.js.org/docs/puppet-providers/padlocal');
    return;
  }

  const puppet = new PuppetPadlocal({
    token: PADLOCAL_TOKEN,
  });

  bot = WechatyBuilder.build({
    name: 'n8n-wechat-bot',
    puppet,
  });

  bot
    .on('scan', (qrcode, status) => {
      console.log('📱 扫码登录状态:', status);
      console.log('🔗 扫码链接: https://wechaty.js.org/qrcode/' + encodeURIComponent(qrcode));
    })
    .on('login', async (user) => {
      console.log('✅ 登录成功:', user.name());
      isLoggedIn = true;
      botSelf = user;
      await loadContacts();
      await loadRooms();
    })
    .on('logout', (user) => {
      console.log('🔓 已登出:', user.name());
      isLoggedIn = false;
      contacts.clear();
      rooms.clear();
      botSelf = null;
    })
    .on('message', async (msg) => {
      // 可以在这里处理接收到的消息
      if (!msg.self()) {
        console.log('💬 收到消息:', msg.text(), '来自:', msg.talker().name());
      }
    })
    .on('error', (error) => {
      console.error('❌ Bot 错误:', error);
    });

  try {
    await bot.start();
    console.log('🚀 Wechaty Bot 启动成功');
  } catch (error) {
    console.error('❌ Bot 启动失败:', error);
  }
}

// 加载联系人列表
async function loadContacts() {
  if (!bot || !isLoggedIn) return;
  
  try {
    const contactList = await bot.Contact.findAll();
    contacts.clear();
    
    for (const contact of contactList) {
      if (contact.friend()) {
        contacts.set(contact.id, {
          id: contact.id,
          name: contact.name(),
          alias: await contact.alias() || '',
          type: contact.type()
        });
      }
    }
    
    console.log(`📋 加载了 ${contacts.size} 个联系人`);
  } catch (error) {
    console.error('❌ 加载联系人失败:', error);
  }
}

// 加载群组列表
async function loadRooms() {
  if (!bot || !isLoggedIn) return;
  
  try {
    const roomList = await bot.Room.findAll();
    rooms.clear();
    
    for (const room of roomList) {
      rooms.set(room.id, {
        id: room.id,
        topic: await room.topic(),
        memberCount: (await room.memberAll()).length
      });
    }
    
    console.log(`🏠 加载了 ${rooms.size} 个群组`);
  } catch (error) {
    console.error('❌ 加载群组失败:', error);
  }
}

// API 端点

// 健康检查
app.get('/health', authenticateApiKey, (req, res) => {
  res.json({
    status: 'ok',
    loggedIn: isLoggedIn,
    message: isLoggedIn ? '微信已登录，Bot服务正常' : '等待微信登录',
    botName: botSelf ? botSelf.name() : null,
    contacts: contacts.size,
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// 获取联系人列表
app.get('/contacts', authenticateApiKey, async (req, res) => {
  if (!isLoggedIn) {
    return res.status(400).json({ 
      error: '微信未登录', 
      message: '请先登录微信账号' 
    });
  }

  // 刷新联系人列表
  await loadContacts();
  
  const contactList = Array.from(contacts.values()).map(contact => ({
    id: contact.id,
    name: contact.name,
    alias: contact.alias
  }));

  res.json(contactList);
});

// 获取群组列表
app.get('/rooms', authenticateApiKey, async (req, res) => {
  if (!isLoggedIn) {
    return res.status(400).json({ 
      error: '微信未登录', 
      message: '请先登录微信账号' 
    });
  }

  // 刷新群组列表
  await loadRooms();
  
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    topic: room.topic,
    memberCount: room.memberCount
  }));

  res.json(roomList);
});

// 发送文本消息
app.post('/send/text', authenticateApiKey, async (req, res) => {
  if (!isLoggedIn) {
    return res.status(400).json({ 
      success: false, 
      error: '微信未登录', 
      message: '请先登录微信账号' 
    });
  }

  const { toType, toId, text } = req.body;

  if (!text) {
    return res.status(400).json({ 
      success: false, 
      error: '缺少消息内容',
      message: '请提供要发送的文本内容' 
    });
  }

  try {
    let target = null;

    if (toType === 'filehelper') {
      // 发送给文件传输助手
      target = bot.Contact.load('filehelper');
    } else if (toType === 'contact') {
      // 发送给联系人
      if (!toId) {
        return res.status(400).json({ 
          success: false, 
          error: '缺少联系人ID' 
        });
      }
      target = bot.Contact.load(toId);
    } else if (toType === 'room') {
      // 发送给群组
      if (!toId) {
        return res.status(400).json({ 
          success: false, 
          error: '缺少群组ID' 
        });
      }
      target = bot.Room.load(toId);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: '无效的目标类型',
        message: '支持的类型: contact, room, filehelper' 
      });
    }

    await target.say(text);
    
    console.log(`📤 消息发送成功:`, {
      toType,
      toId: toId || 'filehelper',
      text: text.substring(0, 50) + (text.length > 50 ? '...' : '')
    });

    res.json({
      success: true,
      messageId: 'wechaty_' + Date.now(),
      message: '消息发送成功',
      data: {
        toType,
        toId: toId || 'filehelper',
        text,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 发送消息失败:', error);
    res.status(500).json({
      success: false,
      error: '发送失败',
      message: error.message
    });
  }
});

// 发送文件
app.post('/send/file', authenticateApiKey, async (req, res) => {
  if (!isLoggedIn) {
    return res.status(400).json({ 
      success: false, 
      error: '微信未登录', 
      message: '请先登录微信账号' 
    });
  }

  const { toType, toId, url, filename } = req.body;

  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: '缺少文件URL' 
    });
  }

  try {
    let target = null;

    if (toType === 'filehelper') {
      target = bot.Contact.load('filehelper');
    } else if (toType === 'contact') {
      if (!toId) {
        return res.status(400).json({ 
          success: false, 
          error: '缺少联系人ID' 
        });
      }
      target = bot.Contact.load(toId);
    } else if (toType === 'room') {
      if (!toId) {
        return res.status(400).json({ 
          success: false, 
          error: '缺少群组ID' 
        });
      }
      target = bot.Room.load(toId);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: '无效的目标类型' 
      });
    }

    // 创建文件对象
    const fileBox = FileBox.fromUrl(url, filename);
    await target.say(fileBox);
    
    console.log(`📎 文件发送成功:`, {
      toType,
      toId: toId || 'filehelper',
      url,
      filename
    });

    res.json({
      success: true,
      messageId: 'wechaty_file_' + Date.now(),
      message: '文件发送成功',
      data: {
        toType,
        toId: toId || 'filehelper',
        url,
        filename,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 发送文件失败:', error);
    res.status(500).json({
      success: false,
      error: '发送失败',
      message: error.message
    });
  }
});

// 获取Bot信息
app.get('/bot/info', authenticateApiKey, (req, res) => {
  res.json({
    isLoggedIn,
    botName: botSelf ? botSelf.name() : null,
    contactCount: contacts.size,
    roomCount: rooms.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path,
    availableEndpoints: [
      'GET /health',
      'GET /contacts', 
      'GET /rooms',
      'POST /send/text',
      'POST /send/file',
      'GET /bot/info'
    ]
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Wechaty Bot Service 启动成功!');
  console.log(`   本地访问: http://localhost:${PORT}`);
  console.log(`   Docker访问: http://host.docker.internal:${PORT}`);
  console.log('');
  console.log('📖 配置信息:');
  console.log(`   API Key: ${API_KEY}`);
  console.log(`   PadLocal Token: ${PADLOCAL_TOKEN ? '已配置' : '❌ 未配置'}`);
  console.log('');
  console.log('🔧 可用接口:');
  console.log('   GET  /health      - 健康检查');
  console.log('   GET  /contacts    - 获取联系人');
  console.log('   GET  /rooms       - 获取群组');
  console.log('   POST /send/text   - 发送文本');
  console.log('   POST /send/file   - 发送文件');
  console.log('   GET  /bot/info    - Bot信息');
  console.log('');
  
  if (!PADLOCAL_TOKEN) {
    console.log('⚠️  警告: 未配置 PADLOCAL_TOKEN');
    console.log('   请在 .env 文件中设置 PadLocal 令牌');
    console.log('   获取令牌: https://wechaty.js.org/docs/puppet-providers/padlocal');
  } else {
    console.log('🤖 正在初始化 Wechaty Bot...');
    initBot();
  }
});

// 优雅退出
process.on('SIGINT', async () => {
  console.log('🔄 正在关闭服务...');
  if (bot) {
    await bot.stop();
  }
  process.exit(0);
});