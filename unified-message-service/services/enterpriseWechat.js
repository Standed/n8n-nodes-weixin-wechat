const axios = require('axios');

class EnterpriseWechatService {
  constructor(config) {
    this.corpid = config.corpid;
    this.corpsecret = config.corpsecret;
    this.agentid = config.agentid;
    this.accessToken = null;
    this.tokenExpires = 0;
  }

  // 获取访问令牌
  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpires) {
      return this.accessToken;
    }

    try {
      const response = await axios.get('https://qyapi.weixin.qq.com/cgi-bin/gettoken', {
        params: {
          corpid: this.corpid,
          corpsecret: this.corpsecret
        }
      });

      if (response.data.errcode === 0) {
        this.accessToken = response.data.access_token;
        // 提前5分钟过期
        this.tokenExpires = Date.now() + (response.data.expires_in - 300) * 1000;
        return this.accessToken;
      } else {
        throw new Error(`获取access_token失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('企业微信获取token失败:', error.message);
      throw error;
    }
  }

  // 发送文本消息
  async sendText(toUser, text) {
    try {
      const token = await this.getAccessToken();
      
      const message = {
        touser: toUser || '@all', // 默认发给所有人
        msgtype: 'text',
        agentid: this.agentid,
        text: {
          content: text
        }
      };

      const response = await axios.post(
        `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`,
        message
      );

      if (response.data.errcode === 0) {
        console.log('✅ 企业微信消息发送成功');
        return {
          success: true,
          messageId: 'enterprise_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`发送失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 企业微信发送失败:', error.message);
      throw error;
    }
  }

  // 发送图片消息（通过URL）
  async sendImage(toUser, imageUrl) {
    try {
      // 先上传媒体文件
      const mediaId = await this.uploadMedia('image', imageUrl);
      
      const token = await this.getAccessToken();
      const message = {
        touser: toUser || '@all',
        msgtype: 'image',
        agentid: this.agentid,
        image: {
          media_id: mediaId
        }
      };

      const response = await axios.post(
        `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`,
        message
      );

      if (response.data.errcode === 0) {
        return {
          success: true,
          messageId: 'enterprise_img_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`发送图片失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 企业微信发送图片失败:', error.message);
      throw error;
    }
  }

  // 上传媒体文件
  async uploadMedia(type, url) {
    try {
      const token = await this.getAccessToken();
      
      // 下载文件
      const fileResponse = await axios.get(url, { responseType: 'stream' });
      
      const formData = new FormData();
      formData.append('media', fileResponse.data);

      const response = await axios.post(
        `https://qyapi.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.errcode === 0) {
        return response.data.media_id;
      } else {
        throw new Error(`媒体上传失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 媒体上传失败:', error.message);
      throw error;
    }
  }

  // 获取部门用户列表
  async getUsers(departmentId = 1) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get('https://qyapi.weixin.qq.com/cgi-bin/user/simplelist', {
        params: {
          access_token: token,
          department_id: departmentId,
          fetch_child: 1
        }
      });

      if (response.data.errcode === 0) {
        return response.data.userlist.map(user => ({
          id: user.userid,
          name: user.name,
          department: user.department
        }));
      } else {
        throw new Error(`获取用户列表失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 获取企业微信用户失败:', error.message);
      throw error;
    }
  }

  // 健康检查
  async healthCheck() {
    try {
      await this.getAccessToken();
      return {
        status: 'ok',
        service: 'enterprise-wechat',
        authenticated: true
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'enterprise-wechat', 
        authenticated: false,
        error: error.message
      };
    }
  }
}

module.exports = EnterpriseWechatService;