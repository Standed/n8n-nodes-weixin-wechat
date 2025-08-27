const { WechatyBuilder } = require('wechaty');
const { PuppetPadlocal } = require('wechaty-puppet-padlocal');
const { FileBox } = require('file-box');

class PersonalWechatService {
  constructor(config) {
    this.config = config;
    this.bot = null;
    this.isLoggedIn = false;
    this.contacts = new Map();
    this.rooms = new Map();
    this.botSelf = null;
    
    // 支持的puppet类型
    this.puppetType = config.puppetType || 'wechat'; // 'wechat', 'padlocal'
    this.padlocalToken = config.padlocalToken;
  }

  // 初始化Bot
  async initBot() {
    console.log(`🤖 初始化个人微信Bot (${this.puppetType})...`);

    let puppet = null;

    if (this.puppetType === 'padlocal') {
      if (!this.padlocalToken) {
        throw new Error('PadLocal模式需要配置token');
      }
      puppet = new PuppetPadlocal({
        token: this.padlocalToken,
      });
      console.log('📱 使用 PadLocal Puppet (付费模式)');
    } else {
      console.log('📱 使用 Web WeChat Puppet (免费模式)');
    }

    const botConfig = {
      name: 'n8n-personal-wechat-bot',
    };

    if (puppet) {
      botConfig.puppet = puppet;
    }

    this.bot = WechatyBuilder.build(botConfig);

    this.bot
      .on('scan', (qrcode, status) => {
        console.log('📱 扫码登录状态:', status);
        console.log('🔗 扫码链接: https://wechaty.js.org/qrcode/' + encodeURIComponent(qrcode));
        console.log('💡 请用微信扫描上方二维码登录');
      })
      .on('login', async (user) => {
        console.log('✅ 个人微信登录成功:', user.name());
        this.isLoggedIn = true;
        this.botSelf = user;
        await this.loadContacts();
        await this.loadRooms();
      })
      .on('logout', (user) => {
        console.log('🔓 个人微信已登出:', user.name());
        this.isLoggedIn = false;
        this.contacts.clear();
        this.rooms.clear();
        this.botSelf = null;
      })
      .on('message', async (msg) => {
        if (!msg.self()) {
          console.log('💬 收到消息:', msg.text(), '来自:', msg.talker().name());
        }
      })
      .on('error', (error) => {
        console.error('❌ 个人微信Bot错误:', error);
        // 不要重启，让用户决定
      });

    try {
      await this.bot.start();
      console.log('🚀 个人微信Bot启动成功');
    } catch (error) {
      console.error('❌ 个人微信Bot启动失败:', error);
      throw error;
    }
  }

  // 加载联系人列表
  async loadContacts() {
    if (!this.bot || !this.isLoggedIn) return;
    
    try {
      const contactList = await this.bot.Contact.findAll();
      this.contacts.clear();
      
      for (const contact of contactList) {
        if (contact.friend()) {
          this.contacts.set(contact.id, {
            id: contact.id,
            name: contact.name(),
            alias: await contact.alias() || '',
          });
        }
      }
      
      console.log(`📋 加载了 ${this.contacts.size} 个联系人`);
    } catch (error) {
      console.error('❌ 加载联系人失败:', error);
    }
  }

  // 加载群组列表
  async loadRooms() {
    if (!this.bot || !this.isLoggedIn) return;
    
    try {
      const roomList = await this.bot.Room.findAll();
      this.rooms.clear();
      
      for (const room of roomList) {
        this.rooms.set(room.id, {
          id: room.id,
          topic: await room.topic(),
        });
      }
      
      console.log(`🏠 加载了 ${this.rooms.size} 个群组`);
    } catch (error) {
      console.error('❌ 加载群组失败:', error);
    }
  }

  // 发送文本消息
  async sendText(toType, toId, text) {
    if (!this.isLoggedIn) {
      throw new Error('个人微信未登录');
    }

    try {
      let target = null;

      if (toType === 'filehelper') {
        target = this.bot.Contact.load('filehelper');
      } else if (toType === 'contact') {
        if (!toId) throw new Error('缺少联系人ID');
        target = this.bot.Contact.load(toId);
      } else if (toType === 'room') {
        if (!toId) throw new Error('缺少群组ID');
        target = this.bot.Room.load(toId);
      } else {
        throw new Error('无效的目标类型');
      }

      await target.say(text);
      
      console.log(`📤 个人微信消息发送成功:`, {
        toType,
        toId: toId || 'filehelper',
        text: text.substring(0, 50) + (text.length > 50 ? '...' : '')
      });

      return {
        success: true,
        messageId: 'personal_wechat_' + Date.now(),
        data: {
          toType,
          toId: toId || 'filehelper',
          text,
        }
      };

    } catch (error) {
      console.error('❌ 个人微信发送消息失败:', error);
      throw error;
    }
  }

  // 发送文件
  async sendFile(toType, toId, url, filename) {
    if (!this.isLoggedIn) {
      throw new Error('个人微信未登录');
    }

    try {
      let target = null;

      if (toType === 'filehelper') {
        target = this.bot.Contact.load('filehelper');
      } else if (toType === 'contact') {
        if (!toId) throw new Error('缺少联系人ID');
        target = this.bot.Contact.load(toId);
      } else if (toType === 'room') {
        if (!toId) throw new Error('缺少群组ID');
        target = this.bot.Room.load(toId);
      }

      const fileBox = FileBox.fromUrl(url, filename);
      await target.say(fileBox);
      
      console.log(`📎 个人微信文件发送成功:`, {
        toType,
        toId: toId || 'filehelper',
        url,
        filename
      });

      return {
        success: true,
        messageId: 'personal_wechat_file_' + Date.now(),
        data: { toType, toId, url, filename }
      };

    } catch (error) {
      console.error('❌ 个人微信发送文件失败:', error);
      throw error;
    }
  }

  // 获取联系人列表
  getContacts() {
    return Array.from(this.contacts.values()).map(contact => ({
      id: contact.id,
      name: contact.name,
      alias: contact.alias
    }));
  }

  // 获取群组列表
  getRooms() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      topic: room.topic
    }));
  }

  // 健康检查
  async healthCheck() {
    return {
      status: 'ok',
      service: 'personal-wechat',
      puppetType: this.puppetType,
      loggedIn: this.isLoggedIn,
      botName: this.botSelf ? this.botSelf.name() : null,
      contacts: this.contacts.size,
      rooms: this.rooms.size
    };
  }

  // 停止服务
  async stop() {
    if (this.bot) {
      await this.bot.stop();
    }
  }
}

module.exports = PersonalWechatService;