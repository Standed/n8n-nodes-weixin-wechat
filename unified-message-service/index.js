const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 导入企业微信服务
const EnterpriseWechatBotService = require('./services/enterpriseWechatBot');

const app = express();
app.use(cors());
app.use(express.json());

// 配置
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'follow-xysai-wechat-for-key';

// 服务实例 - 企业微信专用
let services = {
  enterpriseWechatBot: null
};

// 初始化企业微信服务
function initServices() {
  console.log('🏢 初始化企业微信消息服务...');
  console.log('🌐 由西羊石AI提供技术支持: https://xysaiai.cn/');
  console.log('📱 关注公众号: 西羊石AI视频');
  console.log('');

  // 企业微信机器人服务
  if (process.env.ENTERPRISE_WECHAT_BOT_WEBHOOK) {
    console.log('✅ 初始化企业微信机器人服务...');
    services.enterpriseWechatBot = new EnterpriseWechatBotService({
      webhookUrl: process.env.ENTERPRISE_WECHAT_BOT_WEBHOOK
    });
    console.log('🎯 功能特点：');
    console.log('   - 官方API，稳定可靠');
    console.log('   - 支持文本和Markdown消息');
    console.log('   - 无需额外部署，配置即用');
    console.log('   - 适合企业和团队使用');
  } else {
    console.log('ℹ️  未配置企业微信机器人webhook');
    console.log('💡 配置方法：');
    console.log('   1. 在企业微信群中添加机器人');
    console.log('   2. 复制Webhook URL到 .env 文件');
    console.log('   3. 重启服务即可使用');
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
        '📁 支持文件、图片、文本发送',
        '🔄 支持批量发送和定时推送',
        '⭐ 个人微信请下载PC服务包'
      ]
    },
    notice: '本服务完全免费，关注公众号即可获得API使用权限'
  });
});

// API Key 验证中间件
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
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
    service: 'Enterprise WeChat Service',
    services: {},
    info: {
      website: 'https://xysaiai.cn/',
      wechat: '西羊石AI视频',
      api_key_help: '访问 /api-key 获取密钥获取指引'
    }
  };

  // 检查企业微信服务状态
  if (services.enterpriseWechatBot && typeof services.enterpriseWechatBot.healthCheck === 'function') {
    try {
      healthStatus.services.enterpriseWechatBot = await services.enterpriseWechatBot.healthCheck();
    } catch (error) {
      healthStatus.services.enterpriseWechatBot = {
        status: 'error',
        error: error.message
      };
    }
  } else {
    healthStatus.services.enterpriseWechatBot = {
      status: 'disabled',
      message: 'Enterprise WeChat Bot not configured'
    };
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
      description: '发送到企业微信群，稳定可靠，官方API',
      free: true,
      features: ['text', 'markdown', 'image', 'file']
    });
  }

  res.json({
    count: availableServices.length,
    services: availableServices,
    personal_wechat_note: '个人微信功能请下载PC服务包：https://github.com/Standed/n8n-nodes-weixin-wechat',
    info: {
      website: 'https://xysaiai.cn/',
      wechat: '西羊石AI视频',
      support: '西羊石AI提供技术支持'
    }
  });
});

// 发送文本消息
app.post('/send/text', authenticateApiKey, async (req, res) => {
  const { service, title, text, toType, toId } = req.body;

  if (!service) {
    return res.status(400).json({
      success: false,
      error: '请指定服务类型',
      available_services: ['enterprise-wechat-bot']
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

      default:
        throw new Error(`不支持的服务类型: ${service}，可用服务: enterprise-wechat-bot`);
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

// 发送文件（企业微信支持）
app.post('/send/file', authenticateApiKey, async (req, res) => {
  const { service, url, filename, toType, toId, fileData, caption } = req.body;

  if (!service) {
    return res.status(400).json({
      success: false,
      error: '请指定服务类型',
      available_services: ['enterprise-wechat-bot']
    });
  }

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
          result = { 
            success: false, 
            error: '企业微信机器人暂不支持文件数据上传，请使用URL方式' 
          };
        } else {
          result = await services.enterpriseWechatBot.sendFile(url, filename);
        }
        break;

      default:
        throw new Error(`不支持的服务类型: ${service}，可用服务: enterprise-wechat-bot`);
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

// 启动服务器
async function startServer() {
  try {
    // 初始化服务
    initServices();
    
    // 启动HTTP服务器
    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 西羊石AI企业微信服务已启动');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 服务地址: http://localhost:${PORT}`);
      console.log(`🌐 外部访问: http://您的IP地址:${PORT}`);
      console.log(`💚 健康检查: http://localhost:${PORT}/health`);
      console.log(`📊 服务状态: http://localhost:${PORT}/services`);
      console.log(`🔑 API密钥帮助: http://localhost:${PORT}/api-key`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔗 官网: https://xysaiai.cn/');
      console.log('📞 技术支持: 关注公众号"西羊石AI视频"');
      console.log('');
      
      if (!process.env.ENTERPRISE_WECHAT_BOT_WEBHOOK) {
        console.log('⚠️  注意：企业微信机器人未配置');
        console.log('💡 请在.env文件中设置 ENTERPRISE_WECHAT_BOT_WEBHOOK');
      }
      
      console.log('✅ 企业微信服务运行正常，等待N8N连接...');
      console.log('🙋‍♂️ 个人微信功能请下载PC服务包');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 收到终止信号，正在关闭企业微信服务...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到SIGTERM信号，正在关闭企业微信服务...');
  process.exit(0);
});

// 启动应用
startServer();