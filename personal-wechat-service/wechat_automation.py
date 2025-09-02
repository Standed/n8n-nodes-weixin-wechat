#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
西羊石AI - 个人微信自动化脚本
基于wxauto实现Windows PC微信客户端自动化控制

官网: https://xysaiai.cn/
作者: 西羊石AI团队
"""

import sys
import json
import time
import logging
import os
import tempfile
import base64
import requests
import mimetypes
from datetime import datetime
from urllib.parse import urlparse
from pathlib import Path

# 配置日志 - 只输出到文件，避免污染stdout
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('wechat_automation.log', encoding='utf-8')
        # 移除StreamHandler()避免日志输出污染JSON结果
    ]
)

def log(message):
    """记录日志"""
    logging.info(f"[微信自动化] {message}")

def get_safe_filename(filename):
    """获取安全的文件名，移除非法字符"""
    if not filename:
        return "file"
    
    # 首先提取文件名部分（移除路径）
    # 处理Unix和Windows路径
    filename = os.path.basename(filename)
    
    # 如果basename后为空，使用默认名称
    if not filename:
        return "file"
    
    # 移除Windows文件名中的非法字符
    invalid_chars = '<>:"/\\|?*'
    safe_name = ''.join(c for c in filename if c not in invalid_chars)
    
    # 确保文件名不为空且不以点开始
    if not safe_name or safe_name.startswith('.'):
        safe_name = "file_" + safe_name
    
    return safe_name

def download_file_from_url(url, temp_dir):
    """从URL下载文件到临时目录"""
    try:
        log(f"开始下载文件: {url}")
        
        # 解析URL获取文件名
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        
        if not filename:
            # 如果URL没有文件名，根据Content-Type生成
            filename = "downloaded_file"
        
        filename = get_safe_filename(filename)
        
        # 下载文件
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, stream=True, timeout=30)
        response.raise_for_status()
        
        # 如果响应中有Content-Disposition，尝试获取真实文件名
        content_disposition = response.headers.get('Content-Disposition')
        if content_disposition and 'filename=' in content_disposition:
            try:
                actual_filename = content_disposition.split('filename=')[1].strip('"')
                if actual_filename:
                    filename = get_safe_filename(actual_filename)
            except:
                pass
        
        # 根据Content-Type添加扩展名（如果缺少）
        if '.' not in filename:
            content_type = response.headers.get('Content-Type', '')
            extension = mimetypes.guess_extension(content_type.split(';')[0])
            if extension:
                filename += extension
        
        # 保存到临时文件
        temp_file_path = os.path.join(temp_dir, filename)
        
        with open(temp_file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        log(f"文件下载成功: {temp_file_path} (大小: {os.path.getsize(temp_file_path)} 字节)")
        return temp_file_path, filename
        
    except Exception as e:
        log(f"文件下载失败: {str(e)}")
        raise Exception(f"下载文件失败: {str(e)}")

def save_binary_data_to_file(file_data, temp_dir, filename=None):
    """将二进制数据保存到临时文件"""
    try:
        if not filename:
            filename = "binary_file"
        
        filename = get_safe_filename(filename)
        
        # 处理不同的二进制数据格式
        if isinstance(file_data, dict):
            # N8N二进制数据格式
            if 'data' in file_data:
                binary_data = file_data['data']
                if 'fileName' in file_data and file_data['fileName']:
                    filename = get_safe_filename(file_data['fileName'])
                if 'mimeType' in file_data:
                    # 根据mimeType添加扩展名
                    if '.' not in filename:
                        extension = mimetypes.guess_extension(file_data['mimeType'])
                        if extension:
                            filename += extension
            else:
                binary_data = file_data
        else:
            binary_data = file_data
        
        # 处理base64编码的数据
        if isinstance(binary_data, str):
            try:
                binary_data = base64.b64decode(binary_data)
            except:
                # 如果不是base64，直接使用
                binary_data = binary_data.encode('utf-8')
        
        temp_file_path = os.path.join(temp_dir, filename)
        
        with open(temp_file_path, 'wb') as f:
            f.write(binary_data)
        
        log(f"二进制数据保存成功: {temp_file_path} (大小: {os.path.getsize(temp_file_path)} 字节)")
        return temp_file_path, filename
        
    except Exception as e:
        log(f"保存二进制数据失败: {str(e)}")
        raise Exception(f"保存二进制数据失败: {str(e)}")

def cleanup_temp_files(temp_dir):
    """清理临时文件"""
    try:
        if os.path.exists(temp_dir):
            for file in os.listdir(temp_dir):
                file_path = os.path.join(temp_dir, file)
                try:
                    os.remove(file_path)
                    log(f"清理临时文件: {file_path}")
                except:
                    pass
            try:
                os.rmdir(temp_dir)
                log(f"清理临时目录: {temp_dir}")
            except:
                pass
    except Exception as e:
        log(f"清理临时文件失败: {str(e)}")

def send_text_message(text, to_type, to_ids, batch_options=None):
    """发送文本消息"""
    try:
        # 导入wxauto库（需要用户安装）
        try:
            from wxauto import WeChat
        except ImportError:
            return {
                'success': False,
                'error': 'wxauto库未安装，请运行：pip install wxauto',
                'install_guide': 'https://github.com/cluic/wxauto#installation'
            }

        # 初始化微信客户端
        log("正在初始化微信客户端...")
        wx = WeChat()
        
        # wxauto初始化成功即表示微信环境正常，无需额外检测

        results = []
        
        if to_type == 'filehelper':
            # 发送到文件传输助手
            log(f"发送到文件传输助手: {text}")
            wx.ChatWith('文件传输助手')
            wx.SendMsg(text)
            
            results.append({
                'target': '文件传输助手',
                'success': True,
                'message': '发送成功',
                'timestamp': datetime.now().isoformat()
            })
            
        elif to_ids and isinstance(to_ids, list):
            # 批量发送
            for i, target in enumerate(to_ids):
                try:
                    log(f"发送给: {target} ({i+1}/{len(to_ids)})")
                    
                    # 切换到目标联系人或群聊
                    wx.ChatWith(target)
                    wx.SendMsg(text)
                    
                    results.append({
                        'target': target,
                        'success': True,
                        'message': '发送成功',
                        'timestamp': datetime.now().isoformat()
                    })
                    
                    # 发送间隔
                    if batch_options and batch_options.get('sendDelay') and i < len(to_ids) - 1:
                        delay = int(batch_options.get('sendDelay', 3))
                        log(f"等待 {delay} 秒...")
                        time.sleep(delay)
                        
                except Exception as e:
                    log(f"发送给 {target} 失败: {str(e)}")
                    results.append({
                        'target': target,
                        'success': False,
                        'error': str(e),
                        'timestamp': datetime.now().isoformat()
                    })
        
        return {
            'success': True,
            'message': f'发送完成: {len([r for r in results if r["success"]])}/{len(results)}',
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        error_msg = f"微信发送失败: {str(e)}"
        log(error_msg)
        return {
            'success': False,
            'error': error_msg,
            'timestamp': datetime.now().isoformat()
        }

def send_file_message(url, filename, file_data, to_type, to_ids, caption=None):
    """发送文件消息 - 完整实现版本"""
    temp_dir = None
    try:
        # 导入wxauto库
        try:
            from wxauto import WeChat
        except ImportError:
            return {
                'success': False,
                'error': 'wxauto库未安装，请运行：pip install wxauto',
                'install_guide': 'https://github.com/cluic/wxauto#installation'
            }

        log(f"开始文件发送流程: {filename}")
        
        # 创建临时目录
        temp_dir = tempfile.mkdtemp(prefix='wechat_files_')
        log(f"创建临时目录: {temp_dir}")
        
        # 处理文件数据
        local_file_path = None
        actual_filename = filename or "file"
        
        if url and url.strip():
            # 从URL下载文件
            log("检测到URL，开始下载文件...")
            local_file_path, actual_filename = download_file_from_url(url, temp_dir)
            
        elif file_data:
            # 处理二进制数据
            log("检测到二进制数据，开始保存到临时文件...")
            local_file_path, actual_filename = save_binary_data_to_file(file_data, temp_dir, filename)
            
        else:
            raise Exception("没有提供有效的文件数据（URL或二进制数据）")
        
        if not local_file_path or not os.path.exists(local_file_path):
            raise Exception("文件处理失败，无法获取有效的本地文件路径")
        
        # 初始化微信客户端
        log("初始化微信客户端...")
        wx = WeChat()
        
        # 准备发送结果
        results = []
        
        if to_type == 'filehelper':
            # 发送到文件传输助手
            log(f"发送文件到文件传输助手: {actual_filename}")
            wx.ChatWith('文件传输助手')
            wx.SendFiles(local_file_path)
            
            # 如果有说明文字，发送caption
            if caption and caption.strip():
                log(f"发送说明文字: {caption}")
                time.sleep(1)  # 等待文件发送完成
                wx.SendMsg(caption.strip())
            
            results.append({
                'target': '文件传输助手',
                'filename': actual_filename,
                'success': True,
                'message': '文件发送成功' + (f'，附带说明: {caption[:20]}...' if caption and len(caption) > 20 else f'，附带说明: {caption}' if caption else ''),
                'file_size': os.path.getsize(local_file_path),
                'timestamp': datetime.now().isoformat()
            })
            
        elif to_ids and isinstance(to_ids, list):
            # 批量发送文件
            total_targets = len(to_ids)
            log(f"开始批量发送文件到 {total_targets} 个目标")
            
            for i, target in enumerate(to_ids):
                try:
                    log(f"发送文件给: {target} ({i+1}/{total_targets})")
                    
                    # 切换到目标联系人或群聊
                    wx.ChatWith(target)
                    time.sleep(1)  # 等待界面切换
                    
                    # 发送文件
                    wx.SendFiles(local_file_path)
                    
                    # 如果有说明文字，发送caption
                    if caption and caption.strip():
                        log(f"发送说明文字给 {target}: {caption}")
                        time.sleep(1)  # 等待文件发送完成
                        wx.SendMsg(caption.strip())
                    
                    results.append({
                        'target': target,
                        'filename': actual_filename,
                        'success': True,
                        'message': '文件发送成功' + (f'，附带说明: {caption[:20]}...' if caption and len(caption) > 20 else f'，附带说明: {caption}' if caption else ''),
                        'file_size': os.path.getsize(local_file_path),
                        'timestamp': datetime.now().isoformat()
                    })
                    
                    # 发送间隔（除了最后一个）
                    if i < total_targets - 1:
                        delay = 3  # 默认3秒间隔
                        log(f"等待 {delay} 秒后发送下一个...")
                        time.sleep(delay)
                        
                except Exception as e:
                    log(f"发送文件给 {target} 失败: {str(e)}")
                    results.append({
                        'target': target,
                        'filename': actual_filename,
                        'success': False,
                        'error': str(e),
                        'timestamp': datetime.now().isoformat()
                    })
        else:
            raise Exception("未指定有效的发送目标")
        
        # 统计发送结果
        successful = sum(1 for r in results if r.get('success', False))
        total = len(results)
        
        log(f"文件发送完成: {successful}/{total} 成功")
        
        return {
            'success': successful > 0,
            'message': f'文件发送完成: {successful}/{total} 成功',
            'filename': actual_filename,
            'file_size': os.path.getsize(local_file_path) if local_file_path else 0,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        error_msg = f"文件发送失败: {str(e)}"
        log(error_msg)
        return {
            'success': False,
            'error': error_msg,
            'filename': filename or 'unknown',
            'timestamp': datetime.now().isoformat(),
            'suggestion': '请检查文件格式、微信客户端状态和网络连接'
        }
    
    finally:
        # 清理临时文件
        if temp_dir:
            try:
                cleanup_temp_files(temp_dir)
            except Exception as cleanup_error:
                log(f"清理临时文件失败: {str(cleanup_error)}")

def check_wechat_status():
    """检查微信客户端状态"""
    try:
        try:
            from wxauto import WeChat
        except ImportError:
            return {
                'status': 'error',
                'error': 'wxauto库未安装',
                'install_guide': 'pip install wxauto'
            }
        
        wx = WeChat()
        
        # 简单的状态检查
        return {
            'status': 'ready',
            'message': '微信客户端连接正常',
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': f'微信客户端连接失败: {str(e)}',
            'suggestion': '请确保PC微信客户端已启动并已登录',
            'timestamp': datetime.now().isoformat()
        }

def load_data_from_args():
    """从命令行参数或临时文件加载数据"""
    # 检查是否使用临时文件
    if len(sys.argv) >= 4 and sys.argv[2] == '--temp-file':
        temp_file_path = sys.argv[3]
        log(f"从临时文件加载数据: {temp_file_path}")
        try:
            with open(temp_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            # 删除临时文件
            os.remove(temp_file_path)
            log(f"临时文件已清理: {temp_file_path}")
            return data
        except Exception as e:
            log(f"读取临时文件失败: {str(e)}")
            raise Exception(f"读取临时文件失败: {str(e)}")
    else:
        # 传统方式：从命令行参数直接读取
        if len(sys.argv) < 3:
            raise Exception('缺少数据参数')
        return json.loads(sys.argv[2])

def main():
    """主函数 - 处理命令行参数"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': '缺少参数',
            'usage': 'python wechat_automation.py <action> [arguments...]'
        }))
        return

    action = sys.argv[1]
    
    try:
        if action == 'send_text':
            data = load_data_from_args()
            result = send_text_message(
                data.get('text'),
                data.get('toType'),
                data.get('toIds'),
                data.get('batchOptions')
            )
            print(json.dumps(result, ensure_ascii=False))
            
        elif action == 'send_file':
            data = load_data_from_args()
            result = send_file_message(
                data.get('url'),
                data.get('filename'),
                data.get('fileData'),
                data.get('toType'),
                data.get('toIds'),
                data.get('caption')
            )
            print(json.dumps(result, ensure_ascii=False))
            
        elif action == 'check_status':
            result = check_wechat_status()
            print(json.dumps(result, ensure_ascii=False))
            
        else:
            print(json.dumps({
                'error': f'未知操作: {action}',
                'supported': ['send_text', 'send_file', 'check_status']
            }))
            
    except Exception as e:
        print(json.dumps({
            'error': f'执行失败: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }, ensure_ascii=False))

if __name__ == '__main__':
    main()