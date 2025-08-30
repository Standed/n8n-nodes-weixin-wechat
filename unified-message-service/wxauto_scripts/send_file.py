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