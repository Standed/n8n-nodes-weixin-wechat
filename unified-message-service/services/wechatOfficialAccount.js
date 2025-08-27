const axios = require('axios');

class WechatOfficialAccountService {
  constructor(config) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.templateId = config.templateId;
    this.accessToken = null;
    this.tokenExpires = 0;
  }

  // 获取access_token
  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpires) {
      return this.accessToken;
    }

    try {
      const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
          grant_type: 'client_credential',
          appid: this.appId,
          secret: this.appSecret
        }
      });

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        // token有效期7200秒，提前5分钟刷新
        this.tokenExpires = Date.now() + (response.data.expires_in - 300) * 1000;
        console.log('✅ 微信公众号access_token获取成功');
        return this.accessToken;
      } else {
        throw new Error(`获取access_token失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 获取微信公众号access_token失败:', error.message);
      throw error;
    }
  }

  // 获取用户openid列表
  async getUserList() {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.get(`https://api.weixin.qq.com/cgi-bin/user/get?access_token=${token}`);
      
      if (response.data.data && response.data.data.openid) {
        return response.data.data.openid;
      } else {
        throw new Error('获取用户列表失败');
      }
    } catch (error) {
      console.error('❌ 获取用户列表失败:', error.message);
      throw error;
    }
  }

  // 发送模板消息
  async sendTemplateMessage(openid, title, content, url = '') {
    const token = await this.getAccessToken();

    const templateData = {
      touser: openid,
      template_id: this.templateId,
      url: url,
      data: {
        first: {
          value: title,
          color: '#173177'
        },
        keyword1: {
          value: new Date().toLocaleString('zh-CN'),
          color: '#173177'
        },
        keyword2: {
          value: content,
          color: '#173177'
        },
        remark: {
          value: '来自n8n自动化服务',
          color: '#173177'
        }
      }
    };

    try {
      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`,
        templateData
      );

      if (response.data.errcode === 0) {
        console.log('✅ 微信公众号模板消息发送成功');
        return {
          success: true,
          messageId: 'wechat_official_' + Date.now(),
          msgid: response.data.msgid,
          response: response.data
        };
      } else {
        throw new Error(`发送失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 微信公众号消息发送失败:', error.message);
      throw error;
    }
  }

  // 发送给所有用户
  async sendToAllUsers(title, content, url = '') {
    try {
      const userList = await this.getUserList();
      const results = [];

      for (const openid of userList) {
        try {
          const result = await this.sendTemplateMessage(openid, title, content, url);
          results.push({ openid, success: true, ...result });
        } catch (error) {
          results.push({ openid, success: false, error: error.message });
        }
      }

      return {
        success: true,
        messageId: 'wechat_official_broadcast_' + Date.now(),
        totalUsers: userList.length,
        results: results
      };
    } catch (error) {
      console.error('❌ 群发消息失败:', error.message);
      throw error;
    }
  }

  // 发送文本消息（使用模板消息实现）
  async sendText(title, text, openid = null) {
    if (openid) {
      return await this.sendTemplateMessage(openid, title, text);
    } else {
      // 禁止群发消息，必须指定openid
      throw new Error('微信公众号消息发送失败：必须指定接收用户的openid，禁止群发所有关注者');
    }
  }

  // 健康检查
  async healthCheck() {
    if (!this.appId || !this.appSecret) {
      return {
        status: 'error',
        service: 'wechat-official-account',
        authenticated: false,
        error: '未配置AppID或AppSecret'
      };
    }

    try {
      await this.getAccessToken();
      return {
        status: 'ok',
        service: 'wechat-official-account',
        authenticated: true
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'wechat-official-account',
        authenticated: false,
        error: error.message
      };
    }
  }
}

module.exports = WechatOfficialAccountService;