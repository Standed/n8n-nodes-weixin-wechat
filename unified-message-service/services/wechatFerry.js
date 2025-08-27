const { WechatyBuilder } = require('wechaty');
const { WechatferryPuppet } = require('@wechatferry/puppet');

class WeChatFerryService {
  constructor(config) {
    this.isLoggedIn = false;
    this.bot = null;
    this.contacts = new Map();
    this.rooms = new Map();
    this.qrCodeUrl = null;
    this.loginPromise = null;
    
    // 初始化机器人
    this.initBot();
  }

  // 初始化机器人
  async initBot() {
    try {
      console.log('🚀 初始化WeChatFerry机器人...');
      console.log('⚠️  注意：WeChatFerry需要以下条件：');
      console.log('   1. Windows PC运行微信客户端');
      console.log('   2. 安装WCF DLL文件');
      console.log('   3. 微信版本兼容（推荐3.9.11.25）');
      
      const puppet = new WechatferryPuppet();
      this.bot = WechatyBuilder.build({
        puppet,
        name: 'WeChatFerry-N8N',
      });

      // 绑定事件
      this.bot
        .on('scan', this.onScan.bind(this))
        .on('login', this.onLogin.bind(this))
        .on('logout', this.onLogout.bind(this))
        .on('message', this.onMessage.bind(this))
        .on('error', this.onError.bind(this));

      // 启动机器人
      await this.bot.start();
      console.log('✅ WeChatFerry机器人启动成功');
      
    } catch (error) {
      console.error('❌ WeChatFerry初始化失败:', error.message);
      console.log('💡 如果连接失败，请确保：');
      console.log('   - PC微信已登录');
      console.log('   - WeChatFerry DLL已正确安装');
      console.log('   - 端口10086未被占用');
      
      // 不抛出错误，允许服务继续运行
      this.isLoggedIn = false;
      this.qrCodeUrl = 'https://xysaiai.cn - 请访问官网获取更多帮助';
    }
  }

  // 扫码事件
  async onScan(qrcode, status) {
    this.qrCodeUrl = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
    console.log(`📱 WeChatFerry扫码登录状态: ${status}`);
    console.log(`🔗 扫码链接: ${this.qrCodeUrl}`);
    console.log('💡 请用微信扫描上方二维码登录');
  }

  // 登录事件
  async onLogin(user) {
    this.isLoggedIn = true;
    console.log(`✅ WeChatFerry登录成功: ${user.name()}`);
    
    // 加载联系人和群聊
    await this.loadContactsAndRooms();
  }

  // 登出事件
  async onLogout(user) {
    this.isLoggedIn = false;
    console.log(`👋 WeChatFerry登出: ${user.name()}`);
    this.contacts.clear();
    this.rooms.clear();
  }

  // 消息事件
  async onMessage(message) {
    // 这里可以添加消息处理逻辑
    const from = message.talker();
    const text = message.text();
    const room = message.room();
    
    if (message.self()) return; // 忽略自己的消息
    
    console.log(`📨 WeChatFerry收到消息: ${from.name()}: ${text}`);
  }

  // 错误事件
  async onError(error) {
    console.error('❌ WeChatFerry错误:', error);
  }

  // 加载联系人和群聊
  async loadContactsAndRooms() {
    try {
      // 加载联系人
      const contactList = await this.bot.Contact.findAll();
      for (const contact of contactList) {
        if (contact.type() === this.bot.Contact.Type.Individual) {
          this.contacts.set(contact.id, {
            id: contact.id,
            name: contact.name(),
            alias: await contact.alias() || '',
          });
        }
      }
      console.log(`📇 加载了 ${this.contacts.size} 个联系人`);

      // 加载群聊
      const roomList = await this.bot.Room.findAll();
      for (const room of roomList) {
        this.rooms.set(room.id, {
          id: room.id,
          topic: await room.topic(),
          memberCount: (await room.memberAll()).length,
        });
      }
      console.log(`👥 加载了 ${this.rooms.size} 个群聊`);
      
    } catch (error) {
      console.error('❌ 加载联系人和群聊失败:', error.message);
    }
  }

  // 发送文本消息
  async sendText(toType, toId, text) {
    if (!this.isLoggedIn) {
      throw new Error('WeChatFerry未登录。需要：1)PC微信已登录 2)WCF DLL已安装 3)访问 https://xysaiai.cn 获取帮助');
    }

    try {
      let sayable;
      
      if (toType === 'filehelper') {
        sayable = await this.bot.Contact.find({ name: 'filehelper' });
      } else if (toType === 'contact') {
        // 通过名称或别名查找联系人
        sayable = await this.bot.Contact.find(contact => 
          contact.name() === toId || contact.alias() === toId
        );
      } else if (toType === 'room') {
        // 通过群名查找群聊
        sayable = await this.bot.Room.find({ topic: toId });
      }

      if (!sayable) {
        throw new Error(`未找到目标: ${toType} - ${toId}`);
      }

      await sayable.say(text);
      
      return {
        success: true,
        messageId: 'wechatferry_' + Date.now(),
        to: toId,
        type: toType,
      };

    } catch (error) {
      console.error('❌ WeChatFerry发送消息失败:', error.message);
      throw error;
    }
  }

  // 发送文件
  async sendFile(toType, toId, fileUrl, fileName) {
    if (!this.isLoggedIn) {
      throw new Error('WeChatFerry未登录。需要：1)PC微信已登录 2)WCF DLL已安装 3)访问 https://xysaiai.cn 获取帮助');
    }

    try {
      let sayable;
      
      if (toType === 'filehelper') {
        sayable = await this.bot.Contact.find({ name: 'filehelper' });
      } else if (toType === 'contact') {
        sayable = await this.bot.Contact.find(contact => 
          contact.name() === toId || contact.alias() === toId
        );
      } else if (toType === 'room') {
        sayable = await this.bot.Room.find({ topic: toId });
      }

      if (!sayable) {
        throw new Error(`未找到目标: ${toType} - ${toId}`);
      }

      // WeChatFerry支持发送文件URL
      await sayable.say(fileUrl);
      
      return {
        success: true,
        messageId: 'wechatferry_file_' + Date.now(),
        to: toId,
        type: toType,
        fileName: fileName,
      };

    } catch (error) {
      console.error('❌ WeChatFerry发送文件失败:', error.message);
      throw error;
    }
  }

  // 获取联系人列表
  getContacts() {
    return Array.from(this.contacts.values());
  }

  // 获取群聊列表
  getRooms() {
    return Array.from(this.rooms.values());
  }

  // 获取登录状态
  getLoginStatus() {
    return {
      isLoggedIn: this.isLoggedIn,
      qrCodeUrl: this.qrCodeUrl,
      contactCount: this.contacts.size,
      roomCount: this.rooms.size,
    };
  }

  // 健康检查
  async healthCheck() {
    return {
      status: this.isLoggedIn ? 'ok' : 'waiting_login',
      service: 'wechatferry',
      authenticated: this.isLoggedIn,
      qrCodeUrl: this.qrCodeUrl,
      contactCount: this.contacts.size,
      roomCount: this.rooms.size,
    };
  }

  // 停止服务
  async stop() {
    if (this.bot) {
      await this.bot.stop();
      console.log('🛑 WeChatFerry服务已停止');
    }
  }
}

module.exports = WeChatFerryService;