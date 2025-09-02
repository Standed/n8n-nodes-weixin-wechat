# -*- coding: utf-8 -*-
"""
简化版文件发送测试脚本
避免emoji字符的编码问题
"""

import requests
import json
import base64

API_BASE_URL = "http://localhost:3000"
API_KEY = "test_api_key_12345"

def test_service_health():
    """测试服务健康状态"""
    print("[HEALTH] Testing service health...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("[OK] Service health check passed")
            print(f"  - Service version: {data.get('version')}")
            print(f"  - Python environment: {data.get('python_environment', {}).get('status')}")
            return True
        else:
            print(f"[ERROR] Service health check failed: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to service, please ensure service is running")
        return False
    except Exception as e:
        print(f"[ERROR] Health check exception: {e}")
        return False

def test_binary_file_send():
    """测试二进制文件发送"""
    print("[BINARY] Testing binary file send...")
    
    test_content = """XYS AI WeChat Test Report
Time: 2025-09-02

Test Results:
- API Service: OK
- Binary File Processing: OK  
- File Sending: OK
- WeChat Integration: OK

Conclusion: File sending function works properly!

Website: https://xysaiai.cn/
"""
    
    # 转换为base64
    binary_data = test_content.encode('utf-8')
    base64_data = base64.b64encode(binary_data).decode('utf-8')
    
    payload = {
        "filename": "test_binary_file.txt",
        "fileData": {
            "data": base64_data,
            "fileName": "test_binary_file.txt", 
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
        
        print(f"[HTTP] Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("[OK] Binary file send API call successful")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return result.get('success', False)
        else:
            error_data = response.json() if response.content else {}
            print("[ERROR] Binary file send API call failed")
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
            return False
            
    except Exception as e:
        print(f"[ERROR] Binary file send API test exception: {e}")
        return False

def test_url_file_send():
    """测试URL文件发送"""
    print("[URL] Testing URL file send...")
    
    payload = {
        "url": "https://picsum.photos/300/200",
        "filename": "test_url_image.jpg",
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
        
        print(f"[HTTP] Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("[OK] URL file send API call successful")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return result.get('success', False)
        else:
            error_data = response.json() if response.content else {}
            print("[ERROR] URL file send API call failed")
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
            return False
            
    except Exception as e:
        print(f"[ERROR] URL file send API test exception: {e}")
        return False

def main():
    """主测试函数"""
    print("XYS AI WeChat File Send Test")
    print("=" * 50)
    print(f"API Service URL: {API_BASE_URL}")
    print(f"Test API Key: {API_KEY}")
    print()
    
    # 检查服务状态
    if not test_service_health():
        print("[ERROR] Service not ready, terminating test")
        return False
    
    print()
    
    # 运行测试
    tests = [
        ("Binary File Send", test_binary_file_send),
        ("URL File Send", test_url_file_send),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"[TEST] Starting: {test_name}")
        try:
            success = test_func()
            results.append((test_name, success))
            status = "[PASS]" if success else "[FAIL]"
            print(f"{status} {test_name}")
        except Exception as e:
            print(f"[FAIL] {test_name} test exception: {str(e)}")
            results.append((test_name, False))
        
        print("-" * 40)
    
    # 测试汇总
    print()
    print("=" * 50)
    print("Test Summary:")
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "[PASS]" if success else "[FAIL]"
        print(f"  {status} {test_name}")
        if success:
            passed += 1
    
    print()
    print(f"Test Pass Rate: {passed}/{total} ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("[SUCCESS] All tests passed! File sending function is working properly")
        print()
        print("[READY] Ready to release this update")
        return True
    else:
        print("[WARNING] Some tests failed, further investigation needed")
        return False

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n[RELEASE] Ready to publish: File sending tests passed completely!")
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n[STOP] Test interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n[CRASH] Unexpected error during testing: {e}")
        exit(1)