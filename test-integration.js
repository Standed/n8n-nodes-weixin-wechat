const axios = require('axios');

// 配置
const MESSAGE_SERVICE_URL = 'http://localhost:3000';
const API_KEY = 'unified-message-key-2024';

async function testMessageService() {
  console.log('🧪 开始测试统一消息服务...');
  
  try {
    // 1. 健康检查
    console.log('\n1. 测试健康检查...');
    const healthResponse = await axios.get(`${MESSAGE_SERVICE_URL}/health`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log('✅ 健康检查通过:', healthResponse.data.status);
    console.log('📊 服务状态:', healthResponse.data.services);
    
    // 2. 获取可用服务
    console.log('\n2. 检查可用服务...');
    const servicesResponse = await axios.get(`${MESSAGE_SERVICE_URL}/services`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log('📋 可用服务数量:', servicesResponse.data.count);
    console.log('🔧 服务列表:', servicesResponse.data.services);
    
    if (servicesResponse.data.count === 0) {
      console.log('⚠️  当前没有配置任何服务，需要在.env文件中配置服务');
      console.log('💡 建议配置 Server酱 或 企业微信');
      return false;
    }
    
    // 3. 测试文本消息发送 (如果有可用服务)
    if (servicesResponse.data.count > 0) {
      console.log('\n3. 测试文本消息发送...');
      const testService = servicesResponse.data.services[0].name;
      
      try {
        const sendResponse = await axios.post(`${MESSAGE_SERVICE_URL}/send/text`, {
          service: testService,
          title: '集成测试',
          text: '这是一条来自集成测试的消息',
          toUser: '@all' // 企业微信
        }, {
          headers: { 
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ 消息发送成功:', sendResponse.data.success);
      } catch (sendError) {
        console.log('⚠️  消息发送失败 (可能需要配置具体服务):', sendError.message);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return false;
  }
}

async function testN8nConnection() {
  console.log('\n🔗 测试 n8n 连接...');
  
  try {
    // 检查 n8n 是否运行
    const response = await axios.get('http://localhost:5678/rest/active-workflows', {
      timeout: 5000
    });
    console.log('✅ n8n 服务正常运行');
    return true;
  } catch (error) {
    console.log('⚠️  无法连接到 n8n:', error.message);
    console.log('💡 请确保 n8n 在 http://localhost:5678 上运行');
    return false;
  }
}

async function main() {
  console.log('🚀 开始 n8n WeChat 多服务插件集成测试\n');
  
  // 测试消息服务
  const serviceOk = await testMessageService();
  
  // 测试 n8n 连接
  const n8nOk = await testN8nConnection();
  
  console.log('\n📋 测试总结:');
  console.log(`   消息服务: ${serviceOk ? '✅ 正常' : '❌ 异常'}`);
  console.log(`   n8n 连接: ${n8nOk ? '✅ 正常' : '❌ 异常'}`);
  
  if (serviceOk && n8nOk) {
    console.log('\n🎉 集成测试通过！你现在可以:');
    console.log('   1. 打开 http://localhost:5678 访问 n8n');
    console.log('   2. 搜索 "wechat" 找到 "WeChat Multi Send" 节点');
    console.log('   3. 配置凭据: baseUrl=http://host.docker.internal:3000, apiKey=unified-message-key-2024');
    console.log('   4. 根据需要配置 Server酱 或企业微信服务');
  } else {
    console.log('\n🔧 需要解决的问题:');
    if (!serviceOk) {
      console.log('   - 检查统一消息服务配置');
    }
    if (!n8nOk) {
      console.log('   - 确保 n8n 容器正常运行');
    }
  }
  
  console.log('\n📖 详细配置请参考: SETUP_GUIDE.md');
}

main().catch(console.error);