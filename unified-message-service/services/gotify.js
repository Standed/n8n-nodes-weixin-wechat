const axios = require('axios');

class GotifyService {
  constructor(config) {
    this.serverUrl = config.serverUrl; // Gotify服务器地址
    this.appToken = config.appToken; // 应用token
  }

  // 发送文本消息
  async sendText(title, message, priority = 5) {
    if (!this.serverUrl || !this.appToken) {
      throw new Error('未配置 Gotify 服务器URL或应用token');
    }

    try {
      const response = await axios.post(`${this.serverUrl}/message`, {
        title: title,
        message: message,
        priority: priority
      }, {
        params: { token: this.appToken },
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('✅ Gotify消息发送成功');
      return {
        success: true,
        messageId: 'gotify_' + Date.now(),
        response: response.data
      };
    } catch (error) {
      console.error('❌ Gotify发送失败:', error.message);
      throw error;
    }
  }

  // 健康检查
  async healthCheck() {
    if (!this.serverUrl || !this.appToken) {
      return {
        status: 'error',
        service: 'gotify',
        authenticated: false,
        error: '未配置服务器URL或应用token'
      };
    }

    try {
      await this.sendText('健康检查', 'Gotify服务正常运行');
      return {
        status: 'ok',
        service: 'gotify',
        authenticated: true
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'gotify',
        authenticated: false,
        error: error.message
      };
    }
  }
}

module.exports = GotifyService;