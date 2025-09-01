#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
西羊石AI - 个人微信文件发送功能测试脚本
用于测试URL和二进制文件发送功能

使用方法:
    python test_file_send.py
"""

import sys
import os
import json
import base64
import requests
import tempfile
from datetime import datetime

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from wechat_automation import send_file_message

def test_url_file_send():
    """测试URL文件发送"""
    print("🔍 测试URL文件发送...")
    
    # 测试图片URL
    test_url = "https://picsum.photos/400/300"
    
    result = send_file_message(
        url=test_url,
        filename="test_image.jpg",
        file_data=None,
        to_type="filehelper",
        to_ids=None
    )
    
    print(f"📊 URL文件发送结果:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return result.get('success', False)

def test_binary_file_send():
    """测试二进制文件发送"""
    print("🔍 测试二进制文件发送...")
    
    # 创建测试文本文件
    test_content = f"""西羊石AI微信自动化测试文件
创建时间: {datetime.now().isoformat()}
测试内容: 这是一个二进制文件发送测试

功能测试:
✅ 文本文件发送
✅ 二进制数据处理
✅ wxauto集成

官网: https://xysaiai.cn/
"""
    
    # 转换为二进制数据
    binary_data = test_content.encode('utf-8')
    base64_data = base64.b64encode(binary_data).decode('utf-8')
    
    # 模拟N8N二进制数据格式
    file_data = {
        'data': base64_data,
        'fileName': 'wechat_test.txt',
        'mimeType': 'text/plain'
    }
    
    result = send_file_message(
        url=None,
        filename="wechat_test.txt",
        file_data=file_data,
        to_type="filehelper",
        to_ids=None
    )
    
    print(f"📊 二进制文件发送结果:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return result.get('success', False)

def test_batch_file_send():
    """测试批量文件发送"""
    print("🔍 测试批量文件发送...")
    
    # 创建简单的测试内容
    test_content = "这是批量发送测试文件"
    binary_data = test_content.encode('utf-8')
    base64_data = base64.b64encode(binary_data).decode('utf-8')
    
    file_data = {
        'data': base64_data,
        'fileName': 'batch_test.txt',
        'mimeType': 'text/plain'
    }
    
    # 只发送到文件传输助手（避免打扰其他联系人）
    result = send_file_message(
        url=None,
        filename="batch_test.txt", 
        file_data=file_data,
        to_type="filehelper",
        to_ids=None
    )
    
    print(f"📊 批量文件发送结果:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return result.get('success', False)

def create_test_image():
    """创建一个简单的测试图片（纯色PNG）"""
    try:
        from PIL import Image
        
        # 创建一个简单的200x200红色图片
        img = Image.new('RGB', (200, 200), color='red')
        
        # 保存到临时文件
        temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        img.save(temp_file.name, 'PNG')
        temp_file.close()
        
        return temp_file.name
        
    except ImportError:
        print("⚠️ PIL/Pillow未安装，跳过图片创建测试")
        return None

def test_local_file_send():
    """测试本地文件发送"""
    print("🔍 测试本地文件发送...")
    
    # 创建测试文件
    test_file_path = None
    try:
        # 创建临时文本文件
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write(f"""西羊石AI本地文件测试
创建时间: {datetime.now().isoformat()}

这是一个本地文件测试，用于验证文件发送功能。

官网: https://xysaiai.cn/
""")
            test_file_path = f.name
        
        # 读取文件并转换为二进制数据
        with open(test_file_path, 'rb') as f:
            binary_data = f.read()
            base64_data = base64.b64encode(binary_data).decode('utf-8')
        
        file_data = {
            'data': base64_data,
            'fileName': 'local_test.txt',
            'mimeType': 'text/plain'
        }
        
        result = send_file_message(
            url=None,
            filename="local_test.txt",
            file_data=file_data,
            to_type="filehelper",
            to_ids=None
        )
        
        print(f"📊 本地文件发送结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return result.get('success', False)
        
    except Exception as e:
        print(f"❌ 本地文件测试失败: {str(e)}")
        return False
    finally:
        # 清理测试文件
        if test_file_path and os.path.exists(test_file_path):
            try:
                os.unlink(test_file_path)
            except:
                pass

def main():
    """主测试函数"""
    print("🚀 西羊石AI微信文件发送功能测试")
    print("=" * 50)
    print()
    
    # 检查微信和wxauto环境
    print("🔧 检查测试环境...")
    try:
        from wxauto import WeChat
        wx = WeChat()
        print("✅ 微信环境检查通过")
    except ImportError:
        print("❌ wxauto库未安装，请运行: pip install wxauto")
        return False
    except Exception as e:
        print(f"❌ 微信环境检查失败: {str(e)}")
        print("请确保微信PC客户端已启动并已登录")
        return False
    
    print()
    
    # 运行测试
    tests = [
        ("二进制文件发送", test_binary_file_send),
        ("本地文件发送", test_local_file_send),
        ("URL文件发送", test_url_file_send),
        ("批量文件发送", test_batch_file_send),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"📋 开始测试: {test_name}")
        try:
            success = test_func()
            results.append((test_name, success))
            status = "✅ 通过" if success else "❌ 失败"
            print(f"📊 {test_name}: {status}")
        except Exception as e:
            print(f"❌ {test_name} 测试异常: {str(e)}")
            results.append((test_name, False))
        
        print()
    
    # 输出测试汇总
    print("=" * 50)
    print("📊 测试汇总:")
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ 通过" if success else "❌ 失败"
        print(f"  {status} {test_name}")
        if success:
            passed += 1
    
    print()
    print(f"🎯 测试通过率: {passed}/{total} ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 所有测试通过！文件发送功能正常工作")
        return True
    else:
        print("⚠️ 部分测试失败，请检查日志和错误信息")
        return False

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 测试过程中发生未预期的错误: {e}")
        sys.exit(1)