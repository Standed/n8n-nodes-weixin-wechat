const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * WxAuto个人微信服务类
 * 通过Python wxauto库控制微信PC版
 */
class WxAutoWechatService {
  constructor(config = {}) {
    this.isLoggedIn = false;
    this.pythonPath = config.pythonPath || 'python';
    this.scriptPath = path.join(__dirname, '../wxauto_scripts');
    this.contacts = new Map();
    this.rooms = new Map();
    
    // 确保脚本目录存在
    if (!fs.existsSync(this.scriptPath)) {
      fs.mkdirSync(this.scriptPath, { recursive: true });
    }
    
    this.initService();
  }

  async initService() {
    try {
      console.log('🤖 初始化WxAuto个人微信服务...');
      console.log('✨ 特点：');
      console.log('   - 基于UI自动化，兼容性强');
      console.log('   - 无需网络协议，直接控制微信界面');
      console.log('   - 支持发送文本、图片、文件等');
      console.log('   - 适合个人和小团队使用');
      
      // 创建Python脚本
      await this.createPythonScripts();
      
      // 检查微信登录状态
      await this.checkLoginStatus();
      
      console.log('✅ WxAuto个人微信服务初始化完成');
    } catch (error) {
      console.error('❌ WxAuto初始化失败:', error.message);
      console.log('💡 解决方案：');
      console.log('   1. 安装Python: https://python.org');
      console.log('   2. 安装wxauto: pip install wxauto');
      console.log('   3. 确保微信PC版已登录');
      console.log('   4. 西羊石AI提供技术支持: https://xysaiai.cn/');
      
      this.isLoggedIn = false;
    }
  }

  // 创建Python脚本
  async createPythonScripts() {
    // 发送文本消息脚本
    const sendTextScript = `
# -*- coding: utf-8 -*-
import sys
import json
from wxauto import WeChat

def send_text_message(to_name, message, to_type='contact'):
    try:
        # 获取微信实例
        wx = WeChat()
        
        if to_type == 'contact':
            # 发送给联系人
            wx.SendMsg(msg=message, who=to_name)
        elif to_type == 'room':
            # 发送到群聊
            wx.SendMsg(msg=message, who=to_name)
        elif to_type == 'filehelper':
            # 发送到文件传输助手
            wx.SendMsg(msg=message, who='文件传输助手')
        
        return {"success": True, "message": "发送成功"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "error": "参数不足"}))
        sys.exit(1)
    
    to_type = sys.argv[1]
    to_name = sys.argv[2] if sys.argv[2] != 'null' else '文件传输助手'
    message = sys.argv[3]
    
    result = send_text_message(to_name, message, to_type)
    print(json.dumps(result, ensure_ascii=False))
`;

    // 发送文件脚本
    const sendFileScript = `
# -*- coding: utf-8 -*-
import sys
import json
import os
import requests
import tempfile
from wxauto import WeChat

def extract_extension_from_url(url):
    """从URL中提取文件扩展名"""
    try:
        from urllib.parse import urlparse, unquote
        parsed = urlparse(url)
        path = unquote(parsed.path)
        if '.' in path:
            return '.' + path.split('.')[-1].lower()
        return ''
    except:
        return ''

def get_extension_from_content_type(content_type):
    """根据Content-Type获取文件扩展名"""
    content_type_map = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg', 
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'video/mp4': '.mp4',
        'video/avi': '.avi',
        'audio/mp3': '.mp3',
        'audio/mpeg': '.mp3',
        'audio/wav': '.wav',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'text/plain': '.txt',
        'application/zip': '.zip',
        'application/x-rar': '.rar'
    }
    return content_type_map.get(content_type.lower(), '')

def smart_filename(url, original_filename):
    """智能生成文件名，确保有正确的扩展名"""
    # 从URL提取扩展名
    url_ext = extract_extension_from_url(url)
    
    # 如果原始文件名有扩展名，直接使用
    if original_filename and '.' in original_filename:
        return original_filename
    
    # 如果没有原始文件名，从URL提取文件名
    if not original_filename:
        from urllib.parse import urlparse, unquote
        parsed = urlparse(url)
        path_parts = unquote(parsed.path).split('/')
        for part in reversed(path_parts):
            if part and '.' in part:
                return part
        # 如果URL中也没有文件名，使用默认名称加扩展名
        return 'file' + (url_ext if url_ext else '')
    
    # 原始文件名存在但没有扩展名，添加URL扩展名
    if url_ext:
        return original_filename + url_ext
    
    return original_filename

def download_file(url, filename):
    """下载文件到临时目录，智能处理文件扩展名"""
    try:
        import ssl
        import urllib3
        # 忽略SSL验证警告
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        # 配置requests会话，忽略SSL验证
        session = requests.Session()
        session.verify = False
        
        # 设置更长的超时时间和重试机制
        response = session.get(url, stream=True, timeout=(10, 30))
        response.raise_for_status()
        
        # 智能生成文件名
        smart_name = smart_filename(url, filename)
        
        # 如果还是没有扩展名，尝试从Content-Type获取
        if '.' not in smart_name:
            content_type = response.headers.get('content-type', '')
            ext = get_extension_from_content_type(content_type)
            if ext:
                smart_name += ext
        
        # 创建唯一的临时文件（避免并发冲突）
        import uuid
        import time
        temp_dir = tempfile.gettempdir()
        # 添加时间戳和UUID避免文件名冲突  
        timestamp = str(int(time.time()))
        unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}_{smart_name}"
        file_path = os.path.join(temp_dir, unique_filename)
        
        # 确保文件不存在，如果存在则重新生成
        retry_count = 0
        while os.path.exists(file_path) and retry_count < 5:
            retry_count += 1
            unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}_{retry_count}_{smart_name}"
            file_path = os.path.join(temp_dir, unique_filename)
        
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
            f.flush()  # 确保数据写入磁盘
            os.fsync(f.fileno())  # 强制同步到磁盘
        
        # 确保文件完全写入后再返回
        import time
        time.sleep(0.1)  # 短暂等待文件系统同步
        
        print(f"📁 文件下载成功: {unique_filename}")
        return file_path
        
    except requests.exceptions.SSLError as e:
        # SSL错误重试，使用不安全的连接
        print(f"⚠️ SSL错误，尝试不安全连接: {e}")
        try:
            import ssl
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            response = requests.get(url, stream=True, verify=False, timeout=(15, 60))
            response.raise_for_status()
            
            smart_name = smart_filename(url, filename)
            if '.' not in smart_name:
                content_type = response.headers.get('content-type', '')
                ext = get_extension_from_content_type(content_type)
                if ext:
                    smart_name += ext
            
            import uuid
            import time
            temp_dir = tempfile.gettempdir()
            timestamp = str(int(time.time()))
            unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}_ssl_{smart_name}"
            file_path = os.path.join(temp_dir, unique_filename)
            
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                f.flush()  # 确保数据写入磁盘
                os.fsync(f.fileno())  # 强制同步到磁盘
            
            # 确保文件完全写入后再返回
            import time
            time.sleep(0.1)  # 短暂等待文件系统同步
            
            print(f"📁 SSL重试下载成功: {unique_filename}")
            return file_path
            
        except Exception as retry_e:
            raise Exception(f"下载文件失败 (SSL重试也失败): {retry_e}")
            
    except Exception as e:
        raise Exception(f"下载文件失败: {e}")

def send_file_message(to_name, file_url, filename, to_type='contact'):
    try:
        # 下载文件
        local_file_path = download_file(file_url, filename)
        
        # 获取微信实例
        wx = WeChat()
        
        # 发送前确保文件可访问并等待句柄释放
        def ensure_file_ready(file_path, max_wait=3):
            import time
            for attempt in range(max_wait * 2):  # 每0.5秒检查一次
                try:
                    # 尝试打开文件检查是否可读
                    with open(file_path, 'rb') as test_file:
                        test_file.read(1)  # 读取1字节测试
                    print(f"✅ 文件可访问: {os.path.basename(file_path)}")
                    return True
                except (OSError, IOError) as e:
                    if attempt < (max_wait * 2) - 1:
                        print(f"⏳ 等待文件可访问 {attempt + 1}/{max_wait * 2}: {e}")
                        time.sleep(0.5)
                        continue
                    else:
                        print(f"❌ 文件仍不可访问: {e}")
                        return False
            return False
        
        # 确保文件准备就绪后再发送
        if not ensure_file_ready(local_file_path):
            raise Exception(f"文件被占用无法发送: {os.path.basename(local_file_path)}")
        
        if to_type == 'contact':
            wx.SendFiles(filepath=local_file_path, who=to_name)
        elif to_type == 'room':
            wx.SendFiles(filepath=local_file_path, who=to_name)
        elif to_type == 'filehelper':
            wx.SendFiles(filepath=local_file_path, who='文件传输助手')
        
        # 清理临时文件（延时重试机制）
        def cleanup_file(file_path, max_retries=3):
            import time
            for attempt in range(max_retries):
                try:
                    if os.path.exists(file_path):
                        # 短暂延时让微信释放文件句柄
                        time.sleep(0.5)
                        os.remove(file_path)
                        print(f"🗑️ 临时文件已清理: {os.path.basename(file_path)}")
                        return True
                except OSError as e:
                    if attempt < max_retries - 1:
                        print(f"⚠️ 清理文件重试 {attempt + 1}/{max_retries}: {e}")
                        time.sleep(1)  # 等待更长时间
                        continue
                    else:
                        print(f"⚠️ 无法清理临时文件（文件可能仍被使用）: {e}")
                        return False
            return False
        
        # 即使清理失败也不影响发送成功的判断
        cleanup_success = cleanup_file(local_file_path)
        
        return {
            "success": True, 
            "message": "文件发送成功",
            "cleanup": "成功" if cleanup_success else "延迟清理（文件可能仍被使用）"
        }
        
    except Exception as e:
        # 如果发送失败，也尝试清理临时文件
        try:
            if 'local_file_path' in locals() and os.path.exists(local_file_path):
                cleanup_file(local_file_path)
        except:
            pass
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(json.dumps({"success": False, "error": "参数不足"}))
        sys.exit(1)
    
    to_type = sys.argv[1]
    to_name = sys.argv[2] if sys.argv[2] != 'null' else '文件传输助手'
    file_url = sys.argv[3]
    filename = sys.argv[4]
    
    result = send_file_message(to_name, file_url, filename, to_type)
    print(json.dumps(result, ensure_ascii=False))
`;

    // 获取联系人列表脚本
    const getContactsScript = `
# -*- coding: utf-8 -*-
import json
from wxauto import WeChat

def get_contacts():
    try:
        wx = WeChat()
        
        # 获取联系人列表
        contacts = wx.GetAllFriends()
        
        contact_list = []
        for contact in contacts:
            contact_list.append({
                "id": contact,
                "name": contact,
                "alias": "",
                "type": "contact"
            })
        
        return {"success": True, "contacts": contact_list}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    result = get_contacts()
    print(json.dumps(result, ensure_ascii=False))
`;

    // 检查登录状态脚本
    const checkLoginScript = `
# -*- coding: utf-8 -*-
import json
from wxauto import WeChat

def check_login():
    try:
        wx = WeChat()
        # 尝试获取当前用户信息来验证登录状态
        current_user = wx.CurrentUser()
        
        return {
            "success": True, 
            "logged_in": True,
            "user": current_user
        }
        
    except Exception as e:
        return {
            "success": False, 
            "logged_in": False,
            "error": str(e)
        }

if __name__ == "__main__":
    result = check_login()
    print(json.dumps(result, ensure_ascii=False))
`;

    // 写入Python脚本文件
    const scripts = {
      'send_text.py': sendTextScript,
      'send_file.py': sendFileScript,
      'get_contacts.py': getContactsScript,
      'check_login.py': checkLoginScript
    };

    for (const [filename, content] of Object.entries(scripts)) {
      const filePath = path.join(this.scriptPath, filename);
      fs.writeFileSync(filePath, content.trim(), 'utf8');
    }
  }

  // 执行Python脚本
  async executePythonScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptPath, scriptName);
      const process = spawn(this.pythonPath, [scriptPath, ...args]);
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python脚本执行失败: ${stderr}`));
          return;
        }
        
        try {
          // 提取JSON部分（可能混杂了其他输出）
          const lines = stdout.trim().split('\n');
          let jsonStr = '';
          
          // 从后往前找JSON行
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('{') && line.endsWith('}')) {
              jsonStr = line;
              break;
            }
          }
          
          if (!jsonStr) {
            // 如果找不到完整JSON，尝试解析所有行
            jsonStr = lines.find(line => {
              const trimmed = line.trim();
              return trimmed.includes('"success"') && trimmed.startsWith('{');
            }) || '';
          }
          
          if (jsonStr) {
            const result = JSON.parse(jsonStr);
            resolve(result);
          } else {
            // 如果没有找到JSON，但stdout包含success信息，创建结果对象
            if (stdout.includes('发送成功') || stdout.includes('文件发送成功')) {
              resolve({ success: true, message: '操作成功' });
            } else {
              reject(new Error(`未找到有效JSON输出: ${stdout}`));
            }
          }
        } catch (error) {
          // 尝试从输出中判断操作是否成功
          if (stdout.includes('发送成功') || stdout.includes('文件发送成功')) {
            resolve({ success: true, message: '操作成功' });
          } else {
            reject(new Error(`解析Python脚本输出失败: ${stdout}`));
          }
        }
      });
      
      // 设置超时
      setTimeout(() => {
        process.kill();
        reject(new Error('Python脚本执行超时'));
      }, 30000);
    });
  }

  // 检查登录状态
  async checkLoginStatus() {
    try {
      const result = await this.executePythonScript('check_login.py');
      this.isLoggedIn = result.logged_in;
      return result;
    } catch (error) {
      console.warn('检查登录状态失败:', error.message);
      this.isLoggedIn = false;
      return { logged_in: false, error: error.message };
    }
  }

  // 发送文本消息
  async sendText(toType, toId, text) {
    if (!this.isLoggedIn) {
      // 重新检查登录状态
      await this.checkLoginStatus();
    }

    try {
      const result = await this.executePythonScript('send_text.py', [
        toType || 'filehelper',
        toId || 'null',
        text
      ]);

      if (result.success) {
        return {
          success: true,
          messageId: 'wxauto_' + Date.now(),
          to: toId,
          type: toType,
          response: result
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ WxAuto发送消息失败:', error.message);
      throw new Error(`个人微信发送失败: ${error.message}`);
    }
  }

  // 发送文件
  async sendFile(toType, toId, fileUrl, fileName) {
    if (!this.isLoggedIn) {
      await this.checkLoginStatus();
    }

    try {
      const result = await this.executePythonScript('send_file.py', [
        toType || 'filehelper',
        toId || 'null',
        fileUrl,
        fileName || 'file'
      ]);

      if (result.success) {
        return {
          success: true,
          messageId: 'wxauto_file_' + Date.now(),
          to: toId,
          type: toType,
          fileName: fileName,
          response: result
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ WxAuto发送文件失败:', error.message);
      throw new Error(`个人微信文件发送失败: ${error.message}`);
    }
  }

  // 发送文件数据 (来自N8N节点的二进制数据)
  async sendFileData(toType, toId, fileData, caption) {
    if (!this.isLoggedIn) {
      await this.checkLoginStatus();
    }

    try {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');

      // 创建临时文件
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, fileData.fileName || 'file');
      
      // 写入文件数据 (这里假设fileData包含buffer或base64数据)
      if (fileData.data) {
        let buffer;
        if (typeof fileData.data === 'string') {
          // 假设是base64数据
          buffer = Buffer.from(fileData.data, 'base64');
        } else {
          buffer = fileData.data;
        }
        
        fs.writeFileSync(tempFilePath, buffer);
      }

      // 使用现有的sendFile逻辑发送
      const fileUrl = `file://${tempFilePath}`;
      const result = await this.sendFile(toType, toId, fileUrl, fileData.fileName);

      // 清理临时文件
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      return result;
    } catch (error) {
      console.error('❌ WxAuto发送文件数据失败:', error.message);
      throw new Error(`个人微信文件数据发送失败: ${error.message}`);
    }
  }

  // 批量发送文本消息（支持延迟和防封号）
  async sendTextBatch(toType, toIds, text, batchOptions = {}) {
    const { sendDelay = 3, randomDelay = true } = batchOptions;
    const results = [];
    
    console.log(`📢 开始批量发送文本消息给 ${toIds.length} 个目标`);
    console.log(`⏰ 基础延迟: ${sendDelay}秒, 随机延迟: ${randomDelay ? '开启' : '关闭'}`);

    for (let i = 0; i < toIds.length; i++) {
      const toId = toIds[i];
      try {
        console.log(`📤 发送给: ${toId} (${i + 1}/${toIds.length})`);
        const result = await this.sendText(toType, toId, text);
        results.push({ toId, success: true, result });

        // 添加延迟（除了最后一个）
        if (i < toIds.length - 1) {
          let delay = sendDelay * 1000; // 转换为毫秒
          
          if (randomDelay) {
            // 添加1-5秒的随机延迟
            const randomMs = Math.floor(Math.random() * 5000) + 1000;
            delay += randomMs;
          }
          
          console.log(`⏱️ 等待 ${Math.round(delay / 1000)} 秒后发送下一条...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`❌ 发送给 ${toId} 失败:`, error.message);
        results.push({ toId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ 批量发送完成: ${successCount}/${toIds.length} 成功`);

    return {
      success: true,
      batchResults: results,
      summary: {
        total: toIds.length,
        successful: successCount,
        failed: toIds.length - successCount
      }
    };
  }

  // 批量发送文件（URL方式）
  async sendFileBatch(toType, toIds, fileUrl, fileName, caption, batchOptions = {}) {
    const { sendDelay = 3, randomDelay = true } = batchOptions;
    const results = [];
    
    console.log(`📁 开始批量发送文件给 ${toIds.length} 个目标: ${fileName}`);

    for (let i = 0; i < toIds.length; i++) {
      const toId = toIds[i];
      try {
        console.log(`📤 发送文件给: ${toId} (${i + 1}/${toIds.length})`);
        const result = await this.sendFile(toType, toId, fileUrl, fileName);
        
        // 如果有说明文字，单独发送
        if (caption) {
          await this.sendText(toType, toId, caption);
        }
        
        results.push({ toId, success: true, result });

        // 添加延迟
        if (i < toIds.length - 1) {
          let delay = sendDelay * 1000;
          if (randomDelay) {
            delay += Math.floor(Math.random() * 5000) + 1000;
          }
          console.log(`⏱️ 等待 ${Math.round(delay / 1000)} 秒后发送下一个文件...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`❌ 发送文件给 ${toId} 失败:`, error.message);
        results.push({ toId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ 批量文件发送完成: ${successCount}/${toIds.length} 成功`);

    return {
      success: true,
      batchResults: results,
      summary: {
        total: toIds.length,
        successful: successCount,
        failed: toIds.length - successCount
      }
    };
  }

  // 批量发送文件数据
  async sendFileDataBatch(toType, toIds, fileData, caption, batchOptions = {}) {
    const { sendDelay = 3, randomDelay = true } = batchOptions;
    const results = [];
    
    console.log(`📁 开始批量发送文件数据给 ${toIds.length} 个目标: ${fileData.fileName}`);

    for (let i = 0; i < toIds.length; i++) {
      const toId = toIds[i];
      try {
        console.log(`📤 发送文件数据给: ${toId} (${i + 1}/${toIds.length})`);
        const result = await this.sendFileData(toType, toId, fileData, caption);
        results.push({ toId, success: true, result });

        // 添加延迟
        if (i < toIds.length - 1) {
          let delay = sendDelay * 1000;
          if (randomDelay) {
            delay += Math.floor(Math.random() * 5000) + 1000;
          }
          console.log(`⏱️ 等待 ${Math.round(delay / 1000)} 秒后发送下一个...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`❌ 发送文件数据给 ${toId} 失败:`, error.message);
        results.push({ toId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ 批量文件数据发送完成: ${successCount}/${toIds.length} 成功`);

    return {
      success: true,
      batchResults: results,
      summary: {
        total: toIds.length,
        successful: successCount,
        failed: toIds.length - successCount
      }
    };
  }

  // 获取联系人列表
  async getContacts() {
    try {
      const result = await this.executePythonScript('get_contacts.py');
      
      if (result.success) {
        // 更新本地缓存
        this.contacts.clear();
        result.contacts.forEach(contact => {
          this.contacts.set(contact.id, contact);
        });
        return result.contacts;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ 获取联系人失败:', error.message);
      return [];
    }
  }

  // 获取群聊列表
  async getRooms() {
    // WxAuto的群聊获取功能，暂时返回空数组
    return [];
  }

  // 获取登录状态
  getLoginStatus() {
    return {
      isLoggedIn: this.isLoggedIn,
      qrCodeUrl: null,
      contactCount: this.contacts.size,
      roomCount: this.rooms.size,
      service: 'wxauto-wechat'
    };
  }

  // 健康检查
  async healthCheck() {
    try {
      const loginStatus = await this.checkLoginStatus();
      return {
        status: this.isLoggedIn ? 'ok' : 'waiting_login',
        service: 'wxauto-wechat',
        authenticated: this.isLoggedIn,
        contactCount: this.contacts.size,
        roomCount: this.rooms.size,
        ...loginStatus
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'wxauto-wechat',
        error: error.message
      };
    }
  }

  // 停止服务
  async stop() {
    console.log('🛑 WxAuto个人微信服务已停止');
    this.isLoggedIn = false;
    this.contacts.clear();
    this.rooms.clear();
  }
}

module.exports = WxAutoWechatService;