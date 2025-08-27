// 测试脚本 - 验证所有可用服务
const axios = require('axios');

const API_KEY = 'unified-message-key-2024';
const BASE_URL = 'http://localhost:3000';

async function testServices() {
    console.log('🔍 检查可用服务...');
    
    try {
        // 获取服务列表
        const response = await axios.get(`${BASE_URL}/services`, {
            headers: { 'x-api-key': API_KEY }
        });
        
        console.log('\n✅ 当前可用服务：');
        response.data.services.forEach((service, index) => {
            console.log(`${index + 1}. ${service.displayName} (${service.name})`);
            console.log(`   描述：${service.description}`);
            console.log(`   功能：${service.features.join(', ')}`);
            console.log('');
        });
        
        // 测试企业微信机器人
        console.log('🤖 测试企业微信机器人...');
        const botTest = await axios.post(`${BASE_URL}/send/text`, {
            service: 'enterprise-wechat-bot',
            text: '✅ n8n插件更新测试 - 企业微信机器人工作正常！'
        }, {
            headers: { 
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (botTest.data.success) {
            console.log('✅ 企业微信机器人测试成功！');
        } else {
            console.log('❌ 企业微信机器人测试失败');
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
    }
}

testServices();