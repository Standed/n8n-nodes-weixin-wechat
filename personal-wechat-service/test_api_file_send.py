#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
西羊石AI - 个人微信文件发送API测试脚本
用于测试完整的HTTP API接口（模拟N8N调用）

使用方法:
    1. 启动个人微信服务: python index.js 或 双击一键启动.bat
    2. 运行API测试: python test_api_file_send.py
"""

import requests
import json
import base64
import time
from datetime import datetime

API_BASE_URL = "http://localhost:3000"
API_KEY = "test_api_key_12345"  # 测试用API Key

def test_service_health():
    """测试服务健康状态"""
    print("🏥 测试服务健康状态...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 服务健康检查通过")
            print(f"  - 服务版本: {data.get('version')}")
            print(f"  - Python环境: {data.get('python_environment', {}).get('status')}")
            return True
        else:
            print(f"❌ 服务健康检查失败: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到服务，请确保服务已启动")
        print("💡 启动命令: python index.js 或双击一键启动.bat")
        return False
    except Exception as e:
        print(f"❌ 健康检查异常: {e}")
        return False

def test_api_url_file_send():
    """测试API URL文件发送"""
    print("🌐 测试API URL文件发送...")
    
    payload = {
        "service": "personal-wechat",
        "url": "https://picsum.photos/300/200",
        "filename": "api_test_image.jpg",
        "toType": "filehelper"
    }
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/send/file",
            json=payload,
            headers=headers,
            timeout=60
        )
        
        print(f"📡 HTTP状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ URL文件发送API调用成功")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return result.get('success', False)
        else:
            error_data = response.json() if response.content else {}
            print(f"❌ URL文件发送API调用失败")
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
            return False
            
    except Exception as e:
        print(f"❌ URL文件发送API测试异常: {e}")
        return False

def test_api_binary_file_send():
    """测试API二进制文件发送"""
    print("💾 测试API二进制文件发送...")
    
    # 创建测试文件内容
    test_content = f"""西羊石AI微信自动化测试报告
时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

测试项目:
✅ API服务连接
✅ 二进制文件处理
✅ 文件发送功能
✅ 微信客户端集成

结论: 文件发送功能正常工作！

官网: https://xysaiai.cn/
技术支持: 关注公众号"西羊石AI视频"
"""
    
    # 转换为base64
    binary_data = test_content.encode('utf-8')
    base64_data = base64.b64encode(binary_data).decode('utf-8')
    
    payload = {
        "service": "personal-wechat",
        "filename": "api_binary_test.txt",
        "fileData": {
            "data": base64_data,
            "fileName": "api_binary_test.txt",
            "mimeType": "text/plain"
        },
        "toType": "filehelper"
    }
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/send/file",
            json=payload,
            headers=headers,
            timeout=60
        )
        
        print(f"📡 HTTP状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 二进制文件发送API调用成功")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return result.get('success', False)
        else:
            error_data = response.json() if response.content else {}
            print(f"❌ 二进制文件发送API调用失败")
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
            return False
            
    except Exception as e:
        print(f"❌ 二进制文件发送API测试异常: {e}")
        return False

def test_api_key_validation():
    """测试API Key验证"""
    print("🔒 测试API Key验证...")
    
    payload = {
        "service": "personal-wechat",
        "filename": "test.txt",
        "fileData": {"data": "dGVzdA=="},  # "test" in base64
        "toType": "filehelper"
    }
    
    # 测试无API Key的情况
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/send/file",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 401:
            result = response.json()
            print("✅ API Key验证正常工作")
            print(f"  错误信息: {result.get('error')}")
            return True
        else:
            print(f"❌ API Key验证失效: 期望401，得到{response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API Key验证测试异常: {e}")
        return False

def test_error_handling():
    """测试错误处理"""
    print("🛠️ 测试错误处理...")
    
    # 测试无效的文件数据
    payload = {
        "service": "personal-wechat",
        "filename": "invalid_test.txt",
        # 故意不提供url和fileData
        "toType": "filehelper"
    }
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/send/file",
            json=payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 500:
            result = response.json()
            print("✅ 错误处理正常")
            print(f"  错误信息: {result.get('error')}")
            return True
        else:
            print(f"❌ 错误处理异常: 期望500，得到{response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 错误处理测试异常: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 西羊石AI微信文件发送API测试")
    print("=" * 60)
    print(f"🔗 API服务地址: {API_BASE_URL}")
    print(f"🔑 测试API Key: {API_KEY}")
    print()
    
    # 检查服务状态
    if not test_service_health():
        print("❌ 服务未就绪，终止测试")
        return False
    
    print()
    
    # 等待一下确保服务完全启动
    time.sleep(2)
    
    # 运行API测试
    tests = [
        ("API Key验证", test_api_key_validation),
        ("错误处理", test_error_handling),
        ("二进制文件发送API", test_api_binary_file_send),
        ("URL文件发送API", test_api_url_file_send),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"🧪 开始测试: {test_name}")
        try:
            success = test_func()
            results.append((test_name, success))
            status = "✅ 通过" if success else "❌ 失败"
            print(f"📊 {test_name}: {status}")
        except Exception as e:
            print(f"❌ {test_name} 测试异常: {str(e)}")
            results.append((test_name, False))
        
        print("-" * 40)
    
    # 测试汇总
    print()
    print("=" * 60)
    print("📊 API测试汇总:")
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ 通过" if success else "❌ 失败"
        print(f"  {status} {test_name}")
        if success:
            passed += 1
    
    print()
    print(f"🎯 API测试通过率: {passed}/{total} ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 所有API测试通过！文件发送功能完全正常")
        print()
        print("✅ 可以正式发布此功能更新")
        return True
    else:
        print("⚠️ 部分API测试失败，需要进一步检查")
        print()
        print("💡 建议:")
        print("  1. 检查微信客户端是否正常运行和登录")
        print("  2. 确认所有Python依赖已正确安装")
        print("  3. 查看服务日志获取详细错误信息")
        return False

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n🚀 准备发布: 文件发送功能测试完全通过！")
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 API测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 API测试过程中发生未预期的错误: {e}")
        sys.exit(1)