const axios = require('axios');
const FormData = require('form-data');

class EnterpriseWechatBotService {
  constructor(config) {
    this.webhookUrl = config.webhookUrl; // 企业微信群机器人webhook URL
    
    // 安全配置
    this.maxFileSize = {
      image: 50 * 1024 * 1024,     // 图片 50MB
      video: 1024 * 1024 * 1024,   // 视频 1GB
      document: 500 * 1024 * 1024, // 文档 500MB  
      presentation: 1024 * 1024 * 1024, // PPT等演示文件 1GB
      file: 100 * 1024 * 1024      // 其他文件 100MB
    };
    
    // 速率限制
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.maxRequestsPerMinute = 20; // 每分钟最多20个请求
  }

  // 速率限制检查
  checkRateLimit() {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    // 重置计数器
    if (now - this.lastRequestTime > oneMinute) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }
    
    this.requestCount++;
    
    if (this.requestCount > this.maxRequestsPerMinute) {
      throw new Error(`请求过于频繁，每分钟最多${this.maxRequestsPerMinute}个请求`);
    }
  }

  // 发送文本消息
  async sendText(text) {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      this.checkRateLimit();
      const response = await axios.post(this.webhookUrl, {
        msgtype: 'text',
        text: {
          content: text
        }
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (response.data.errcode === 0) {
        console.log('✅ 企业微信机器人消息发送成功');
        return {
          success: true,
          messageId: 'enterprise_bot_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`企业微信机器人发送失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 企业微信机器人发送失败:', error.message);
      throw error;
    }
  }

  // 发送Markdown消息
  async sendMarkdown(content) {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      this.checkRateLimit();
      const response = await axios.post(this.webhookUrl, {
        msgtype: 'markdown',
        markdown: {
          content: content
        }
      });

      if (response.data.errcode === 0) {
        console.log('✅ 企业微信机器人Markdown消息发送成功');
        return {
          success: true,
          messageId: 'enterprise_bot_md_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`企业微信机器人发送失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 企业微信机器人发送失败:', error.message);
      throw error;
    }
  }

  // 发送图片
  async sendImage(imageUrl) {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      this.checkRateLimit();
      // 先下载图片转换为base64
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
      const md5 = require('crypto').createHash('md5').update(imageResponse.data).digest('hex');

      const response = await axios.post(this.webhookUrl, {
        msgtype: 'image',
        image: {
          base64: base64Image,
          md5: md5
        }
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (response.data.errcode === 0) {
        console.log('✅ 企业微信机器人图片发送成功');
        return {
          success: true,
          messageId: 'enterprise_bot_img_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`企业微信机器人发送失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 企业微信机器人发送图片失败:', error.message);
      throw error;
    }
  }

  // 文件安全校验
  async validateFile(fileUrl, fileName) {
    // URL安全检查
    if (!this.isValidUrl(fileUrl)) {
      throw new Error('无效的文件URL');
    }

    // 获取文件基本信息
    const fileInfo = await this.getFileInfo(fileUrl);
    
    // 智能文件大小检查
    const extension = this.getFileExtensionFromUrl(fileName).toLowerCase();
    let maxSize;
    let fileCategory;
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extension)) {
      maxSize = this.maxFileSize.image;
      fileCategory = '图片';
    } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(extension)) {
      maxSize = this.maxFileSize.video;  
      fileCategory = '视频';
    } else if (['.ppt', '.pptx'].includes(extension)) {
      maxSize = this.maxFileSize.presentation;
      fileCategory = 'PPT演示';
    } else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'].includes(extension)) {
      maxSize = this.maxFileSize.document;
      fileCategory = '文档';
    } else {
      maxSize = this.maxFileSize.file;
      fileCategory = '文件';
    }
    
    if (fileInfo.size > 0 && fileInfo.size > maxSize) {
      throw new Error(`${fileCategory}文件过大: ${Math.round(fileInfo.size / 1024 / 1024)}MB，最大限制: ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // 文件类型安全检查
    if (!this.isSafeFileType(fileName, fileInfo.contentType)) {
      throw new Error(`不支持的文件类型: ${fileInfo.contentType}`);
    }

    console.log(`🔍 文件校验通过: ${fileName} (${Math.round(fileInfo.size / 1024)}KB, ${fileInfo.contentType})`);
    return fileInfo;
  }

  // 获取文件信息
  async getFileInfo(fileUrl) {
    try {
      // 发送HEAD请求获取文件信息，避免下载整个文件
      const response = await axios.head(fileUrl, { timeout: 10000 });
      return {
        size: parseInt(response.headers['content-length']) || 0,
        contentType: response.headers['content-type'] || 'application/octet-stream',
        lastModified: response.headers['last-modified']
      };
    } catch (error) {
      console.log('⚠️  无法获取文件头信息，将在下载时检查大小');
      return {
        size: 0,
        contentType: 'application/octet-stream'
      };
    }
  }

  // URL安全检查
  isValidUrl(urlString) {
    try {
      const url = new URL(urlString);
      // 只允许 HTTP/HTTPS 协议
      if (!['http:', 'https:'].includes(url.protocol)) {
        return false;
      }
      // 禁止访问内网地址
      const hostname = url.hostname.toLowerCase();
      const forbiddenHosts = [
        'localhost', '127.0.0.1', '0.0.0.0',
        '10.', '172.16.', '172.17.', '172.18.', '172.19.',
        '172.20.', '172.21.', '172.22.', '172.23.',
        '172.24.', '172.25.', '172.26.', '172.27.',
        '172.28.', '172.29.', '172.30.', '172.31.',
        '192.168.'
      ];
      return !forbiddenHosts.some(forbidden => hostname.includes(forbidden));
    } catch (error) {
      return false;
    }
  }

  // 文件类型安全检查 (企业微信机器人严格限制)
  isSafeFileType(fileName, contentType) {
    // 企业微信机器人支持的文件类型 (严格限制)
    const allowedExtensions = [
      '.mp4',                                                    // 视频 (仅mp4)
      '.jpg', '.jpeg', '.png',                                  // 图片 (不支持gif, bmp, webp)
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', // 文档
      '.mp3', '.wav'                                            // 音频 (基础格式)
    ];

    // 企业微信支持的MIME类型
    const allowedMimeTypes = [
      'video/mp4',                                              // 仅支持mp4视频
      'image/jpeg', 'image/jpg', 'image/png',                   // 仅支持这些图片格式  
      'audio/mpeg', 'audio/wav',                                // 基础音频格式
      'application/pdf',                                        // PDF
      'application/msword',                                     // Word文档
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.ms-excel',                               // xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-powerpoint',                          // ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'text/plain'                                              // 文本文件
    ];

    // 检查文件扩展名
    const extension = this.getFileExtensionFromUrl(fileName).toLowerCase();
    const hasValidExtension = allowedExtensions.includes(extension);

    // 检查MIME类型
    const hasValidMimeType = allowedMimeTypes.some(type => contentType.startsWith(type));

    return hasValidExtension && hasValidMimeType;
  }

  // 上传文件到企业微信获取media_id
  async uploadFile(fileUrl, fileName = '', fileType = 'file') {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      this.checkRateLimit();
      
      // 安全校验
      const fileInfo = await this.validateFile(fileUrl, fileName);

      // 从webhook URL提取key
      const keyMatch = this.webhookUrl.match(/key=([^&]+)/);
      if (!keyMatch) {
        throw new Error('无法从webhook URL提取key参数');
      }
      const key = keyMatch[1];

      console.log(`📤 开始上传文件: ${fileName}`);
      const startTime = Date.now();

      // 下载文件，设置大小限制
      const maxSize = fileType === 'video' ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
      const fileResponse = await axios.get(fileUrl, { 
        responseType: 'stream',
        timeout: 60000, // 60秒超时
        maxContentLength: maxSize,
        maxBodyLength: maxSize
      });

      // 实时检查下载大小
      let downloadedSize = 0;
      fileResponse.data.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (downloadedSize > maxSize) {
          fileResponse.data.destroy();
          throw new Error(`文件下载超过大小限制: ${Math.round(maxSize / 1024 / 1024)}MB`);
        }
      });
      
      // 创建表单数据
      const formData = new FormData();
      formData.append('media', fileResponse.data, { 
        filename: fileName || 'file',
        contentType: fileInfo.contentType
      });

      // 上传文件到企业微信
      const uploadUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/upload_media?key=${key}&type=${fileType}`;
      const uploadResponse = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders()
          // 不要手动设置Content-Type，FormData会自动生成正确的boundary
        },
        timeout: 120000 // 2分钟上传超时
      });

      const uploadTime = Date.now() - startTime;
      console.log(`⏱️  上传耗时: ${uploadTime}ms`);

      if (uploadResponse.data.errcode === 0) {
        console.log('✅ 文件上传成功，获得media_id:', uploadResponse.data.media_id);
        return uploadResponse.data.media_id;
      } else {
        throw new Error(`文件上传失败: ${uploadResponse.data.errmsg} (错误码: ${uploadResponse.data.errcode})`);
      }
    } catch (error) {
      console.error('❌ 文件上传失败:', error.message);
      throw error;
    }
  }

  // 通过media_id发送文件
  async sendFileByMediaId(mediaId) {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      const response = await axios.post(this.webhookUrl, {
        msgtype: 'file',
        file: {
          media_id: mediaId
        }
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (response.data.errcode === 0) {
        console.log('✅ 企业微信机器人文件消息发送成功');
        return {
          success: true,
          messageId: 'enterprise_bot_file_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`企业微信机器人发送失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 企业微信机器人发送文件失败:', error.message);
      throw error;
    }
  }

  // 从URL提取文件扩展名
  getFileExtensionFromUrl(fileUrl) {
    try {
      const url = new URL(fileUrl);
      const pathname = url.pathname;
      const lastDot = pathname.lastIndexOf('.');
      if (lastDot > -1) {
        return pathname.slice(lastDot);
      }
      return '';
    } catch (error) {
      // 如果URL解析失败，尝试简单的字符串匹配
      const match = fileUrl.match(/\.([a-zA-Z0-9]+)(\?|#|$)/);
      return match ? '.' + match[1] : '';
    }
  }

  // 智能生成文件名（确保包含正确扩展名）
  generateFileName(fileName, fileUrl) {
    const urlExtension = this.getFileExtensionFromUrl(fileUrl);
    
    if (!fileName) {
      return urlExtension ? `file${urlExtension}` : 'file';
    }

    // 检查用户提供的文件名是否已包含扩展名
    const hasExtension = fileName.includes('.') && fileName.split('.').pop().length <= 4;
    
    if (!hasExtension && urlExtension) {
      return `${fileName}${urlExtension}`;
    }
    
    return fileName;
  }

  // 发送视频消息（尝试视频类型，如果失败则降级为文件）
  async sendVideo(fileUrl, fileName = '') {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      // 从webhook URL提取key
      const keyMatch = this.webhookUrl.match(/key=([^&]+)/);
      if (!keyMatch) {
        throw new Error('无法从webhook URL提取key参数');
      }
      const key = keyMatch[1];

      // 尝试上传视频文件
      console.log(`🎬 尝试上传视频文件: ${fileName}`);
      const mediaId = await this.uploadFile(fileUrl, fileName, 'video');
      
      // 尝试发送视频消息
      const response = await axios.post(this.webhookUrl, {
        msgtype: 'video',
        video: {
          media_id: mediaId,
          title: fileName.replace(/\.[^/.]+$/, ""), // 移除扩展名作为标题
          description: '点击播放视频'
        }
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (response.data.errcode === 0) {
        console.log('✅ 企业微信机器人视频消息发送成功');
        return {
          success: true,
          messageId: 'enterprise_bot_video_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`视频消息发送失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.log(`⚠️  视频消息发送失败，降级为文件模式: ${error.message}`);
      // 降级为文件发送
      const mediaId = await this.uploadFile(fileUrl, fileName, 'file');
      return await this.sendFileByMediaId(mediaId);
    }
  }

  // 发送文件（智能处理）
  async sendFile(fileUrl, fileName = '') {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      const url = fileUrl.toLowerCase();
      // 智能生成带扩展名的文件名
      const smartFileName = this.generateFileName(fileName, fileUrl);
      
      console.log(`📝 智能文件名处理: "${fileName}" -> "${smartFileName}"`);

      // 视频文件 - 尝试视频消息类型
      if (url.includes('.mp4') || url.includes('.avi') || url.includes('.mov') || 
          url.includes('.wmv') || url.includes('.flv') || url.includes('.webm')) {
        
        try {
          console.log(`🎥 检测到视频文件，尝试视频消息发送: ${smartFileName}`);
          return await this.sendVideo(fileUrl, smartFileName);
        } catch (videoError) {
          console.log(`⚠️  视频消息发送失败，降级为链接模式: ${videoError.message}`);
          return await this.handleFileSend(fileUrl, smartFileName);
        }
      }

      // 文档文件 - 真实上传
      if (url.includes('.pdf') || url.includes('.doc') || url.includes('.docx') ||
          url.includes('.ppt') || url.includes('.pptx') || url.includes('.xls') ||
          url.includes('.xlsx') || url.includes('.zip') || url.includes('.rar')) {
        
        try {
          console.log(`🔄 正在上传文档文件: ${smartFileName}`);
          const mediaId = await this.uploadFile(fileUrl, smartFileName, 'file');
          const result = await this.sendFileByMediaId(mediaId);
          console.log('✅ 企业微信机器人文档文件发送成功');
          return result;
        } catch (uploadError) {
          console.log(`⚠️  文档上传失败，降级为链接模式: ${uploadError.message}`);
          return await this.handleFileSend(fileUrl, smartFileName);
        }
      }

      // 图片继续使用原有的图片发送方式
      if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') ||
          url.includes('.gif') || url.includes('.bmp') || url.includes('.webp')) {
        return await this.sendImage(fileUrl);
      }

      // 其他文件类型使用链接模式
      return await this.handleFileSend(fileUrl, smartFileName);

    } catch (error) {
      console.error('❌ 企业微信机器人发送文件失败:', error.message);
      throw error;
    }
  }

  // 智能处理文件发送
  async handleFileSend(fileUrl, fileName = '') {
    const url = fileUrl.toLowerCase();
    const name = fileName || 'file';
    
    // 视频文件 - 发送链接
    if (url.includes('.mp4') || url.includes('.avi') || url.includes('.mov') || 
        url.includes('.wmv') || url.includes('.flv') || url.includes('.webm')) {
      const videoText = `📹 ${name}\n${fileUrl}`;
      return await this.sendText(videoText);
    }
    
    // 音频文件 - 发送链接
    if (url.includes('.mp3') || url.includes('.wav') || url.includes('.flac') ||
        url.includes('.aac') || url.includes('.ogg')) {
      const audioText = `🎵 ${name}\n${fileUrl}`;
      return await this.sendText(audioText);
    }
    
    // 文档文件 - 发送链接
    if (url.includes('.pdf') || url.includes('.doc') || url.includes('.docx') ||
        url.includes('.ppt') || url.includes('.pptx') || url.includes('.xls') ||
        url.includes('.xlsx') || url.includes('.txt')) {
      const docText = `📄 ${name}\n${fileUrl}`;
      return await this.sendText(docText);
    }
    
    // 压缩文件 - 发送链接  
    if (url.includes('.zip') || url.includes('.rar') || url.includes('.7z') ||
        url.includes('.tar') || url.includes('.gz')) {
      const archiveText = `📦 ${name}\n${fileUrl}`;
      return await this.sendText(archiveText);
    }
    
    // 图片文件 - 直接发送图片
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') ||
        url.includes('.gif') || url.includes('.bmp') || url.includes('.webp')) {
      return await this.sendImage(fileUrl);
    }
    
    // 其他文件 - 发送通用链接
    const genericText = `📎 ${name}\n${fileUrl}`;
    return await this.sendText(genericText);
  }

  // 发送图文消息
  async sendNews(articles) {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      const response = await axios.post(this.webhookUrl, {
        msgtype: 'news',
        news: {
          articles: articles.map(article => ({
            title: article.title,
            description: article.description || '',
            url: article.url,
            picurl: article.picurl || ''
          }))
        }
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (response.data.errcode === 0) {
        console.log('✅ 企业微信机器人图文消息发送成功');
        return {
          success: true,
          messageId: 'enterprise_bot_news_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`企业微信机器人发送失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 企业微信机器人发送图文消息失败:', error.message);
      throw error;
    }
  }

  // 发送模板卡片
  async sendTemplateCard(cardType, cardData) {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      const response = await axios.post(this.webhookUrl, {
        msgtype: 'template_card',
        template_card: {
          card_type: cardType, // 'text_notice' 或 'news_notice'
          ...cardData
        }
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (response.data.errcode === 0) {
        console.log('✅ 企业微信机器人模板卡片发送成功');
        return {
          success: true,
          messageId: 'enterprise_bot_card_' + Date.now(),
          response: response.data
        };
      } else {
        throw new Error(`企业微信机器人发送失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('❌ 企业微信机器人发送模板卡片失败:', error.message);
      throw error;
    }
  }

  // 发送本地文件
  async sendLocalFile(filePath, fileName = '') {
    if (!this.webhookUrl) {
      throw new Error('未配置企业微信机器人 Webhook URL');
    }

    try {
      this.checkRateLimit();

      // 验证本地文件
      if (!require('fs').existsSync(filePath)) {
        throw new Error('本地文件不存在');
      }

      const fs = require('fs');
      const fileStats = fs.statSync(filePath);
      const finalFileName = this.generateFileName(fileName, fileName);
      
      console.log(`📁 本地文件处理: ${finalFileName} (${Math.round(fileStats.size / 1024)}KB)`);

      // 文件大小检查
      const extension = this.getFileExtensionFromUrl(finalFileName).toLowerCase();
      let maxSize;
      let fileCategory;
      
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extension)) {
        maxSize = this.maxFileSize.image;
        fileCategory = '图片';
      } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(extension)) {
        maxSize = this.maxFileSize.video;  
        fileCategory = '视频';
      } else if (['.ppt', '.pptx'].includes(extension)) {
        maxSize = this.maxFileSize.presentation;
        fileCategory = 'PPT演示';
      } else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'].includes(extension)) {
        maxSize = this.maxFileSize.document;
        fileCategory = '文档';
      } else {
        maxSize = this.maxFileSize.file;
        fileCategory = '文件';
      }
      
      if (fileStats.size > maxSize) {
        throw new Error(`${fileCategory}文件过大: ${Math.round(fileStats.size / 1024 / 1024)}MB，最大限制: ${Math.round(maxSize / 1024 / 1024)}MB`);
      }

      // 从webhook URL提取key
      const keyMatch = this.webhookUrl.match(/key=([^&]+)/);
      if (!keyMatch) {
        throw new Error('无法从webhook URL提取key参数');
      }
      const key = keyMatch[1];

      console.log(`📤 开始上传本地文件: ${finalFileName}`);
      const startTime = Date.now();

      // 创建文件流
      const fileStream = fs.createReadStream(filePath);
      
      // 创建表单数据
      const formData = new FormData();
      formData.append('media', fileStream, { 
        filename: finalFileName,
        contentType: this.getMimeTypeFromExtension(extension)
      });

      // 确定上传类型
      let uploadType = 'file';
      if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(extension)) {
        uploadType = 'video';
      }

      // 上传文件到企业微信
      const uploadUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/upload_media?key=${key}&type=${uploadType}`;
      const uploadResponse = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders()
          // 不要手动设置Content-Type，FormData会自动生成正确的boundary  
        },
        timeout: 300000 // 5分钟上传超时（本地文件可能较大）
      });

      const uploadTime = Date.now() - startTime;
      console.log(`⏱️  本地文件上传耗时: ${uploadTime}ms`);

      if (uploadResponse.data.errcode === 0) {
        console.log('✅ 本地文件上传成功，获得media_id:', uploadResponse.data.media_id);
        
        // 发送文件消息
        const result = await this.sendFileByMediaId(uploadResponse.data.media_id);
        console.log('✅ 企业微信机器人本地文件发送成功');
        return result;
      } else {
        throw new Error(`本地文件上传失败: ${uploadResponse.data.errmsg} (错误码: ${uploadResponse.data.errcode})`);
      }
    } catch (error) {
      console.error('❌ 本地文件上传失败:', error.message);
      throw error;
    }
  }

  // 根据扩展名获取MIME类型
  getMimeTypeFromExtension(extension) {
    const mimeTypes = {
      // 视频
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      // 图片
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      // 文档
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      // 压缩包
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed'
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  // 健康检查
  async healthCheck() {
    if (!this.webhookUrl) {
      return {
        status: 'error',
        service: 'enterprise-wechat-bot',
        authenticated: false,
        error: '未配置 Webhook URL'
      };
    }

    try {
      // 发送测试消息
      await this.sendText('健康检查 - 企业微信机器人正常运行');
      return {
        status: 'ok',
        service: 'enterprise-wechat-bot',
        authenticated: true
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'enterprise-wechat-bot',
        authenticated: false,
        error: error.message
      };
    }
  }
}

module.exports = EnterpriseWechatBotService;