const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:3001';
const API_KEY = 'wechaty-n8n-key-2024';

// 创建 axios 实例
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
  }
});

// 测试函数
async function testWechatService() {
  console.log('🧪 开始测试 Wechaty 服务...\n');

  try {
    // 1. 健康检查
    console.log('1. 📋 检查服务状态...');
    const healthResponse = await api.get('/health');
    console.log('状态:', healthResponse.data);
    console.log('✅ 服务状态正常\n');

    if (!healthResponse.data.loggedIn) {
      console.log('⚠️  微信未登录，请先扫码登录');
      console.log('打开浏览器访问二维码链接进行登录');
      return;
    }

    // 2. 获取 Bot 信息
    console.log('2. 🤖 获取 Bot 信息...');
    const botInfoResponse = await api.get('/bot/info');
    console.log('Bot 信息:', botInfoResponse.data);
    console.log('✅ Bot 信息获取成功\n');

    // 3. 获取联系人列表
    console.log('3. 👥 获取联系人列表...');
    const contactsResponse = await api.get('/contacts');
    console.log(`联系人数量: ${contactsResponse.data.length}`);
    if (contactsResponse.data.length > 0) {
      console.log('前5个联系人:', contactsResponse.data.slice(0, 5));
    }
    console.log('✅ 联系人列表获取成功\n');

    // 4. 获取群组列表
    console.log('4. 🏠 获取群组列表...');
    const roomsResponse = await api.get('/rooms');
    console.log(`群组数量: ${roomsResponse.data.length}`);
    if (roomsResponse.data.length > 0) {
      console.log('前3个群组:', roomsResponse.data.slice(0, 3));
    }
    console.log('✅ 群组列表获取成功\n');

    // 5. 发送测试消息给文件传输助手
    console.log('5. 💬 发送测试消息给文件传输助手...');
    const sendResponse = await api.post('/send/text', {
      toType: 'filehelper',
      text: `Wechaty 测试消息 - ${new Date().toLocaleString()}`
    });
    console.log('发送结果:', sendResponse.data);
    console.log('✅ 测试消息发送成功\n');

    console.log('🎉 所有测试通过！Wechaty 服务运行正常');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('请检查 API Key 是否正确');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('请确保 Wechaty 服务正在运行 (http://localhost:3001)');
    }
  }
}

// 等待登录状态检查函数
async function waitForLogin(maxWaitTime = 300000) { // 最长等待5分钟
  console.log('⏳ 等待微信登录...');
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await api.get('/health');
      if (response.data.loggedIn) {
        console.log('✅ 微信登录成功！');
        return true;
      }
      console.log('⏳ 等待登录中... (请扫码)');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒
    } catch (error) {
      console.log('⚠️  服务连接失败，继续等待...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
    }
  }
  
  console.log('❌ 登录超时');
  return false;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--wait-login')) {
    const loginSuccess = await waitForLogin();
    if (!loginSuccess) {
      console.log('登录失败或超时，退出测试');
      process.exit(1);
    }
  }
  
  await testWechatService();
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testWechatService,
  waitForLogin
};