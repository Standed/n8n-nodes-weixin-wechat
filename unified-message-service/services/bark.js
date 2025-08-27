const axios = require('axios');

class BarkService {
  constructor(config) {
    this.deviceKey = config.deviceKey; // Bark设备key
    this.baseUrl = config.baseUrl || 'https://api.day.app'; // 可以自建Bark服务器
  }

  // 发送文本消息
  async sendText(title, body = '', options = {}) {
    if (!this.deviceKey) {
      throw new Error('未配置 Bark 设备key');
    }

    try {
      const url = `${this.baseUrl}/${this.deviceKey}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`;
      
      const params = {};
      if (options.sound) params.sound = options.sound;
      if (options.icon) params.icon = options.icon;
      if (options.group) params.group = options.group;
      if (options.url) params.url = options.url;

      const response = await axios.get(url, { params });

      if (response.data.code === 200) {
        console.log('✅ Bark消息发送成功');
        return {
          success: true,
          messageId: 'bark_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`Bark发送失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('❌ Bark发送失败:', error.message);
      throw error;
    }
  }

  // 健康检查
  async healthCheck() {
    if (!this.deviceKey) {
      return {
        status: 'error',
        service: 'bark',
        authenticated: false,
        error: '未配置设备key'
      };
    }

    try {
      await this.sendText('健康检查', 'Bark服务正常运行');
      return {
        status: 'ok',
        service: 'bark',
        authenticated: true
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'bark',
        authenticated: false,
        error: error.message
      };
    }
  }
}

module.exports = BarkService;