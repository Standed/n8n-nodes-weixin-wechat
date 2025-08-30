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