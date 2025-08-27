const axios = require('axios');

class ServerChanService {
  constructor(config) {
    this.sendkey = config.sendkey; // Server酱的 SendKey
  }

  // 发送文本消息
  async sendText(title, content) {
    if (!this.sendkey) {
      throw new Error('未配置 Server酱 SendKey');
    }

    try {
      const response = await axios.post(`https://sctapi.ftqq.com/${this.sendkey}.send`, {
        title: title || '来自n8n的消息',
        desp: content
      });

      if (response.data.code === 0) {
        console.log('✅ Server酱消息发送成功');
        return {
          success: true,
          messageId: 'serverchan_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`Server酱发送失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('❌ Server酱发送失败:', error.message);
      throw error;
    }
  }

  // 发送Markdown格式消息
  async sendMarkdown(title, markdown) {
    return this.sendText(title, markdown);
  }

  // 健康检查
  async healthCheck() {
    if (!this.sendkey) {
      return {
        status: 'error',
        service: 'server-chan',
        authenticated: false,
        error: '未配置 SendKey'
      };
    }

    try {
      // 发送测试消息
      await this.sendText('健康检查', '服务正常运行');
      return {
        status: 'ok',
        service: 'server-chan',
        authenticated: true
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'server-chan',
        authenticated: false,
        error: error.message
      };
    }
  }
}

module.exports = ServerChanService;