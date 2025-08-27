const axios = require('axios');

class PushDeerService {
  constructor(config) {
    this.pushkey = config.pushkey; // PushDeer的推送key
    this.baseUrl = config.baseUrl || 'https://api2.pushdeer.com'; // 可以自建服务器
  }

  // 发送文本消息
  async sendText(text, desp = '') {
    if (!this.pushkey) {
      throw new Error('未配置 PushDeer 推送key');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/message/push`, {
        pushkey: this.pushkey,
        text: text,
        desp: desp,
        type: 'text'
      });

      if (response.data.code === 0) {
        console.log('✅ PushDeer消息发送成功');
        return {
          success: true,
          messageId: 'pushdeer_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`PushDeer发送失败: ${response.data.error}`);
      }
    } catch (error) {
      console.error('❌ PushDeer发送失败:', error.message);
      throw error;
    }
  }

  // 发送Markdown格式消息
  async sendMarkdown(title, markdown) {
    if (!this.pushkey) {
      throw new Error('未配置 PushDeer 推送key');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/message/push`, {
        pushkey: this.pushkey,
        text: title,
        desp: markdown,
        type: 'markdown'
      });

      if (response.data.code === 0) {
        console.log('✅ PushDeer Markdown消息发送成功');
        return {
          success: true,
          messageId: 'pushdeer_md_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`PushDeer发送失败: ${response.data.error}`);
      }
    } catch (error) {
      console.error('❌ PushDeer发送失败:', error.message);
      throw error;
    }
  }

  // 健康检查
  async healthCheck() {
    if (!this.pushkey) {
      return {
        status: 'error',
        service: 'pushdeer',
        authenticated: false,
        error: '未配置推送key'
      };
    }

    try {
      // 发送测试消息
      await this.sendText('健康检查', 'PushDeer服务正常运行');
      return {
        status: 'ok',
        service: 'pushdeer',
        authenticated: true
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'pushdeer',
        authenticated: false,
        error: error.message
      };
    }
  }
}

module.exports = PushDeerService;