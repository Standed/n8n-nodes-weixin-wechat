const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 导入2个核心服务
const EnterpriseWechatBotService = require('./services/enterpriseWechatBot');
const WxAutoWechatService = require('./services/wxautoWechat');

const app = express();
app.use(cors());
app.use(express.json());

// 配置
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'follow-xysai-wechat-for-key';

// 服务实例 - 只保留2个核心服务
let services = {
  enterpriseWechatBot: null,
  wxautoWechat: null
};

// 初始化服务
function initServices() {
  console.log('🚀 初始化n8n微信插件服务...');
  console.log('🌐 由西羊石AI提供技术支持: https://xysaiai.cn/');
  console.log('📱 关注公众号: 西羊石AI视频');
  console.log('');

  // 1. 企业微信机器人服务
  if (process.env.ENTERPRISE_WECHAT_BOT_WEBHOOK) {
    console.log('✅ 初始化企业微信机器人服务...');
    services.enterpriseWechatBot = new EnterpriseWechatBotService({
      webhookUrl: process.env.ENTERPRISE_WECHAT_BOT_WEBHOOK
    });
  } else {
    console.log('ℹ️  未配置企业微信机器人webhook');
  }

  // 2. WxAuto个人微信服务
  if (process.env.ENABLE_WXAUTO_WECHAT === 'true') {
    console.log('✅ 初始化WxAuto个人微信服务...');
    services.wxautoWechat = new WxAutoWechatService({
      pythonPath: process.env.PYTHON_PATH || 'python'
    });
  } else {
    console.log('ℹ️  WxAuto个人微信服务未启用');
  }

  console.log('');
}

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Key获取引导（无需认证）
app.get('/api-key', (req, res) => {
  res.json({
    title: '🔑 获取API Key',
    message: '感谢您使用西羊石AI微信插件！',
    steps: {
      step1: {
        title: '关注公众号',
        description: '在微信中搜索并关注"西羊石AI视频"',
        icon: '📱'
      },
      step2: {
        title: '获取密钥',
        description: '关注后发送关键词"API"即可获得免费密钥',
        icon: '🔐'
      },
      step3: {
        title: '配置使用',
        description: '将API Key填入n8n节点的x-api-key请求头中',
        icon: '⚙️'
      }
    },
    contact: {
      website: 'https://xysaiai.cn/',
      wechat: '西羊石AI视频',
      description: '西羊石AI - 专注AI自动化解决方案',
      features: [
        '🏢 支持企业微信机器人推送',
        '🙋‍♂️ 支持个人微信自动化',
        '📁 支持文件、图片、文本发送',
        '🔄 支持批量发送和定时推送'
      ]
    },
    notice: '本服务完全免费，关注公众号即可获得API使用权限'
  });
});

// API Key 验证中间件
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ 
      error: 'API Key Required', 
      message: '请关注公众号"西羊石AI视频"获取免费API Key',
      instructions: {
        step1: '关注微信公众号: 西羊石AI视频',
        step2: '发送关键词"API"获取密钥',
        step3: '将API Key填入n8n节点的认证配置中',
        website: 'https://xysaiai.cn/',
        wechat_qr: '请在微信中搜索"西羊石AI视频"关注公众号'
      },
      contact: {
        website: 'https://xysaiai.cn/',
        wechat: '西羊石AI视频',
        description: '西羊石AI专注于AI自动化解决方案'
      }
    });
  }
  next();
};

// 健康检查
app.get('/health', authenticateApiKey, async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {},
    info: {
      website: 'https://xysaiai.cn/',
      wechat: '西羊石AI视频',
      api_key_help: '访问 /api-key 获取密钥获取指引'
    }
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
  
  if (services.enterpriseWechatBot) {
    availableServices.push({
      name: 'enterprise-wechat-bot',
      displayName: '🏢 企业微信机器人',
      description: '发送到企业微信群，稳定可靠，推荐使用',
      free: true,
      features: ['text', 'markdown', 'image', 'file']
    });
  }
  
  
  if (services.wxautoWechat) {
    availableServices.push({
      name: 'personal-wechat',
      displayName: '🙋‍♂️ 个人微信 (WxAuto)',
      description: 'UI自动化控制微信PC版，兼容性强',
      free: true,
      features: ['text', 'file', 'image'],
      provider: 'wxauto'
    });
  }

  res.json({
    count: availableServices.length,
    services: availableServices,
    info: {
      website: 'https://xysaiai.cn/',
      wechat: '西羊石AI视频',
      support: '西羊石AI提供技术支持'
    }
  });
});

// 发送消息统一接口
app.post('/send/text', authenticateApiKey, async (req, res) => {
  const { service, title, text, toType, toId } = req.body;

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
      case 'enterprise-wechat-bot':
        if (!services.enterpriseWechatBot) {
          throw new Error('企业微信机器人服务未配置');
        }
        result = await services.enterpriseWechatBot.sendText(text);
        break;

      case 'personal-wechat':
        if (!services.wxautoWechat) {
          throw new Error('个人微信服务未配置，请启用 ENABLE_WXAUTO_WECHAT=true');
        }
        // 支持多联系人发送
        if (req.body.toIds && Array.isArray(req.body.toIds)) {
          result = await services.wxautoWechat.sendTextBatch(
            toType || 'filehelper', 
            req.body.toIds, 
            text, 
            req.body.batchOptions
          );
        } else {
          result = await services.wxautoWechat.sendText(toType || 'filehelper', toId, text);
        }
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
  const { service, url, filename, toType, toId, fileData, caption } = req.body;

  if (!service) {
    return res.status(400).json({
      success: false,
      error: '请指定服务类型'
    });
  }

  // 检查是否有URL或文件数据
  if (!url && !fileData) {
    return res.status(400).json({
      success: false,
      error: '缺少文件URL或文件数据'
    });
  }

  try {
    let result;

    switch (service) {
      case 'enterprise-wechat-bot':
        if (!services.enterpriseWechatBot) {
          throw new Error('企业微信机器人服务未配置');
        }
        if (fileData) {
          // 处理文件数据 - 企业微信暂时不支持直接上传，转为链接模式
          result = { 
            success: false, 
            error: '企业微信机器人暂不支持文件数据上传，请使用URL方式' 
          };
        } else {
          result = await services.enterpriseWechatBot.sendFile(url, filename);
        }
        break;

      case 'personal-wechat':
        if (!services.wxautoWechat) {
          throw new Error('个人微信服务未配置，请启用 ENABLE_WXAUTO_WECHAT=true');
        }
        // 支持多联系人发送
        if (req.body.toIds && Array.isArray(req.body.toIds)) {
          if (fileData) {
            result = await services.wxautoWechat.sendFileDataBatch(
              toType || 'filehelper', 
              req.body.toIds, 
              fileData, 
              caption, 
              req.body.batchOptions
            );
          } else {
            result = await services.wxautoWechat.sendFileBatch(
              toType || 'filehelper', 
              req.body.toIds, 
              url, 
              filename, 
              caption,
              req.body.batchOptions
            );
          }
        } else {
          if (fileData) {
            result = await services.wxautoWechat.sendFileData(toType || 'filehelper', toId, fileData, caption);
          } else {
            result = await services.wxautoWechat.sendFile(toType || 'filehelper', toId, url, filename, caption);
          }
        }
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
    console.error(`❌ ${service} 发送文件失败:`, error.message);
    res.status(500).json({
      success: false,
      service,
      error: error.message
    });
  }
});

// 获取联系人列表（个人微信）
app.get('/contacts', authenticateApiKey, async (req, res) => {
  if (!services.wxautoWechat) {
    return res.status(400).json({
      error: '个人微信服务未配置，请启用 ENABLE_WXAUTO_WECHAT=true'
    });
  }

  try {
    const contacts = await services.wxautoWechat.getContacts();
    res.json({
      count: contacts.length,
      provider: 'wxauto',
      contacts: contacts
    });
  } catch (error) {
    res.status(500).json({
      error: '获取联系人失败',
      message: error.message
    });
  }
});

// 获取群组列表（个人微信）
app.get('/rooms', authenticateApiKey, async (req, res) => {
  if (!services.wxautoWechat) {
    return res.status(400).json({
      error: '个人微信服务未配置，请启用 ENABLE_WXAUTO_WECHAT=true'
    });
  }

  try {
    const rooms = await services.wxautoWechat.getRooms();
    res.json({
      count: rooms.length,
      provider: 'wxauto',
      rooms: rooms
    });
  } catch (error) {
    res.status(500).json({
      error: '获取群组失败',
      message: error.message
    });
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
      'GET /contacts',
      'GET /rooms'
    ],
    support: {
      website: 'https://xysaiai.cn/',
      wechat: '西羊石AI视频'
    }
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 n8n微信插件服务启动成功!');
  console.log(`   本地访问: http://localhost:${PORT}`);
  console.log(`   Docker访问: http://host.docker.internal:${PORT}`);
  console.log('');
  console.log('📖 配置信息:');
  console.log('   API Key: 关注公众号"西羊石AI视频"获取');
  console.log('   获取方式: 访问 /api-key 查看详细步骤');
  console.log('');
  console.log('🔧 可用接口:');
  console.log('   GET  /api-key     - 获取API密钥指引（无需认证）');
  console.log('   GET  /health      - 健康检查');
  console.log('   GET  /services    - 获取可用服务');
  console.log('   POST /send/text   - 发送文本消息');
  console.log('   POST /send/file   - 发送文件');
  console.log('   GET  /contacts    - 获取联系人(个人微信)');
  console.log('   GET  /rooms       - 获取群组(个人微信)');
  console.log('');
  console.log('🌟 西羊石AI技术支持:');
  console.log('   官网: https://xysaiai.cn/');
  console.log('   公众号: 西羊石AI视频');
  console.log('');
  
  // 初始化服务
  initServices();
});

// 优雅退出
process.on('SIGINT', async () => {
  console.log('🔄 正在关闭服务...');
  
  // 优雅关闭所有服务
  if (services.wxautoWechat) {
    await services.wxautoWechat.stop();
  }
  
  console.log('👋 服务已安全关闭');
  process.exit(0);
});