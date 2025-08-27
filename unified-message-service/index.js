const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 导入各种服务
const EnterpriseWechatService = require('./services/enterpriseWechat');
const EnterpriseWechatBotService = require('./services/enterpriseWechatBot');
const ServerChanService = require('./services/serverChan');
const PersonalWechatService = require('./services/personalWechat');
const WeChatFerryService = require('./services/wechatFerry');
const PushDeerService = require('./services/pushDeer');
const BarkService = require('./services/bark');
const WechatOfficialAccountService = require('./services/wechatOfficialAccount');

const app = express();
app.use(cors());
app.use(express.json());

// 提供静态文件服务
app.use(express.static('public'));

// 首页重定向到上传页面
app.get('/', (req, res) => {
  res.redirect('/upload.html');
});

// 文件上传配置
const uploadDir = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB 总限制
  },
  fileFilter: (req, file, cb) => {
    // 基本文件类型检查
    const allowedMimes = [
      'video/', 'image/', 'audio/',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument',
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      'text/plain', 'text/csv'
    ];
    
    const isAllowed = allowedMimes.some(type => file.mimetype.startsWith(type));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
    }
  }
});

// 配置
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'unified-message-key-2024';

// 服务实例
let services = {
  enterpriseWechat: null,
  enterpriseWechatBot: null,
  serverChan: null,
  personalWechat: null,
  wechatFerry: null,
  pushDeer: null,
  bark: null,
  wechatOfficialAccount: null
};

// 初始化服务
function initServices() {
  console.log('🔧 初始化消息服务...');

  // 1. 企业微信服务
  if (process.env.ENTERPRISE_WECHAT_CORPID && 
      process.env.ENTERPRISE_WECHAT_CORPSECRET && 
      process.env.ENTERPRISE_WECHAT_AGENTID) {
    
    console.log('✅ 发现企业微信配置，初始化企业微信服务...');
    services.enterpriseWechat = new EnterpriseWechatService({
      corpid: process.env.ENTERPRISE_WECHAT_CORPID,
      corpsecret: process.env.ENTERPRISE_WECHAT_CORPSECRET,
      agentid: process.env.ENTERPRISE_WECHAT_AGENTID
    });
  } else {
    console.log('ℹ️  未发现企业微信配置');
  }

  // 1.5. 企业微信群机器人服务
  if (process.env.ENTERPRISE_WECHAT_BOT_WEBHOOK) {
    console.log('✅ 发现企业微信机器人配置，初始化群机器人服务...');
    services.enterpriseWechatBot = new EnterpriseWechatBotService({
      webhookUrl: process.env.ENTERPRISE_WECHAT_BOT_WEBHOOK
    });
  } else {
    console.log('ℹ️  未发现企业微信机器人配置');
  }

  // 2. Server酱服务
  if (process.env.SERVER_CHAN_SENDKEY) {
    console.log('✅ 发现Server酱配置，初始化Server酱服务...');
    services.serverChan = new ServerChanService({
      sendkey: process.env.SERVER_CHAN_SENDKEY
    });
  } else {
    console.log('ℹ️  未发现Server酱配置');
  }

  // 3. 个人微信服务 - 使用WeChatFerry替代
  if (process.env.ENABLE_WECHATFERRY === 'true') {
    console.log('🚀 启用WeChatFerry个人微信服务...');
    try {
      services.wechatFerry = new WeChatFerryService({});
      console.log('✅ WeChatFerry服务初始化完成');
    } catch (error) {
      console.error('❌ WeChatFerry初始化失败:', error.message);
      services.wechatFerry = null;
    }
  } else {
    console.log('⚠️  个人微信服务暂时禁用 (启用请设置 ENABLE_WECHATFERRY=true)');
  }

  // 4. PushDeer服务
  if (process.env.PUSHDEER_PUSHKEY) {
    console.log('✅ 发现PushDeer配置，初始化PushDeer服务...');
    services.pushDeer = new PushDeerService({
      pushkey: process.env.PUSHDEER_PUSHKEY,
      baseUrl: process.env.PUSHDEER_BASE_URL
    });
  } else {
    console.log('ℹ️  未发现PushDeer配置');
  }

  // 5. Bark服务
  if (process.env.BARK_DEVICE_KEY) {
    console.log('✅ 发现Bark配置，初始化Bark服务...');
    services.bark = new BarkService({
      deviceKey: process.env.BARK_DEVICE_KEY,
      baseUrl: process.env.BARK_BASE_URL
    });
  } else {
    console.log('ℹ️  未发现Bark配置');
  }

  // 6. 微信公众号服务
  if (process.env.WECHAT_OFFICIAL_APPID && process.env.WECHAT_OFFICIAL_APPSECRET) {
    console.log('✅ 发现微信公众号配置，初始化公众号服务...');
    services.wechatOfficialAccount = new WechatOfficialAccountService({
      appId: process.env.WECHAT_OFFICIAL_APPID,
      appSecret: process.env.WECHAT_OFFICIAL_APPSECRET,
      templateId: process.env.WECHAT_OFFICIAL_TEMPLATE_ID
    });
  } else {
    console.log('ℹ️  未发现微信公众号配置');
  }
}

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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

// 健康检查
app.get('/health', authenticateApiKey, async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {}
  };

  // 检查各个服务状态
  for (const [name, service] of Object.entries(services)) {
    if (service && typeof service.healthCheck === 'function') {
      try {
        healthStatus.services[name] = await service.healthCheck();
      } catch (error) {
        healthStatus.services[name] = {
          status: 'error',
          error: error.message
        };
      }
    } else {
      healthStatus.services[name] = {
        status: 'disabled',
        message: 'Service not configured or initialized'
      };
    }
  }

  res.json(healthStatus);
});

// 获取可用服务列表
app.get('/services', authenticateApiKey, (req, res) => {
  const availableServices = [];
  
  if (services.enterpriseWechat) {
    availableServices.push({
      name: 'enterprise-wechat',
      displayName: '企业微信',
      description: '发送到企业微信应用',
      free: true,
      features: ['text', 'image', 'file']
    });
  }
  
  if (services.enterpriseWechatBot) {
    availableServices.push({
      name: 'enterprise-wechat-bot',
      displayName: '企业微信机器人',
      description: '发送到企业微信群(无需IP配置)',
      free: true,
      features: ['text', 'markdown', 'image']
    });
  }
  
  if (services.serverChan) {
    availableServices.push({
      name: 'server-chan',
      displayName: 'Server酱',
      description: '推送到微信(通过Server酱)',
      free: true,
      features: ['text', 'markdown']
    });
  }
  
  if (services.personalWechat) {
    availableServices.push({
      name: 'personal-wechat',
      displayName: '个人微信',
      description: '个人微信发送消息',
      free: services.personalWechat.puppetType === 'wechat',
      features: ['text', 'file'],
      puppetType: services.personalWechat.puppetType
    });
  }
  
  if (services.pushDeer) {
    availableServices.push({
      name: 'pushdeer',
      displayName: 'PushDeer',
      description: '免费推送到iOS/Android，可自建服务器',
      free: true,
      features: ['text', 'markdown']
    });
  }
  
  if (services.bark) {
    availableServices.push({
      name: 'bark',
      displayName: 'Bark',
      description: 'iOS推送服务，体验极佳',
      free: true,
      features: ['text']
    });
  }
  
  if (services.wechatOfficialAccount) {
    availableServices.push({
      name: 'wechat-official-account',
      displayName: '微信公众号',
      description: '你自己的微信公众号推送，完全掌控',
      free: true,
      features: ['text', 'template']
    });
  }

  res.json({
    count: availableServices.length,
    services: availableServices
  });
});

// 发送消息统一接口
app.post('/send/text', authenticateApiKey, async (req, res) => {
  const { service, title, text, toType, toId, toUser } = req.body;

  if (!service) {
    return res.status(400).json({
      success: false,
      error: '请指定服务类型',
      availableServices: Object.keys(services).filter(s => services[s])
    });
  }

  if (!text) {
    return res.status(400).json({
      success: false,
      error: '缺少消息内容'
    });
  }

  try {
    let result;

    switch (service) {
      case 'enterprise-wechat':
        // 兼容旧版n8n插件：如果企业微信API未配置，则使用企业微信机器人
        if (!services.enterpriseWechat && services.enterpriseWechatBot) {
          console.log('⚠️  企业微信API未配置，使用企业微信机器人代替');
          result = await services.enterpriseWechatBot.sendText(text);
        } else if (services.enterpriseWechat) {
          result = await services.enterpriseWechat.sendText(toUser, text);
        } else {
          throw new Error('企业微信服务未配置，请使用企业微信机器人');
        }
        break;

      case 'enterprise-wechat-bot':
        if (!services.enterpriseWechatBot) {
          throw new Error('企业微信机器人服务未配置');
        }
        result = await services.enterpriseWechatBot.sendText(text);
        break;

      case 'server-chan':
        if (!services.serverChan) {
          throw new Error('Server酱服务未配置');
        }
        result = await services.serverChan.sendText(title || '来自n8n的消息', text);
        break;

      case 'personal-wechat':
        // 优先使用WeChatFerry
        if (services.wechatFerry) {
          if (!services.wechatFerry.isLoggedIn) {
            throw new Error('个人微信未登录，请扫码登录');
          }
          result = await services.wechatFerry.sendText(toType || 'filehelper', toId, text);
        } else if (services.personalWechat) {
          if (!services.personalWechat.isLoggedIn) {
            throw new Error('个人微信未登录，请扫码登录');
          }
          result = await services.personalWechat.sendText(toType || 'filehelper', toId, text);
        } else {
          throw new Error('个人微信服务未配置或未启用，请设置 ENABLE_WECHATFERRY=true');
        }
        break;

      case 'pushdeer':
        if (!services.pushDeer) {
          throw new Error('PushDeer服务未配置');
        }
        result = await services.pushDeer.sendText(title || '来自n8n的消息', text);
        break;

      case 'bark':
        if (!services.bark) {
          throw new Error('Bark服务未配置');
        }
        result = await services.bark.sendText(title || '来自n8n的消息', text);
        break;

      case 'wechat-official-account':
        if (!services.wechatOfficialAccount) {
          throw new Error('微信公众号服务未配置');
        }
        result = await services.wechatOfficialAccount.sendText(title || '来自n8n的消息', text, toUser);
        break;

      default:
        throw new Error(`不支持的服务类型: ${service}`);
    }

    res.json({
      success: true,
      service,
      ...result
    });

  } catch (error) {
    console.error(`❌ ${service} 发送失败:`, error.message);
    res.status(500).json({
      success: false,
      service,
      error: error.message
    });
  }
});

// 发送文件统一接口
app.post('/send/file', authenticateApiKey, async (req, res) => {
  const { service, url, filename, toType, toId, toUser } = req.body;

  if (!service) {
    return res.status(400).json({
      success: false,
      error: '请指定服务类型'
    });
  }

  if (!url) {
    return res.status(400).json({
      success: false,
      error: '缺少文件URL'
    });
  }

  try {
    let result;

    switch (service) {
      case 'enterprise-wechat':
        // 兼容旧版n8n插件：如果企业微信API未配置，则使用企业微信机器人
        if (!services.enterpriseWechat && services.enterpriseWechatBot) {
          console.log('⚠️  企业微信API未配置，使用企业微信机器人发送文件');
          result = await services.enterpriseWechatBot.sendFile(url, filename);
        } else if (services.enterpriseWechat) {
          result = await services.enterpriseWechat.sendImage(toUser, url);
        } else {
          throw new Error('企业微信服务未配置，请使用企业微信机器人');
        }
        break;

      case 'enterprise-wechat-bot':
        if (!services.enterpriseWechatBot) {
          throw new Error('企业微信机器人服务未配置');
        }
        result = await services.enterpriseWechatBot.sendFile(url, filename);
        break;

      case 'personal-wechat':
        // 优先使用WeChatFerry
        if (services.wechatFerry) {
          if (!services.wechatFerry.isLoggedIn) {
            throw new Error('个人微信未登录，请扫码登录');
          }
          result = await services.wechatFerry.sendFile(toType || 'filehelper', toId, url, filename);
        } else if (services.personalWechat) {
          if (!services.personalWechat.isLoggedIn) {
            throw new Error('个人微信未登录，请扫码登录');
          }
          result = await services.personalWechat.sendFile(toType || 'filehelper', toId, url, filename);
        } else {
          throw new Error('个人微信服务未配置或未启用，请设置 ENABLE_WECHATFERRY=true');
        }
        break;

      case 'server-chan':
        throw new Error('Server酱不支持文件发送');

      default:
        throw new Error(`不支持的服务类型: ${service}`);
    }

    res.json({
      success: true,
      service,
      ...result
    });

  } catch (error) {
    console.error(`❌ ${service} 发送文件失败:`, error.message);
    res.status(500).json({
      success: false,
      service,
      error: error.message
    });
  }
});

// 获取联系人列表（个人微信/WeChatFerry）
app.get('/contacts', authenticateApiKey, async (req, res) => {
  const service = services.wechatFerry || services.personalWechat;
  
  if (!service) {
    return res.status(400).json({
      error: '个人微信服务未配置，请设置 ENABLE_WECHATFERRY=true'
    });
  }

  if (!service.isLoggedIn) {
    return res.status(400).json({
      error: '个人微信未登录',
      loginStatus: service.getLoginStatus ? service.getLoginStatus() : null
    });
  }

  try {
    if (service.loadContacts) await service.loadContacts(); // 兼容旧版
    const contacts = service.getContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({
      error: '获取联系人失败',
      message: error.message
    });
  }
});

// 获取群组列表（个人微信/WeChatFerry）
app.get('/rooms', authenticateApiKey, async (req, res) => {
  const service = services.wechatFerry || services.personalWechat;
  
  if (!service) {
    return res.status(400).json({
      error: '个人微信服务未配置，请设置 ENABLE_WECHATFERRY=true'
    });
  }

  if (!service.isLoggedIn) {
    return res.status(400).json({
      error: '个人微信未登录',
      loginStatus: service.getLoginStatus ? service.getLoginStatus() : null
    });
  }

  try {
    if (service.loadRooms) await service.loadRooms(); // 兼容旧版
    const rooms = service.getRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({
      error: '获取群组失败',
      message: error.message
    });
  }
});

// 获取企业微信用户列表
app.get('/enterprise-users', authenticateApiKey, async (req, res) => {
  if (!services.enterpriseWechat) {
    return res.status(400).json({
      error: '企业微信服务未配置'
    });
  }

  try {
    const users = await services.enterpriseWechat.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      error: '获取企业微信用户失败',
      message: error.message
    });
  }
});

// 发送图文消息接口
app.post('/send/news', authenticateApiKey, async (req, res) => {
  const { service, articles } = req.body;

  if (!service || service !== 'enterprise-wechat-bot') {
    return res.status(400).json({
      success: false,
      error: '图文消息目前仅支持企业微信机器人'
    });
  }

  if (!articles || !Array.isArray(articles) || articles.length === 0) {
    return res.status(400).json({
      success: false,
      error: '缺少图文消息内容'
    });
  }

  try {
    if (!services.enterpriseWechatBot) {
      throw new Error('企业微信机器人服务未配置');
    }

    const result = await services.enterpriseWechatBot.sendNews(articles);
    res.json({
      success: true,
      service,
      ...result
    });

  } catch (error) {
    console.error(`❌ ${service} 发送图文消息失败:`, error.message);
    res.status(500).json({
      success: false,
      service,
      error: error.message
    });
  }
});

// 发送模板卡片接口
app.post('/send/template-card', authenticateApiKey, async (req, res) => {
  const { service, cardType, cardData } = req.body;

  if (!service || service !== 'enterprise-wechat-bot') {
    return res.status(400).json({
      success: false,
      error: '模板卡片目前仅支持企业微信机器人'
    });
  }

  if (!cardType || !cardData) {
    return res.status(400).json({
      success: false,
      error: '缺少卡片类型或卡片数据'
    });
  }

  try {
    if (!services.enterpriseWechatBot) {
      throw new Error('企业微信机器人服务未配置');
    }

    const result = await services.enterpriseWechatBot.sendTemplateCard(cardType, cardData);
    res.json({
      success: true,
      service,
      ...result
    });

  } catch (error) {
    console.error(`❌ ${service} 发送模板卡片失败:`, error.message);
    res.status(500).json({
      success: false,
      service,
      error: error.message
    });
  }
});

// 本地文件上传接口
app.post('/upload/file', authenticateApiKey, upload.single('file'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    const { service, filename } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '未提供文件'
      });
    }

    if (!service) {
      return res.status(400).json({
        success: false,
        error: '请指定服务类型'
      });
    }

    tempFilePath = req.file.path;
    const originalName = filename || req.file.originalname || 'uploaded_file';
    const fileStats = fs.statSync(tempFilePath);
    
    console.log(`📁 接收到本地文件上传: ${originalName} (${Math.round(fileStats.size / 1024)}KB)`);

    let result;

    switch (service) {
      case 'enterprise-wechat':
        if (!services.enterpriseWechat && services.enterpriseWechatBot) {
          console.log('⚠️  企业微信API未配置，使用企业微信机器人上传本地文件');
          result = await services.enterpriseWechatBot.sendLocalFile(tempFilePath, originalName);
        } else if (services.enterpriseWechat) {
          // TODO: 实现企业微信API本地文件上传
          throw new Error('企业微信API本地文件上传功能开发中');
        } else {
          throw new Error('企业微信服务未配置');
        }
        break;

      case 'enterprise-wechat-bot':
        if (!services.enterpriseWechatBot) {
          throw new Error('企业微信机器人服务未配置');
        }
        result = await services.enterpriseWechatBot.sendLocalFile(tempFilePath, originalName);
        break;

      default:
        throw new Error(`服务 ${service} 暂不支持本地文件上传`);
    }

    res.json({
      success: true,
      service,
      fileName: originalName,
      fileSize: `${Math.round(fileStats.size / 1024)}KB`,
      ...result
    });

  } catch (error) {
    console.error(`❌ 本地文件上传失败:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    // 清理临时文件
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`🗑️  清理临时文件: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error('⚠️  清理临时文件失败:', cleanupError.message);
      }
    }
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path,
    availableEndpoints: [
      'GET /health',
      'GET /services', 
      'POST /send/text',
      'POST /send/file',
      'POST /send/news',
      'POST /send/template-card',
      'GET /contacts',
      'GET /rooms',
      'GET /enterprise-users',
      'POST /upload/file'
    ]
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 统一消息服务启动成功!');
  console.log(`   本地访问: http://localhost:${PORT}`);
  console.log(`   Docker访问: http://host.docker.internal:${PORT}`);
  console.log('');
  console.log('📖 配置信息:');
  console.log(`   API Key: ${API_KEY}`);
  console.log('');
  console.log('🔧 可用接口:');
  console.log('   GET  /health          - 健康检查');
  console.log('   GET  /services        - 获取可用服务');
  console.log('   POST /send/text       - 发送文本消息');
  console.log('   POST /send/file       - 发送文件(URL)');
  console.log('   POST /upload/file     - 上传本地文件');
  console.log('   POST /send/news       - 发送图文消息');
  console.log('   POST /send/template-card - 发送模板卡片');
  console.log('   GET  /contacts        - 获取联系人(个人微信)');
  console.log('   GET  /rooms           - 获取群组(个人微信)');
  console.log('   GET  /enterprise-users - 获取企业用户');
  console.log('');
  
  // 初始化服务
  initServices();
});

// 优雅退出
process.on('SIGINT', async () => {
  console.log('🔄 正在关闭服务...');
  if (services.wechatFerry) {
    await services.wechatFerry.stop();
  }
  if (services.personalWechat) {
    await services.personalWechat.stop();
  }
  process.exit(0);
});